"""
Education Models (Enhanced with Healthcare)
Models for education application including healthcare education
"""

from sqlalchemy import Column, Integer, String, DateTime, Float, Text, ForeignKey, Boolean, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class Course(Base):
    __tablename__ = "courses"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200))
    description = Column(Text)
    instructor_id = Column(Integer, ForeignKey("users.id"))
    duration_hours = Column(Integer)
    difficulty_level = Column(String(20))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    instructor = relationship("User")

class Student(Base):
    __tablename__ = "students"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    student_id = Column(String(50), unique=True)
    enrollment_date = Column(DateTime)
    graduation_date = Column(DateTime)
    gpa = Column(Float)
    status = Column(String(20))  # active, graduated, dropped
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User")

# Healthcare Education Components
class PatientEducation(Base):
    __tablename__ = "patient_education"
    
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"))
    education_type = Column(String(50))  # condition, treatment, medication, lifestyle
    title = Column(String(200))
    content = Column(Text)
    media_type = Column(String(20))  # video, document, interactive
    media_url = Column(String(255))
    completion_status = Column(String(20))  # not_started, in_progress, completed
    completion_date = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    patient = relationship("Patient")

class MedicalTraining(Base):
    __tablename__ = "medical_training"
    
    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id"))
    training_type = Column(String(50))  # clinical, administrative, compliance
    target_audience = Column(String(100))  # doctors, nurses, staff, patients
    certification_required = Column(Boolean, default=False)
    ce_credits = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    course = relationship("Course")

class HealthLearningResource(Base):
    __tablename__ = "health_learning_resources"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200))
    resource_type = Column(String(50))  # article, video, infographic, quiz
    topic = Column(String(100))
    content = Column(Text)
    media_url = Column(String(255))
    difficulty_level = Column(String(20))  # beginner, intermediate, advanced
    target_audience = Column(String(100))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
