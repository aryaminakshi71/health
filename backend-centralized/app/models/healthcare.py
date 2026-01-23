"""
Healthcare Models (Simplified - Core Healthcare Only)
Models for core healthcare application
"""

from sqlalchemy import Column, Integer, String, DateTime, Text, Boolean, ForeignKey, Float, Date, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
from datetime import datetime, date
import json

class Patient(Base):
    __tablename__ = "patients"
    
    id = Column(Integer, primary_key=True, index=True)
    mrn = Column(String(50), unique=True, index=True, nullable=False)  # Medical Record Number
    first_name = Column(String(50), nullable=False)
    last_name = Column(String(50), nullable=False)
    date_of_birth = Column(Date, nullable=False)
    gender = Column(String(10))
    phone = Column(String(20))
    email = Column(String(100))
    address = Column(Text)
    emergency_contact = Column(Text)
    insurance_info = Column(Text)
    medical_history = Column(Text)
    allergies = Column(Text)
    current_medications = Column(Text)
    status = Column(String(20), default='active')  # active, inactive, discharged
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    medical_records = relationship("MedicalRecord", back_populates="patient")
    appointments = relationship("Appointment", back_populates="patient")
    lab_results = relationship("LabResult", back_populates="patient")
    prescriptions = relationship("Prescription", back_populates="patient")
    
    def get_full_name(self) -> str:
        return f"{self.first_name} {self.last_name}"
    
    def get_age(self) -> int:
        today = date.today()
        return today.year - self.date_of_birth.year - ((today.month, today.day) < (self.date_of_birth.month, self.date_of_birth.day))

class MedicalRecord(Base):
    __tablename__ = "medical_records"
    
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey('patients.id'), nullable=False)
    record_type = Column(String(50), nullable=False)  # consultation, procedure, surgery, etc.
    diagnosis = Column(Text)
    symptoms = Column(Text)
    treatment_plan = Column(Text)
    notes = Column(Text)
    doctor_id = Column(Integer, ForeignKey('users.id'))
    visit_date = Column(DateTime, nullable=False)
    next_follow_up = Column(DateTime)
    status = Column(String(20), default='active')
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    patient = relationship("Patient", back_populates="medical_records")
    doctor = relationship("User")
    vitals = relationship("VitalSigns", back_populates="medical_record")

class VitalSigns(Base):
    __tablename__ = "vital_signs"
    
    id = Column(Integer, primary_key=True, index=True)
    medical_record_id = Column(Integer, ForeignKey('medical_records.id'), nullable=False)
    temperature = Column(Float)
    blood_pressure_systolic = Column(Integer)
    blood_pressure_diastolic = Column(Integer)
    heart_rate = Column(Integer)
    respiratory_rate = Column(Integer)
    oxygen_saturation = Column(Float)
    height = Column(Float)
    weight = Column(Float)
    bmi = Column(Float)
    recorded_at = Column(DateTime, default=func.now())
    
    # Relationships
    medical_record = relationship("MedicalRecord", back_populates="vitals")
    
    def calculate_bmi(self) -> float:
        if self.height and self.weight:
            height_m = self.height / 100  # Convert cm to meters
            return round(self.weight / (height_m ** 2), 2)
        return None

class Appointment(Base):
    __tablename__ = "appointments"
    
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey('patients.id'), nullable=False)
    doctor_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    appointment_type = Column(String(50))  # consultation, follow-up, procedure, etc.
    scheduled_date = Column(DateTime, nullable=False)
    duration_minutes = Column(Integer, default=30)
    status = Column(String(20), default='scheduled')  # scheduled, confirmed, completed, cancelled
    notes = Column(Text)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    patient = relationship("Patient", back_populates="appointments")
    doctor = relationship("User")

class LabResult(Base):
    __tablename__ = "lab_results"
    
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey('patients.id'), nullable=False)
    test_name = Column(String(100), nullable=False)
    test_category = Column(String(50))  # blood, urine, imaging, etc.
    result_value = Column(String(100))
    normal_range = Column(String(100))
    unit = Column(String(20))
    is_abnormal = Column(Boolean, default=False)
    lab_name = Column(String(100))
    ordered_by = Column(Integer, ForeignKey('users.id'))
    ordered_date = Column(DateTime)
    result_date = Column(DateTime)
    notes = Column(Text)
    created_at = Column(DateTime, default=func.now())
    
    # Relationships
    patient = relationship("Patient", back_populates="lab_results")
    ordered_by_user = relationship("User")

