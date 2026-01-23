"""
Client Portal API
Handles client self-service functionality
"""

import uuid
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field, EmailStr
from enum import Enum

from app.core.auth import get_current_user, get_current_user_dev_optional
import logging
audit_logger = logging.getLogger(__name__)
from app.models.client_management import Client, ClientUsage, ClientBilling
from app.services.client_management_service import ClientManagementService
from app.core.database import get_db

router = APIRouter(prefix="/client-portal", tags=["Client Portal"])

class SupportTicket(BaseModel):
    subject: str = Field(..., description="Ticket subject")
    description: str = Field(..., description="Ticket description")
    priority: str = Field(default="medium", description="Ticket priority")
    category: str = Field(default="general", description="Ticket category")

class ClientProfile(BaseModel):
    company_name: str = Field(..., description="Company name")
    contact_person: str = Field(..., description="Contact person")
    email: EmailStr = Field(..., description="Email address")
    phone: str = Field(..., description="Phone number")
    address: Optional[str] = Field(None, description="Company address")

# Mock data for development
MOCK_CLIENT_DATA = {
    "client_id": "CLIENT001",
    "company_name": "TechCorp Solutions",
    "contact_person": "John Smith",
    "email": "john@techcorp.com",
    "phone": "+1-555-0123",
    "address": "123 Business St, Tech City, TC 12345",
    "subscription_tier": "professional",
    "max_users": 25,
    "status": "active",
    "billing_cycle": "monthly",
    "monthly_cost": 99.00,
    "next_billing_date": "2024-01-01"
}

MOCK_USAGE_DATA = {
    "messages_this_month": 1234,
    "message_limit": 2000,
    "calls_this_month": 45,
    "call_limit": 100,
    "storage_used": 2.5,
    "storage_limit": 10,
    "active_users": 15,
    "total_users": 25
}

MOCK_BILLING_DATA = {
    "monthly_cost": 99.00,
    "next_billing_date": "2024-01-01",
    "subscription_status": "active",
    "payment_method": "Credit Card ending in 1234",
    "invoices": [
        {
            "id": "INV-001",
            "date": "2023-12-01",
            "amount": 99.00,
            "status": "paid"
        },
        {
            "id": "INV-002", 
            "date": "2023-11-01",
            "amount": 99.00,
            "status": "paid"
        }
    ]
}

@router.get("/profile", operation_id="client_portal_get_profile")
async def get_client_profile(
    current_user: str = Depends(get_current_user_dev_optional)
):
    """Get client profile information"""
    try:
        # In a real implementation, you would get the client ID from the current user
        # For now, return mock data
        return {
            "status": "success",
            "data": MOCK_CLIENT_DATA
        }
    except Exception as e:
        audit_logger.error(f"Error getting client profile: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get client profile")

@router.put("/profile", operation_id="client_portal_update_profile")
async def update_client_profile(
    profile_data: ClientProfile,
    current_user: str = Depends(get_current_user)
):
    """Update client profile information"""
    try:
        # In a real implementation, you would update the client profile
        # For now, just return success
        audit_logger.info(f"Client profile updated for user {current_user}")
        
        return {
            "status": "success",
            "message": "Profile updated successfully"
        }
    except Exception as e:
        audit_logger.error(f"Error updating client profile: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update client profile")

@router.get("/billing", operation_id="client_portal_get_billing")
async def get_client_billing(
    current_user: str = Depends(get_current_user_dev_optional)
):
    """Get client billing information"""
    try:
        return {
            "status": "success",
            "data": MOCK_BILLING_DATA
        }
    except Exception as e:
        audit_logger.error(f"Error getting client billing: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get client billing")

@router.get("/usage", operation_id="client_portal_get_usage")
async def get_client_usage(
    current_user: str = Depends(get_current_user_dev_optional)
):
    """Get client usage statistics"""
    try:
        return {
            "status": "success",
            "data": MOCK_USAGE_DATA
        }
    except Exception as e:
        audit_logger.error(f"Error getting client usage: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get client usage")

