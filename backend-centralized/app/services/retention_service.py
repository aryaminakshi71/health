import asyncio
import logging
from datetime import datetime, timedelta
from typing import List, Dict, Optional
from enum import Enum
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_

from ..models.tenant import Tenant, Subscription
from ..models.recording import Recording
from ..core.database import get_db
from ..services.billing_service import BillingPlan

logger = logging.getLogger(__name__)

class RetentionPolicy(Enum):
    """Retention policies based on subscription plans"""
    STARTER = 30  # 30 days
    PROFESSIONAL = 90  # 90 days
    HEALTHCARE = 365  # 1 year (HIPAA requirement)
    ENTERPRISE = 2555  # 7 years (long-term compliance)

class RecordingType(Enum):
    """Recording types with different retention rules"""
    CONTINUOUS = "continuous"
    MOTION = "motion"
    SCHEDULED = "scheduled"
    EMERGENCY = "emergency"
    COMPLIANCE = "compliance"

class RetentionService:
    """Service for managing recording retention and automatic deletion"""
    
    def __init__(self):
        self.retention_policies = {
            BillingPlan.STARTER: RetentionPolicy.STARTER,
            BillingPlan.PROFESSIONAL: RetentionPolicy.PROFESSIONAL,
            BillingPlan.HEALTHCARE: RetentionPolicy.HEALTHCARE,
            BillingPlan.ENTERPRISE: RetentionPolicy.ENTERPRISE
        }
        
        # Special retention rules for different recording types
        self.type_retention_overrides = {
            RecordingType.EMERGENCY: 2555,  # 7 years for emergency recordings
            RecordingType.COMPLIANCE: 2555,  # 7 years for compliance recordings
            RecordingType.MOTION: None,  # Use plan default
            RecordingType.CONTINUOUS: None,  # Use plan default
            RecordingType.SCHEDULED: None,  # Use plan default
        }
    
    async def get_tenant_retention_days(self, tenant_id: str, db: Session) -> int:
        """Get retention period in days for a tenant based on their subscription"""
        try:
            # Get tenant's current subscription
            subscription = db.query(Subscription).filter(
                Subscription.tenant_id == tenant_id,
                Subscription.status == "active"
            ).first()
            
            if not subscription:
                logger.warning(f"No active subscription found for tenant {tenant_id}")
                return RetentionPolicy.STARTER.value  # Default to starter plan
            
            # Map subscription plan to retention policy
            plan = BillingPlan(subscription.plan)
            retention_days = self.retention_policies[plan].value
            
            logger.info(f"Tenant {tenant_id} retention period: {retention_days} days (plan: {plan.value})")
            return retention_days
            
        except Exception as e:
            logger.error(f"Error getting retention days for tenant {tenant_id}: {str(e)}")
            return RetentionPolicy.STARTER.value
    
    async def get_recordings_for_deletion(self, db: Session, tenant_id: Optional[str] = None) -> List[Recording]:
        """Get recordings that should be deleted based on retention policies"""
        try:
            recordings_to_delete = []
            
            # Get all tenants if no specific tenant provided
            tenants = db.query(Tenant).all()
            if tenant_id:
                tenants = db.query(Tenant).filter(Tenant.id == tenant_id).all()
            
            for tenant in tenants:
                retention_days = await self.get_tenant_retention_days(tenant.id, db)
                cutoff_date = datetime.utcnow() - timedelta(days=retention_days)
                
                # Get recordings older than retention period
                expired_recordings = db.query(Recording).filter(
                    and_(
                        Recording.tenant_id == tenant.id,
                        Recording.created_at < cutoff_date,
                        Recording.deleted_at.is_(None)  # Not already deleted
                    )
                ).all()
                
                for recording in expired_recordings:
                    # Check for special retention overrides
                    if await self._should_retain_recording(recording, retention_days):
                        continue
                    
                    recordings_to_delete.append(recording)
                    logger.info(f"Marking recording {recording.id} for deletion (age: {recording.created_at})")
            
            return recordings_to_delete
            
        except Exception as e:
            logger.error(f"Error getting recordings for deletion: {str(e)}")
            return []
    
    async def _should_retain_recording(self, recording: Recording, plan_retention_days: int) -> bool:
        """Check if a recording should be retained beyond plan retention period"""
        try:
            recording_type = RecordingType(recording.type)
            
            # Check for special retention overrides
            if recording_type in self.type_retention_overrides:
                override_days = self.type_retention_overrides[recording_type]
                if override_days and override_days > plan_retention_days:
                    # Check if recording is within override period
                    override_cutoff = datetime.utcnow() - timedelta(days=override_days)
                    if recording.created_at > override_cutoff:
                        logger.info(f"Retaining {recording.type} recording {recording.id} due to override policy")
                        return True
            
            # Check for manual retention flags
            if recording.retain_until and recording.retain_until > datetime.utcnow():
                logger.info(f"Retaining recording {recording.id} due to manual retention until {recording.retain_until}")
                return True
            
            # Check for legal hold
            if recording.legal_hold:
                logger.info(f"Retaining recording {recording.id} due to legal hold")
                return True
            
            return False
            
        except Exception as e:
            logger.error(f"Error checking retention override for recording {recording.id}: {str(e)}")
            return False
    
    async def delete_expired_recordings(self, db: Session, tenant_id: Optional[str] = None, dry_run: bool = True) -> Dict:
        """Delete expired recordings based on retention policies"""
        try:
            recordings_to_delete = await self.get_recordings_for_deletion(db, tenant_id)
            
            deleted_count = 0
            failed_count = 0
            total_size_freed = 0
            
            for recording in recordings_to_delete:
                try:
                    if not dry_run:
                        # Mark as deleted (soft delete)
                        recording.deleted_at = datetime.utcnow()
                        recording.deletion_reason = "retention_policy"
                        
                        # Delete actual file from storage
                        await self._delete_recording_file(recording)
                        
                        db.commit()
                        logger.info(f"Deleted recording {recording.id} (file: {recording.filename})")
                    else:
                        logger.info(f"Would delete recording {recording.id} (file: {recording.filename})")
                    
                    deleted_count += 1
                    total_size_freed += recording.file_size or 0
                    
                except Exception as e:
                    failed_count += 1
                    logger.error(f"Failed to delete recording {recording.id}: {str(e)}")
                    if not dry_run:
                        db.rollback()
            
            result = {
                "deleted_count": deleted_count,
                "failed_count": failed_count,
                "total_size_freed_mb": round(total_size_freed / (1024 * 1024), 2),
                "dry_run": dry_run
            }
            
            logger.info(f"Retention cleanup completed: {result}")
            return result
            
        except Exception as e:
            logger.error(f"Error in retention cleanup: {str(e)}")
            return {
                "deleted_count": 0,
                "failed_count": len(recordings_to_delete),
                "total_size_freed_mb": 0,
                "error": str(e)
            }
    
    async def _delete_recording_file(self, recording: Recording):
        """Delete the actual recording file from storage"""
        try:
            import os
            import shutil
            
            # Delete from local storage
            if recording.file_path and os.path.exists(recording.file_path):
                os.remove(recording.file_path)
                logger.info(f"Deleted file: {recording.file_path}")
            
            # Delete thumbnail if exists
            if recording.thumbnail_path and os.path.exists(recording.thumbnail_path):
                os.remove(recording.thumbnail_path)
                logger.info(f"Deleted thumbnail: {recording.thumbnail_path}")
            
            # TODO: Add cloud storage deletion (AWS S3, etc.)
            # if recording.cloud_url:
            #     await self._delete_from_cloud_storage(recording.cloud_url)
            
        except Exception as e:
            logger.error(f"Error deleting recording file for {recording.id}: {str(e)}")
            raise
    
    async def set_manual_retention(self, recording_id: str, retain_until: datetime, db: Session) -> bool:
        """Set manual retention period for a specific recording"""
        try:
            recording = db.query(Recording).filter(Recording.id == recording_id).first()
            if not recording:
                logger.error(f"Recording {recording_id} not found")
                return False
            
            recording.retain_until = retain_until
            recording.retention_override_reason = "manual_admin_override"
            db.commit()
            
            logger.info(f"Set manual retention for recording {recording_id} until {retain_until}")
            return True
            
        except Exception as e:
            logger.error(f"Error setting manual retention for recording {recording_id}: {str(e)}")
            db.rollback()
            return False
    
    async def set_legal_hold(self, recording_id: str, legal_hold: bool, db: Session) -> bool:
        """Set legal hold on a recording to prevent deletion"""
        try:
            recording = db.query(Recording).filter(Recording.id == recording_id).first()
            if not recording:
                logger.error(f"Recording {recording_id} not found")
                return False
            
            recording.legal_hold = legal_hold
            if legal_hold:
                recording.legal_hold_date = datetime.utcnow()
            
            db.commit()
            
            logger.info(f"Set legal hold for recording {recording_id}: {legal_hold}")
            return True
            
        except Exception as e:
            logger.error(f"Error setting legal hold for recording {recording_id}: {str(e)}")
            db.rollback()
            return False
    
    async def get_retention_stats(self, db: Session, tenant_id: Optional[str] = None) -> Dict:
        """Get retention statistics for tenants"""
        try:
            stats = {
                "total_recordings": 0,
                "expired_recordings": 0,
                "storage_used_mb": 0,
                "storage_freed_mb": 0,
                "retention_policies": {}
            }
            
            # Get all tenants if no specific tenant provided
            tenants = db.query(Tenant).all()
            if tenant_id:
                tenants = db.query(Tenant).filter(Tenant.id == tenant_id).all()
            
            for tenant in tenants:
                retention_days = await self.get_tenant_retention_days(tenant.id, db)
                cutoff_date = datetime.utcnow() - timedelta(days=retention_days)
                
                # Get recording stats for this tenant
                tenant_recordings = db.query(Recording).filter(
                    and_(
                        Recording.tenant_id == tenant.id,
                        Recording.deleted_at.is_(None)
                    )
                ).all()
                
                expired_recordings = [r for r in tenant_recordings if r.created_at < cutoff_date]
                
                total_size = sum(r.file_size or 0 for r in tenant_recordings)
                expired_size = sum(r.file_size or 0 for r in expired_recordings)
                
                stats["total_recordings"] += len(tenant_recordings)
                stats["expired_recordings"] += len(expired_recordings)
                stats["storage_used_mb"] += total_size / (1024 * 1024)
                stats["storage_freed_mb"] += expired_size / (1024 * 1024)
                
                stats["retention_policies"][tenant.id] = {
                    "retention_days": retention_days,
                    "recordings_count": len(tenant_recordings),
                    "expired_count": len(expired_recordings),
                    "storage_mb": round(total_size / (1024 * 1024), 2)
                }
            
            stats["storage_used_mb"] = round(stats["storage_used_mb"], 2)
            stats["storage_freed_mb"] = round(stats["storage_freed_mb"], 2)
            
            return stats
            
        except Exception as e:
            logger.error(f"Error getting retention stats: {str(e)}")
            return {}

# Global retention service instance
retention_service = RetentionService() 