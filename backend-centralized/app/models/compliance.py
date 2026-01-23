"""
Compliance Models (Enhanced with Healthcare)
Models for compliance application including healthcare compliance
"""

from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class ComplianceRule(Base):
    __tablename__ = "compliance_rules"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200))
    description = Column(Text)
    regulation_type = Column(String(50))  # HIPAA, GDPR, SOX, etc.
    severity_level = Column(String(20))  # low, medium, high, critical
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class ComplianceAudit(Base):
    __tablename__ = "compliance_audits"
    
    id = Column(Integer, primary_key=True, index=True)
    rule_id = Column(Integer, ForeignKey("compliance_rules.id"))
    auditor_id = Column(Integer, ForeignKey("users.id"))
    audit_date = Column(DateTime)
    status = Column(String(20))  # passed, failed, warning
    findings = Column(Text)
    recommendations = Column(Text)
    next_audit_date = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    rule = relationship("ComplianceRule")
    auditor = relationship("User")

# Healthcare Compliance Components
class MedicalSecurity(Base):
    __tablename__ = "medical_security"
    
    id = Column(Integer, primary_key=True, index=True)
    facility_id = Column(Integer)
    security_type = Column(String(50))  # access_control, data_protection, physical_security
    security_measures = Column(JSON)
    compliance_status = Column(String(20))  # compliant, non_compliant, pending
    last_review = Column(DateTime)
    next_review = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)

class HealthcareCompliance(Base):
    __tablename__ = "healthcare_compliance"
    
    id = Column(Integer, primary_key=True, index=True)
    compliance_type = Column(String(50))  # HIPAA, FDA, Joint Commission
    facility_id = Column(Integer)
    compliance_status = Column(String(20))  # compliant, non_compliant, pending
    audit_date = Column(DateTime)
    findings = Column(Text)
    corrective_actions = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

class MedicalAccessControl(Base):
    __tablename__ = "medical_access_control"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    access_level = Column(String(50))  # admin, doctor, nurse, staff, patient
    permissions = Column(JSON)
    last_access = Column(DateTime)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User")

class HIPAAMonitoring(Base):
    __tablename__ = "hipaa_monitoring"
    
    id = Column(Integer, primary_key=True, index=True)
    facility_id = Column(Integer)
    monitoring_type = Column(String(50))  # data_access, patient_privacy, security_incidents
    event_description = Column(Text)
    severity = Column(String(20))  # low, medium, high, critical
    action_taken = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
