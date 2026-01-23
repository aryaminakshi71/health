"""
Support Desk API
Includes ticket management, customer support, and support analytics
"""

from fastapi import APIRouter, HTTPException, Depends, Request
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import json
from ...core.security import (
    security_manager, 
    access_control, 
    compliance_checker,
    get_current_user,
    get_current_user_dev_optional,
    verify_permission
)

router = APIRouter()

# Mock support data
TICKETS_DATA = [
    {
        "id": "TKT001",
        "ticket_number": "SD-2024-001",
        "title": "Patient Portal Login Issue",
        "description": "Patient unable to access their medical records through the portal. Getting authentication error.",
        "priority": "high",
        "status": "open",
        "category": "Technical Support",
        "requester": "Dr. Sarah Johnson",
        "requester_email": "sarah.johnson@healthcare.com",
        "assigned_to": "Mike Wilson",
        "created_at": "2024-01-27T10:30:00",
        "updated_at": "2024-01-27T10:30:00",
        "hipaa_compliant": True,
        "patient_related": True,
        "attachments": ["screenshot.png", "error_log.txt"],
        "tags": ["patient-portal", "authentication", "hipaa"]
    },
    {
        "id": "TKT002",
        "ticket_number": "SD-2024-002",
        "title": "Billing System Integration Problem",
        "description": "Insurance claims not being processed correctly through the new billing system.",
        "priority": "medium",
        "status": "in_progress",
        "category": "Billing Support",
        "requester": "Lisa Rodriguez",
        "requester_email": "lisa.rodriguez@healthcare.com",
        "assigned_to": "Sarah Johnson",
        "created_at": "2024-01-26T14:15:00",
        "updated_at": "2024-01-27T09:45:00",
        "hipaa_compliant": True,
        "patient_related": True,
        "attachments": ["billing_report.pdf"],
        "tags": ["billing", "insurance", "integration"]
    },
    {
        "id": "TKT003",
        "ticket_number": "SD-2024-003",
        "title": "EHR System Feature Request",
        "description": "Request for new dashboard feature to display patient vitals in real-time.",
        "priority": "low",
        "status": "resolved",
        "category": "Feature Request",
        "requester": "Dr. Robert Chen",
        "requester_email": "robert.chen@healthcare.com",
        "assigned_to": "Product Team",
        "created_at": "2024-01-25T11:20:00",
        "updated_at": "2024-01-26T16:30:00",
        "resolved_at": "2024-01-26T16:30:00",
        "hipaa_compliant": True,
        "patient_related": True,
        "attachments": [],
        "tags": ["ehr", "feature-request", "dashboard"]
    }
]

AGENTS_DATA = [
    {
        "id": "AGT001",
        "name": "Sarah Johnson",
        "email": "sarah.johnson@support.com",
        "department": "Technical Support",
        "tickets_resolved": 45,
        "average_response_time": 2.5,
        "status": "online",
        "hipaa_certified": True
    },
    {
        "id": "AGT002",
        "name": "Mike Wilson",
        "email": "mike.wilson@support.com",
        "department": "Billing Support",
        "tickets_resolved": 32,
        "average_response_time": 3.2,
        "status": "online",
        "hipaa_certified": True
    },
    {
        "id": "AGT003",
        "name": "Lisa Rodriguez",
        "email": "lisa.rodriguez@support.com",
        "department": "Product Support",
        "tickets_resolved": 28,
        "average_response_time": 4.1,
        "status": "busy",
        "hipaa_certified": False
    }
]

