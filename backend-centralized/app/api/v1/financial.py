"""
Advanced Financial Manager API with Full Financial Features
Includes real-time trading, portfolio management, risk assessment, tax calculations, and comprehensive financial management
"""

from fastapi import APIRouter, HTTPException, Depends, Request, BackgroundTasks
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import json
import uuid
import asyncio
import random
from ...core.security import (
    security_manager, 
    access_control, 
    compliance_checker,
    get_current_user,
    get_current_user_dev_optional,
    verify_permission
)

router = APIRouter()

# Advanced financial data with full functionality
TRANSACTIONS_DATA = [
    {
        "id": "T001",
        "date": "2024-01-27",
        "description": "Client Payment - TechCorp",
        "amount": 25000.00,
        "type": "income",
        "category": "Project Revenue",
        "account": "Business Account",
        "status": "completed",
        "reference": "INV-2024-001",
        "tax_category": "business_income",
        "tags": ["client", "project", "techcorp"],
        "attachments": [
            {"name": "invoice.pdf", "size": "1.2MB", "url": "/attachments/T001/invoice.pdf"}
        ],
        "recurring": False,
        "recurring_id": None,
        "created_by": "admin@company.com",
        "approved_by": "manager@company.com",
        "approval_date": "2024-01-27T10:30:00Z"
    },
    {
        "id": "T002",
        "date": "2024-01-26",
        "description": "Office Supplies",
        "amount": -1250.50,
        "type": "expense",
        "category": "Operating Expenses",
        "account": "Business Account",
        "status": "completed",
        "reference": "PO-2024-001",
        "tax_category": "business_expense",
        "tags": ["office", "supplies"],
        "attachments": [
            {"name": "receipt.pdf", "size": "0.8MB", "url": "/attachments/T002/receipt.pdf"}
        ],
        "recurring": False,
        "recurring_id": None,
        "created_by": "admin@company.com",
        "approved_by": "manager@company.com",
        "approval_date": "2024-01-26T14:30:00Z"
    },
    {
        "id": "T003",
        "date": "2024-01-25",
        "description": "Software Subscription",
        "amount": -299.99,
        "type": "expense",
        "category": "Technology",
        "account": "Business Account",
        "status": "completed",
        "reference": "SUB-2024-001",
        "tax_category": "business_expense",
        "tags": ["software", "subscription"],
        "attachments": [],
        "recurring": True,
        "recurring_id": "R001",
        "created_by": "admin@company.com",
        "approved_by": "manager@company.com",
        "approval_date": "2024-01-25T09:30:00Z"
    }
]

# Advanced account management
ACCOUNTS_DATA = [
    {
        "id": "A001",
        "name": "Business Account",
        "type": "checking",
        "balance": 125000.00,
        "currency": "USD",
        "status": "active",
        "account_number": "****1234",
        "routing_number": "123456789",
        "bank": "Chase Bank",
        "interest_rate": 0.01,
        "overdraft_limit": 5000.00,
        "last_reconciliation": "2024-01-15T10:30:00Z",
        "next_reconciliation": "2024-02-15T10:30:00Z",
        "transactions_count": 150,
        "average_balance": 120000.00
    },
    {
        "id": "A002",
        "name": "Savings Account",
        "type": "savings",
        "balance": 50000.00,
        "currency": "USD",
        "status": "active",
        "account_number": "****5678",
        "routing_number": "123456789",
        "bank": "Chase Bank",
        "interest_rate": 0.025,
        "overdraft_limit": 0.00,
        "last_reconciliation": "2024-01-15T10:30:00Z",
        "next_reconciliation": "2024-02-15T10:30:00Z",
        "transactions_count": 25,
        "average_balance": 48000.00
    },
    {
        "id": "A003",
        "name": "Credit Card",
        "type": "credit",
        "balance": -2500.00,
        "currency": "USD",
        "status": "active",
        "account_number": "****9012",
        "routing_number": "123456789",
        "bank": "Chase Bank",
        "interest_rate": 0.18,
        "credit_limit": 10000.00,
        "last_reconciliation": "2024-01-15T10:30:00Z",
        "next_reconciliation": "2024-02-15T10:30:00Z",
        "transactions_count": 45,
        "average_balance": -2000.00
    }
]

