from fastapi import APIRouter, Depends, HTTPException
from typing import List, Dict, Any
from ...core.security import get_current_user_dev_optional, security_manager

router = APIRouter()

# Mock data for Autism Care
autism_care_data = {
    "dashboard": {
        "totalPatients": 45,
        "activeSessions": 12,
        "averageProgress": 78.5,
        "communicationImprovement": 82.3,
        "sensoryIntegration": 75.8,
        "behavioralStability": 89.2,
        "socialSkills": 71.4,
        "systemHealth": 99.6
    },
    "patients": [
        {
            "id": "P001",
            "name": "Alex Johnson",
            "age": 8,
            "diagnosis": "Autism Spectrum Disorder",
            "severity": "moderate",
            "communicationLevel": "limited",
            "sensorySensitivity": {
                "visual": 7,
                "auditory": 8,
                "tactile": 6,
                "olfactory": 5,
                "gustatory": 4
            },
            "behavioralPatterns": ["stimming", "routine-dependent", "sensory-seeking"],
            "progress": 75,
            "lastSession": "2024-01-20",
            "nextSession": "2024-01-22",
            "therapist": "Dr. Sarah Wilson",
            "status": "active"
        },
        {
            "id": "P002",
            "name": "Emma Davis",
            "age": 6,
            "diagnosis": "Asperger's Syndrome",
            "severity": "mild",
            "communicationLevel": "verbal",
            "sensorySensitivity": {
                "visual": 4,
                "auditory": 6,
                "tactile": 3,
                "olfactory": 7,
                "gustatory": 5
            },
            "behavioralPatterns": ["social-anxiety", "special-interests", "literal-thinking"],
            "progress": 85,
            "lastSession": "2024-01-19",
            "nextSession": "2024-01-23",
            "therapist": "Dr. Michael Chen",
            "status": "active"
        },
        {
            "id": "P003",
            "name": "Lucas Rodriguez",
            "age": 10,
            "diagnosis": "Autism Spectrum Disorder",
            "severity": "severe",
            "communicationLevel": "non-verbal",
            "sensorySensitivity": {
                "visual": 9,
                "auditory": 9,
                "tactile": 8,
                "olfactory": 7,
                "gustatory": 6
            },
            "behavioralPatterns": ["meltdowns", "sensory-overload", "communication-challenges"],
            "progress": 45,
            "lastSession": "2024-01-18",
            "nextSession": "2024-01-21",
            "therapist": "Dr. Sarah Wilson",
            "status": "active"
        }
    ],
    "sessions": [
        {
            "id": "S001",
            "patientId": "P001",
            "date": "2024-01-20",
            "duration": 45,
            "type": "communication",
            "therapist": "Dr. Sarah Wilson",
            "goals": ["Improve eye contact", "Increase verbal responses"],
            "achievements": ["Maintained eye contact for 10 seconds", "Used 5 new words"],
            "challenges": ["Sensory distractions", "Short attention span"],
            "notes": "Alex showed good progress with visual supports. Continue with picture cards.",
            "rating": 8,
            "status": "completed"
        },
        {
            "id": "S002",
            "patientId": "P002",
            "date": "2024-01-19",
            "duration": 60,
            "type": "social",
            "therapist": "Dr. Michael Chen",
            "goals": ["Improve social interactions", "Practice turn-taking"],
            "achievements": ["Initiated conversation", "Shared toys appropriately"],
            "challenges": ["Anxiety in group settings", "Literal interpretation"],
            "notes": "Emma responded well to social stories. Continue with peer interaction practice.",
            "rating": 9,
            "status": "completed"
        },
        {
            "id": "S003",
            "patientId": "P003",
            "date": "2024-01-18",
            "duration": 30,
            "type": "sensory",
            "therapist": "Dr. Sarah Wilson",
            "goals": ["Reduce sensory overload", "Improve tolerance"],
            "achievements": ["Used noise-canceling headphones", "Explored different textures"],
            "challenges": ["Severe sensory sensitivity", "Communication barriers"],
            "notes": "Lucas showed improvement with weighted blanket. Continue sensory integration.",
            "rating": 6,
            "status": "completed"
        }
    ],
    "sensory_activities": [
        {
            "id": "SA001",
            "name": "Visual Tracking Exercise",
            "type": "visual",
            "description": "Follow moving objects with eyes to improve visual tracking",
            "duration": 15,
            "difficulty": "easy",
            "equipment": ["light wand", "mirror", "colorful objects"],
            "benefits": ["Improves eye coordination", "Reduces visual sensitivity"],
            "contraindications": ["Epilepsy", "Severe visual impairment"],
            "successRate": 85
        },
        {
            "id": "SA002",
            "name": "Auditory Discrimination",
            "type": "auditory",
            "description": "Identify and differentiate between various sounds",
            "duration": 20,
            "difficulty": "medium",
            "equipment": ["sound cards", "noise-canceling headphones", "musical instruments"],
            "benefits": ["Improves auditory processing", "Reduces sound sensitivity"],
            "contraindications": ["Severe hearing loss", "Auditory processing disorder"],
            "successRate": 78
        },
        {
            "id": "SA003",
            "name": "Tactile Exploration",
            "type": "tactile",
            "description": "Explore different textures and materials",
            "duration": 25,
            "difficulty": "medium",
            "equipment": ["texture boards", "sensory bins", "fabric samples"],
            "benefits": ["Improves tactile tolerance", "Enhances sensory integration"],
            "contraindications": ["Severe tactile defensiveness", "Skin conditions"],
            "successRate": 82
        }
    ],
    "communication_tools": [
        {
            "id": "CT001",
            "name": "Picture Exchange Communication System (PECS)",
            "type": "pictogram",
            "description": "Visual communication system using pictures and symbols",
            "features": ["Picture cards", "Communication book", "Sentence strips"],
            "compatibility": ["All ages", "Non-verbal individuals", "Visual learners"],
            "effectiveness": 90,
            "usageCount": 1250
        },
        {
            "id": "CT002",
            "name": "Speech-Generating Device",
            "type": "technology",
            "description": "Electronic device that produces speech from text or symbols",
            "features": ["Voice output", "Customizable vocabulary", "Touch screen"],
            "compatibility": ["Non-verbal individuals", "Motor difficulties", "Technology users"],
            "effectiveness": 85,
            "usageCount": 890
        },
        {
            "id": "CT003",
            "name": "Social Stories",
            "type": "social",
            "description": "Personalized stories to explain social situations",
            "features": ["Customizable content", "Visual supports", "Step-by-step guidance"],
            "compatibility": ["All ages", "Social challenges", "Routine-dependent"],
            "effectiveness": 88,
            "usageCount": 2100
        }
    ]
}

