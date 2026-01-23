"""
Healthcare API
Includes patient management, medical records, and healthcare monitoring
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
    verify_permission,
)
from ...core.database import get_db
from ...models.healthcare import (
    Patient as PatientModel,
    Appointment as AppointmentModel,
    LabResult as LabResultModel,
    Prescription as PrescriptionModel,
)
from sqlalchemy.orm import Session

router = APIRouter()

# NOTE: In-memory storage for development/demo only.
# In production, all data should come from the database.
# These provide fallback functionality when database is unavailable.

PATIENTS_DATA: list = []  # Should come from PatientModel
PATIENT_PROFILE: dict = {}  # Should come from authenticated user's patient record
APPOINTMENTS_DATA: list = []  # Should come from AppointmentModel
TEST_RESULTS_DATA: list = []  # Should come from LabResultModel
MEDICATIONS_DATA: list = []  # Should come from PrescriptionModel
MESSAGES_DATA: list = []  # Should come from MessageModel
FORMS_DATA: list = [
    {
        "id": "F001",
        "name": "HIPAA Consent",
        "description": "Patient consent form",
        "category": "consent",
        "version": "1.0",
        "status": "available",
    },
    {
        "id": "F002",
        "name": "Medical History",
        "description": "Past medical history",
        "category": "intake",
        "version": "2.1",
        "status": "available",
    },
]
FORM_SUBMISSIONS: list = []


@router.get("/patients")
async def get_patients(
    request: Request,
    current_user: str = Depends(get_current_user_dev_optional),
    db: Session = Depends(get_db),
):
    """Get all patients"""
    try:
        patients = []
        try:
            orm_patients = db.query(PatientModel).limit(200).all()
            for p in orm_patients:
                patients.append(
                    {
                        "id": p.id,
                        "name": getattr(p, "first_name", "")
                        + " "
                        + getattr(p, "last_name", ""),
                        "age": p.get_age() if hasattr(p, "get_age") else None,
                        "room": None,
                        "status": p.status or "active",
                        "last_visit": None,
                    }
                )
        except Exception:
            patients = PATIENTS_DATA
        return {
            "success": True,
            "data": patients,
            "timestamp": datetime.utcnow().isoformat(),
        }
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error fetching patients: {str(e)}"
        )


@router.get("/patient")
async def get_patient_profile(
    request: Request, current_user: str = Depends(get_current_user_dev_optional)
):
    """Get current patient's profile"""
    try:
        return {"success": True, "data": PATIENT_PROFILE}
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error fetching patient profile: {str(e)}"
        )


@router.get("/appointments")
async def get_appointments(
    request: Request,
    current_user: str = Depends(get_current_user_dev_optional),
    db: Session = Depends(get_db),
):
    try:
        items = []
        try:
            orm_appts = db.query(AppointmentModel).limit(200).all()
            for a in orm_appts:
                items.append(
                    {
                        "id": a.id,
                        "patientId": a.patient_id,
                        "providerId": a.doctor_id,
                        "date": a.scheduled_date.isoformat()
                        if a.scheduled_date
                        else None,
                        "time": None,
                        "duration": a.duration_minutes,
                        "type": a.appointment_type,
                        "status": a.status,
                        "reason": a.notes,
                        "location": None,
                        "instructions": None,
                        "reminderSent": False,
                    }
                )
        except Exception:
            items = APPOINTMENTS_DATA
        return {"success": True, "data": items, "total": len(items)}
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error fetching appointments: {str(e)}"
        )


@router.get("/appointments/recent")
async def get_recent_appointments(
    request: Request,
    current_user: str = Depends(get_current_user_dev_optional),
    db: Session = Depends(get_db),
):
    """Tab-specific summary for appointments"""
    try:
        resp = await get_appointments(request, current_user, db)
        data = resp.get("data") if isinstance(resp, dict) else []
        return {"success": True, "data": (data or _EMPTY_FALLBACK)[:5]}
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error fetching recent appointments: {str(e)}"
        )


@router.get("/test-results")
async def get_test_results(
    request: Request,
    current_user: str = Depends(get_current_user_dev_optional),
    db: Session = Depends(get_db),
):
    try:
        items = []
        try:
            orm_results = db.query(LabResultModel).limit(200).all()
            for r in orm_results:
                items.append(
                    {
                        "id": r.id,
                        "patientId": r.patient_id,
                        "testName": r.test_name,
                        "testDate": r.ordered_date.isoformat()
                        if r.ordered_date
                        else None,
                        "resultDate": r.result_date.isoformat()
                        if r.result_date
                        else None,
                        "category": r.test_category,
                        "results": [],
                        "status": "completed" if r.result_date else "ordered",
                        "orderedBy": r.ordered_by,
                        "lab": r.lab_name,
                    }
                )
        except Exception:
            items = _EMPTY_FALLBACK
        return {"success": True, "data": items, "total": len(items)}
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error fetching test results: {str(e)}"
        )


