"""
Merged Communication Hub API with Full VoIP and Enhanced Features
Combines: VoIP, Video Conferencing, Email, SMS, WhatsApp, Telegram, Fax, and more
"""

from fastapi import APIRouter, HTTPException, Depends, Request, WebSocket, WebSocketDisconnect, BackgroundTasks
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import json
import uuid
import asyncio
from pydantic import BaseModel, Field
from ...core.security import (
    security_manager, 
    access_control, 
    compliance_checker,
    get_current_user,
    get_current_user_dev_optional,
    verify_permission
)
from ...core.database import get_db
from sqlalchemy.orm import Session
from ...models.communication import Conference as ConferenceModel, Fax as FaxModel
# Simple logging for development
import logging
audit_logger = logging.getLogger(__name__)

router = APIRouter(tags=["communication"])

# Pydantic models for enhanced communication
class EmailMessage(BaseModel):
    to: str = Field(..., description="Recipient email address")
    subject: str = Field(..., description="Email subject")
    body: str = Field(..., description="Email body content")
    cc: Optional[List[str]] = Field(default=[], description="CC recipients")
    bcc: Optional[List[str]] = Field(default=[], description="BCC recipients")
    attachments: Optional[List[str]] = Field(default=[], description="File attachments")
    priority: str = Field(default="normal", description="Email priority: low, normal, high, urgent")

class SMSMessage(BaseModel):
    to: str = Field(..., description="Recipient phone number")
    message: str = Field(..., description="SMS content")
    sender_id: Optional[str] = Field(default="ERP", description="Sender ID")
    priority: str = Field(default="normal", description="SMS priority")

class WhatsAppMessage(BaseModel):
    to: str = Field(..., description="Recipient WhatsApp number")
    message: str = Field(..., description="WhatsApp message content")
    media_url: Optional[str] = Field(default=None, description="Media file URL")
    message_type: str = Field(default="text", description="Message type: text, image, document, audio")

class FaxMessage(BaseModel):
    to: str = Field(..., description="Recipient fax number")
    document_url: str = Field(..., description="Document to fax")
    cover_page: Optional[str] = Field(default=None, description="Cover page content")
    priority: str = Field(default="normal", description="Fax priority")

class TelegramMessage(BaseModel):
    chat_id: str = Field(..., description="Telegram chat ID")
    message: str = Field(..., description="Telegram message content")
    parse_mode: str = Field(default="HTML", description="Message parse mode")

class SlackMessage(BaseModel):
    channel: str = Field(..., description="Slack channel name")
    message: str = Field(..., description="Slack message content")
    username: Optional[str] = Field(default="Communication Hub", description="Username to display")
    icon_emoji: Optional[str] = Field(default=":robot_face:", description="Icon emoji")
    attachments: Optional[List[Dict[str, Any]]] = Field(default=[], description="Message attachments")

class DiscordMessage(BaseModel):
    channel_id: str = Field(..., description="Discord channel ID")
    message: str = Field(..., description="Discord message content")
    username: Optional[str] = Field(default="Communication Hub", description="Username to display")
    avatar_url: Optional[str] = Field(default=None, description="Avatar URL")
    embed: bool = Field(default=False, description="Send as embed message")

# Advanced communication data with full VoIP functionality
CALLS_DATA = [
    {
        "id": "C001",
        "from": "+1-555-0123",
        "to": "+1-555-0456",
        "duration": 245,
        "status": "completed",
        "timestamp": "2024-01-27T10:30:00",
        "call_type": "voice",
        "quality_score": 4.8,
        "recording_url": "/recordings/C001.mp3",
        "transcript": "Hello, this is John calling about the project...",
        "tags": ["business", "project"],
        "cost": 2.45,
        "billing_code": "BC001",
        "notes": "Project discussion call",
        "participants": [
            {"number": "+1-555-0123", "name": "John Doe", "role": "caller"},
            {"number": "+1-555-0456", "name": "Jane Smith", "role": "recipient"}
        ],
        "call_flow": [
            {"step": "initiated", "timestamp": "2024-01-27T10:30:00"},
            {"step": "ringing", "timestamp": "2024-01-27T10:30:05"},
            {"step": "answered", "timestamp": "2024-01-27T10:30:08"},
            {"step": "completed", "timestamp": "2024-01-27T10:34:13"}
        ]
    }
]

# Enhanced communication data
EMAIL_DATA = [
    {
        "id": "E001",
        "from": "system@erp.com",
        "to": "user@company.com",
        "subject": "System Alert - High CPU Usage",
        "body": "The system has detected high CPU usage on server-01...",
        "status": "sent",
        "timestamp": "2024-01-27T10:00:00",
        "priority": "high",
        "read": False,
        "attachments": []
    }
]

SMS_DATA = [
    {
        "id": "S001",
        "from": "+1-555-0000",
        "to": "+1-555-0123",
        "message": "Your verification code is: 123456",
        "status": "delivered",
        "timestamp": "2024-01-27T09:30:00",
        "cost": 0.05
    }
]

WHATSAPP_DATA = [
    {
        "id": "W001",
        "from": "+1-555-0000",
        "to": "+1-555-0123",
        "message": "Welcome to ERP System! Your account is ready.",
        "status": "read",
        "timestamp": "2024-01-27T09:00:00",
        "message_type": "text"
    }
]

FAX_DATA = [
    {
        "id": "F001",
        "from": "+1-555-0000",
        "to": "+1-555-0123",
        "document_url": "/documents/fax001.pdf",
        "status": "sent",
        "timestamp": "2024-01-27T08:00:00",
        "pages": 2,
        "cost": 1.50
    }
]

TELEGRAM_DATA = [
    {
        "id": "T001",
        "chat_id": "123456789",
        "message": "System notification: Backup completed successfully",
        "status": "sent",
        "timestamp": "2024-01-27T07:00:00"
    }
]

SLACK_DATA = [
    {
        "id": "S001",
        "channel": "#general",
        "message": "System alert: Database backup completed successfully",
        "username": "System Bot",
        "icon_emoji": ":white_check_mark:",
        "status": "sent",
        "timestamp": "2024-01-27T07:00:00"
    }
]

DISCORD_DATA = [
    {
        "id": "D001",
        "channel_id": "123456789",
        "channel_name": "#general",
        "message": "Welcome to our community! 🎉",
        "username": "Community Bot",
        "avatar_url": "https://cdn.discordapp.com/avatars/123/abc.png",
        "embed": False,
        "status": "sent",
        "timestamp": "2024-01-27T07:00:00"
    }
]

