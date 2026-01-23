"""
Education Platform API
Includes course management, student tracking, and educational analytics
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

# Mock education data
COURSES_DATA = [
    {
        "id": "C001",
        "name": "Web Development Fundamentals",
        "instructor": "Dr. Sarah Johnson",
        "students": 150,
        "rating": 4.8,
        "duration": "8 weeks",
        "price": 299.99,
        "status": "active",
        "category": "Programming"
    },
    {
        "id": "C002",
        "name": "Data Science Essentials",
        "instructor": "Prof. Mike Chen",
        "students": 120,
        "rating": 4.9,
        "duration": "12 weeks",
        "price": 399.99,
        "status": "active",
        "category": "Data Science"
    },
    {
        "id": "C003",
        "name": "Digital Marketing Mastery",
        "instructor": "Lisa Rodriguez",
        "students": 95,
        "rating": 4.7,
        "duration": "6 weeks",
        "price": 199.99,
        "status": "active",
        "category": "Marketing"
    }
]

STUDENTS_DATA = [
    {
        "id": "S001",
        "name": "John Smith",
        "email": "john.smith@email.com",
        "enrolled_courses": ["C001", "C002"],
        "completion_rate": 85,
        "join_date": "2024-01-15",
        "status": "active"
    },
    {
        "id": "S002",
        "name": "Emily Davis",
        "email": "emily.davis@email.com",
        "enrolled_courses": ["C001"],
        "completion_rate": 92,
        "join_date": "2024-01-10",
        "status": "active"
    },
    {
        "id": "S003",
        "name": "Alex Johnson",
        "email": "alex.johnson@email.com",
        "enrolled_courses": ["C002", "C003"],
        "completion_rate": 78,
        "join_date": "2024-01-20",
        "status": "active"
    }
]

@router.get("/dashboard")
async def get_education_dashboard(
    current_user: str = Depends(get_current_user_dev_optional)
):
    """Get Education Platform dashboard with educational metrics"""
    
    total_students = len(STUDENTS_DATA)
    total_courses = len(COURSES_DATA)
    total_revenue = sum(course["students"] * course["price"] for course in COURSES_DATA)
    
    return {
        "students": total_students,
        "courses": total_courses,
        "revenue": total_revenue,
        "growth": 35.2,
        "popular_courses": [
            {"id": 1, "name": "Web Development", "enrolled": 150, "rating": 4.8},
            {"id": 2, "name": "Data Science", "enrolled": 120, "rating": 4.9},
            {"id": 3, "name": "Digital Marketing", "enrolled": 95, "rating": 4.7}
        ],
        "recent_activity": [
            {
                "timestamp": datetime.now().isoformat(),
                "action": "Student enrolled",
                "user": current_user,
                "details": "New student enrolled in Web Development course"
            }
        ]
    }

@router.get("/courses")
async def get_courses(
    request: Request,
    current_user: str = Depends(get_current_user_dev_optional)
):
    """Get all courses with security logging"""
    
    # Log audit event
    security_manager.log_audit_event(
        user_id=current_user,
        action="read",
        resource="courses",
        details={"operation": "list_courses"},
        ip_address=request.client.host
    )
    
    return {"courses": COURSES_DATA}

@router.get("/courses/{course_id}")
async def get_course(
    course_id: str,
    request: Request,
    current_user: str = Depends(get_current_user_dev_optional)
):
    """Get specific course details"""
    
    course = next((c for c in COURSES_DATA if c["id"] == course_id), None)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    # Log audit event
    security_manager.log_audit_event(
        user_id=current_user,
        action="read",
        resource=f"course/{course_id}",
        details={"course_id": course_id},
        ip_address=request.client.host
    )
    
    return {"course": course}

@router.post("/courses")
async def create_course(
    course_data: Dict[str, Any],
    request: Request,
    current_user: str = Depends(get_current_user)
):
    """Create new course"""
    
    # Validate required fields
    required_fields = ["name", "instructor", "duration", "price", "category"]
    for field in required_fields:
        if field not in course_data:
            raise HTTPException(status_code=400, detail=f"Missing required field: {field}")
    
    # Generate unique course ID
    course_id = f"C{str(uuid.uuid4())[:8].upper()}"
    
    new_course = {
        "id": course_id,
        "name": course_data["name"],
        "instructor": course_data["instructor"],
        "students": 0,
        "rating": 0.0,
        "duration": course_data["duration"],
        "price": course_data["price"],
        "status": "active",
        "category": course_data["category"],
        "created_at": datetime.now().isoformat(),
        "created_by": current_user
    }
    
    COURSES_DATA.append(new_course)
    
    # Log audit event
    security_manager.log_audit_event(
        user_id=current_user,
        action="create",
        resource="course",
        details={"course_id": course_id, "course_name": course_data["name"]},
        ip_address=request.client.host
    )
    
    return {"course": new_course, "message": "Course created successfully"}

@router.put("/courses/{course_id}")
async def update_course(
    course_id: str,
    course_data: Dict[str, Any],
    request: Request,
    current_user: str = Depends(get_current_user)
):
    """Update course"""
    
    course_index = next((i for i, course in enumerate(COURSES_DATA) if course["id"] == course_id), None)
    if course_index is None:
        raise HTTPException(status_code=404, detail="Course not found")
    
    # Update course data
    for key, value in course_data.items():
        if key in COURSES_DATA[course_index]:
            COURSES_DATA[course_index][key] = value
    
    COURSES_DATA[course_index]["updated_at"] = datetime.now().isoformat()
    COURSES_DATA[course_index]["updated_by"] = current_user
    
    # Log audit event
    security_manager.log_audit_event(
        user_id=current_user,
        action="update",
        resource="course",
        details={"course_id": course_id},
        ip_address=request.client.host
    )
    
    return {"course": COURSES_DATA[course_index], "message": "Course updated successfully"}

@router.delete("/courses/{course_id}")
async def delete_course(
    course_id: str,
    request: Request,
    current_user: str = Depends(get_current_user)
):
    """Delete course"""
    
    course_index = next((i for i, course in enumerate(COURSES_DATA) if course["id"] == course_id), None)
    if course_index is None:
        raise HTTPException(status_code=404, detail="Course not found")
    
    deleted_course = COURSES_DATA.pop(course_index)
    
    # Log audit event
    security_manager.log_audit_event(
        user_id=current_user,
        action="delete",
        resource="course",
        details={"course_id": course_id, "course_name": deleted_course["name"]},
        ip_address=request.client.host
    )
    
    return {"message": "Course deleted successfully", "deleted_course": deleted_course}

@router.get("/students")
async def get_students(
    request: Request,
    current_user: str = Depends(get_current_user_dev_optional)
):
    """Get all students"""
    
    # Log audit event
    security_manager.log_audit_event(
        user_id=current_user,
        action="read",
        resource="students",
        details={"operation": "list_students"},
        ip_address=request.client.host
    )
    
    return {"students": STUDENTS_DATA}

@router.get("/students/{student_id}")
async def get_student(
    student_id: str,
    request: Request,
    current_user: str = Depends(get_current_user_dev_optional)
):
    """Get specific student details"""
    
    student = next((s for s in STUDENTS_DATA if s["id"] == student_id), None)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    # Log audit event
    security_manager.log_audit_event(
        user_id=current_user,
        action="read",
        resource=f"student/{student_id}",
        details={"student_id": student_id},
        ip_address=request.client.host
    )
    
    return {"student": student}

@router.post("/students")
async def create_student(
    student_data: Dict[str, Any],
    request: Request,
    current_user: str = Depends(get_current_user)
):
    """Create new student"""
    
    # Validate required fields
    required_fields = ["name", "email"]
    for field in required_fields:
        if field not in student_data:
            raise HTTPException(status_code=400, detail=f"Missing required field: {field}")
    
    # Generate unique student ID
    student_id = f"S{str(uuid.uuid4())[:8].upper()}"
    
    new_student = {
        "id": student_id,
        "name": student_data["name"],
        "email": student_data["email"],
        "enrolled_courses": student_data.get("enrolled_courses", []),
        "completion_rate": 0,
        "join_date": datetime.now().strftime("%Y-%m-%d"),
        "status": "active",
        "created_at": datetime.now().isoformat(),
        "created_by": current_user
    }
    
    STUDENTS_DATA.append(new_student)
    
    # Log audit event
    security_manager.log_audit_event(
        user_id=current_user,
        action="create",
        resource="student",
        details={"student_id": student_id, "student_name": student_data["name"]},
        ip_address=request.client.host
    )
    
    return {"student": new_student, "message": "Student created successfully"}

@router.put("/students/{student_id}")
async def update_student(
    student_id: str,
    student_data: Dict[str, Any],
    request: Request,
    current_user: str = Depends(get_current_user)
):
    """Update student"""
    
    student_index = next((i for i, student in enumerate(STUDENTS_DATA) if student["id"] == student_id), None)
    if student_index is None:
        raise HTTPException(status_code=404, detail="Student not found")
    
    # Update student data
    for key, value in student_data.items():
        if key in STUDENTS_DATA[student_index]:
            STUDENTS_DATA[student_index][key] = value
    
    STUDENTS_DATA[student_index]["updated_at"] = datetime.now().isoformat()
    STUDENTS_DATA[student_index]["updated_by"] = current_user
    
    # Log audit event
    security_manager.log_audit_event(
        user_id=current_user,
        action="update",
        resource="student",
        details={"student_id": student_id},
        ip_address=request.client.host
    )
    
    return {"student": STUDENTS_DATA[student_index], "message": "Student updated successfully"}

@router.delete("/students/{student_id}")
async def delete_student(
    student_id: str,
    request: Request,
    current_user: str = Depends(get_current_user)
):
    """Delete student"""
    
    student_index = next((i for i, student in enumerate(STUDENTS_DATA) if student["id"] == student_id), None)
    if student_index is None:
        raise HTTPException(status_code=404, detail="Student not found")
    
    deleted_student = STUDENTS_DATA.pop(student_index)
    
    # Log audit event
    security_manager.log_audit_event(
        user_id=current_user,
        action="delete",
        resource="student",
        details={"student_id": student_id, "student_name": deleted_student["name"]},
        ip_address=request.client.host
    )
    
    return {"message": "Student deleted successfully", "deleted_student": deleted_student}

@router.get("/analytics/enrollment")
async def get_enrollment_analytics(
    current_user: str = Depends(get_current_user_dev_optional)
):
    """Get enrollment analytics"""
    
    return {
        "total_enrollments": sum(course["students"] for course in COURSES_DATA),
        "active_students": len(STUDENTS_DATA),
        "completion_rate": 82.5,
        "average_rating": 4.8,
        "monthly_enrollments": [
            {"month": "Jan", "enrollments": 45},
            {"month": "Feb", "enrollments": 52},
            {"month": "Mar", "enrollments": 58}
        ],
        "course_popularity": [
            {"course": "Web Development", "enrollments": 150},
            {"course": "Data Science", "enrollments": 120},
            {"course": "Digital Marketing", "enrollments": 95}
        ]
    }

@router.get("/analytics/revenue")
async def get_revenue_analytics(
    current_user: str = Depends(get_current_user_dev_optional)
):
    """Get revenue analytics"""
    
    total_revenue = sum(course["students"] * course["price"] for course in COURSES_DATA)
    
    return {
        "total_revenue": total_revenue,
        "monthly_revenue": [
            {"month": "Jan", "revenue": 45000},
            {"month": "Feb", "revenue": 52000},
            {"month": "Mar", "revenue": 58000}
        ],
        "course_revenue": [
            {"course": "Web Development", "revenue": 44985},
            {"course": "Data Science", "revenue": 47988},
            {"course": "Digital Marketing", "revenue": 18999}
        ],
        "growth_rate": 35.2
    } 

# ==================== ENROLLMENTS CRUD OPERATIONS ====================

@router.post("/enrollments")
async def create_enrollment(
    enrollment_data: Dict[str, Any],
    request: Request,
    current_user: str = Depends(get_current_user)
):
    """Enroll student in course"""
    
    # Validate required fields
    required_fields = ["student_id", "course_id"]
    for field in required_fields:
        if field not in enrollment_data:
            raise HTTPException(status_code=400, detail=f"Missing required field: {field}")
    
    # Check if student exists
    student = next((s for s in STUDENTS_DATA if s["id"] == enrollment_data["student_id"]), None)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    # Check if course exists
    course = next((c for c in COURSES_DATA if c["id"] == enrollment_data["course_id"]), None)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    # Add course to student's enrolled courses
    if enrollment_data["course_id"] not in student["enrolled_courses"]:
        student["enrolled_courses"].append(enrollment_data["course_id"])
    
    # Update course student count
    course["students"] += 1
    
    # Log audit event
    security_manager.log_audit_event(
        user_id=current_user,
        action="create",
        resource="enrollment",
        details={"student_id": enrollment_data["student_id"], "course_id": enrollment_data["course_id"]},
        ip_address=request.client.host
    )
    
    return {"message": "Student enrolled successfully", "enrollment": enrollment_data}

@router.delete("/enrollments/{student_id}/{course_id}")
async def remove_enrollment(
    student_id: str,
    course_id: str,
    request: Request,
    current_user: str = Depends(get_current_user)
):
    """Remove student from course"""
    
    # Check if student exists
    student = next((s for s in STUDENTS_DATA if s["id"] == student_id), None)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    # Check if course exists
    course = next((c for c in COURSES_DATA if c["id"] == course_id), None)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    # Remove course from student's enrolled courses
    if course_id in student["enrolled_courses"]:
        student["enrolled_courses"].remove(course_id)
    
    # Update course student count
    if course["students"] > 0:
        course["students"] -= 1
    
    # Log audit event
    security_manager.log_audit_event(
        user_id=current_user,
        action="delete",
        resource="enrollment",
        details={"student_id": student_id, "course_id": course_id},
        ip_address=request.client.host
    )
    
    return {"message": "Student removed from course successfully"} 