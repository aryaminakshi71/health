"""
Admin Dashboard API
Handles admin dashboard data
"""

from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime

from app.core.auth import get_current_user_dev_optional

router = APIRouter(prefix="/admin-dashboard", tags=["Admin Dashboard"])

@router.get("/data", operation_id="admin_dashboard_get_data")
async def get_admin_dashboard_data(
    current_user: str = Depends(get_current_user_dev_optional)
):
    """Get admin dashboard data"""
    try:
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
                },
                {
                    "id": 2,
                    "type": "user_added", 
                    "user": "John Doe added to TechCorp",
                    "time": "15 minutes ago",
                    "status": "success"
                },
                {
                    "id": 3,
                    "type": "payment_received",
                    "user": "Enterprise Solutions",
                    "time": "1 hour ago",
                    "status": "success"
                },
                {
                    "id": 4,
                    "type": "client_updated",
                    "user": "StartupXYZ plan upgraded",
                    "time": "2 hours ago",
                    "status": "success"
                },
                {
                    "id": 5,
                    "type": "user_login",
                    "user": "admin@company.com",
                    "time": "3 hours ago",
                    "status": "success"
                }
            ],
            "quick_actions": [
                {"name": "Client Management", "href": "/admin/client-management", "icon": "users"},
                {"name": "User Management", "href": "/admin/users", "icon": "users"},
                {"name": "System Monitoring", "href": "/admin/monitoring", "icon": "server"},
                {"name": "Billing Overview", "href": "/admin/billing", "icon": "dollar-sign"},
                {"name": "Security Settings", "href": "/admin/security", "icon": "shield"},
                {"name": "System Analytics", "href": "/admin/analytics", "icon": "bar-chart"}
            ]
        }
        
        return {
            "status": "success",
            "data": dashboard_data,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get admin dashboard data: {str(e)}")
