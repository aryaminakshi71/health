"""
Enhanced Notification Service with Real-time Capabilities
Handles email, SMS, push notifications, and real-time WebSocket notifications
"""

import asyncio
import logging
from datetime import datetime
from typing import List, Dict, Any, Optional
from enum import Enum

from app.core.websocket import (
    manager, WebSocketMessage, broadcast_notification,
    broadcast_to_admins, broadcast_communication_event
)
from app.core.logging import audit_logger, log_user_activity

logger = logging.getLogger(__name__)

class NotificationType(Enum):
    EMAIL = "email"
    SMS = "sms"
    PUSH = "push"
    WEBSOCKET = "websocket"
    SYSTEM = "system"
    BILLING = "billing"
    SECURITY = "security"
    COMMUNICATION = "communication"

class NotificationPriority(Enum):
    LOW = "low"
    NORMAL = "normal"
    HIGH = "high"
    URGENT = "urgent"

class NotificationService:
    """Enhanced notification service with real-time capabilities"""
    
    def __init__(self):
        self.notification_queue = asyncio.Queue()
        self.active_notifications = {}
        self.notification_history = []
        
    async def send_notification(
        self,
        notification_type: NotificationType,
        title: str,
        message: str,
        recipients: List[str] = None,
        priority: NotificationPriority = NotificationPriority.NORMAL,
        data: Dict[str, Any] = None,
        user_id: str = None,
        client_id: str = None
    ) -> Dict[str, Any]:
        """Send notification through multiple channels"""
        
        notification_id = f"notif_{datetime.now().timestamp()}"
        notification_data = {
            "id": notification_id,
            "type": notification_type.value,
            "title": title,
            "message": message,
            "recipients": recipients or [],
            "priority": priority.value,
            "data": data or {},
            "user_id": user_id,
            "client_id": client_id,
            "timestamp": datetime.now().isoformat(),
            "status": "pending"
        }
        
        try:
            # Add to queue for processing
            await self.notification_queue.put(notification_data)
            
            # Process based on type
            if notification_type == NotificationType.WEBSOCKET:
                await self._send_websocket_notification(notification_data)
            elif notification_type == NotificationType.EMAIL:
                await self._send_email_notification(notification_data)
            elif notification_type == NotificationType.SMS:
                await self._send_sms_notification(notification_data)
            elif notification_type == NotificationType.PUSH:
                await self._send_push_notification(notification_data)
            elif notification_type == NotificationType.SYSTEM:
                await self._send_system_notification(notification_data)
            elif notification_type == NotificationType.BILLING:
                await self._send_billing_notification(notification_data)
            elif notification_type == NotificationType.SECURITY:
                await self._send_security_notification(notification_data)
            elif notification_type == NotificationType.COMMUNICATION:
                await self._send_communication_notification(notification_data)
            
            notification_data["status"] = "sent"
            self.notification_history.append(notification_data)
            
            # Log notification
            log_user_activity(
                user_id or "system",
                "notification_sent",
                {
                    "notification_id": notification_id,
                    "type": notification_type.value,
                    "recipients_count": len(recipients or [])
                }
            )
            
            audit_logger.info(f"Notification sent: {notification_id} - {title}")
            
            return {
                "success": True,
                "notification_id": notification_id,
                "message": "Notification sent successfully"
            }
            
        except Exception as e:
            notification_data["status"] = "failed"
            notification_data["error"] = str(e)
            self.notification_history.append(notification_data)
            
            audit_logger.error(f"Notification failed: {notification_id} - {str(e)}")
            
            return {
                "success": False,
                "notification_id": notification_id,
                "error": str(e)
            }
    
    async def _send_websocket_notification(self, notification_data: Dict[str, Any]):
        """Send real-time WebSocket notification"""
        try:
            # Determine broadcast scope
            if notification_data.get("client_id"):
                # Send to specific client
                await manager.send_to_client(
                    WebSocketMessage.notification(
                        notification_data["title"],
                        notification_data["message"],
                        notification_data.get("priority", "normal")
                    ),
                    notification_data["client_id"]
                )
            elif notification_data.get("user_id"):
                # Send to specific user
                await manager.send_to_user(
                    WebSocketMessage.notification(
                        notification_data["title"],
                        notification_data["message"],
                        notification_data.get("priority", "normal")
                    ),
                    notification_data["user_id"]
                )
            else:
                # Broadcast to all connected clients
                await broadcast_notification(
                    notification_data["title"],
                    notification_data["message"],
                    notification_data.get("priority", "normal")
                )
                
        except Exception as e:
            logger.error(f"WebSocket notification failed: {str(e)}")
            raise
    
    async def _send_email_notification(self, notification_data: Dict[str, Any]):
        """Send email notification"""
        try:
            # Check if SendGrid is configured
            if not hasattr(self, 'sendgrid_enabled') or not self.sendgrid_enabled:
                logger.info("SendGrid email disabled - using demo mode")
                # Simulate email sending
                await asyncio.sleep(0.1)
                return
            
            # Real email sending logic would go here
            # For now, just log the attempt
            logger.info(f"Email notification would be sent: {notification_data['title']}")
            
        except Exception as e:
            logger.error(f"Email notification failed: {str(e)}")
            raise
    
    async def _send_sms_notification(self, notification_data: Dict[str, Any]):
        """Send SMS notification"""
        try:
            # Check if Twilio is configured
            if not hasattr(self, 'twilio_enabled') or not self.twilio_enabled:
                logger.info("SMS service disabled - using demo mode")
                # Simulate SMS sending
                await asyncio.sleep(0.1)
                return
            
            # Real SMS sending logic would go here
            logger.info(f"SMS notification would be sent: {notification_data['title']}")
            
        except Exception as e:
            logger.error(f"SMS notification failed: {str(e)}")
            raise
    
    async def _send_push_notification(self, notification_data: Dict[str, Any]):
        """Send push notification"""
        try:
            # Check if Firebase is configured
            if not hasattr(self, 'firebase_enabled') or not self.firebase_enabled:
                logger.info("Push notification service disabled - using demo mode")
                # Simulate push notification
                await asyncio.sleep(0.1)
                return
            
            # Real push notification logic would go here
            logger.info(f"Push notification would be sent: {notification_data['title']}")
            
        except Exception as e:
            logger.error(f"Push notification failed: {str(e)}")
            raise
    
    async def _send_system_notification(self, notification_data: Dict[str, Any]):
        """Send system-wide notification"""
        try:
            # Broadcast to all connected clients
            await broadcast_notification(
                notification_data["title"],
                notification_data["message"],
                "info"
            )
            
            # Also send to admins specifically
            await broadcast_to_admins(
                WebSocketMessage.notification(
                    f"[SYSTEM] {notification_data['title']}",
                    notification_data["message"],
                    "warning"
                )
            )
            
        except Exception as e:
            logger.error(f"System notification failed: {str(e)}")
            raise
    
    async def _send_billing_notification(self, notification_data: Dict[str, Any]):
        """Send billing-related notification"""
        try:
            # Send to specific client if billing related
            if notification_data.get("client_id"):
                await manager.send_to_client(
                    WebSocketMessage.notification(
                        notification_data["title"],
                        notification_data["message"],
                        "warning"
                    ),
                    notification_data["client_id"]
                )
            else:
                # Send to all clients
                await broadcast_notification(
                    notification_data["title"],
                    notification_data["message"],
                    "warning"
                )
                
        except Exception as e:
            logger.error(f"Billing notification failed: {str(e)}")
            raise
    
    async def _send_security_notification(self, notification_data: Dict[str, Any]):
        """Send security-related notification"""
        try:
            # Always send security notifications to admins
            await broadcast_to_admins(
                WebSocketMessage.notification(
                    f"[SECURITY] {notification_data['title']}",
                    notification_data["message"],
                    "error"
                )
            )
            
            # Log security event
            audit_logger.warning(f"Security notification: {notification_data['title']} - {notification_data['message']}")
            
        except Exception as e:
            logger.error(f"Security notification failed: {str(e)}")
            raise
    
    async def _send_communication_notification(self, notification_data: Dict[str, Any]):
        """Send communication event notification"""
        try:
            # Broadcast communication event
            await broadcast_communication_event(
                notification_data.get("data", {}).get("event_type", "message"),
                notification_data.get("data", {})
            )
            
            # Also send as regular notification
            await broadcast_notification(
                notification_data["title"],
                notification_data["message"],
                "info"
            )
            
        except Exception as e:
            logger.error(f"Communication notification failed: {str(e)}")
            raise
    
    async def get_notification_history(
        self,
        user_id: str = None,
        client_id: str = None,
        limit: int = 50
    ) -> List[Dict[str, Any]]:
        """Get notification history"""
        try:
            filtered_history = self.notification_history
            
            if user_id:
                filtered_history = [n for n in filtered_history if n.get("user_id") == user_id]
            
            if client_id:
                filtered_history = [n for n in filtered_history if n.get("client_id") == client_id]
            
            # Sort by timestamp (newest first) and limit
            filtered_history.sort(key=lambda x: x.get("timestamp", ""), reverse=True)
            
            return filtered_history[:limit]
            
        except Exception as e:
            logger.error(f"Error getting notification history: {str(e)}")
            return []
    
    async def mark_notification_read(self, notification_id: str, user_id: str) -> bool:
        """Mark notification as read"""
        try:
            for notification in self.notification_history:
                if notification.get("id") == notification_id:
                    if "read_by" not in notification:
                        notification["read_by"] = []
                    if user_id not in notification["read_by"]:
                        notification["read_by"].append(user_id)
                    return True
            return False
            
        except Exception as e:
            logger.error(f"Error marking notification as read: {str(e)}")
            return False
    
    async def get_unread_count(self, user_id: str) -> int:
        """Get count of unread notifications for user"""
        try:
            unread_count = 0
            for notification in self.notification_history:
                if notification.get("user_id") == user_id:
                    read_by = notification.get("read_by", [])
                    if user_id not in read_by:
                        unread_count += 1
            return unread_count
            
        except Exception as e:
            logger.error(f"Error getting unread count: {str(e)}")
            return 0
    
    async def clear_notifications(self, user_id: str = None, client_id: str = None) -> bool:
        """Clear notifications for user or client"""
        try:
            if user_id:
                self.notification_history = [
                    n for n in self.notification_history 
                    if n.get("user_id") != user_id
                ]
            elif client_id:
                self.notification_history = [
                    n for n in self.notification_history 
                    if n.get("client_id") != client_id
                ]
            else:
                self.notification_history = []
            
            return True
            
        except Exception as e:
            logger.error(f"Error clearing notifications: {str(e)}")
            return False

