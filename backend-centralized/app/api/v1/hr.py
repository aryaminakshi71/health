"""
HR Manager Plus API
Includes employee management, payroll, and HR analytics
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

router = APIRouter()

# Mock HR data
EMPLOYEES_DATA = [
    {
        "id": "EMP001",
        "name": "John Smith",
        "email": "john.smith@company.com",
        "department": "Engineering",
        "position": "Senior Developer",
        "hire_date": "2022-03-15",
        "salary": 85000,
        "status": "active",
        "manager": "Sarah Johnson"
    },
    {
        "id": "EMP002",
        "name": "Emily Davis",
        "email": "emily.davis@company.com",
        "department": "Marketing",
        "position": "Marketing Manager",
        "hire_date": "2021-08-20",
        "salary": 75000,
        "status": "active",
        "manager": "Mike Wilson"
    },
    {
        "id": "EMP003",
        "name": "Alex Johnson",
        "email": "alex.johnson@company.com",
        "department": "Sales",
        "position": "Sales Representative",
        "hire_date": "2023-01-10",
        "salary": 60000,
        "status": "active",
        "manager": "Lisa Rodriguez"
    }
]

DEPARTMENTS_DATA = [
    {
        "id": "DEPT001",
        "name": "Engineering",
        "manager": "Sarah Johnson",
        "employee_count": 25,
        "budget": 2500000,
        "status": "active"
    },
    {
        "id": "DEPT002",
        "name": "Marketing",
        "manager": "Mike Wilson",
        "employee_count": 12,
        "budget": 800000,
        "status": "active"
    },
    {
        "id": "DEPT003",
        "name": "Sales",
        "manager": "Lisa Rodriguez",
        "employee_count": 18,
        "budget": 1200000,
        "status": "active"
    }
]

@router.get("/dashboard")
async def get_hr_dashboard(
    current_user: str = Depends(get_current_user_dev_optional)
):
    """Get HR Manager dashboard with HR metrics"""
    
    total_employees = len(EMPLOYEES_DATA)
    total_departments = len(DEPARTMENTS_DATA)
    total_salary = sum(emp["salary"] for emp in EMPLOYEES_DATA)
    
    return {
        "employees": total_employees,
        "departments": total_departments,
        "revenue": 180000,
        "growth": 15.8,
        "recent_activities": [
            {"id": 1, "type": "new_hire", "employee": "John Smith", "department": "Engineering"},
            {"id": 2, "type": "promotion", "employee": "Sarah Johnson", "department": "Marketing"},
            {"id": 3, "type": "training", "employee": "Mike Davis", "course": "Leadership Skills"}
        ],
        "recent_activity": [
            {
                "timestamp": datetime.now().isoformat(),
                "action": "Employee updated",
                "user": current_user,
                "details": "John Smith salary updated"
            }
        ]
    }

@router.get("/employees")
async def get_employees(
    request: Request,
    current_user: str = Depends(get_current_user_dev_optional)
):
    """Get all employees with security logging"""
    
    # Log audit event
    security_manager.log_audit_event(
        user_id=current_user,
        action="read",
        resource="employees",
        details={"operation": "list_employees"},
        ip_address=request.client.host
    )
    
    return {"employees": EMPLOYEES_DATA}

@router.get("/employees/{employee_id}")
async def get_employee(
    employee_id: str,
    request: Request,
    current_user: str = Depends(get_current_user_dev_optional)
):
    """Get specific employee details"""
    
    employee = next((e for e in EMPLOYEES_DATA if e["id"] == employee_id), None)
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    # Log audit event
    security_manager.log_audit_event(
        user_id=current_user,
        action="read",
        resource=f"employee/{employee_id}",
        details={"employee_id": employee_id},
        ip_address=request.client.host
    )
    
    return {"employee": employee}

@router.post("/employees")
async def create_employee(
    employee_data: Dict[str, Any],
    request: Request,
    current_user: str = Depends(get_current_user)
):
    """Create new employee"""
    
    # Validate required fields
    required_fields = ["name", "email", "department", "position"]
    for field in required_fields:
        if field not in employee_data:
            raise HTTPException(status_code=400, detail=f"Missing required field: {field}")
    
    # Generate unique employee ID
    employee_id = f"EMP{str(uuid.uuid4())[:8].upper()}"
    
    # Create new employee
    new_employee = {
        "id": employee_id,
        "name": employee_data["name"],
        "email": employee_data["email"],
        "department": employee_data["department"],
        "position": employee_data["position"],
        "hire_date": employee_data.get("hire_date", datetime.now().strftime("%Y-%m-%d")),
        "salary": employee_data.get("salary", 0),
        "status": employee_data.get("status", "active"),
        "manager": employee_data.get("manager", "")
    }
    
    EMPLOYEES_DATA.append(new_employee)
    
    # Log audit event
    security_manager.log_audit_event(
        user_id=current_user,
        action="create_employee",
        resource=f"employee:{employee_id}",
        details=f"Created employee: {employee_data['name']}"
    )
    
    return {
        "message": "Employee created successfully",
        "employee": new_employee
    }

@router.put("/employees/{employee_id}")
async def update_employee(
    employee_id: str,
    employee_data: Dict[str, Any],
    request: Request,
    current_user: str = Depends(get_current_user)
):
    """Update employee details"""
    
    employee_index = next((i for i, emp in enumerate(EMPLOYEES_DATA) if emp["id"] == employee_id), None)
    if employee_index is None:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    # Update employee data
    for key, value in employee_data.items():
        if key in EMPLOYEES_DATA[employee_index]:
            EMPLOYEES_DATA[employee_index][key] = value
    
    # Log audit event
    security_manager.log_audit_event(
        user_id=current_user,
        action="update_employee",
        resource=f"employee:{employee_id}",
        details=f"Updated employee: {EMPLOYEES_DATA[employee_index]['name']}"
    )
    
    return {
        "message": "Employee updated successfully",
        "employee": EMPLOYEES_DATA[employee_index]
    }

@router.delete("/employees/{employee_id}")
async def delete_employee(
    employee_id: str,
    request: Request,
    current_user: str = Depends(get_current_user)
):
    """Delete employee"""
    
    employee_index = next((i for i, emp in enumerate(EMPLOYEES_DATA) if emp["id"] == employee_id), None)
    if employee_index is None:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    deleted_employee = EMPLOYEES_DATA.pop(employee_index)
    
    # Log audit event
    security_manager.log_audit_event(
        user_id=current_user,
        action="delete_employee",
        resource=f"employee:{employee_id}",
        details=f"Deleted employee: {deleted_employee['name']}"
    )
    
    return {
        "message": "Employee deleted successfully",
        "employee": deleted_employee
    }

@router.get("/departments")
async def get_departments(
    request: Request,
    current_user: str = Depends(get_current_user_dev_optional)
):
    """Get all departments"""
    
    # Log audit event
    security_manager.log_audit_event(
        user_id=current_user,
        action="read",
        resource="departments",
        details={"operation": "list_departments"},
        ip_address=request.client.host
    )
    
    return {"departments": DEPARTMENTS_DATA}

@router.get("/departments/{department_id}")
async def get_department(
    department_id: str,
    request: Request,
    current_user: str = Depends(get_current_user_dev_optional)
):
    """Get specific department details"""
    
    department = next((d for d in DEPARTMENTS_DATA if d["id"] == department_id), None)
    if not department:
        raise HTTPException(status_code=404, detail="Department not found")
    
    # Log audit event
    security_manager.log_audit_event(
        user_id=current_user,
        action="read",
        resource=f"department/{department_id}",
        details={"department_id": department_id},
        ip_address=request.client.host
    )
    
    return {"department": department}

@router.post("/departments")
async def create_department(
    department_data: Dict[str, Any],
    request: Request,
    current_user: str = Depends(get_current_user)
):
    """Create new department"""
    
    # Validate required fields
    required_fields = ["name", "manager"]
    for field in required_fields:
        if field not in department_data:
            raise HTTPException(status_code=400, detail=f"Missing required field: {field}")
    
    # Generate unique department ID
    department_id = f"DEPT{str(uuid.uuid4())[:8].upper()}"
    
    # Create new department
    new_department = {
        "id": department_id,
        "name": department_data["name"],
        "manager": department_data["manager"],
        "employee_count": department_data.get("employee_count", 0),
        "budget": department_data.get("budget", 0),
        "status": department_data.get("status", "active")
    }
    
    DEPARTMENTS_DATA.append(new_department)
    
    # Log audit event
    security_manager.log_audit_event(
        user_id=current_user,
        action="create_department",
        resource=f"department:{department_id}",
        details=f"Created department: {department_data['name']}"
    )
    
    return {
        "message": "Department created successfully",
        "department": new_department
    }

@router.put("/departments/{department_id}")
async def update_department(
    department_id: str,
    department_data: Dict[str, Any],
    request: Request,
    current_user: str = Depends(get_current_user)
):
    """Update department details"""
    
    department_index = next((i for i, dept in enumerate(DEPARTMENTS_DATA) if dept["id"] == department_id), None)
    if department_index is None:
        raise HTTPException(status_code=404, detail="Department not found")
    
    # Update department data
    for key, value in department_data.items():
        if key in DEPARTMENTS_DATA[department_index]:
            DEPARTMENTS_DATA[department_index][key] = value
    
    # Log audit event
    security_manager.log_audit_event(
        user_id=current_user,
        action="update_department",
        resource=f"department:{department_id}",
        details=f"Updated department: {DEPARTMENTS_DATA[department_index]['name']}"
    )
    
    return {
        "message": "Department updated successfully",
        "department": DEPARTMENTS_DATA[department_index]
    }

@router.delete("/departments/{department_id}")
async def delete_department(
    department_id: str,
    request: Request,
    current_user: str = Depends(get_current_user)
):
    """Delete department"""
    
    department_index = next((i for i, dept in enumerate(DEPARTMENTS_DATA) if dept["id"] == department_id), None)
    if department_index is None:
        raise HTTPException(status_code=404, detail="Department not found")
    
    deleted_department = DEPARTMENTS_DATA.pop(department_index)
    
    # Log audit event
    security_manager.log_audit_event(
        user_id=current_user,
        action="delete_department",
        resource=f"department:{department_id}",
        details=f"Deleted department: {deleted_department['name']}"
    )
    
    return {
        "message": "Department deleted successfully",
        "department": deleted_department
    }

@router.get("/analytics/workforce")
async def get_workforce_analytics(
    current_user: str = Depends(get_current_user_dev_optional)
):
    """Get workforce analytics"""
    
    return {
        "total_employees": len(EMPLOYEES_DATA),
        "total_departments": len(DEPARTMENTS_DATA),
        "average_salary": sum(emp["salary"] for emp in EMPLOYEES_DATA) / len(EMPLOYEES_DATA),
        "turnover_rate": 8.5,
        "department_distribution": {
            "Engineering": len([e for e in EMPLOYEES_DATA if e["department"] == "Engineering"]),
            "Marketing": len([e for e in EMPLOYEES_DATA if e["department"] == "Marketing"]),
            "Sales": len([e for e in EMPLOYEES_DATA if e["department"] == "Sales"])
        },
        "monthly_hires": [
            {"month": "Jan", "hires": 3},
            {"month": "Feb", "hires": 2},
            {"month": "Mar", "hires": 4}
        ]
    }

@router.get("/analytics/payroll")
async def get_payroll_analytics(
    current_user: str = Depends(get_current_user_dev_optional)
):
    """Get payroll analytics"""
    
    total_salary = sum(emp["salary"] for emp in EMPLOYEES_DATA)
    
    return {
        "total_payroll": total_salary,
        "average_salary": total_salary / len(EMPLOYEES_DATA),
        "salary_by_department": {
            "Engineering": sum(emp["salary"] for emp in EMPLOYEES_DATA if emp["department"] == "Engineering"),
            "Marketing": sum(emp["salary"] for emp in EMPLOYEES_DATA if emp["department"] == "Marketing"),
            "Sales": sum(emp["salary"] for emp in EMPLOYEES_DATA if emp["department"] == "Sales")
        },
        "monthly_payroll": [
            {"month": "Jan", "payroll": 220000},
            {"month": "Feb", "payroll": 220000},
            {"month": "Mar", "payroll": 220000}
        ]
    } 