# WebSocket connections for real-time communication
active_connections: Dict[str, WebSocket] = {}

# ==================== VOIP ENDPOINTS ====================

@router.websocket("/ws/voice/{call_id}")
async def voice_call_endpoint(websocket: WebSocket, call_id: str):
    """Real-time voice call WebSocket endpoint"""
    await websocket.accept()
    active_connections[f"voice_{call_id}"] = websocket
    
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            
            # Handle voice call data
            if message.get("type") == "offer":
                # Handle WebRTC offer
                await handle_webrtc_offer(websocket, message, call_id)
            elif message.get("type") == "answer":
                # Handle WebRTC answer
                await handle_webrtc_answer(websocket, message, call_id)
            elif message.get("type") == "ice_candidate":
                # Handle ICE candidate
                await handle_ice_candidate(websocket, message, call_id)
            elif message.get("type") == "audio":
                # Broadcast audio data to other participants
                for conn_id, conn in active_connections.items():
                    if conn_id != f"voice_{call_id}" and conn_id.startswith("voice_"):
                        await conn.send_text(json.dumps(message))
            
            audit_logger.info(f"Voice call {call_id}: {message.get('type', 'unknown')}")
            
    except WebSocketDisconnect:
        del active_connections[f"voice_{call_id}"]
        audit_logger.info(f"Voice call {call_id} disconnected")

@router.websocket("/ws/video/{meeting_id}")
async def video_conference_endpoint(websocket: WebSocket, meeting_id: str):
    """Real-time video conference WebSocket endpoint"""
    await websocket.accept()
    active_connections[f"video_{meeting_id}"] = websocket
    
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            
            # Handle video conference data
            if message.get("type") == "join_meeting":
                # Handle participant joining
                await handle_participant_join(websocket, message, meeting_id)
            elif message.get("type") == "offer":
                # Handle WebRTC offer
                await handle_webrtc_offer(websocket, message, meeting_id, is_video=True)
            elif message.get("type") == "answer":
                # Handle WebRTC answer
                await handle_webrtc_answer(websocket, message, meeting_id, is_video=True)
            elif message.get("type") == "ice_candidate":
                # Handle ICE candidate
                await handle_ice_candidate(websocket, message, meeting_id, is_video=True)
            elif message.get("type") in ["video", "audio", "screen_share"]:
                # Broadcast media data to other participants
                for conn_id, conn in active_connections.items():
                    if conn_id != f"video_{meeting_id}" and conn_id.startswith("video_"):
                        await conn.send_text(json.dumps(message))
            
            audit_logger.info(f"Video conference {meeting_id}: {message.get('type', 'unknown')}")
            
    except WebSocketDisconnect:
        del active_connections[f"video_{meeting_id}"]
        audit_logger.info(f"Video conference {meeting_id} disconnected")

@router.websocket("/ws/messages")
async def messaging_endpoint(websocket: WebSocket):
    """Real-time messaging WebSocket endpoint"""
    await websocket.accept()
    user_id = None
    
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            
            if message.get("type") == "connect":
                user_id = message.get("userId")
                active_connections[f"messages_{user_id}"] = websocket
                audit_logger.info(f"User {user_id} connected to messaging")
                
            elif message.get("type") == "message":
                # Handle new message
                await handle_new_message(websocket, message)
                
            elif message.get("type") == "typing":
                # Handle typing indicator
                await handle_typing_indicator(websocket, message)
                
    except WebSocketDisconnect:
        if user_id:
            del active_connections[f"messages_{user_id}"]
        audit_logger.info(f"Messaging connection disconnected")

# Helper functions for WebRTC handling
async def handle_webrtc_offer(websocket: WebSocket, message: dict, session_id: str, is_video: bool = False):
    """Handle WebRTC offer from client"""
    try:
        # Store the offer for the target participant
        target_participant = message.get("targetParticipant")
        if target_participant:
            # Forward offer to target participant
            target_conn_id = f"video_{session_id}" if is_video else f"voice_{session_id}"
            if target_conn_id in active_connections:
                await active_connections[target_conn_id].send_text(json.dumps({
                    "type": "offer",
                    "offer": message.get("offer"),
                    "fromParticipant": message.get("fromParticipant", "unknown")
                }))
    except Exception as e:
        audit_logger.error(f"Error handling WebRTC offer: {str(e)}")

async def handle_webrtc_answer(websocket: WebSocket, message: dict, session_id: str, is_video: bool = False):
    """Handle WebRTC answer from client"""
    try:
        target_participant = message.get("targetParticipant")
        if target_participant:
            # Forward answer to target participant
            target_conn_id = f"video_{session_id}" if is_video else f"voice_{session_id}"
            if target_conn_id in active_connections:
                await active_connections[target_conn_id].send_text(json.dumps({
                    "type": "answer",
                    "answer": message.get("answer"),
                    "fromParticipant": message.get("fromParticipant", "unknown")
                }))
    except Exception as e:
        audit_logger.error(f"Error handling WebRTC answer: {str(e)}")

async def handle_ice_candidate(websocket: WebSocket, message: dict, session_id: str, is_video: bool = False):
    """Handle ICE candidate from client"""
    try:
        target_participant = message.get("targetParticipant")
        if target_participant:
            # Forward ICE candidate to target participant
            target_conn_id = f"video_{session_id}" if is_video else f"voice_{session_id}"
            if target_conn_id in active_connections:
                await active_connections[target_conn_id].send_text(json.dumps({
                    "type": "ice_candidate",
                    "candidate": message.get("candidate"),
                    "fromParticipant": message.get("fromParticipant", "unknown")
                }))
    except Exception as e:
        audit_logger.error(f"Error handling ICE candidate: {str(e)}")

async def handle_participant_join(websocket: WebSocket, message: dict, meeting_id: str):
    """Handle participant joining a video conference"""
    try:
        participant = message.get("participant", {})
        
        # Notify all other participants in the meeting
        for conn_id, conn in active_connections.items():
            if conn_id.startswith(f"video_{meeting_id}") and conn != websocket:
                await conn.send_text(json.dumps({
                    "type": "participant_joined",
                    "participant": participant
                }))
        
        # Send confirmation to the joining participant
        await websocket.send_text(json.dumps({
            "type": "call_connected",
            "meetingId": meeting_id
        }))
        
    except Exception as e:
        audit_logger.error(f"Error handling participant join: {str(e)}")

