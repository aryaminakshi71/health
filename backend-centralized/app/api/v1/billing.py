"""
Billing API Router
Handles billing endpoints for subscription management, plans, and invoices
"""

from fastapi import APIRouter, HTTPException, Depends, Request, BackgroundTasks
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import logging
import json
import os
from pydantic import BaseModel
from ...services.billing_service import UnifiedBillingService, BillingPlan
from ...core.security import get_current_user_dev_optional
from ...models.tenant import Subscription, BillingRecord, Invoice

logger = logging.getLogger(__name__)
router = APIRouter()

# Initialize billing service
billing_service = UnifiedBillingService()

# Stripe integration
try:
    import stripe
    stripe.api_key = os.getenv("STRIPE_SECRET_KEY", "")
except Exception:
    stripe = None

# Pydantic models
class CreateSubscriptionRequest(BaseModel):
    tenant_id: str
    plan: BillingPlan
    customer_email: str
    customer_name: str
    apps: List[str] = None

# Stripe endpoints
@router.post("/checkout")
async def create_checkout_session(payload: Dict[str, Any]):
    """Create Stripe checkout session"""
    if stripe is None or not stripe.api_key:
        raise HTTPException(status_code=500, detail="Stripe not configured")
    price_id = payload.get("price_id")
    if not price_id:
        raise HTTPException(status_code=400, detail="price_id required")
    session = stripe.checkout.Session.create(
        mode="subscription",
        line_items=[{"price": price_id, "quantity": 1}],
        success_url=payload.get("success_url") or "http://localhost:3000/dashboard?billing=success",
        cancel_url=payload.get("cancel_url") or "http://localhost:3000/dashboard?billing=cancel",
    )
    return {"id": session.id, "url": session.url}

@router.post("/portal")
async def create_billing_portal(payload: Dict[str, Any]):
    """Create Stripe billing portal session"""
    if stripe is None or not stripe.api_key:
        raise HTTPException(status_code=500, detail="Stripe not configured")
    customer_id = payload.get("customer_id")
    if not customer_id:
        raise HTTPException(status_code=400, detail="customer_id required")
    portal = stripe.billing_portal.Session.create(
        customer=customer_id,
        return_url=payload.get("return_url") or "http://localhost:3000/dashboard"
    )
    return {"url": portal.url}

