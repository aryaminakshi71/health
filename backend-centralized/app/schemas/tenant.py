"""
Pydantic Schemas for Tenant Management API
"""

from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum

from app.models.tenant import TenantStatus, SubscriptionPlan

class TenantCreate(BaseModel):
    """Schema for creating a new tenant"""
    name: str = Field(..., min_length=1, max_length=200, description="Tenant organization name")
    domain: str = Field(..., description="Primary domain for the tenant")
    contact_email: EmailStr = Field(..., description="Primary contact email")
    contact_name: str = Field(..., min_length=1, max_length=200, description="Primary contact name")
    contact_phone: Optional[str] = Field(None, max_length=50, description="Primary contact phone")
    plan: SubscriptionPlan = Field(SubscriptionPlan.STARTER, description="Subscription plan")
    apps: Optional[List[str]] = Field(["surveillance", "healthcare"], description="Applications to enable")
    settings: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Tenant-specific settings")
    billing_email: Optional[EmailStr] = Field(None, description="Billing email address")
    billing_address: Optional[Dict[str, Any]] = Field(None, description="Billing address information")
    tax_id: Optional[str] = Field(None, max_length=100, description="Tax identification number")

class TenantUpdate(BaseModel):
    """Schema for updating tenant information"""
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    contact_email: Optional[EmailStr] = None
    contact_name: Optional[str] = Field(None, min_length=1, max_length=200)
    contact_phone: Optional[str] = Field(None, max_length=50)
    billing_email: Optional[EmailStr] = None
    billing_address: Optional[Dict[str, Any]] = None
    tax_id: Optional[str] = Field(None, max_length=100)
    settings: Optional[Dict[str, Any]] = None

class TenantResponse(BaseModel):
    """Schema for tenant response"""
    tenant_id: str = Field(..., description="Unique tenant identifier")
    name: str = Field(..., description="Tenant organization name")
    domain: str = Field(..., description="Primary domain")
    subdomain: str = Field(..., description="Generated subdomain")
    status: str = Field(..., description="Tenant status")
    plan: str = Field(..., description="Current subscription plan")
    contact_email: str = Field(..., description="Primary contact email")
    contact_name: str = Field(..., description="Primary contact name")
    contact_phone: Optional[str] = None
    billing_email: Optional[str] = None
    billing_address: Optional[Dict[str, Any]] = None
    tax_id: Optional[str] = None
    settings: Dict[str, Any] = Field(default_factory=dict)
    limits: Dict[str, Any] = Field(default_factory=dict)
    features: Dict[str, Any] = Field(default_factory=dict)
    created_at: str = Field(..., description="Tenant creation timestamp")
    updated_at: Optional[str] = None
    trial_ends_at: Optional[str] = None
    subscription_ends_at: Optional[str] = None

    class Config:
        from_attributes = True

class SubscriptionCreate(BaseModel):
    """Schema for creating a subscription"""
    plan: SubscriptionPlan = Field(..., description="Subscription plan")
    apps: List[str] = Field(["surveillance", "healthcare"], description="Applications to enable")
    billing_cycle: str = Field("monthly", description="Billing cycle (monthly/yearly)")

class BillingResponse(BaseModel):
    """Schema for billing response"""
    tenant_id: str = Field(..., description="Tenant identifier")
    subscription: Dict[str, Any] = Field(..., description="Subscription details")
    status: str = Field(..., description="Operation status")

class UsageResponse(BaseModel):
    """Schema for usage response"""
    tenant_id: str = Field(..., description="Tenant identifier")
    plan: str = Field(..., description="Current plan")
    limits: Dict[str, Any] = Field(..., description="Plan limits")
    current_usage: Dict[str, Any] = Field(..., description="Current usage metrics")
    period: Dict[str, str] = Field(..., description="Usage period")

class LimitsCheckResponse(BaseModel):
    """Schema for limits check response"""
    tenant_id: str = Field(..., description="Tenant identifier")
    resource: str = Field(..., description="Resource being checked")
    current_usage: float = Field(..., description="Current usage")
    requested: int = Field(..., description="Requested amount")
    limit: int = Field(..., description="Plan limit (-1 for unlimited)")
    remaining: int = Field(..., description="Remaining capacity")
    within_limits: bool = Field(..., description="Whether request is within limits")

class InvoiceResponse(BaseModel):
    """Schema for invoice response"""
    invoice_id: str = Field(..., description="Invoice identifier")
    number: str = Field(..., description="Invoice number")
    amount: float = Field(..., description="Invoice amount")
    currency: str = Field(..., description="Currency")
    status: str = Field(..., description="Invoice status")
    due_date: Optional[str] = None
    paid_at: Optional[str] = None