@router.get("/dashboard")
async def get_autism_care_dashboard(user: str = Depends(get_current_user_dev_optional)):
    """Get autism care dashboard data"""
    security_manager.log_audit_event(user, "view", "autism_care_dashboard", {"endpoint": "/dashboard"})
    return autism_care_data["dashboard"]

@router.get("/patients")
async def get_patients(user: str = Depends(get_current_user_dev_optional)):
    """Get all patients"""
    security_manager.log_audit_event(user, "view", "autism_care_patients", {"endpoint": "/patients"})
    return {"patients": autism_care_data["patients"]}

@router.get("/patients/{patient_id}")
async def get_patient(patient_id: str, user: str = Depends(get_current_user_dev_optional)):
    """Get specific patient details"""
    security_manager.log_audit_event(user, "view", f"autism_care_patient_{patient_id}", {"patient_id": patient_id})
    patient = next((p for p in autism_care_data["patients"] if p["id"] == patient_id), None)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return patient

@router.get("/sessions")
async def get_sessions(user: str = Depends(get_current_user_dev_optional)):
    """Get all therapy sessions"""
    security_manager.log_audit_event(user, "view", "autism_care_sessions", {"endpoint": "/sessions"})
    return {"sessions": autism_care_data["sessions"]}

@router.get("/sessions/{session_id}")
async def get_session(session_id: str, user: str = Depends(get_current_user_dev_optional)):
    """Get specific session details"""
    security_manager.log_audit_event(user, "view", f"autism_care_session_{session_id}", {"session_id": session_id})
    session = next((s for s in autism_care_data["sessions"] if s["id"] == session_id), None)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session

@router.get("/sensory-activities")
async def get_sensory_activities(user: str = Depends(get_current_user_dev_optional)):
    """Get all sensory activities"""
    security_manager.log_audit_event(user, "view", "autism_care_sensory_activities", {"endpoint": "/sensory-activities"})
    return {"activities": autism_care_data["sensory_activities"]}

@router.get("/sensory-activities/{activity_id}")
async def get_sensory_activity(activity_id: str, user: str = Depends(get_current_user_dev_optional)):
    """Get specific sensory activity details"""
    security_manager.log_audit_event(user, "view", f"autism_care_sensory_activity_{activity_id}", {"activity_id": activity_id})
    activity = next((a for a in autism_care_data["sensory_activities"] if a["id"] == activity_id), None)
    if not activity:
        raise HTTPException(status_code=404, detail="Sensory activity not found")
    return activity

@router.get("/communication-tools")
async def get_communication_tools(user: str = Depends(get_current_user_dev_optional)):
    """Get all communication tools"""
    security_manager.log_audit_event(user, "view", "autism_care_communication_tools", {"endpoint": "/communication-tools"})
    return {"tools": autism_care_data["communication_tools"]}

@router.get("/communication-tools/{tool_id}")
async def get_communication_tool(tool_id: str, user: str = Depends(get_current_user_dev_optional)):
    """Get specific communication tool details"""
    security_manager.log_audit_event(user, "view", f"autism_care_communication_tool_{tool_id}", {"tool_id": tool_id})
    tool = next((t for t in autism_care_data["communication_tools"] if t["id"] == tool_id), None)
    if not tool:
        raise HTTPException(status_code=404, detail="Communication tool not found")
    return tool

@router.get("/analytics/progress")
async def get_progress_analytics(user: str = Depends(get_current_user_dev_optional)):
    """Get progress analytics data"""
    security_manager.log_audit_event(user, "view", "autism_care_progress_analytics", {"endpoint": "/analytics/progress"})
    return {
        "communicationImprovement": 15.2,
        "sensoryIntegration": 12.8,
        "behavioralStability": 18.5,
        "socialSkills": 9.7,
        "overallProgress": 14.1
    }

@router.get("/analytics/sessions")
async def get_session_analytics(user: str = Depends(get_current_user_dev_optional)):
    """Get session analytics data"""
    security_manager.log_audit_event(user, "view", "autism_care_session_analytics", {"endpoint": "/analytics/sessions"})
    return {
        "averageDuration": 45,
        "successRate": 87.3,
        "patientSatisfaction": 94.2,
        "therapistEfficiency": 91.8,
        "totalSessions": 156
    } 