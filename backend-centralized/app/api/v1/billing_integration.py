"""
Billing Integration API
Handles payment processing, subscriptions, and billing management
"""

import stripe
import uuid
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks, Request
from pydantic import BaseModel, Field, EmailStr
from enum import Enum

from app.core.auth import get_current_user, get_current_user_dev_optional
import logging
audit_logger = logging.getLogger(__name__)
from app.models.client_management import Client, ClientBilling, BillingCycle
from app.services.client_management_service import ClientManagementService
from app.core.database import get_db

router = APIRouter(prefix="/billing", tags=["Billing Integration"])

# Initialize Stripe (you'll need to set STRIPE_SECRET_KEY in environment)
try:
    stripe.api_key = "sk_test_..."  # Replace with your Stripe test key
    STRIPE_ENABLED = True
except Exception:
    STRIPE_ENABLED = False
    audit_logger.warning("Stripe not configured - billing features will be simulated")

class PaymentMethod(BaseModel):
    type: str = Field(..., description="Payment method type: card, bank_account")
    token: str = Field(..., description="Payment method token from Stripe")
    billing_details: Dict[str, Any] = Field(default={}, description="Billing address and contact info")

class CreateSubscription(BaseModel):
    client_id: str = Field(..., description="Client ID")
    plan_id: str = Field(..., description="Stripe plan ID")
    payment_method_id: str = Field(..., description="Payment method ID")
    billing_cycle: BillingCycle = Field(default=BillingCycle.MONTHLY, description="Billing frequency")
    trial_days: Optional[int] = Field(default=14, description="Trial period in days")

class InvoiceItem(BaseModel):
    description: str = Field(..., description="Item description")
    amount: int = Field(..., description="Amount in cents")
    currency: str = Field(default="usd", description="Currency code")
    quantity: int = Field(default=1, description="Quantity")

class CreateInvoice(BaseModel):
    client_id: str = Field(..., description="Client ID")
    items: List[InvoiceItem] = Field(..., description="Invoice items")
    due_date: Optional[datetime] = Field(default=None, description="Due date")
    auto_advance: bool = Field(default=True, description="Auto advance invoice")

# Mock Stripe data for development
MOCK_STRIPE_DATA = {
    "customers": {},
    "subscriptions": {},
    "invoices": {},
    "payment_methods": {}
}

def get_stripe_customer_id(client_id: str) -> str:
    """Get or create Stripe customer ID for client"""
    if client_id in MOCK_STRIPE_DATA["customers"]:
        return MOCK_STRIPE_DATA["customers"][client_id]
    
    # Create mock customer ID
    customer_id = f"cus_{str(uuid.uuid4())[:14]}"
    MOCK_STRIPE_DATA["customers"][client_id] = customer_id
    return customer_id

@router.post("/create-customer", operation_id="billing_create_customer")
async def create_stripe_customer(
    client_id: str,
    current_user: str = Depends(get_current_user)
):
    """Create a Stripe customer for a client"""
    try:
        db = next(get_db())
        client_service = ClientManagementService(db)
        client = client_service.get_client(client_id)
        
        if not client:
            raise HTTPException(status_code=404, detail="Client not found")
        
        if STRIPE_ENABLED:
            # Create real Stripe customer
            customer = stripe.Customer.create(
                email=client.email,
                name=client.company_name,
                phone=client.phone,
                metadata={
                    "client_id": client_id,
                    "contact_person": client.contact_person
                }
            )
            customer_id = customer.id
        else:
            # Create mock customer
            customer_id = get_stripe_customer_id(client_id)
        
        audit_logger.info(f"Created Stripe customer {customer_id} for client {client_id}")
        
        return {
            "status": "success",
            "customer_id": customer_id,
            "message": "Customer created successfully"
        }
        
    except Exception as e:
        audit_logger.error(f"Error creating Stripe customer: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create customer")

@router.post("/create-subscription", operation_id="billing_create_subscription")
async def create_subscription(
    subscription_data: CreateSubscription,
    current_user: str = Depends(get_current_user)
):
    """Create a subscription for a client"""
    try:
        db = next(get_db())
        client_service = ClientManagementService(db)
        client = client_service.get_client(subscription_data.client_id)
        
        if not client:
            raise HTTPException(status_code=404, detail="Client not found")
        
        customer_id = get_stripe_customer_id(subscription_data.client_id)
        
        if STRIPE_ENABLED:
            # Create real Stripe subscription
            subscription = stripe.Subscription.create(
                customer=customer_id,
                items=[{"price": subscription_data.plan_id}],
                payment_behavior="default_incomplete",
                payment_settings={"save_default_payment_method": "on_subscription"},
                expand=["latest_invoice.payment_intent"],
                trial_period_days=subscription_data.trial_days
            )
            
            subscription_id = subscription.id
            status = subscription.status
            current_period_end = datetime.fromtimestamp(subscription.current_period_end)
        else:
            # Create mock subscription
            subscription_id = f"sub_{str(uuid.uuid4())[:14]}"
            status = "trialing"
            current_period_end = datetime.now() + timedelta(days=subscription_data.trial_days)
            
            MOCK_STRIPE_DATA["subscriptions"][subscription_id] = {
                "id": subscription_id,
                "customer_id": customer_id,
                "status": status,
                "current_period_end": current_period_end,
                "plan_id": subscription_data.plan_id
            }
        
        # Update client billing cycle
        client_service.update_client(subscription_data.client_id, {
            "billing_cycle": subscription_data.billing_cycle
        })
        
        audit_logger.info(f"Created subscription {subscription_id} for client {subscription_data.client_id}")
        
        return {
            "status": "success",
            "subscription_id": subscription_id,
            "status": status,
            "current_period_end": current_period_end.isoformat(),
            "message": "Subscription created successfully"
        }
        
    except Exception as e:
        audit_logger.error(f"Error creating subscription: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create subscription")

