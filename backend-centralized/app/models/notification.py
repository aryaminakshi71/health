"""
Notification models
"""

from sqlalchemy import Column, Integer, String, DateTime, JSON
from sqlalchemy.sql import func
from app.core.database import Base


class NotificationRecipient(Base):
    __tablename__ = "notification_recipients"

    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(String(100), index=True)
    name = Column(String(200), nullable=False)
    email = Column(String(200))
    phone = Column(String(50))
    whatsapp = Column(String(50))
    push_token = Column(String(500))
    preferences = Column(JSON)  # {email: true, sms: false, push: true, slack: false, discord: false}
    created_at = Column(DateTime, server_default=func.now())