@router.get("/dashboard")
async def get_support_dashboard(
    current_user: str = Depends(get_current_user_dev_optional)
):
    """Get Support Desk dashboard with support metrics"""
    
    total_tickets = len(TICKETS_DATA)
    open_tickets = len([t for t in TICKETS_DATA if t["status"] == "open"])
    resolved_tickets = len([t for t in TICKETS_DATA if t["status"] == "resolved"])
    
    return {
        "tickets": total_tickets,
        "resolved": resolved_tickets,
        "revenue": 55000,
        "growth": 18.5,
        "recent_tickets": [
            {"id": 1, "title": "Login Issue", "priority": "high", "status": "open"},
            {"id": 2, "title": "Payment Problem", "priority": "medium", "status": "in_progress"},
            {"id": 3, "title": "Feature Request", "priority": "low", "status": "resolved"}
        ],
        "recent_activity": [
            {
                "timestamp": datetime.now().isoformat(),
                "action": "Ticket created",
                "user": current_user,
                "details": "New support ticket: Login Issue"
            }
        ]
    }

@router.get("/tickets")
async def get_tickets(
    request: Request,
    current_user: str = Depends(get_current_user_dev_optional)
):
    """Get all tickets with security logging"""
    
    # Log audit event
    security_manager.log_audit_event(
        user_id=current_user,
        action="read",
        resource="tickets",
        details={"operation": "list_tickets"},
        ip_address=request.client.host
    )
    
    return {"tickets": TICKETS_DATA}

@router.get("/tickets/{ticket_id}")
async def get_ticket(
    ticket_id: str,
    request: Request,
    current_user: str = Depends(get_current_user_dev_optional)
):
    """Get specific ticket details"""
    
    ticket = next((t for t in TICKETS_DATA if t["id"] == ticket_id), None)
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    # Log audit event
    security_manager.log_audit_event(
        user_id=current_user,
        action="read",
        resource=f"ticket/{ticket_id}",
        details={"ticket_id": ticket_id},
        ip_address=request.client.host
    )
    
    return {"ticket": ticket}

@router.delete("/tickets/{ticket_id}")
async def delete_ticket(
    ticket_id: str,
    request: Request,
    current_user: str = Depends(get_current_user)
):
    """Delete a support ticket"""
    
    ticket_index = next((i for i, ticket in enumerate(TICKETS_DATA) if ticket["id"] == ticket_id), None)
    if ticket_index is None:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    deleted_ticket = TICKETS_DATA.pop(ticket_index)
    
    # Log audit event
    security_manager.log_audit_event(
        user_id=current_user,
        action="delete",
        resource=f"ticket/{ticket_id}",
        details={"operation": "delete_ticket"},
        ip_address=request.client.host
    )
    
    return {
        "message": "Ticket deleted successfully",
        "ticket": deleted_ticket
    }

@router.get("/agents")
async def get_agents(
    request: Request,
    current_user: str = Depends(get_current_user_dev_optional)
):
    """Get all support agents"""
    
    # Log audit event
    security_manager.log_audit_event(
        user_id=current_user,
        action="read",
        resource="agents",
        details={"operation": "list_agents"},
        ip_address=request.client.host
    )
    
    return {"agents": AGENTS_DATA}

@router.get("/agents/{agent_id}")
async def get_agent(
    agent_id: str,
    request: Request,
    current_user: str = Depends(get_current_user_dev_optional)
):
    """Get specific agent details"""
    
    agent = next((a for a in AGENTS_DATA if a["id"] == agent_id), None)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    # Log audit event
    security_manager.log_audit_event(
        user_id=current_user,
        action="read",
        resource=f"agent/{agent_id}",
        details={"agent_id": agent_id},
        ip_address=request.client.host
    )
    
    return {"agent": agent}

@router.get("/analytics/performance")
async def get_performance_analytics(
    current_user: str = Depends(get_current_user_dev_optional)
):
    """Get support performance analytics"""
    
    return {
        "total_tickets": len(TICKETS_DATA),
        "resolved_tickets": len([t for t in TICKETS_DATA if t["status"] == "resolved"]),
        "average_resolution_time": 4.2,
        "customer_satisfaction": 4.6,
        "tickets_by_priority": {
            "high": len([t for t in TICKETS_DATA if t["priority"] == "high"]),
            "medium": len([t for t in TICKETS_DATA if t["priority"] == "medium"]),
            "low": len([t for t in TICKETS_DATA if t["priority"] == "low"])
        },
        "tickets_by_category": {
            "Technical": len([t for t in TICKETS_DATA if t["category"] == "Technical"]),
            "Billing": len([t for t in TICKETS_DATA if t["category"] == "Billing"]),
            "Feature": len([t for t in TICKETS_DATA if t["category"] == "Feature"])
        },
        "monthly_tickets": [
            {"month": "Jan", "tickets": 45},
            {"month": "Feb", "tickets": 38},
            {"month": "Mar", "tickets": 42}
        ]
    }

