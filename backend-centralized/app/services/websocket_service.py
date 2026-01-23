"""
WebSocket Service for Real-time Surveillance Updates
"""

import asyncio
import json
import logging
from typing import Dict, List, Set, Optional, Any
from datetime import datetime
from fastapi import WebSocket, WebSocketDisconnect
from enum import Enum

logger = logging.getLogger(__name__)

class ConnectionType(Enum):
    SURVEILLANCE = "surveillance"
    ANALYTICS = "analytics"
    ADMIN = "admin"

class WebSocketConnectionManager:
    """Manages WebSocket connections for real-time surveillance updates"""
    
    def __init__(self):
        self.active_connections: Dict[ConnectionType, List[WebSocket]] = {
            ConnectionType.SURVEILLANCE: [],
            ConnectionType.ANALYTICS: [],
            ConnectionType.ADMIN: []
        }
        self.camera_subscriptions: Dict[str, Set[WebSocket]] = {}
        self.connection_info: Dict[WebSocket, Dict[str, Any]] = {}
        
    async def connect(self, websocket: WebSocket, connection_type: ConnectionType = ConnectionType.SURVEILLANCE):
        """Accept a new WebSocket connection"""
        await websocket.accept()
        self.active_connections[connection_type].append(websocket)
        self.connection_info[websocket] = {
            "type": connection_type,
            "connected_at": datetime.utcnow(),
            "subscribed_cameras": set(),
            "last_activity": datetime.utcnow()
        }
        logger.info(f"WebSocket connected: {connection_type.value} (total: {len(self.active_connections[connection_type])})")
        
    def disconnect(self, websocket: WebSocket):
        """Remove a WebSocket connection"""
        # Remove from active connections
        for connection_type, connections in self.active_connections.items():
            if websocket in connections:
                connections.remove(websocket)
                logger.info(f"WebSocket disconnected: {connection_type.value} (total: {len(connections)})")
                break
        
        # Remove from camera subscriptions
        if websocket in self.connection_info:
            subscribed_cameras = self.connection_info[websocket].get("subscribed_cameras", set())
            for camera_id in subscribed_cameras:
                if camera_id in self.camera_subscriptions:
                    self.camera_subscriptions[camera_id].discard(websocket)
                    if not self.camera_subscriptions[camera_id]:
                        del self.camera_subscriptions[camera_id]
        
        # Remove connection info
        if websocket in self.connection_info:
            del self.connection_info[websocket]
    
    async def send_personal_message(self, message: str, websocket: WebSocket):
        """Send a message to a specific WebSocket connection"""
        try:
            await websocket.send_text(message)
            self.connection_info[websocket]["last_activity"] = datetime.utcnow()
        except Exception as e:
            logger.error(f"Failed to send personal message: {e}")
            self.disconnect(websocket)
    
    async def broadcast_to_type(self, message: str, connection_type: ConnectionType):
        """Broadcast a message to all connections of a specific type"""
        disconnected = []
        for websocket in self.active_connections[connection_type]:
            try:
                await websocket.send_text(message)
                self.connection_info[websocket]["last_activity"] = datetime.utcnow()
            except Exception as e:
                logger.error(f"Failed to broadcast to {connection_type.value}: {e}")
                disconnected.append(websocket)
        
        # Clean up disconnected connections
        for websocket in disconnected:
            self.disconnect(websocket)
    
    async def broadcast_to_camera(self, camera_id: str, message: str):
        """Broadcast a message to all connections subscribed to a specific camera"""
        if camera_id not in self.camera_subscriptions:
            return
        
        disconnected = []
        for websocket in self.camera_subscriptions[camera_id]:
            try:
                await websocket.send_text(message)
                self.connection_info[websocket]["last_activity"] = datetime.utcnow()
            except Exception as e:
                logger.error(f"Failed to broadcast to camera {camera_id}: {e}")
                disconnected.append(websocket)
        
        # Clean up disconnected connections
        for websocket in disconnected:
            self.disconnect(websocket)
    
    def subscribe_to_camera(self, websocket: WebSocket, camera_id: str):
        """Subscribe a connection to a specific camera"""
        if camera_id not in self.camera_subscriptions:
            self.camera_subscriptions[camera_id] = set()
        
        self.camera_subscriptions[camera_id].add(websocket)
        self.connection_info[websocket]["subscribed_cameras"].add(camera_id)
        logger.info(f"WebSocket subscribed to camera {camera_id}")
    
    def unsubscribe_from_camera(self, websocket: WebSocket, camera_id: str):
        """Unsubscribe a connection from a specific camera"""
        if camera_id in self.camera_subscriptions:
            self.camera_subscriptions[camera_id].discard(websocket)
            if not self.camera_subscriptions[camera_id]:
                del self.camera_subscriptions[camera_id]
        
        if websocket in self.connection_info:
            self.connection_info[websocket]["subscribed_cameras"].discard(camera_id)
        logger.info(f"WebSocket unsubscribed from camera {camera_id}")
    
    def get_connection_stats(self) -> Dict[str, Any]:
        """Get statistics about active connections"""
        return {
            "total_connections": sum(len(connections) for connections in self.active_connections.values()),
            "connections_by_type": {
                connection_type.value: len(connections) 
                for connection_type, connections in self.active_connections.items()
            },
            "camera_subscriptions": {
                camera_id: len(subscribers) 
                for camera_id, subscribers in self.camera_subscriptions.items()
            },
            "active_cameras": len(self.camera_subscriptions)
        }