# Billing management endpoints
@router.get("/plans")
async def get_billing_plans():
    """Get all available billing plans"""
    try:
        plans = []
        for plan in BillingPlan:
            plan_config = billing_service.get_plan_features(plan)
            plan_limits = billing_service.get_plan_limits(plan)
            plans.append({
                "id": plan.value,
                "name": plan.value.title(),
                "price": billing_service.plans[plan].amount,
                "currency": billing_service.plans[plan].currency,
                "billing_cycle": billing_service.plans[plan].billing_cycle.value,
                "features": plan_config,
                "limits": plan_limits
            })
        
        return {
            "success": True,
            "data": plans,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Error fetching billing plans: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching billing plans: {str(e)}")

@router.post("/subscriptions")
async def create_subscription(
    request: CreateSubscriptionRequest,
    current_user: str = Depends(get_current_user_dev_optional)
):
    """Create a new subscription"""
    try:
        # For testing without Stripe API key
        subscription = {
            "subscription_id": f"sub_test_{request.tenant_id}",
            "customer_id": f"cus_test_{request.tenant_id}",
            "plan": request.plan.value,
            "amount": billing_service.plans[request.plan].amount,
            "currency": billing_service.plans[request.plan].currency,
            "status": "active",
            "current_period_start": datetime.utcnow().isoformat(),
            "current_period_end": (datetime.utcnow() + timedelta(days=30)).isoformat(),
            "features": billing_service.get_plan_features(request.plan),
            "apps": request.apps or ["surveillance", "healthcare"]
        }
        
        return {
            "success": True,
            "data": subscription,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Error creating subscription: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error creating subscription: {str(e)}")

@router.get("/subscriptions/{subscription_id}")
async def get_subscription(
    subscription_id: str,
    current_user: str = Depends(get_current_user_dev_optional)
):
    """Get subscription details"""
    try:
        # This would typically fetch from database
        # For now, return mock data
        subscription = {
            "id": subscription_id,
            "status": "active",
            "plan": "professional",
            "amount": 99.00,
            "currency": "USD",
            "current_period_start": datetime.utcnow().isoformat(),
            "current_period_end": (datetime.utcnow() + timedelta(days=30)).isoformat()
        }
        
        return {
            "success": True,
            "data": subscription,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Error fetching subscription: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching subscription: {str(e)}")

@router.post("/subscriptions/{subscription_id}/cancel")
async def cancel_subscription(
    subscription_id: str,
    current_user: str = Depends(get_current_user_dev_optional)
):
    """Cancel a subscription"""
    try:
        result = await billing_service.cancel_subscription(subscription_id)
        
        return {
            "success": True,
            "data": result,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Error cancelling subscription: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error cancelling subscription: {str(e)}")

@router.get("/invoices")
async def get_invoices(
    tenant_id: Optional[str] = None,
    current_user: str = Depends(get_current_user_dev_optional)
):
    """Get invoices for a tenant"""
    try:
        # Mock invoice data
        invoices = [
            {
                "id": "inv_001",
                "tenant_id": tenant_id or "default",
                "subscription_id": "sub_001",
                "amount": 99.00,
                "currency": "USD",
                "status": "paid",
                "created_at": datetime.utcnow().isoformat(),
                "due_date": datetime.utcnow().isoformat()
            }
        ]
        
        return {
            "success": True,
            "data": invoices,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Error fetching invoices: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching invoices: {str(e)}")

@router.get("/dashboard")
async def get_billing_dashboard(
    current_user: str = Depends(get_current_user_dev_optional)
):
    """Get billing dashboard data"""
    try:
        # Mock billing dashboard data
        dashboard_data = {
            "current_plan": {
                "id": "professional",
                "name": "Professional Plan",
                "price": 99.00,
                "currency": "USD",
                "billing_cycle": "monthly",
                "status": "active",
                "next_billing_date": (datetime.utcnow() + timedelta(days=15)).isoformat()
            },
            "usage": {
                "cameras_used": 8,
                "cameras_limit": 10,
                "storage_used_gb": 45.2,
                "storage_limit_gb": 100,
                "api_calls_used": 1250,
                "api_calls_limit": 2000
            },
            "billing_summary": {
                "current_month_charges": 99.00,
                "last_month_charges": 99.00,
                "total_charges_ytd": 1188.00,
                "outstanding_balance": 0.00
            },
            "recent_invoices": [
                {
                    "id": "inv_001",
                    "number": "INV-2024-001",
                    "amount": 99.00,
                    "currency": "USD",
                    "status": "paid",
                    "due_date": "2024-01-15",
                    "paid_date": "2024-01-14"
                },
                {
                    "id": "inv_002", 
                    "number": "INV-2024-002",
                    "amount": 99.00,
                    "currency": "USD",
                    "status": "pending",
                    "due_date": "2024-02-15",
                    "paid_date": None
                }
            ],
            "payment_methods": [
                {
                    "id": "pm_001",
                    "type": "card",
                    "last4": "4242",
                    "brand": "visa",
                    "exp_month": 12,
                    "exp_year": 2025,
                    "is_default": True
                }
            ]
        }
        
        return {
            "success": True,
            "data": dashboard_data,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Error fetching billing dashboard: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching dashboard: {str(e)}")

@router.post("/webhooks/stripe")
async def stripe_webhook(
    request: Request,
    background_tasks: BackgroundTasks
):
    """Handle Stripe webhooks"""
    try:
        # Get the raw body
        body = await request.body()
        
        # Parse JSON body
        try:
            event_data = json.loads(body)
        except json.JSONDecodeError:
            event_data = {"type": "test", "data": {"object": {"id": "test"}}}
        
        # Process webhook in background
        background_tasks.add_task(billing_service.process_webhook, event_data)
        
        return {
            "success": True,
            "message": "Webhook received and processing",
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Error processing webhook: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing webhook: {str(e)}") 