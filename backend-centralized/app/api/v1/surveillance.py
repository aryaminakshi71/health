"""
Surveillance Guard API
Includes camera monitoring, alert management, and security analytics
"""

from fastapi import APIRouter, HTTPException, Depends, Request
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import json
from ...core.security import (
    security_manager, 
    access_control, 
    compliance_checker,
    get_current_user,
    get_current_user_dev_optional,
    verify_permission
)

router = APIRouter()

# Mock surveillance data
CAMERAS_DATA = [
    {
        "id": "CAM001",
        "name": "Main Entrance",
        "location": "Building A - Front Door",
        "status": "active",
        "resolution": "4K",
        "ip_address": "192.168.1.100",
        "port": 554,
        "last_maintenance": "2024-01-20",
        "uptime": 99.8,
        "recording_status": "recording",
        "motion_detected": True,
        "storage_used": 75.2,
        "storage_total": 100,
        "stream_url": "https://example.com/stream1"
    },
    {
        "id": "CAM002",
        "name": "Parking Lot",
        "location": "Building A - Parking",
        "status": "active",
        "resolution": "1080p",
        "ip_address": "192.168.1.101",
        "port": 554,
        "last_maintenance": "2024-01-18",
        "uptime": 99.5,
        "recording_status": "recording",
        "motion_detected": False,
        "storage_used": 45.8,
        "storage_total": 100,
        "stream_url": "https://example.com/stream2"
    },
    {
        "id": "CAM003",
        "name": "Server Room",
        "location": "Building B - Basement",
        "status": "maintenance",
        "resolution": "4K",
        "ip_address": "192.168.1.102",
        "port": 554,
        "last_maintenance": "2024-01-25",
        "uptime": 95.2,
        "recording_status": "stopped",
        "motion_detected": False,
        "storage_used": 82.1,
        "storage_total": 100,
        "stream_url": "https://example.com/stream3"
    },
    {
        "id": "CAM004",
        "name": "Patient Room 101",
        "location": "Building C - Floor 1",
        "status": "active",
        "resolution": "1080p",
        "ip_address": "192.168.1.103",
        "port": 554,
        "last_maintenance": "2024-01-22",
        "uptime": 98.9,
        "recording_status": "recording",
        "motion_detected": True,
        "storage_used": 60.3,
        "storage_total": 100,
        "stream_url": "https://example.com/stream4"
    }
]

ALERTS_DATA = [
    {
        "id": "ALT001",
        "type": "motion",
        "camera_id": "CAM001",
        "camera_name": "Main Entrance",
        "location": "Main Entrance",
        "timestamp": "2024-01-27T10:30:00",
        "severity": "medium",
        "status": "new",
        "description": "Motion detected at main entrance",
        "image_url": "https://example.com/alert1.jpg"
    },
    {
        "id": "ALT002",
        "type": "unauthorized",
        "camera_id": "CAM003",
        "camera_name": "Server Room",
        "location": "Server Room",
        "timestamp": "2024-01-27T09:15:00",
        "severity": "high",
        "status": "acknowledged",
        "description": "Unauthorized access attempt",
        "image_url": "https://example.com/alert2.jpg"
    },
    {
        "id": "ALT003",
        "type": "motion",
        "camera_id": "CAM002",
        "camera_name": "Parking Lot",
        "location": "Parking Lot",
        "timestamp": "2024-01-27T08:45:00",
        "severity": "low",
        "status": "resolved",
        "description": "Vehicle movement detected",
        "image_url": "https://example.com/alert3.jpg"
    }
]

RECORDINGS_DATA = [
    {
        "id": "REC001",
        "camera_id": "CAM001",
        "filename": "main_entrance_2024_01_27_10_30.mp4",
        "file_size": 256000000,
        "duration": 3600,
        "start_time": "2024-01-27T10:30:00",
        "end_time": "2024-01-27T11:30:00",
        "motion_detected": True,
        "download_url": "https://example.com/download/rec001"
    },
    {
        "id": "REC002",
        "camera_id": "CAM002",
        "filename": "parking_lot_2024_01_27_09_00.mp4",
        "file_size": 128000000,
        "duration": 1800,
        "start_time": "2024-01-27T09:00:00",
        "end_time": "2024-01-27T09:30:00",
        "motion_detected": False,
        "download_url": "https://example.com/download/rec002"
    }
]

