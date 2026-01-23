"""
Admin Management API
Handles client management, user management, and admin operations
"""

from fastapi import APIRouter, HTTPException, Depends, Request
from typing import Optional
from datetime import datetime
from pydantic import BaseModel

from ...core.security import get_current_user_dev_optional
from app.core.logging import audit_logger

router = APIRouter(tags=["Admin Management"])

# Mock data for clients
CLIENTS_DB = {
    "C001": {
        "id": "C001",
        "name": "John Smith",
        "company": "TechCorp Solutions",
        "email": "john@techcorp.com",
        "phone": "+1-555-0123",
        "subscription_plan": "professional",
        "max_users": 25,
        "current_users": 18,
        "status": "active",
        "created_at": "2024-01-15T10:30:00",
        "address": "123 Business St, Tech City, TC 12345",
        "notes": "Enterprise client with high usage",
        "monthly_revenue": 299.00
    },
    "C002": {
        "id": "C002",
        "name": "Sarah Wilson",
        "company": "StartupXYZ",
        "email": "sarah@startupxyz.com",
        "phone": "+1-555-0456",
        "subscription_plan": "basic",
        "max_users": 10,
        "current_users": 8,
        "status": "active",
        "created_at": "2024-01-20T14:15:00",
        "address": "456 Innovation Ave, Startup City, SC 67890",
        "notes": "Growing startup, potential for upgrade",
        "monthly_revenue": 99.00
    },
    "C003": {
        "id": "C003",
        "name": "Mike Johnson",
        "company": "SmallBiz Inc",
        "email": "mike@smallbiz.com",
        "phone": "+1-555-0789",
        "subscription_plan": "basic",
        "max_users": 5,
        "current_users": 3,
        "status": "active",
        "created_at": "2024-01-25T09:45:00",
        "address": "789 Main St, Small Town, ST 11111",
        "notes": "Small business, stable usage",
        "monthly_revenue": 29.00
    }
}

# Mock data for users
USERS_DB = {
    "U001": {
        "id": "U001",
        "username": "john.smith",
        "email": "john@techcorp.com",
        "client_id": "C001",
        "role": "admin",
        "status": "active",
        "created_at": "2024-01-15T10:30:00",
        "last_login": "2024-01-27T14:30:00"
    },
    "U002": {
        "id": "U002",
        "username": "sarah.wilson",
        "email": "sarah@startupxyz.com",
        "client_id": "C002",
        "role": "admin",
        "status": "active",
        "created_at": "2024-01-20T14:15:00",
        "last_login": "2024-01-27T13:45:00"
    }
}

class CreateClientRequest(BaseModel):
    name: str
    company: str
    email: str
    phone: str
    subscription_plan: str
    max_users: int
    address: Optional[str] = None
    notes: Optional[str] = None

class UpdateClientRequest(BaseModel):
    name: Optional[str] = None
    company: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    subscription_plan: Optional[str] = None
    max_users: Optional[int] = None
    status: Optional[str] = None
    address: Optional[str] = None
    notes: Optional[str] = None

class CreateUserRequest(BaseModel):
    username: str
    email: str
    client_id: str
    role: str = "user"

@router.get("/admin/test")
async def test_endpoint():
    """Test endpoint to isolate issues"""
    return {"message": "test working", "status": "success"}

@router.get("/admin/test2")
async def test_endpoint2():
    """Test endpoint without any dependencies"""
    return {"message": "test2 working", "status": "success"}