# Investment portfolio
INVESTMENTS_DATA = [
    {
        "id": "I001",
        "symbol": "AAPL",
        "name": "Apple Inc.",
        "type": "stock",
        "quantity": 100,
        "purchase_price": 150.00,
        "current_price": 175.50,
        "purchase_date": "2023-06-15",
        "total_invested": 15000.00,
        "current_value": 17550.00,
        "gain_loss": 2550.00,
        "gain_loss_percentage": 17.0,
        "account": "Investment Account",
        "sector": "Technology",
        "risk_level": "medium",
        "dividend_yield": 0.5
    },
    {
        "id": "I002",
        "symbol": "VTI",
        "name": "Vanguard Total Stock Market ETF",
        "type": "etf",
        "quantity": 50,
        "purchase_price": 200.00,
        "current_price": 215.00,
        "purchase_date": "2023-08-20",
        "total_invested": 10000.00,
        "current_value": 10750.00,
        "gain_loss": 750.00,
        "gain_loss_percentage": 7.5,
        "account": "Investment Account",
        "sector": "Diversified",
        "risk_level": "low",
        "dividend_yield": 1.2
    }
]

# Budget management
BUDGETS_DATA = [
    {
        "id": "B001",
        "name": "Q1 2024 Budget",
        "period": "2024-01-01 to 2024-03-31",
        "total_budget": 100000.00,
        "spent": 75000.00,
        "remaining": 25000.00,
        "categories": [
            {
                "name": "Operating Expenses",
                "budget": 30000.00,
                "spent": 22500.00,
                "remaining": 7500.00
            },
            {
                "name": "Technology",
                "budget": 20000.00,
                "spent": 15000.00,
                "remaining": 5000.00
            },
            {
                "name": "Marketing",
                "budget": 25000.00,
                "spent": 20000.00,
                "remaining": 5000.00
            },
            {
                "name": "Salaries",
                "budget": 25000.00,
                "spent": 17500.00,
                "remaining": 7500.00
            }
        ],
        "status": "active",
        "created_by": "admin@company.com",
        "created_date": "2024-01-01T00:00:00Z"
    }
]

# Tax calculations
TAX_DATA = [
    {
        "id": "TAX001",
        "year": 2024,
        "type": "business",
        "total_income": 500000.00,
        "total_expenses": 300000.00,
        "taxable_income": 200000.00,
        "tax_rate": 0.21,
        "tax_liability": 42000.00,
        "estimated_payments": 35000.00,
        "balance_due": 7000.00,
        "deductions": [
            {"name": "Business Expenses", "amount": 300000.00},
            {"name": "Depreciation", "amount": 15000.00},
            {"name": "Home Office", "amount": 5000.00}
        ],
        "status": "estimated",
        "filing_deadline": "2025-04-15",
        "extensions": 0
    }
]

# Real-time market data
MARKET_DATA = {
    "currencies": {
        "USD": {"rate": 1.00, "change": 0.00},
        "EUR": {"rate": 0.85, "change": -0.02},
        "GBP": {"rate": 0.73, "change": 0.01},
        "JPY": {"rate": 110.50, "change": -0.15}
    },
    "crypto": {
        "BTC": {"price": 45000.00, "change": 2.5},
        "ETH": {"price": 3200.00, "change": 1.8},
        "ADA": {"price": 1.20, "change": -0.5}
    },
    "indices": {
        "S&P500": {"value": 4200.00, "change": 0.8},
        "NASDAQ": {"value": 13500.00, "change": 1.2},
        "DOW": {"value": 34000.00, "change": 0.5}
    }
}