@router.post("/create-invoice", operation_id="billing_create_invoice")
async def create_invoice(
    invoice_data: CreateInvoice,
    current_user: str = Depends(get_current_user)
):
    """Create an invoice for a client"""
    try:
        db = next(get_db())
        client_service = ClientManagementService(db)
        client = client_service.get_client(invoice_data.client_id)
        
        if not client:
            raise HTTPException(status_code=404, detail="Client not found")
        
        customer_id = get_stripe_customer_id(invoice_data.client_id)
        
        # Prepare invoice items
        invoice_items = []
        total_amount = 0
        
        for item in invoice_data.items:
            invoice_items.append({
                "amount": item.amount,
                "currency": item.currency,
                "description": item.description,
                "quantity": item.quantity
            })
            total_amount += item.amount * item.quantity
        
        if STRIPE_ENABLED:
            # Create real Stripe invoice
            invoice = stripe.Invoice.create(
                customer=customer_id,
                collection_method="charge_automatically",
                auto_advance=invoice_data.auto_advance,
                due_date=int(invoice_data.due_date.timestamp()) if invoice_data.due_date else None
            )
            
            # Add invoice items
            for item in invoice_items:
                stripe.InvoiceItem.create(
                    customer=customer_id,
                    invoice=invoice.id,
                    amount=item["amount"],
                    currency=item["currency"],
                    description=item["description"],
                    quantity=item["quantity"]
                )
            
            # Finalize invoice
            invoice = stripe.Invoice.finalize_invoice(invoice.id)
            
            invoice_id = invoice.id
            status = invoice.status
            amount_due = invoice.amount_due
        else:
            # Create mock invoice
            invoice_id = f"in_{str(uuid.uuid4())[:14]}"
            status = "draft"
            amount_due = total_amount
            
            MOCK_STRIPE_DATA["invoices"][invoice_id] = {
                "id": invoice_id,
                "customer_id": customer_id,
                "status": status,
                "amount_due": amount_due,
                "items": invoice_items
            }
        
        # Create billing record in database
        billing_record = ClientBilling(
            id=f"B{str(uuid.uuid4())[:8].upper()}",
            client_id=invoice_data.client_id,
            amount=amount_due / 100,  # Convert cents to dollars
            currency="USD",
            billing_cycle=client.billing_cycle,
            status="pending",
            due_date=invoice_data.due_date or datetime.now() + timedelta(days=30),
            invoice_url=f"https://billing.example.com/invoice/{invoice_id}"
        )
        
        db.add(billing_record)
        db.commit()
        
        audit_logger.info(f"Created invoice {invoice_id} for client {invoice_data.client_id}")
        
        return {
            "status": "success",
            "invoice_id": invoice_id,
            "status": status,
            "amount_due": amount_due,
            "message": "Invoice created successfully"
        }
        
    except Exception as e:
        audit_logger.error(f"Error creating invoice: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create invoice")

@router.get("/subscriptions/{client_id}", operation_id="billing_get_subscriptions")
async def get_client_subscriptions(
    client_id: str,
    current_user: str = Depends(get_current_user_dev_optional)
):
    """Get all subscriptions for a client"""
    try:
        if STRIPE_ENABLED:
            customer_id = get_stripe_customer_id(client_id)
            subscriptions = stripe.Subscription.list(customer=customer_id)
            return {
                "status": "success",
                "subscriptions": subscriptions.data
            }
        else:
            # Return mock subscriptions
            mock_subscriptions = [
                sub for sub in MOCK_STRIPE_DATA["subscriptions"].values()
                if sub["customer_id"] == get_stripe_customer_id(client_id)
            ]
            return {
                "status": "success",
                "subscriptions": mock_subscriptions
            }
        
    except Exception as e:
        audit_logger.error(f"Error getting subscriptions: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get subscriptions")

