"""
Tenant Management API Endpoints
Handles multi-tenant operations, billing, and usage tracking
"""

from fastapi import APIRouter, Depends, HTTPException, Header, Query
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from datetime import datetime

from app.core.database import get_db
from app.services.tenant_service import TenantService
from app.services.billing_service import billing_service, BillingPlan
from app.models.tenant import TenantStatus, SubscriptionPlan
from app.schemas.tenant import (
    TenantCreate, TenantUpdate, TenantResponse, 
    SubscriptionCreate, BillingResponse, UsageResponse
)

router = APIRouter()

def get_tenant_service(db: Session = Depends(get_db)) -> TenantService:
    """Get tenant service instance"""
    return TenantService(db)

@router.post("/", response_model=TenantResponse)
async def create_tenant(
    tenant_data: TenantCreate,
    tenant_service: TenantService = Depends(get_tenant_service)
):
    """Create a new tenant"""
    try:
        tenant = await tenant_service.create_tenant(
            name=tenant_data.name,
            domain=tenant_data.domain,
            contact_email=tenant_data.contact_email,
            contact_name=tenant_data.contact_name,
            plan=tenant_data.plan,
            apps=tenant_data.apps,
            settings=tenant_data.settings
        )
        return tenant
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{tenant_id}", response_model=TenantResponse)
async def get_tenant(
    tenant_id: str,
    tenant_service: TenantService = Depends(get_tenant_service)
):
    """Get tenant information"""
    try:
        tenant = await tenant_service.get_tenant(tenant_id)
        if not tenant:
            raise HTTPException(status_code=404, detail="Tenant not found")
        return tenant
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/{tenant_id}", response_model=TenantResponse)
async def update_tenant(
    tenant_id: str,
    updates: TenantUpdate,
    tenant_service: TenantService = Depends(get_tenant_service)
):
    """Update tenant information"""
    try:
        tenant = await tenant_service.update_tenant(tenant_id, updates.dict(exclude_unset=True))
        return tenant
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{tenant_id}")
async def delete_tenant(
    tenant_id: str,
    tenant_service: TenantService = Depends(get_tenant_service)
):
    """Delete a tenant"""
    try:
        success = await tenant_service.delete_tenant(tenant_id)
        return {"message": "Tenant deleted successfully"}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/", response_model=List[TenantResponse])