class TenantInvoicesResponse(BaseModel):
    """Schema for tenant invoices response"""
    tenant_id: str = Field(..., description="Tenant identifier")
    invoices: List[InvoiceResponse] = Field(..., description="List of invoices")
    total: int = Field(..., description="Total number of invoices")

class PlanFeaturesResponse(BaseModel):
    """Schema for plan features response"""
    plan: str = Field(..., description="Plan name")
    features: Dict[str, Any] = Field(..., description="Plan features")

class AllPlansFeaturesResponse(BaseModel):
    """Schema for all plans features response"""
    plans: Dict[str, Dict[str, Any]] = Field(..., description="All plans and their features")

class AnalyticsOverviewResponse(BaseModel):
    """Schema for analytics overview response"""
    total_tenants: int = Field(..., description="Total number of tenants")
    active_tenants: int = Field(..., description="Number of active tenants")
    suspended_tenants: int = Field(..., description="Number of suspended tenants")
    plan_distribution: Dict[str, int] = Field(..., description="Distribution by plan")
    revenue_by_plan: Dict[str, float] = Field(..., description="Revenue by plan")
    total_monthly_revenue: float = Field(..., description="Total monthly revenue")
    conversion_rate: float = Field(..., description="Conversion rate percentage")

class WebhookResponse(BaseModel):
    """Schema for webhook response"""
    tenant_id: str = Field(..., description="Tenant identifier")
    webhook_processed: bool = Field(..., description="Whether webhook was processed")
    result: Dict[str, Any] = Field(..., description="Webhook processing result")

class TenantListResponse(BaseModel):
    """Schema for tenant list response"""
    tenants: List[TenantResponse] = Field(..., description="List of tenants")
    total: int = Field(..., description="Total number of tenants")
    limit: int = Field(..., description="Requested limit")
    offset: int = Field(..., description="Requested offset")

class SubscriptionUpdateResponse(BaseModel):
    """Schema for subscription update response"""
    tenant_id: str = Field(..., description="Tenant identifier")
    subscription_id: str = Field(..., description="Subscription identifier")
    new_plan: str = Field(..., description="New plan")
    status: str = Field(..., description="Update status")

class SubscriptionCancelResponse(BaseModel):
    """Schema for subscription cancellation response"""
    tenant_id: str = Field(..., description="Tenant identifier")
    subscription_id: str = Field(..., description="Subscription identifier")
    status: str = Field(..., description="Cancellation status")
    cancel_at: Optional[str] = None

class TenantStatusUpdateResponse(BaseModel):
    """Schema for tenant status update response"""
    tenant_id: str = Field(..., description="Tenant identifier")
    status: str = Field(..., description="New status")
    reason: Optional[str] = None

# Additional schemas for specific operations

class TenantFilter(BaseModel):
    """Schema for tenant filtering"""
    status: Optional[TenantStatus] = None
    plan: Optional[SubscriptionPlan] = None
    search: Optional[str] = None
    created_after: Optional[datetime] = None
    created_before: Optional[datetime] = None

class TenantBulkOperation(BaseModel):
    """Schema for bulk tenant operations"""
    tenant_ids: List[str] = Field(..., description="List of tenant IDs")
    operation: str = Field(..., description="Operation to perform")
    parameters: Optional[Dict[str, Any]] = None

class TenantExport(BaseModel):
    """Schema for tenant data export"""
    format: str = Field("json", description="Export format (json, csv, xlsx)")
    filters: Optional[TenantFilter] = None
    fields: Optional[List[str]] = None

class TenantImport(BaseModel):
    """Schema for tenant data import"""
    file_url: str = Field(..., description="URL to import file")
    format: str = Field("json", description="Import format")
    validate_only: bool = Field(False, description="Only validate without importing")
    update_existing: bool = Field(False, description="Update existing tenants")

class TenantMetrics(BaseModel):
    """Schema for tenant metrics"""
    tenant_id: str = Field(..., description="Tenant identifier")
    metrics: Dict[str, Any] = Field(..., description="Metrics data")
    timestamp: datetime = Field(..., description="Metrics timestamp")
    period: str = Field(..., description="Metrics period")

class TenantNotification(BaseModel):
    """Schema for tenant notifications"""
    tenant_id: str = Field(..., description="Tenant identifier")
    type: str = Field(..., description="Notification type")
    title: str = Field(..., description="Notification title")
    message: str = Field(..., description="Notification message")
    priority: str = Field("normal", description="Notification priority")
    data: Optional[Dict[str, Any]] = None
    scheduled_at: Optional[datetime] = None

class TenantAuditLog(BaseModel):
    """Schema for tenant audit log"""
    tenant_id: str = Field(..., description="Tenant identifier")
    user_id: Optional[str] = None
    action: str = Field(..., description="Action performed")
    resource: str = Field(..., description="Resource affected")
    details: Optional[Dict[str, Any]] = None
    timestamp: datetime = Field(..., description="Action timestamp")
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None 