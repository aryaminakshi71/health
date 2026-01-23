"""
Unified Billing Service for Multi-Tenant SaaS System
Handles billing for all applications (Surveillance, Healthcare, etc.)
"""

import os
import logging
import stripe
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from dataclasses import dataclass
from enum import Enum

# Configure Stripe
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
stripe.api_version = "2023-10-16"

logger = logging.getLogger(__name__)

class BillingPlan(str, Enum):
    STARTER = "starter"
    PROFESSIONAL = "professional"
    HEALTHCARE = "healthcare"
    ENTERPRISE = "enterprise"

class BillingCycle(str, Enum):
    MONTHLY = "monthly"
    YEARLY = "yearly"

@dataclass
class BillingConfig:
    """Billing configuration for plans"""
    plan_id: str
    stripe_price_id: str
    amount: float
    currency: str = "USD"
    billing_cycle: BillingCycle = BillingCycle.MONTHLY
    features: Dict[str, Any] = None
    limits: Dict[str, Any] = None

class UnifiedBillingService:
    """Unified billing service for all applications"""
    
    def __init__(self):
        self.plans = {
            BillingPlan.STARTER: BillingConfig(
                plan_id="starter",
                stripe_price_id=os.getenv("STRIPE_STARTER_PRICE_ID", "price_starter"),
                amount=29.00,
                features={
                    "surveillance": {"cameras": 5, "storage_gb": 100, "retention_days": 30},
                    "healthcare": {"patients": 10, "telesitting": False},
                    "alerts": ["email"],
                    "mobile_app": True,
                    "api_access": False
                }
            ),
            BillingPlan.PROFESSIONAL: BillingConfig(
                plan_id="professional",
                stripe_price_id=os.getenv("STRIPE_PROFESSIONAL_PRICE_ID", "price_professional"),
                amount=99.00,
                features={
                    "surveillance": {"cameras": 25, "storage_gb": 500, "retention_days": 90},
                    "healthcare": {"patients": 50, "telesitting": True},
                    "alerts": ["email", "sms", "whatsapp", "push"],
                    "mobile_app": True,
                    "api_access": True,
                    "custom_branding": True
                }
            ),
            BillingPlan.HEALTHCARE: BillingConfig(
                plan_id="healthcare",
                stripe_price_id=os.getenv("STRIPE_HEALTHCARE_PRICE_ID", "price_healthcare"),
                amount=199.00,
                features={
                    "surveillance": {"cameras": 50, "storage_gb": 1000, "retention_days": 365},
                    "healthcare": {"patients": 200, "telesitting": True, "hipaa_compliance": True},
                    "alerts": ["email", "sms", "whatsapp", "push", "phone"],
                    "mobile_app": True,
                    "api_access": True,
                    "custom_branding": True,
                    "compliance_reporting": True
                }
            ),
            BillingPlan.ENTERPRISE: BillingConfig(
                plan_id="enterprise",
                stripe_price_id=os.getenv("STRIPE_ENTERPRISE_PRICE_ID", "price_enterprise"),
                amount=299.00,
                features={
                    "surveillance": {"cameras": -1, "storage_gb": -1, "retention_days": -1},
                    "healthcare": {"patients": -1, "telesitting": True, "hipaa_compliance": True},
                    "alerts": ["email", "sms", "whatsapp", "push", "phone"],
                    "mobile_app": True,
                    "api_access": True,
                    "custom_branding": True,
                    "compliance_reporting": True,
                    "white_label": True,
                    "dedicated_support": True
                }
            )
        }
    
    async def create_tenant_subscription(
        self, 
        tenant_id: str, 
        plan: BillingPlan, 
        customer_email: str,
        customer_name: str,
        apps: List[str] = None
    ) -> Dict[str, Any]:
        """Create a new subscription for a tenant"""
        try:
            # Get plan configuration
            plan_config = self.plans[plan]
            
            # Create or get Stripe customer
            customer = await self._get_or_create_customer(
                tenant_id, customer_email, customer_name
            )
            
            # Create subscription
            subscription = stripe.Subscription.create(
                customer=customer.id,
                items=[{"price": plan_config.stripe_price_id}],
                metadata={
                    "tenant_id": tenant_id,
                    "plan": plan.value,
                    "apps": ",".join(apps or ["surveillance", "healthcare"])
                },
                payment_behavior="default_incomplete",
                payment_settings={"save_default_payment_method": "on_subscription"},
                expand=["latest_invoice.payment_intent"]
            )
            
            logger.info(f"Created subscription {subscription.id} for tenant {tenant_id}")
            
            return {
                "subscription_id": subscription.id,
                "customer_id": customer.id,
                "plan": plan.value,
                "amount": plan_config.amount,
                "currency": plan_config.currency,
                "status": subscription.status,
                "current_period_start": datetime.fromtimestamp(subscription.current_period_start),
                "current_period_end": datetime.fromtimestamp(subscription.current_period_end),
                "features": plan_config.features,
                "apps": apps or ["surveillance", "healthcare"]
            }
            
        except Exception as e:
            logger.error(f"Failed to create subscription for tenant {tenant_id}: {str(e)}")
            raise
    
    async def _get_or_create_customer(
        self, tenant_id: str, email: str, name: str
    ) -> stripe.Customer:
        """Get existing customer or create new one"""
        try:
            # Try to find existing customer
            customers = stripe.Customer.list(email=email, limit=1)
            
            if customers.data:
                customer = customers.data[0]
                # Update metadata if needed
                if customer.metadata.get("tenant_id") != tenant_id:
                    customer = stripe.Customer.modify(
                        customer.id,
                        metadata={"tenant_id": tenant_id}
                    )
                return customer
            
            # Create new customer
            customer = stripe.Customer.create(
                email=email,
                name=name,
                metadata={"tenant_id": tenant_id}
            )
            
            return customer
            
        except Exception as e:
            logger.error(f"Failed to get/create customer: {str(e)}")
            raise
    
    async def cancel_subscription(self, subscription_id: str) -> Dict[str, Any]:
        """Cancel a subscription"""
        try:
            subscription = stripe.Subscription.modify(
                subscription_id,
                cancel_at_period_end=True
            )
            
            logger.info(f"Cancelled subscription {subscription_id}")
            
            return {
                "subscription_id": subscription.id,
                "status": subscription.status,
                "cancel_at": datetime.fromtimestamp(subscription.cancel_at) if subscription.cancel_at else None
            }
            
        except Exception as e:
            logger.error(f"Failed to cancel subscription {subscription_id}: {str(e)}")
            raise
    
    async def update_subscription(
        self, 
        subscription_id: str, 
        new_plan: BillingPlan
    ) -> Dict[str, Any]:
        """Update subscription to a new plan"""
        try:
            new_plan_config = self.plans[new_plan]
            
            subscription = stripe.Subscription.retrieve(subscription_id)
            
            # Update subscription items
            stripe.Subscription.modify(
                subscription_id,
                items=[{
                    "id": subscription["items"]["data"][0].id,
                    "price": new_plan_config.stripe_price_id
                }],
                metadata={
                    **subscription.metadata,
                    "plan": new_plan.value
                }
            )
            
            logger.info(f"Updated subscription {subscription_id} to plan {new_plan.value}")
            
            return {
                "subscription_id": subscription_id,
                "plan": new_plan.value,
                "amount": new_plan_config.amount,
                "features": new_plan_config.features
            }
            
        except Exception as e:
            logger.error(f"Failed to update subscription {subscription_id}: {str(e)}")
            raise
    
    async def create_invoice(self, subscription_id: str) -> Dict[str, Any]:
        """Create an invoice for a subscription"""
        try:
            invoice = stripe.Invoice.create(
                subscription=subscription_id,
                auto_advance=True
            )
            
            logger.info(f"Created invoice {invoice.id} for subscription {subscription_id}")
            
            return {
                "invoice_id": invoice.id,
                "amount": invoice.amount_due / 100,  # Convert from cents
                "currency": invoice.currency,
                "status": invoice.status,
                "due_date": datetime.fromtimestamp(invoice.due_date) if invoice.due_date else None
            }
            
        except Exception as e:
            logger.error(f"Failed to create invoice for subscription {subscription_id}: {str(e)}")
            raise
    
    async def get_subscription_usage(
        self, 
        tenant_id: str, 
        period_start: datetime,
        period_end: datetime
    ) -> Dict[str, Any]:
        """Get usage metrics for billing period"""
        try:
            # This would integrate with your usage tracking system
            # For now, return mock data
            usage = {
                "surveillance": {
                    "cameras_active": 3,
                    "storage_used_gb": 45.2,
                    "recordings_count": 1250,
                    "alerts_sent": 89
                },
                "healthcare": {
                    "patients_active": 12,
                    "telesitting_sessions": 8,
                    "medical_episodes": 2
                },
                "api_calls": 15420,
                "bandwidth_gb": 12.5
            }
            
            return {
                "tenant_id": tenant_id,
                "period_start": period_start,
                "period_end": period_end,
                "usage": usage
            }
            
        except Exception as e:
            logger.error(f"Failed to get usage for tenant {tenant_id}: {str(e)}")
            raise
    
    async def process_webhook(self, event: Dict[str, Any]) -> Dict[str, Any]:
        """Process Stripe webhooks"""
        try:
            event_type = event["type"]
            
            if event_type == "invoice.payment_succeeded":
                return await self._handle_payment_succeeded(event["data"]["object"])
            elif event_type == "invoice.payment_failed":
                return await self._handle_payment_failed(event["data"]["object"])
            elif event_type == "customer.subscription.deleted":
                return await self._handle_subscription_deleted(event["data"]["object"])
            elif event_type == "customer.subscription.updated":
                return await self._handle_subscription_updated(event["data"]["object"])
            
            return {"status": "processed", "event_type": event_type}
            
        except Exception as e:
            logger.error(f"Failed to process webhook: {str(e)}")
            raise
    
    async def _handle_payment_succeeded(self, invoice: Dict[str, Any]) -> Dict[str, Any]:
        """Handle successful payment"""
        subscription_id = invoice.get("subscription")
        tenant_id = invoice.get("metadata", {}).get("tenant_id")
        
        logger.info(f"Payment succeeded for tenant {tenant_id}, subscription {subscription_id}")
        
        # Update tenant status to active
        # Send confirmation email
        # Update usage limits
        
        return {
            "status": "payment_succeeded",
            "tenant_id": tenant_id,
            "subscription_id": subscription_id,
            "amount": invoice.get("amount_paid", 0) / 100
        }
    
    async def _handle_payment_failed(self, invoice: Dict[str, Any]) -> Dict[str, Any]:
        """Handle failed payment"""
        subscription_id = invoice.get("subscription")
        tenant_id = invoice.get("metadata", {}).get("tenant_id")
        
        logger.warning(f"Payment failed for tenant {tenant_id}, subscription {subscription_id}")
        
        # Update tenant status to suspended
        # Send payment failure notification
        # Implement retry logic
        
        return {
            "status": "payment_failed",
            "tenant_id": tenant_id,
            "subscription_id": subscription_id
        }
    
    async def _handle_subscription_deleted(self, subscription: Dict[str, Any]) -> Dict[str, Any]:
        """Handle subscription deletion"""
        tenant_id = subscription.get("metadata", {}).get("tenant_id")
        
        logger.info(f"Subscription deleted for tenant {tenant_id}")
        
        # Update tenant status to cancelled
        # Clean up tenant data
        # Send cancellation confirmation
        
        return {
            "status": "subscription_deleted",
            "tenant_id": tenant_id
        }
    
    async def _handle_subscription_updated(self, subscription: Dict[str, Any]) -> Dict[str, Any]:
        """Handle subscription updates"""
        tenant_id = subscription.get("metadata", {}).get("tenant_id")
        plan = subscription.get("metadata", {}).get("plan")
        
        logger.info(f"Subscription updated for tenant {tenant_id} to plan {plan}")
        
        # Update tenant plan and features
        # Update usage limits
        # Send plan change notification
        
        return {
            "status": "subscription_updated",
            "tenant_id": tenant_id,
            "plan": plan
        }
    
    def get_plan_features(self, plan: BillingPlan) -> Dict[str, Any]:
        """Get features for a specific plan"""
        return self.plans[plan].features
    
    def get_plan_limits(self, plan: BillingPlan) -> Dict[str, Any]:
        """Get limits for a specific plan"""
        return self.plans[plan].limits

# Global billing service instance
billing_service = UnifiedBillingService() 