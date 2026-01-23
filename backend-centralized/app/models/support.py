"""
Support Models (Enhanced with Healthcare)
Models for support application including healthcare support
"""

from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, ForeignKey, JSON, Float
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class Ticket(Base):
    __tablename__ = "tickets"
    
    id = Column(Integer, primary_key=True, index=True)
    ticket_number = Column(String(50), unique=True)
    requester_id = Column(Integer, ForeignKey("users.id"))
    assignee_id = Column(Integer, ForeignKey("users.id"))
    category = Column(String(100))
    priority = Column(String(20))  # low, medium, high, urgent
    status = Column(String(20))  # open, in_progress, resolved, closed
    subject = Column(String(200))
    description = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    resolved_at = Column(DateTime)
    
    requester = relationship("User", foreign_keys=[requester_id])
    assignee = relationship("User", foreign_keys=[assignee_id])

class TicketResponse(Base):
    __tablename__ = "ticket_responses"
    
    id = Column(Integer, primary_key=True, index=True)
    ticket_id = Column(Integer, ForeignKey("tickets.id"))
    responder_id = Column(Integer, ForeignKey("users.id"))
    response = Column(Text)
    is_internal = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    ticket = relationship("Ticket")
    responder = relationship("User")

# Healthcare Support Components
class PatientSupportTickets(Base):
    __tablename__ = "patient_support_tickets"
    
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"))
    ticket_id = Column(Integer, ForeignKey("tickets.id"))
    support_type = Column(String(50))  # appointment, billing, technical, medical
    urgency_level = Column(String(20))  # routine, urgent, emergency
    created_at = Column(DateTime, default=datetime.utcnow)
    
    patient = relationship("Patient")
    ticket = relationship("Ticket")

class MedicalTechnicalSupport(Base):
    __tablename__ = "medical_technical_support"
    
    id = Column(Integer, primary_key=True, index=True)
    ticket_id = Column(Integer, ForeignKey("tickets.id"))
    equipment_id = Column(String(100))
    issue_type = Column(String(50))  # hardware, software, connectivity, training
    resolution_time = Column(Integer)  # in minutes
    created_at = Column(DateTime, default=datetime.utcnow)
    
    ticket = relationship("Ticket")

class HealthcareCustomerService(Base):
    __tablename__ = "healthcare_customer_service"
    
    id = Column(Integer, primary_key=True, index=True)
    ticket_id = Column(Integer, ForeignKey("tickets.id"))
    service_type = Column(String(50))  # patient_inquiry, complaint, feedback, request
    satisfaction_rating = Column(Integer)  # 1-5 scale
    follow_up_required = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    ticket = relationship("Ticket")

class MedicalSupportManagement(Base):
    __tablename__ = "medical_support_management"
    
    id = Column(Integer, primary_key=True, index=True)
    facility_id = Column(Integer)
    support_category = Column(String(50))  # clinical, administrative, technical, patient
    total_tickets = Column(Integer, default=0)
    resolved_tickets = Column(Integer, default=0)
    average_resolution_time = Column(Float)  # in hours
    created_at = Column(DateTime, default=datetime.utcnow)
