"""
Notifications API Router
Handles alert notifications via multiple channels
"""

from fastapi import APIRouter, HTTPException, BackgroundTasks, Depends
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime
import logging
from app.services.notification_service import notification_service, NotificationType, NotificationPriority
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.notification import NotificationRecipient as RecipientModel

logger = logging.getLogger(__name__)

router = APIRouter()

class NotificationData(BaseModel):
    title: str
    message: str
    type: str = "info"  # info, success, warning, error
    category: str = "system"  # system, communication, billing, security, user
    recipients: List[str] = []
    priority: str = "normal"  # low, normal, high, urgent
    data: Dict[str, Any] = {}
    user_id: Optional[str] = None
    client_id: Optional[str] = None

class NotificationResponse(BaseModel):
    success: bool
    message: str
    results: Dict[str, List[Dict[str, Any]]]

@router.post("/send", response_model=NotificationResponse)
async def send_notification(
    notification_data: NotificationData,
    background_tasks: BackgroundTasks
):
    """Send notification via multiple channels"""
    try:
        # Determine notification type
        notification_type = NotificationType(notification_data.type)
        priority = NotificationPriority(notification_data.priority)
        
        # Send notification
        result = await notification_service.send_notification(
            notification_type=notification_type,
            title=notification_data.title,
            message=notification_data.message,
            recipients=notification_data.recipients,
            priority=priority,
            data=notification_data.data,
            user_id=notification_data.user_id,
            client_id=notification_data.client_id
        )

        logger.info(f"Notification sent: {result.get('notification_id')}")
        
        return NotificationResponse(
            success=result.get('success', False),
            message=result.get('message', 'Notification sent'),
            results={}
        )

    except Exception as e:
        logger.error(f"Error sending notification: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to send notification: {str(e)}")

@router.post("/test")
async def test_notification(notification_data: NotificationData):
    """Test notification to verify all channels work"""
    try:
        # Send test notification
        result = await notification_service.send_notification(
            notification_type=NotificationType(notification_data.type),
            title=notification_data.title,
            message=notification_data.message,
            recipients=notification_data.recipients,
            priority=NotificationPriority(notification_data.priority),
            data=notification_data.data,
            user_id=notification_data.user_id,
            client_id=notification_data.client_id
        )
        
        return {
            "success": result.get('success', False),
            "message": "Test notification sent",
            "results": result
        }

    except Exception as e:
        logger.error(f"Error sending test notification: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to send test notification: {str(e)}")

@router.get("/status")
async def get_notification_status():
    """Get notification service status"""
    return {
        "service_status": "active",
        "websocket_enabled": True,
        "email_enabled": False,  # Demo mode
        "sms_enabled": False,    # Demo mode
        "push_enabled": False,   # Demo mode
        "telegram_enabled": False, # Demo mode
        "discord_enabled": False,  # Demo mode
        "slack_enabled": False     # Demo mode
    } 

# Recipient Directory CRUD
@router.get("/recipients")
async def list_recipients(tenant_id: Optional[str] = None, db: Session = Depends(get_db)):
    q = db.query(RecipientModel)
    if tenant_id:
        q = q.filter(RecipientModel.tenant_id == tenant_id)
    rows = q.limit(200).all()
    return {"success": True, "data": [
        {
            "id": r.id,
            "tenant_id": r.tenant_id,
            "name": r.name,
            "email": r.email,
            "phone": r.phone,
            "whatsapp": r.whatsapp,
            "push_token": r.push_token,
            "preferences": r.preferences or {}
        } for r in rows
    ]}

@router.post("/recipients")
async def create_recipient(payload: Dict[str, Any], db: Session = Depends(get_db)):
    r = RecipientModel(
        tenant_id=payload.get("tenant_id"),
        name=payload.get("name"),
        email=payload.get("email"),
        phone=payload.get("phone"),
        whatsapp=payload.get("whatsapp"),
        push_token=payload.get("push_token"),
        preferences=payload.get("preferences") or {}
    )
    db.add(r); db.commit(); db.refresh(r)
    return {"success": True, "id": r.id}

@router.put("/recipients/{recipient_id}")
async def update_recipient(recipient_id: int, payload: Dict[str, Any], db: Session = Depends(get_db)):
    r = db.query(RecipientModel).filter(RecipientModel.id == recipient_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Recipient not found")
    for k in ["tenant_id","name","email","phone","whatsapp","push_token","preferences"]:
        if k in payload:
            setattr(r, k, payload[k])
    db.commit(); db.refresh(r)
    return {"success": True}

@router.delete("/recipients/{recipient_id}")
async def delete_recipient(recipient_id: int, db: Session = Depends(get_db)):
    r = db.query(RecipientModel).filter(RecipientModel.id == recipient_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Recipient not found")
    db.delete(r); db.commit()
    return {"success": True}