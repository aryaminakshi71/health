"""
Business Suite Pro API
Complete CRUD operations for projects, clients, and business analytics
"""

from fastapi import APIRouter, HTTPException, Depends, Request
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import json
import uuid
from ...core.security import (
    security_manager, 
    access_control, 
    compliance_checker,
    get_current_user,
    get_current_user_dev_optional,
    verify_permission
)
from ...core.database import get_db
from sqlalchemy.orm import Session
from ...models.business import Project as ProjectModel, Client as ClientModel, Company as CompanyModel, BusinessReport as ReportModel

router = APIRouter()

# Mock business data
PROJECTS_DATA = [
    {
        "id": "P001",
        "name": "Website Redesign",
        "client": "TechCorp Inc",
        "status": "in_progress",
        "progress": 75,
        "deadline": "2024-02-15",
        "budget": 25000,
        "team_size": 5,
        "priority": "high"
    },
    {
        "id": "P002",
        "name": "Mobile App Development",
        "client": "StartupXYZ",
        "status": "planning",
        "progress": 25,
        "deadline": "2024-03-01",
        "budget": 50000,
        "team_size": 8,
        "priority": "medium"
    },
    {
        "id": "P003",
        "name": "Marketing Campaign",
        "client": "GlobalBrand",
        "status": "completed",
        "progress": 100,
        "deadline": "2024-01-30",
        "budget": 15000,
        "team_size": 3,
        "priority": "low"
    }
]

CLIENTS_DATA = [
    {
        "id": "C001",
        "name": "TechCorp Inc",
        "email": "contact@techcorp.com",
        "phone": "+1-555-0100",
        "status": "active",
        "total_projects": 3,
        "total_revenue": 75000,
        "last_contact": "2024-01-25"
    },
    {
        "id": "C002",
        "name": "StartupXYZ",
        "email": "hello@startupxyz.com",
        "phone": "+1-555-0200",
        "status": "active",
        "total_projects": 1,
        "total_revenue": 50000,
        "last_contact": "2024-01-26"
    },
    {
        "id": "C003",
        "name": "GlobalBrand",
        "email": "info@globalbrand.com",
        "phone": "+1-555-0300",
        "status": "inactive",
        "total_projects": 2,
        "total_revenue": 30000,
        "last_contact": "2024-01-20"
    }
]

@router.get("/dashboard")
async def get_business_dashboard(
    current_user: str = Depends(get_current_user_dev_optional)
):
    """Get Business Suite dashboard with project and client metrics"""
    
    active_projects = [p for p in PROJECTS_DATA if p["status"] != "completed"]
    completed_projects = [p for p in PROJECTS_DATA if p["status"] == "completed"]
    total_revenue = sum(p["budget"] for p in PROJECTS_DATA)
    
    dashboard_data = {
        "metrics": {
            "total_projects": len(PROJECTS_DATA),
            "active_projects": len(active_projects),
            "completed_projects": len(completed_projects),
            "total_revenue": total_revenue,
            "total_clients": len(CLIENTS_DATA),
            "active_clients": len([c for c in CLIENTS_DATA if c["status"] == "active"])
        },
        "recent_projects": PROJECTS_DATA[:3],
        "recent_clients": CLIENTS_DATA[:3],
        "project_status_distribution": {
            "planning": len([p for p in PROJECTS_DATA if p["status"] == "planning"]),
            "in_progress": len([p for p in PROJECTS_DATA if p["status"] == "in_progress"]),
            "completed": len([p for p in PROJECTS_DATA if p["status"] == "completed"])
        }
    }
    
    return dashboard_data

# ==================== PROJECTS CRUD OPERATIONS ====================

