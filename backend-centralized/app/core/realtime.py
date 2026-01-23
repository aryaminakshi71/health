"""
Real-time Data Synchronization Service
Handles WebSocket connections and real-time updates across all applications
"""

import asyncio
import json
import logging
from typing import Dict, List, Set, Any, Optional
from datetime import datetime
from fastapi import WebSocket, WebSocketDisconnect
from enum import Enum

logger = logging.getLogger(__name__)

class EventType(Enum):
    """Types of real-time events"""
    TICKET_CREATED = "ticket_created"
    TICKET_UPDATED = "ticket_updated"
    TICKET_RESOLVED = "ticket_resolved"
    ALERT_CREATED = "alert_created"
    ALERT_ACKNOWLEDGED = "alert_acknowledged"
    CAMERA_STATUS_CHANGED = "camera_status_changed"
    RECORDING_STARTED = "recording_started"
    RECORDING_STOPPED = "recording_stopped"
    MOTION_DETECTED = "motion_detected"
    HIPAA_VIOLATION = "hipaa_violation"
    SYSTEM_HEALTH_UPDATE = "system_health_update"
    USER_ACTIVITY = "user_activity"

class RealtimeManager:
    """Manages WebSocket connections and real-time event broadcasting"""
    
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}
        self.user_subscriptions: Dict[str, Set[str]] = {}
        self.event_history: List[Dict[str, Any]] = []
        self.max_history = 1000
        
    async def connect(self, websocket: WebSocket, user_id: str, app_name: str):
        """Connect a new WebSocket client"""
        await websocket.accept()
        
        if app_name not in self.active_connections:
            self.active_connections[app_name] = []
        
        self.active_connections[app_name].append(websocket)
        
        if user_id not in self.user_subscriptions:
            self.user_subscriptions[user_id] = set()
        
        self.user_subscriptions[user_id].add(app_name)
        
        logger.info(f"User {user_id} connected to {app_name}")
        
        # Send initial connection confirmation
        await self.send_personal_message({
            "type": "connection_established",
            "app": app_name,
            "user_id": user_id,
            "timestamp": datetime.now().isoformat()
        }, websocket)
    
    def disconnect(self, websocket: WebSocket, user_id: str, app_name: str):
        """Disconnect a WebSocket client"""
        if app_name in self.active_connections:
            self.active_connections[app_name].remove(websocket)
            if not self.active_connections[app_name]:
                del self.active_connections[app_name]
        
        if user_id in self.user_subscriptions:
            self.user_subscriptions[user_id].discard(app_name)
            if not self.user_subscriptions[user_id]:
                del self.user_subscriptions[user_id]
        
        logger.info(f"User {user_id} disconnected from {app_name}")
    
    async def send_personal_message(self, message: Dict[str, Any], websocket: WebSocket):
        """Send a message to a specific WebSocket connection"""
        try:
            await websocket.send_text(json.dumps(message))
        except Exception as e:
            logger.error(f"Error sending personal message: {e}")
    
    async def broadcast_to_app(self, app_name: str, message: Dict[str, Any]):
        """Broadcast a message to all connections of a specific app"""
        if app_name not in self.active_connections:
            return
        
        disconnected = []
        for connection in self.active_connections[app_name]:
            try:
                await connection.send_text(json.dumps(message))
            except Exception as e:
                logger.error(f"Error broadcasting to {app_name}: {e}")
                disconnected.append(connection)
        
        # Remove disconnected connections
        for connection in disconnected:
            self.active_connections[app_name].remove(connection)
    
    async def broadcast_to_user(self, user_id: str, message: Dict[str, Any]):
        """Broadcast a message to all connections of a specific user"""
        if user_id not in self.user_subscriptions:
            return
        
        for app_name in self.user_subscriptions[user_id]:
            await self.broadcast_to_app(app_name, message)
    
    async def broadcast_event(self, event_type: EventType, data: Dict[str, Any], 
                            target_app: Optional[str] = None, target_user: Optional[str] = None):
        """Broadcast an event to relevant connections"""
        event = {
            "type": "event",
            "event_type": event_type.value,
            "data": data,
            "timestamp": datetime.now().isoformat()
        }
        
        # Add to event history
        self.event_history.append(event)
        if len(self.event_history) > self.max_history:
            self.event_history.pop(0)
        
        # Broadcast based on target
        if target_user:
            await self.broadcast_to_user(target_user, event)
        elif target_app:
            await self.broadcast_to_app(target_app, event)
        else:
            # Broadcast to all connected apps
            for app_name in self.active_connections:
                await self.broadcast_to_app(app_name, event)
    
    async def send_hipaa_alert(self, violation_type: str, details: Dict[str, Any], 
                             user_id: str, app_name: str):
        """Send HIPAA violation alert"""
        alert = {
            "type": "hipaa_violation",
            "violation_type": violation_type,
            "details": details,
            "user_id": user_id,
            "app_name": app_name,
            "timestamp": datetime.now().isoformat(),
            "severity": "high"
        }
        
        # Log the violation
        logger.warning(f"HIPAA violation detected: {violation_type} by user {user_id} in {app_name}")
        
        # Broadcast to compliance and admin users
        await self.broadcast_event(EventType.HIPAA_VIOLATION, alert, target_app="compliance-guardian")
    
    async def send_system_health_update(self, app_name: str, health_data: Dict[str, Any]):
        """Send system health update"""
        health_update = {
            "app_name": app_name,
            "health_data": health_data,
            "timestamp": datetime.now().isoformat()
        }
        
        await self.broadcast_event(EventType.SYSTEM_HEALTH_UPDATE, health_update)
    
    async def send_user_activity(self, user_id: str, activity: str, app_name: str, 
                               details: Optional[Dict[str, Any]] = None):
        """Send user activity notification"""
        activity_data = {
            "user_id": user_id,
            "activity": activity,
            "app_name": app_name,
            "details": details or {},
            "timestamp": datetime.now().isoformat()
        }
        
        await self.broadcast_event(EventType.USER_ACTIVITY, activity_data)
    
    def get_connection_stats(self) -> Dict[str, Any]:
        """Get connection statistics"""
        stats = {
            "total_connections": sum(len(connections) for connections in self.active_connections.values()),
            "apps_connected": list(self.active_connections.keys()),
            "users_connected": len(self.user_subscriptions),
            "event_history_count": len(self.event_history)
        }
        
        for app_name, connections in self.active_connections.items():
            stats[f"{app_name}_connections"] = len(connections)
        
        return stats