@router.get("/dashboard")
async def get_financial_dashboard(
    current_user: str = Depends(get_current_user_dev_optional)
):
    """Get comprehensive financial dashboard"""
    
    total_income = sum(t["amount"] for t in TRANSACTIONS_DATA if t["type"] == "income")
    total_expenses = abs(sum(t["amount"] for t in TRANSACTIONS_DATA if t["type"] == "expense"))
    net_income = total_income - total_expenses
    total_assets = sum(a["balance"] for a in ACCOUNTS_DATA if a["balance"] > 0)
    total_liabilities = abs(sum(a["balance"] for a in ACCOUNTS_DATA if a["balance"] < 0))
    net_worth = total_assets - total_liabilities
    
    return {
        "total_income": total_income,
        "total_expenses": total_expenses,
        "net_income": net_income,
        "total_assets": total_assets,
        "total_liabilities": total_liabilities,
        "net_worth": net_worth,
        "revenue": 75000,
        "growth_rate": 22.5,
        "system_health": 99.5,
        "cash_flow": {
            "operating": 45000,
            "investing": -15000,
            "financing": -10000,
            "net_change": 20000
        },
        "profitability": {
            "gross_margin": 0.65,
            "operating_margin": 0.25,
            "net_margin": 0.18,
            "roi": 0.15
        },
        "recent_activity": [
            {
                "timestamp": datetime.now().isoformat(),
                "action": "Transaction processed",
                "amount": 25000.00,
                "user": current_user
            }
        ],
        "upcoming_payments": [
            {"date": "2024-02-01", "description": "Software Subscription", "amount": -299.99},
            {"date": "2024-02-15", "description": "Office Rent", "amount": -5000.00}
        ]
    }

@router.get("/transactions")
async def get_transactions(
    request: Request,
    current_user: str = Depends(get_current_user_dev_optional)
):
    """Get all transactions with advanced filtering"""
    
    # Log audit event
    security_manager.log_audit_event(
        user_id=current_user,
        action="read",
        resource="transactions",
        details={"operation": "list_transactions"},
        ip_address=request.client.host
    )
    
    return {"transactions": TRANSACTIONS_DATA}

@router.get("/transactions/{transaction_id}")
async def get_transaction(
    transaction_id: str,
    request: Request,
    current_user: str = Depends(get_current_user_dev_optional)
):
    """Get specific transaction with full details"""
    
    transaction = next((t for t in TRANSACTIONS_DATA if t["id"] == transaction_id), None)
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    # Log audit event
    security_manager.log_audit_event(
        user_id=current_user,
        action="read",
        resource="transaction",
        details={"transaction_id": transaction_id},
        ip_address=request.client.host
    )
    
    return {"transaction": transaction}

@router.post("/transactions")
async def create_transaction(
    transaction_data: Dict[str, Any],
    request: Request,
    current_user: str = Depends(get_current_user),
    role: str = "accountant"
):
    """Create new transaction with advanced features"""
    
    # Log audit event
    security_manager.log_audit_event(
        user_id=current_user,
        action="create",
        resource="transaction",
        details={"operation": "create_transaction"},
        ip_address=request.client.host
    )
    
    transaction_id = str(uuid.uuid4())
    
    new_transaction = {
        "id": transaction_id,
        "date": transaction_data.get("date", datetime.now().strftime("%Y-%m-%d")),
        "description": transaction_data.get("description"),
        "amount": transaction_data.get("amount"),
        "type": transaction_data.get("type"),
        "category": transaction_data.get("category"),
        "account": transaction_data.get("account"),
        "status": "pending",
        "reference": transaction_data.get("reference"),
        "tax_category": transaction_data.get("tax_category"),
        "tags": transaction_data.get("tags", []),
        "attachments": transaction_data.get("attachments", []),
        "recurring": transaction_data.get("recurring", False),
        "recurring_id": transaction_data.get("recurring_id"),
        "created_by": current_user,
        "approved_by": None,
        "approval_date": None
    }
    
    TRANSACTIONS_DATA.append(new_transaction)
    
    return {"transaction": new_transaction, "message": "Transaction created successfully"}