@router.get("/projects")
async def get_projects(
    request: Request,
    current_user: str = Depends(get_current_user_dev_optional),
    db: Session = Depends(get_db)
):
    """Get all projects with optional filtering"""
    
    # Log audit event
    security_manager.log_audit_event(
        user_id=current_user,
        action="read",
        resource="projects",
        details={"operation": "get_projects"},
        ip_address=request.client.host
    )
    
    try:
        orm_projects = db.query(ProjectModel).limit(200).all()
        if orm_projects:
            data = [
                {
                    "id": p.id,
                    "name": p.name,
                    "client": getattr(p, "client_name", None) or getattr(p, "client", None),
                    "status": p.status,
                    "progress": getattr(p, "progress", 0),
                    "deadline": getattr(p, "deadline", None),
                    "budget": getattr(p, "budget", 0),
                    "team_size": getattr(p, "team_size", 0),
                    "priority": getattr(p, "priority", 'medium')
                } for p in orm_projects
            ]
            return {"projects": data}
    except Exception:
        pass
    return {"projects": PROJECTS_DATA}

@router.get("/projects/{project_id}")
async def get_project(
    project_id: str,
    request: Request,
    current_user: str = Depends(get_current_user_dev_optional)
):
    """Get specific project by ID"""
    
    project = next((p for p in PROJECTS_DATA if p["id"] == project_id), None)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Log audit event
    security_manager.log_audit_event(
        user_id=current_user,
        action="read",
        resource="project",
        details={"project_id": project_id},
        ip_address=request.client.host
    )
    
    return {"project": project}

@router.post("/projects")
async def create_project(
    project_data: Dict[str, Any],
    request: Request,
    current_user: str = Depends(get_current_user)
):
    """Create new project"""
    
    # Validate required fields
    required_fields = ["name", "client", "deadline", "budget"]
    for field in required_fields:
        if field not in project_data:
            raise HTTPException(status_code=400, detail=f"Missing required field: {field}")
    
    # Generate unique project ID
    project_id = f"P{str(uuid.uuid4())[:8].upper()}"
    
    new_project = {
        "id": project_id,
        "name": project_data["name"],
        "client": project_data["client"],
        "status": project_data.get("status", "planning"),
        "progress": project_data.get("progress", 0),
        "deadline": project_data["deadline"],
        "budget": project_data["budget"],
        "team_size": project_data.get("team_size", 1),
        "priority": project_data.get("priority", "medium"),
        "created_at": datetime.now().isoformat(),
        "created_by": current_user
    }
    
    PROJECTS_DATA.append(new_project)
    
    # Log audit event
    security_manager.log_audit_event(
        user_id=current_user,
        action="create",
        resource="project",
        details={"project_id": project_id, "project_name": project_data["name"]},
        ip_address=request.client.host
    )
    
    return {"project": new_project, "message": "Project created successfully"}

@router.put("/projects/{project_id}")
async def update_project(
    project_id: str,
    project_data: Dict[str, Any],
    request: Request,
    current_user: str = Depends(get_current_user)
):
    """Update existing project"""
    
    project_index = next((i for i, p in enumerate(PROJECTS_DATA) if p["id"] == project_id), None)
    if project_index is None:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Update project data
    for key, value in project_data.items():
        if key in PROJECTS_DATA[project_index]:
            PROJECTS_DATA[project_index][key] = value
    
    PROJECTS_DATA[project_index]["updated_at"] = datetime.now().isoformat()
    PROJECTS_DATA[project_index]["updated_by"] = current_user
    
    # Log audit event
    security_manager.log_audit_event(
        user_id=current_user,
        action="update",
        resource="project",
        details={"project_id": project_id},
        ip_address=request.client.host
    )
    
    return {"project": PROJECTS_DATA[project_index], "message": "Project updated successfully"}

