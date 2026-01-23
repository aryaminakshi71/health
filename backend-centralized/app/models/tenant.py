"""
Multi-Tenant Models for SaaS Surveillance System
"""

from datetime import datetime, timedelta
from enum import Enum
from typing import Optional, Dict, Any
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, JSON, ForeignKey, Float, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class TenantStatus(str, Enum):
    ACTIVE = "active"
    SUSPENDED = "suspended"
    CANCELLED = "cancelled"
    PENDING = "pending"

class SubscriptionPlan(str, Enum):
    STARTER = "starter"
    PROFESSIONAL = "professional"
    HEALTHCARE = "healthcare"
    ENTERPRISE = "enterprise"

class PaymentStatus(str, Enum):
    PENDING = "pending"
    PAID = "paid"
    FAILED = "failed"
    REFUNDED = "refunded"
    CANCELLED = "cancelled"

class BillingCycle(str, Enum):
    MONTHLY = "monthly"
    YEARLY = "yearly"

class Tenant(Base):
    """Multi-tenant organization"""
    __tablename__ = "tenants"
    
    id = Column(String(100), primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    domain = Column(String(200), unique=True, nullable=False)
    subdomain = Column(String(100), unique=True, nullable=False)
    status = Column(SQLEnum(TenantStatus), default=TenantStatus.PENDING)
    plan = Column(SQLEnum(SubscriptionPlan), default=SubscriptionPlan.STARTER)
    
    # Contact Information
    contact_email = Column(String(255), nullable=False)
    contact_phone = Column(String(50))
    contact_name = Column(String(200))
    
    # Billing Information
    billing_email = Column(String(255))
    billing_address = Column(JSON)
    tax_id = Column(String(100))
    
    # Settings
    settings = Column(JSON, default={})
    limits = Column(JSON, default={})
    features = Column(JSON, default={})
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    trial_ends_at = Column(DateTime)
    subscription_ends_at = Column(DateTime)
    
    # Relationships
    subscriptions = relationship("Subscription", back_populates="tenant")
    billing_records = relationship("BillingRecord", back_populates="tenant")
    usage_records = relationship("UsageRecord", back_populates="tenant")
    users = relationship("TenantUser", back_populates="tenant")

class Subscription(Base):
    """Subscription information"""
    __tablename__ = "subscriptions"
    
    id = Column(String(100), primary_key=True, index=True)
    tenant_id = Column(String(100), ForeignKey("tenants.id"), nullable=False)
    stripe_subscription_id = Column(String(100), unique=True)
    plan = Column(SQLEnum(SubscriptionPlan), nullable=False)
    status = Column(String(50), default="active")
    
    # Billing
    billing_cycle = Column(SQLEnum(BillingCycle), default=BillingCycle.MONTHLY)
    amount = Column(Float, nullable=False)
    currency = Column(String(3), default="USD")
    
    # Dates
    current_period_start = Column(DateTime)
    current_period_end = Column(DateTime)
    trial_start = Column(DateTime)
    trial_end = Column(DateTime)
    cancelled_at = Column(DateTime)
    
    # Metadata
    meta_data = Column(JSON, default={})
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    tenant = relationship("Tenant", back_populates="subscriptions")
    invoices = relationship("Invoice", back_populates="subscription")

class BillingRecord(Base):
    """Billing and payment records"""
    __tablename__ = "billing_records"
    
    id = Column(String(100), primary_key=True, index=True)
    tenant_id = Column(String(100), ForeignKey("tenants.id"), nullable=False)
    subscription_id = Column(String(100), ForeignKey("subscriptions.id"))
    
    # Payment Information
    stripe_payment_intent_id = Column(String(100), unique=True)
    stripe_invoice_id = Column(String(100))
    amount = Column(Float, nullable=False)
    currency = Column(String(3), default="USD")
    status = Column(SQLEnum(PaymentStatus), default=PaymentStatus.PENDING)
    
    # Billing Details
    description = Column(Text)
    billing_period_start = Column(DateTime)
    billing_period_end = Column(DateTime)
    
    # Metadata
    meta_data = Column(JSON, default={})
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    tenant = relationship("Tenant", back_populates="billing_records")

class Invoice(Base):
    """Invoice records"""
    __tablename__ = "invoices"
    
    id = Column(String(100), primary_key=True, index=True)
    subscription_id = Column(String(100), ForeignKey("subscriptions.id"), nullable=False)
    stripe_invoice_id = Column(String(100), unique=True)
    
    # Invoice Details
    number = Column(String(100), unique=True)
    amount = Column(Float, nullable=False)
    currency = Column(String(3), default="USD")
    status = Column(String(50), default="draft")
    
    # Billing
    billing_email = Column(String(255))
    billing_address = Column(JSON)
    
    # Dates
    due_date = Column(DateTime)
    paid_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    subscription = relationship("Subscription", back_populates="invoices")
    items = relationship("InvoiceItem", back_populates="invoice")

class InvoiceItem(Base):
    """Invoice line items"""
    __tablename__ = "invoice_items"
    
    id = Column(String(100), primary_key=True, index=True)
    invoice_id = Column(String(100), ForeignKey("invoices.id"), nullable=False)
    
    # Item Details
    description = Column(Text, nullable=False)
    quantity = Column(Integer, default=1)
    unit_amount = Column(Float, nullable=False)
    total_amount = Column(Float, nullable=False)
    
    # Metadata
    meta_data = Column(JSON, default={})
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    invoice = relationship("Invoice", back_populates="items")

class UsageRecord(Base):
    """Usage tracking for billing"""
    __tablename__ = "usage_records"
    
    id = Column(String(100), primary_key=True, index=True)
    tenant_id = Column(String(100), ForeignKey("tenants.id"), nullable=False)
    
    # Usage Details
    metric = Column(String(100), nullable=False)  # cameras, storage, api_calls, etc.
    value = Column(Float, nullable=False)
    unit = Column(String(50))  # count, GB, calls, etc.
    
    # Period
    period_start = Column(DateTime, nullable=False)
    period_end = Column(DateTime, nullable=False)
    
    # Metadata
    meta_data = Column(JSON, default={})
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    tenant = relationship("Tenant", back_populates="usage_records")

class TenantUser(Base):
    """Users within a tenant"""
    __tablename__ = "tenant_users"
    
    id = Column(String(100), primary_key=True, index=True)
    tenant_id = Column(String(100), ForeignKey("tenants.id"), nullable=False)
    user_id = Column(String(100), nullable=False)  # Reference to main user table
    
    # Role and Permissions
    role = Column(String(50), default="user")  # admin, user, viewer
    permissions = Column(JSON, default={})
    
    # Status
    is_active = Column(Boolean, default=True)
    invited_at = Column(DateTime)
    accepted_at = Column(DateTime)
    
    # Metadata
    meta_data = Column(JSON, default={})
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    tenant = relationship("Tenant", back_populates="users")

class TenantSettings(Base):
    """Tenant-specific settings"""
    __tablename__ = "tenant_settings"
    
    id = Column(String(100), primary_key=True, index=True)
    tenant_id = Column(String(100), ForeignKey("tenants.id"), nullable=False)
    
    # Feature Settings
    features_enabled = Column(JSON, default={})
    limits = Column(JSON, default={})
    preferences = Column(JSON, default={})
    
    # Security Settings
    security_settings = Column(JSON, default={})
    compliance_settings = Column(JSON, default={})
    
    # Notification Settings
    notification_settings = Column(JSON, default={})
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# Default tenant limits based on plans
TENANT_LIMITS = {
    SubscriptionPlan.STARTER: {
        "cameras": 5,
        "storage_gb": 100,
        "retention_days": 30,
        "users": 3,
        "api_calls_per_month": 10000,
        "alerts_per_month": 1000
    },
    SubscriptionPlan.PROFESSIONAL: {
        "cameras": 25,
        "storage_gb": 500,
        "retention_days": 90,
        "users": 10,
        "api_calls_per_month": 50000,
        "alerts_per_month": 5000
    },
    SubscriptionPlan.HEALTHCARE: {
        "cameras": 50,
        "storage_gb": 1000,
        "retention_days": 365,
        "users": 25,
        "api_calls_per_month": 100000,
        "alerts_per_month": 10000
    },
    SubscriptionPlan.ENTERPRISE: {
        "cameras": -1,  # Unlimited
        "storage_gb": -1,  # Unlimited
        "retention_days": -1,  # Unlimited
        "users": -1,  # Unlimited
        "api_calls_per_month": -1,  # Unlimited
        "alerts_per_month": -1  # Unlimited
    }
}

# Default tenant features based on plans
TENANT_FEATURES = {
    SubscriptionPlan.STARTER: {
        "basic_alerts": True,
        "email_notifications": True,
        "mobile_app": True,
        "basic_analytics": True,
        "api_access": False,
        "telesitting": False,
        "hipaa_compliance": False,
        "white_label": False
    },
    SubscriptionPlan.PROFESSIONAL: {
        "basic_alerts": True,
        "email_notifications": True,
        "sms_notifications": True,
        "whatsapp_notifications": True,
        "push_notifications": True,
        "mobile_app": True,
        "advanced_analytics": True,
        "api_access": True,
        "telesitting": True,
        "hipaa_compliance": False,
        "white_label": False,
        "custom_branding": True
    },
    SubscriptionPlan.HEALTHCARE: {
        "basic_alerts": True,
        "email_notifications": True,
        "sms_notifications": True,
        "whatsapp_notifications": True,
        "push_notifications": True,
        "phone_calls": True,
        "mobile_app": True,
        "advanced_analytics": True,
        "api_access": True,
        "telesitting": True,
        "hipaa_compliance": True,
        "white_label": False,
        "custom_branding": True,
        "compliance_reporting": True,
        "medical_episode_tracking": True
    },
    SubscriptionPlan.ENTERPRISE: {
        "basic_alerts": True,
        "email_notifications": True,
        "sms_notifications": True,
        "whatsapp_notifications": True,
        "push_notifications": True,
        "phone_calls": True,
        "mobile_app": True,
        "advanced_analytics": True,
        "api_access": True,
        "telesitting": True,
        "hipaa_compliance": True,
        "white_label": True,
        "custom_branding": True,
        "compliance_reporting": True,
        "medical_episode_tracking": True,
        "custom_integrations": True,
        "dedicated_support": True,
        "on_premise_deployment": True
    }
} 