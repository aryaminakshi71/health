"""
Client Management API
Handles client accounts, subscriptions, billing, and usage tracking
"""

import uuid
import asyncio
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from pydantic import BaseModel, Field, EmailStr
from enum import Enum

from app.core.auth import get_current_user, get_current_user_dev_optional
# Simple logging for development
import logging
audit_logger = logging.getLogger(__name__)

router = APIRouter(prefix="/client-management", tags=["Client Management"])

@router.get("/dashboard", operation_id="client_management_get_dashboard")
async def get_client_dashboard(
    current_user: str = Depends(get_current_user_dev_optional)
):
    """Get client management dashboard data (Admin only)"""
    try:
        audit_logger.info(f"User {current_user} retrieved client management dashboard")
        
        dashboard_data = {
            "role": "admin",
            "overview": {
                "total_users": 93,
                "active_clients": 4,
                "system_uptime": 99.9,
                "total_revenue": 57000,
                "active_connections": 89,
                "pending_alerts": 3
            },
            "recent_activity": [
                {
                    "id": 1,
                    "type": "client_onboarded",
                    "user": "TechCorp Inc",
                    "time": "2 minutes ago",
                    "status": "success"
                }
            ],
            "quick_actions": [
                {"name": "Client Management", "href": "/admin/client-management", "icon": "users"}
            ]
        }
        
        return {
            "status": "success",
            "data": dashboard_data,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        audit_logger.error(f"Error getting client management dashboard: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get client management dashboard")

# Mock database for demonstration
CLIENTS_DB = []

CLIENT_USERS_DB = [
    {
        "id": 1,
        "username": "admin",
        "email": "admin@example.com",
        "role": "admin",
        "status": "active",
        "last_login": "2024-01-27T14:30:00",
        "client_id": None,
        "created_at": "2024-01-01T00:00:00"
    },
    {
        "id": 2,
        "username": "client1",
        "email": "client1@example.com",
        "role": "client",
        "status": "active",
        "last_login": "2024-01-27T12:15:00",
        "client_id": "C001",
        "created_at": "2024-01-15T00:00:00"
    },
    {
        "id": 3,
        "username": "user1",
        "email": "user1@example.com",
        "role": "user",
        "status": "active",
        "last_login": "2024-01-27T10:45:00",
        "client_id": "C001",
        "created_at": "2024-01-20T00:00:00"
    },
    {
        "id": 4,
        "username": "client2",
        "email": "client2@example.com",
        "role": "client",
        "status": "inactive",
        "last_login": "2024-01-25T16:20:00",
        "client_id": "C002",
        "created_at": "2024-01-10T00:00:00"
    }
]

CLIENT_TEAM_DB = [
    {
        "id": 1,
        "name": "John Doe",
        "email": "john.doe@company.com",
        "role": "Manager",
        "department": "Sales",
        "status": "active",
        "last_active": "2024-01-27T14:30:00",
        "phone": "+1-555-0123",
        "avatar": "https://ui-avatars.com/api/?name=John+Doe"
    },
    {
        "id": 2,
        "name": "Jane Smith",
        "email": "jane.smith@company.com",
        "role": "Developer",
        "department": "Engineering",
        "status": "active",
        "last_active": "2024-01-27T12:15:00",
        "phone": "+1-555-0456",
        "avatar": "https://ui-avatars.com/api/?name=Jane+Smith"
    },
    {
        "id": 3,
        "name": "Mike Johnson",
        "email": "mike.johnson@company.com",
        "role": "Support",
        "department": "Customer Service",
        "status": "active",
        "last_active": "2024-01-27T10:45:00",
        "phone": "+1-555-0789",
        "avatar": "https://ui-avatars.com/api/?name=Mike+Johnson"
    }
]

CLIENT_USAGE_DB = []
CLIENT_BILLING_DB = []

class SubscriptionTier(str, Enum):
    BASIC = "basic"
    PROFESSIONAL = "professional"
    ENTERPRISE = "enterprise"

class ClientStatus(str, Enum):
    ACTIVE = "active"
    SUSPENDED = "suspended"
    PENDING = "pending"
    CANCELLED = "cancelled"

class BillingCycle(str, Enum):
    MONTHLY = "monthly"
    QUARTERLY = "quarterly"
    YEARLY = "yearly"

class ClientCreate(BaseModel):
    company_name: str = Field(..., description="Company name")
    email: EmailStr = Field(..., description="Primary email address")
    phone: str = Field(..., description="Phone number")
    contact_person: str = Field(..., description="Primary contact person")
    address: str = Field(..., description="Company address")
    subscription_tier: SubscriptionTier = Field(default=SubscriptionTier.BASIC, description="Subscription plan")
    max_users: int = Field(default=5, description="Maximum number of users")
    billing_cycle: BillingCycle = Field(default=BillingCycle.MONTHLY, description="Billing frequency")
    custom_domain: Optional[str] = Field(None, description="Custom domain for white-label")
    notes: Optional[str] = Field(None, description="Additional notes")

class ClientUpdate(BaseModel):
    company_name: Optional[str] = Field(None, description="Company name")
    email: Optional[EmailStr] = Field(None, description="Primary email address")
    phone: Optional[str] = Field(None, description="Phone number")
    contact_person: Optional[str] = Field(None, description="Primary contact person")
    address: Optional[str] = Field(None, description="Company address")
    subscription_tier: Optional[SubscriptionTier] = Field(None, description="Subscription plan")
    max_users: Optional[int] = Field(None, description="Maximum number of users")
    billing_cycle: Optional[BillingCycle] = Field(None, description="Billing frequency")
    status: Optional[ClientStatus] = Field(None, description="Client status")
    custom_domain: Optional[str] = Field(None, description="Custom domain for white-label")
    notes: Optional[str] = Field(None, description="Additional notes")

class ClientResponse(BaseModel):
    id: str
    company_name: str
    email: str
    phone: str
    contact_person: str
    address: str
    subscription_tier: SubscriptionTier
    max_users: int
    current_users: int
    billing_cycle: BillingCycle
    status: ClientStatus
    custom_domain: Optional[str]
    notes: Optional[str]
    monthly_revenue: float
    next_billing_date: str
    created_at: str
    updated_at: str
    usage_stats: Dict[str, int]

class UsageStats(BaseModel):
    client_id: str
    date: str
    calls: int = 0
    emails: int = 0
    sms: int = 0
    whatsapp: int = 0
    telegram: int = 0
    slack: int = 0
    discord: int = 0
    fax: int = 0
    total_cost: float = 0.0

class BillingRecord(BaseModel):
    id: str
    client_id: str
    amount: float
    currency: str = "USD"
    billing_cycle: BillingCycle
    status: str  # pending, paid, failed, refunded
    due_date: str
    paid_date: Optional[str]
    invoice_url: Optional[str]
    created_at: str

# Initialize mock data
def initialize_mock_data():
    if not CLIENTS_DB:
        clients = [
            {
                "id": "C001",
                "company_name": "TechCorp Solutions",
                "email": "admin@techcorp.com",
                "phone": "+1-555-0123",
                "contact_person": "John Smith",
                "address": "123 Business St, Tech City, TC 12345",
                "subscription_tier": SubscriptionTier.ENTERPRISE,
                "max_users": 50,
                "current_users": 23,
                "billing_cycle": BillingCycle.MONTHLY,
                "status": ClientStatus.ACTIVE,
                "custom_domain": "comm.techcorp.com",
                "notes": "Enterprise client with custom integrations",
                "monthly_revenue": 299.0,
                "next_billing_date": (datetime.now() + timedelta(days=30)).isoformat().split('T')[0],
                "created_at": "2024-01-15T10:00:00Z",
                "updated_at": "2024-01-15T10:00:00Z"
            },
            {
                "id": "C002",
                "company_name": "StartupXYZ",
                "email": "hello@startupxyz.com",
                "phone": "+1-555-0456",
                "contact_person": "Jane Doe",
                "address": "456 Innovation Ave, Startup City, SC 67890",
                "subscription_tier": SubscriptionTier.PROFESSIONAL,
                "max_users": 25,
                "current_users": 12,
                "billing_cycle": BillingCycle.MONTHLY,
                "status": ClientStatus.ACTIVE,
                "custom_domain": None,
                "notes": "Growing startup, may upgrade soon",
                "monthly_revenue": 99.0,
                "next_billing_date": (datetime.now() + timedelta(days=30)).isoformat().split('T')[0],
                "created_at": "2024-01-20T14:30:00Z",
                "updated_at": "2024-01-20T14:30:00Z"
            },
            {
                "id": "C003",
                "company_name": "SmallBiz Inc",
                "email": "info@smallbiz.com",
                "phone": "+1-555-0789",
                "contact_person": "Mike Johnson",
                "address": "789 Main St, Small Town, ST 11111",
                "subscription_tier": SubscriptionTier.BASIC,
                "max_users": 5,
                "current_users": 3,
                "billing_cycle": BillingCycle.MONTHLY,
                "status": ClientStatus.ACTIVE,
                "custom_domain": None,
                "notes": "Small business, basic needs",
                "monthly_revenue": 29.0,
                "next_billing_date": (datetime.now() + timedelta(days=30)).isoformat().split('T')[0],
                "created_at": "2024-01-25T09:15:00Z",
                "updated_at": "2024-01-25T09:15:00Z"
            }
        ]
        CLIENTS_DB.extend(clients)

    if not CLIENT_USERS_DB:
        users = [
            {
                "id": 1,
                "username": "admin",
                "email": "admin@example.com",
                "role": "admin",
                "status": "active",
                "last_login": "2024-01-27T14:30:00",
                "client_id": None,
                "created_at": "2024-01-01T00:00:00"
            },
            {
                "id": 2,
                "username": "client1",
                "email": "client1@example.com",
                "role": "client",
                "status": "active",
                "last_login": "2024-01-27T12:15:00",
                "client_id": "C001",
                "created_at": "2024-01-15T00:00:00"
            },
            {
                "id": 3,
                "username": "user1",
                "email": "user1@example.com",
                "role": "user",
                "status": "active",
                "last_login": "2024-01-27T10:45:00",
                "client_id": "C001",
                "created_at": "2024-01-20T00:00:00"
            },
            {
                "id": 4,
                "username": "client2",
                "email": "client2@example.com",
                "role": "client",
                "status": "inactive",
                "last_login": "2024-01-25T16:20:00",
                "client_id": "C002",
                "created_at": "2024-01-10T00:00:00"
            }
        ]
        CLIENT_USERS_DB.extend(users)

    if not CLIENT_TEAM_DB:
        team = [
            {
                "id": 1,
                "name": "John Doe",
                "email": "john.doe@company.com",
                "role": "Manager",
                "department": "Sales",
                "status": "active",
                "last_active": "2024-01-27T14:30:00",
                "phone": "+1-555-0123",
                "avatar": "https://ui-avatars.com/api/?name=John+Doe"
            },
            {
                "id": 2,
                "name": "Jane Smith",
                "email": "jane.smith@company.com",
                "role": "Developer",
                "department": "Engineering",
                "status": "active",
                "last_active": "2024-01-27T12:15:00",
                "phone": "+1-555-0456",
                "avatar": "https://ui-avatars.com/api/?name=Jane+Smith"
            },
            {
                "id": 3,
                "name": "Mike Johnson",
                "email": "mike.johnson@company.com",
                "role": "Support",
                "department": "Customer Service",
                "status": "active",
                "last_active": "2024-01-27T10:45:00",
                "phone": "+1-555-0789",
                "avatar": "https://ui-avatars.com/api/?name=Mike+Johnson"
            }
        ]
        CLIENT_TEAM_DB.extend(team)

    if not CLIENT_USAGE_DB:
        usage_data = [
            {
                "client_id": "C001",
                "date": datetime.now().strftime("%Y-%m-%d"),
                "calls": 1250,
                "emails": 3400,
                "sms": 890,
                "whatsapp": 450,
                "telegram": 230,
                "slack": 180,
                "discord": 95,
                "fax": 45,
                "total_cost": 45.50
            },
            {
                "client_id": "C002",
                "date": datetime.now().strftime("%Y-%m-%d"),
                "calls": 450,
                "emails": 1200,
                "sms": 300,
                "whatsapp": 180,
                "telegram": 90,
                "slack": 75,
                "discord": 40,
                "fax": 15,
                "total_cost": 18.75
            },
            {
                "client_id": "C003",
                "date": datetime.now().strftime("%Y-%m-%d"),
                "calls": 120,
                "emails": 400,
                "sms": 80,
                "whatsapp": 45,
                "telegram": 25,
                "slack": 20,
                "discord": 10,
                "fax": 5,
                "total_cost": 5.20
            }
        ]
        CLIENT_USAGE_DB.extend(usage_data)

    if not CLIENT_BILLING_DB:
        billing_data = [
            {
                "id": "B001",
                "client_id": "C001",
                "amount": 299.0,
                "currency": "USD",
                "billing_cycle": BillingCycle.MONTHLY,
                "status": "paid",
                "due_date": "2024-01-27",
                "paid_date": "2024-01-25",
                "invoice_url": "https://billing.example.com/invoice/B001",
                "created_at": "2024-01-01T00:00:00Z"
            },
            {
                "id": "B002",
                "client_id": "C002",
                "amount": 99.0,
                "currency": "USD",
                "billing_cycle": BillingCycle.MONTHLY,
                "status": "paid",
                "due_date": "2024-01-27",
                "paid_date": "2024-01-26",
                "invoice_url": "https://billing.example.com/invoice/B002",
                "created_at": "2024-01-01T00:00:00Z"
            },
            {
                "id": "B003",
                "client_id": "C003",
                "amount": 29.0,
                "currency": "USD",
                "billing_cycle": BillingCycle.MONTHLY,
                "status": "pending",
                "due_date": "2024-01-27",
                "paid_date": None,
                "invoice_url": "https://billing.example.com/invoice/B003",
                "created_at": "2024-01-01T00:00:00Z"
            }
        ]
        CLIENT_BILLING_DB.extend(billing_data)

# Initialize data on module load
initialize_mock_data()

def get_subscription_pricing(tier: SubscriptionTier) -> float:
    """Get monthly pricing for subscription tier"""
    pricing = {
        SubscriptionTier.BASIC: 29.0,
        SubscriptionTier.PROFESSIONAL: 99.0,
        SubscriptionTier.ENTERPRISE: 299.0
    }
    return pricing.get(tier, 29.0)

def calculate_next_billing_date(billing_cycle: BillingCycle) -> str:
    """Calculate next billing date based on billing cycle"""
    now = datetime.now()
    if billing_cycle == BillingCycle.MONTHLY:
        next_date = now + timedelta(days=30)
    elif billing_cycle == BillingCycle.QUARTERLY:
        next_date = now + timedelta(days=90)
    elif billing_cycle == BillingCycle.YEARLY:
        next_date = now + timedelta(days=365)
    else:
        next_date = now + timedelta(days=30)
    
    return next_date.isoformat().split('T')[0]

@router.get("/clients", operation_id="client_management_get_clients")
async def get_clients(
    search: Optional[str] = None,
    status: Optional[ClientStatus] = None,
    subscription_tier: Optional[SubscriptionTier] = None,
    limit: int = 50,
    offset: int = 0,
    current_user: str = Depends(get_current_user_dev_optional)
):
    """Get all clients with optional filtering"""
    try:
        filtered_clients = CLIENTS_DB.copy()
        
        # Apply filters
        if search:
            search_lower = search.lower()
            filtered_clients = [
                client for client in filtered_clients
                if (search_lower in client["company_name"].lower() or
                    search_lower in client["email"].lower() or
                    search_lower in client["contact_person"].lower())
            ]
        
        if status:
            filtered_clients = [client for client in filtered_clients if client["status"] == status]
        
        if subscription_tier:
            filtered_clients = [client for client in filtered_clients if client["subscription_tier"] == subscription_tier]
        
        # Apply pagination
        total_count = len(filtered_clients)
        paginated_clients = filtered_clients[offset:offset + limit]
        
        # Add usage stats to each client
        for client in paginated_clients:
            usage = next((u for u in CLIENT_USAGE_DB if u["client_id"] == client["id"]), {})
            client["usage_stats"] = {
                "calls": usage.get("calls", 0),
                "emails": usage.get("emails", 0),
                "sms": usage.get("sms", 0),
                "whatsapp": usage.get("whatsapp", 0),
                "telegram": usage.get("telegram", 0),
                "slack": usage.get("slack", 0),
                "discord": usage.get("discord", 0),
                "fax": usage.get("fax", 0)
            }
        
        audit_logger.info(f"User {current_user} retrieved {len(paginated_clients)} clients")
        
        return {
            "status": "success",
            "data": paginated_clients,
            "total": total_count,
            "limit": limit,
            "offset": offset,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        audit_logger.error(f"Error getting clients: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get clients")

@router.get("/clients/{client_id}", operation_id="client_management_get_client")
async def get_client(
    client_id: str,
    current_user: str = Depends(get_current_user_dev_optional)
):
    """Get a specific client by ID"""
    try:
        client = next((c for c in CLIENTS_DB if c["id"] == client_id), None)
        if not client:
            raise HTTPException(status_code=404, detail="Client not found")
        
        # Add usage stats
        usage = next((u for u in CLIENT_USAGE_DB if u["client_id"] == client_id), {})
        client["usage_stats"] = {
            "calls": usage.get("calls", 0),
            "emails": usage.get("emails", 0),
            "sms": usage.get("sms", 0),
            "whatsapp": usage.get("whatsapp", 0),
            "telegram": usage.get("telegram", 0),
            "slack": usage.get("slack", 0),
            "discord": usage.get("discord", 0),
            "fax": usage.get("fax", 0)
        }
        
        audit_logger.info(f"User {current_user} retrieved client {client_id}")
        
        return {
            "status": "success",
            "data": client,
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        audit_logger.error(f"Error getting client {client_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get client")

@router.post("/clients", operation_id="client_management_create_client")
async def create_client(
    client_data: ClientCreate,
    background_tasks: BackgroundTasks,
    current_user: str = Depends(get_current_user)
):
    """Create a new client account"""
    try:
        # Check if email already exists
        if any(c["email"] == client_data.email for c in CLIENTS_DB):
            raise HTTPException(status_code=400, detail="Client with this email already exists")
        
        # Generate client ID
        client_id = f"C{str(uuid.uuid4())[:8].upper()}"
        
        # Calculate pricing and billing
        monthly_revenue = get_subscription_pricing(client_data.subscription_tier)
        next_billing_date = calculate_next_billing_date(client_data.billing_cycle)
        
        # Create client record
        new_client = {
            "id": client_id,
            "company_name": client_data.company_name,
            "email": client_data.email,
            "phone": client_data.phone,
            "contact_person": client_data.contact_person,
            "address": client_data.address,
            "subscription_tier": client_data.subscription_tier,
            "max_users": client_data.max_users,
            "current_users": 0,
            "billing_cycle": client_data.billing_cycle,
            "status": ClientStatus.ACTIVE,
            "custom_domain": client_data.custom_domain,
            "notes": client_data.notes,
            "monthly_revenue": monthly_revenue,
            "next_billing_date": next_billing_date,
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        }
        
        CLIENTS_DB.append(new_client)
        
        # Initialize usage tracking
        new_usage = {
            "client_id": client_id,
            "date": datetime.now().strftime("%Y-%m-%d"),
            "calls": 0,
            "emails": 0,
            "sms": 0,
            "whatsapp": 0,
            "telegram": 0,
            "slack": 0,
            "discord": 0,
            "fax": 0,
            "total_cost": 0.0
        }
        CLIENT_USAGE_DB.append(new_usage)
        
        # Create initial billing record
        new_billing = {
            "id": f"B{str(uuid.uuid4())[:8].upper()}",
            "client_id": client_id,
            "amount": monthly_revenue,
            "currency": "USD",
            "billing_cycle": client_data.billing_cycle,
            "status": "pending",
            "due_date": next_billing_date,
            "paid_date": None,
            "invoice_url": f"https://billing.example.com/invoice/{client_id}",
            "created_at": datetime.now().isoformat()
        }
        CLIENT_BILLING_DB.append(new_billing)
        
        # Add background task for welcome email
        background_tasks.add_task(send_welcome_email, client_id, client_data.email)
        
        audit_logger.info(f"User {current_user} created client {client_id}")
        
        return {
            "status": "success",
            "data": new_client,
            "message": "Client created successfully",
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        audit_logger.error(f"Error creating client: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create client")

@router.put("/clients/{client_id}", operation_id="client_management_update_client")
async def update_client(
    client_id: str,
    client_data: ClientUpdate,
    current_user: str = Depends(get_current_user)
):
    """Update an existing client"""
    try:
        client_index = next((i for i, c in enumerate(CLIENTS_DB) if c["id"] == client_id), None)
        if client_index is None:
            raise HTTPException(status_code=404, detail="Client not found")
        
        client = CLIENTS_DB[client_index]
        
        # Update fields if provided
        update_data = client_data.dict(exclude_unset=True)
        
        # Check email uniqueness if being updated
        if "email" in update_data:
            if any(c["email"] == update_data["email"] and c["id"] != client_id for c in CLIENTS_DB):
                raise HTTPException(status_code=400, detail="Email already in use by another client")
        
        # Update pricing if subscription tier changes
        if "subscription_tier" in update_data:
            update_data["monthly_revenue"] = get_subscription_pricing(update_data["subscription_tier"])
        
        # Update billing date if billing cycle changes
        if "billing_cycle" in update_data:
            update_data["next_billing_date"] = calculate_next_billing_date(update_data["billing_cycle"])
        
        # Update the client
        for key, value in update_data.items():
            client[key] = value
        
        client["updated_at"] = datetime.now().isoformat()
        
        audit_logger.info(f"User {current_user} updated client {client_id}")
        
        return {
            "status": "success",
            "data": client,
            "message": "Client updated successfully",
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        audit_logger.error(f"Error updating client {client_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update client")

@router.delete("/clients/{client_id}", operation_id="client_management_delete_client")
async def delete_client(
    client_id: str,
    current_user: str = Depends(get_current_user)
):
    """Delete a client account"""
    try:
        client = next((c for c in CLIENTS_DB if c["id"] == client_id), None)
        if not client:
            raise HTTPException(status_code=404, detail="Client not found")
        
        # Soft delete - change status to cancelled
        client["status"] = ClientStatus.CANCELLED
        client["updated_at"] = datetime.now().isoformat()
        
        audit_logger.info(f"User {current_user} cancelled client {client_id}")
        
        return {
            "status": "success",
            "message": "Client cancelled successfully",
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        audit_logger.error(f"Error cancelling client {client_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to cancel client")

@router.get("/clients/{client_id}/usage", operation_id="client_management_get_usage")
async def get_client_usage(
    client_id: str,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    current_user: str = Depends(get_current_user_dev_optional)
):
    """Get usage statistics for a client"""
    try:
        client = next((c for c in CLIENTS_DB if c["id"] == client_id), None)
        if not client:
            raise HTTPException(status_code=404, detail="Client not found")
        
        # Get usage data
        usage_data = [u for u in CLIENT_USAGE_DB if u["client_id"] == client_id]
        
        # Filter by date range if provided
        if start_date:
            usage_data = [u for u in usage_data if u["date"] >= start_date]
        if end_date:
            usage_data = [u for u in usage_data if u["date"] <= end_date]
        
        audit_logger.info(f"User {current_user} retrieved usage for client {client_id}")
        
        return {
            "status": "success",
            "data": {
                "client_id": client_id,
                "usage_data": usage_data,
                "total_usage": {
                    "calls": sum(u.get("calls", 0) for u in usage_data),
                    "emails": sum(u.get("emails", 0) for u in usage_data),
                    "sms": sum(u.get("sms", 0) for u in usage_data),
                    "whatsapp": sum(u.get("whatsapp", 0) for u in usage_data),
                    "telegram": sum(u.get("telegram", 0) for u in usage_data),
                    "slack": sum(u.get("slack", 0) for u in usage_data),
                    "discord": sum(u.get("discord", 0) for u in usage_data),
                    "fax": sum(u.get("fax", 0) for u in usage_data),
                    "total_cost": sum(u.get("total_cost", 0) for u in usage_data)
                }
            },
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        audit_logger.error(f"Error getting usage for client {client_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get client usage")

@router.get("/clients/{client_id}/billing", operation_id="client_management_get_billing")
async def get_client_billing(
    client_id: str,
    current_user: str = Depends(get_current_user_dev_optional)
):
    """Get billing history for a client"""
    try:
        client = next((c for c in CLIENTS_DB if c["id"] == client_id), None)
        if not client:
            raise HTTPException(status_code=404, detail="Client not found")
        
        billing_data = [b for b in CLIENT_BILLING_DB if b["client_id"] == client_id]
        
        audit_logger.info(f"User {current_user} retrieved billing for client {client_id}")
        
        return {
            "status": "success",
            "data": {
                "client_id": client_id,
                "billing_history": billing_data,
                "total_billed": sum(b["amount"] for b in billing_data),
                "total_paid": sum(b["amount"] for b in billing_data if b["status"] == "paid"),
                "outstanding": sum(b["amount"] for b in billing_data if b["status"] == "pending")
            },
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        audit_logger.error(f"Error getting billing for client {client_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get client billing")

@router.get("/analytics", operation_id="client_management_get_analytics")
async def get_client_analytics(
    current_user: str = Depends(get_current_user_dev_optional)
):
    """Get overall client management analytics"""
    try:
        total_clients = len(CLIENTS_DB)
        active_clients = len([c for c in CLIENTS_DB if c["status"] == ClientStatus.ACTIVE])
        total_revenue = sum(c["monthly_revenue"] for c in CLIENTS_DB if c["status"] == ClientStatus.ACTIVE)
        
        # Subscription tier breakdown
        tier_breakdown = {}
        for tier in SubscriptionTier:
            tier_breakdown[tier.value] = len([c for c in CLIENTS_DB if c["subscription_tier"] == tier])
        
        # Recent activity
        recent_clients = sorted(CLIENTS_DB, key=lambda x: x["created_at"], reverse=True)[:5]
        
        audit_logger.info(f"User {current_user} retrieved client analytics")
        
        return {
            "status": "success",
            "data": {
                "total_clients": total_clients,
                "active_clients": active_clients,
                "total_monthly_revenue": total_revenue,
                "average_revenue_per_client": total_revenue / active_clients if active_clients > 0 else 0,
                "subscription_breakdown": tier_breakdown,
                "recent_clients": recent_clients,
                "status_breakdown": {
                    "active": len([c for c in CLIENTS_DB if c["status"] == ClientStatus.ACTIVE]),
                    "suspended": len([c for c in CLIENTS_DB if c["status"] == ClientStatus.SUSPENDED]),
                    "pending": len([c for c in CLIENTS_DB if c["status"] == ClientStatus.PENDING]),
                    "cancelled": len([c for c in CLIENTS_DB if c["status"] == ClientStatus.CANCELLED])
                }
            },
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        audit_logger.error(f"Error getting client analytics: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get client analytics")

async def send_welcome_email(client_id: str, email: str):
    """Send welcome email to new client (background task)"""
    await asyncio.sleep(1)  # Simulate email sending
    audit_logger.info(f"Welcome email sent to {email} for client {client_id}")

@router.post("/clients/{client_id}/suspend", operation_id="client_management_suspend_client")
async def suspend_client(
    client_id: str,
    reason: Optional[str] = None,
    current_user: str = Depends(get_current_user)
):
    """Suspend a client account"""
    try:
        client = next((c for c in CLIENTS_DB if c["id"] == client_id), None)
        if not client:
            raise HTTPException(status_code=404, detail="Client not found")
        
        client["status"] = ClientStatus.SUSPENDED
        client["updated_at"] = datetime.now().isoformat()
        
        audit_logger.info(f"User {current_user} suspended client {client_id}. Reason: {reason}")
        
        return {
            "status": "success",
            "message": "Client suspended successfully",
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        audit_logger.error(f"Error suspending client {client_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to suspend client")

@router.post("/clients/{client_id}/activate", operation_id="client_management_activate_client")
async def activate_client(
    client_id: str,
    current_user: str = Depends(get_current_user)
):
    """Activate a suspended client account"""
    try:
        client = next((c for c in CLIENTS_DB if c["id"] == client_id), None)
        if not client:
            raise HTTPException(status_code=404, detail="Client not found")
        
        client["status"] = ClientStatus.ACTIVE
        client["updated_at"] = datetime.now().isoformat()
        
        audit_logger.info(f"User {current_user} activated client {client_id}")
        
        return {
            "status": "success",
            "message": "Client activated successfully",
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        audit_logger.error(f"Error activating client {client_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to activate client")

@router.get("/users", operation_id="client_management_get_users")
async def get_users(
    current_user: str = Depends(get_current_user_dev_optional)
):
    """Get all users (Admin only)"""
    try:
        audit_logger.info(f"User {current_user} retrieved users list")
        
        return {
            "status": "success",
            "data": CLIENT_USERS_DB,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        audit_logger.error(f"Error getting users: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get users")

@router.get("/team", operation_id="client_management_get_team")
async def get_team(
    current_user: str = Depends(get_current_user_dev_optional)
):
    """Get team members (Client only)"""
    try:
        audit_logger.info(f"User {current_user} retrieved team list")
        
        return {
            "status": "success",
            "data": CLIENT_TEAM_DB,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        audit_logger.error(f"Error getting team: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get team")