@router.get("/invoices/{client_id}", operation_id="billing_get_invoices")
async def get_client_invoices(
    client_id: str,
    current_user: str = Depends(get_current_user_dev_optional)
):
    """Get all invoices for a client"""
    try:
        if STRIPE_ENABLED:
            customer_id = get_stripe_customer_id(client_id)
            invoices = stripe.Invoice.list(customer=customer_id)
            return {
                "status": "success",
                "invoices": invoices.data
            }
        else:
            # Return mock invoices
            mock_invoices = [
                inv for inv in MOCK_STRIPE_DATA["invoices"].values()
                if inv["customer_id"] == get_stripe_customer_id(client_id)
            ]
            return {
                "status": "success",
                "invoices": mock_invoices
            }
        
    except Exception as e:
        audit_logger.error(f"Error getting invoices: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get invoices")

@router.post("/webhook", operation_id="billing_webhook")
async def stripe_webhook(
    request: Request,
    background_tasks: BackgroundTasks
):
    """Handle Stripe webhooks"""
    try:
        payload = await request.body()
        sig_header = request.headers.get("stripe-signature")
        
        if STRIPE_ENABLED:
            event = stripe.Webhook.construct_event(
                payload, sig_header, "whsec_..."  # Replace with your webhook secret
            )
        else:
            # Mock webhook event
            event = {"type": "invoice.payment_succeeded", "data": {"object": {}}}
        
        # Handle different event types
        if event["type"] == "invoice.payment_succeeded":
            background_tasks.add_task(handle_payment_succeeded, event["data"]["object"])
        elif event["type"] == "invoice.payment_failed":
            background_tasks.add_task(handle_payment_failed, event["data"]["object"])
        elif event["type"] == "customer.subscription.updated":
            background_tasks.add_task(handle_subscription_updated, event["data"]["object"])
        
        return {"status": "success"}
        
    except Exception as e:
        audit_logger.error(f"Webhook error: {str(e)}")
        raise HTTPException(status_code=400, detail="Webhook error")

async def handle_payment_succeeded(invoice_data: Dict[str, Any]):
    """Handle successful payment"""
    try:
        # Update billing record status
        db = next(get_db())
        billing_record = db.query(ClientBilling).filter(
            ClientBilling.invoice_url.contains(invoice_data["id"])
        ).first()
        
        if billing_record:
            billing_record.status = "paid"
            billing_record.paid_date = datetime.now()
            db.commit()
            
            audit_logger.info(f"Payment succeeded for invoice {invoice_data['id']}")
            
    except Exception as e:
        audit_logger.error(f"Error handling payment success: {str(e)}")

async def handle_payment_failed(invoice_data: Dict[str, Any]):
    """Handle failed payment"""
    try:
        # Update billing record status
        db = next(get_db())
        billing_record = db.query(ClientBilling).filter(
            ClientBilling.invoice_url.contains(invoice_data["id"])
        ).first()
        
        if billing_record:
            billing_record.status = "failed"
            db.commit()
            
            audit_logger.warning(f"Payment failed for invoice {invoice_data['id']}")
            
    except Exception as e:
        audit_logger.error(f"Error handling payment failure: {str(e)}")

async def handle_subscription_updated(subscription_data: Dict[str, Any]):
    """Handle subscription updates"""
    try:
        audit_logger.info(f"Subscription updated: {subscription_data['id']}")
        # Add subscription update logic here
        
    except Exception as e:
        audit_logger.error(f"Error handling subscription update: {str(e)}")

@router.get("/plans", operation_id="billing_get_plans")
async def get_available_plans(
    current_user: str = Depends(get_current_user_dev_optional)
):
    """Get available subscription plans"""
    try:
        if STRIPE_ENABLED:
            plans = stripe.Price.list(active=True, expand=["data.product"])
            return {
                "status": "success",
                "plans": plans.data
            }
        else:
            # Return mock plans
            mock_plans = [
                {
                    "id": "price_basic_monthly",
                    "nickname": "Basic Monthly",
                    "unit_amount": 2900,  # $29.00 in cents
                    "currency": "usd",
                    "recurring": {"interval": "month"},
                    "product": {"name": "Basic Plan", "description": "Basic communication features"}
                },
                {
                    "id": "price_professional_monthly",
                    "nickname": "Professional Monthly",
                    "unit_amount": 9900,  # $99.00 in cents
                    "currency": "usd",
                    "recurring": {"interval": "month"},
                    "product": {"name": "Professional Plan", "description": "Advanced communication features"}
                },
                {
                    "id": "price_enterprise_monthly",
                    "nickname": "Enterprise Monthly",
                    "unit_amount": 29900,  # $299.00 in cents
                    "currency": "usd",
                    "recurring": {"interval": "month"},
                    "product": {"name": "Enterprise Plan", "description": "Full communication suite"}
                }
            ]
            return {
                "status": "success",
                "plans": mock_plans
            }
        
    except Exception as e:
        audit_logger.error(f"Error getting plans: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get plans")