@router.get("/admin/clients")
async def get_clients(
    current_user: str = Depends(get_current_user_dev_optional)
):
    """Get all clients"""
    try:
        clients = list(CLIENTS_DB.values())
        return {
            "status": "success",
            "data": clients,
            "total": len(clients),
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        audit_logger.error(f"Error getting clients: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get clients")

@router.post("/admin/clients")
async def create_client(
    client_data: CreateClientRequest,
    current_user: str = Depends(get_current_user_dev_optional)
):
    """Create a new client"""
    try:
        # Generate new client ID
        client_id = f"C{str(len(CLIENTS_DB) + 1).zfill(3)}"
        
        # Create client record
        new_client = {
            "id": client_id,
            "name": client_data.name,
            "company": client_data.company,
            "email": client_data.email,
            "phone": client_data.phone,
            "subscription_plan": client_data.subscription_plan,
            "max_users": client_data.max_users,
            "current_users": 0,
            "status": "active",
            "created_at": datetime.now().isoformat(),
            "address": client_data.address,
            "notes": client_data.notes,
            "monthly_revenue": 0.00
        }
        
        CLIENTS_DB[client_id] = new_client
        
        audit_logger.info(f"Admin {current_user} created client {client_id}")
        
        return {
            "status": "success",
            "data": new_client,
            "message": "Client created successfully",
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        audit_logger.error(f"Error creating client: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create client")

@router.get("/admin/clients/{client_id}")
async def get_client(
    client_id: str,
    current_user: str = Depends(get_current_user_dev_optional)
):
    """Get a specific client"""
    try:
        if client_id not in CLIENTS_DB:
            raise HTTPException(status_code=404, detail="Client not found")
        
        return {
            "status": "success",
            "data": CLIENTS_DB[client_id],
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        audit_logger.error(f"Error getting client {client_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get client")

@router.put("/admin/clients/{client_id}")
async def update_client(
    client_id: str,
    client_data: UpdateClientRequest,
    current_user: str = Depends(get_current_user_dev_optional)
):
    """Update a client"""
    try:
        if client_id not in CLIENTS_DB:
            raise HTTPException(status_code=404, detail="Client not found")
        
        # Update client data
        for field, value in client_data.model_dump(exclude_unset=True).items():
            CLIENTS_DB[client_id][field] = value
        
        CLIENTS_DB[client_id]["updated_at"] = datetime.now().isoformat()
        
        audit_logger.info(f"Admin {current_user} updated client {client_id}")
        
        return {
            "status": "success",
            "data": CLIENTS_DB[client_id],
            "message": "Client updated successfully",
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        audit_logger.error(f"Error updating client {client_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update client")

@router.delete("/admin/clients/{client_id}")
async def delete_client(
    client_id: str,
    current_user: str = Depends(get_current_user_dev_optional)
):
    """Delete a client"""
    try:
        if client_id not in CLIENTS_DB:
            raise HTTPException(status_code=404, detail="Client not found")
        
        deleted_client = CLIENTS_DB.pop(client_id)
        
        audit_logger.info(f"Admin {current_user} deleted client {client_id}")
        
        return {
            "status": "success",
            "message": "Client deleted successfully",
            "deleted_client": deleted_client,
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        audit_logger.error(f"Error deleting client {client_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to delete client")

@router.get("/admin/users")
async def get_users(
    current_user: str = Depends(get_current_user_dev_optional)
):
    """Get all users"""
    try:
        users = list(USERS_DB.values())
        return {
            "status": "success",
            "data": users,
            "total": len(users),
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        audit_logger.error(f"Error getting users: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get users")

@router.post("/admin/users")
async def create_user(
    user_data: CreateUserRequest,
    current_user: str = Depends(get_current_user_dev_optional)
):
    """Create a new user"""
    try:
        # Generate new user ID
        user_id = f"U{str(len(USERS_DB) + 1).zfill(3)}"
        
        # Create user record
        new_user = {
            "id": user_id,
            "username": user_data.username,
            "email": user_data.email,
            "client_id": user_data.client_id,
            "role": user_data.role,
            "status": "active",
            "created_at": datetime.now().isoformat(),
            "last_login": None
        }
        
        USERS_DB[user_id] = new_user
        
        audit_logger.info(f"Admin {current_user} created user {user_id}")
        
        return {
            "status": "success",
            "data": new_user,
            "message": "User created successfully",
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        audit_logger.error(f"Error creating user: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create user")
