"""
HIPAA Compliance Service
Handles HIPAA compliance requirements including audit logging, data encryption, and violation detection
"""

import hashlib
import hmac
import json
import logging
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
from enum import Enum
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
import base64
import os

logger = logging.getLogger(__name__)

class HIPAAViolationType(Enum):
    """Types of HIPAA violations"""
    UNAUTHORIZED_ACCESS = "unauthorized_access"
    DATA_BREACH = "data_breach"
    IMPROPER_DISPOSAL = "improper_disposal"
    LACK_OF_ENCRYPTION = "lack_of_encryption"
    MISSING_AUDIT_LOG = "missing_audit_log"
    IMPROPER_SHARING = "improper_sharing"
    PHI_EXPOSURE = "phi_exposure"
    ACCESS_CONTROL_VIOLATION = "access_control_violation"

class HIPAAComplianceService:
    """HIPAA compliance service with encryption, audit logging, and violation detection"""
    
    def __init__(self):
        self.encryption_key = self._generate_encryption_key()
        self.cipher_suite = Fernet(self.encryption_key)
        self.audit_log: List[Dict[str, Any]] = []
        self.violations: List[Dict[str, Any]] = []
        self.access_controls: Dict[str, List[str]] = {}
        self.phi_fields = [
            "patient_name", "patient_id", "ssn", "date_of_birth", "address",
            "phone", "email", "medical_record_number", "diagnosis", "treatment",
            "medication", "test_results", "insurance_info"
        ]
        
    def _generate_encryption_key(self) -> bytes:
        """Generate encryption key for PHI data"""
        # In production, this should be stored securely and not generated each time
        salt = os.urandom(16)
        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA256(),
            length=32,
            salt=salt,
            iterations=100000,
        )
        key = base64.urlsafe_b64encode(kdf.derive(b"hipaa-secret-key"))
        return key
    
    def encrypt_phi(self, data: str) -> str:
        """Encrypt PHI data"""
        try:
            encrypted_data = self.cipher_suite.encrypt(data.encode())
            return base64.urlsafe_b64encode(encrypted_data).decode()
        except Exception as e:
            logger.error(f"Error encrypting PHI data: {e}")
            raise
    
    def decrypt_phi(self, encrypted_data: str) -> str:
        """Decrypt PHI data"""
        try:
            decoded_data = base64.urlsafe_b64decode(encrypted_data.encode())
            decrypted_data = self.cipher_suite.decrypt(decoded_data)
            return decrypted_data.decode()
        except Exception as e:
            logger.error(f"Error decrypting PHI data: {e}")
            raise
    
    def log_audit_event(self, user_id: str, action: str, resource: str, 
                       details: Dict[str, Any], ip_address: str, 
                       phi_accessed: bool = False) -> Dict[str, Any]:
        """Log audit event for HIPAA compliance"""
        audit_event = {
            "id": f"AUDIT_{len(self.audit_log) + 1:06d}",
            "user_id": user_id,
            "action": action,
            "resource": resource,
            "details": details,
            "ip_address": ip_address,
            "phi_accessed": phi_accessed,
            "timestamp": datetime.now().isoformat(),
            "session_id": self._generate_session_id(user_id),
            "compliance_status": "compliant" if not phi_accessed else "phi_access"
        }
        
        self.audit_log.append(audit_event)
        
        # Check for potential violations
        self._check_for_violations(audit_event)
        
        logger.info(f"Audit event logged: {action} by {user_id} on {resource}")
        return audit_event
    
    def _generate_session_id(self, user_id: str) -> str:
        """Generate unique session ID"""
        timestamp = datetime.now().isoformat()
        return hashlib.sha256(f"{user_id}_{timestamp}".encode()).hexdigest()[:16]
    
    def _check_for_violations(self, audit_event: Dict[str, Any]):
        """Check audit event for potential HIPAA violations"""
        violations = []
        
        # Check for unauthorized access
        if audit_event["phi_accessed"] and not self._has_authorization(
            audit_event["user_id"], audit_event["resource"]
        ):
            violations.append({
                "type": HIPAAViolationType.UNAUTHORIZED_ACCESS,
                "severity": "high",
                "description": f"Unauthorized access to PHI by {audit_event['user_id']}"
            })
        
        # Check for suspicious activity patterns
        if self._detect_suspicious_activity(audit_event["user_id"]):
            violations.append({
                "type": HIPAAViolationType.ACCESS_CONTROL_VIOLATION,
                "severity": "medium",
                "description": f"Suspicious activity detected for user {audit_event['user_id']}"
            })
        
        # Add violations to the list
        for violation in violations:
            self._record_violation(violation, audit_event)
    
    def _has_authorization(self, user_id: str, resource: str) -> bool:
        """Check if user has authorization for the resource"""
        if user_id not in self.access_controls:
            return False
        
        return resource in self.access_controls[user_id]
    
    def _detect_suspicious_activity(self, user_id: str) -> bool:
        """Detect suspicious activity patterns"""
        recent_events = [
            event for event in self.audit_log[-100:]  # Check last 100 events
            if event["user_id"] == user_id and 
            event["timestamp"] > (datetime.now() - timedelta(hours=1)).isoformat()
        ]
        
        # Flag if more than 50 PHI accesses in the last hour
        phi_accesses = [event for event in recent_events if event["phi_accessed"]]
        if len(phi_accesses) > 50:
            return True
        
        # Flag if accessing multiple different patient records rapidly
        unique_resources = set(event["resource"] for event in phi_accesses)
        if len(unique_resources) > 20:
            return True
        
        return False
    
    def _record_violation(self, violation: Dict[str, Any], audit_event: Dict[str, Any]):
        """Record a HIPAA violation"""
        violation_record = {
            "id": f"VIOLATION_{len(self.violations) + 1:06d}",
            "violation_type": violation["type"].value,
            "severity": violation["severity"],
            "description": violation["description"],
            "user_id": audit_event["user_id"],
            "timestamp": datetime.now().isoformat(),
            "audit_event_id": audit_event["id"],
            "status": "open",
            "mitigation_required": True
        }
        
        self.violations.append(violation_record)
        logger.warning(f"HIPAA violation recorded: {violation['type'].value}")
    
    def scan_data_for_phi(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Scan data for potential PHI fields"""
        phi_found = {}
        
        for field in self.phi_fields:
            if field in data:
                phi_found[field] = True
                # Encrypt the PHI data
                if isinstance(data[field], str):
                    data[field] = self.encrypt_phi(data[field])
        
        return {
            "phi_detected": len(phi_found) > 0,
            "phi_fields": list(phi_found.keys()),
            "encrypted_data": data
        }
    
    def get_compliance_report(self, start_date: Optional[str] = None, 
                            end_date: Optional[str] = None) -> Dict[str, Any]:
        """Generate HIPAA compliance report"""
        if not start_date:
            start_date = (datetime.now() - timedelta(days=30)).isoformat()
        if not end_date:
            end_date = datetime.now().isoformat()
        
        # Filter events by date range
        filtered_events = [
            event for event in self.audit_log
            if start_date <= event["timestamp"] <= end_date
        ]
        
        # Filter violations by date range
        filtered_violations = [
            violation for violation in self.violations
            if start_date <= violation["timestamp"] <= end_date
        ]
        
        total_events = len(filtered_events)
        phi_events = len([event for event in filtered_events if event["phi_accessed"]])
        total_violations = len(filtered_violations)
        open_violations = len([v for v in filtered_violations if v["status"] == "open"])
        
        return {
            "report_period": {
                "start_date": start_date,
                "end_date": end_date
            },
            "summary": {
                "total_audit_events": total_events,
                "phi_access_events": phi_events,
                "total_violations": total_violations,
                "open_violations": open_violations,
                "compliance_rate": ((total_events - total_violations) / total_events * 100) if total_events > 0 else 100
            },
            "violations_by_type": self._group_violations_by_type(filtered_violations),
            "top_users_by_phi_access": self._get_top_users_by_phi_access(filtered_events),
            "recommendations": self._generate_recommendations(filtered_violations)
        }
    
    def _group_violations_by_type(self, violations: List[Dict[str, Any]]) -> Dict[str, int]:
        """Group violations by type"""
        grouped = {}
        for violation in violations:
            violation_type = violation["violation_type"]
            grouped[violation_type] = grouped.get(violation_type, 0) + 1
        return grouped
    
    def _get_top_users_by_phi_access(self, events: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Get top users by PHI access count"""
        user_counts = {}
        for event in events:
            if event["phi_accessed"]:
                user_id = event["user_id"]
                user_counts[user_id] = user_counts.get(user_id, 0) + 1
        
        # Sort by count and return top 10
        sorted_users = sorted(user_counts.items(), key=lambda x: x[1], reverse=True)
        return [
            {"user_id": user_id, "phi_access_count": count}
            for user_id, count in sorted_users[:10]
        ]
    
    def _generate_recommendations(self, violations: List[Dict[str, Any]]) -> List[str]:
        """Generate compliance recommendations based on violations"""
        recommendations = []
        
        violation_types = [v["violation_type"] for v in violations]
        
        if HIPAAViolationType.UNAUTHORIZED_ACCESS.value in violation_types:
            recommendations.append("Implement stricter access controls and role-based permissions")
        
        if HIPAAViolationType.LACK_OF_ENCRYPTION.value in violation_types:
            recommendations.append("Ensure all PHI data is encrypted at rest and in transit")
        
        if HIPAAViolationType.ACCESS_CONTROL_VIOLATION.value in violation_types:
            recommendations.append("Review and update user access policies and conduct security training")
        
        if len(violations) > 10:
            recommendations.append("Conduct comprehensive security audit and update compliance procedures")
        
        return recommendations
    
    def set_user_permissions(self, user_id: str, permissions: List[str]):
        """Set user permissions for HIPAA compliance"""
        self.access_controls[user_id] = permissions
        logger.info(f"Set permissions for user {user_id}: {permissions}")
    
    def remove_user_permissions(self, user_id: str):
        """Remove user permissions"""
        if user_id in self.access_controls:
            del self.access_controls[user_id]
            logger.info(f"Removed permissions for user {user_id}")
    
    def get_user_permissions(self, user_id: str) -> List[str]:
        """Get user permissions"""
        return self.access_controls.get(user_id, [])
    
    def mark_violation_resolved(self, violation_id: str, resolution_notes: str):
        """Mark a violation as resolved"""
        for violation in self.violations:
            if violation["id"] == violation_id:
                violation["status"] = "resolved"
                violation["resolution_notes"] = resolution_notes
                violation["resolved_at"] = datetime.now().isoformat()
                logger.info(f"Violation {violation_id} marked as resolved")
                break

# Global instance
hipaa_service = HIPAAComplianceService()

class HIPAAComplianceManager:
    """Manager class for HIPAA compliance operations"""
    
    @staticmethod
    def ensure_phi_encryption(data: Dict[str, Any]) -> Dict[str, Any]:
        """Ensure PHI data is encrypted"""
        return hipaa_service.scan_data_for_phi(data)
    
    @staticmethod
    def log_phi_access(user_id: str, action: str, resource: str, 
                      details: Dict[str, Any], ip_address: str) -> Dict[str, Any]:
        """Log PHI access for compliance"""
        return hipaa_service.log_audit_event(
            user_id, action, resource, details, ip_address, phi_accessed=True
        )
    
    @staticmethod
    def log_regular_access(user_id: str, action: str, resource: str, 
                          details: Dict[str, Any], ip_address: str) -> Dict[str, Any]:
        """Log regular access (non-PHI)"""
        return hipaa_service.log_audit_event(
            user_id, action, resource, details, ip_address, phi_accessed=False
        )
    
    @staticmethod
    def get_compliance_status() -> Dict[str, Any]:
        """Get current HIPAA compliance status"""
        return hipaa_service.get_compliance_report()
    
    @staticmethod
    def check_user_authorization(user_id: str, resource: str) -> bool:
        """Check if user is authorized for the resource"""
        return hipaa_service._has_authorization(user_id, resource)
    
    @staticmethod
    def grant_phi_access(user_id: str, resources: List[str]):
        """Grant PHI access to user"""
        hipaa_service.set_user_permissions(user_id, resources)
    
    @staticmethod
    def revoke_phi_access(user_id: str):
        """Revoke PHI access from user"""
        hipaa_service.remove_user_permissions(user_id)
    
    @staticmethod
    def get_open_violations() -> List[Dict[str, Any]]:
        """Get all open violations"""
        return [v for v in hipaa_service.violations if v["status"] == "open"]
    
    @staticmethod
    def resolve_violation(violation_id: str, resolution_notes: str):
        """Resolve a violation"""
        hipaa_service.mark_violation_resolved(violation_id, resolution_notes) 