"""
Cloud Storage Models (Enhanced with Healthcare)
Models for cloud storage application including healthcare storage
"""

from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class File(Base):
    __tablename__ = "files"
    
    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String(255))
    original_filename = Column(String(255))
    file_path = Column(String(500))
    file_size = Column(Integer)
    mime_type = Column(String(100))
    uploader_id = Column(Integer, ForeignKey("users.id"))
    folder_id = Column(Integer)
    is_public = Column(Boolean, default=False)
    download_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    uploader = relationship("User")

class Folder(Base):
    __tablename__ = "folders"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255))
    parent_folder_id = Column(Integer, ForeignKey("folders.id"))
    owner_id = Column(Integer, ForeignKey("users.id"))
    is_public = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    owner = relationship("User")

# Healthcare Storage Components
class MedicalRecordsStorage(Base):
    __tablename__ = "medical_records_storage"
    
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"))
    record_type = Column(String(50))  # medical_history, lab_results, imaging, prescriptions
    file_id = Column(Integer, ForeignKey("files.id"))
    record_date = Column(DateTime)
    is_encrypted = Column(Boolean, default=True)
    access_level = Column(String(20))  # patient, doctor, nurse, admin
    created_at = Column(DateTime, default=datetime.utcnow)
    
    patient = relationship("Patient")
    file = relationship("File")

class HealthcareDocumentManagement(Base):
    __tablename__ = "healthcare_document_management"
    
    id = Column(Integer, primary_key=True, index=True)
    facility_id = Column(Integer)
    document_type = Column(String(50))  # policy, procedure, form, report
    title = Column(String(200))
    version = Column(String(20))
    file_id = Column(Integer, ForeignKey("files.id"))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    file = relationship("File")

class MedicalFileStorage(Base):
    __tablename__ = "medical_file_storage"
    
    id = Column(Integer, primary_key=True, index=True)
    file_id = Column(Integer, ForeignKey("files.id"))
    medical_category = Column(String(50))  # imaging, lab, prescription, note
    patient_id = Column(Integer, ForeignKey("patients.id"))
    doctor_id = Column(Integer, ForeignKey("users.id"))
    is_hipaa_compliant = Column(Boolean, default=True)
    retention_period = Column(Integer)  # in days
    created_at = Column(DateTime, default=datetime.utcnow)
    
    file = relationship("File")
    patient = relationship("Patient")
    doctor = relationship("User")

class HealthcareDataStorage(Base):
    __tablename__ = "healthcare_data_storage"
    
    id = Column(Integer, primary_key=True, index=True)
    data_type = Column(String(50))  # patient_data, analytics, reports, backups
    storage_location = Column(String(255))
    data_size = Column(Integer)
    is_encrypted = Column(Boolean, default=True)
    backup_frequency = Column(String(20))  # daily, weekly, monthly
    last_backup = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
