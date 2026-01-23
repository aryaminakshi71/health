"""
Compliance Guardian API
Includes regulatory compliance, audit management, and compliance analytics
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
from ...models.user import AuditLog as DBAuditLog
from ...core.database import get_db
from sqlalchemy.orm import Session

router = APIRouter()

# Mock compliance data
POLICIES_DATA = [
    {
        "id": "POL001",
        "name": "Data Protection Policy",
        "category": "GDPR",
        "status": "active",
        "last_review": "2024-01-15",
        "next_review": "2024-04-15",
        "compliance_score": 95
    },
    {
        "id": "POL002",
        "name": "HIPAA Compliance Policy",
        "category": "HIPAA",
        "status": "active",
        "last_review": "2024-01-20",
        "next_review": "2024-04-20",
        "compliance_score": 98
    },
    {
        "id": "POL003",
        "name": "SOX Compliance Policy",
        "category": "SOX",
        "status": "active",
        "last_review": "2024-01-10",
        "next_review": "2024-04-10",
        "compliance_score": 92
    }
]

AUDITS_DATA = [
    {
        "id": "AUD001",
        "type": "internal",
        "scope": "Data Protection",
        "start_date": "2024-01-15",
        "end_date": "2024-01-20",
        "status": "completed",
        "score": 95,
        "findings": 2
    },
    {
        "id": "AUD002",
        "type": "external",
        "scope": "HIPAA Compliance",
        "start_date": "2024-01-25",
        "end_date": "2024-01-30",
        "status": "in_progress",
        "score": 98,
        "findings": 1
    },
    {
        "id": "AUD003",
        "type": "internal",
        "scope": "SOX Compliance",
        "start_date": "2024-02-01",
        "end_date": "2024-02-05",
        "status": "scheduled",
        "score": 0,
        "findings": 0
    }
]

VIOLATIONS_DATA = [
    {
        "id": "VIOL001",
        "type": "data_breach",
        "severity": "high",
        "description": "Unauthorized access to patient data",
        "date": "2024-01-15",
        "status": "resolved",
        "action_taken": "Access revoked, investigation completed"
    },
    {
        "id": "VIOL002",
        "type": "policy_violation",
        "severity": "medium",
        "description": "Employee accessed data without proper authorization",
        "date": "2024-01-20",
        "status": "investigating",
        "action_taken": "Employee suspended pending investigation"
    }
]

@router.get("/dashboard")
async def get_compliance_dashboard(
    current_user: str = Depends(get_current_user_dev_optional)
):
    """Get Compliance Guardian dashboard with compliance metrics"""
    
    total_policies = len(POLICIES_DATA)
    total_audits = len(AUDITS_DATA)
    total_violations = len(VIOLATIONS_DATA)
    active_violations = len([v for v in VIOLATIONS_DATA if v["status"] != "resolved"])
    
    return {
        "policies": total_policies,
        "violations": total_violations,
        "revenue": 65000,
        "growth": 25.5,
        "compliance_status": {
            "hipaa": "compliant",
            "gdpr": "compliant",
            "sox": "compliant",
            "pci": "compliant"
        },
        "recent_activity": [
            {
                "timestamp": datetime.now().isoformat(),
                "action": "Audit completed",
                "user": current_user,
                "details": "HIPAA compliance audit completed with 98% score"
            }
        ]
    }

@router.get("/policies")
async def get_policies(
    request: Request,
    current_user: str = Depends(get_current_user_dev_optional)
):
    """Get all policies with security logging"""
    
    # Log audit event
    security_manager.log_audit_event(
        user_id=current_user,
        action="read",
        resource="policies",
        details={"operation": "list_policies"},
        ip_address=request.client.host
    )
    
    return {"policies": POLICIES_DATA}

@router.get("/policies/{policy_id}")
async def get_policy(
    policy_id: str,
    request: Request,
    current_user: str = Depends(get_current_user_dev_optional)
):
    """Get specific policy details"""
    
    policy = next((p for p in POLICIES_DATA if p["id"] == policy_id), None)
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")
    
    # Log audit event
    security_manager.log_audit_event(
        user_id=current_user,
        action="read",
        resource=f"policy/{policy_id}",
        details={"policy_id": policy_id},
        ip_address=request.client.host
    )
    
    return {"policy": policy}

@router.get("/audits")
async def get_audits(
    request: Request,
    current_user: str = Depends(get_current_user_dev_optional)
):
    """Get all audits"""
    
    # Log audit event
    security_manager.log_audit_event(
        user_id=current_user,
        action="read",
        resource="audits",
        details={"operation": "list_audits"},
        ip_address=request.client.host
    )
    
    return {"audits": AUDITS_DATA}

@router.get("/audits/{audit_id}")
async def get_audit(
    audit_id: str,
    request: Request,
    current_user: str = Depends(get_current_user_dev_optional)
):
    """Get specific audit details"""
    
    audit = next((a for a in AUDITS_DATA if a["id"] == audit_id), None)
    if not audit:
        raise HTTPException(status_code=404, detail="Audit not found")
    
    # Log audit event
    security_manager.log_audit_event(
        user_id=current_user,
        action="read",
        resource=f"audit/{audit_id}",
        details={"audit_id": audit_id},
        ip_address=request.client.host
    )
    
    return {"audit": audit}

@router.get("/violations")
async def get_violations(
    request: Request,
    current_user: str = Depends(get_current_user_dev_optional)
):
    """Get all violations"""
    
    # Log audit event
    security_manager.log_audit_event(
        user_id=current_user,
        action="read",
        resource="violations",
        details={"operation": "list_violations"},
        ip_address=request.client.host
    )
    
    return {"violations": VIOLATIONS_DATA}

@router.get("/violations/{violation_id}")
async def get_violation(
    violation_id: str,
    request: Request,
    current_user: str = Depends(get_current_user_dev_optional)
):
    """Get specific violation details"""
    
    violation = next((v for v in VIOLATIONS_DATA if v["id"] == violation_id), None)
    if not violation:
        raise HTTPException(status_code=404, detail="Violation not found")
    
    # Log audit event
    security_manager.log_audit_event(
        user_id=current_user,
        action="read",
        resource=f"violation/{violation_id}",
        details={"violation_id": violation_id},
        ip_address=request.client.host
    )
    
    return {"violation": violation}

# System audit log endpoint for viewer
@router.get("/audit-events")
async def get_audit_events(
    limit: int = 200,
    current_user: str = Depends(get_current_user_dev_optional),
    db: Session = Depends(get_db)
):
    try:
        # Prefer DB audit logs if model/table exists
        try:
            rows = db.query(DBAuditLog).order_by(DBAuditLog.timestamp.desc()).limit(limit).all()  # type: ignore
            data = [
                {
                    "id": getattr(r, 'id', None),
                    "timestamp": getattr(r, 'timestamp', None).isoformat() if getattr(r, 'timestamp', None) else None,
                    "user_id": getattr(r, 'user_id', None),
                    "action": getattr(r, 'action', None),
                    "resource": getattr(r, 'resource', None),
                    "details": getattr(r, 'details', None),
                    "ip_address": getattr(r, 'ip_address', None),
                }
                for r in rows
            ]
            return {"events": data}
        except Exception:
            pass
        # Fallback to in-memory events from security_manager
        events = list(getattr(security_manager, 'audit_events', []))
        return {"events": events[-limit:]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get audit events: {str(e)}")

@router.get("/analytics/compliance")
async def get_compliance_analytics(
    current_user: str = Depends(get_current_user_dev_optional)
):
    """Get compliance analytics"""
    
    return {
        "total_policies": len(POLICIES_DATA),
        "total_audits": len(AUDITS_DATA),
        "total_violations": len(VIOLATIONS_DATA),
        "average_compliance_score": sum(p["compliance_score"] for p in POLICIES_DATA) / len(POLICIES_DATA),
        "compliance_by_category": {
            "GDPR": len([p for p in POLICIES_DATA if p["category"] == "GDPR"]),
            "HIPAA": len([p for p in POLICIES_DATA if p["category"] == "HIPAA"]),
            "SOX": len([p for p in POLICIES_DATA if p["category"] == "SOX"])
        },
        "monthly_violations": [
            {"month": "Jan", "violations": 2},
            {"month": "Feb", "violations": 1},
            {"month": "Mar", "violations": 0}
        ]
    }

@router.get("/analytics/audits")
async def get_audit_analytics(
    current_user: str = Depends(get_current_user_dev_optional)
):
    """Get audit analytics"""
    
    return {
        "total_audits": len(AUDITS_DATA),
        "completed_audits": len([a for a in AUDITS_DATA if a["status"] == "completed"]),
        "average_audit_score": sum(a["score"] for a in AUDITS_DATA if a["score"] > 0) / len([a for a in AUDITS_DATA if a["score"] > 0]),
        "audit_types": {
            "internal": len([a for a in AUDITS_DATA if a["type"] == "internal"]),
            "external": len([a for a in AUDITS_DATA if a["type"] == "external"])
        },
        "monthly_audits": [
            {"month": "Jan", "audits": 2},
            {"month": "Feb", "audits": 1},
            {"month": "Mar", "audits": 3}
        ]
    } 

# Add these missing CRUD operations to the compliance.py file

import uuid

# ==================== POLICIES CRUD OPERATIONS ====================

@router.post("/policies")
async def create_policy(
    policy_data: Dict[str, Any],
    request: Request,
    current_user: str = Depends(get_current_user)
):
    """Create new policy"""
    
    # Validate required fields
    required_fields = ["name", "category"]
    for field in required_fields:
        if field not in policy_data:
            raise HTTPException(status_code=400, detail=f"Missing required field: {field}")
    
    # Generate unique policy ID
    policy_id = f"POL{str(uuid.uuid4())[:8].upper()}"
    
    # Create new policy
    new_policy = {
        "id": policy_id,
        "name": policy_data["name"],
        "category": policy_data["category"],
        "status": policy_data.get("status", "active"),
        "last_review": policy_data.get("last_review", datetime.now().strftime("%Y-%m-%d")),
        "next_review": policy_data.get("next_review", ""),
        "compliance_score": policy_data.get("compliance_score", 0)
    }
    
    POLICIES_DATA.append(new_policy)
    
    # Log audit event
    security_manager.log_audit_event(
        user_id=current_user,
        action="create_policy",
        resource=f"policy:{policy_id}",
        details=f"Created policy: {policy_data['name']}"
    )
    
    return {
        "message": "Policy created successfully",
        "policy": new_policy
    }

@router.put("/policies/{policy_id}")
async def update_policy(
    policy_id: str,
    policy_data: Dict[str, Any],
    request: Request,
    current_user: str = Depends(get_current_user)
):
    """Update policy details"""
    
    policy_index = next((i for i, policy in enumerate(POLICIES_DATA) if policy["id"] == policy_id), None)
    if policy_index is None:
        raise HTTPException(status_code=404, detail="Policy not found")
    
    # Update policy data
    for key, value in policy_data.items():
        if key in POLICIES_DATA[policy_index]:
            POLICIES_DATA[policy_index][key] = value
    
    #

# Add these missing DELETE operations to the compliance.py file

@router.delete("/policies/{policy_id}")
async def delete_policy(
    policy_id: str,
    request: Request,
    current_user: str = Depends(get_current_user)
):
    """Delete policy"""
    
    policy_index = next((i for i, policy in enumerate(POLICIES_DATA) if policy["id"] == policy_id), None)
    if policy_index is None:
        raise HTTPException(status_code=404, detail="Policy not found")
    
    deleted_policy = POLICIES_DATA.pop(policy_index)
    
    # Log audit event
    security_manager.log_audit_event(
        user_id=current_user,
        action="delete_policy",
        resource=f"policy:{policy_id}",
        details=f"Deleted policy: {deleted_policy['name']}"
    )
    
    return {
        "message": "Policy deleted successfully",
        "policy": deleted_policy
    }

@router.delete("/audits/{audit_id}")
async def delete_audit(
    audit_id: str,
    request: Request,
    current_user: str = Depends(get_current_user)
):
    """Delete audit"""
    
    audit_index = next((i for i, audit in enumerate(AUDITS_DATA) if audit["id"] == audit_id), None)
    if audit_index is None:
        raise HTTPException(status_code=404, detail="Audit not found")
    
    deleted_audit = AUDITS_DATA.pop(audit_index)
    
    # Log audit event
    security_manager.log_audit_event(
        user_id=current_user,
        action="delete_audit",
        resource=f"audit:{audit_id}",
        details=f"Deleted audit: {deleted_audit['scope']}"
    )
    
    return {
        "message": "Audit deleted successfully",
        "audit": deleted_audit
    }

@router.delete("/violations/{violation_id}")
async def delete_violation(
    violation_id: str,
    request: Request,
    current_user: str = Depends(get_current_user)
):
    """Delete violation"""
    
    violation_index = next((i for i, violation in enumerate(VIOLATIONS_DATA) if violation["id"] == violation_id), None)
    if violation_index is None:
        raise HTTPException(status_code=404, detail="Violation not found")
    
    deleted_violation = VIOLATIONS_DATA.pop(violation_index)
    
    # Log audit event
    security_manager.log_audit_event(
        user_id=current_user,
        action="delete_violation",
        resource=f"violation:{violation_id}",
        details=f"Deleted violation: {deleted_violation['type']}"
    )
    
    return {
        "message": "Violation deleted successfully",
        "violation": deleted_violation
    }