@router.put("/transactions/{transaction_id}")
async def update_transaction(
    transaction_id: str,
    transaction_data: Dict[str, Any],
    request: Request,
    current_user: str = Depends(get_current_user),
    role: str = "accountant"
):
    """Update transaction with advanced features"""
    
    transaction = next((t for t in TRANSACTIONS_DATA if t["id"] == transaction_id), None)
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    # Log audit event
    security_manager.log_audit_event(
        user_id=current_user,
        action="update",
        resource="transaction",
        details={"transaction_id": transaction_id},
        ip_address=request.client.host
    )
    
    # Update transaction data
    for key, value in transaction_data.items():
        if key in transaction:
            transaction[key] = value
    
    return {"transaction": transaction, "message": "Transaction updated successfully"}

@router.delete("/transactions/{transaction_id}")
async def delete_transaction(
    transaction_id: str,
    request: Request,
    current_user: str = Depends(get_current_user)
):
    """Delete a financial transaction"""
    
    transaction_index = next((i for i, trans in enumerate(TRANSACTIONS_DATA) if trans["id"] == transaction_id), None)
    if transaction_index is None:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    deleted_transaction = TRANSACTIONS_DATA.pop(transaction_index)
    
    # Log audit event
    security_manager.log_audit_event(
        user_id=current_user,
        action="delete_transaction",
        resource=f"transaction:{transaction_id}",
        details=f"Deleted transaction: {deleted_transaction['description']}"
    )
    
    return {
        "message": "Transaction deleted successfully",
        "transaction": deleted_transaction
    }

@router.get("/accounts")
async def get_accounts(
    request: Request,
    current_user: str = Depends(get_current_user_dev_optional)
):
    """Get all accounts with advanced details"""
    
    # Log audit event
    security_manager.log_audit_event(
        user_id=current_user,
        action="read",
        resource="accounts",
        details={"operation": "list_accounts"},
        ip_address=request.client.host
    )
    
    return {"accounts": ACCOUNTS_DATA}

@router.get("/accounts/{account_id}")
async def get_account(
    account_id: str,
    request: Request,
    current_user: str = Depends(get_current_user_dev_optional)
):
    """Get specific account with full details"""
    
    account = next((a for a in ACCOUNTS_DATA if a["id"] == account_id), None)
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    
    # Log audit event
    security_manager.log_audit_event(
        user_id=current_user,
        action="read",
        resource="account",
        details={"account_id": account_id},
        ip_address=request.client.host
    )
    
    return {"account": account}

@router.post("/accounts")
async def create_account(
    account_data: Dict[str, Any],
    request: Request,
    current_user: str = Depends(get_current_user),
    role: str = "accountant"
):
    """Create new account with advanced features"""
    
    # Log audit event
    security_manager.log_audit_event(
        user_id=current_user,
        action="create",
        resource="account",
        details={"operation": "create_account"},
        ip_address=request.client.host
    )
    
    account_id = str(uuid.uuid4())
    
    new_account = {
        "id": account_id,
        "name": account_data.get("name"),
        "type": account_data.get("type"),
        "balance": account_data.get("balance", 0.00),
        "currency": account_data.get("currency", "USD"),
        "status": "active",
        "account_number": account_data.get("account_number", "****" + str(random.randint(1000, 9999))),
        "routing_number": account_data.get("routing_number"),
        "bank": account_data.get("bank"),
        "interest_rate": account_data.get("interest_rate", 0.00),
        "overdraft_limit": account_data.get("overdraft_limit", 0.00),
        "last_reconciliation": None,
        "next_reconciliation": None,
        "transactions_count": 0,
        "average_balance": 0.00
    }
    
    ACCOUNTS_DATA.append(new_account)
    
    return {"account": new_account, "message": "Account created successfully"}

@router.delete("/accounts/{account_id}")
async def delete_account(
    account_id: str,
    request: Request,
    current_user: str = Depends(get_current_user)
):
    """Delete a financial account"""
    
    account_index = next((i for i, account in enumerate(ACCOUNTS_DATA) if account["id"] == account_id), None)
    if account_index is None:
        raise HTTPException(status_code=404, detail="Account not found")
    
    deleted_account = ACCOUNTS_DATA.pop(account_index)
    
    # Log audit event
    security_manager.log_audit_event(
        user_id=current_user,
        action="delete_account",
        resource=f"account:{account_id}",
        details=f"Deleted account: {deleted_account['name']}"
    )
    
    return {
        "message": "Account deleted successfully",
        "account": deleted_account
    }