class SurveillanceWebSocketService:
    """Service for handling surveillance-specific WebSocket operations"""
    
    def __init__(self, manager: WebSocketConnectionManager):
        self.manager = manager
    
    async def broadcast_motion_event(self, camera_id: str, event_data: Dict[str, Any]):
        """Broadcast a motion detection event"""
        message = {
            "type": "surveillance_event",
            "event_type": "motion",
            "camera_id": camera_id,
            "timestamp": datetime.utcnow().isoformat(),
            "data": event_data
        }
        await self.manager.broadcast_to_camera(camera_id, json.dumps(message))
        await self.manager.broadcast_to_type(json.dumps(message), ConnectionType.SURVEILLANCE)
    
    async def broadcast_face_recognition(self, camera_id: str, recognition_data: Dict[str, Any]):
        """Broadcast a face recognition event"""
        message = {
            "type": "surveillance_event",
            "event_type": "face_recognition",
            "camera_id": camera_id,
            "timestamp": datetime.utcnow().isoformat(),
            "data": recognition_data
        }
        await self.manager.broadcast_to_camera(camera_id, json.dumps(message))
        await self.manager.broadcast_to_type(json.dumps(message), ConnectionType.SURVEILLANCE)
    
    async def broadcast_behavior_analysis(self, camera_id: str, behavior_data: Dict[str, Any]):
        """Broadcast a behavior analysis event"""
        message = {
            "type": "surveillance_event",
            "event_type": "behavior_analysis",
            "camera_id": camera_id,
            "timestamp": datetime.utcnow().isoformat(),
            "data": behavior_data
        }
        await self.manager.broadcast_to_camera(camera_id, json.dumps(message))
        await self.manager.broadcast_to_type(json.dumps(message), ConnectionType.SURVEILLANCE)
    
    async def broadcast_predictive_alert(self, alert_data: Dict[str, Any]):
        """Broadcast a predictive alert"""
        message = {
            "type": "surveillance_event",
            "event_type": "predictive_alert",
            "timestamp": datetime.utcnow().isoformat(),
            "data": alert_data
        }
        await self.manager.broadcast_to_type(json.dumps(message), ConnectionType.SURVEILLANCE)
        await self.manager.broadcast_to_type(json.dumps(message), ConnectionType.ADMIN)
    
    async def broadcast_risk_assessment(self, camera_id: str, assessment_data: Dict[str, Any]):
        """Broadcast a risk assessment update"""
        message = {
            "type": "surveillance_event",
            "event_type": "risk_assessment",
            "camera_id": camera_id,
            "timestamp": datetime.utcnow().isoformat(),
            "data": assessment_data
        }
        await self.manager.broadcast_to_camera(camera_id, json.dumps(message))
        await self.manager.broadcast_to_type(json.dumps(message), ConnectionType.SURVEILLANCE)
    
    async def broadcast_system_status(self, status_data: Dict[str, Any]):
        """Broadcast system status updates"""
        message = {
            "type": "system_status",
            "timestamp": datetime.utcnow().isoformat(),
            "data": status_data
        }
        await self.manager.broadcast_to_type(json.dumps(message), ConnectionType.SURVEILLANCE)
        await self.manager.broadcast_to_type(json.dumps(message), ConnectionType.ADMIN)
    
    async def broadcast_analytics_update(self, analytics_data: Dict[str, Any]):
        """Broadcast analytics updates"""
        message = {
            "type": "analytics_update",
            "timestamp": datetime.utcnow().isoformat(),
            "data": analytics_data
        }
        await self.manager.broadcast_to_type(json.dumps(message), ConnectionType.ANALYTICS)

