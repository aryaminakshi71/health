"""
Surveillance Models (Enhanced with Healthcare)
Models for surveillance application including healthcare monitoring
"""

from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, Text, JSON, Float, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.core.database import Base

class CameraType(enum.Enum):
    FIXED = "fixed"
    PTZ = "ptz"
    DOME = "dome"
    BULLET = "bullet"
    THERMAL = "thermal"
    AI = "ai"

class CameraStatus(enum.Enum):
    ONLINE = "online"
    OFFLINE = "offline"
    MAINTENANCE = "maintenance"
    ERROR = "error"

class AccessLevel(enum.Enum):
    PUBLIC = "public"
    RESTRICTED = "restricted"
    HIGH_SECURITY = "high-security"
    CRITICAL = "critical"

class AlertSeverity(enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class AlertStatus(enum.Enum):
    ACTIVE = "active"
    ACKNOWLEDGED = "acknowledged"
    RESOLVED = "resolved"
    FALSE_ALARM = "false-alarm"

class Camera(Base):
    __tablename__ = "cameras"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    location_id = Column(Integer, ForeignKey("camera_locations.id"))
    type = Column(Enum(CameraType), default=CameraType.FIXED)
    status = Column(Enum(CameraStatus), default=CameraStatus.OFFLINE)
    resolution = Column(String(50))  # 4K, 1080p, 720p, etc.
    fps = Column(Integer, default=30)
    ip_address = Column(String(45))
    port = Column(Integer, default=554)
    username = Column(String(100))
    password_hash = Column(String(255))
    stream_url = Column(String(500))
    recording_url = Column(String(500))
    recording_enabled = Column(Boolean, default=True)
    motion_detection_enabled = Column(Boolean, default=True)
    ai_analytics_enabled = Column(Boolean, default=False)
    privacy_zones = Column(JSON)  # Array of privacy zone coordinates
    permissions = Column(JSON)  # Array of permission strings
    last_maintenance = Column(DateTime)
    next_maintenance = Column(DateTime)
    uptime = Column(Float, default=0.0)  # Percentage
    storage_used = Column(Float, default=0.0)  # GB
    storage_total = Column(Float, default=0.0)  # GB
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    location = relationship("CameraLocation", back_populates="cameras")
    recordings = relationship("Recording", back_populates="camera")
    alerts = relationship("SecurityAlert", back_populates="camera")
    telesitting_sessions = relationship("TelesittingSession", back_populates="camera")

class CameraLocation(Base):
    __tablename__ = "camera_locations"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    building = Column(String(100))
    floor = Column(String(50))
    room = Column(String(50))
    area = Column(String(100))
    coordinates_x = Column(Float)
    coordinates_y = Column(Float)
    coordinates_z = Column(Float)
    description = Column(Text)
    access_level = Column(Enum(AccessLevel), default=AccessLevel.PUBLIC)
    patient_privacy_zone = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    cameras = relationship("Camera", back_populates="location")

class AIAnalytics(Base):
    __tablename__ = "ai_analytics"
    
    id = Column(Integer, primary_key=True, index=True)
    camera_id = Column(Integer, ForeignKey("cameras.id"))
    type = Column(String(50))  # motion, face, object, behavior, fall-detection, crowd, loitering
    enabled = Column(Boolean, default=True)
    sensitivity = Column(Integer, default=5)  # 1-10
    confidence = Column(Float, default=80.0)  # 0-100
    rules = Column(JSON)  # Array of AI rules
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    camera = relationship("Camera")

class Recording(Base):
    __tablename__ = "recordings"
    
    id = Column(Integer, primary_key=True, index=True)
    camera_id = Column(Integer, ForeignKey("cameras.id"))
    filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_size = Column(Integer)  # in bytes
    duration = Column(Integer)  # in seconds
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime)
    motion_detected = Column(Boolean, default=False)
    ai_events = Column(JSON)  # Array of AI-detected events
    encryption_key = Column(String(255))  # For HIPAA compliance
    retention_policy = Column(String(100))  # How long to keep
    is_archived = Column(Boolean, default=False)
    archive_path = Column(String(500))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    camera = relationship("Camera", back_populates="recordings")

class SecurityAlert(Base):
    __tablename__ = "security_alerts"
    
    id = Column(Integer, primary_key=True, index=True)
    type = Column(String(50))  # motion, unauthorized-access, tampering, fall-detection, loitering, crowd, panic, door-forced, maintenance
    severity = Column(Enum(AlertSeverity), default=AlertSeverity.MEDIUM)
    status = Column(Enum(AlertStatus), default=AlertStatus.ACTIVE)
    camera_id = Column(Integer, ForeignKey("cameras.id"))
    location = Column(String(200))
    timestamp = Column(DateTime, default=datetime.utcnow)
    description = Column(Text)
    evidence = Column(JSON)  # Array of evidence files
    assigned_to = Column(String(100))
    notes = Column(JSON)  # Array of alert notes
    escalation_level = Column(Integer, default=1)
    auto_escalation = Column(Boolean, default=True)
    escalation_time = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    camera = relationship("Camera", back_populates="alerts")

class AccessControl(Base):
    __tablename__ = "access_controls"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    location = Column(String(200))
    type = Column(String(50))  # card, biometric, keypad, mobile, facial
    status = Column(String(50))  # active, inactive, maintenance, error
    access_level = Column(Enum(AccessLevel), default=AccessLevel.PUBLIC)
    last_access = Column(DateTime)
    failed_attempts = Column(Integer, default=0)
    lockout_until = Column(DateTime)
    permissions = Column(JSON)  # Array of permissions
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    access_logs = relationship("AccessLog", back_populates="access_control")

