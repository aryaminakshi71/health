"""
Retention Management API
Handles automatic recording deletion based on subscription plans and admin policies
"""

from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks, Query
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import logging
from sqlalchemy.orm import Session
from pydantic import BaseModel

from ...services.retention_service import retention_service
from ...core.database import get_db
from ...core.security import get_current_user_dev_optional
from ...models.recording import Recording, RetentionPolicy, LegalHold
from ...models.tenant import Tenant

class ManualRetentionRequest(BaseModel):
    retain_until: datetime
    reason: str

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("/stats")
async def get_retention_stats(
    tenant_id: Optional[str] = Query(None, description="Specific tenant ID"),
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user_dev_optional)
):
    """Get retention statistics for all tenants or a specific tenant"""
    try:
        stats = await retention_service.get_retention_stats(db, tenant_id)
        return {
            "success": True,
            "data": stats,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Error getting retention stats: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error getting retention stats: {str(e)}")

@router.get("/expired")
async def get_expired_recordings(
    tenant_id: Optional[str] = Query(None, description="Specific tenant ID"),
    dry_run: bool = Query(True, description="Show what would be deleted without actually deleting"),
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user_dev_optional)
):
    """Get recordings that would be deleted based on retention policies"""
    try:
        recordings = await retention_service.get_recordings_for_deletion(db, tenant_id)
        
        result = {
            "expired_recordings": len(recordings),
            "recordings": [
                {
                    "id": r.id,
                    "filename": r.filename,
                    "created_at": r.created_at.isoformat(),
                    "age_days": r.age_days,
                    "file_size_mb": r.file_size_mb,
                    "type": r.type.value,
                    "tenant_id": r.tenant_id,
                    "camera_id": r.camera_id
                }
                for r in recordings
            ],
            "dry_run": dry_run
        }
        
        return {
            "success": True,
            "data": result,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Error getting expired recordings: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error getting expired recordings: {str(e)}")

@router.post("/cleanup")
async def cleanup_expired_recordings(
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user_dev_optional),
    tenant_id: Optional[str] = Query(None, description="Specific tenant ID"),
    dry_run: bool = Query(True, description="Run in dry-run mode (default: True)")
):
    """Delete expired recordings based on retention policies"""
    try:
        # Run cleanup in background
        background_tasks.add_task(
            retention_service.delete_expired_recordings,
            db,
            tenant_id,
            dry_run
        )
        
        return {
            "success": True,
            "message": f"Retention cleanup started (dry_run: {dry_run})",
            "tenant_id": tenant_id,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Error starting retention cleanup: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error starting retention cleanup: {str(e)}")

@router.post("/manual-retention/{recording_id}")
async def set_manual_retention(
    recording_id: str,
    request: ManualRetentionRequest,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user_dev_optional)
):
    """Set manual retention period for a specific recording"""
    try:
        success = await retention_service.set_manual_retention(recording_id, request.retain_until, db)
        
        if success:
            return {
                "success": True,
                "message": f"Manual retention set for recording {recording_id} until {request.retain_until}",
                "recording_id": recording_id,
                "retain_until": request.retain_until.isoformat(),
                "reason": request.reason,
                "timestamp": datetime.utcnow().isoformat()
            }
        else:
            raise HTTPException(status_code=404, detail="Recording not found")
            
    except Exception as e:
        logger.error(f"Error setting manual retention: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error setting manual retention: {str(e)}")

@router.post("/legal-hold/{recording_id}")
async def set_legal_hold(
    recording_id: str,
    legal_hold: bool,
    case_number: Optional[str] = Query(None, description="Legal case number"),
    case_name: Optional[str] = Query(None, description="Legal case name"),
    description: Optional[str] = Query(None, description="Legal hold description"),
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user_dev_optional)
):
    """Set legal hold on a recording to prevent deletion"""
    try:
        success = await retention_service.set_legal_hold(recording_id, legal_hold, db)
        
        if success:
            # Create legal hold record if setting hold
            if legal_hold:
                legal_hold_record = LegalHold(
                    id=f"lh_{recording_id}_{datetime.utcnow().timestamp()}",
                    recording_id=recording_id,
                    tenant_id="current_tenant",  # Get from recording
                    case_number=case_number,
                    case_name=case_name,
                    description=description,
                    hold_start_date=datetime.utcnow(),
                    created_by=current_user
                )
                db.add(legal_hold_record)
                db.commit()
            
            return {
                "success": True,
                "message": f"Legal hold {'set' if legal_hold else 'removed'} for recording {recording_id}",
                "recording_id": recording_id,
                "legal_hold": legal_hold,
                "timestamp": datetime.utcnow().isoformat()
            }
        else:
            raise HTTPException(status_code=404, detail="Recording not found")
            
    except Exception as e:
        logger.error(f"Error setting legal hold: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error setting legal hold: {str(e)}")