# Global instances
connection_manager = WebSocketConnectionManager()
surveillance_websocket_service = SurveillanceWebSocketService(connection_manager)

async def handle_websocket_connection(websocket: WebSocket, connection_type: ConnectionType = ConnectionType.SURVEILLANCE):
    """Handle WebSocket connection lifecycle"""
    await connection_manager.connect(websocket, connection_type)
    
    try:
        while True:
            # Receive message from client
            data = await websocket.receive_text()
            message = json.loads(data)
            
            # Update last activity
            if websocket in connection_manager.connection_info:
                connection_manager.connection_info[websocket]["last_activity"] = datetime.utcnow()
            
            # Handle different message types
            await handle_websocket_message(websocket, message)
            
    except WebSocketDisconnect:
        logger.info("WebSocket client disconnected")
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
    finally:
        connection_manager.disconnect(websocket)

async def handle_websocket_message(websocket: WebSocket, message: Dict[str, Any]):
    """Handle incoming WebSocket messages"""
    message_type = message.get("type")
    
    try:
        if message_type == "subscribe_camera":
            camera_id = message.get("data", {}).get("camera_id")
            if camera_id:
                connection_manager.subscribe_to_camera(websocket, camera_id)
                await connection_manager.send_personal_message(
                    json.dumps({
                        "type": "subscription_confirmed",
                        "camera_id": camera_id,
                        "timestamp": datetime.utcnow().isoformat()
                    }),
                    websocket
                )
        
        elif message_type == "unsubscribe_camera":
            camera_id = message.get("data", {}).get("camera_id")
            if camera_id:
                connection_manager.unsubscribe_from_camera(websocket, camera_id)
                await connection_manager.send_personal_message(
                    json.dumps({
                        "type": "unsubscription_confirmed",
                        "camera_id": camera_id,
                        "timestamp": datetime.utcnow().isoformat()
                    }),
                    websocket
                )
        
        elif message_type == "request_analytics":
            # Send current analytics data
            analytics_data = {
                "type": "analytics_response",
                "timestamp": datetime.utcnow().isoformat(),
                "data": {
                    "connection_stats": connection_manager.get_connection_stats(),
                    "system_status": "healthy"
                }
            }
            await connection_manager.send_personal_message(json.dumps(analytics_data), websocket)
        
        elif message_type == "ping":
            # Respond to ping with pong
            await connection_manager.send_personal_message(
                json.dumps({
                    "type": "pong",
                    "timestamp": datetime.utcnow().isoformat()
                }),
                websocket
            )
        
        else:
            logger.warning(f"Unknown WebSocket message type: {message_type}")
    
    except Exception as e:
        logger.error(f"Error handling WebSocket message: {e}")
        await connection_manager.send_personal_message(
            json.dumps({
                "type": "error",
                "message": "Failed to process message",
                "timestamp": datetime.utcnow().isoformat()
            }),
            websocket
        ) 