@router.delete("/projects/{project_id}")
async def delete_project(
    project_id: str,
    request: Request,
    current_user: str = Depends(get_current_user)
):
    """Delete project"""
    
    project_index = next((i for i, p in enumerate(PROJECTS_DATA) if p["id"] == project_id), None)
    if project_index is None:
        raise HTTPException(status_code=404, detail="Project not found")
    
    deleted_project = PROJECTS_DATA.pop(project_index)
    
    # Log audit event
    security_manager.log_audit_event(
        user_id=current_user,
        action="delete",
        resource="project",
        details={"project_id": project_id, "project_name": deleted_project["name"]},
        ip_address=request.client.host
    )
    
    return {"message": "Project deleted successfully", "deleted_project": deleted_project}

# ==================== CLIENTS CRUD OPERATIONS ====================

@router.get("/clients")
async def get_clients(
    request: Request,
    current_user: str = Depends(get_current_user_dev_optional),
    db: Session = Depends(get_db)
):
    """Get all clients"""
    
    # Log audit event
    security_manager.log_audit_event(
        user_id=current_user,
        action="read",
        resource="clients",
        details={"operation": "get_clients"},
        ip_address=request.client.host
    )
    
    try:
        orm_clients = db.query(ClientModel).limit(200).all()
        if orm_clients:
            data = [
                {
                    "id": c.id,
                    "name": c.name,
                    "email": getattr(c, "email", ""),
                    "phone": getattr(c, "phone", ""),
                    "status": getattr(c, "status", "active"),
                    "total_projects": getattr(c, "total_projects", 0),
                    "total_revenue": getattr(c, "total_revenue", 0),
                    "last_contact": getattr(c, "last_contact", None)
                } for c in orm_clients
            ]
            return {"clients": data}
    except Exception:
        pass
    return {"clients": CLIENTS_DATA}

@router.get("/clients/{client_id}")
async def get_client(
    client_id: str,
    request: Request,
    current_user: str = Depends(get_current_user_dev_optional)
):
    """Get specific client by ID"""
    
    client = next((c for c in CLIENTS_DATA if c["id"] == client_id), None)
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    
    # Log audit event
    security_manager.log_audit_event(
        user_id=current_user,
        action="read",
        resource="client",
        details={"client_id": client_id},
        ip_address=request.client.host
    )
    
    return {"client": client}

@router.post("/clients")
async def create_client(
    client_data: Dict[str, Any],
    request: Request,
    current_user: str = Depends(get_current_user)
):
    """Create new client"""
    
    # Validate required fields
    required_fields = ["name", "email"]
    for field in required_fields:
        if field not in client_data:
            raise HTTPException(status_code=400, detail=f"Missing required field: {field}")
    
    # Generate unique client ID
    client_id = f"C{str(uuid.uuid4())[:8].upper()}"
    
    new_client = {
        "id": client_id,
        "name": client_data["name"],
        "email": client_data["email"],
        "phone": client_data.get("phone", ""),
        "status": client_data.get("status", "active"),
        "total_projects": 0,
        "total_revenue": 0,
        "last_contact": datetime.now().isoformat(),
        "created_at": datetime.now().isoformat(),
        "created_by": current_user
    }
    
    CLIENTS_DATA.append(new_client)
    
    # Log audit event
    security_manager.log_audit_event(
        user_id=current_user,
        action="create",
        resource="client",
        details={"client_id": client_id, "client_name": client_data["name"]},
        ip_address=request.client.host
    )
    
    return {"client": new_client, "message": "Client created successfully"}

@router.put("/clients/{client_id}")
async def update_client(
    client_id: str,
    client_data: Dict[str, Any],
    request: Request,
    current_user: str = Depends(get_current_user)
):
    """Update existing client"""
    
    client_index = next((i for i, c in enumerate(CLIENTS_DATA) if c["id"] == client_id), None)
    if client_index is None:
        raise HTTPException(status_code=404, detail="Client not found")
    
    # Update client data
    for key, value in client_data.items():
        if key in CLIENTS_DATA[client_index]:
            CLIENTS_DATA[client_index][key] = value
    
    CLIENTS_DATA[client_index]["updated_at"] = datetime.now().isoformat()
    CLIENTS_DATA[client_index]["updated_by"] = current_user
    
    # Log audit event
    security_manager.log_audit_event(
        user_id=current_user,
        action="update",
        resource="client",
        details={"client_id": client_id},
        ip_address=request.client.host
    )
    
    return {"client": CLIENTS_DATA[client_index], "message": "Client updated successfully"}

