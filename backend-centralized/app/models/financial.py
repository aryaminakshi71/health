"""
Financial Models (Enhanced with Healthcare)
Models for financial application including healthcare billing
"""

from sqlalchemy import Column, Integer, String, DateTime, Text, Boolean, ForeignKey, Float, Date, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
from datetime import datetime, date
import json

class Account(Base):
    __tablename__ = "accounts"
    
    id = Column(Integer, primary_key=True, index=True)
    account_number = Column(String(50), unique=True, nullable=False)
    name = Column(String(200), nullable=False)
    account_type = Column(String(50), nullable=False)  # asset, liability, equity, revenue, expense
    category = Column(String(100))  # cash, accounts_receivable, accounts_payable, etc.
    description = Column(Text)
    balance = Column(Float, default=0.0)
    currency = Column(String(3), default='USD')
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    transactions = relationship("Transaction", back_populates="account")
    
    def get_balance_as_of_date(self, as_of_date: date) -> float:
        """Get account balance as of a specific date"""
        # This would calculate balance from transactions up to the date
        return self.balance

class Transaction(Base):
    __tablename__ = "transactions"
    
    id = Column(Integer, primary_key=True, index=True)
    transaction_number = Column(String(50), unique=True, nullable=False)
    account_id = Column(Integer, ForeignKey('accounts.id'), nullable=False)
    transaction_type = Column(String(20), nullable=False)  # debit, credit
    amount = Column(Float, nullable=False)
    description = Column(String(200), nullable=False)
    reference_number = Column(String(50))  # invoice number, check number, etc.
    reference_type = Column(String(50))  # invoice, payment, adjustment, etc.
    transaction_date = Column(Date, nullable=False)
    posted_date = Column(DateTime, default=func.now())
    is_reconciled = Column(Boolean, default=False)
    notes = Column(Text)
    created_by = Column(Integer, ForeignKey('users.id'), nullable=False)
    created_at = Column(DateTime, default=func.now())
    
    # Relationships
    account = relationship("Account", back_populates="transactions")
    created_by_user = relationship("User")
    
    def get_balance_impact(self) -> float:
        """Get the impact on account balance"""
        if self.transaction_type == 'debit':
            return -self.amount
        return self.amount

class Budget(Base):
    __tablename__ = "budgets"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    description = Column(Text)
    budget_type = Column(String(50))  # annual, quarterly, monthly, project
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    total_amount = Column(Float, nullable=False)
    actual_amount = Column(Float, default=0.0)
    status = Column(String(20), default='active')  # active, completed, cancelled
    created_by = Column(Integer, ForeignKey('users.id'), nullable=False)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    created_by_user = relationship("User")
    budget_items = relationship("BudgetItem", back_populates="budget")
    
    def get_remaining_amount(self) -> float:
        """Get remaining budget amount"""
        return self.total_amount - self.actual_amount
    
    def get_utilization_percentage(self) -> float:
        """Get budget utilization percentage"""
        if self.total_amount > 0:
            return (self.actual_amount / self.total_amount) * 100
        return 0.0

class BudgetItem(Base):
    __tablename__ = "budget_items"
    
    id = Column(Integer, primary_key=True, index=True)
    budget_id = Column(Integer, ForeignKey('budgets.id'), nullable=False)
    category = Column(String(100), nullable=False)
    description = Column(Text)
    planned_amount = Column(Float, nullable=False)
    actual_amount = Column(Float, default=0.0)
    created_at = Column(DateTime, default=func.now())
    
    # Relationships
    budget = relationship("Budget", back_populates="budget_items")
    
    def get_variance(self) -> float:
        """Get variance between planned and actual amounts"""
        return self.actual_amount - self.planned_amount
    
    def get_variance_percentage(self) -> float:
        """Get variance percentage"""
        if self.planned_amount > 0:
            return (self.get_variance() / self.planned_amount) * 100
        return 0.0

class FinancialReport(Base):
    __tablename__ = "financial_reports"
    
    id = Column(Integer, primary_key=True, index=True)
    report_name = Column(String(200), nullable=False)
    report_type = Column(String(50))  # income_statement, balance_sheet, cash_flow, budget_variance
    period_start = Column(Date, nullable=False)
    period_end = Column(Date, nullable=False)
    report_data = Column(Text)  # JSON string with report data
    generated_by = Column(Integer, ForeignKey('users.id'), nullable=False)
    generated_at = Column(DateTime, default=func.now())
    
    # Relationships
    generated_by_user = relationship("User")
    
    def get_report_data_dict(self) -> dict:
        """Get report data as dictionary"""
        if self.report_data:
            return json.loads(self.report_data)
        return {}

