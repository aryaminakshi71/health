"""
Role-based API endpoints
Provides different data and functionality based on user role
"""

from fastapi import APIRouter, Depends, HTTPException
from typing import Dict, Any, List
from datetime import datetime

from app.core.auth import get_current_user, require_admin, require_client_access
from app.core.logging import audit_logger

router = APIRouter()

@router.get("/dashboard-data")
async def get_dashboard_data(current_user: str = Depends(get_current_user)):
    """Get dashboard data based on user role"""
    try:
        # Get user role from token
        user_role = current_user.role
        
        if user_role == "admin":
            return get_admin_dashboard_data()
        elif user_role == "client":
            return get_client_dashboard_data(current_user)
        elif user_role == "user":
            return get_user_dashboard_data(current_user)
        else:
            raise HTTPException(status_code=400, detail="Invalid user role")
            
    except Exception as e:
        audit_logger.error(f"Error getting dashboard data for user {getattr(current_user, 'username', 'unknown')}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get dashboard data")

@router.get("/admin/dashboard-data")
async def get_admin_dashboard_data_endpoint(current_user: str = Depends(require_admin)):
    """Admin-specific dashboard data"""
    return get_admin_dashboard_data()

@router.get("/client/dashboard-data")
async def get_client_dashboard_data_endpoint(current_user: str = Depends(require_client_access)):
    """Client-specific dashboard data"""
    return get_client_dashboard_data(current_user)

@router.get("/user/dashboard-data")
async def get_user_dashboard_data_endpoint(current_user: str = Depends(get_current_user)):
    """User-specific dashboard data"""
    return get_user_dashboard_data(current_user)

@router.get("/test")
async def test_endpoint():
    """Simple test endpoint"""
    return {"message": "Role-based API is working", "status": "success"}

@router.get("/permissions")
async def get_user_permissions(current_user: str = Depends(get_current_user)):
    """Get user permissions based on role"""
    return {"role": "admin", "status": "working"}

def get_admin_dashboard_data() -> Dict[str, Any]:
    """Get admin dashboard data"""
    return {
        "role": "admin",
        "overview": {
            "total_users": 1247,
            "active_clients": 45,
            "system_uptime": 99.9,
            "total_revenue": 125000,
            "active_connections": 89,
            "pending_alerts": 3
        },
        "recent_activity": [
            {"id": 1, "type": "user_login", "user": "john.doe@company.com", "time": "2 minutes ago", "status": "success"},
            {"id": 2, "type": "client_onboarded", "user": "TechCorp Inc", "time": "15 minutes ago", "status": "success"},
            {"id": 3, "type": "system_alert", "user": "Database Backup", "time": "1 hour ago", "status": "warning"},
            {"id": 4, "type": "payment_received", "user": "Enterprise Solutions", "time": "2 hours ago", "status": "success"},
            {"id": 5, "type": "security_alert", "user": "Failed Login Attempt", "time": "3 hours ago", "status": "error"}
        ],
        "system_metrics": {
            "cpu_usage": 89,
            "memory_usage": 67,
            "disk_usage": 45,
            "avg_response_time": 1.2
        },
        "quick_actions": [
            {"name": "Add New Client", "href": "/admin/client-management", "icon": "users"},
            {"name": "System Monitoring", "href": "/admin/monitoring", "icon": "server"},
            {"name": "User Management", "href": "/admin/users", "icon": "users"},
            {"name": "Billing Overview", "href": "/admin/billing", "icon": "dollar-sign"},
            {"name": "Security Settings", "href": "/admin/security", "icon": "shield"},
            {"name": "System Analytics", "href": "/admin/analytics", "icon": "bar-chart"}
        ]
    }