# Global instance
realtime_manager = RealtimeManager()

class RealtimeService:
    """Service class for real-time operations"""
    
    @staticmethod
    async def notify_ticket_created(ticket_data: Dict[str, Any], user_id: str):
        """Notify when a ticket is created"""
        await realtime_manager.broadcast_event(
            EventType.TICKET_CREATED,
            ticket_data,
            target_app="support-desk"
        )
        
        # Send user activity
        await realtime_manager.send_user_activity(
            user_id, "ticket_created", "support-desk", 
            {"ticket_id": ticket_data.get("id")}
        )
    
    @staticmethod
    async def notify_ticket_updated(ticket_data: Dict[str, Any], user_id: str):
        """Notify when a ticket is updated"""
        await realtime_manager.broadcast_event(
            EventType.TICKET_UPDATED,
            ticket_data,
            target_app="support-desk"
        )
        
        await realtime_manager.send_user_activity(
            user_id, "ticket_updated", "support-desk",
            {"ticket_id": ticket_data.get("id")}
        )
    
    @staticmethod
    async def notify_alert_created(alert_data: Dict[str, Any], user_id: str):
        """Notify when an alert is created"""
        await realtime_manager.broadcast_event(
            EventType.ALERT_CREATED,
            alert_data,
            target_app="surveillance-guard"
        )
        
        await realtime_manager.send_user_activity(
            user_id, "alert_created", "surveillance-guard",
            {"alert_id": alert_data.get("id")}
        )
    
    @staticmethod
    async def notify_camera_status_changed(camera_data: Dict[str, Any], user_id: str):
        """Notify when camera status changes"""
        await realtime_manager.broadcast_event(
            EventType.CAMERA_STATUS_CHANGED,
            camera_data,
            target_app="surveillance-guard"
        )
        
        await realtime_manager.send_user_activity(
            user_id, "camera_status_changed", "surveillance-guard",
            {"camera_id": camera_data.get("id")}
        )
    
    @staticmethod
    async def notify_motion_detected(camera_id: str, location: str, user_id: str):
        """Notify when motion is detected"""
        motion_data = {
            "camera_id": camera_id,
            "location": location,
            "timestamp": datetime.now().isoformat()
        }
        
        await realtime_manager.broadcast_event(
            EventType.MOTION_DETECTED,
            motion_data,
            target_app="surveillance-guard"
        )
        
        await realtime_manager.send_user_activity(
            user_id, "motion_detected", "surveillance-guard",
            {"camera_id": camera_id, "location": location}
        )
    
    @staticmethod
    async def notify_hipaa_violation(violation_type: str, details: Dict[str, Any], 
                                   user_id: str, app_name: str):
        """Notify HIPAA violation"""
        await realtime_manager.send_hipaa_alert(violation_type, details, user_id, app_name)
    
    @staticmethod
    async def send_system_health_update(app_name: str, health_data: Dict[str, Any]):
        """Send system health update"""
        await realtime_manager.send_system_health_update(app_name, health_data) 