@router.get("/test-results/recent")
async def get_recent_test_results(
    request: Request,
    current_user: str = Depends(get_current_user_dev_optional),
    db: Session = Depends(get_db),
):
    """Tab-specific summary for test results"""
    try:
        resp = await get_test_results(request, current_user, db)
        data = resp.get("data") if isinstance(resp, dict) else []
        return {"success": True, "data": (data or _EMPTY_FALLBACK)[:5]}
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error fetching recent test results: {str(e)}"
        )


@router.get("/medications")
async def get_medications(
    request: Request,
    current_user: str = Depends(get_current_user_dev_optional),
    db: Session = Depends(get_db),
):
    try:
        items = []
        try:
            orm_rx = db.query(PrescriptionModel).limit(200).all()
            for rx in orm_rx:
                items.append(
                    {
                        "id": rx.id,
                        "name": rx.medication_name,
                        "dosage": rx.dosage,
                        "frequency": rx.frequency,
                        "route": None,
                        "startDate": rx.start_date.isoformat()
                        if rx.start_date
                        else None,
                        "prescribedBy": rx.prescribed_by,
                        "pharmacy": None,
                        "refillsRemaining": rx.refills_remaining,
                        "status": rx.status,
                        "notes": rx.notes,
                    }
                )
        except Exception:
            items = _EMPTY_FALLBACK
        return {"success": True, "data": items, "total": len(items)}
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error fetching medications: {str(e)}"
        )


@router.post("/medications/refill")
async def request_refill(
    request: Request,
    medication_id: str,
    current_user: str = Depends(get_current_user_dev_optional),
):
    try:
        # In a real system, create a refill request record
        return {"success": True, "message": f"Refill requested for {medication_id}"}
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error requesting refill: {str(e)}"
        )


@router.get("/messages")
async def get_messages(
    request: Request, current_user: str = Depends(get_current_user_dev_optional)
):
    try:
        return {"success": True, "data": MESSAGES_DATA, "total": len(MESSAGES_DATA)}
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error fetching messages: {str(e)}"
        )


@router.post("/messages")
async def create_message(
    message: Dict[str, Any],
    request: Request,
    current_user: str = Depends(get_current_user_dev_optional),
):
    try:
        new_msg = {
            "id": f"MSG{len(MESSAGES_DATA) + 1:03d}",
            "subject": message.get("subject", "Message"),
            "content": message.get("content", ""),
            "timestamp": datetime.utcnow().isoformat(),
            "status": "unread",
        }
        MESSAGES_DATA.insert(0, new_msg)
        return {"success": True, "data": new_msg}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating message: {str(e)}")


@router.get("/forms")
async def get_forms(
    request: Request, current_user: str = Depends(get_current_user_dev_optional)
):
    try:
        return {"success": True, "data": FORMS_DATA, "total": len(FORMS_DATA)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching forms: {str(e)}")


@router.post("/forms/submit")
async def submit_form(
    submission: Dict[str, Any],
    request: Request,
    current_user: str = Depends(get_current_user_dev_optional),
):
    try:
        submission_id = f"FS{len(FORM_SUBMISSIONS) + 1:04d}"
        payload = {
            "id": submission_id,
            "form_id": submission.get("form_id"),
            "answers": submission.get("answers", {}),
            "submitted_at": datetime.utcnow().isoformat(),
        }
        FORM_SUBMISSIONS.append(payload)
        return {"success": True, "data": payload}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error submitting form: {str(e)}")


@router.post("/appointments")
async def create_appointment(
    appointment: Dict[str, Any],
    request: Request,
    current_user: str = Depends(get_current_user_dev_optional),
):
    try:
        new_id = f"A{len(APPOINTMENTS_DATA) + 1:03d}"
        appt = {
            "id": new_id,
            "patientId": appointment.get("patientId", "1"),
            "providerId": appointment.get("providerId", "PR1"),
            "date": appointment.get("date"),
            "time": appointment.get("time"),
            "duration": appointment.get("duration", 30),
            "type": appointment.get("type", "checkup"),
            "status": appointment.get("status", "scheduled"),
            "reason": appointment.get("reason", "Appointment"),
            "location": appointment.get("location", "Main Office"),
            "instructions": appointment.get("instructions", ""),
            "reminderSent": False,
        }
        APPOINTMENTS_DATA.append(appt)
        return {"success": True, "data": appt}
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error creating appointment: {str(e)}"
        )


