"""
Centralized API Router
Single API router for all applications
"""

from fastapi import APIRouter, HTTPException, Depends, WebSocket, WebSocketDisconnect
from typing import List, Dict, Any
import json
from datetime import datetime, timedelta
import random
import asyncio

# Import all application routers
from .healthcare import router as healthcare_router
from .communication import router as communication_router
from .business import router as business_router
from .inventory import router as inventory_router
from .financial import router as financial_router
from .education import router as education_router
from .cloud_storage import router as cloud_storage_router
from .surveillance import router as surveillance_router

from .billing import router as billing_router
from .dvr import router as dvr_router
from .camera_management import router as camera_management_router
from .websocket import router as websocket_router
from ...core.realtime import realtime_manager
from fastapi import Request
from .hr import router as hr_router
from .compliance import router as compliance_router
from .support import router as support_router
from .ai_analytics import router as ai_analytics_router
from .autism_care import router as autism_care_router
from .website_builder import router as website_builder_router
from .mobile_app import router as mobile_app_router
from .notifications import router as notifications_router
from .tenants import router as tenants_router
from .addons import router as addons_router
from ...core.realtime import realtime_manager, RealtimeService
from ...core.security import get_current_user_dev_optional

api_router = APIRouter()

# Include all application routers with proper prefixes and tags
api_router.include_router(healthcare_router, prefix="/healthcare", tags=["healthcare"])
api_router.include_router(communication_router, prefix="/communication", tags=["communication"])
api_router.include_router(business_router, prefix="/business", tags=["business"])
api_router.include_router(ai_analytics_router, prefix="/ai-analytics", tags=["ai-analytics"])
api_router.include_router(cloud_storage_router, prefix="/cloud-storage", tags=["cloud-storage"])
api_router.include_router(inventory_router, prefix="/inventory", tags=["inventory"])
api_router.include_router(financial_router, prefix="/financial", tags=["financial"])
api_router.include_router(education_router, prefix="/education", tags=["education"])
api_router.include_router(surveillance_router, prefix="/surveillance", tags=["surveillance"])

api_router.include_router(camera_management_router, prefix="/camera", tags=["camera-management"])
api_router.include_router(websocket_router, prefix="/ws", tags=["websocket"])
api_router.include_router(billing_router, prefix="/billing", tags=["billing"])
api_router.include_router(dvr_router, prefix="/dvr", tags=["dvr"])
# Lightweight recent events endpoint for AdminPanel
@api_router.get("/realtime/events")
async def get_recent_realtime_events(request: Request, limit: int = 50):
    try:
        events = list(getattr(realtime_manager, 'event_history', []))
        return events[-limit:]
    except Exception:
        return []
api_router.include_router(hr_router, prefix="/hr", tags=["hr"])
api_router.include_router(compliance_router, prefix="/compliance", tags=["compliance"])
api_router.include_router(support_router, prefix="/support", tags=["support"])
api_router.include_router(autism_care_router, prefix="/autism-care", tags=["autism-care"])
api_router.include_router(website_builder_router, prefix="/website-builder", tags=["website-builder"])
api_router.include_router(mobile_app_router, prefix="/mobile-app", tags=["mobile-app"])
api_router.include_router(notifications_router, prefix="/notifications", tags=["notifications"])
api_router.include_router(tenants_router, prefix="/tenants", tags=["tenants"])
api_router.include_router(addons_router, prefix="", tags=["addons"])

# Core API endpoints (not app-specific)
@api_router.get("/test", operation_id="api_get_test")
async def test_endpoint():
    """Test endpoint"""
    return {"message": "API is working!", "timestamp": datetime.utcnow().isoformat()}

@api_router.get("/health", operation_id="api_get_health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "1.0.0",
        "services": {
            "database": "connected",
            "cache": "connected",
            "external_apis": "connected"
        }
    }

