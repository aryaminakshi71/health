"""
Centralized Models
All models for all applications in one place
"""

# Import all models to ensure they are registered with SQLAlchemy
from .user import User, Role, Permission, UserProfile, SecurityPolicy
from .tenant import Tenant
from .healthcare import Patient, MedicalRecord, Appointment, LabResult, Prescription
from .ai_analytics import MLModel, Prediction, DataSource, Dashboard, Insight
from .communication import Call, Message, Contact, Conference, PhoneNumber
from .business import Project, Client, Task, Revenue, Invoice, Contract
from .inventory import Item, Supplier, StockMovement, PurchaseOrder
from .financial import Account, Transaction, Budget, FinancialReport, FinancialRevenue
from .autism_care import AutismPatient, AutismTherapySession, AutismProgressReport, AutismFamilyMember, AutismBehavioralIncident, AutismTreatmentPlan
from .website_builder import Website, WebsitePage, WebsiteComponent, WebsiteTemplate, WebsiteCustomDomain, WebsiteAnalytics, WebsiteForm, WebsiteFormSubmission, WebsiteHosting
from .mobile_app import MobileApp, MobileAppScreen, MobileAppComponent, MobileAppTemplate, MobileAppBuild, MobileAppAnalytics, MobileAppPublishing, MobileAppMonetization, MobileAppTesting

__all__ = [
    # User
    "User",
    
    # Tenant
    "Tenant",
    
    # Healthcare
    "Patient", "MedicalRecord", "Appointment", "LabResult", "Prescription",
    
    # AI Analytics
    "MLModel", "Prediction", "DataSource", "Dashboard", "Insight",
    
    # Communication
    "Call", "Message", "Contact", "Conference", "PhoneNumber",
    
    # Business
    "Project", "Client", "Task", "Revenue", "Invoice", "Contract",
    
    # Inventory
    "Item", "Supplier", "StockMovement", "PurchaseOrder",
    
    # Financial
    "Account", "Transaction", "Budget", "FinancialReport", "FinancialRevenue",
    
    # Autism Care
    "AutismPatient", "AutismTherapySession", "AutismProgressReport", "AutismFamilyMember", "AutismBehavioralIncident", "AutismTreatmentPlan",
    
    # Website Builder
    "Website", "WebsitePage", "WebsiteComponent", "WebsiteTemplate", "WebsiteCustomDomain", "WebsiteAnalytics", "WebsiteForm", "WebsiteFormSubmission", "WebsiteHosting",
    
    # Mobile App
    "MobileApp", "MobileAppScreen", "MobileAppComponent", "MobileAppTemplate", "MobileAppBuild", "MobileAppAnalytics", "MobileAppPublishing", "MobileAppMonetization", "MobileAppTesting",
]