class Tax(Base):
    __tablename__ = "taxes"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    tax_type = Column(String(50))  # sales_tax, income_tax, property_tax, etc.
    rate = Column(Float, nullable=False)  # percentage rate
    is_active = Column(Boolean, default=True)
    effective_date = Column(Date, nullable=False)
    end_date = Column(Date)
    description = Column(Text)
    created_at = Column(DateTime, default=func.now())
    
    # Relationships
    tax_transactions = relationship("TaxTransaction", back_populates="tax")

class TaxTransaction(Base):
    __tablename__ = "tax_transactions"
    
    id = Column(Integer, primary_key=True, index=True)
    transaction_id = Column(Integer, ForeignKey('transactions.id'), nullable=False)
    tax_id = Column(Integer, ForeignKey('taxes.id'), nullable=False)
    taxable_amount = Column(Float, nullable=False)
    tax_amount = Column(Float, nullable=False)
    created_at = Column(DateTime, default=func.now())
    
    # Relationships
    transaction = relationship("Transaction")
    tax = relationship("Tax", back_populates="tax_transactions")

class BankAccount(Base):
    __tablename__ = "bank_accounts"
    
    id = Column(Integer, primary_key=True, index=True)
    account_name = Column(String(200), nullable=False)
    bank_name = Column(String(200), nullable=False)
    account_number = Column(String(50))
    routing_number = Column(String(50))
    account_type = Column(String(50))  # checking, savings, credit_card
    balance = Column(Float, default=0.0)
    currency = Column(String(3), default='USD')
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    bank_transactions = relationship("BankTransaction", back_populates="bank_account")

class BankTransaction(Base):
    __tablename__ = "bank_transactions"
    
    id = Column(Integer, primary_key=True, index=True)
    bank_account_id = Column(Integer, ForeignKey('bank_accounts.id'), nullable=False)
    transaction_date = Column(Date, nullable=False)
    description = Column(String(200), nullable=False)
    amount = Column(Float, nullable=False)
    transaction_type = Column(String(20))  # deposit, withdrawal, transfer
    reference_number = Column(String(50))
    is_reconciled = Column(Boolean, default=False)
    created_at = Column(DateTime, default=func.now())
    
    # Relationships
    bank_account = relationship("BankAccount", back_populates="bank_transactions")

class Expense(Base):
    __tablename__ = "expenses"
    
    id = Column(Integer, primary_key=True, index=True)
    expense_number = Column(String(50), unique=True, nullable=False)
    category = Column(String(100), nullable=False)
    description = Column(String(200), nullable=False)
    amount = Column(Float, nullable=False)
    expense_date = Column(Date, nullable=False)
    payment_method = Column(String(50))  # cash, check, credit_card, bank_transfer
    vendor = Column(String(200))
    receipt_url = Column(String(255))
    is_approved = Column(Boolean, default=False)
    approved_by = Column(Integer, ForeignKey('users.id'))
    approved_at = Column(DateTime)
    created_by = Column(Integer, ForeignKey('users.id'), nullable=False)
    created_at = Column(DateTime, default=func.now())
    
    # Relationships
    created_by_user = relationship("User", foreign_keys=[created_by])
    approved_by_user = relationship("User", foreign_keys=[approved_by])

class FinancialRevenue(Base):
    __tablename__ = "financial_revenues"
    
    id = Column(Integer, primary_key=True, index=True)
    revenue_number = Column(String(50), unique=True, nullable=False)
    category = Column(String(100), nullable=False)
    description = Column(String(200), nullable=False)
    amount = Column(Float, nullable=False)
    revenue_date = Column(Date, nullable=False)
    payment_method = Column(String(50))
    customer = Column(String(200))
    invoice_number = Column(String(50))
    is_received = Column(Boolean, default=False)
    received_at = Column(DateTime)
    created_by = Column(Integer, ForeignKey('users.id'), nullable=False)
    created_at = Column(DateTime, default=func.now())
    
    # Relationships
    created_by_user = relationship("User")

class FinancialPeriod(Base):
    __tablename__ = "financial_periods"
    
    id = Column(Integer, primary_key=True, index=True)
    period_name = Column(String(100), nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    is_closed = Column(Boolean, default=False)
    closed_at = Column(DateTime)
    closed_by = Column(Integer, ForeignKey('users.id'))
    created_at = Column(DateTime, default=func.now())
    
    # Relationships
    closed_by_user = relationship("User")

# Financial constants
ACCOUNT_TYPES = [
    'asset', 'liability', 'equity', 'revenue', 'expense'
]

TRANSACTION_TYPES = [
    'debit', 'credit'
]

BUDGET_TYPES = [
    'annual', 'quarterly', 'monthly', 'project'
]

REPORT_TYPES = [
    'income_statement', 'balance_sheet', 'cash_flow', 'budget_variance'
]

TAX_TYPES = [
    'sales_tax', 'income_tax', 'property_tax', 'payroll_tax'
]

PAYMENT_METHODS = [
    'cash', 'check', 'credit_card', 'bank_transfer', 'ach'
]
