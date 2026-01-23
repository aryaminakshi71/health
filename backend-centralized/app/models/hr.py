"""
HR Models (Enhanced with Healthcare)
Models for HR application including healthcare staff management
"""

from sqlalchemy import Column, Integer, String, DateTime, Float, Text, ForeignKey, Boolean, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class Employee(Base):
    __tablename__ = "employees"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    employee_id = Column(String(50), unique=True)
    department = Column(String(100))
    position = Column(String(100))
    hire_date = Column(DateTime)
    salary = Column(Float)
    manager_id = Column(Integer, ForeignKey("employees.id"))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User")
    manager = relationship("Employee", remote_side=[id])

class TimeSheet(Base):
    __tablename__ = "timesheets"
    
    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"))
    date = Column(DateTime)
    clock_in = Column(DateTime)
    clock_out = Column(DateTime)
    total_hours = Column(Float)
    overtime_hours = Column(Float, default=0.0)
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    employee = relationship("Employee")

# Healthcare HR Components
class MedicalStaffManagement(Base):
    __tablename__ = "medical_staff_management"
    
    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"))
    medical_license = Column(String(100))
    specialty = Column(String(100))
    certifications = Column(JSON)
    privileges = Column(JSON)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    employee = relationship("Employee")

class HealthcareEmployeeRecords(Base):
    __tablename__ = "healthcare_employee_records"
    
    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"))
    record_type = Column(String(50))  # performance, training, certification, incident
    record_date = Column(DateTime)
    description = Column(Text)
    attachments = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    employee = relationship("Employee")

class MedicalStaffTimesheets(Base):
    __tablename__ = "medical_staff_timesheets"
    
    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"))
    date = Column(DateTime)
    shift_type = Column(String(50))  # day, night, on_call, overtime
    clock_in = Column(DateTime)
    clock_out = Column(DateTime)
    break_time = Column(Integer)  # in minutes
    total_hours = Column(Float)
    department = Column(String(100))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    employee = relationship("Employee")

class HealthcareHROperations(Base):
    __tablename__ = "healthcare_hr_operations"
    
    id = Column(Integer, primary_key=True, index=True)
    operation_type = Column(String(50))  # recruitment, training, performance, compliance
    operation_name = Column(String(200))
    description = Column(Text)
    status = Column(String(20))  # active, completed, pending
    created_at = Column(DateTime, default=datetime.utcnow)