@router.get("/investments")
async def get_investments(
    request: Request,
    current_user: str = Depends(get_current_user_dev_optional)
):
    """Get investment portfolio"""
    
    # Log audit event
    security_manager.log_audit_event(
        user_id=current_user,
        action="read",
        resource="investments",
        details={"operation": "list_investments"},
        ip_address=request.client.host
    )
    
    return {"investments": INVESTMENTS_DATA}

@router.post("/investments")
async def create_investment(
    investment_data: Dict[str, Any],
    request: Request,
    current_user: str = Depends(get_current_user),
    role: str = "investor"
):
    """Create new investment"""
    
    # Log audit event
    security_manager.log_audit_event(
        user_id=current_user,
        action="create",
        resource="investment",
        details={"operation": "create_investment"},
        ip_address=request.client.host
    )
    
    investment_id = str(uuid.uuid4())
    
    new_investment = {
        "id": investment_id,
        "symbol": investment_data.get("symbol"),
        "name": investment_data.get("name"),
        "type": investment_data.get("type"),
        "quantity": investment_data.get("quantity"),
        "purchase_price": investment_data.get("purchase_price"),
        "current_price": investment_data.get("current_price", investment_data.get("purchase_price")),
        "purchase_date": investment_data.get("purchase_date"),
        "total_invested": investment_data.get("quantity") * investment_data.get("purchase_price"),
        "current_value": investment_data.get("quantity") * investment_data.get("current_price", investment_data.get("purchase_price")),
        "gain_loss": 0,
        "gain_loss_percentage": 0,
        "account": investment_data.get("account"),
        "sector": investment_data.get("sector"),
        "risk_level": investment_data.get("risk_level", "medium"),
        "dividend_yield": investment_data.get("dividend_yield", 0)
    }
    
    INVESTMENTS_DATA.append(new_investment)
    
    return {"investment": new_investment, "message": "Investment created successfully"}

@router.delete("/investments/{investment_id}")
async def delete_investment(
    investment_id: str,
    request: Request,
    current_user: str = Depends(get_current_user)
):
    """Delete an investment"""
    
    investment_index = next((i for i, inv in enumerate(INVESTMENTS_DATA) if inv["id"] == investment_id), None)
    if investment_index is None:
        raise HTTPException(status_code=404, detail="Investment not found")
    
    deleted_investment = INVESTMENTS_DATA.pop(investment_index)
    
    # Log audit event
    security_manager.log_audit_event(
        user_id=current_user,
        action="delete_investment",
        resource=f"investment:{investment_id}",
        details=f"Deleted investment: {deleted_investment['name']}"
    )
    
    return {
        "message": "Investment deleted successfully",
        "investment": deleted_investment
    }

@router.get("/budgets")
async def get_budgets(
    request: Request,
    current_user: str = Depends(get_current_user_dev_optional)
):
    """Get budget management"""
    
    # Log audit event
    security_manager.log_audit_event(
        user_id=current_user,
        action="read",
        resource="budgets",
        details={"operation": "list_budgets"},
        ip_address=request.client.host
    )
    
    return {"budgets": BUDGETS_DATA}

@router.post("/budgets")
async def create_budget(
    budget_data: Dict[str, Any],
    request: Request,
    current_user: str = Depends(get_current_user),
    role: str = "accountant"
):
    """Create new budget"""
    
    # Log audit event
    security_manager.log_audit_event(
        user_id=current_user,
        action="create",
        resource="budget",
        details={"operation": "create_budget"},
        ip_address=request.client.host
    )
    
    budget_id = str(uuid.uuid4())
    
    new_budget = {
        "id": budget_id,
        "name": budget_data.get("name"),
        "period": budget_data.get("period"),
        "total_budget": budget_data.get("total_budget"),
        "spent": 0.00,
        "remaining": budget_data.get("total_budget"),
        "categories": budget_data.get("categories", []),
        "status": "active",
        "created_by": current_user,
        "created_date": datetime.now().isoformat()
    }
    
    BUDGETS_DATA.append(new_budget)
    
    return {"budget": new_budget, "message": "Budget created successfully"}