async def list_tenants(
    status: Optional[TenantStatus] = Query(None),
    plan: Optional[SubscriptionPlan] = Query(None),
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    tenant_service: TenantService = Depends(get_tenant_service)
):
    """List tenants with optional filtering"""
    try:
        tenants = await tenant_service.list_tenants(
            status=status,
            plan=plan,
            limit=limit,
            offset=offset
        )
        return tenants
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{tenant_id}/subscriptions", response_model=BillingResponse)
async def create_subscription(
    tenant_id: str,
    subscription_data: SubscriptionCreate,
    tenant_service: TenantService = Depends(get_tenant_service)
):
    """Create a subscription for a tenant"""
    try:
        tenant = await tenant_service.get_tenant(tenant_id)
        if not tenant:
            raise HTTPException(status_code=404, detail="Tenant not found")
        
        subscription = await billing_service.create_tenant_subscription(
            tenant_id=tenant_id,
            plan=BillingPlan(subscription_data.plan.value),
            customer_email=tenant["contact_email"],
            customer_name=tenant["contact_name"],
            apps=subscription_data.apps
        )
        
        return {
            "tenant_id": tenant_id,
            "subscription": subscription,
            "status": "created"
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/{tenant_id}/subscriptions/{subscription_id}")
async def update_subscription(
    tenant_id: str,
    subscription_id: str,
    new_plan: SubscriptionPlan,
    tenant_service: TenantService = Depends(get_tenant_service)
):
    """Update tenant subscription plan"""
    try:
        tenant = await tenant_service.update_tenant_plan(tenant_id, new_plan)
        return {
            "tenant_id": tenant_id,
            "subscription_id": subscription_id,
            "new_plan": new_plan.value,
            "status": "updated"
        }
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{tenant_id}/subscriptions/{subscription_id}")
async def cancel_subscription(
    tenant_id: str,
    subscription_id: str,
    tenant_service: TenantService = Depends(get_tenant_service)
):
    """Cancel a subscription"""
    try:
        result = await billing_service.cancel_subscription(subscription_id)
        return {
            "tenant_id": tenant_id,
            "subscription_id": subscription_id,
            "status": "cancelled",
            "cancel_at": result.get("cancel_at")
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{tenant_id}/usage", response_model=UsageResponse)
async def get_tenant_usage(
    tenant_id: str,
    tenant_service: TenantService = Depends(get_tenant_service)
):
    """Get current usage for a tenant"""
    try:
        usage = await tenant_service.get_tenant_usage(tenant_id)
        return usage
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{tenant_id}/usage/check")
async def check_tenant_limits(
    tenant_id: str,
    resource: str,
    value: int = 1,
    tenant_service: TenantService = Depends(get_tenant_service)
):
    """Check if tenant is within limits for a resource"""
    try:
        limits_check = await tenant_service.check_tenant_limits(tenant_id, resource, value)
        return limits_check
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{tenant_id}/suspend")
async def suspend_tenant(
    tenant_id: str,
    reason: str = None,
    tenant_service: TenantService = Depends(get_tenant_service)
):
    """Suspend a tenant"""
    try:
        tenant = await tenant_service.suspend_tenant(tenant_id, reason)
        return {
            "tenant_id": tenant_id,
            "status": "suspended",
            "reason": reason
        }
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{tenant_id}/activate")
async def activate_tenant(
    tenant_id: str,
    tenant_service: TenantService = Depends(get_tenant_service)
):
    """Activate a suspended tenant"""
    try:
        tenant = await tenant_service.activate_tenant(tenant_id)
        return {
            "tenant_id": tenant_id,
            "status": "activated"
        }
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{tenant_id}/billing/invoices")
async def get_tenant_invoices(
    tenant_id: str,
    limit: int = Query(10, ge=1, le=100),
    offset: int = Query(0, ge=0)
):
    """Get billing invoices for a tenant"""
    try:
        # This would fetch invoices from the billing service
        # For now, return mock data
        invoices = [
            {
                "invoice_id": f"inv_{i}",
                "number": f"INV-{tenant_id}-{i:04d}",
                "amount": 99.00,
                "currency": "USD",
                "status": "paid",
                "due_date": datetime.now().isoformat(),
                "paid_at": datetime.now().isoformat()
            }
            for i in range(1, min(limit + 1, 6))
        ]
        
        return {
            "tenant_id": tenant_id,
            "invoices": invoices,
            "total": len(invoices)
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{tenant_id}/billing/webhook")
async def handle_billing_webhook(
    tenant_id: str,
    webhook_data: Dict[str, Any]
):
    """Handle billing webhooks from Stripe"""
    try:
        result = await billing_service.process_webhook(webhook_data)
        return {
            "tenant_id": tenant_id,
            "webhook_processed": True,
            "result": result
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/plans/features")
async def get_plan_features():
    """Get features for all plans"""
    try:
        features = {}
        for plan in BillingPlan:
            features[plan.value] = billing_service.get_plan_features(plan)
        
        return {
            "plans": features
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/plans/{plan_name}/features")
async def get_plan_features_by_name(plan_name: str):
    """Get features for a specific plan"""
    try:
        plan = BillingPlan(plan_name)
        features = billing_service.get_plan_features(plan)
        
        return {
            "plan": plan_name,
            "features": features
        }
    except ValueError:
        raise HTTPException(status_code=404, detail="Plan not found")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/analytics/overview")
async def get_analytics_overview(
    tenant_service: TenantService = Depends(get_tenant_service)
):
    """Get analytics overview for all tenants"""
    try:
        # Get all tenants
        tenants = await tenant_service.list_tenants(limit=1000)
        
        # Calculate analytics
        total_tenants = len(tenants)
        active_tenants = len([t for t in tenants if t["status"] == "active"])
        suspended_tenants = len([t for t in tenants if t["status"] == "suspended"])
        
        # Plan distribution
        plan_distribution = {}
        for tenant in tenants:
            plan = tenant["plan"]
            plan_distribution[plan] = plan_distribution.get(plan, 0) + 1
        
        # Revenue calculation (mock)
        revenue_by_plan = {
            "starter": plan_distribution.get("starter", 0) * 29,
            "professional": plan_distribution.get("professional", 0) * 99,
            "healthcare": plan_distribution.get("healthcare", 0) * 199,
            "enterprise": plan_distribution.get("enterprise", 0) * 299
        }
        
        total_revenue = sum(revenue_by_plan.values())
        
        return {
            "total_tenants": total_tenants,
            "active_tenants": active_tenants,
            "suspended_tenants": suspended_tenants,
            "plan_distribution": plan_distribution,
            "revenue_by_plan": revenue_by_plan,
            "total_monthly_revenue": total_revenue,
            "conversion_rate": (active_tenants / total_tenants * 100) if total_tenants > 0 else 0
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e)) 