@router.put("/appointments/{appointment_id}")
async def update_appointment(
    appointment_id: str,
    updates: Dict[str, Any],
    request: Request,
    current_user: str = Depends(get_current_user_dev_optional),
):
    try:
        appt = next((a for a in APPOINTMENTS_DATA if a["id"] == appointment_id), None)
        if not appt:
            raise HTTPException(status_code=404, detail="Appointment not found")
        appt.update({k: v for k, v in updates.items() if v is not None})
        return {"success": True, "data": appt}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error updating appointment: {str(e)}"
        )


@router.delete("/appointments/{appointment_id}")
async def delete_appointment(
    appointment_id: str,
    request: Request,
    current_user: str = Depends(get_current_user_dev_optional),
):
    try:
        index = next(
            (i for i, a in enumerate(APPOINTMENTS_DATA) if a["id"] == appointment_id),
            None,
        )
        if index is None:
            raise HTTPException(status_code=404, detail="Appointment not found")
        removed = APPOINTMENTS_DATA.pop(index)
        return {"success": True, "data": removed}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error deleting appointment: {str(e)}"
        )


@router.get("/dashboard")
async def get_healthcare_dashboard(
    current_user: str = Depends(get_current_user_dev_optional),
):
    """Get healthcare dashboard data"""
    try:
        return {
            "success": True,
            "data": {
                "total_patients": len(PATIENTS_DATA),
                "active_patients": len(
                    [p for p in PATIENTS_DATA if p["status"] == "active"]
                ),
                "system_health": "excellent",
                "last_update": datetime.utcnow().isoformat(),
            },
            "timestamp": datetime.utcnow().isoformat(),
        }
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error fetching dashboard: {str(e)}"
        )


@router.get("/analytics")
async def get_healthcare_analytics(
    current_user: str = Depends(get_current_user_dev_optional),
):
    """Get analytics for healthcare module"""
    try:
        data = {
            "totals": {
                "patients": len(PATIENTS_DATA),
                "appointments": len(APPOINTMENTS_DATA),
                "test_results": len(TEST_RESULTS_DATA),
                "medications": len(MEDICATIONS_DATA),
            },
            "trends": {
                "appointments_daily": [3, 5, 4, 6, 8, 7, 5],
                "lab_results_daily": [1, 2, 2, 3, 4, 2, 1],
            },
            "status": {
                "appointments": {
                    "scheduled": len(
                        [a for a in APPOINTMENTS_DATA if a.get("status") == "scheduled"]
                    ),
                    "completed": len(
                        [a for a in APPOINTMENTS_DATA if a.get("status") == "completed"]
                    ),
                    "cancelled": len(
                        [a for a in APPOINTMENTS_DATA if a.get("status") == "cancelled"]
                    ),
                }
            },
        }
        return {"success": True, "data": data}
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error fetching analytics: {str(e)}"
        )


@router.get("/surveillance")
async def get_healthcare_surveillance(
    current_user: str = Depends(get_current_user_dev_optional),
):
    """Get healthcare surveillance data"""
    try:
        # Mock healthcare surveillance data
        surveillance_data = {
            "patient_monitoring": {
                "total_patients_monitored": 15,
                "patients_with_alerts": 3,
                "fall_detections_today": 1,
                "unauthorized_access_attempts": 0,
            },
            "camera_coverage": {
                "patient_rooms": 12,
                "hallways": 8,
                "entrances": 4,
                "common_areas": 6,
            },
            "recent_incidents": [
                {
                    "id": "inc_001",
                    "type": "fall_detection",
                    "patient_id": "P001",
                    "patient_name": "John Smith",
                    "location": "Room 101",
                    "timestamp": "2024-01-27T10:15:00",
                    "severity": "high",
                    "status": "responded",
                    "response_time_minutes": 2,
                },
                {
                    "id": "inc_002",
                    "type": "motion_detection",
                    "patient_id": "P002",
                    "patient_name": "Jane Doe",
                    "location": "Room 102",
                    "timestamp": "2024-01-27T09:45:00",
                    "severity": "medium",
                    "status": "acknowledged",
                    "response_time_minutes": 5,
                },
            ],
            "compliance_status": {
                "hipaa_compliant": True,
                "last_audit": "2024-01-15",
                "audit_score": 98,
                "privacy_incidents": 0,
            },
        }

        return {
            "success": True,
            "data": surveillance_data,
            "timestamp": datetime.utcnow().isoformat(),
        }
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error fetching surveillance data: {str(e)}"
        )