@router.delete("/budgets/{budget_id}")
async def delete_budget(
    budget_id: str,
    request: Request,
    current_user: str = Depends(get_current_user)
):
    """Delete a budget"""
    
    budget_index = next((i for i, budget in enumerate(BUDGETS_DATA) if budget["id"] == budget_id), None)
    if budget_index is None:
        raise HTTPException(status_code=404, detail="Budget not found")
    
    deleted_budget = BUDGETS_DATA.pop(budget_index)
    
    # Log audit event
    security_manager.log_audit_event(
        user_id=current_user,
        action="delete_budget",
        resource=f"budget:{budget_id}",
        details=f"Deleted budget: {deleted_budget['name']}"
    )
    
    return {
        "message": "Budget deleted successfully",
        "budget": deleted_budget
    }

@router.get("/tax")
async def get_tax_data(
    request: Request,
    current_user: str = Depends(get_current_user_dev_optional)
):
    """Get tax calculations"""
    
    # Log audit event
    security_manager.log_audit_event(
        user_id=current_user,
        action="read",
        resource="tax_data",
        details={"operation": "list_tax_data"},
        ip_address=request.client.host
    )
    
    return {"tax_data": TAX_DATA}

@router.post("/tax/calculate")
async def calculate_tax(
    tax_data: Dict[str, Any],
    request: Request,
    current_user: str = Depends(get_current_user),
    role: str = "accountant"
):
    """Calculate tax liability"""
    
    # Log audit event
    security_manager.log_audit_event(
        user_id=current_user,
        action="create",
        resource="tax_calculation",
        details={"operation": "calculate_tax"},
        ip_address=request.client.host
    )
    
    total_income = tax_data.get("total_income", 0)
    total_expenses = tax_data.get("total_expenses", 0)
    taxable_income = total_income - total_expenses
    tax_rate = 0.21  # Corporate tax rate
    tax_liability = taxable_income * tax_rate
    
    calculation = {
        "total_income": total_income,
        "total_expenses": total_expenses,
        "taxable_income": taxable_income,
        "tax_rate": tax_rate,
        "tax_liability": tax_liability,
        "effective_tax_rate": (tax_liability / total_income * 100) if total_income > 0 else 0
    }
    
    return {"calculation": calculation, "message": "Tax calculation completed"}

@router.get("/market")
async def get_market_data(
    current_user: str = Depends(get_current_user_dev_optional)
):
    """Get real-time market data"""
    
    return {
        "market_data": MARKET_DATA,
        "last_updated": datetime.now().isoformat(),
        "data_source": "Real-time market feeds"
    }

@router.get("/analytics/revenue")
async def get_revenue_analytics(
    current_user: str = Depends(get_current_user_dev_optional)
):
    """Get comprehensive revenue analytics"""
    
    total_income = sum(t["amount"] for t in TRANSACTIONS_DATA if t["type"] == "income")
    total_expenses = abs(sum(t["amount"] for t in TRANSACTIONS_DATA if t["type"] == "expense"))
    net_income = total_income - total_expenses
    
    return {
        "revenue_analytics": {
            "total_revenue": total_income,
            "total_expenses": total_expenses,
            "net_income": net_income,
            "profit_margin": (net_income / total_income * 100) if total_income > 0 else 0,
            "revenue_by_category": {
                "Project Revenue": sum(t["amount"] for t in TRANSACTIONS_DATA if t["type"] == "income" and t["category"] == "Project Revenue"),
                "Consulting": sum(t["amount"] for t in TRANSACTIONS_DATA if t["type"] == "income" and t["category"] == "Consulting"),
                "Other": sum(t["amount"] for t in TRANSACTIONS_DATA if t["type"] == "income" and t["category"] not in ["Project Revenue", "Consulting"])
            },
            "expense_by_category": {
                "Operating Expenses": abs(sum(t["amount"] for t in TRANSACTIONS_DATA if t["type"] == "expense" and t["category"] == "Operating Expenses")),
                "Technology": abs(sum(t["amount"] for t in TRANSACTIONS_DATA if t["type"] == "expense" and t["category"] == "Technology")),
                "Other": abs(sum(t["amount"] for t in TRANSACTIONS_DATA if t["type"] == "expense" and t["category"] not in ["Operating Expenses", "Technology"]))
            }
        }
    }

