"""
WebSocket Manager for Real-time Features
Handles WebSocket connections, broadcasting, and real-time updates
"""

import json
import asyncio
from typing import Dict, List, Set, Optional, Any
from fastapi import WebSocket, WebSocketDisconnect
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class ConnectionManager:
    """Manages WebSocket connections and broadcasting"""
    
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
        self.user_connections: Dict[str, Set[str]] = {}  # user_id -> set of connection_ids
        self.client_connections: Dict[str, Set[str]] = {}  # client_id -> set of connection_ids
        self.connection_users: Dict[str, str] = {}  # connection_id -> user_id
        self.connection_clients: Dict[str, str] = {}  # connection_id -> client_id
    
    async def connect(self, websocket: WebSocket, user_id: str, client_id: Optional[str] = None):
        """Connect a new WebSocket client"""
        await websocket.accept()
        connection_id = f"{user_id}_{datetime.now().timestamp()}"
        
        self.active_connections[connection_id] = websocket
        self.connection_users[connection_id] = user_id
        
        if user_id not in self.user_connections:
            self.user_connections[user_id] = set()
        self.user_connections[user_id].add(connection_id)
        
        if client_id:
            self.connection_clients[connection_id] = client_id
            if client_id not in self.client_connections:
                self.client_connections[client_id] = set()
            self.client_connections[client_id].add(connection_id)
        
        logger.info(f"WebSocket connected: {connection_id} for user {user_id}")
        
        # Send welcome message
        await self.send_personal_message({
            "type": "connection_established",
            "connection_id": connection_id,
            "timestamp": datetime.now().isoformat()
        }, connection_id)
        
        return connection_id
    
    def disconnect(self, connection_id: str):
        """Disconnect a WebSocket client"""
        if connection_id in self.active_connections:
            user_id = self.connection_users.get(connection_id)
            client_id = self.connection_clients.get(connection_id)
            
            # Remove from active connections
            del self.active_connections[connection_id]
            
            # Remove from user connections
            if user_id and user_id in self.user_connections:
                self.user_connections[user_id].discard(connection_id)
                if not self.user_connections[user_id]:
                    del self.user_connections[user_id]
            
            # Remove from client connections
            if client_id and client_id in self.client_connections:
                self.client_connections[client_id].discard(connection_id)
                if not self.client_connections[client_id]:
                    del self.client_connections[client_id]
            
            # Clean up mappings
            if connection_id in self.connection_users:
                del self.connection_users[connection_id]
            if connection_id in self.connection_clients:
                del self.connection_clients[connection_id]
            
            logger.info(f"WebSocket disconnected: {connection_id}")
    
    async def send_personal_message(self, message: dict, connection_id: str):
        """Send message to specific connection"""
        if connection_id in self.active_connections:
            try:
                await self.active_connections[connection_id].send_text(json.dumps(message))
            except Exception as e:
                logger.error(f"Failed to send message to {connection_id}: {e}")
                self.disconnect(connection_id)
    
    async def send_to_user(self, message: dict, user_id: str):
        """Send message to all connections of a specific user"""
        if user_id in self.user_connections:
            for connection_id in self.user_connections[user_id].copy():
                await self.send_personal_message(message, connection_id)
    
    async def send_to_client(self, message: dict, client_id: str):
        """Send message to all connections of a specific client"""
        if client_id in self.client_connections:
            for connection_id in self.client_connections[client_id].copy():
                await self.send_personal_message(message, connection_id)
    
    async def broadcast(self, message: dict):
        """Broadcast message to all connected clients"""
        disconnected = []
        for connection_id, websocket in self.active_connections.items():
            try:
                await websocket.send_text(json.dumps(message))
            except Exception as e:
                logger.error(f"Failed to broadcast to {connection_id}: {e}")
                disconnected.append(connection_id)
        
        # Clean up disconnected connections
        for connection_id in disconnected:
            self.disconnect(connection_id)
    
    async def broadcast_to_admins(self, message: dict):
        """Broadcast message to admin users only"""
        # This would require checking user roles
        # For now, broadcast to all (implement role checking later)
        await self.broadcast(message)
    
    def get_connection_count(self) -> int:
        """Get total number of active connections"""
        return len(self.active_connections)
    
    def get_user_connection_count(self, user_id: str) -> int:
        """Get number of connections for a specific user"""
        return len(self.user_connections.get(user_id, set()))
    
    def get_client_connection_count(self, client_id: str) -> int:
        """Get number of connections for a specific client"""
        return len(self.client_connections.get(client_id, set()))

# Global connection manager instance
manager = ConnectionManager()

