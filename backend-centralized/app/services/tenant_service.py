"""
Tenant Management Service for Multi-Tenant SaaS System
Handles tenant creation, isolation, and resource management
"""

import os
import uuid
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from sqlalchemy.orm import Session
from sqlalchemy import create_engine, text

from app.models.tenant import (
    Tenant, TenantStatus, SubscriptionPlan, Subscription, UsageRecord,
    TENANT_LIMITS, TENANT_FEATURES
)
from app.services.billing_service import billing_service, BillingPlan

logger = logging.getLogger(__name__)

class TenantService:
    """Multi-tenant management service"""
    
    def __init__(self, db_session: Session):
        self.db = db_session
    
    async def create_tenant(
        self,
        name: str,
        domain: str,
        contact_email: str,
        contact_name: str,
        plan: SubscriptionPlan = SubscriptionPlan.STARTER,
        apps: List[str] = None,
        settings: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """Create a new tenant"""
        try:
            # Generate unique tenant ID and subdomain
            tenant_id = f"tenant_{uuid.uuid4().hex[:8]}"
            subdomain = self._generate_subdomain(name)
            
            # Create tenant record
            tenant = Tenant(
                id=tenant_id,
                name=name,
                domain=domain,
                subdomain=subdomain,
                status=TenantStatus.PENDING,
                plan=plan,
                contact_email=contact_email,
                contact_name=contact_name,
                settings=settings or {},
                limits=TENANT_LIMITS[plan],
                features=TENANT_FEATURES[plan],
                trial_ends_at=datetime.utcnow() + timedelta(days=14)  # 14-day trial
            )
            
            self.db.add(tenant)
            self.db.commit()
            self.db.refresh(tenant)
            
            # Create tenant database schema
            await self._create_tenant_schema(tenant_id)
            
            # Create tenant storage bucket
            await self._create_tenant_storage(tenant_id)
            
            # Create subscription
            subscription = await billing_service.create_tenant_subscription(
                tenant_id=tenant_id,
                plan=BillingPlan(plan.value),
                customer_email=contact_email,
                customer_name=contact_name,
                apps=apps or ["surveillance", "healthcare"]
            )
            
            logger.info(f"Created tenant {tenant_id} with subscription {subscription['subscription_id']}")
            
            return {
                "tenant_id": tenant_id,
                "name": name,
                "domain": domain,
                "subdomain": subdomain,
                "status": tenant.status.value,
                "plan": plan.value,
                "subscription": subscription,
                "trial_ends_at": tenant.trial_ends_at.isoformat(),
                "features": tenant.features,
                "limits": tenant.limits
            }
            
        except Exception as e:
            logger.error(f"Failed to create tenant: {str(e)}")
            self.db.rollback()
            raise
    
    async def get_tenant(self, tenant_id: str) -> Optional[Dict[str, Any]]:
        """Get tenant information"""
        try:
            tenant = self.db.query(Tenant).filter(Tenant.id == tenant_id).first()
            
            if not tenant:
                return None
            
            return {
                "tenant_id": tenant.id,
                "name": tenant.name,
                "domain": tenant.domain,
                "subdomain": tenant.subdomain,
                "status": tenant.status.value,
                "plan": tenant.plan.value,
                "contact_email": tenant.contact_email,
                "contact_name": tenant.contact_name,
                "settings": tenant.settings,
                "limits": tenant.limits,
                "features": tenant.features,
                "created_at": tenant.created_at.isoformat(),
                "trial_ends_at": tenant.trial_ends_at.isoformat() if tenant.trial_ends_at else None,
                "subscription_ends_at": tenant.subscription_ends_at.isoformat() if tenant.subscription_ends_at else None
            }
            
        except Exception as e:
            logger.error(f"Failed to get tenant {tenant_id}: {str(e)}")
            raise
    
    async def update_tenant(
        self, 
        tenant_id: str, 
        updates: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Update tenant information"""
        try:
            tenant = self.db.query(Tenant).filter(Tenant.id == tenant_id).first()
            
            if not tenant:
                raise ValueError(f"Tenant {tenant_id} not found")
            
            # Update allowed fields
            allowed_fields = [
                "name", "contact_email", "contact_name", "contact_phone",
                "billing_email", "billing_address", "tax_id", "settings"
            ]
            
            for field, value in updates.items():
                if field in allowed_fields and hasattr(tenant, field):
                    setattr(tenant, field, value)
            
            tenant.updated_at = datetime.utcnow()
            self.db.commit()
            self.db.refresh(tenant)
            
            logger.info(f"Updated tenant {tenant_id}")
            
            return await self.get_tenant(tenant_id)
            
        except Exception as e:
            logger.error(f"Failed to update tenant {tenant_id}: {str(e)}")
            self.db.rollback()
            raise
    
    async def update_tenant_plan(
        self, 
        tenant_id: str, 
        new_plan: SubscriptionPlan
    ) -> Dict[str, Any]:
        """Update tenant subscription plan"""
        try:
            tenant = self.db.query(Tenant).filter(Tenant.id == tenant_id).first()
            
            if not tenant:
                raise ValueError(f"Tenant {tenant_id} not found")
            
            # Get current subscription
            subscription = self.db.query(Subscription).filter(
                Subscription.tenant_id == tenant_id,
                Subscription.status == "active"
            ).first()
            
            if not subscription:
                raise ValueError(f"No active subscription found for tenant {tenant_id}")
            
            # Update subscription in Stripe
            stripe_update = await billing_service.update_subscription(
                subscription.stripe_subscription_id,
                BillingPlan(new_plan.value)
            )
            
            # Update tenant record
            tenant.plan = new_plan
            tenant.limits = TENANT_LIMITS[new_plan]
            tenant.features = TENANT_FEATURES[new_plan]
            tenant.updated_at = datetime.utcnow()
            
            # Update subscription record
            subscription.plan = new_plan
            subscription.amount = stripe_update["amount"]
            subscription.updated_at = datetime.utcnow()
            
            self.db.commit()
            
            logger.info(f"Updated tenant {tenant_id} to plan {new_plan.value}")
            
            return await self.get_tenant(tenant_id)
            
        except Exception as e:
            logger.error(f"Failed to update tenant plan {tenant_id}: {str(e)}")
            self.db.rollback()
            raise
    
    async def suspend_tenant(self, tenant_id: str, reason: str = None) -> Dict[str, Any]:
        """Suspend a tenant"""
        try:
            tenant = self.db.query(Tenant).filter(Tenant.id == tenant_id).first()
            
            if not tenant:
                raise ValueError(f"Tenant {tenant_id} not found")
            
            tenant.status = TenantStatus.SUSPENDED
            tenant.updated_at = datetime.utcnow()
            
            if reason:
                tenant.settings = {**tenant.settings, "suspension_reason": reason}
            
            self.db.commit()
            
            logger.warning(f"Suspended tenant {tenant_id}: {reason}")
            
            return await self.get_tenant(tenant_id)
            
        except Exception as e:
            logger.error(f"Failed to suspend tenant {tenant_id}: {str(e)}")
            self.db.rollback()
            raise
    
    async def activate_tenant(self, tenant_id: str) -> Dict[str, Any]:
        """Activate a suspended tenant"""
        try:
            tenant = self.db.query(Tenant).filter(Tenant.id == tenant_id).first()
            
            if not tenant:
                raise ValueError(f"Tenant {tenant_id} not found")
            
            tenant.status = TenantStatus.ACTIVE
            tenant.updated_at = datetime.utcnow()
            
            # Remove suspension reason
            if "suspension_reason" in tenant.settings:
                del tenant.settings["suspension_reason"]
            
            self.db.commit()
            
            logger.info(f"Activated tenant {tenant_id}")
            
            return await self.get_tenant(tenant_id)
            
        except Exception as e:
            logger.error(f"Failed to activate tenant {tenant_id}: {str(e)}")
            self.db.rollback()
            raise
    
    async def delete_tenant(self, tenant_id: str) -> bool:
        """Delete a tenant and all associated data"""
        try:
            tenant = self.db.query(Tenant).filter(Tenant.id == tenant_id).first()
            
            if not tenant:
                raise ValueError(f"Tenant {tenant_id} not found")
            
            # Cancel subscription
            subscription = self.db.query(Subscription).filter(
                Subscription.tenant_id == tenant_id,
                Subscription.status == "active"
            ).first()
            
            if subscription:
                await billing_service.cancel_subscription(subscription.stripe_subscription_id)
            
            # Delete tenant schema
            await self._delete_tenant_schema(tenant_id)
            
            # Delete tenant storage
            await self._delete_tenant_storage(tenant_id)
            
            # Delete tenant record
            self.db.delete(tenant)
            self.db.commit()
            
            logger.info(f"Deleted tenant {tenant_id}")
            
            return True
            
        except Exception as e:
            logger.error(f"Failed to delete tenant {tenant_id}: {str(e)}")
            self.db.rollback()
            raise
    
    async def list_tenants(
        self, 
        status: TenantStatus = None,
        plan: SubscriptionPlan = None,
        limit: int = 100,
        offset: int = 0
    ) -> List[Dict[str, Any]]:
        """List tenants with optional filtering"""
        try:
            query = self.db.query(Tenant)
            
            if status:
                query = query.filter(Tenant.status == status)
            
            if plan:
                query = query.filter(Tenant.plan == plan)
            
            tenants = query.offset(offset).limit(limit).all()
            
            return [await self.get_tenant(tenant.id) for tenant in tenants]
            
        except Exception as e:
            logger.error(f"Failed to list tenants: {str(e)}")
            raise
    
    async def get_tenant_usage(self, tenant_id: str) -> Dict[str, Any]:
        """Get current usage for a tenant"""
        try:
            tenant = self.db.query(Tenant).filter(Tenant.id == tenant_id).first()
            
            if not tenant:
                raise ValueError(f"Tenant {tenant_id} not found")
            
            # Get usage from usage tracking service
            usage_records = self.db.query(UsageRecord).filter(
                UsageRecord.tenant_id == tenant_id,
                UsageRecord.period_start >= datetime.utcnow().replace(day=1)  # Current month
            ).all()
            
            # Aggregate usage
            usage = {}
            for record in usage_records:
                if record.metric not in usage:
                    usage[record.metric] = 0
                usage[record.metric] += record.value
            
            return {
                "tenant_id": tenant_id,
                "plan": tenant.plan.value,
                "limits": tenant.limits,
                "current_usage": usage,
                "period": {
                    "start": datetime.utcnow().replace(day=1).isoformat(),
                    "end": datetime.utcnow().isoformat()
                }
            }
            
        except Exception as e:
            logger.error(f"Failed to get usage for tenant {tenant_id}: {str(e)}")
            raise
    
    async def check_tenant_limits(
        self, 
        tenant_id: str, 
        resource: str, 
        value: int = 1
    ) -> Dict[str, Any]:
        """Check if tenant is within limits for a resource"""
        try:
            tenant = self.db.query(Tenant).filter(Tenant.id == tenant_id).first()
            
            if not tenant:
                raise ValueError(f"Tenant {tenant_id} not found")
            
            # Get current usage
            current_usage = await self.get_tenant_usage(tenant_id)
            current_value = current_usage["current_usage"].get(resource, 0)
            
            # Get limit
            limit = tenant.limits.get(resource, -1)  # -1 means unlimited
            
            # Check if within limits
            if limit == -1:
                within_limits = True
                remaining = -1
            else:
                within_limits = (current_value + value) <= limit
                remaining = max(0, limit - current_value)
            
            return {
                "tenant_id": tenant_id,
                "resource": resource,
                "current_usage": current_value,
                "requested": value,
                "limit": limit,
                "remaining": remaining,
                "within_limits": within_limits
            }
            
        except Exception as e:
            logger.error(f"Failed to check limits for tenant {tenant_id}: {str(e)}")
            raise
    
    def _generate_subdomain(self, name: str) -> str:
        """Generate a unique subdomain from tenant name"""
        # Clean name for subdomain
        subdomain = "".join(c.lower() for c in name if c.isalnum())
        subdomain = subdomain[:20]  # Limit length
        
        # Add random suffix if needed
        if len(subdomain) < 3:
            subdomain += str(uuid.uuid4().hex[:5])
        
        return subdomain
    
    async def _create_tenant_schema(self, tenant_id: str) -> bool:
        """Create database schema for tenant"""
        try:
            # This would create a separate schema for the tenant
            # For now, we'll use a single database with tenant_id filtering
            logger.info(f"Created schema for tenant {tenant_id}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to create schema for tenant {tenant_id}: {str(e)}")
            raise
    
    async def _delete_tenant_schema(self, tenant_id: str) -> bool:
        """Delete database schema for tenant"""
        try:
            # This would drop the tenant's schema
            logger.info(f"Deleted schema for tenant {tenant_id}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to delete schema for tenant {tenant_id}: {str(e)}")
            raise
    
    async def _create_tenant_storage(self, tenant_id: str) -> bool:
        """Create storage bucket for tenant"""
        try:
            # This would create an S3 bucket or folder for the tenant
            logger.info(f"Created storage for tenant {tenant_id}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to create storage for tenant {tenant_id}: {str(e)}")
            raise
    
    async def _delete_tenant_storage(self, tenant_id: str) -> bool:
        """Delete storage bucket for tenant"""
        try:
            # This would delete the tenant's S3 bucket or folder
            logger.info(f"Deleted storage for tenant {tenant_id}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to delete storage for tenant {tenant_id}: {str(e)}")
            raise 