async def handle_new_message(websocket: WebSocket, message: dict):
    """Handle new message from client"""
    try:
        recipient = message.get("recipient")
        if recipient:
            # Forward message to recipient
            recipient_conn_id = f"messages_{recipient}"
            if recipient_conn_id in active_connections:
                await active_connections[recipient_conn_id].send_text(json.dumps({
                    "type": "message",
                    "messageId": message.get("messageId"),
                    "sender": message.get("sender", "unknown"),
                    "content": message.get("content"),
                    "messageType": message.get("messageType", "text"),
                    "timestamp": message.get("timestamp")
                }))
                
                # Send delivery confirmation back to sender
                await websocket.send_text(json.dumps({
                    "type": "message_delivered",
                    "messageId": message.get("messageId")
                }))
    except Exception as e:
        audit_logger.error(f"Error handling new message: {str(e)}")

async def handle_typing_indicator(websocket: WebSocket, message: dict):
    """Handle typing indicator from client"""
    try:
        recipient = message.get("recipient")
        if recipient:
            # Forward typing indicator to recipient
            recipient_conn_id = f"messages_{recipient}"
            if recipient_conn_id in active_connections:
                await active_connections[recipient_conn_id].send_text(json.dumps({
                    "type": "typing",
                    "sender": message.get("sender", "unknown"),
                    "timestamp": message.get("timestamp")
                }))
    except Exception as e:
        audit_logger.error(f"Error handling typing indicator: {str(e)}")

# ==================== DASHBOARD ENDPOINTS ====================