class WebSocketMessage:
    """WebSocket message types and handlers"""
    
    @staticmethod
    def create_message(message_type: str, data: Any, **kwargs) -> dict:
        """Create a standardized WebSocket message"""
        return {
            "type": message_type,
            "data": data,
            "timestamp": datetime.now().isoformat(),
            **kwargs
        }
    
    @staticmethod
    def notification(title: str, message: str, level: str = "info") -> dict:
        """Create notification message"""
        return WebSocketMessage.create_message("notification", {
            "title": title,
            "message": message,
            "level": level
        })
    
    @staticmethod
    def activity_log(action: str, details: dict, user_id: str) -> dict:
        """Create activity log message"""
        return WebSocketMessage.create_message("activity_log", {
            "action": action,
            "details": details,
            "user_id": user_id
        })
    
    @staticmethod
    def real_time_update(update_type: str, data: Any) -> dict:
        """Create real-time update message"""
        return WebSocketMessage.create_message("real_time_update", {
            "update_type": update_type,
            "data": data
        })
    
    @staticmethod
    def system_status(status: dict) -> dict:
        """Create system status message"""
        return WebSocketMessage.create_message("system_status", status)
    
    @staticmethod
    def communication_event(event_type: str, data: dict) -> dict:
        """Create communication event message"""
        return WebSocketMessage.create_message("communication_event", {
            "event_type": event_type,
            "data": data
        })

async def handle_websocket_connection(websocket: WebSocket, user_id: str, client_id: Optional[str] = None):
    """Handle WebSocket connection lifecycle"""
    connection_id = await manager.connect(websocket, user_id, client_id)
    
    try:
        while True:
            # Receive message from client
            data = await websocket.receive_text()
            message = json.loads(data)
            
            # Handle different message types
            await handle_websocket_message(connection_id, message, user_id)
            
    except WebSocketDisconnect:
        manager.disconnect(connection_id)
    except Exception as e:
        logger.error(f"WebSocket error for {connection_id}: {e}")
        manager.disconnect(connection_id)

async def handle_websocket_message(connection_id: str, message: dict, user_id: str):
    """Handle incoming WebSocket messages"""
    message_type = message.get("type")
    
    if message_type == "ping":
        # Respond to ping
        await manager.send_personal_message({
            "type": "pong",
            "timestamp": datetime.now().isoformat()
        }, connection_id)
    
    elif message_type == "subscribe":
        # Handle subscription requests
        subscription_type = message.get("subscription_type")
        if subscription_type == "notifications":
            # Subscribe to notifications
            pass
        elif subscription_type == "activity":
            # Subscribe to activity feed
            pass
    
    elif message_type == "unsubscribe":
        # Handle unsubscription requests
        pass
    
    else:
        # Unknown message type
        logger.warning(f"Unknown WebSocket message type: {message_type}")

# Real-time event handlers
async def broadcast_notification(title: str, message: str, level: str = "info"):
    """Broadcast notification to all connected clients"""
    notification = WebSocketMessage.notification(title, message, level)
    await manager.broadcast(notification)

async def broadcast_to_admins(message: dict):
    """Broadcast message to admin users only"""
    # This would require checking user roles
    # For now, broadcast to all (implement role checking later)
    await manager.broadcast(message)

async def broadcast_activity_log(action: str, details: dict, user_id: str):
    """Broadcast activity log to relevant users"""
    activity = WebSocketMessage.activity_log(action, details, user_id)
    await manager.broadcast(activity)

async def broadcast_real_time_update(update_type: str, data: Any):
    """Broadcast real-time update"""
    update = WebSocketMessage.real_time_update(update_type, data)
    await manager.broadcast(update)

async def broadcast_system_status(status: dict):
    """Broadcast system status update"""
    status_msg = WebSocketMessage.system_status(status)
    await manager.broadcast(status_msg)

async def broadcast_communication_event(event_type: str, data: dict):
    """Broadcast communication event"""
    event = WebSocketMessage.communication_event(event_type, data)
    await manager.broadcast(event)

# Background task for periodic updates
async def periodic_status_updates():
    """Send periodic system status updates"""
    while True:
        try:
            # Get system status
            status = {
                "uptime": "99.9%",
                "active_connections": manager.get_connection_count(),
                "system_load": "normal",
                "last_update": datetime.now().isoformat()
            }
            
            await broadcast_system_status(status)
            
            # Wait for 30 seconds before next update
            await asyncio.sleep(30)
            
        except Exception as e:
            logger.error(f"Error in periodic status updates: {e}")
            await asyncio.sleep(60)  # Wait longer on error
