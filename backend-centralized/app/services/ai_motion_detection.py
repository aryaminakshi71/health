"""
AI Motion Detection Service
Enhanced motion detection with object classification using computer vision
"""

import logging
from typing import Dict, List, Tuple, Optional, Any
from dataclasses import dataclass
from datetime import datetime
import asyncio
from enum import Enum
import json

logger = logging.getLogger(__name__)

class ObjectType(Enum):
    """Types of objects that can be detected"""
    PERSON = "person"
    VEHICLE = "vehicle"
    ANIMAL = "animal"
    WEAPON = "weapon"
    PACKAGE = "package"
    UNKNOWN = "unknown"

class MotionType(Enum):
    """Types of motion events"""
    MOVEMENT = "movement"
    LOITERING = "loitering"
    INTRUSION = "intrusion"
    FALL = "fall"
    FIGHT = "fight"
    THEFT = "theft"
    NORMAL = "normal"

@dataclass
class DetectedObject:
    """Information about a detected object"""
    id: str
    type: ObjectType
    confidence: float
    bbox: Tuple[int, int, int, int]  # x, y, width, height
    center: Tuple[int, int]
    area: int
    timestamp: datetime
    track_id: Optional[str] = None
    velocity: Optional[Tuple[float, float]] = None

@dataclass
class MotionEvent:
    """Motion detection event"""
    id: str
    camera_id: str
    event_type: MotionType
    objects: List[DetectedObject]
    severity: str  # low, medium, high, critical
    timestamp: datetime
    duration: float
    location: str
    confidence: float
    metadata: Dict[str, Any]