# Global notification service instance
notification_service = NotificationService()

# Convenience functions for common notifications
async def send_system_alert(title: str, message: str, priority: str = "normal"):
    """Send system alert to all users"""
    return await notification_service.send_notification(
        NotificationType.SYSTEM,
        title,
        message,
        priority=NotificationPriority(priority)
    )

async def send_user_notification(
    user_id: str,
    title: str,
    message: str,
    notification_type: NotificationType = NotificationType.WEBSOCKET
):
    """Send notification to specific user"""
    return await notification_service.send_notification(
        notification_type,
        title,
        message,
        user_id=user_id
    )

async def send_client_notification(
    client_id: str,
    title: str,
    message: str,
    notification_type: NotificationType = NotificationType.WEBSOCKET
):
    """Send notification to specific client"""
    return await notification_service.send_notification(
        notification_type,
        title,
        message,
        client_id=client_id
    )

async def send_billing_alert(client_id: str, title: str, message: str):
    """Send billing alert to client"""
    return await notification_service.send_notification(
        NotificationType.BILLING,
        title,
        message,
        client_id=client_id,
        priority=NotificationPriority.HIGH
    )

async def send_security_alert(title: str, message: str, data: Dict[str, Any] = None):
    """Send security alert to admins"""
    return await notification_service.send_notification(
        NotificationType.SECURITY,
        title,
        message,
        priority=NotificationPriority.URGENT,
        data=data
    )

async def send_communication_event(
    event_type: str,
    title: str,
    message: str,
    data: Dict[str, Any] = None
):
    """Send communication event notification"""
    return await notification_service.send_notification(
        NotificationType.COMMUNICATION,
        title,
        message,
        data={"event_type": event_type, **data} if data else {"event_type": event_type}
    ) 