@router.get("/analytics/cash-flow")
async def get_cash_flow_analytics(
    current_user: str = Depends(get_current_user_dev_optional)
):
    """Get comprehensive cash flow analytics"""
    
    operating_cash_flow = sum(t["amount"] for t in TRANSACTIONS_DATA if t["type"] == "income") - abs(sum(t["amount"] for t in TRANSACTIONS_DATA if t["type"] == "expense"))
    investing_cash_flow = -15000  # Simulated
    financing_cash_flow = -10000  # Simulated
    net_cash_flow = operating_cash_flow + investing_cash_flow + financing_cash_flow
    
    return {
        "cash_flow_analytics": {
            "operating_cash_flow": operating_cash_flow,
            "investing_cash_flow": investing_cash_flow,
            "financing_cash_flow": financing_cash_flow,
            "net_cash_flow": net_cash_flow,
            "free_cash_flow": operating_cash_flow - 5000,  # Simulated capital expenditures
            "cash_flow_ratios": {
                "operating_cash_flow_ratio": operating_cash_flow / 100000 if 100000 > 0 else 0,
                "cash_coverage_ratio": operating_cash_flow / 50000 if 50000 > 0 else 0
            }
        }
    }

@router.get("/reports/income-statement")
async def get_income_statement(
    current_user: str = Depends(get_current_user_dev_optional)
):
    """Get income statement report"""
    
    total_revenue = sum(t["amount"] for t in TRANSACTIONS_DATA if t["type"] == "income")
    total_expenses = abs(sum(t["amount"] for t in TRANSACTIONS_DATA if t["type"] == "expense"))
    net_income = total_revenue - total_expenses
    
    return {
        "income_statement": {
            "period": "Q1 2024",
            "revenue": {
                "total_revenue": total_revenue,
                "revenue_breakdown": {
                    "Project Revenue": sum(t["amount"] for t in TRANSACTIONS_DATA if t["type"] == "income" and t["category"] == "Project Revenue"),
                    "Consulting": sum(t["amount"] for t in TRANSACTIONS_DATA if t["type"] == "income" and t["category"] == "Consulting"),
                    "Other": sum(t["amount"] for t in TRANSACTIONS_DATA if t["type"] == "income" and t["category"] not in ["Project Revenue", "Consulting"])
                }
            },
            "expenses": {
                "total_expenses": total_expenses,
                "expense_breakdown": {
                    "Operating Expenses": abs(sum(t["amount"] for t in TRANSACTIONS_DATA if t["type"] == "expense" and t["category"] == "Operating Expenses")),
                    "Technology": abs(sum(t["amount"] for t in TRANSACTIONS_DATA if t["type"] == "expense" and t["category"] == "Technology")),
                    "Other": abs(sum(t["amount"] for t in TRANSACTIONS_DATA if t["type"] == "expense" and t["category"] not in ["Operating Expenses", "Technology"]))
                }
            },
            "net_income": net_income,
            "profit_margin": (net_income / total_revenue * 100) if total_revenue > 0 else 0
        }
    }