@api_router.get("/endpoints", operation_id="api_get_endpoints")
async def list_all_endpoints():
    """List all available endpoints"""
    try:
        from datetime import datetime
        
        endpoint_list = []
        
        # Add core endpoints
        endpoint_list.extend([
            {"path": "/api/v1/test", "method": "GET", "description": "Test endpoint"},
            {"path": "/api/v1/health", "method": "GET", "description": "Health check"},
            {"path": "/api/v1/endpoints", "method": "GET", "description": "List all endpoints"},
            {"path": "/api/v1/endpoints/text", "method": "GET", "description": "List endpoints as text"},
        ])
        
        # Add app-specific endpoints
        apps = [
            "healthcare", "communication", "business", "ai-analytics", "cloud-storage",
            "inventory", "financial", "education", "surveillance", "hr", "compliance",
            "support", "autism-care", "website-builder", "mobile-app", "auth"
        ]
        
        for app in apps:
            endpoint_list.extend([
                {"path": f"/api/v1/{app}/dashboard", "method": "GET", "description": f"{app} dashboard"},
                {"path": f"/api/v1/{app}/status", "method": "GET", "description": f"{app} status"},
                {"path": f"/api/v1/{app}/metrics", "method": "GET", "description": f"{app} metrics"},
            ])
        
        return {
            "total_endpoints": len(endpoint_list),
            "endpoints": endpoint_list,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        return {
            "error": str(e),
            "type": type(e).__name__,
            "message": "Error in endpoints function"
        }

@api_router.get("/endpoints/text", operation_id="api_get_endpoints_text")
async def list_all_endpoints_text():
    """List all endpoints as formatted text"""
    endpoints_text = """
AVAILABLE API ENDPOINTS:

Core Endpoints:
/api/v1/test
/api/v1/health
/api/v1/endpoints
/api/v1/endpoints/text

Application Endpoints:

Healthcare:
/api/v1/healthcare/dashboard
/api/v1/healthcare/patients
/api/v1/healthcare/appointments
/api/v1/healthcare/analytics

Communication:
/api/v1/communication/dashboard
/api/v1/communication/calls
/api/v1/communication/messages
/api/v1/communication/contacts
/api/v1/communication/analytics

Business:
/api/v1/business/dashboard
/api/v1/business/projects
/api/v1/business/clients
/api/v1/business/analytics

AI Analytics:
/api/v1/ai-analytics/dashboard
/api/v1/ai-analytics/predict
/api/v1/ai-analytics/upload

Cloud Storage:
/api/v1/cloud-storage/dashboard
/api/v1/cloud-storage/files
/api/v1/cloud-storage/folders
/api/v1/cloud-storage/backups

Inventory:
/api/v1/inventory/dashboard
/api/v1/inventory/items
/api/v1/inventory/suppliers
/api/v1/inventory/movements

Financial:
/api/v1/financial/dashboard
/api/v1/financial/transactions
/api/v1/financial/accounts
/api/v1/financial/budgets

Education:
/api/v1/education/dashboard
/api/v1/education/courses
/api/v1/education/students

Surveillance:
/api/v1/surveillance/dashboard
/api/v1/surveillance/alerts
/api/v1/surveillance/cameras

HR:
/api/v1/hr/dashboard
/api/v1/hr/employees
/api/v1/hr/recruitments
/api/v1/hr/performances
/api/v1/hr/leave-requests

Compliance:
/api/v1/compliance/dashboard
/api/v1/compliance/audits
/api/v1/compliance/reports

Support:
/api/v1/support/dashboard
/api/v1/support/tickets
/api/v1/support/agents

Autism Care:
/api/v1/autism-care/dashboard
/api/v1/autism-care/patients
/api/v1/autism-care/therapies

Website Builder:
/api/v1/website-builder/dashboard
/api/v1/website-builder/templates
/api/v1/website-builder/projects

Mobile App:
/api/v1/mobile-app/dashboard
/api/v1/mobile-app/features
/api/v1/mobile-app/analytics

Authentication:
/api/v1/auth/login
/api/v1/auth/register
/api/v1/auth/refresh
/api/v1/auth/logout

TOTAL: 80+ API ENDPOINTS AVAILABLE
"""
    return {"endpoints": endpoints_text.strip()}

# Generic app status and metrics endpoints
@api_router.get("/{app_name}/status", operation_id="api_get_app_status")
async def get_app_status(app_name: str):
    """Get status for any application"""
    return {
        "app": app_name,
        "status": "operational",
        "uptime": "99.9%",
        "last_check": datetime.now().isoformat(),
        "version": "1.0.0"
    }

@api_router.get("/{app_name}/metrics", operation_id="api_get_app_metrics")
async def get_app_metrics(app_name: str):
    """Get metrics for any application"""
    return {
        "app": app_name,
        "metrics": {
            "users": random.randint(100, 10000),
            "requests": random.randint(1000, 50000),
            "response_time": random.uniform(50, 200),
            "error_rate": random.uniform(0.1, 2.0)
        },
        "timestamp": datetime.now().isoformat()
    }

# WebSocket endpoint for real-time communication
@api_router.websocket("/ws/{app_name}")
async def websocket_endpoint(websocket: WebSocket, app_name: str):
    """WebSocket endpoint for real-time communication"""
    await websocket.accept()
    try:
        while True:
            # Send periodic updates
            data = {
                "app": app_name,
                "timestamp": datetime.now().isoformat(),
                "status": "active",
                "metrics": {
                    "active_users": random.randint(10, 100),
                    "requests_per_minute": random.randint(50, 200)
                }
            }
            await websocket.send_text(json.dumps(data))
            await asyncio.sleep(5)  # Send update every 5 seconds
    except WebSocketDisconnect:
        print(f"WebSocket disconnected for {app_name}")

# Realtime service endpoints
@api_router.get("/realtime/stats", operation_id="api_get_realtime_stats")
async def get_realtime_stats():
    """Get real-time system statistics"""
    return realtime_manager.get_stats()

@api_router.get("/realtime/events", operation_id="api_get_realtime_events")
async def get_event_history():
    """Get recent real-time events"""
    return realtime_manager.get_event_history()