@router.get("/analytics/agents")
async def get_agent_analytics(
    current_user: str = Depends(get_current_user_dev_optional)
):
    """Get agent performance analytics"""
    
    return {
        "total_agents": len(AGENTS_DATA),
        "online_agents": len([a for a in AGENTS_DATA if a["status"] == "online"]),
        "average_tickets_resolved": sum(a["tickets_resolved"] for a in AGENTS_DATA) / len(AGENTS_DATA),
        "average_response_time": sum(a["average_response_time"] for a in AGENTS_DATA) / len(AGENTS_DATA),
        "agent_performance": [
            {"agent": "Sarah Johnson", "tickets_resolved": 45, "response_time": 2.5},
            {"agent": "Mike Wilson", "tickets_resolved": 32, "response_time": 3.2},
            {"agent": "Lisa Rodriguez", "tickets_resolved": 28, "response_time": 4.1}
        ]
    }

@router.post("/tickets")
async def create_ticket(
    ticket_data: dict,
    request: Request,
    current_user: str = Depends(get_current_user_dev_optional)
):
    """Create a new support ticket"""
    
    # Validate required fields
    if not ticket_data.get("title"):
        raise HTTPException(status_code=422, detail="Ticket title is required")
    if not ticket_data.get("description"):
        raise HTTPException(status_code=422, detail="Ticket description is required")
    if not ticket_data.get("requester"):
        raise HTTPException(status_code=422, detail="Requester name is required")
    if not ticket_data.get("requester_email"):
        raise HTTPException(status_code=422, detail="Requester email is required")
    
    # Log audit event
    security_manager.log_audit_event(
        user_id=current_user,
        action="create",
        resource="ticket",
        details={"operation": "create_ticket", "ticket_data": ticket_data},
        ip_address=request.client.host
    )
    
    new_ticket = {
        "id": f"TKT{str(len(TICKETS_DATA) + 1).zfill(3)}",
        "ticket_number": f"SD-2024-{str(len(TICKETS_DATA) + 1).zfill(3)}",
        "title": ticket_data.get("title"),
        "description": ticket_data.get("description"),
        "priority": ticket_data.get("priority", "medium"),
        "status": "open",
        "category": ticket_data.get("category", "Technical Support"),
        "requester": ticket_data.get("requester"),
        "requester_email": ticket_data.get("requester_email"),
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat(),
        "hipaa_compliant": ticket_data.get("hipaa_compliant", True),
        "patient_related": ticket_data.get("patient_related", False),
        "attachments": ticket_data.get("attachments", []),
        "tags": ticket_data.get("tags", [])
    }
    
    TICKETS_DATA.append(new_ticket)
    
    return {"message": "Ticket created successfully", "ticket": new_ticket}

@router.put("/tickets/{ticket_id}")
async def update_ticket(
    ticket_id: str,
    ticket_data: dict,
    request: Request,
    current_user: str = Depends(get_current_user_dev_optional)
):
    """Update a support ticket"""
    
    ticket = next((t for t in TICKETS_DATA if t["id"] == ticket_id), None)
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    # Log audit event
    security_manager.log_audit_event(
        user_id=current_user,
        action="update",
        resource=f"ticket/{ticket_id}",
        details={"operation": "update_ticket", "ticket_data": ticket_data},
        ip_address=request.client.host
    )
    
    # Update ticket fields
    for key, value in ticket_data.items():
        if key in ticket:
            ticket[key] = value
    
    ticket["updated_at"] = datetime.now().isoformat()
    
    return {"message": "Ticket updated successfully", "ticket": ticket}