class AIMotionDetector:
    """AI-powered motion detection with object classification"""
    
    def __init__(self):
        # Motion detection parameters
        self.motion_threshold = 25
        self.min_area = 500
        self.max_area = 50000
        
        # Object tracking
        self.trackers = {}
        self.next_track_id = 1
        
        # Event history
        self.event_history = []
        self.max_history = 1000
        
        # Configuration
        self.enabled = True
        self.sensitivity = 0.7
        
        logger.info("AI Motion Detector initialized successfully")
        
    async def detect_motion(self, frame_data: bytes, camera_id: str) -> Optional[MotionEvent]:
        """Detect motion and classify objects in a frame"""
        if not self.enabled:
            return None
            
        try:
            # For demo purposes, simulate motion detection
            # In production, this would process actual video frames with OpenCV
            
            # Simulate detected objects
            detected_objects = [
                DetectedObject(
                    id="obj_1",
                    type=ObjectType.PERSON,
                    confidence=0.85,
                    bbox=(100, 100, 200, 300),
                    center=(200, 250),
                    area=20000,
                    timestamp=datetime.now()
                )
            ]
            
            # Create motion event
            event = await self._create_motion_event(camera_id, detected_objects)
            self.event_history.append(event)
            
            # Keep only recent history
            if len(self.event_history) > self.max_history:
                self.event_history.pop(0)
            
            return event
            
        except Exception as e:
            logger.error(f"Error in motion detection: {str(e)}")
            return None
    
    async def _classify_object(self, roi_data: bytes) -> Tuple[ObjectType, float]:
        """Classify object in region of interest"""
        try:
            # For demo purposes, return simulated classification
            # In production, this would use ML models for classification
            
            import random
            object_types = [ObjectType.PERSON, ObjectType.VEHICLE, ObjectType.ANIMAL, ObjectType.PACKAGE]
            selected_type = random.choice(object_types)
            confidence = random.uniform(0.6, 0.95)
            
            return selected_type, confidence
                
        except Exception as e:
            logger.error(f"Error in object classification: {str(e)}")
            return ObjectType.UNKNOWN, 0.0
    
    async def _create_motion_event(self, camera_id: str, objects: List[DetectedObject]) -> MotionEvent:
        """Create a motion event from detected objects"""
        # Determine event type based on objects and behavior
        event_type = MotionType.MOVEMENT
        severity = "low"
        
        # Check for specific patterns
        people = [obj for obj in objects if obj.type == ObjectType.PERSON]
        vehicles = [obj for obj in objects if obj.type == ObjectType.VEHICLE]
        
        if len(people) > 3:
            event_type = MotionType.LOITERING
            severity = "medium"
        elif len(people) == 1 and len(vehicles) == 0:
            event_type = MotionType.MOVEMENT
            severity = "low"
        elif len(vehicles) > 0:
            event_type = MotionType.MOVEMENT
            severity = "medium"
        
        # Calculate confidence based on object confidences
        avg_confidence = sum(obj.confidence for obj in objects) / len(objects)
        
        return MotionEvent(
            id=f"motion_{datetime.now().timestamp()}",
            camera_id=camera_id,
            event_type=event_type,
            objects=objects,
            severity=severity,
            timestamp=datetime.now(),
            duration=1.0,  # Default duration
            location="Unknown",
            confidence=avg_confidence,
            metadata={
                "object_count": len(objects),
                "people_count": len(people),
                "vehicles_count": len(vehicles),
                "total_area": sum(obj.area for obj in objects)
            }
        )
    
    async def analyze_behavior(self, events: List[MotionEvent]) -> Dict[str, Any]:
        """Analyze behavior patterns from motion events"""
        if not events:
            return {}
        
        analysis = {
            "total_events": len(events),
            "event_types": {},
            "severity_distribution": {},
            "time_distribution": {},
            "object_types": {},
            "anomalies": []
        }
        
        # Count event types
        for event in events:
            event_type = event.event_type.value
            analysis["event_types"][event_type] = analysis["event_types"].get(event_type, 0) + 1
            
            # Count severity levels
            severity = event.severity
            analysis["severity_distribution"][severity] = analysis["severity_distribution"].get(severity, 0) + 1
            
            # Count object types
            for obj in event.objects:
                obj_type = obj.type.value
                analysis["object_types"][obj_type] = analysis["object_types"].get(obj_type, 0) + 1
        
        # Detect anomalies
        analysis["anomalies"] = await self._detect_anomalies(events)
        
        return analysis
    
    async def _detect_anomalies(self, events: List[MotionEvent]) -> List[Dict[str, Any]]:
        """Detect anomalous behavior patterns"""
        anomalies = []
        
        # Check for unusual activity patterns
        recent_events = [e for e in events if (datetime.now() - e.timestamp).seconds < 3600]
        
        if len(recent_events) > 50:  # High activity
            anomalies.append({
                "type": "high_activity",
                "description": "Unusually high activity detected",
                "severity": "medium",
                "timestamp": datetime.now()
            })
        
        # Check for loitering
        loitering_events = [e for e in recent_events if e.event_type == MotionType.LOITERING]
        if len(loitering_events) > 5:
            anomalies.append({
                "type": "loitering",
                "description": "Multiple loitering events detected",
                "severity": "high",
                "timestamp": datetime.now()
            })
        
        return anomalies
    
    def get_statistics(self) -> Dict[str, Any]:
        """Get motion detection statistics"""
        if not self.event_history:
            return {
                "total_events": 0,
                "events_last_hour": 0,
                "detection_rate": 0.0,
                "average_confidence": 0.0,
                "enabled": self.enabled,
                "sensitivity": self.sensitivity
            }
        
        total_events = len(self.event_history)
        recent_events = [e for e in self.event_history if (datetime.now() - e.timestamp).seconds < 3600]
        
        return {
            "total_events": total_events,
            "events_last_hour": len(recent_events),
            "detection_rate": len(recent_events) / 3600 if recent_events else 0,
            "average_confidence": sum(e.confidence for e in recent_events) / len(recent_events) if recent_events else 0,
            "enabled": self.enabled,
            "sensitivity": self.sensitivity
        }
    
    def update_config(self, config: Dict[str, Any]):
        """Update detection configuration"""
        if "enabled" in config:
            self.enabled = config["enabled"]
        if "sensitivity" in config:
            self.sensitivity = max(0.1, min(1.0, config["sensitivity"]))
        if "motion_threshold" in config:
            self.motion_threshold = config["motion_threshold"]
        if "min_area" in config:
            self.min_area = config["min_area"]
        if "max_area" in config:
            self.max_area = config["max_area"]
        
        logger.info(f"AI Motion Detection config updated: {config}")

# Global instance
ai_motion_detector = AIMotionDetector() 