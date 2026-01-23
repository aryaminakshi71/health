"""
Business Models (Enhanced with Healthcare)
Models for business application including healthcare operations
"""

from sqlalchemy import Column, Integer, String, DateTime, Text, Boolean, ForeignKey, Float, Date, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
from datetime import datetime, date
import json

class Project(Base):
    __tablename__ = "projects"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    description = Column(Text)
    client_id = Column(Integer, ForeignKey('clients.id'), nullable=False)
    project_manager_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date)
    status = Column(String(20), default='planning')  # planning, active, on_hold, completed, cancelled
    priority = Column(String(20), default='medium')  # low, medium, high, critical
    budget = Column(Float)
    actual_cost = Column(Float)
    progress_percentage = Column(Float, default=0.0)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    client = relationship("Client", back_populates="projects")
    project_manager = relationship("User")
    tasks = relationship("Task", back_populates="project")
    expenses = relationship("ProjectExpense", back_populates="project")
    
    def get_days_remaining(self) -> int:
        """Get days remaining until project end"""
        if self.end_date and self.status in ['planning', 'active']:
            return (self.end_date - date.today()).days
        return 0
    
    def get_budget_utilization(self) -> float:
        """Get budget utilization percentage"""
        if self.budget and self.actual_cost:
            return (self.actual_cost / self.budget) * 100
        return 0.0

class Client(Base):
    __tablename__ = "clients"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    contact_person = Column(String(100))
    email = Column(String(100))
    phone = Column(String(20))
    address = Column(Text)
    company_size = Column(String(50))  # small, medium, large, enterprise
    industry = Column(String(100))
    status = Column(String(20), default='active')  # active, inactive, prospect
    total_revenue = Column(Float, default=0.0)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    projects = relationship("Project", back_populates="client")
    invoices = relationship("Invoice", back_populates="client")
    contracts = relationship("Contract", back_populates="client")

class Task(Base):
    __tablename__ = "tasks"
    
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey('projects.id'), nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(Text)
    assigned_to = Column(Integer, ForeignKey('users.id'))
    priority = Column(String(20), default='medium')  # low, medium, high, critical
    status = Column(String(20), default='todo')  # todo, in_progress, review, completed
    estimated_hours = Column(Float)
    actual_hours = Column(Float)
    due_date = Column(DateTime)
    completed_at = Column(DateTime)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    project = relationship("Project", back_populates="tasks")
    assigned_user = relationship("User")
    time_entries = relationship("TimeEntry", back_populates="task")

class TimeEntry(Base):
    __tablename__ = "time_entries"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    task_id = Column(Integer, ForeignKey('tasks.id'), nullable=False)
    project_id = Column(Integer, ForeignKey('projects.id'), nullable=False)
    date = Column(Date, nullable=False)
    hours = Column(Float, nullable=False)
    description = Column(Text)
    billable = Column(Boolean, default=True)
    rate = Column(Float)
    created_at = Column(DateTime, default=func.now())
    
    # Relationships
    user = relationship("User")
    task = relationship("Task", back_populates="time_entries")
    project = relationship("Project")

class Revenue(Base):
    __tablename__ = "revenues"
    
    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(Integer, ForeignKey('clients.id'), nullable=False)
    project_id = Column(Integer, ForeignKey('projects.id'))
    amount = Column(Float, nullable=False)
    revenue_type = Column(String(50))  # project_fee, hourly_rate, retainer, etc.
    billing_period = Column(String(50))  # monthly, quarterly, annually, one_time
    status = Column(String(20), default='pending')  # pending, invoiced, paid, overdue
    invoice_date = Column(DateTime)
    due_date = Column(DateTime)
    paid_date = Column(DateTime)
    created_at = Column(DateTime, default=func.now())
    
    # Relationships
    client = relationship("Client")
    project = relationship("Project")

class Invoice(Base):
    __tablename__ = "invoices"
    
    id = Column(Integer, primary_key=True, index=True)
    invoice_number = Column(String(50), unique=True, nullable=False)
    client_id = Column(Integer, ForeignKey('clients.id'), nullable=False)
    project_id = Column(Integer, ForeignKey('projects.id'))
    total_amount = Column(Float, nullable=False)
    tax_amount = Column(Float, default=0.0)
    discount_amount = Column(Float, default=0.0)
    status = Column(String(20), default='draft')  # draft, sent, paid, overdue, cancelled
    issue_date = Column(DateTime, nullable=False)
    due_date = Column(DateTime)
    paid_date = Column(DateTime)
    notes = Column(Text)
    created_at = Column(DateTime, default=func.now())
    
    # Relationships
    client = relationship("Client", back_populates="invoices")
    project = relationship("Project")
    items = relationship("InvoiceItem", back_populates="invoice")