def get_client_dashboard_data(current_user) -> Dict[str, Any]:
    """Get client dashboard data"""
    return {
        "role": "client",
        "overview": {
            "total_team_members": 12,
            "active_communications": 234,
            "total_contacts": 1247,
            "monthly_revenue": 45000,
            "campaign_success": 87.5,
            "customer_satisfaction": 4.8
        },
        "recent_communications": [
            {"id": 1, "type": "email", "contact": "john.smith@client.com", "subject": "Project Update", "time": "5 minutes ago", "status": "sent"},
            {"id": 2, "type": "sms", "contact": "+1-555-0123", "subject": "Meeting reminder", "time": "12 minutes ago", "status": "delivered"},
            {"id": 3, "type": "call", "contact": "Sarah Johnson", "subject": "Client call", "time": "25 minutes ago", "status": "completed"},
            {"id": 4, "type": "whatsapp", "contact": "Tech Support", "subject": "Daily standup", "time": "1 hour ago", "status": "sent"},
            {"id": 5, "type": "email", "contact": "marketing@company.com", "subject": "Campaign results", "time": "2 hours ago", "status": "sent"}
        ],
        "team_activity": [
            {"id": 1, "user": "John Doe", "action": "Sent email campaign", "time": "10 minutes ago", "avatar": "JD"},
            {"id": 2, "user": "Jane Smith", "action": "Made 5 calls", "time": "30 minutes ago", "avatar": "JS"},
            {"id": 3, "user": "Mike Johnson", "action": "Updated contacts", "time": "1 hour ago", "avatar": "MJ"},
            {"id": 4, "user": "Sarah Wilson", "action": "Created report", "time": "2 hours ago", "avatar": "SW"}
        ],
        "performance_metrics": {
            "campaign_success_rate": 87.5,
            "customer_satisfaction": 4.8,
            "response_time": "2.3 minutes",
            "conversion_rate": 12.5
        },
        "quick_actions": [
            {"name": "Send Email Campaign", "href": "/client/email", "icon": "mail"},
            {"name": "Make Calls", "href": "/client/voice", "icon": "phone"},
            {"name": "Manage Team", "href": "/client/team", "icon": "users"},
            {"name": "View Analytics", "href": "/client/analytics", "icon": "bar-chart"},
            {"name": "Add Contacts", "href": "/client/contacts", "icon": "users"},
            {"name": "Create Report", "href": "/client/reports", "icon": "file-text"}
        ]
    }

def get_user_dashboard_data(current_user) -> Dict[str, Any]:
    """Get user dashboard data"""
    return {
        "role": "user",
        "overview": {
            "total_contacts": 156,
            "recent_messages": 8,
            "upcoming_calls": 3,
            "completed_tasks": 12,
            "productivity_score": 87,
            "communication_streak": 5
        },
        "recent_messages": [
            {"id": 1, "type": "email", "contact": "john.smith@company.com", "subject": "Project Update", "time": "5 minutes ago", "status": "unread"},
            {"id": 2, "type": "sms", "contact": "Sarah Johnson", "subject": "Meeting reminder", "time": "12 minutes ago", "status": "read"},
            {"id": 3, "type": "whatsapp", "contact": "Team Chat", "subject": "Daily standup", "time": "1 hour ago", "status": "read"},
            {"id": 4, "type": "email", "contact": "support@company.com", "subject": "Ticket #1234", "time": "2 hours ago", "status": "unread"},
            {"id": 5, "type": "telegram", "contact": "Tech News", "subject": "Weekly digest", "time": "3 hours ago", "status": "read"}
        ],
        "upcoming_events": [
            {"id": 1, "type": "call", "title": "Client Meeting", "time": "Today, 2:00 PM", "contact": "John Doe", "priority": "high"},
            {"id": 2, "type": "video", "title": "Team Standup", "time": "Tomorrow, 9:00 AM", "contact": "Team", "priority": "medium"},
            {"id": 3, "type": "call", "title": "Project Review", "time": "Wednesday, 3:00 PM", "contact": "Sarah Wilson", "priority": "high"}
        ],
        "favorite_contacts": [
            {"id": 1, "name": "John Doe", "avatar": "JD", "status": "online", "last_contact": "2 hours ago"},
            {"id": 2, "name": "Sarah Johnson", "avatar": "SJ", "status": "away", "last_contact": "1 day ago"},
            {"id": 3, "name": "Mike Wilson", "avatar": "MW", "status": "online", "last_contact": "3 hours ago"},
            {"id": 4, "name": "Emily Brown", "avatar": "EB", "status": "offline", "last_contact": "2 days ago"}
        ],
        "personal_stats": {
            "communication_streak": 5,
            "completed_tasks": 12,
            "response_time": "1.2 minutes",
            "bookmarks": 24
        },
        "quick_actions": [
            {"name": "Send Message", "href": "/user/messages", "icon": "message-square"},
            {"name": "Make Call", "href": "/user/voice", "icon": "phone"},
            {"name": "Send Email", "href": "/user/email", "icon": "mail"},
            {"name": "View Calendar", "href": "/user/calendar", "icon": "calendar"},
            {"name": "Add Contact", "href": "/user/contacts", "icon": "user"},
            {"name": "My Analytics", "href": "/user/analytics", "icon": "bar-chart"}
        ]
    }
