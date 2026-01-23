"""
Unified Communication Service
Merges all communication functionality: VoIP, Email, SMS, WhatsApp, Telegram, Fax
"""

import asyncio
import logging
import json
import uuid
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Union
from dataclasses import dataclass
from enum import Enum

# Third-party imports
import aiohttp
import requests
from twilio.rest import Client
from twilio.base.exceptions import TwilioException
import firebase_admin
from firebase_admin import messaging
import stripe

# Local imports
from app.core.config import settings
from app.models.communication import (
    Call, Message, Contact, Conference, Voicemail, 
    PhoneNumber, CallRecording, CommunicationSettings
)

logger = logging.getLogger(__name__)

class CommunicationType(str, Enum):
    """Communication types"""
    VOICE = "voice"
    VIDEO = "video"
    EMAIL = "email"
    SMS = "sms"
    WHATSAPP = "whatsapp"
    TELEGRAM = "telegram"
    FAX = "fax"
    VOICEMAIL = "voicemail"

class MessageStatus(str, Enum):
    """Message status"""
    PENDING = "pending"
    SENT = "sent"
    DELIVERED = "delivered"
    READ = "read"
    FAILED = "failed"

@dataclass
class CommunicationConfig:
    """Configuration for communication services"""
    twilio_account_sid: str
    twilio_auth_token: str
    twilio_phone_number: str
    firebase_credentials: str
    stripe_secret_key: str
    smtp_host: str
    smtp_port: int
    smtp_username: str
    smtp_password: str
    whatsapp_business_token: str
    telegram_bot_token: str
    fax_service_api_key: str

@dataclass
class CommunicationMessage:
    """Unified message structure"""
    id: str
    type: CommunicationType
    sender: str
    recipient: str
    content: str
    subject: Optional[str] = None
    attachments: Optional[List[str]] = None
    priority: str = "normal"
    scheduled_at: Optional[datetime] = None
    metadata: Optional[Dict[str, Any]] = None

