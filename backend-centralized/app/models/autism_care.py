"""
Autism Care Database Models
"""

from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, Float, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class AutismPatient(Base):
    __tablename__ = "autism_patients"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    date_of_birth = Column(DateTime, nullable=False)
    gender = Column(String(10), nullable=False)
    diagnosis_date = Column(DateTime, nullable=False)
    diagnosis_type = Column(String(100), nullable=False)
    severity_level = Column(String(20), nullable=False)
    contact_number = Column(String(20))
    email = Column(String(255))
    address = Column(Text)
    emergency_contact = Column(String(255))
    emergency_phone = Column(String(20))
    insurance_info = Column(JSON)
    medical_history = Column(Text)
    current_medications = Column(Text)
    allergies = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    therapy_sessions = relationship("AutismTherapySession", back_populates="patient")
    progress_reports = relationship("AutismProgressReport", back_populates="patient")
    family_members = relationship("AutismFamilyMember", back_populates="patient")

class AutismTherapySession(Base):
    __tablename__ = "autism_therapy_sessions"
    
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("autism_patients.id"), nullable=False)
    therapist_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    session_date = Column(DateTime, nullable=False)
    session_type = Column(String(100), nullable=False)
    duration_minutes = Column(Integer, nullable=False)
    goals = Column(Text)
    activities = Column(Text)
    observations = Column(Text)
    progress_notes = Column(Text)
    next_session_plan = Column(Text)
    status = Column(String(20), default="scheduled")  # scheduled, completed, cancelled
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    patient = relationship("AutismPatient", back_populates="therapy_sessions")
    therapist = relationship("User")

class AutismProgressReport(Base):
    __tablename__ = "autism_progress_reports"
    
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("autism_patients.id"), nullable=False)
    report_date = Column(DateTime, nullable=False)
    period_start = Column(DateTime, nullable=False)
    period_end = Column(DateTime, nullable=False)
    communication_skills = Column(JSON)  # Detailed assessment
    social_skills = Column(JSON)
    behavioral_progress = Column(JSON)
    academic_progress = Column(JSON)
    motor_skills = Column(JSON)
    sensory_integration = Column(JSON)
    goals_achieved = Column(Text)
    challenges_faced = Column(Text)
    recommendations = Column(Text)
    next_period_goals = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    patient = relationship("AutismPatient", back_populates="progress_reports")

class AutismFamilyMember(Base):
    __tablename__ = "autism_family_members"
    
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("autism_patients.id"), nullable=False)
    name = Column(String(255), nullable=False)
    relationship_type = Column(String(50), nullable=False)
    contact_number = Column(String(20))
    email = Column(String(255))
    address = Column(Text)
    is_primary_caregiver = Column(Boolean, default=False)
    emergency_contact = Column(Boolean, default=False)
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    patient = relationship("AutismPatient", back_populates="family_members")

class AutismBehavioralIncident(Base):
    __tablename__ = "autism_behavioral_incidents"
    
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("autism_patients.id"), nullable=False)
    incident_date = Column(DateTime, nullable=False)
    incident_type = Column(String(100), nullable=False)
    severity = Column(String(20), nullable=False)  # mild, moderate, severe
    description = Column(Text, nullable=False)
    triggers = Column(Text)
    response_taken = Column(Text)
    outcome = Column(Text)
    follow_up_required = Column(Boolean, default=False)
    follow_up_notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    patient = relationship("AutismPatient")

class AutismTreatmentPlan(Base):
    __tablename__ = "autism_treatment_plans"
    
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("autism_patients.id"), nullable=False)
    therapist_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    plan_name = Column(String(255), nullable=False)
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime)
    goals = Column(JSON, nullable=False)
    interventions = Column(JSON, nullable=False)
    frequency = Column(String(50), nullable=False)
    duration = Column(String(50), nullable=False)
    status = Column(String(20), default="active")  # active, completed, suspended
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    patient = relationship("AutismPatient")
    therapist = relationship("User") 