@router.get("/dashboard")
async def get_surveillance_dashboard(
    current_user: str = Depends(get_current_user_dev_optional)
):
    """Get Surveillance Guard dashboard with security metrics"""
    
    active_cameras = len([cam for cam in CAMERAS_DATA if cam["status"] == "active"])
    total_alerts = len(ALERTS_DATA)
    active_alerts = len([alert for alert in ALERTS_DATA if alert["status"] != "resolved"])
    
    return {
        "cameras": len(CAMERAS_DATA),
        "alerts": total_alerts,
        "revenue": 35000,
        "growth": 28.5,
        "recent_alerts": [
            {"id": 1, "type": "motion", "location": "Main Entrance", "timestamp": "2024-01-27T10:30:00"},
            {"id": 2, "type": "unauthorized", "location": "Server Room", "timestamp": "2024-01-27T09:15:00"},
            {"id": 3, "type": "motion", "location": "Parking Lot", "timestamp": "2024-01-27T08:45:00"}
        ],
        "recent_activity": [
            {
                "timestamp": datetime.now().isoformat(),
                "action": "Alert triggered",
                "user": current_user,
                "details": "Motion detected at Main Entrance"
            }
        ]
    }

@router.get("/cameras")
async def get_cameras(
    request: Request,
    current_user: str = Depends(get_current_user_dev_optional)
):
    """Get all cameras with security logging"""
    
    # Log audit event
    security_manager.log_audit_event(
        user_id=current_user,
        action="read",
        resource="cameras",
        details={"operation": "list_cameras"},
        ip_address=request.client.host
    )
    
    return {"cameras": CAMERAS_DATA}

@router.get("/cameras/{camera_id}")
async def get_camera(
    camera_id: str,
    request: Request,
    current_user: str = Depends(get_current_user_dev_optional)
):
    """Get specific camera details"""
    
    camera = next((c for c in CAMERAS_DATA if c["id"] == camera_id), None)
    if not camera:
        raise HTTPException(status_code=404, detail="Camera not found")
    
    # Log audit event
    security_manager.log_audit_event(
        user_id=current_user,
        action="read",
        resource=f"camera/{camera_id}",
        details={"camera_id": camera_id},
        ip_address=request.client.host
    )
    
    return {"camera": camera}

@router.get("/alerts")
async def get_alerts(
    request: Request,
    current_user: str = Depends(get_current_user_dev_optional)
):
    """Get all alerts"""
    
    # Log audit event
    security_manager.log_audit_event(
        user_id=current_user,
        action="read",
        resource="alerts",
        details={"operation": "list_alerts"},
        ip_address=request.client.host
    )
    
    return {"alerts": ALERTS_DATA}

@router.get("/alerts/{alert_id}")
async def get_alert(
    alert_id: str,
    request: Request,
    current_user: str = Depends(get_current_user_dev_optional)
):
    """Get specific alert details"""
    
    alert = next((a for a in ALERTS_DATA if a["id"] == alert_id), None)
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    # Log audit event
    security_manager.log_audit_event(
        user_id=current_user,
        action="read",
        resource=f"alert/{alert_id}",
        details={"alert_id": alert_id},
        ip_address=request.client.host
    )
    
    return {"alert": alert}

@router.get("/analytics/security")
async def get_security_analytics(
    current_user: str = Depends(get_current_user_dev_optional)
):
    """Get security analytics"""
    
    return {
        "total_cameras": len(CAMERAS_DATA),
        "active_cameras": len([cam for cam in CAMERAS_DATA if cam["status"] == "active"]),
        "total_alerts": len(ALERTS_DATA),
        "resolved_alerts": len([alert for alert in ALERTS_DATA if alert["status"] == "resolved"]),
        "average_response_time": 2.5,
        "security_score": 95.8,
        "monthly_alerts": [
            {"month": "Jan", "alerts": 45},
            {"month": "Feb", "alerts": 38},
            {"month": "Mar", "alerts": 42}
        ],
        "alert_types": {
            "motion": len([a for a in ALERTS_DATA if a["type"] == "motion"]),
            "unauthorized": len([a for a in ALERTS_DATA if a["type"] == "unauthorized"]),
            "maintenance": len([a for a in ALERTS_DATA if a["type"] == "maintenance"])
        }
    }

