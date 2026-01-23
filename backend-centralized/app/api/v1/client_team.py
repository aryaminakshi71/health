"""
Client Team Management API
Handles team member management for client accounts
"""

from fastapi import APIRouter, HTTPException, Depends, Request
from typing import Dict, Any, List, Optional
from datetime import datetime
from pydantic import BaseModel

from ...core.security import get_current_user_dev_optional
from app.core.logging import audit_logger

router = APIRouter(prefix="/client/team", tags=["Client Team Management"])

# Mock data for team members
TEAM_MEMBERS_DB = {
    "T001": {
        "id": "T001",
        "username": "john.doe",
        "email": "john.doe@techcorp.com",
        "name": "John Doe",
        "role": "manager",
        "client_id": "C001",
        "status": "active",
        "created_at": "2024-01-15T10:30:00",
        "last_login": "2024-01-27T14:30:00",
        "permissions": ["read", "write", "manage_users"],
        "department": "Engineering",
        "phone": "+1-555-0124"
    },
    "T002": {
        "id": "T002",
        "username": "jane.smith",
        "email": "jane.smith@techcorp.com",
        "name": "Jane Smith",
        "role": "user",
        "client_id": "C001",
        "status": "active",
        "created_at": "2024-01-16T11:15:00",
        "last_login": "2024-01-27T13:45:00",
        "permissions": ["read", "write"],
        "department": "Marketing",
        "phone": "+1-555-0125"
    },
    "T003": {
        "id": "T003",
        "username": "mike.wilson",
        "email": "mike.wilson@startupxyz.com",
        "name": "Mike Wilson",
        "role": "admin",
        "client_id": "C002",
        "status": "active",
        "created_at": "2024-01-20T14:15:00",
        "last_login": "2024-01-27T12:30:00",
        "permissions": ["read", "write", "manage_users", "admin"],
        "department": "Management",
        "phone": "+1-555-0457"
    }
}

class CreateTeamMemberRequest(BaseModel):
    username: str
    email: str
    name: str
    role: str = "user"
    client_id: str
    department: Optional[str] = None
    phone: Optional[str] = None
    permissions: Optional[List[str]] = None

class UpdateTeamMemberRequest(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    role: Optional[str] = None
    status: Optional[str] = None
    department: Optional[str] = None
    phone: Optional[str] = None
    permissions: Optional[List[str]] = None

@router.get("/users")
async def get_team_members(
    client_id: Optional[str] = None,
    current_user: str = Depends(get_current_user_dev_optional)
):
    """Get team members for a client"""
    try:
        if client_id:
            # Filter by client_id
            team_members = [
                member for member in TEAM_MEMBERS_DB.values() 
                if member["client_id"] == client_id
            ]
        else:
            # Return all team members
            team_members = list(TEAM_MEMBERS_DB.values())
        
        return {
            "status": "success",
            "data": team_members,
            "total": len(team_members),
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        audit_logger.error(f"Error getting team members: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get team members")

@router.post("/users")
async def add_team_member(
    member_data: CreateTeamMemberRequest,
    current_user: str = Depends(get_current_user_dev_optional)
):
    """Add a new team member"""
    try:
        # Generate new team member ID
        member_id = f"T{str(len(TEAM_MEMBERS_DB) + 1).zfill(3)}"
        
        # Set default permissions based on role
        default_permissions = {
            "admin": ["read", "write", "manage_users", "admin"],
            "manager": ["read", "write", "manage_users"],
            "user": ["read", "write"]
        }
        
        permissions = member_data.permissions or default_permissions.get(member_data.role, ["read"])
        
        # Create team member record
        new_member = {
            "id": member_id,
            "username": member_data.username,
            "email": member_data.email,
            "name": member_data.name,
            "role": member_data.role,
            "client_id": member_data.client_id,
            "status": "active",
            "created_at": datetime.now().isoformat(),
            "last_login": None,
            "permissions": permissions,
            "department": member_data.department,
            "phone": member_data.phone
        }
        
        TEAM_MEMBERS_DB[member_id] = new_member
        
        audit_logger.info(f"Client {current_user} added team member {member_id}")
        
        return {
            "status": "success",
            "data": new_member,
            "message": "Team member added successfully",
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        audit_logger.error(f"Error adding team member: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to add team member")

@router.get("/users/{member_id}")
async def get_team_member(
    member_id: str,
    current_user: str = Depends(get_current_user_dev_optional)
):
    """Get a specific team member"""
    try:
        if member_id not in TEAM_MEMBERS_DB:
            raise HTTPException(status_code=404, detail="Team member not found")
        
        return {
            "status": "success",
            "data": TEAM_MEMBERS_DB[member_id],
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        audit_logger.error(f"Error getting team member {member_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get team member")

@router.put("/users/{member_id}")
async def update_team_member(
    member_id: str,
    member_data: UpdateTeamMemberRequest,
    current_user: str = Depends(get_current_user_dev_optional)
):
    """Update a team member"""
    try:
        if member_id not in TEAM_MEMBERS_DB:
            raise HTTPException(status_code=404, detail="Team member not found")
        
        # Update member data
        for field, value in member_data.dict(exclude_unset=True).items():
            TEAM_MEMBERS_DB[member_id][field] = value
        
        TEAM_MEMBERS_DB[member_id]["updated_at"] = datetime.now().isoformat()
        
        audit_logger.info(f"Client {current_user} updated team member {member_id}")
        
        return {
            "status": "success",
            "data": TEAM_MEMBERS_DB[member_id],
            "message": "Team member updated successfully",
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        audit_logger.error(f"Error updating team member {member_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update team member")

@router.delete("/users/{member_id}")
async def remove_team_member(
    member_id: str,
    current_user: str = Depends(get_current_user_dev_optional)
):
    """Remove a team member"""
    try:
        if member_id not in TEAM_MEMBERS_DB:
            raise HTTPException(status_code=404, detail="Team member not found")
        
        deleted_member = TEAM_MEMBERS_DB.pop(member_id)
        
        audit_logger.info(f"Client {current_user} removed team member {member_id}")
        
        return {
            "status": "success",
            "message": "Team member removed successfully",
            "deleted_member": deleted_member,
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        audit_logger.error(f"Error removing team member {member_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to remove team member")

@router.get("/overview")
async def get_team_overview(
    client_id: str,
    current_user: str = Depends(get_current_user_dev_optional)
):
    """Get team overview for a client"""
    try:
        # Get team members for this client
        team_members = [
            member for member in TEAM_MEMBERS_DB.values() 
            if member["client_id"] == client_id
        ]
        
        # Calculate statistics
        total_members = len(team_members)
        active_members = len([m for m in team_members if m["status"] == "active"])
        role_distribution = {}
        
        for member in team_members:
            role = member["role"]
            role_distribution[role] = role_distribution.get(role, 0) + 1
        
        # Recent activity (mock data)
        recent_activity = [
            {
                "id": "1",
                "type": "login",
                "user": "john.doe",
                "timestamp": "2024-01-27T14:30:00",
                "description": "User logged in"
            },
            {
                "id": "2",
                "type": "message",
                "user": "jane.smith",
                "timestamp": "2024-01-27T13:45:00",
                "description": "Sent email to client"
            }
        ]
        
        return {
            "status": "success",
            "data": {
                "total_members": total_members,
                "active_members": active_members,
                "role_distribution": role_distribution,
                "recent_activity": recent_activity,
                "team_members": team_members
            },
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        audit_logger.error(f"Error getting team overview: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get team overview")