@router.delete("/clients/{client_id}")
async def delete_client(
    client_id: str,
    request: Request,
    current_user: str = Depends(get_current_user)
):
    """Delete client"""
    
    client_index = next((i for i, c in enumerate(CLIENTS_DATA) if c["id"] == client_id), None)
    if client_index is None:
        raise HTTPException(status_code=404, detail="Client not found")
    
    deleted_client = CLIENTS_DATA.pop(client_index)
    
    # Log audit event
    security_manager.log_audit_event(
        user_id=current_user,
        action="delete",
        resource="client",
        details={"client_id": client_id, "client_name": deleted_client["name"]},
        ip_address=request.client.host
    )
    
    return {"message": "Client deleted successfully", "deleted_client": deleted_client}

# ==================== ANALYTICS ENDPOINTS ====================

@router.get("/analytics/revenue")
async def get_revenue_analytics(
    current_user: str = Depends(get_current_user_dev_optional)
):
    """Get revenue analytics data"""
    
    total_revenue = sum(p["budget"] for p in PROJECTS_DATA)
    completed_revenue = sum(p["budget"] for p in PROJECTS_DATA if p["status"] == "completed")
    active_revenue = sum(p["budget"] for p in PROJECTS_DATA if p["status"] == "in_progress")
    
    analytics_data = {
        "total_revenue": total_revenue,
        "completed_revenue": completed_revenue,
        "active_revenue": active_revenue,
        "revenue_by_status": {
            "completed": completed_revenue,
            "in_progress": active_revenue,
            "planning": total_revenue - completed_revenue - active_revenue
        },
        "top_clients": sorted(CLIENTS_DATA, key=lambda x: x["total_revenue"], reverse=True)[:5]
    }
    
    return analytics_data

@router.get("/analytics/projects")
async def get_project_analytics(
    current_user: str = Depends(get_current_user_dev_optional)
):
    """Get project analytics data"""
    
    analytics_data = {
        "project_count_by_status": {
            "planning": len([p for p in PROJECTS_DATA if p["status"] == "planning"]),
            "in_progress": len([p for p in PROJECTS_DATA if p["status"] == "in_progress"]),
            "completed": len([p for p in PROJECTS_DATA if p["status"] == "completed"])
        },
        "average_project_duration": 45,  # Mock data
        "projects_by_priority": {
            "high": len([p for p in PROJECTS_DATA if p["priority"] == "high"]),
            "medium": len([p for p in PROJECTS_DATA if p["priority"] == "medium"]),
            "low": len([p for p in PROJECTS_DATA if p["priority"] == "low"])
        },
        "team_size_distribution": {
            "small": len([p for p in PROJECTS_DATA if p["team_size"] <= 3]),
            "medium": len([p for p in PROJECTS_DATA if 3 < p["team_size"] <= 6]),
            "large": len([p for p in PROJECTS_DATA if p["team_size"] > 6])
        }
    }
    
    return analytics_data 

# ==================== COMPANIES CRUD (DB backed) ====================

