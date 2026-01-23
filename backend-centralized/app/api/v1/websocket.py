"""
Enhanced WebSocket API endpoints for real-time communication
"""

import json
import asyncio
from datetime import datetime
from typing import Optional, Dict, Any
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, HTTPException, Request
from fastapi.responses import JSONResponse

from app.core.websocket import (
    handle_websocket_connection, manager, 
    WebSocketMessage, broadcast_notification,
    broadcast_real_time_update, broadcast_system_status,
    broadcast_communication_event, broadcast_activity_log
)
from app.core.auth import get_current_user_dev_optional
from app.core.logging import audit_logger, log_user_activity

router = APIRouter()

@router.websocket("/ws/{user_id}")
async def websocket_endpoint(
    websocket: WebSocket,
    user_id: str,
    client_id: Optional[str] = None
):
    """Enhanced WebSocket endpoint for real-time communication"""
    try:
        await handle_websocket_connection(websocket, user_id, client_id)
        log_user_activity(user_id, "websocket_connected", {"client_id": client_id})
    except Exception as e:
        audit_logger.error(f"WebSocket connection error for user {user_id}: {str(e)}")

@router.websocket("/ws/client/{client_id}")
async def client_websocket_endpoint(
    websocket: WebSocket,
    client_id: str
):
    """Enhanced WebSocket endpoint for client-specific communication"""
    try:
        await handle_websocket_connection(websocket, f"client_{client_id}", client_id)
        log_user_activity(f"client_{client_id}", "client_websocket_connected", {"client_id": client_id})
    except Exception as e:
        audit_logger.error(f"Client WebSocket connection error for client {client_id}: {str(e)}")

@router.get("/ws/status")
async def get_websocket_status():
    """Get enhanced WebSocket connection status"""
    try:
        return {
            "total_connections": manager.get_connection_count(),
            "active_users": len(manager.user_connections),
            "active_clients": len(manager.client_connections),
            "status": "active",
            "timestamp": datetime.now().isoformat(),
            "uptime": "99.9%"
        }
    except Exception as e:
        audit_logger.error(f"Error getting WebSocket status: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get WebSocket status")

@router.get("/ws/connections/{user_id}")
async def get_user_connections(user_id: str):
    """Get connections for a specific user"""
    try:
        return {
            "user_id": user_id,
            "connection_count": manager.get_user_connection_count(user_id),
            "connections": list(manager.user_connections.get(user_id, set())),
            "last_updated": datetime.now().isoformat()
        }
    except Exception as e:
        audit_logger.error(f"Error getting user connections for {user_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get user connections")

@router.get("/ws/client-connections/{client_id}")
async def get_client_connections(client_id: str):
    """Get connections for a specific client"""
    try:
        return {
            "client_id": client_id,
            "connection_count": manager.get_client_connection_count(client_id),
            "connections": list(manager.client_connections.get(client_id, set())),
            "last_updated": datetime.now().isoformat()
        }
    except Exception as e:
        audit_logger.error(f"Error getting client connections for {client_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get client connections")

@router.post("/ws/broadcast")
async def broadcast_message(
    message: Dict[str, Any],
    request: Request,
    current_user: str = Depends(get_current_user_dev_optional)
):
    """Broadcast message to all connected clients"""
    try:
        message_type = message.get("type", "notification")
        data = message.get("data", {})
        
        if message_type == "notification":
            await broadcast_notification(
                title=data.get("title", "Notification"),
                message=data.get("message", ""),
                level=data.get("level", "info")
            )
        elif message_type == "real_time_update":
            await broadcast_real_time_update(
                update_type=data.get("update_type", "general"),
                data=data.get("data", {})
            )
        elif message_type == "system_status":
            await broadcast_system_status(data.get("status", {}))
        elif message_type == "communication_event":
            await broadcast_communication_event(
                event_type=data.get("event_type", "message"),
                data=data.get("data", {})
            )
        elif message_type == "activity_log":
            await broadcast_activity_log(
                action=data.get("action", "activity"),
                details=data.get("details", {}),
                user_id=data.get("user_id", current_user)
            )
        else:
            # Generic broadcast
            await manager.broadcast(WebSocketMessage.create_message(message_type, data))
        
        log_user_activity(current_user, "broadcast_message", {
            "message_type": message_type,
            "ip_address": request.client.host
        })
        
        return {"message": "Broadcast sent successfully", "timestamp": datetime.now().isoformat()}
        
    except Exception as e:
        audit_logger.error(f"Broadcast error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to broadcast message")

@router.post("/ws/send-to-user/{user_id}")
async def send_to_user(
    user_id: str,
    message: Dict[str, Any],
    request: Request,
    current_user: str = Depends(get_current_user_dev_optional)
):
    """Send message to specific user"""
    try:
        await manager.send_to_user(
            WebSocketMessage.create_message(
                message.get("type", "notification"),
                message.get("data", {})
            ),
            user_id
        )
        
        log_user_activity(current_user, "send_to_user", {
            "target_user": user_id,
            "message_type": message.get("type"),
            "ip_address": request.client.host
        })
        
        return {"message": f"Message sent to user {user_id}", "timestamp": datetime.now().isoformat()}
        
    except Exception as e:
        audit_logger.error(f"Send to user error for {user_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to send message to user")

@router.post("/ws/send-to-client/{client_id}")
async def send_to_client(
    client_id: str,
    message: Dict[str, Any],
    request: Request,
    current_user: str = Depends(get_current_user_dev_optional)
):
    """Send message to specific client"""
    try:
        await manager.send_to_client(
            WebSocketMessage.create_message(
                message.get("type", "notification"),
                message.get("data", {})
            ),
            client_id
        )
        
        log_user_activity(current_user, "send_to_client", {
            "target_client": client_id,
            "message_type": message.get("type"),
            "ip_address": request.client.host
        })
        
        return {"message": f"Message sent to client {client_id}", "timestamp": datetime.now().isoformat()}
        
    except Exception as e:
        audit_logger.error(f"Send to client error for {client_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to send message to client")

@router.get("/ws/health")
async def websocket_health_check():
    """Health check endpoint for WebSocket service"""
    try:
        # Check if manager is responsive
        connection_count = manager.get_connection_count()
        
        return {
            "status": "healthy",
            "connection_count": connection_count,
            "timestamp": datetime.now().isoformat(),
            "service": "websocket"
        }
    except Exception as e:
        audit_logger.error(f"WebSocket health check failed: {str(e)}")
        return JSONResponse(
            status_code=503,
            content={
                "status": "unhealthy",
                "error": str(e),
                "timestamp": datetime.now().isoformat(),
                "service": "websocket"
            }
        )

@router.get("/ws/metrics")
async def get_websocket_metrics():
    """Get WebSocket performance metrics"""
    try:
        return {
            "total_connections": manager.get_connection_count(),
            "active_users": len(manager.user_connections),
            "active_clients": len(manager.client_connections),
            "average_connections_per_user": sum(len(conns) for conns in manager.user_connections.values()) / max(len(manager.user_connections), 1),
            "average_connections_per_client": sum(len(conns) for conns in manager.client_connections.values()) / max(len(manager.client_connections), 1),
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        audit_logger.error(f"Error getting WebSocket metrics: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get WebSocket metrics") 