@router.post("/support", operation_id="client_portal_create_support_ticket")
async def create_support_ticket(
    ticket_data: SupportTicket,
    current_user: str = Depends(get_current_user)
):
    """Create a new support ticket"""
    try:
        ticket_id = f"TKT-{str(uuid.uuid4())[:8].upper()}"
        
        # In a real implementation, you would save the ticket to the database
        audit_logger.info(f"Support ticket {ticket_id} created by user {current_user}")
        
        return {
            "status": "success",
            "ticket_id": ticket_id,
            "message": "Support ticket created successfully"
        }
    except Exception as e:
        audit_logger.error(f"Error creating support ticket: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create support ticket")

@router.get("/support/tickets", operation_id="client_portal_get_support_tickets")
async def get_support_tickets(
    current_user: str = Depends(get_current_user_dev_optional)
):
    """Get client's support tickets"""
    try:
        # Mock support tickets
        tickets = [
            {
                "id": "TKT-001",
                "subject": "Integration issue",
                "status": "Open",
                "priority": "High",
                "created_at": "2023-12-15T10:30:00Z",
                "category": "Technical"
            },
            {
                "id": "TKT-002", 
                "subject": "Billing question",
                "status": "Resolved",
                "priority": "Medium",
                "created_at": "2023-12-10T14:20:00Z",
                "category": "Billing"
            }
        ]
        
        return {
            "status": "success",
            "data": tickets
        }
    except Exception as e:
        audit_logger.error(f"Error getting support tickets: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get support tickets")

@router.get("/team", operation_id="client_portal_get_team")
async def get_team_members(
    current_user: str = Depends(get_current_user_dev_optional)
):
    """Get team members for the client"""
    try:
        # Mock team members
        team_members = [
            {
                "id": "USER001",
                "name": "John Doe",
                "email": "john@company.com",
                "role": "Admin",
                "status": "Active",
                "last_active": "2023-12-15T12:00:00Z"
            },
            {
                "id": "USER002",
                "name": "Jane Smith", 
                "email": "jane@company.com",
                "role": "User",
                "status": "Active",
                "last_active": "2023-12-14T16:30:00Z"
            },
            {
                "id": "USER003",
                "name": "Mike Johnson",
                "email": "mike@company.com", 
                "role": "User",
                "status": "Inactive",
                "last_active": "2023-12-10T09:15:00Z"
            }
        ]
        
        return {
            "status": "success",
            "data": team_members
        }
    except Exception as e:
        audit_logger.error(f"Error getting team members: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get team members")

@router.post("/team", operation_id="client_portal_add_team_member")
async def add_team_member(
    member_data: Dict[str, Any],
    current_user: str = Depends(get_current_user)
):
    """Add a new team member"""
    try:
        # In a real implementation, you would add the team member
        audit_logger.info(f"Team member added by user {current_user}")
        
        return {
            "status": "success",
            "message": "Team member added successfully"
        }
    except Exception as e:
        audit_logger.error(f"Error adding team member: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to add team member")

@router.get("/notifications", operation_id="client_portal_get_notifications")
async def get_notifications(
    current_user: str = Depends(get_current_user_dev_optional)
):
    """Get client notifications"""
    try:
        # Mock notifications
        notifications = [
            {
                "id": "NOTIF001",
                "title": "System Maintenance",
                "message": "Scheduled maintenance on December 20th, 2023",
                "type": "info",
                "created_at": "2023-12-15T08:00:00Z",
                "read": False
            },
            {
                "id": "NOTIF002",
                "title": "Payment Successful",
                "message": "Your monthly payment of $99.00 has been processed",
                "type": "success", 
                "created_at": "2023-12-01T10:30:00Z",
                "read": True
            }
        ]
        
        return {
            "status": "success",
            "data": notifications
        }
    except Exception as e:
        audit_logger.error(f"Error getting notifications: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get notifications")
