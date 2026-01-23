"""
Client Management Database Models
"""

from sqlalchemy import Column, String, Integer, Float, DateTime, Boolean, Text, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime
import enum

from app.core.database import Base

class SubscriptionTier(str, enum.Enum):
    BASIC = "basic"
    PROFESSIONAL = "professional"
    ENTERPRISE = "enterprise"

class ClientStatus(str, enum.Enum):
    ACTIVE = "active"
    SUSPENDED = "suspended"
    CANCELLED = "cancelled"
    PENDING = "pending"

class BillingCycle(str, enum.Enum):
    MONTHLY = "monthly"
    QUARTERLY = "quarterly"
    YEARLY = "yearly"

class Client(Base):
    """Client account model"""
    __tablename__ = "client_accounts"

    id = Column(String(50), primary_key=True, index=True)
    company_name = Column(String(255), nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    phone = Column(String(50), nullable=False)
    contact_person = Column(String(255), nullable=False)
    address = Column(Text, nullable=True)
    subscription_tier = Column(Enum(SubscriptionTier), nullable=False, default=SubscriptionTier.BASIC)
    max_users = Column(Integer, default=5)
    billing_cycle = Column(Enum(BillingCycle), nullable=False, default=BillingCycle.MONTHLY)
    status = Column(Enum(ClientStatus), nullable=False, default=ClientStatus.ACTIVE)
    custom_domain = Column(String(255), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    # Relationships
    usage_records = relationship("ClientUsage", back_populates="client", cascade="all, delete-orphan")
    billing_records = relationship("ClientBilling", back_populates="client", cascade="all, delete-orphan")
    users = relationship("ClientUser", back_populates="client", cascade="all, delete-orphan")

class ClientUsage(Base):
    """Client usage tracking model"""
    __tablename__ = "client_usage"

    id = Column(String(50), primary_key=True, index=True)
    client_id = Column(String(50), ForeignKey("client_accounts.id"), nullable=False)
    date = Column(DateTime, nullable=False, index=True)
    calls = Column(Integer, default=0)
    emails = Column(Integer, default=0)
    sms = Column(Integer, default=0)
    whatsapp = Column(Integer, default=0)
    telegram = Column(Integer, default=0)
    slack = Column(Integer, default=0)
    discord = Column(Integer, default=0)
    fax = Column(Integer, default=0)
    total_cost = Column(Float, default=0.0)
    created_at = Column(DateTime, default=func.now())

    # Relationships
    client = relationship("Client", back_populates="usage_records")

class ClientBilling(Base):
    """Client billing records model"""
    __tablename__ = "client_billing"

    id = Column(String(50), primary_key=True, index=True)
    client_id = Column(String(50), ForeignKey("client_accounts.id"), nullable=False)
    amount = Column(Float, nullable=False)
    currency = Column(String(10), default="USD")
    billing_cycle = Column(Enum(BillingCycle), nullable=False)
    status = Column(String(20), default="pending")  # pending, paid, failed, refunded
    due_date = Column(DateTime, nullable=False)
    paid_date = Column(DateTime, nullable=True)
    invoice_url = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=func.now())

    # Relationships
    client = relationship("Client", back_populates="billing_records")

class ClientUser(Base):
    """Client user accounts model"""
    __tablename__ = "client_users"

    id = Column(String(50), primary_key=True, index=True)
    client_id = Column(String(50), ForeignKey("client_accounts.id"), nullable=False)
    username = Column(String(255), unique=True, nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    first_name = Column(String(255), nullable=False)
    last_name = Column(String(255), nullable=False)
    role = Column(String(50), default="user")  # admin, user, viewer
    is_active = Column(Boolean, default=True)
    last_login = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    # Relationships
    client = relationship("Client", back_populates="users")

class ClientSettings(Base):
    """Client-specific settings model"""
    __tablename__ = "client_settings"

    id = Column(String(50), primary_key=True, index=True)
    client_id = Column(String(50), ForeignKey("client_accounts.id"), nullable=False, unique=True)
    
    # Communication settings
    email_enabled = Column(Boolean, default=True)
    sms_enabled = Column(Boolean, default=True)
    whatsapp_enabled = Column(Boolean, default=True)
    telegram_enabled = Column(Boolean, default=True)
    slack_enabled = Column(Boolean, default=True)
    discord_enabled = Column(Boolean, default=True)
    fax_enabled = Column(Boolean, default=True)
    voice_enabled = Column(Boolean, default=True)
    video_enabled = Column(Boolean, default=True)
    
    # Feature flags
    analytics_enabled = Column(Boolean, default=True)
    reporting_enabled = Column(Boolean, default=True)
    api_access_enabled = Column(Boolean, default=False)
    white_label_enabled = Column(Boolean, default=False)
    
    # Limits
    max_storage_gb = Column(Integer, default=10)
    max_api_calls_per_day = Column(Integer, default=1000)
    max_contacts = Column(Integer, default=1000)
    
    # Custom branding
    logo_url = Column(String(500), nullable=True)
    primary_color = Column(String(7), default="#3B82F6")  # Hex color
    company_name_display = Column(String(255), nullable=True)
    
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

class ClientActivity(Base):
    """Client activity log model"""
    __tablename__ = "client_activity"

    id = Column(String(50), primary_key=True, index=True)
    client_id = Column(String(50), ForeignKey("client_accounts.id"), nullable=False)
    action = Column(String(255), nullable=False)
    user_id = Column(String(50), nullable=True)
    resource_type = Column(String(100), nullable=True)
    resource_id = Column(String(50), nullable=True)
    details = Column(Text, nullable=True)
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(Text, nullable=True)
    created_at = Column(DateTime, default=func.now())

    # Relationships
    client = relationship("Client")