@router.post("/tickets/{ticket_id}/assign")
async def assign_ticket(
    ticket_id: str,
    assignee: str,
    request: Request,
    current_user: str = Depends(get_current_user_dev_optional)
):
    """Assign a ticket to an agent"""
    
    ticket = next((t for t in TICKETS_DATA if t["id"] == ticket_id), None)
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    # Log audit event
    security_manager.log_audit_event(
        user_id=current_user,
        action="update",
        resource=f"ticket/{ticket_id}",
        details={"operation": "assign_ticket", "assignee": assignee},
        ip_address=request.client.host
    )
    
    ticket["assigned_to"] = assignee
    ticket["status"] = "in_progress"
    ticket["updated_at"] = datetime.now().isoformat()
    
    return {"message": "Ticket assigned successfully", "ticket": ticket}

@router.post("/tickets/{ticket_id}/resolve")
async def resolve_ticket(
    ticket_id: str,
    request: Request,
    current_user: str = Depends(get_current_user_dev_optional)
):
    """Resolve a ticket"""
    
    ticket = next((t for t in TICKETS_DATA if t["id"] == ticket_id), None)
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    # Log audit event
    security_manager.log_audit_event(
        user_id=current_user,
        action="update",
        resource=f"ticket/{ticket_id}",
        details={"operation": "resolve_ticket"},
        ip_address=request.client.host
    )
    
    ticket["status"] = "resolved"
    ticket["resolved_at"] = datetime.now().isoformat()
    ticket["updated_at"] = datetime.now().isoformat()
    
    return {"message": "Ticket resolved successfully", "ticket": ticket}

@router.get("/analytics/hipaa")
async def get_hipaa_analytics(
    current_user: str = Depends(get_current_user_dev_optional)
):
    """Get HIPAA compliance analytics"""
    
    total_tickets = len(TICKETS_DATA)
    hipaa_compliant_tickets = len([t for t in TICKETS_DATA if t["hipaa_compliant"]])
    patient_related_tickets = len([t for t in TICKETS_DATA if t["patient_related"]])
    hipaa_certified_agents = len([a for a in AGENTS_DATA if a["hipaa_certified"]])
    
    return {
        "total_tickets": total_tickets,
        "hipaa_compliant_tickets": hipaa_compliant_tickets,
        "hipaa_compliance_rate": (hipaa_compliant_tickets / total_tickets * 100) if total_tickets > 0 else 0,
        "patient_related_tickets": patient_related_tickets,
        "hipaa_certified_agents": hipaa_certified_agents,
        "total_agents": len(AGENTS_DATA),
        "hipaa_certification_rate": (hipaa_certified_agents / len(AGENTS_DATA) * 100) if AGENTS_DATA else 0,
        "compliance_metrics": {
            "data_encryption": 100.0,
            "access_controls": 98.5,
            "audit_logging": 100.0,
            "breach_notification": 100.0
        }
    }

@router.get("/tickets/hipaa/audit")
async def get_hipaa_audit_log(
    request: Request,
    current_user: str = Depends(get_current_user_dev_optional)
):
    """Get HIPAA audit log for tickets"""
    
    # Log audit event
    security_manager.log_audit_event(
        user_id=current_user,
        action="read",
        resource="hipaa_audit_log",
        details={"operation": "get_hipaa_audit_log"},
        ip_address=request.client.host
    )
    
    hipaa_tickets = [t for t in TICKETS_DATA if t["hipaa_compliant"] or t["patient_related"]]
    
    audit_log = []
    for ticket in hipaa_tickets:
        audit_log.append({
            "ticket_id": ticket["id"],
            "ticket_number": ticket["ticket_number"],
            "action": "ticket_accessed",
            "user": current_user,
            "timestamp": ticket["updated_at"],
            "hipaa_compliant": ticket["hipaa_compliant"],
            "patient_related": ticket["patient_related"],
            "data_accessed": ["patient_info", "medical_records"] if ticket["patient_related"] else []
        })
    
    return {"audit_log": audit_log} 