@router.get("/dashboard", operation_id="communication_get_dashboard")
async def get_communication_dashboard(
    current_user: str = Depends(get_current_user_dev_optional)
):
    """Get comprehensive communication dashboard"""
    try:
        # Calculate statistics
        total_calls = len(CALLS_DATA)
        completed_calls = len([call for call in CALLS_DATA if call["status"] == "completed"])
        total_emails = len(EMAIL_DATA)
        total_sms = len(SMS_DATA)
        total_whatsapp = len(WHATSAPP_DATA)
        
        dashboard_data = {
            "overview": {
                "total_calls": total_calls,
                "completed_calls": completed_calls,
                "missed_calls": total_calls - completed_calls,
                "total_emails": total_emails,
                "total_sms": total_sms,
                "total_whatsapp": total_whatsapp,
                "active_connections": len(active_connections)
            },
            "recent_activity": {
                "calls": CALLS_DATA[:5],
                "emails": EMAIL_DATA[:5],
                "sms": SMS_DATA[:5],
                "whatsapp": WHATSAPP_DATA[:5]
            },
            "system_status": {
                "voip_status": "operational",
                "email_status": "operational",
                "sms_status": "operational",
                "whatsapp_status": "operational"
            }
        }
        
        return {
            "status": "success",
            "data": dashboard_data,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        audit_logger.error(f"Error getting communication dashboard: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get dashboard")

# ==================== CALL ENDPOINTS ====================

@router.get("/calls", operation_id="communication_get_calls")
async def get_calls(
    request: Request,
    current_user: str = Depends(get_current_user_dev_optional),
    role: str = "admin"
):
    """Get all calls with filtering and pagination"""
    try:
        # Add audit log
        audit_logger.info(f"User {current_user} accessed calls list")
        
        return {
            "status": "success",
            "data": CALLS_DATA,
            "total": len(CALLS_DATA),
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        audit_logger.error(f"Error getting calls: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get calls")

@router.get("/calls/recent", operation_id="communication_get_recent_calls")
async def get_recent_calls(
    current_user: str = Depends(get_current_user_dev_optional)
):
    try:
        return {"status": "success", "data": CALLS_DATA[:5], "total": len(CALLS_DATA)}
    except Exception as e:
        audit_logger.error(f"Error getting recent calls: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get recent calls")

@router.get("/calls/{call_id}", operation_id="communication_get_call")
async def get_call(
    call_id: str,
    request: Request,
    current_user: str = Depends(get_current_user_dev_optional)
):
    """Get specific call details"""
    try:
        call = next((call for call in CALLS_DATA if call["id"] == call_id), None)
        
        if not call:
            raise HTTPException(status_code=404, detail="Call not found")
        
        audit_logger.info(f"User {current_user} accessed call {call_id}")
        
        return {
            "status": "success",
            "data": call,
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        audit_logger.error(f"Error getting call {call_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get call")

@router.post("/calls", operation_id="communication_create_call")
async def initiate_call(
    call_data: Dict[str, Any],
    request: Request,
    current_user: str = Depends(get_current_user),
    role: str = "user"
):
    """Initiate a new call"""
    try:
        # Validate call data
        required_fields = ["from", "to", "call_type"]
        for field in required_fields:
            if field not in call_data:
                raise HTTPException(status_code=400, detail=f"Missing required field: {field}")
        
        # Create new call
        new_call = {
            "id": f"C{str(uuid.uuid4())[:8].upper()}",
            "from": call_data["from"],
            "to": call_data["to"],
            "call_type": call_data["call_type"],
            "status": "initiated",
            "timestamp": datetime.now().isoformat(),
            "duration": 0,
            "quality_score": 0,
            "recording_url": None,
            "transcript": None,
            "tags": call_data.get("tags", []),
            "cost": 0,
            "billing_code": None,
            "notes": call_data.get("notes", ""),
            "participants": call_data.get("participants", []),
            "call_flow": [
                {"step": "initiated", "timestamp": datetime.now().isoformat()}
            ]
        }
        
        CALLS_DATA.append(new_call)
        
        audit_logger.info(f"User {current_user} initiated call {new_call['id']}")
        
        return {
            "status": "success",
            "data": new_call,
            "message": "Call initiated successfully",
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        audit_logger.error(f"Error initiating call: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to initiate call")

# ==================== CALLS CRUD OPERATIONS ====================

@router.put("/calls/{call_id}")
async def update_call(
    call_id: str,
    call_data: Dict[str, Any],
    request: Request,
    current_user: str = Depends(get_current_user)
):
    """Update call details"""
    try:
        call_index = next((i for i, call in enumerate(CALLS_DATA) if call["id"] == call_id), None)
        if call_index is None:
            raise HTTPException(status_code=404, detail="Call not found")
        
        # Update call data
        for key, value in call_data.items():
            if key in CALLS_DATA[call_index]:
                CALLS_DATA[call_index][key] = value
        
        CALLS_DATA[call_index]["updated_at"] = datetime.now().isoformat()
        CALLS_DATA[call_index]["updated_by"] = current_user
        
        audit_logger.info(f"User {current_user} updated call {call_id}")
        
        return {
            "status": "success",
            "data": CALLS_DATA[call_index],
            "message": "Call updated successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        audit_logger.error(f"Error updating call {call_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update call")

@router.delete("/calls/{call_id}")
async def delete_call(
    call_id: str,
    request: Request,
    current_user: str = Depends(get_current_user)
):
    """Delete call"""
    try:
        call_index = next((i for i, call in enumerate(CALLS_DATA) if call["id"] == call_id), None)
        if call_index is None:
            raise HTTPException(status_code=404, detail="Call not found")
        
        deleted_call = CALLS_DATA.pop(call_index)
        
        audit_logger.info(f"User {current_user} deleted call {call_id}")
        
        return {
            "status": "success",
            "message": "Call deleted successfully",
            "deleted_call": deleted_call
        }
        
    except HTTPException:
        raise
    except Exception as e:
        audit_logger.error(f"Error deleting call {call_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to delete call")

# ==================== EMAIL ENDPOINTS ====================

@router.get("/email", operation_id="communication_get_emails")
async def get_emails(
    current_user: str = Depends(get_current_user_dev_optional)
):
    """Get all emails"""
    try:
        return {
            "status": "success",
            "data": EMAIL_DATA,
            "total": len(EMAIL_DATA),
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        audit_logger.error(f"Error getting emails: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get emails")

@router.post("/email", operation_id="communication_send_email")
async def send_email(
    email_data: EmailMessage,
    background_tasks: BackgroundTasks,
    current_user: str = Depends(get_current_user_dev_optional)
):
    """Send an email"""
    try:
        new_email = {
            "id": f"E{str(uuid.uuid4())[:8].upper()}",
            "from": f"{current_user}@erp.com",
            "to": email_data.to,
            "subject": email_data.subject,
            "body": email_data.body,
            "cc": email_data.cc,
            "bcc": email_data.bcc,
            "attachments": email_data.attachments,
            "priority": email_data.priority,
            "status": "sending",
            "timestamp": datetime.now().isoformat(),
            "read": False
        }
        
        EMAIL_DATA.append(new_email)
        
        # Add background task for email sending
        background_tasks.add_task(simulate_email_sending, new_email["id"])
        
        audit_logger.info(f"User {current_user} sent email {new_email['id']}")
        
        return {
            "status": "success",
            "data": new_email,
            "message": "Email queued for sending",
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        audit_logger.error(f"Error sending email: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to send email")

# ==================== EMAIL CRUD OPERATIONS ====================

@router.put("/email/{email_id}")
async def update_email(
    email_id: str,
    email_data: Dict[str, Any],
    request: Request,
    current_user: str = Depends(get_current_user)
):
    """Update email details"""
    try:
        # Find email in EMAIL_DATA (you'll need to add this data structure)
        email_index = next((i for i, email in enumerate(EMAIL_DATA) if email["id"] == email_id), None)
        if email_index is None:
            raise HTTPException(status_code=404, detail="Email not found")
        
        # Update email data
        for key, value in email_data.items():
            if key in EMAIL_DATA[email_index]:
                EMAIL_DATA[email_index][key] = value
        
        EMAIL_DATA[email_index]["updated_at"] = datetime.now().isoformat()
        EMAIL_DATA[email_index]["updated_by"] = current_user
        
        audit_logger.info(f"User {current_user} updated email {email_id}")
        
        return {
            "status": "success",
            "data": EMAIL_DATA[email_index],
            "message": "Email updated successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        audit_logger.error(f"Error updating email {email_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update email")

@router.delete("/email/{email_id}")
async def delete_email(
    email_id: str,
    request: Request,
    current_user: str = Depends(get_current_user)
):
    """Delete email"""
    try:
        email_index = next((i for i, email in enumerate(EMAIL_DATA) if email["id"] == email_id), None)
        if email_index is None:
            raise HTTPException(status_code=404, detail="Email not found")
        
        deleted_email = EMAIL_DATA.pop(email_index)
        
        audit_logger.info(f"User {current_user} deleted email {email_id}")
        
        return {
            "status": "success",
            "message": "Email deleted successfully",
            "deleted_email": deleted_email
        }
        
    except HTTPException:
        raise
    except Exception as e:
        audit_logger.error(f"Error deleting email {email_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to delete email")

# ==================== SMS ENDPOINTS ====================

@router.get("/sms", operation_id="communication_get_sms")
async def get_sms_messages(
    current_user: str = Depends(get_current_user_dev_optional)
):
    """Get all SMS messages"""
    try:
        return {
            "status": "success",
            "data": SMS_DATA,
            "total": len(SMS_DATA),
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        audit_logger.error(f"Error getting SMS messages: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get SMS messages")

@router.post("/sms", operation_id="communication_send_sms")
async def send_sms(
    sms_data: SMSMessage,
    background_tasks: BackgroundTasks,
    current_user: str = Depends(get_current_user_dev_optional)
):
    """Send an SMS"""
    try:
        new_sms = {
            "id": f"S{str(uuid.uuid4())[:8].upper()}",
            "from": sms_data.sender_id,
            "to": sms_data.to,
            "message": sms_data.message,
            "priority": sms_data.priority,
            "status": "sending",
            "timestamp": datetime.now().isoformat(),
            "cost": 0.05
        }
        
        SMS_DATA.append(new_sms)
        
        # Add background task for SMS sending
        background_tasks.add_task(simulate_sms_sending, new_sms["id"])
        
        audit_logger.info(f"User {current_user} sent SMS {new_sms['id']}")
        
        return {
            "status": "success",
            "data": new_sms,
            "message": "SMS queued for sending",
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        audit_logger.error(f"Error sending SMS: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to send SMS")

# ==================== SMS CRUD OPERATIONS ====================

@router.put("/sms/{sms_id}")
async def update_sms(
    sms_id: str,
    sms_data: Dict[str, Any],
    request: Request,
    current_user: str = Depends(get_current_user)
):
    """Update SMS details"""
    try:
        # Find SMS in SMS_DATA (you'll need to add this data structure)
        sms_index = next((i for i, sms in enumerate(SMS_DATA) if sms["id"] == sms_id), None)
        if sms_index is None:
            raise HTTPException(status_code=404, detail="SMS not found")
        
        # Update SMS data
        for key, value in sms_data.items():
            if key in SMS_DATA[sms_index]:
                SMS_DATA[sms_index][key] = value
        
        SMS_DATA[sms_index]["updated_at"] = datetime.now().isoformat()
        SMS_DATA[sms_index]["updated_by"] = current_user
        
        audit_logger.info(f"User {current_user} updated SMS {sms_id}")
        
        return {
            "status": "success",
            "data": SMS_DATA[sms_index],
            "message": "SMS updated successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        audit_logger.error(f"Error updating SMS {sms_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update SMS")

@router.delete("/sms/{sms_id}")
async def delete_sms(
    sms_id: str,
    request: Request,
    current_user: str = Depends(get_current_user)
):
    """Delete SMS"""
    try:
        sms_index = next((i for i, sms in enumerate(SMS_DATA) if sms["id"] == sms_id), None)
        if sms_index is None:
            raise HTTPException(status_code=404, detail="SMS not found")
        
        deleted_sms = SMS_DATA.pop(sms_index)
        
        audit_logger.info(f"User {current_user} deleted SMS {sms_id}")
        
        return {
            "status": "success",
            "message": "SMS deleted successfully",
            "deleted_sms": deleted_sms
        }
        
    except HTTPException:
        raise
    except Exception as e:
        audit_logger.error(f"Error deleting SMS {sms_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to delete SMS")

# ==================== WHATSAPP ENDPOINTS ====================

@router.get("/whatsapp", operation_id="communication_get_whatsapp")
async def get_whatsapp_messages(
    current_user: str = Depends(get_current_user_dev_optional)
):
    """Get all WhatsApp messages"""
    try:
        return {
            "status": "success",
            "data": WHATSAPP_DATA,
            "total": len(WHATSAPP_DATA),
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        audit_logger.error(f"Error getting WhatsApp messages: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get WhatsApp messages")

@router.post("/whatsapp", operation_id="communication_send_whatsapp")
async def send_whatsapp(
    whatsapp_data: WhatsAppMessage,
    background_tasks: BackgroundTasks,
    current_user: str = Depends(get_current_user_dev_optional)
):
    """Send a WhatsApp message"""
    try:
        new_whatsapp = {
            "id": f"W{str(uuid.uuid4())[:8].upper()}",
            "from": "+1-555-0000",
            "to": whatsapp_data.to,
            "message": whatsapp_data.message,
            "media_url": whatsapp_data.media_url,
            "message_type": whatsapp_data.message_type,
            "status": "sending",
            "timestamp": datetime.now().isoformat()
        }
        
        WHATSAPP_DATA.append(new_whatsapp)
        
        # Add background task for WhatsApp sending
        background_tasks.add_task(simulate_whatsapp_sending, new_whatsapp["id"])
        
        audit_logger.info(f"User {current_user} sent WhatsApp message {new_whatsapp['id']}")
        
        return {
            "status": "success",
            "data": new_whatsapp,
            "message": "WhatsApp message queued for sending",
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        audit_logger.error(f"Error sending WhatsApp message: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to send WhatsApp message")

# ==================== FAX ENDPOINTS (DB backed) ====================

@router.get("/fax", operation_id="communication_get_fax")
async def get_fax_messages(
    current_user: str = Depends(get_current_user_dev_optional),
    db: Session = Depends(get_db)
):
    """Get all fax messages (tries DB first, fallback to in-memory)"""
    try:
        try:
            rows = db.query(FaxModel).order_by(FaxModel.created_at.desc()).limit(200).all()
            if rows:
                data = [
                    {
                        "id": f.fax_id or f"F{f.id:06d}",
                        "from": f.from_number,
                        "to": f.to_number,
                        "document_url": f.document_url,
                        "cover_page": f.cover_page,
                        "priority": f.priority,
                        "status": f.status,
                        "timestamp": f.created_at.isoformat() if f.created_at else None,
                        "pages": f.pages,
                        "cost": f.cost,
                    } for f in rows
                ]
                return {"status": "success", "data": data, "total": len(data), "timestamp": datetime.now().isoformat()}
        except Exception:
            pass
        return {"status": "success", "data": FAX_DATA, "total": len(FAX_DATA), "timestamp": datetime.now().isoformat()}
    except Exception as e:
        audit_logger.error(f"Error getting fax messages: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get fax messages")

@router.post("/fax", operation_id="communication_send_fax")
async def send_fax(
    fax_data: FaxMessage,
    background_tasks: BackgroundTasks,
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Send a fax"""
    try:
        new_fax = {
            "id": f"F{str(uuid.uuid4())[:8].upper()}",
            "from": "+1-555-0000",
            "to": fax_data.to,
            "document_url": fax_data.document_url,
            "cover_page": fax_data.cover_page,
            "priority": fax_data.priority,
            "status": "sending",
            "timestamp": datetime.now().isoformat(),
            "pages": 1,
            "cost": 1.50
        }
        
        try:
            fax_row = FaxModel(
                fax_id=new_fax["id"],
                from_number=new_fax["from"],
                to_number=new_fax["to"],
                document_url=new_fax["document_url"],
                cover_page=new_fax.get("cover_page"),
                priority=new_fax.get("priority"),
                status=new_fax["status"],
                pages=new_fax.get("pages", 1),
                cost=new_fax.get("cost", 0.0),
            )
            db.add(fax_row)
            db.commit()
        except Exception:
            FAX_DATA.append(new_fax)
        
        # Add background task for fax sending
        background_tasks.add_task(simulate_fax_sending, new_fax["id"])
        
        audit_logger.info(f"User {current_user} sent fax {new_fax['id']}")
        
        return {
            "status": "success",
            "data": new_fax,
            "message": "Fax queued for sending",
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        audit_logger.error(f"Error sending fax: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to send fax")

# ==================== CONFERENCE ENDPOINTS (DB backed) ====================

@router.get("/conferences", operation_id="communication_get_conferences")
async def get_conferences(
    current_user: str = Depends(get_current_user_dev_optional),
    db: Session = Depends(get_db)
):
    try:
        items = db.query(ConferenceModel).limit(200).all()
        data = [
            {
                "id": c.id,
                "conference_id": c.conference_id,
                "name": c.name,
                "host_id": c.host_id,
                "start_time": c.start_time.isoformat() if c.start_time else None,
                "end_time": c.end_time.isoformat() if c.end_time else None,
                "max_participants": c.max_participants,
                "is_active": c.is_active,
                "recording_url": c.recording_url,
                "notes": c.notes,
            } for c in items
        ]
        return {"status": "success", "data": data, "total": len(data)}
    except Exception as e:
        audit_logger.error(f"Error getting conferences: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get conferences")

@router.post("/conferences", operation_id="communication_create_conference")
async def create_conference(
    payload: Dict[str, Any],
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        import uuid
        conf = ConferenceModel(
            conference_id = payload.get("conference_id") or f"CONF-{str(uuid.uuid4())[:8].upper()}",
            name = payload.get("name", "Conference"),
            host_id = payload.get("host_id") or 1,
            start_time = datetime.utcnow(),
            end_time = None,
            max_participants = payload.get("max_participants", 10),
            is_active = True,
            recording_url = payload.get("recording_url"),
            notes = payload.get("notes")
        )
        db.add(conf)
        db.commit()
        db.refresh(conf)
        return {"status": "success", "data": {"id": conf.id, "conference_id": conf.conference_id}}
    except Exception as e:
        audit_logger.error(f"Error creating conference: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create conference")

@router.put("/conferences/{conf_id}", operation_id="communication_update_conference")
async def update_conference(
    conf_id: int,
    payload: Dict[str, Any],
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        conf = db.query(ConferenceModel).filter(ConferenceModel.id == conf_id).first()
        if not conf:
            raise HTTPException(status_code=404, detail="Conference not found")
        for k, v in payload.items():
            if hasattr(conf, k) and v is not None:
                setattr(conf, k, v)
        db.commit()
        db.refresh(conf)
        return {"status": "success", "data": {"id": conf.id}}
    except HTTPException:
        raise
    except Exception as e:
        audit_logger.error(f"Error updating conference: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update conference")

@router.delete("/conferences/{conf_id}", operation_id="communication_delete_conference")
async def delete_conference(
    conf_id: int,
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        conf = db.query(ConferenceModel).filter(ConferenceModel.id == conf_id).first()
        if not conf:
            raise HTTPException(status_code=404, detail="Conference not found")
        db.delete(conf)
        db.commit()
        return {"status": "success", "message": "Conference deleted"}
    except HTTPException:
        raise
    except Exception as e:
        audit_logger.error(f"Error deleting conference: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to delete conference")

# ==================== TELEGRAM ENDPOINTS ====================

@router.get("/telegram", operation_id="communication_get_telegram")
async def get_telegram_messages(
    current_user: str = Depends(get_current_user_dev_optional)
):
    """Get all Telegram messages"""
    try:
        return {
            "status": "success",
            "data": TELEGRAM_DATA,
            "total": len(TELEGRAM_DATA),
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        audit_logger.error(f"Error getting Telegram messages: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get Telegram messages")

@router.post("/telegram", operation_id="communication_send_telegram")
async def send_telegram(
    telegram_data: TelegramMessage,
    background_tasks: BackgroundTasks,
    current_user: str = Depends(get_current_user)
):
    """Send a Telegram message"""
    try:
        new_telegram = {
            "id": f"T{str(uuid.uuid4())[:8].upper()}",
            "chat_id": telegram_data.chat_id,
            "message": telegram_data.message,
            "parse_mode": telegram_data.parse_mode,
            "status": "sending",
            "timestamp": datetime.now().isoformat()
        }
        
        TELEGRAM_DATA.append(new_telegram)
        
        # Add background task for Telegram sending
        background_tasks.add_task(simulate_telegram_sending, new_telegram["id"])
        
        audit_logger.info(f"User {current_user} sent Telegram message {new_telegram['id']}")
        
        return {
            "status": "success",
            "data": new_telegram,
            "message": "Telegram message queued for sending",
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        audit_logger.error(f"Error sending Telegram message: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to send Telegram message")

# ==================== SLACK ENDPOINTS ====================

@router.get("/slack", operation_id="communication_get_slack")
async def get_slack_messages(
    current_user: str = Depends(get_current_user_dev_optional)
):
    """Get all Slack messages"""
    try:
        return {
            "status": "success",
            "data": SLACK_DATA,
            "total": len(SLACK_DATA),
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        audit_logger.error(f"Error getting Slack messages: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get Slack messages")

@router.post("/slack", operation_id="communication_send_slack")
async def send_slack(
    slack_data: SlackMessage,
    background_tasks: BackgroundTasks,
    current_user: str = Depends(get_current_user)
):
    """Send a Slack message"""
    try:
        new_slack = {
            "id": f"S{str(uuid.uuid4())[:8].upper()}",
            "channel": slack_data.channel,
            "message": slack_data.message,
            "username": slack_data.username,
            "icon_emoji": slack_data.icon_emoji,
            "status": "sending",
            "timestamp": datetime.now().isoformat()
        }
        
        SLACK_DATA.append(new_slack)
        
        # Add background task for Slack sending
        background_tasks.add_task(simulate_slack_sending, new_slack["id"])
        
        audit_logger.info(f"User {current_user} sent Slack message {new_slack['id']}")
        
        return {
            "status": "success",
            "data": new_slack,
            "message": "Slack message queued for sending",
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        audit_logger.error(f"Error sending Slack message: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to send Slack message")

# ==================== DISCORD ENDPOINTS ====================

@router.get("/discord", operation_id="communication_get_discord")
async def get_discord_messages(
    current_user: str = Depends(get_current_user_dev_optional)
):
    """Get all Discord messages"""
    try:
        return {
            "status": "success",
            "data": DISCORD_DATA,
            "total": len(DISCORD_DATA),
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        audit_logger.error(f"Error getting Discord messages: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get Discord messages")

@router.post("/discord", operation_id="communication_send_discord")
async def send_discord(
    discord_data: DiscordMessage,
    background_tasks: BackgroundTasks,
    current_user: str = Depends(get_current_user)
):
    """Send a Discord message"""
    try:
        new_discord = {
            "id": f"D{str(uuid.uuid4())[:8].upper()}",
            "channel_id": discord_data.channel_id,
            "channel_name": "#general",  # This would be looked up from channel_id
            "message": discord_data.message,
            "username": discord_data.username,
            "avatar_url": discord_data.avatar_url,
            "embed": discord_data.embed,
            "status": "sending",
            "timestamp": datetime.now().isoformat()
        }
        
        DISCORD_DATA.append(new_discord)
        
        # Add background task for Discord sending
        background_tasks.add_task(simulate_discord_sending, new_discord["id"])
        
        audit_logger.info(f"User {current_user} sent Discord message {new_discord['id']}")
        
        return {
            "status": "success",
            "data": new_discord,
            "message": "Discord message queued for sending",
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        audit_logger.error(f"Error sending Discord message: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to send Discord message")

# ==================== ANALYTICS ENDPOINTS ====================

@router.get("/analytics/communications", operation_id="communication_get_analytics")
async def get_communication_analytics(
    current_user: str = Depends(get_current_user_dev_optional)
):
    """Get comprehensive communication analytics"""
    try:
        # Calculate analytics
        total_calls = len(CALLS_DATA)
        completed_calls = len([call for call in CALLS_DATA if call["status"] == "completed"])
        total_emails = len(EMAIL_DATA)
        total_sms = len(SMS_DATA)
        total_whatsapp = len(WHATSAPP_DATA)
        total_fax = len(FAX_DATA)
        total_telegram = len(TELEGRAM_DATA)
        total_slack = len(SLACK_DATA)
        total_discord = len(DISCORD_DATA)
        
        # Calculate performance metrics safely using loops instead of sum
        call_durations = [call.get("duration", 0) for call in CALLS_DATA if call.get("duration", 0) > 0]
        quality_scores = [call.get("quality_score", 0) for call in CALLS_DATA if call.get("quality_score", 0) > 0]
        call_costs = [call.get("cost", 0) for call in CALLS_DATA]
        sms_costs = [sms.get("cost", 0) for sms in SMS_DATA]
        fax_costs = [fax.get("cost", 0) for fax in FAX_DATA]
        
        # Calculate sums manually
        total_call_duration = 0
        for duration in call_durations:
            total_call_duration += duration
            
        total_quality_score = 0
        for score in quality_scores:
            total_quality_score += score
            
        total_call_cost = 0
        for cost in call_costs:
            total_call_cost += cost
            
        total_sms_cost = 0
        for cost in sms_costs:
            total_sms_cost += cost
            
        total_fax_cost = 0
        for cost in fax_costs:
            total_fax_cost += cost
        
        analytics = {
            "overview": {
                "total_communications": total_calls + total_emails + total_sms + total_whatsapp + total_fax + total_telegram + total_slack + total_discord,
                "calls": {
                    "total": total_calls,
                    "completed": completed_calls,
                    "missed": total_calls - completed_calls,
                    "success_rate": (completed_calls / total_calls * 100) if total_calls > 0 else 0
                },
                "messages": {
                    "emails": total_emails,
                    "sms": total_sms,
                    "whatsapp": total_whatsapp,
                    "fax": total_fax,
                    "telegram": total_telegram,
                    "slack": total_slack,
                    "discord": total_discord
                }
            },
            "trends": {
                "daily_calls": [10, 15, 12, 18, 20, 16, 14],
                "daily_emails": [25, 30, 28, 35, 32, 29, 31],
                "daily_sms": [5, 8, 6, 10, 7, 9, 8]
            },
            "performance": {
                "avg_call_duration": total_call_duration / max(len(call_durations), 1),
                "avg_quality_score": total_quality_score / max(len(quality_scores), 1),
                "total_cost": total_call_cost + total_sms_cost + total_fax_cost
            }
        }
        
        return {
            "status": "success",
            "data": analytics,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        audit_logger.error(f"Error getting communication analytics: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get analytics")

# ==================== BACKGROUND TASKS ====================

async def simulate_email_sending(email_id: str):
    """Simulate email sending process"""
    await asyncio.sleep(2)
    for email in EMAIL_DATA:
        if email["id"] == email_id:
            email["status"] = "sent"
            break

async def simulate_sms_sending(sms_id: str):
    """Simulate SMS sending process"""
    await asyncio.sleep(1)
    for sms in SMS_DATA:
        if sms["id"] == sms_id:
            sms["status"] = "delivered"
            break

# ==================== SETTINGS ENDPOINT ====================

@router.get("/settings", operation_id="communication_get_settings")
async def get_settings(
    current_user: str = Depends(get_current_user_dev_optional)
):
    """Get communication settings"""
    try:
        settings = {
            "notifications": {
                "email_notifications": True,
                "sms_notifications": False,
                "push_notifications": True
            },
            "privacy": {
                "call_recording": True,
                "transcript_storage": True,
                "data_retention_days": 90
            },
            "integrations": {
                "whatsapp_enabled": True,
                "telegram_enabled": True,
                "slack_enabled": True,
                "discord_enabled": False
            },
            "billing": {
                "auto_recharge": True,
                "low_balance_alert": 10.0,
                "monthly_limit": 1000.0
            }
        }
        
        return {
            "status": "success",
            "data": settings,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        audit_logger.error(f"Error getting settings: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get settings")

async def simulate_whatsapp_sending(whatsapp_id: str):
    """Simulate WhatsApp sending process"""
    await asyncio.sleep(1)
    for whatsapp in WHATSAPP_DATA:
        if whatsapp["id"] == whatsapp_id:
            whatsapp["status"] = "sent"
            break

async def simulate_fax_sending(fax_id: str):
    """Simulate fax sending process"""
    await asyncio.sleep(3)
    for fax in FAX_DATA:
        if fax["id"] == fax_id:
            fax["status"] = "sent"
            break

async def simulate_telegram_sending(telegram_id: str):
    """Simulate Telegram sending process"""
    await asyncio.sleep(1)
    for telegram in TELEGRAM_DATA:
        if telegram["id"] == telegram_id:
            telegram["status"] = "sent"
            break

async def simulate_slack_sending(slack_id: str):
    """Simulate Slack sending process"""
    await asyncio.sleep(1)
    for slack in SLACK_DATA:
        if slack["id"] == slack_id:
            slack["status"] = "sent"
            break

async def simulate_discord_sending(discord_id: str):
    """Simulate Discord sending process"""
    await asyncio.sleep(1)
    for discord in DISCORD_DATA:
        if discord["id"] == discord_id:
            discord["status"] = "sent"
            break

# ==================== CONTACTS ENDPOINTS ====================

# Contact data structure
CONTACTS_DATA = [
    {
        "id": "CT001",
        "name": "John Doe",
        "email": "john.doe@company.com",
        "phone": "+1-555-0123",
        "whatsapp": "+1-555-0123",
        "company": "Tech Solutions Inc.",
        "position": "CEO",
        "department": "Executive",
        "tags": ["client", "vip", "business"],
        "notes": "Main contact for enterprise solutions",
        "created_at": "2024-01-15T10:00:00",
        "last_contact": "2024-01-27T14:30:00",
        "status": "active",
        "preferences": {
            "email": True,
            "sms": True,
            "whatsapp": False,
            "phone": True
        }
    },
    {
        "id": "CT002",
        "name": "Jane Smith",
        "email": "jane.smith@company.com",
        "phone": "+1-555-0456",
        "whatsapp": "+1-555-0456",
        "company": "Tech Solutions Inc.",
        "position": "CTO",
        "department": "Technology",
        "tags": ["client", "technical", "decision-maker"],
        "notes": "Technical decision maker for IT projects",
        "created_at": "2024-01-16T11:00:00",
        "last_contact": "2024-01-26T16:45:00",
        "status": "active",
        "preferences": {
            "email": True,
            "sms": False,
            "whatsapp": True,
            "phone": True
        }
    },
    {
        "id": "CT003",
        "name": "Mike Johnson",
        "email": "mike.johnson@startup.com",
        "phone": "+1-555-0789",
        "whatsapp": "+1-555-0789",
        "company": "StartupXYZ",
        "position": "Founder",
        "department": "Executive",
        "tags": ["prospect", "startup", "potential-client"],
        "notes": "Interested in VoIP solutions for startup",
        "created_at": "2024-01-20T09:00:00",
        "last_contact": "2024-01-25T13:20:00",
        "status": "prospect",
        "preferences": {
            "email": True,
            "sms": True,
            "whatsapp": True,
            "phone": False
        }
    }
]

@router.get("/contacts", operation_id="communication_get_contacts")
async def get_contacts(
    current_user: str = Depends(get_current_user_dev_optional),
    search: Optional[str] = None,
    department: Optional[str] = None,
    status: Optional[str] = None
):
    """Get all contacts with optional filtering"""
    try:
        contacts = CONTACTS_DATA.copy()
        
        # Apply filters
        if search:
            search_lower = search.lower()
            contacts = [
                contact for contact in contacts
                if (search_lower in contact["name"].lower() or
                    search_lower in contact["email"].lower() or
                    search_lower in contact["company"].lower())
            ]
        
        if department:
            contacts = [
                contact for contact in contacts
                if contact["department"].lower() == department.lower()
            ]
        
        if status:
            contacts = [
                contact for contact in contacts
                if contact["status"].lower() == status.lower()
            ]
        
        audit_logger.info(f"User {current_user} accessed contacts list")
        
        return {
            "status": "success",
            "data": contacts,
            "total": len(contacts),
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        audit_logger.error(f"Error getting contacts: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get contacts")

@router.get("/contacts/{contact_id}", operation_id="communication_get_contact")
async def get_contact(
    contact_id: str,
    current_user: str = Depends(get_current_user_dev_optional)
):
    """Get specific contact details"""
    try:
        contact = next((contact for contact in CONTACTS_DATA if contact["id"] == contact_id), None)
        
        if not contact:
            raise HTTPException(status_code=404, detail="Contact not found")
        
        audit_logger.info(f"User {current_user} accessed contact {contact_id}")
        
        return {
            "status": "success",
            "data": contact,
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        audit_logger.error(f"Error getting contact {contact_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get contact")

@router.post("/contacts", operation_id="communication_create_contact")
async def create_contact(
    contact_data: Dict[str, Any],
    current_user: str = Depends(get_current_user)
):
    """Create a new contact"""
    try:
        # Validate required fields
        required_fields = ["name", "email", "phone"]
        for field in required_fields:
            if field not in contact_data:
                raise HTTPException(status_code=400, detail=f"Missing required field: {field}")
        
        # Create new contact
        new_contact = {
            "id": f"CT{str(uuid.uuid4())[:6].upper()}",
            "name": contact_data["name"],
            "email": contact_data["email"],
            "phone": contact_data["phone"],
            "whatsapp": contact_data.get("whatsapp", contact_data["phone"]),
            "company": contact_data.get("company", ""),
            "position": contact_data.get("position", ""),
            "department": contact_data.get("department", ""),
            "tags": contact_data.get("tags", []),
            "notes": contact_data.get("notes", ""),
            "created_at": datetime.now().isoformat(),
            "last_contact": datetime.now().isoformat(),
            "status": contact_data.get("status", "active"),
            "preferences": contact_data.get("preferences", {
                "email": True,
                "sms": True,
                "whatsapp": True,
                "phone": True
            })
        }
        
        CONTACTS_DATA.append(new_contact)
        
        audit_logger.info(f"User {current_user} created contact {new_contact['id']}")
        
        return {
            "status": "success",
            "data": new_contact,
            "message": "Contact created successfully",
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        audit_logger.error(f"Error creating contact: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create contact")

# ==================== VOICE CALL ENDPOINTS ====================

@router.get("/voice-call", operation_id="communication_get_voice_calls")
async def get_voice_calls(
    current_user: str = Depends(get_current_user_dev_optional)
):
    """Get all voice calls"""
    try:
        # Filter only voice calls from CALLS_DATA
        voice_calls = [
            call for call in CALLS_DATA 
            if call["call_type"] == "voice"
        ]
        
        audit_logger.info(f"User {current_user} accessed voice calls list")
        
        return {
            "status": "success",
            "data": voice_calls,
            "total": len(voice_calls),
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        audit_logger.error(f"Error getting voice calls: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get voice calls")

@router.post("/voice-call", operation_id="communication_initiate_voice_call")
async def initiate_voice_call(
    call_data: Dict[str, Any],
    current_user: str = Depends(get_current_user)
):
    """Initiate a new voice call"""
    try:
        # Validate required fields
        required_fields = ["from", "to"]
        for field in required_fields:
            if field not in call_data:
                raise HTTPException(status_code=400, detail=f"Missing required field: {field}")
        
        # Create new voice call
        new_call = {
            "id": f"VC{str(uuid.uuid4())[:8].upper()}",
            "from": call_data["from"],
            "to": call_data["to"],
            "duration": 0,
            "status": "initiating",
            "timestamp": datetime.now().isoformat(),
            "call_type": "voice",
            "quality_score": 0,
            "recording_url": None,
            "transcript": "",
            "tags": call_data.get("tags", []),
            "cost": 0,
            "billing_code": call_data.get("billing_code", ""),
            "notes": call_data.get("notes", ""),
            "participants": [
                {"number": call_data["from"], "name": "Caller", "role": "caller"},
                {"number": call_data["to"], "name": "Recipient", "role": "recipient"}
            ],
            "call_flow": [
                {"step": "initiated", "timestamp": datetime.now().isoformat()}
            ]
        }
        
        CALLS_DATA.append(new_call)
        
        audit_logger.info(f"User {current_user} initiated voice call {new_call['id']}")
        
        return {
            "status": "success",
            "data": new_call,
            "message": "Voice call initiated successfully",
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        audit_logger.error(f"Error initiating voice call: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to initiate voice call") 