class AccessLog(Base):
    __tablename__ = "access_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    access_control_id = Column(Integer, ForeignKey("access_controls.id"))
    user_id = Column(String(100))
    user_name = Column(String(200))
    timestamp = Column(DateTime, default=datetime.utcnow)
    action = Column(String(50))  # granted, denied, timeout, emergency
    method = Column(String(50))  # card, biometric, keypad, mobile, facial
    location = Column(String(200))
    reason = Column(String(500))
    ip_address = Column(String(45))
    device_info = Column(String(500))
    
    # Relationships
    access_control = relationship("AccessControl", back_populates="access_logs")

class AlarmSystem(Base):
    __tablename__ = "alarm_systems"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    type = Column(String(50))  # panic, fire, medical, security, environmental
    location = Column(String(200))
    status = Column(String(50))  # active, inactive, triggered, maintenance
    last_test = Column(DateTime)
    next_test = Column(DateTime)
    battery_level = Column(Float, default=100.0)
    signal_strength = Column(Float, default=100.0)
    connected_devices = Column(JSON)  # Array of connected devices
    triggers = Column(JSON)  # Array of alarm triggers
    created_at = Column(DateTime, default=datetime.utcnow)

class TelesittingSession(Base):
    __tablename__ = "telesitting_sessions"
    
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(String(100), nullable=False)
    patient_name = Column(String(200), nullable=False)
    room = Column(String(50))
    camera_id = Column(Integer, ForeignKey("cameras.id"))
    start_time = Column(DateTime, default=datetime.utcnow)
    end_time = Column(DateTime)
    status = Column(String(50))  # active, completed, cancelled
    observer = Column(String(200))
    fall_detected = Column(Boolean, default=False)
    medical_episodes = Column(JSON)  # Array of medical episodes
    notes = Column(Text)
    quality = Column(String(50))  # excellent, good, fair, poor
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    camera = relationship("Camera", back_populates="telesitting_sessions")

class MedicalEpisode(Base):
    __tablename__ = "medical_episodes"
    
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("telesitting_sessions.id"))
    type = Column(String(50))  # fall, seizure, distress, wandering, other
    timestamp = Column(DateTime, default=datetime.utcnow)
    severity = Column(Enum(AlertSeverity), default=AlertSeverity.MEDIUM)
    description = Column(Text)
    action_taken = Column(Text)
    response_time = Column(Integer)  # in seconds
    resolved = Column(Boolean, default=False)
    resolution_time = Column(DateTime)
    
    # Relationships
    session = relationship("TelesittingSession")

class SecurityZone(Base):
    __tablename__ = "security_zones"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    type = Column(String(50))  # public, restricted, high-security, critical, patient-care
    description = Column(Text)
    boundaries = Column(JSON)  # Array of zone boundaries
    access_level = Column(String(100))
    cameras = Column(JSON)  # Array of camera IDs
    access_controls = Column(JSON)  # Array of access control IDs
    alarms = Column(JSON)  # Array of alarm IDs
    rules = Column(JSON)  # Array of zone rules
    emergency_procedures = Column(JSON)  # Array of emergency procedures
    created_at = Column(DateTime, default=datetime.utcnow)

class SurveillanceSettings(Base):
    __tablename__ = "surveillance_settings"
    
    id = Column(Integer, primary_key=True, index=True)
    recording_retention = Column(Integer, default=30)  # days
    motion_sensitivity = Column(Integer, default=5)  # 1-10
    ai_confidence = Column(Float, default=80.0)  # 0-100
    privacy_mode = Column(Boolean, default=True)
    auto_escalation = Column(Boolean, default=True)
    escalation_delay = Column(Integer, default=5)  # minutes
    notification_settings = Column(JSON)  # Email, SMS, push settings
    privacy_compliance = Column(JSON)  # HIPAA compliance settings
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class SecurityEvent(Base):
    __tablename__ = "security_events"
    
    id = Column(Integer, primary_key=True, index=True)
    type = Column(String(50))  # incident, maintenance, test, drill
    severity = Column(Enum(AlertSeverity), default=AlertSeverity.MEDIUM)
    status = Column(String(50))  # open, investigating, resolved, closed
    title = Column(String(200), nullable=False)
    description = Column(Text)
    location = Column(String(200))
    timestamp = Column(DateTime, default=datetime.utcnow)
    reported_by = Column(String(200))
    assigned_to = Column(String(200))
    evidence = Column(JSON)  # Array of evidence files
    actions = Column(JSON)  # Array of actions taken
    timeline = Column(JSON)  # Array of timeline events
    tags = Column(JSON)  # Array of tags
    category = Column(String(100))
    impact = Column(String(50))  # none, low, medium, high, critical
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# Healthcare Surveillance Components (Enhanced)
class MedicalMonitoring(Base):
    __tablename__ = "medical_monitoring"
    
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"))
    monitoring_type = Column(String(50))  # vital_signs, movement, medication, behavior
    device_id = Column(String(100))
    data_points = Column(JSON)
    alert_threshold = Column(JSON)
    alert_triggered = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    patient = relationship("Patient")

class HealthSurveillance(Base):
    __tablename__ = "health_surveillance"
    
    id = Column(Integer, primary_key=True, index=True)
    facility_id = Column(Integer)
    surveillance_type = Column(String(50))  # infection_control, patient_safety, staff_monitoring
    camera_id = Column(Integer, ForeignKey("cameras.id"))
    monitoring_rules = Column(JSON)
    alert_conditions = Column(JSON)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    camera = relationship("Camera")