class InvoiceItem(Base):
    __tablename__ = "invoice_items"
    
    id = Column(Integer, primary_key=True, index=True)
    invoice_id = Column(Integer, ForeignKey('invoices.id'), nullable=False)
    description = Column(String(200), nullable=False)
    quantity = Column(Float, default=1.0)
    unit_price = Column(Float, nullable=False)
    total_price = Column(Float, nullable=False)
    tax_rate = Column(Float, default=0.0)
    created_at = Column(DateTime, default=func.now())
    
    # Relationships
    invoice = relationship("Invoice", back_populates="items")

class Contract(Base):
    __tablename__ = "contracts"
    
    id = Column(Integer, primary_key=True, index=True)
    contract_number = Column(String(50), unique=True, nullable=False)
    client_id = Column(Integer, ForeignKey('clients.id'), nullable=False)
    contract_type = Column(String(50))  # service, maintenance, support, license
    start_date = Column(Date, nullable=False)
    end_date = Column(Date)
    total_value = Column(Float)
    status = Column(String(20), default='active')  # active, expired, terminated, renewed
    terms = Column(Text)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    client = relationship("Client", back_populates="contracts")

class ProjectExpense(Base):
    __tablename__ = "project_expenses"
    
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey('projects.id'), nullable=False)
    expense_type = Column(String(50))  # travel, materials, software, equipment, etc.
    description = Column(String(200), nullable=False)
    amount = Column(Float, nullable=False)
    date = Column(Date, nullable=False)
    approved_by = Column(Integer, ForeignKey('users.id'))
    receipt_url = Column(String(255))
    created_at = Column(DateTime, default=func.now())
    
    # Relationships
    project = relationship("Project", back_populates="expenses")
    approved_by_user = relationship("User")

class BusinessMetrics(Base):
    __tablename__ = "business_metrics"
    
    id = Column(Integer, primary_key=True, index=True)
    metric_name = Column(String(100), nullable=False)
    metric_value = Column(Float, nullable=False)
    metric_type = Column(String(50))  # revenue, profit, efficiency, quality
    period = Column(String(20))  # daily, weekly, monthly, quarterly, yearly
    date = Column(Date, nullable=False)
    target_value = Column(Float)
    created_at = Column(DateTime, default=func.now())
    
    def get_performance_percentage(self) -> float:
        """Get performance percentage against target"""
        if self.target_value and self.metric_value:
            return (self.metric_value / self.target_value) * 100
        return 0.0

class Employee(Base):
    __tablename__ = "employees"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), unique=True, nullable=False)
    employee_id = Column(String(50), unique=True, nullable=False)
    department = Column(String(100))
    position = Column(String(100))
    hire_date = Column(Date, nullable=False)
    salary = Column(Float)
    hourly_rate = Column(Float)
    manager_id = Column(Integer, ForeignKey('employees.id'))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("User")
    manager = relationship("Employee", remote_side=[id])
    direct_reports = relationship("Employee", overlaps="manager")

class Company(Base):
    __tablename__ = "companies"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    legal_name = Column(String(200))
    tax_id = Column(String(50))
    address = Column(Text)
    phone = Column(String(20))
    email = Column(String(100))
    website = Column(String(255))
    industry = Column(String(100))
    company_size = Column(String(50))
    founded_year = Column(Integer)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

class BusinessReport(Base):
    __tablename__ = "business_reports"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    report_type = Column(String(100))  # financial, project, client, custom
    description = Column(Text)
    filters = Column(Text)  # JSON string of filters used
    generated_at = Column(DateTime, default=func.now())
    generated_by = Column(Integer, ForeignKey('users.id'))
    client_id = Column(Integer, ForeignKey('clients.id'))
    project_id = Column(Integer, ForeignKey('projects.id'))
    data = Column(JSON)  # optional denormalized snapshot
    status = Column(String(20), default='ready')  # ready, generating, failed

    # Relationships
    client = relationship("Client")
    project = relationship("Project")

# Business constants
PROJECT_STATUSES = [
    'planning', 'active', 'on_hold', 'completed', 'cancelled'
]

TASK_STATUSES = [
    'todo', 'in_progress', 'review', 'completed'
]

PRIORITIES = [
    'low', 'medium', 'high', 'critical'
]

INVOICE_STATUSES = [
    'draft', 'sent', 'paid', 'overdue', 'cancelled'
]

CONTRACT_TYPES = [
    'service', 'maintenance', 'support', 'license', 'consulting'
]

REVENUE_TYPES = [
    'project_fee', 'hourly_rate', 'retainer', 'subscription', 'one_time'
]
