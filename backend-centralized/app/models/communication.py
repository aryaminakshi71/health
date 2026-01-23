"""
Communication Models (Enhanced with Healthcare)
Models for communication application including healthcare communication
"""

from sqlalchemy import Column, Integer, String, DateTime, Text, Boolean, ForeignKey, Float, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
from datetime import datetime
import json

class Call(Base):
    __tablename__ = "calls"
    
    id = Column(Integer, primary_key=True, index=True)
    call_id = Column(String(100), unique=True, index=True, nullable=False)
    caller_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    recipient_id = Column(Integer, ForeignKey('users.id'))
    phone_number = Column(String(20))
    call_type = Column(String(20))  # incoming, outgoing, missed, voicemail
    status = Column(String(20), default='initiated')  # initiated, ringing, answered, completed, failed
    start_time = Column(DateTime)
    end_time = Column(DateTime)
    duration_seconds = Column(Integer)
    recording_url = Column(String(255))
    notes = Column(Text)
    quality_score = Column(Float)
    created_at = Column(DateTime, default=func.now())
    
    # Relationships
    caller = relationship("User", foreign_keys=[caller_id])
    recipient = relationship("User", foreign_keys=[recipient_id])
    call_logs = relationship("CallLog", back_populates="call")
    
    def get_duration_formatted(self) -> str:
        """Get formatted duration string"""
        if self.duration_seconds:
            minutes = self.duration_seconds // 60
            seconds = self.duration_seconds % 60
            return f"{minutes:02d}:{seconds:02d}"
        return "00:00"

class CallLog(Base):
    __tablename__ = "call_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    call_id = Column(Integer, ForeignKey('calls.id'), nullable=False)
    event_type = Column(String(50), nullable=False)  # initiated, ringing, answered, ended, etc.
    timestamp = Column(DateTime, default=func.now())
    details = Column(Text)  # JSON string with additional details
    
    # Relationships
    call = relationship("Call", back_populates="call_logs")
    
    def get_details_dict(self) -> dict:
        """Get details as dictionary"""
        if self.details:
            return json.loads(self.details)
        return {}

class Message(Base):
    __tablename__ = "messages"
    
    id = Column(Integer, primary_key=True, index=True)
    sender_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    recipient_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    message_type = Column(String(20), default='text')  # text, voice, video, file
    content = Column(Text)
    file_url = Column(String(255))
    file_size = Column(Integer)
    is_read = Column(Boolean, default=False)
    is_delivered = Column(Boolean, default=False)
    sent_at = Column(DateTime, default=func.now())
    delivered_at = Column(DateTime)
    read_at = Column(DateTime)
    
    # Relationships
    sender = relationship("User", foreign_keys=[sender_id])
    recipient = relationship("User", foreign_keys=[recipient_id])

class Contact(Base):
    __tablename__ = "contacts"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    first_name = Column(String(50), nullable=False)
    last_name = Column(String(50))
    phone_number = Column(String(20))
    email = Column(String(100))
    company = Column(String(100))
    position = Column(String(100))
    notes = Column(Text)
    is_favorite = Column(Boolean, default=False)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("User")
    
    def get_full_name(self) -> str:
        return f"{self.first_name} {self.last_name}".strip()

class Conference(Base):
    __tablename__ = "conferences"
    
    id = Column(Integer, primary_key=True, index=True)
    conference_id = Column(String(100), unique=True, index=True, nullable=False)
    name = Column(String(100), nullable=False)
    host_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime)
    max_participants = Column(Integer, default=10)
    is_active = Column(Boolean, default=True)
    recording_url = Column(String(255))
    notes = Column(Text)
    created_at = Column(DateTime, default=func.now())
    
    # Relationships
    host = relationship("User")
    participants = relationship("ConferenceParticipant", back_populates="conference")

class ConferenceParticipant(Base):
    __tablename__ = "conference_participants"
    
    id = Column(Integer, primary_key=True, index=True)
    conference_id = Column(Integer, ForeignKey('conferences.id'), nullable=False)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    joined_at = Column(DateTime, default=func.now())
    left_at = Column(DateTime)
    is_muted = Column(Boolean, default=False)
    is_video_enabled = Column(Boolean, default=True)
    role = Column(String(20), default='participant')  # host, co-host, participant
    
    # Relationships
    conference = relationship("Conference", back_populates="participants")
    user = relationship("User")