@router.get("/analytics/overview")
async def get_analytics_overview(
    current_user: str = Depends(get_current_user_dev_optional)
):
    """Aggregate analytics across cameras and alerts (mocked from in-memory data)."""
    try:
        per_camera = {}
        for cam in CAMERAS_DATA:
            cid = cam["id"]
            cam_alerts = [a for a in ALERTS_DATA if a["camera_id"] == cid]
            motion = len([a for a in cam_alerts if a["type"] == "motion"])
            high = len([a for a in cam_alerts if a["severity"] in ("high", "critical")])
            per_camera[cid] = {
                "name": cam["name"],
                "motion_alerts": motion,
                "high_severity_alerts": high,
            }
        mttr = 0.0
        resolved = [a for a in ALERTS_DATA if a.get("status") in ("resolved", "acknowledged")]
        if resolved:
            mttr = 180.0
        return {
            "per_camera": per_camera,
            "mttr_seconds": mttr,
            "total_alerts": len(ALERTS_DATA),
            "resolved_alerts": len(resolved),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/analytics/camera/{camera_id}")
async def get_camera_analytics(
    camera_id: str,
    current_user: str = Depends(get_current_user_dev_optional)
):
    """Per-camera analytics (motion rate, severities, recent timeline)."""
    try:
        cam = next((c for c in CAMERAS_DATA if c["id"] == camera_id), None)
        if not cam:
            raise HTTPException(status_code=404, detail="Camera not found")
        cam_alerts = [a for a in ALERTS_DATA if a["camera_id"] == camera_id]
        by_severity = {
            "low": len([a for a in cam_alerts if a["severity"] == "low"]),
            "medium": len([a for a in cam_alerts if a["severity"] == "medium"]),
            "high": len([a for a in cam_alerts if a["severity"] == "high"]),
            "critical": len([a for a in cam_alerts if a["severity"] == "critical"]),
        }
        motion_rate = len([a for a in cam_alerts if a["type"] == "motion"]) / max(len(cam_alerts), 1)
        timeline = sorted([
            {"t": a["timestamp"], "type": a["type"], "severity": a["severity"]}
            for a in cam_alerts
        ], key=lambda x: x["t"], reverse=True)[:50]
        return {
            "camera": {"id": cam["id"], "name": cam["name"]},
            "alerts_by_severity": by_severity,
            "motion_rate": motion_rate,
            "timeline": timeline,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/analytics/performance")
async def get_performance_analytics(
    current_user: str = Depends(get_current_user_dev_optional)
):
    """Get performance analytics"""
    
    return {
        "system_uptime": 99.8,
        "average_recording_quality": 4.7,
        "storage_usage": 75.2,
        "network_bandwidth": 85.5,
        "backup_status": "completed",
        "maintenance_schedule": "up_to_date"
    }

@router.get("/recordings")
async def get_recordings(
    request: Request,
    current_user: str = Depends(get_current_user_dev_optional)
):
    """Get all recordings"""
    
    # Log audit event
    security_manager.log_audit_event(
        user_id=current_user,
        action="read",
        resource="recordings",
        details={"operation": "list_recordings"},
        ip_address=request.client.host
    )
    
    return {"recordings": RECORDINGS_DATA}

@router.get("/recordings/{recording_id}")
async def get_recording(
    recording_id: str,
    request: Request,
    current_user: str = Depends(get_current_user_dev_optional)
):
    """Get specific recording details"""
    
    recording = next((r for r in RECORDINGS_DATA if r["id"] == recording_id), None)
    if not recording:
        raise HTTPException(status_code=404, detail="Recording not found")
    
    # Log audit event
    security_manager.log_audit_event(
        user_id=current_user,
        action="read",
        resource=f"recording/{recording_id}",
        details={"recording_id": recording_id},
        ip_address=request.client.host
    )
    
    return {"recording": recording}

@router.post("/cameras/{camera_id}/record")
async def toggle_recording(
    camera_id: str,
    action: str,  # start, stop, pause
    request: Request,
    current_user: str = Depends(get_current_user_dev_optional)
):
    """Toggle camera recording"""
    
    camera = next((c for c in CAMERAS_DATA if c["id"] == camera_id), None)
    if not camera:
        raise HTTPException(status_code=404, detail="Camera not found")
    
    # Log audit event
    security_manager.log_audit_event(
        user_id=current_user,
        action="update",
        resource=f"camera/{camera_id}",
        details={"operation": f"toggle_recording_{action}"},
        ip_address=request.client.host
    )
    
    # Update camera recording status
    if action == "start":
        camera["recording_status"] = "recording"
    elif action == "stop":
        camera["recording_status"] = "stopped"
    elif action == "pause":
        camera["recording_status"] = "paused"
    
    return {"message": f"Recording {action}ed successfully", "camera": camera}

@router.post("/cameras/{camera_id}/motion")
async def toggle_motion_detection(
    camera_id: str,
    enabled: bool,
    request: Request,
    current_user: str = Depends(get_current_user_dev_optional)
):
    """Toggle motion detection for camera"""
    
    camera = next((c for c in CAMERAS_DATA if c["id"] == camera_id), None)
    if not camera:
        raise HTTPException(status_code=404, detail="Camera not found")
    
    # Log audit event
    security_manager.log_audit_event(
        user_id=current_user,
        action="update",
        resource=f"camera/{camera_id}",
        details={"operation": f"toggle_motion_{enabled}"},
        ip_address=request.client.host
    )
    
    camera["motion_detected"] = enabled
    
    return {"message": f"Motion detection {'enabled' if enabled else 'disabled'}", "camera": camera}

@router.post("/alerts/{alert_id}/acknowledge")
async def acknowledge_alert(
    alert_id: str,
    request: Request,
    current_user: str = Depends(get_current_user_dev_optional)
):
    """Acknowledge an alert"""
    
    alert = next((a for a in ALERTS_DATA if a["id"] == alert_id), None)
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    # Log audit event
    security_manager.log_audit_event(
        user_id=current_user,
        action="update",
        resource=f"alert/{alert_id}",
        details={"operation": "acknowledge_alert"},
        ip_address=request.client.host
    )
    
    alert["status"] = "acknowledged"
    
    return {"message": "Alert acknowledged", "alert": alert}

@router.post("/alerts/{alert_id}/resolve")
async def resolve_alert(
    alert_id: str,
    request: Request,
    current_user: str = Depends(get_current_user_dev_optional)
):
    """Resolve an alert"""
    
    alert = next((a for a in ALERTS_DATA if a["id"] == alert_id), None)
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    # Log audit event
    security_manager.log_audit_event(
        user_id=current_user,
        action="update",
        resource=f"alert/{alert_id}",
        details={"operation": "resolve_alert"},
        ip_address=request.client.host
    )
    
    alert["status"] = "resolved"
    
    return {"message": "Alert resolved", "alert": alert}

@router.post("/cameras")
async def add_camera(
    camera_data: dict,
    request: Request,
    current_user: str = Depends(get_current_user_dev_optional)
):
    """Add a new camera"""
    
    # Validate required fields
    if not camera_data.get("name"):
        raise HTTPException(status_code=422, detail="Camera name is required")
    if not camera_data.get("location"):
        raise HTTPException(status_code=422, detail="Camera location is required")
    if not camera_data.get("ip_address"):
        raise HTTPException(status_code=422, detail="Camera IP address is required")
    
    # Log audit event
    security_manager.log_audit_event(
        user_id=current_user,
        action="create",
        resource="camera",
        details={"operation": "add_camera", "camera_data": camera_data},
        ip_address=request.client.host
    )
    
    new_camera = {
        "id": f"CAM{str(len(CAMERAS_DATA) + 1).zfill(3)}",
        "name": camera_data.get("name"),
        "location": camera_data.get("location"),
        "status": "active",
        "resolution": camera_data.get("resolution", "1080p"),
        "ip_address": camera_data.get("ip_address"),
        "port": camera_data.get("port", 554),
        "last_maintenance": datetime.now().strftime("%Y-%m-%d"),
        "uptime": 100.0,
        "recording_status": "stopped",
        "motion_detected": False,
        "storage_used": 0.0,
        "storage_total": 100.0,
        "stream_url": f"https://example.com/stream{len(CAMERAS_DATA) + 1}"
    }
    
    CAMERAS_DATA.append(new_camera)
    
    return {"message": "Camera added successfully", "camera": new_camera} 
    
    return {"message": "Camera added successfully", "camera": new_camera} 

# Add these missing CRUD operations to the surveillance.py file

# ==================== CAMERAS CRUD OPERATIONS ====================

@router.put("/cameras/{camera_id}")
async def update_camera(
    camera_id: str,
    camera_data: Dict[str, Any],
    request: Request,
    current_user: str = Depends(get_current_user)
):
    """Update camera"""
    
    camera_index = next((i for i, camera in enumerate(CAMERAS_DATA) if camera["id"] == camera_id), None)
    if camera_index is None:
        raise HTTPException(status_code=404, detail="Camera not found")
    
    # Update camera data
    for key, value in camera_data.items():
        if key in CAMERAS_DATA[camera_index]:
            CAMERAS_DATA[camera_index][key] = value
    
    CAMERAS_DATA[camera_index]["updated_at"] = datetime.now().isoformat()
    CAMERAS_DATA[camera_index]["updated_by"] = current_user
    
    # Log audit event
    security_manager.log_audit_event(
        user_id=current_user,
        action="update",
        resource="camera",
        details={"camera_id": camera_id},
        ip_address=request.client.host
    )
    
    return {"camera": CAMERAS_DATA[camera_index], "message": "Camera updated successfully"}

@router.delete("/cameras/{camera_id}")
async def delete_camera(
    camera_id: str,
    request: Request,
    current_user: str = Depends(get_current_user)
):
    """Delete camera"""
    
    camera_index = next((i for i, camera in enumerate(CAMERAS_DATA) if camera["id"] == camera_id), None)
    if camera_index is None:
        raise HTTPException(status_code=404, detail="Camera not found")
    
    deleted_camera = CAMERAS_DATA.pop(camera_index)
    
    # Log audit event
    security_manager.log_audit_event(
        user_id=current_user,
        action="delete",
        resource="camera",
        details={"camera_id": camera_id, "camera_name": deleted_camera["name"]},
        ip_address=request.client.host
    )
    
    return {"message": "Camera deleted successfully", "deleted_camera": deleted_camera}

# ==================== ALERTS CRUD OPERATIONS ====================

@router.put("/alerts/{alert_id}")
async def update_alert(
    alert_id: str,
    alert_data: Dict[str, Any],
    request: Request,
    current_user: str = Depends(get_current_user)
):
    """Update alert"""
    
    alert_index = next((i for i, alert in enumerate(ALERTS_DATA) if alert["id"] == alert_id), None)
    if alert_index is None:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    # Update alert data
    for key, value in alert_data.items():
        if key in ALERTS_DATA[alert_index]:
            ALERTS_DATA[alert_index][key] = value
    
    ALERTS_DATA[alert_index]["updated_at"] = datetime.now().isoformat()
    ALERTS_DATA[alert_index]["updated_by"] = current_user
    
    # Log audit event
    security_manager.log_audit_event(
        user_id=current_user,
        action="update",
        resource="alert",
        details={"alert_id": alert_id},
        ip_address=request.client.host
    )
    
    return {"alert": ALERTS_DATA[alert_index], "message": "Alert updated successfully"}

@router.delete("/alerts/{alert_id}")
async def delete_alert(
    alert_id: str,
    request: Request,
    current_user: str = Depends(get_current_user)
):
    """Delete alert"""
    
    alert_index = next((i for i, alert in enumerate(ALERTS_DATA) if alert["id"] == alert_id), None)
    if alert_index is None:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    deleted_alert = ALERTS_DATA.pop(alert_index)
    
    # Log audit event
    security_manager.log_audit_event(
        user_id=current_user,
        action="delete",
        resource="alert",
        details={"alert_id": alert_id, "alert_type": deleted_alert["type"]},
        ip_address=request.client.host
    )
    
    return {"message": "Alert deleted successfully", "deleted_alert": deleted_alert}

# ==================== RECORDINGS CRUD OPERATIONS ====================

@router.put("/recordings/{recording_id}")
async def update_recording(
    recording_id: str,
    recording_data: Dict[str, Any],
    request: Request,
    current_user: str = Depends(get_current_user)
):
    """Update recording"""
    
    recording_index = next((i for i, recording in enumerate(RECORDINGS_DATA) if recording["id"] == recording_id), None)
    if recording_index is None:
        raise HTTPException(status_code=404, detail="Recording not found")
    
    # Update recording data
    for key, value in recording_data.items():
        if key in RECORDINGS_DATA[recording_index]:
            RECORDINGS_DATA[recording_index][key] = value
    
    RECORDINGS_DATA[recording_index]["updated_at"] = datetime.now().isoformat()
    RECORDINGS_DATA[recording_index]["updated_by"] = current_user
    
    # Log audit event
    security_manager.log_audit_event(
        user_id=current_user,
        action="update",
        resource="recording",
        details={"recording_id": recording_id},
        ip_address=request.client.host
    )
    
    return {"recording": RECORDINGS_DATA[recording_index], "message": "Recording updated successfully"}

@router.delete("/recordings/{recording_id}")
async def delete_recording(
    recording_id: str,
    request: Request,
    current_user: str = Depends(get_current_user)
):
    """Delete recording"""
    
    recording_index = next((i for i, recording in enumerate(RECORDINGS_DATA) if recording["id"] == recording_id), None)
    if recording_index is None:
        raise HTTPException(status_code=404, detail="Recording not found")
    
    deleted_recording = RECORDINGS_DATA.pop(recording_index)
    
    # Log audit event
    security_manager.log_audit_event(
        user_id=current_user,
        action="delete",
        resource="recording",
        details={"recording_id": recording_id, "recording_camera": deleted_recording["camera"]},
        ip_address=request.client.host
    )
    
    return {"message": "Recording deleted successfully", "deleted_recording": deleted_recording} 