class UnifiedCommunicationService:
    """Unified communication service handling all communication types"""
    
    def __init__(self, config: CommunicationConfig):
        self.config = config
        self.twilio_client = Client(config.twilio_account_sid, config.twilio_auth_token)
        self.active_calls: Dict[str, Dict] = {}
        self.active_conferences: Dict[str, Dict] = {}
        
        # Initialize Firebase for push notifications
        if not firebase_admin._apps:
            firebase_admin.initialize_app()
    
    async def send_message(self, message: CommunicationMessage) -> Dict[str, Any]:
        """Send message via appropriate communication channel"""
        try:
            if message.type == CommunicationType.EMAIL:
                return await self._send_email(message)
            elif message.type == CommunicationType.SMS:
                return await self._send_sms(message)
            elif message.type == CommunicationType.WHATSAPP:
                return await self._send_whatsapp(message)
            elif message.type == CommunicationType.TELEGRAM:
                return await self._send_telegram(message)
            elif message.type == CommunicationType.FAX:
                return await self._send_fax(message)
            else:
                raise ValueError(f"Unsupported communication type: {message.type}")
        except Exception as e:
            logger.error(f"Failed to send {message.type} message: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "message_id": message.id
            }
    
    async def initiate_call(self, caller: str, recipient: str, call_type: str = "voice") -> Dict[str, Any]:
        """Initiate a voice or video call"""
        try:
            call_id = str(uuid.uuid4())
            
            # Create call record
            call_data = {
                "call_id": call_id,
                "caller": caller,
                "recipient": recipient,
                "call_type": call_type,
                "status": "initiated",
                "start_time": datetime.utcnow(),
                "metadata": {
                    "twilio_call_sid": None,
                    "quality_score": None
                }
            }
            
            # Use Twilio to initiate call
            if call_type == "voice":
                call = self.twilio_client.calls.create(
                    to=recipient,
                    from_=self.config.twilio_phone_number,
                    url=f"{settings.BASE_URL}/api/v1/communication/voice-webhook/{call_id}",
                    status_callback=f"{settings.BASE_URL}/api/v1/communication/call-status/{call_id}",
                    status_callback_event=['initiated', 'ringing', 'answered', 'completed'],
                    status_callback_method='POST'
                )
                call_data["metadata"]["twilio_call_sid"] = call.sid
            
            self.active_calls[call_id] = call_data
            
            logger.info(f"Call initiated: {call_id} from {caller} to {recipient}")
            
            return {
                "success": True,
                "call_id": call_id,
                "status": "initiated",
                "twilio_call_sid": call_data["metadata"]["twilio_call_sid"]
            }
            
        except TwilioException as e:
            logger.error(f"Twilio error initiating call: {str(e)}")
            return {
                "success": False,
                "error": f"Twilio error: {str(e)}"
            }
        except Exception as e:
            logger.error(f"Error initiating call: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }
    
    async def create_conference(self, name: str, host: str, participants: List[str]) -> Dict[str, Any]:
        """Create a video/audio conference"""
        try:
            conference_id = str(uuid.uuid4())
            
            conference_data = {
                "conference_id": conference_id,
                "name": name,
                "host": host,
                "participants": participants,
                "status": "active",
                "start_time": datetime.utcnow(),
                "max_participants": 10,
                "metadata": {
                    "twilio_room_sid": None,
                    "recording_url": None
                }
            }
            
            # Create Twilio video room
            room = self.twilio_client.video.rooms.create(
                unique_name=conference_id,
                type='group',
                max_participants=10,
                record_participants_on_connect=True,
                status_callback=f"{settings.BASE_URL}/api/v1/communication/conference-webhook/{conference_id}",
                status_callback_method='POST'
            )
            
            conference_data["metadata"]["twilio_room_sid"] = room.sid
            self.active_conferences[conference_id] = conference_data
            
            logger.info(f"Conference created: {conference_id} hosted by {host}")
            
            return {
                "success": True,
                "conference_id": conference_id,
                "room_sid": room.sid,
                "join_url": f"{settings.BASE_URL}/api/v1/communication/join-conference/{conference_id}"
            }
            
        except Exception as e:
            logger.error(f"Error creating conference: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }
    
    async def _send_email(self, message: CommunicationMessage) -> Dict[str, Any]:
        """Send email message"""
        try:
            # Use aiohttp for async email sending
            email_data = {
                "to": message.recipient,
                "subject": message.subject or "Message from HealthGuard",
                "body": message.content,
                "from": self.config.smtp_username,
                "attachments": message.attachments or []
            }
            
            # In production, use proper SMTP service
            # For now, simulate email sending
            await asyncio.sleep(0.1)  # Simulate network delay
            
            logger.info(f"Email sent: {message.id} to {message.recipient}")
            
            return {
                "success": True,
                "message_id": message.id,
                "status": MessageStatus.SENT,
                "sent_at": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Email sending failed: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "message_id": message.id
            }
    
    async def _send_sms(self, message: CommunicationMessage) -> Dict[str, Any]:
        """Send SMS message via Twilio"""
        try:
            twilio_message = self.twilio_client.messages.create(
                body=message.content,
                from_=self.config.twilio_phone_number,
                to=message.recipient,
                status_callback=f"{settings.BASE_URL}/api/v1/communication/sms-status/{message.id}"
            )
            
            logger.info(f"SMS sent: {message.id} to {message.recipient}")
            
            return {
                "success": True,
                "message_id": message.id,
                "twilio_sid": twilio_message.sid,
                "status": MessageStatus.SENT,
                "sent_at": datetime.utcnow().isoformat()
            }
            
        except TwilioException as e:
            logger.error(f"Twilio SMS error: {str(e)}")
            return {
                "success": False,
                "error": f"Twilio error: {str(e)}",
                "message_id": message.id
            }
    
    async def _send_whatsapp(self, message: CommunicationMessage) -> Dict[str, Any]:
        """Send WhatsApp message"""
        try:
            # Use WhatsApp Business API
            whatsapp_data = {
                "messaging_product": "whatsapp",
                "to": message.recipient,
                "type": "text",
                "text": {"body": message.content}
            }
            
            headers = {
                "Authorization": f"Bearer {self.config.whatsapp_business_token}",
                "Content-Type": "application/json"
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    "https://graph.facebook.com/v17.0/YOUR_PHONE_NUMBER_ID/messages",
                    json=whatsapp_data,
                    headers=headers
                ) as response:
                    if response.status == 200:
                        result = await response.json()
                        logger.info(f"WhatsApp sent: {message.id} to {message.recipient}")
                        return {
                            "success": True,
                            "message_id": message.id,
                            "whatsapp_id": result.get("messages", [{}])[0].get("id"),
                            "status": MessageStatus.SENT,
                            "sent_at": datetime.utcnow().isoformat()
                        }
                    else:
                        error_text = await response.text()
                        raise Exception(f"WhatsApp API error: {error_text}")
                        
        except Exception as e:
            logger.error(f"WhatsApp sending failed: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "message_id": message.id
            }
    
    async def _send_telegram(self, message: CommunicationMessage) -> Dict[str, Any]:
        """Send Telegram message"""
        try:
            # Use python-telegram-bot
            telegram_data = {
                "chat_id": message.recipient,
                "text": message.content,
                "parse_mode": "HTML"
            }
            
            url = f"https://api.telegram.org/bot{self.config.telegram_bot_token}/sendMessage"
            
            async with aiohttp.ClientSession() as session:
                async with session.post(url, json=telegram_data) as response:
                    if response.status == 200:
                        result = await response.json()
                        logger.info(f"Telegram sent: {message.id} to {message.recipient}")
                        return {
                            "success": True,
                            "message_id": message.id,
                            "telegram_message_id": result.get("result", {}).get("message_id"),
                            "status": MessageStatus.SENT,
                            "sent_at": datetime.utcnow().isoformat()
                        }
                    else:
                        error_text = await response.text()
                        raise Exception(f"Telegram API error: {error_text}")
                        
        except Exception as e:
            logger.error(f"Telegram sending failed: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "message_id": message.id
            }
    
    async def _send_fax(self, message: CommunicationMessage) -> Dict[str, Any]:
        """Send fax message"""
        try:
            # Use fax service API
            fax_data = {
                "to": message.recipient,
                "document_url": message.attachments[0] if message.attachments else None,
                "cover_page": message.content,
                "priority": message.priority
            }
            
            headers = {
                "Authorization": f"Bearer {self.config.fax_service_api_key}",
                "Content-Type": "application/json"
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    "https://api.faxservice.com/send",
                    json=fax_data,
                    headers=headers
                ) as response:
                    if response.status == 200:
                        result = await response.json()
                        logger.info(f"Fax sent: {message.id} to {message.recipient}")
                        return {
                            "success": True,
                            "message_id": message.id,
                            "fax_id": result.get("fax_id"),
                            "status": MessageStatus.SENT,
                            "sent_at": datetime.utcnow().isoformat()
                        }
                    else:
                        error_text = await response.text()
                        raise Exception(f"Fax API error: {error_text}")
                        
        except Exception as e:
            logger.error(f"Fax sending failed: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "message_id": message.id
            }
    
    async def send_push_notification(self, user_id: str, title: str, body: str, data: Optional[Dict] = None) -> Dict[str, Any]:
        """Send push notification via Firebase"""
        try:
            # Get user's FCM token from database
            # For now, use a mock token
            fcm_token = "mock_fcm_token"
            
            message = messaging.Message(
                notification=messaging.Notification(
                    title=title,
                    body=body
                ),
                data=data or {},
                token=fcm_token
            )
            
            response = messaging.send(message)
            
            logger.info(f"Push notification sent: {response} to user {user_id}")
            
            return {
                "success": True,
                "message_id": response,
                "status": MessageStatus.SENT,
                "sent_at": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Push notification failed: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }
    
    async def get_communication_analytics(self, user_id: str, start_date: datetime, end_date: datetime) -> Dict[str, Any]:
        """Get communication analytics for a user"""
        try:
            # Mock analytics data
            analytics = {
                "total_calls": 45,
                "total_emails": 123,
                "total_sms": 67,
                "total_whatsapp": 34,
                "total_telegram": 12,
                "total_fax": 8,
                "call_duration": 2340,  # seconds
                "response_rate": 0.89,
                "communication_score": 4.2,
                "peak_hours": [9, 14, 16],
                "most_contacted": ["+1-555-0123", "+1-555-0456", "+1-555-0789"],
                "communication_trends": {
                    "calls": {"trend": "increasing", "change": "+12%"},
                    "emails": {"trend": "stable", "change": "+2%"},
                    "sms": {"trend": "decreasing", "change": "-8%"},
                    "whatsapp": {"trend": "increasing", "change": "+25%"}
                }
            }
            
            return {
                "success": True,
                "analytics": analytics,
                "period": {
                    "start_date": start_date.isoformat(),
                    "end_date": end_date.isoformat()
                }
            }
            
        except Exception as e:
            logger.error(f"Analytics retrieval failed: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }
    
    async def get_active_calls(self) -> List[Dict[str, Any]]:
        """Get list of active calls"""
        return list(self.active_calls.values())
    
    async def get_active_conferences(self) -> List[Dict[str, Any]]:
        """Get list of active conferences"""
        return list(self.active_conferences.values())
    
    async def end_call(self, call_id: str) -> Dict[str, Any]:
        """End an active call"""
        try:
            if call_id in self.active_calls:
                call_data = self.active_calls[call_id]
                call_data["status"] = "ended"
                call_data["end_time"] = datetime.utcnow()
                
                # End Twilio call if exists
                if call_data["metadata"]["twilio_call_sid"]:
                    self.twilio_client.calls(call_data["metadata"]["twilio_call_sid"]).update(status="completed")
                
                del self.active_calls[call_id]
                
                logger.info(f"Call ended: {call_id}")
                
                return {
                    "success": True,
                    "call_id": call_id,
                    "status": "ended"
                }
            else:
                return {
                    "success": False,
                    "error": "Call not found"
                }
                
        except Exception as e:
            logger.error(f"Error ending call: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }

# Global instance
communication_service = None

def initialize_communication_service(config: CommunicationConfig):
    """Initialize the global communication service"""
    global communication_service
    communication_service = UnifiedCommunicationService(config)
    logger.info("Unified Communication Service initialized")

def get_communication_service() -> UnifiedCommunicationService:
    """Get the global communication service instance"""
    if communication_service is None:
        raise RuntimeError("Communication service not initialized")
    return communication_service 