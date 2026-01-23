"""
Recording Models with Retention Features
"""

from datetime import datetime, timedelta
from enum import Enum
from typing import Optional
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, JSON, ForeignKey, Float, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class RecordingType(str, Enum):
    CONTINUOUS = "continuous"
    MOTION = "motion"
    SCHEDULED = "scheduled"
    EMERGENCY = "emergency"
    COMPLIANCE = "compliance"

class RecordingStatus(str, Enum):
    RECORDING = "recording"
    COMPLETED = "completed"
    PROCESSING = "processing"
    ERROR = "error"
    DELETED = "deleted"

class Recording(Base):
    """Video recording with retention management"""
    __tablename__ = "recordings"
    
    id = Column(String(100), primary_key=True, index=True)
    tenant_id = Column(String(100), ForeignKey("tenants.id"), nullable=False)
    camera_id = Column(String(100), nullable=False)
    
    # Recording Details
    filename = Column(String(255), nullable=False)
    file_path = Column(String(500))  # Local storage path
    cloud_url = Column(String(500))  # Cloud storage URL
    thumbnail_path = Column(String(500))
    thumbnail_url = Column(String(500))
    
    # File Information
    file_size = Column(Integer)  # Size in bytes
    duration = Column(Integer)  # Duration in seconds
    resolution = Column(String(50))  # e.g., "1920x1080"
    format = Column(String(20))  # e.g., "mp4", "webm"
    
    # Recording Metadata
    type = Column(SQLEnum(RecordingType), default=RecordingType.CONTINUOUS)
    status = Column(SQLEnum(RecordingStatus), default=RecordingStatus.COMPLETED)
    
    # Timestamps
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Retention Management
    deleted_at = Column(DateTime)  # Soft delete timestamp
    deletion_reason = Column(String(100))  # retention_policy, manual, etc.
    
    # Retention Overrides
    retain_until = Column(DateTime)  # Manual retention override
    retention_override_reason = Column(String(200))  # Reason for override
    legal_hold = Column(Boolean, default=False)  # Legal hold flag
    legal_hold_date = Column(DateTime)  # When legal hold was set
    
    # Motion Detection
    motion_detected = Column(Boolean, default=False)
    motion_events = Column(JSON, default=[])  # List of motion events
    
    # AI Analysis
    ai_analysis = Column(JSON, default={})  # AI analysis results
    person_detected = Column(Boolean, default=False)
    face_detected = Column(Boolean, default=False)
    
    # Compliance
    hipaa_compliant = Column(Boolean, default=True)
    encryption_key_id = Column(String(100))  # Encryption key reference
    
    # Metadata
    meta_data = Column(JSON, default={})
    tags = Column(JSON, default=[])  # User-defined tags
    
    # Relationships
    tenant = relationship("Tenant", backref="recordings")
    
    def __repr__(self):
        return f"<Recording(id={self.id}, filename={self.filename}, type={self.type})>"
    
    @property
    def is_expired(self) -> bool:
        """Check if recording is expired based on retention policy"""
        if self.deleted_at:
            return True
        
        if self.legal_hold:
            return False
        
        if self.retain_until and self.retain_until > datetime.utcnow():
            return False
        
        # Default retention periods (will be overridden by service)
        retention_days = {
            RecordingType.EMERGENCY: 2555,  # 7 years
            RecordingType.COMPLIANCE: 2555,  # 7 years
            RecordingType.MOTION: 90,  # 90 days
            RecordingType.CONTINUOUS: 30,  # 30 days
            RecordingType.SCHEDULED: 30,  # 30 days
        }
        
        retention_period = retention_days.get(self.type, 30)
        cutoff_date = datetime.utcnow() - timedelta(days=retention_period)
        return self.created_at < cutoff_date
    
    @property
    def age_days(self) -> int:
        """Get recording age in days"""
        return (datetime.utcnow() - self.created_at).days
    
    @property
    def file_size_mb(self) -> float:
        """Get file size in MB"""
        return round((self.file_size or 0) / (1024 * 1024), 2)
    
    @property
    def duration_minutes(self) -> float:
        """Get duration in minutes"""
        return round((self.duration or 0) / 60, 2)

class RecordingEvent(Base):
    """Events within recordings (motion, alerts, etc.)"""
    __tablename__ = "recording_events"
    
    id = Column(String(100), primary_key=True, index=True)
    recording_id = Column(String(100), ForeignKey("recordings.id"), nullable=False)
    
    # Event Details
    event_type = Column(String(50), nullable=False)  # motion, alert, person_detected, etc.
    timestamp = Column(DateTime, nullable=False)
    duration = Column(Integer)  # Duration in seconds
    
    # Location within recording
    start_offset = Column(Integer)  # Start time in recording (seconds)
    end_offset = Column(Integer)  # End time in recording (seconds)
    
    # Event Data
    confidence = Column(Float)  # AI confidence score
    bounding_box = Column(JSON)  # Object detection bounding box
    event_data = Column(JSON, default={})  # Additional event data
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    recording = relationship("Recording", backref="events")
    
    def __repr__(self):
        return f"<RecordingEvent(id={self.id}, type={self.event_type}, timestamp={self.timestamp})>"

class RetentionPolicy(Base):
    """Retention policies for different recording types and tenants"""
    __tablename__ = "retention_policies"
    
    id = Column(String(100), primary_key=True, index=True)
    tenant_id = Column(String(100), ForeignKey("tenants.id"), nullable=False)
    
    # Policy Details
    recording_type = Column(SQLEnum(RecordingType), nullable=False)
    retention_days = Column(Integer, nullable=False)
    policy_name = Column(String(100), nullable=False)
    description = Column(Text)
    
    # Policy Settings
    is_active = Column(Boolean, default=True)
    auto_delete = Column(Boolean, default=True)
    notify_before_deletion = Column(Boolean, default=True)
    notify_days_before = Column(Integer, default=7)
    
    # Compliance
    compliance_required = Column(Boolean, default=False)
    compliance_standard = Column(String(100))  # HIPAA, GDPR, etc.
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    tenant = relationship("Tenant", backref="retention_policies")
    
    def __repr__(self):
        return f"<RetentionPolicy(id={self.id}, type={self.recording_type}, days={self.retention_days})>"

class LegalHold(Base):
    """Legal holds on recordings"""
    __tablename__ = "legal_holds"
    
    id = Column(String(100), primary_key=True, index=True)
    recording_id = Column(String(100), ForeignKey("recordings.id"), nullable=False)
    tenant_id = Column(String(100), ForeignKey("tenants.id"), nullable=False)
    
    # Hold Details
    case_number = Column(String(100))
    case_name = Column(String(200))
    description = Column(Text)
    
    # Hold Period
    hold_start_date = Column(DateTime, nullable=False)
    hold_end_date = Column(DateTime)  # Null means indefinite
    is_active = Column(Boolean, default=True)
    
    # Legal Information
    attorney_name = Column(String(200))
    attorney_email = Column(String(255))
    attorney_phone = Column(String(50))
    
    # Metadata
    created_by = Column(String(100))  # User who created the hold
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    recording = relationship("Recording", backref="legal_holds")
    tenant = relationship("Tenant", backref="legal_holds")
    
    def __repr__(self):
        return f"<LegalHold(id={self.id}, recording_id={self.recording_id}, case={self.case_name})>" 