@router.get("/companies")
async def get_companies(
    current_user: str = Depends(get_current_user_dev_optional),
    db: Session = Depends(get_db)
):
    try:
        items = db.query(CompanyModel).limit(200).all()
        data = [
            {
                "id": c.id,
                "name": c.name,
                "legal_name": c.legal_name,
                "industry": c.industry,
                "company_size": c.company_size,
                "phone": c.phone,
                "email": c.email,
                "website": c.website,
                "is_active": c.is_active,
                "created_at": c.created_at.isoformat() if c.created_at else None,
            } for c in items
        ]
        return {"status": "success", "data": data, "total": len(data)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get companies: {str(e)}")

@router.post("/companies")
async def create_company(
    payload: Dict[str, Any],
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        comp = CompanyModel(
            name=payload.get("name"),
            legal_name=payload.get("legal_name"),
            tax_id=payload.get("tax_id"),
            address=payload.get("address"),
            phone=payload.get("phone"),
            email=payload.get("email"),
            website=payload.get("website"),
            industry=payload.get("industry"),
            company_size=payload.get("company_size"),
            is_active=payload.get("is_active", True),
        )
        db.add(comp)
        db.commit()
        db.refresh(comp)
        return {"status": "success", "data": {"id": comp.id}}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create company: {str(e)}")

@router.put("/companies/{company_id}")
async def update_company(
    company_id: int,
    payload: Dict[str, Any],
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        comp = db.query(CompanyModel).filter(CompanyModel.id == company_id).first()
        if not comp:
            raise HTTPException(status_code=404, detail="Company not found")
        for k, v in payload.items():
            if hasattr(comp, k):
                setattr(comp, k, v)
        db.commit()
        db.refresh(comp)
        return {"status": "success", "data": {"id": comp.id}}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update company: {str(e)}")

@router.delete("/companies/{company_id}")
async def delete_company(
    company_id: int,
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        comp = db.query(CompanyModel).filter(CompanyModel.id == company_id).first()
        if not comp:
            raise HTTPException(status_code=404, detail="Company not found")
        db.delete(comp)
        db.commit()
        return {"status": "success", "message": "Company deleted"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete company: {str(e)}")

# ==================== REPORTS CRUD (DB backed) ====================

@router.get("/reports")
async def get_reports(
    current_user: str = Depends(get_current_user_dev_optional),
    db: Session = Depends(get_db)
):
    try:
        items = db.query(ReportModel).limit(200).all()
        data = [
            {
                "id": r.id,
                "title": r.title,
                "report_type": r.report_type,
                "description": r.description,
                "generated_at": r.generated_at.isoformat() if r.generated_at else None,
                "status": r.status,
            } for r in items
        ]
        return {"status": "success", "data": data, "total": len(data)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get reports: {str(e)}")

@router.post("/reports")
async def create_report(
    payload: Dict[str, Any],
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        rep = ReportModel(
            title=payload.get("title", "Untitled Report"),
            report_type=payload.get("report_type"),
            description=payload.get("description"),
            filters=json.dumps(payload.get("filters", {})),
            generated_by=payload.get("generated_by"),
            client_id=payload.get("client_id"),
            project_id=payload.get("project_id"),
            data=payload.get("data"),
            status=payload.get("status", "ready"),
        )
        db.add(rep)
        db.commit()
        db.refresh(rep)
        return {"status": "success", "data": {"id": rep.id}}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create report: {str(e)}")

@router.put("/reports/{report_id}")
async def update_report(
    report_id: int,
    payload: Dict[str, Any],
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        rep = db.query(ReportModel).filter(ReportModel.id == report_id).first()
        if not rep:
            raise HTTPException(status_code=404, detail="Report not found")
        # Update fields
        for k, v in payload.items():
            if k == 'filters' and isinstance(v, (dict, list)):
                setattr(rep, k, json.dumps(v))
            elif hasattr(rep, k):
                setattr(rep, k, v)
        db.commit()
        db.refresh(rep)
        return {"status": "success", "data": {"id": rep.id}}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update report: {str(e)}")

@router.delete("/reports/{report_id}")
async def delete_report(
    report_id: int,
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        rep = db.query(ReportModel).filter(ReportModel.id == report_id).first()
        if not rep:
            raise HTTPException(status_code=404, detail="Report not found")
        db.delete(rep)
        db.commit()
        return {"status": "success", "message": "Report deleted"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete report: {str(e)}")