@router.get("/policies")
async def get_retention_policies(
    tenant_id: Optional[str] = Query(None, description="Specific tenant ID"),
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user_dev_optional)
):
    """Get retention policies for tenants"""
    try:
        policies = db.query(RetentionPolicy).all()
        if tenant_id:
            policies = db.query(RetentionPolicy).filter(RetentionPolicy.tenant_id == tenant_id).all()
        
        result = [
            {
                "id": p.id,
                "tenant_id": p.tenant_id,
                "recording_type": p.recording_type.value,
                "retention_days": p.retention_days,
                "policy_name": p.policy_name,
                "description": p.description,
                "is_active": p.is_active,
                "auto_delete": p.auto_delete,
                "compliance_required": p.compliance_required,
                "compliance_standard": p.compliance_standard
            }
            for p in policies
        ]
        
        return {
            "success": True,
            "data": result,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Error getting retention policies: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error getting retention policies: {str(e)}")

@router.post("/policies")
async def create_retention_policy(
    tenant_id: str,
    recording_type: str,
    retention_days: int,
    policy_name: str,
    description: Optional[str] = None,
    auto_delete: bool = True,
    compliance_required: bool = False,
    compliance_standard: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user_dev_optional)
):
    """Create a new retention policy"""
    try:
        policy = RetentionPolicy(
            id=f"rp_{tenant_id}_{recording_type}_{datetime.utcnow().timestamp()}",
            tenant_id=tenant_id,
            recording_type=recording_type,
            retention_days=retention_days,
            policy_name=policy_name,
            description=description,
            auto_delete=auto_delete,
            compliance_required=compliance_required,
            compliance_standard=compliance_standard
        )
        
        db.add(policy)
        db.commit()
        
        return {
            "success": True,
            "message": f"Retention policy created for {recording_type} recordings",
            "policy_id": policy.id,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Error creating retention policy: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error creating retention policy: {str(e)}")

@router.get("/legal-holds")
async def get_legal_holds(
    tenant_id: Optional[str] = Query(None, description="Specific tenant ID"),
    active_only: bool = Query(True, description="Show only active legal holds"),
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user_dev_optional)
):
    """Get legal holds for recordings"""
    try:
        query = db.query(LegalHold)
        if tenant_id:
            query = query.filter(LegalHold.tenant_id == tenant_id)
        if active_only:
            query = query.filter(LegalHold.is_active == True)
        
        legal_holds = query.all()
        
        result = [
            {
                "id": lh.id,
                "recording_id": lh.recording_id,
                "tenant_id": lh.tenant_id,
                "case_number": lh.case_number,
                "case_name": lh.case_name,
                "description": lh.description,
                "hold_start_date": lh.hold_start_date.isoformat(),
                "hold_end_date": lh.hold_end_date.isoformat() if lh.hold_end_date else None,
                "is_active": lh.is_active,
                "attorney_name": lh.attorney_name,
                "attorney_email": lh.attorney_email,
                "created_by": lh.created_by,
                "created_at": lh.created_at.isoformat()
            }
            for lh in legal_holds
        ]
        
        return {
            "success": True,
            "data": result,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Error getting legal holds: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error getting legal holds: {str(e)}")

@router.get("/subscription-retention/{tenant_id}")
async def get_subscription_retention(
    tenant_id: str,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user_dev_optional)
):
    """Get retention period for a tenant based on their subscription"""
    try:
        retention_days = await retention_service.get_tenant_retention_days(tenant_id, db)
        
        return {
            "success": True,
            "data": {
                "tenant_id": tenant_id,
                "retention_days": retention_days,
                "retention_policy": {
                    "starter": 30,
                    "professional": 90,
                    "healthcare": 365,
                    "enterprise": 2555
                }
            },
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Error getting subscription retention: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error getting subscription retention: {str(e)}") 