class Prescription(Base):
    __tablename__ = "prescriptions"
    
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey('patients.id'), nullable=False)
    medication_name = Column(String(100), nullable=False)
    dosage = Column(String(50))
    frequency = Column(String(50))
    duration = Column(String(50))
    prescribed_by = Column(Integer, ForeignKey('users.id'), nullable=False)
    prescribed_date = Column(DateTime, default=func.now())
    start_date = Column(DateTime)
    end_date = Column(DateTime)
    status = Column(String(20), default='active')  # active, completed, discontinued
    refills_remaining = Column(Integer, default=0)
    notes = Column(Text)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    patient = relationship("Patient", back_populates="prescriptions")
    prescribed_by_user = relationship("User")

class HIPAACompliance(Base):
    __tablename__ = "hipaa_compliance"
    
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey('patients.id'), nullable=False)
    access_type = Column(String(50))  # view, edit, delete, export
    accessed_by = Column(Integer, ForeignKey('users.id'), nullable=False)
    access_reason = Column(Text)
    ip_address = Column(String(45))
    user_agent = Column(Text)
    accessed_at = Column(DateTime, default=func.now())
    data_accessed = Column(Text)  # JSON string of accessed data
    
    # Relationships
    patient = relationship("Patient")
    user = relationship("User")

class MedicalDevice(Base):
    __tablename__ = "medical_devices"
    
    id = Column(Integer, primary_key=True, index=True)
    device_name = Column(String(100), nullable=False)
    device_type = Column(String(50))  # monitor, ventilator, pump, etc.
    serial_number = Column(String(100), unique=True)
    manufacturer = Column(String(100))
    model = Column(String(100))
    location = Column(String(100))
    status = Column(String(20), default='active')  # active, maintenance, retired
    last_maintenance = Column(DateTime)
    next_maintenance = Column(DateTime)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

class TreatmentPlan(Base):
    __tablename__ = "treatment_plans"
    
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey('patients.id'), nullable=False)
    plan_name = Column(String(100), nullable=False)
    diagnosis = Column(Text)
    goals = Column(Text)
    interventions = Column(Text)
    timeline = Column(Text)
    created_by = Column(Integer, ForeignKey('users.id'), nullable=False)
    start_date = Column(DateTime, default=func.now())
    end_date = Column(DateTime)
    status = Column(String(20), default='active')  # active, completed, discontinued
    progress_notes = Column(Text)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    patient = relationship("Patient")
    created_by_user = relationship("User")

class MedicalAlert(Base):
    __tablename__ = "medical_alerts"
    
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey('patients.id'), nullable=False)
    alert_type = Column(String(50))  # allergy, medication, condition, etc.
    alert_message = Column(Text, nullable=False)
    severity = Column(String(20))  # low, medium, high, critical
    is_active = Column(Boolean, default=True)
    created_by = Column(Integer, ForeignKey('users.id'))
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    patient = relationship("Patient")
    created_by_user = relationship("User")

class Insurance(Base):
    __tablename__ = "insurance"
    
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey('patients.id'), nullable=False)
    insurance_provider = Column(String(100), nullable=False)
    policy_number = Column(String(100))
    group_number = Column(String(100))
    coverage_type = Column(String(50))  # primary, secondary, etc.
    start_date = Column(Date)
    end_date = Column(Date)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    patient = relationship("Patient")

class MedicalImage(Base):
    __tablename__ = "medical_images"
    
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey('patients.id'), nullable=False)
    image_type = Column(String(50))  # x-ray, mri, ct, ultrasound, etc.
    image_url = Column(String(255))
    file_name = Column(String(255))
    file_size = Column(Integer)
    uploaded_by = Column(Integer, ForeignKey('users.id'), nullable=False)
    uploaded_at = Column(DateTime, default=func.now())
    description = Column(Text)
    is_encrypted = Column(Boolean, default=True)
    
    # Relationships
    patient = relationship("Patient")
    uploaded_by_user = relationship("User")

# Healthcare-specific enums and constants
MEDICAL_STATUS_CHOICES = [
    'active', 'inactive', 'discharged', 'deceased'
]

APPOINTMENT_STATUS_CHOICES = [
    'scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'
]

LAB_RESULT_STATUS_CHOICES = [
    'ordered', 'in_progress', 'completed', 'cancelled'
]

PRESCRIPTION_STATUS_CHOICES = [
    'active', 'completed', 'discontinued', 'expired'
]

ALERT_SEVERITY_CHOICES = [
    'low', 'medium', 'high', 'critical'
]

# HIPAA compliance tracking
class HIPAAAuditLog(Base):
    __tablename__ = "hipaa_audit_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    action = Column(String(100), nullable=False)  # view, edit, delete, export, etc.
    resource_type = Column(String(50))  # patient, medical_record, lab_result, etc.
    resource_id = Column(Integer)
    ip_address = Column(String(45))
    user_agent = Column(Text)
    timestamp = Column(DateTime, default=func.now())
    details = Column(Text)  # JSON string with additional details
    
    # Relationships
    user = relationship("User")
