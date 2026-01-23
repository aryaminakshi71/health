"""
Security Module for HIPAA/GDPR Compliance
Handles encryption, audit trails, access control, and compliance features
"""

import hashlib
import hmac
import os
import json
import logging
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, Optional, List
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
import base64
import jwt
from fastapi import HTTPException, Depends, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from passlib.context import CryptContext
from app.core.database import get_db
from app.models.user import User


def utc_now() -> datetime:
    """Return current UTC time with timezone info (replaces deprecated datetime.utcnow())"""
    return datetime.now(timezone.utc)


# Configure logging for audit trails
audit_logger = logging.getLogger("audit")
audit_logger.setLevel(logging.INFO)

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT Configuration
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-this")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = utc_now() + expires_delta
    else:
        expire = utc_now() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against hash"""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Hash password"""
    return pwd_context.hash(password)


class SecurityManager:
    """Centralized security management for HIPAA/GDPR compliance"""

    def __init__(self):
        self.secret_key = os.getenv("SECRET_KEY", Fernet.generate_key())
        self.cipher_suite = Fernet(self.secret_key)
        self.audit_events = []

    def encrypt_sensitive_data(self, data: str) -> str:
        """Encrypt sensitive data (PHI/PII)"""
        try:
            encrypted_data = self.cipher_suite.encrypt(data.encode())
            return base64.b64encode(encrypted_data).decode()
        except Exception as e:
            audit_logger.error(f"Encryption failed: {str(e)}")
            raise HTTPException(status_code=500, detail="Data encryption failed")

    def decrypt_sensitive_data(self, encrypted_data: str) -> str:
        """Decrypt sensitive data (PHI/PII)"""
        try:
            decoded_data = base64.b64decode(encrypted_data.encode())
            decrypted_data = self.cipher_suite.decrypt(decoded_data)
            return decrypted_data.decode()
        except Exception as e:
            audit_logger.error(f"Decryption failed: {str(e)}")
            raise HTTPException(status_code=500, detail="Data decryption failed")

    def log_audit_event(
        self,
        user_id: str,
        action: str,
        resource: str,
        details: Dict[str, Any],
        ip_address: str = None,
    ):
        """Log audit event for compliance"""
        audit_event = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "user_id": user_id,
            "action": action,
            "resource": resource,
            "details": details,
            "ip_address": ip_address,
            "session_id": self._generate_session_id(),
        }

        audit_logger.info(f"AUDIT: {json.dumps(audit_event)}")
        self.audit_events.append(audit_event)

    async def log_access(
        self, user: str, action: str, resource: str, ip_address: str = None
    ):
        """Log access event for mobile surveillance"""
        audit_event = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "user_id": user,
            "action": action,
            "resource": resource,
            "ip_address": ip_address,
            "session_id": self._generate_session_id(),
            "type": "access_log",
        }

        audit_logger.info(f"ACCESS: {json.dumps(audit_event)}")
        self.audit_events.append(audit_event)

    def _generate_session_id(self) -> str:
        """Generate unique session ID"""
        return hashlib.sha256(os.urandom(32)).hexdigest()

    def validate_hipaa_compliance(self, data: Dict[str, Any]) -> bool:
        """Validate data for HIPAA compliance"""
        required_fields = ["patient_id", "access_level", "purpose"]
        return all(field in data for field in required_fields)

    def sanitize_phi_data(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Remove or mask PHI data for non-authorized access"""
        phi_fields = ["ssn", "phone", "email", "address", "date_of_birth"]
        sanitized = data.copy()

        for field in phi_fields:
            if field in sanitized:
                sanitized[field] = "***MASKED***"

        return sanitized


class AccessControl:
    """Role-based access control for healthcare data"""

    def __init__(self):
        self.roles = {
            "admin": ["read", "write", "delete", "audit"],
            "doctor": ["read", "write"],
            "nurse": ["read", "write"],
            "receptionist": ["read"],
            "patient": ["read_own"],
        }

    def check_permission(self, user_role: str, action: str, resource: str) -> bool:
        """Check if user has permission for specific action"""
        if user_role not in self.roles:
            return False

        user_permissions = self.roles[user_role]
        return action in user_permissions

    def get_user_permissions(self, user_role: str) -> List[str]:
        """Get all permissions for a user role"""
        return self.roles.get(user_role, [])


class ComplianceChecker:
    """Automated compliance checking"""

    def __init__(self):
        self.hipaa_requirements = [
            "data_encryption",
            "access_control",
            "audit_trail",
            "data_backup",
            "incident_response",
        ]

        self.gdpr_requirements = [
            "data_minimization",
            "consent_management",
            "right_to_forget",
            "data_portability",
            "privacy_by_design",
        ]

    def check_hipaa_compliance(self, system_state: Dict[str, Any]) -> Dict[str, Any]:
        """Check HIPAA compliance status"""
        compliance_status = {}

        for requirement in self.hipaa_requirements:
            compliance_status[requirement] = {
                "status": "compliant"
                if system_state.get(requirement, False)
                else "non_compliant",
                "last_check": datetime.now(timezone.utc).isoformat(),
            }

        return compliance_status

    def check_gdpr_compliance(self, system_state: Dict[str, Any]) -> Dict[str, Any]:
        """Check GDPR compliance status"""
        compliance_status = {}

        for requirement in self.gdpr_requirements:
            compliance_status[requirement] = {
                "status": "compliant"
                if system_state.get(requirement, False)
                else "non_compliant",
                "last_check": datetime.now(timezone.utc).isoformat(),
            }

        return compliance_status


# Global security instances
security_manager = SecurityManager()
access_control = AccessControl()
compliance_checker = ComplianceChecker()

# Dependency for authentication
security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
):
    """Get current user from JWT token"""
    try:
        payload = jwt.decode(
            credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM]
        )
        user_id: str = payload.get("user_id")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except jwt.InvalidTokenError:  # Fixed JWT error
        raise HTTPException(status_code=401, detail="Invalid token")

    # Get user from database
    db = next(get_db())
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return user


async def get_current_user_dev(
    credentials: HTTPAuthorizationCredentials = Depends(security),
):
    """
    Development version with proper authentication.
    SECURITY: No longer bypasses auth - requires valid token.
    """
    try:
        payload = jwt.decode(
            credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM]
        )
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=401, detail="Invalid token: missing user ID"
            )
        return user_id
    except jwt.PyJWTError as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")


async def get_current_user_dev_optional(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
):
    """
    Optional authentication - returns user if authenticated, None otherwise.
    SECURITY: No longer returns fake 'dev_user' - properly validates tokens.
    """
    if credentials is None:
        return None

    try:
        payload = jwt.decode(
            credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM]
        )
        user_id = payload.get("sub")
        return user_id
    except jwt.PyJWTError:
        return None


async def verify_permission(user_id: str, action: str, resource: str):
    """Verify user has permission for specific action"""
    # In a real implementation, you would get user role from database
    user_role = "doctor"  # Placeholder
    if not access_control.check_permission(user_role, action, resource):
        raise HTTPException(status_code=403, detail="Insufficient permissions")