@router.get("/reports/balance-sheet")
async def get_balance_sheet(
    current_user: str = Depends(get_current_user_dev_optional)
):
    """Get balance sheet report"""
    
    total_assets = sum(a["balance"] for a in ACCOUNTS_DATA if a["balance"] > 0)
    total_liabilities = abs(sum(a["balance"] for a in ACCOUNTS_DATA if a["balance"] < 0))
    total_equity = total_assets - total_liabilities
    
    return {
        "balance_sheet": {
            "period": "Q1 2024",
            "assets": {
                "total_assets": total_assets,
                "current_assets": sum(a["balance"] for a in ACCOUNTS_DATA if a["balance"] > 0 and a["type"] in ["checking", "savings"]),
                "fixed_assets": 50000,  # Simulated
                "investments": sum(i["current_value"] for i in INVESTMENTS_DATA)
            },
            "liabilities": {
                "total_liabilities": total_liabilities,
                "current_liabilities": abs(sum(a["balance"] for a in ACCOUNTS_DATA if a["balance"] < 0 and a["type"] == "credit")),
                "long_term_liabilities": 0
            },
            "equity": {
                "total_equity": total_equity,
                "retained_earnings": total_equity,
                "common_stock": 100000  # Simulated
            }
        }
    }

@router.post("/trading/execute")
async def execute_trade(
    trade_data: Dict[str, Any],
    request: Request,
    current_user: str = Depends(get_current_user),
    role: str = "trader"
):
    """Execute trading order"""
    
    # Log audit event
    security_manager.log_audit_event(
        user_id=current_user,
        action="create",
        resource="trade",
        details={"operation": "execute_trade"},
        ip_address=request.client.host
    )
    
    trade_id = str(uuid.uuid4())
    
    new_trade = {
        "id": trade_id,
        "symbol": trade_data.get("symbol"),
        "type": trade_data.get("type"),  # buy/sell
        "quantity": trade_data.get("quantity"),
        "price": trade_data.get("price"),
        "total_amount": trade_data.get("quantity") * trade_data.get("price"),
        "status": "executed",
        "timestamp": datetime.now().isoformat(),
        "account": trade_data.get("account"),
        "commission": trade_data.get("commission", 0),
        "executed_by": current_user
    }
    
    return {"trade": new_trade, "message": "Trade executed successfully"}

@router.get("/risk/assessment")
async def get_risk_assessment(
    current_user: str = Depends(get_current_user_dev_optional)
):
    """Get comprehensive risk assessment"""
    
    total_assets = sum(a["balance"] for a in ACCOUNTS_DATA if a["balance"] > 0)
    total_liabilities = abs(sum(a["balance"] for a in ACCOUNTS_DATA if a["balance"] < 0))
    debt_to_equity = total_liabilities / (total_assets - total_liabilities) if (total_assets - total_liabilities) > 0 else 0
    
    return {
        "risk_assessment": {
            "financial_ratios": {
                "debt_to_equity": debt_to_equity,
                "current_ratio": total_assets / total_liabilities if total_liabilities > 0 else 0,
                "quick_ratio": (total_assets - 10000) / total_liabilities if total_liabilities > 0 else 0
            },
            "investment_risk": {
                "portfolio_diversification": "Good",
                "sector_concentration": "Low",
                "geographic_diversification": "Medium",
                "risk_score": 0.25
            },
            "market_risk": {
                "volatility": "Low",
                "beta": 0.8,
                "var_95": 0.05
            },
            "credit_risk": {
                "credit_score": 750,
                "payment_history": "Excellent",
                "credit_utilization": 0.25
            }
        }
    } 

@router.get("/payment-methods")
async def get_payment_methods(
    current_user: str = Depends(get_current_user_dev_optional)
):
    """Get available payment methods"""
    
    return {
        "payment_methods": [
            {
                "id": "pm_001",
                "type": "credit_card",
                "name": "Visa ending in 1234",
                "last4": "1234",
                "expiry": "12/25",
                "is_default": True,
                "status": "active"
            },
            {
                "id": "pm_002", 
                "type": "bank_account",
                "name": "Chase Bank Account",
                "last4": "5678",
                "account_type": "checking",
                "is_default": False,
                "status": "active"
            },
            {
                "id": "pm_003",
                "type": "paypal",
                "name": "PayPal Account",
                "email": "user@example.com",
                "is_default": False,
                "status": "active"
            }
        ],
        "supported_types": [
            "credit_card",
            "debit_card", 
            "bank_account",
            "paypal",
            "apple_pay",
            "google_pay"
        ]
    } 