class Voicemail(Base):
    __tablename__ = "voicemails"
    
    id = Column(Integer, primary_key=True, index=True)
    caller_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    recipient_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    duration_seconds = Column(Integer)
    audio_url = Column(String(255))
    transcript = Column(Text)
    is_read = Column(Boolean, default=False)
    is_archived = Column(Boolean, default=False)
    created_at = Column(DateTime, default=func.now())
    read_at = Column(DateTime)
    
    # Relationships
    caller = relationship("User", foreign_keys=[caller_id])
    recipient = relationship("User", foreign_keys=[recipient_id])

class PhoneNumber(Base):
    __tablename__ = "phone_numbers"
    
    id = Column(Integer, primary_key=True, index=True)
    number = Column(String(20), unique=True, nullable=False)
    user_id = Column(Integer, ForeignKey('users.id'))
    number_type = Column(String(20))  # mobile, landline, voip, toll_free
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    country_code = Column(String(5))
    created_at = Column(DateTime, default=func.now())
    
    # Relationships
    user = relationship("User")

class CallRecording(Base):
    __tablename__ = "call_recordings"
    
    id = Column(Integer, primary_key=True, index=True)
    call_id = Column(Integer, ForeignKey('calls.id'), nullable=False)
    file_path = Column(String(255), nullable=False)
    file_size = Column(Integer)
    duration_seconds = Column(Integer)
    quality = Column(String(20))  # low, medium, high
    is_encrypted = Column(Boolean, default=True)
    created_at = Column(DateTime, default=func.now())
    
    # Relationships
    call = relationship("Call")

class Fax(Base):
    __tablename__ = "faxes"

    id = Column(Integer, primary_key=True, index=True)
    fax_id = Column(String(50), unique=True, index=True)
    from_number = Column(String(30))
    to_number = Column(String(30))
    document_url = Column(String(255))
    cover_page = Column(Text)
    priority = Column(String(20))
    status = Column(String(20), default='sending')
    pages = Column(Integer, default=1)
    cost = Column(Float, default=0.0)
    created_at = Column(DateTime, default=func.now())

class CommunicationSettings(Base):
    __tablename__ = "communication_settings"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), unique=True, nullable=False)
    voicemail_enabled = Column(Boolean, default=True)
    call_forwarding_enabled = Column(Boolean, default=False)
    call_forwarding_number = Column(String(20))
    do_not_disturb = Column(Boolean, default=False)
    auto_reply_enabled = Column(Boolean, default=False)
    auto_reply_message = Column(Text)
    recording_enabled = Column(Boolean, default=True)
    notification_preferences = Column(Text)  # JSON string
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("User")
    
    def get_notification_preferences_dict(self) -> dict:
        """Get notification preferences as dictionary"""
        if self.notification_preferences:
            return json.loads(self.notification_preferences)
        return {}

class CallQueue(Base):
    __tablename__ = "call_queues"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    description = Column(Text)
    max_wait_time = Column(Integer)  # in seconds
    max_queue_size = Column(Integer)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=func.now())
    
    # Relationships
    agents = relationship("CallQueueAgent", back_populates="queue")
    calls = relationship("QueuedCall", back_populates="queue")

class CallQueueAgent(Base):
    __tablename__ = "call_queue_agents"
    
    id = Column(Integer, primary_key=True, index=True)
    queue_id = Column(Integer, ForeignKey('call_queues.id'), nullable=False)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    is_available = Column(Boolean, default=True)
    max_concurrent_calls = Column(Integer, default=1)
    current_calls = Column(Integer, default=0)
    priority = Column(Integer, default=1)
    created_at = Column(DateTime, default=func.now())
    
    # Relationships
    queue = relationship("CallQueue", back_populates="agents")
    user = relationship("User")

class QueuedCall(Base):
    __tablename__ = "queued_calls"
    
    id = Column(Integer, primary_key=True, index=True)
    queue_id = Column(Integer, ForeignKey('call_queues.id'), nullable=False)
    call_id = Column(Integer, ForeignKey('calls.id'), nullable=False)
    position = Column(Integer)
    wait_time = Column(Integer)  # in seconds
    status = Column(String(20), default='waiting')  # waiting, answered, abandoned
    queued_at = Column(DateTime, default=func.now())
    answered_at = Column(DateTime)
    
    # Relationships
    queue = relationship("CallQueue", back_populates="calls")
    call = relationship("Call")

# Communication constants
CALL_TYPES = [
    'incoming', 'outgoing', 'missed', 'voicemail', 'conference'
]

CALL_STATUSES = [
    'initiated', 'ringing', 'answered', 'completed', 'failed', 'busy', 'no_answer'
]

MESSAGE_TYPES = [
    'text', 'voice', 'video', 'file', 'image'
]

CONFERENCE_ROLES = [
    'host', 'co-host', 'participant'
]

RECORDING_QUALITIES = [
    'low', 'medium', 'high'
]
