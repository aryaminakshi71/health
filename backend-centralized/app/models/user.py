"""
User Model
Centralized user model for all applications
"""

from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey, Table
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import bcrypt
from datetime import datetime, timedelta
import jwt
import os

# Association table for user roles
user_roles = Table(
    'user_roles',
    Base.metadata,
    Column('user_id', Integer, ForeignKey('users.id'), primary_key=True),
    Column('role_id', Integer, ForeignKey('roles.id'), primary_key=True)
)

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    first_name = Column(String(50))
    last_name = Column(String(50))
    phone = Column(String(20))
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    last_login = Column(DateTime)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    roles = relationship("Role", secondary=user_roles, back_populates="users")
    sessions = relationship("UserSession", back_populates="user")
    audit_logs = relationship("AuditLog", back_populates="user")
    
    def set_password(self, password: str):
        """Hash password using bcrypt"""
        salt = bcrypt.gensalt()
        self.hashed_password = bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')
    
    def check_password(self, password: str) -> bool:
        """Verify password against hash"""
        return bcrypt.checkpw(password.encode('utf-8'), self.hashed_password.encode('utf-8'))
    
    def generate_token(self) -> str:
        """Generate JWT token for user"""
        payload = {
            'user_id': self.id,
            'username': self.username,
            'exp': datetime.utcnow() + timedelta(hours=24)
        }
        return jwt.encode(payload, os.getenv('SECRET_KEY', 'dev-secret'), algorithm='HS256')
    
    def has_role(self, role_name: str) -> bool:
        """Check if user has specific role"""
        return any(role.name == role_name for role in self.roles)
    
    def has_permission(self, permission: str) -> bool:
        """Check if user has specific permission"""
        for role in self.roles:
            for perm in role.permissions:
                if perm.name == permission:
                    return True
        return False

class Role(Base):
    __tablename__ = "roles"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False)
    description = Column(Text)
    created_at = Column(DateTime, default=func.now())
    
    # Relationships
    users = relationship("User", secondary=user_roles, back_populates="roles")
    permissions = relationship("Permission", back_populates="role")

class Permission(Base):
    __tablename__ = "permissions"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    description = Column(Text)
    resource = Column(String(100))  # e.g., 'patient', 'financial', 'inventory'
    action = Column(String(50))     # e.g., 'read', 'write', 'delete'
    role_id = Column(Integer, ForeignKey('roles.id'))
    created_at = Column(DateTime, default=func.now())
    
    # Relationships
    role = relationship("Role", back_populates="permissions")

class UserSession(Base):
    __tablename__ = "user_sessions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    session_token = Column(String(255), unique=True, nullable=False)
    ip_address = Column(String(45))
    user_agent = Column(Text)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=func.now())
    expires_at = Column(DateTime)
    last_activity = Column(DateTime, default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="sessions")
    
    def is_expired(self) -> bool:
        """Check if session is expired"""
        return datetime.utcnow() > self.expires_at
    
    def refresh(self):
        """Refresh session activity"""
        self.last_activity = datetime.utcnow()

class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    action = Column(String(100), nullable=False)  # e.g., 'login', 'logout', 'create', 'update', 'delete'
    resource = Column(String(100))  # e.g., 'patient', 'financial', 'inventory'
    resource_id = Column(String(50))  # ID of the affected resource
    details = Column(Text)  # JSON string with additional details
    ip_address = Column(String(45))
    user_agent = Column(Text)
    timestamp = Column(DateTime, default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="audit_logs")

class PasswordReset(Base):
    __tablename__ = "password_resets"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    token = Column(String(255), unique=True, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    used = Column(Boolean, default=False)
    created_at = Column(DateTime, default=func.now())
    
    def is_expired(self) -> bool:
        """Check if reset token is expired"""
        return datetime.utcnow() > self.expires_at

class UserProfile(Base):
    __tablename__ = "user_profiles"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), unique=True)
    avatar_url = Column(String(255))
    bio = Column(Text)
    department = Column(String(100))
    position = Column(String(100))
    location = Column(String(100))
    timezone = Column(String(50))
    preferences = Column(Text)  # JSON string with user preferences
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

class LoginAttempt(Base):
    __tablename__ = "login_attempts"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), nullable=False)
    ip_address = Column(String(45))
    success = Column(Boolean, default=False)
    timestamp = Column(DateTime, default=func.now())
    user_agent = Column(Text)
    
    @classmethod
    def get_failed_attempts(cls, username: str, ip_address: str, hours: int = 1):
        """Get failed login attempts in the last N hours"""
        from sqlalchemy.orm import Session
        cutoff_time = datetime.utcnow() - timedelta(hours=hours)
        return Session.query(cls).filter(
            cls.username == username,
            cls.ip_address == ip_address,
            cls.success == False,
            cls.timestamp > cutoff_time
        ).count()

class SecurityPolicy(Base):
    __tablename__ = "security_policies"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    description = Column(Text)
    policy_type = Column(String(50))  # e.g., 'password', 'session', 'access'
    settings = Column(Text)  # JSON string with policy settings
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

# Default roles and permissions
DEFAULT_ROLES = [
    {
        "name": "admin",
        "description": "System Administrator",
        "permissions": [
            {"name": "all", "description": "All permissions", "resource": "*", "action": "*"}
        ]
    },
    {
        "name": "manager",
        "description": "Department Manager",
        "permissions": [
            {"name": "read_all", "description": "Read all data", "resource": "*", "action": "read"},
            {"name": "manage_team", "description": "Manage team members", "resource": "users", "action": "manage"}
        ]
    },
    {
        "name": "user",
        "description": "Regular User",
        "permissions": [
            {"name": "read_own", "description": "Read own data", "resource": "own", "action": "read"},
            {"name": "update_own", "description": "Update own data", "resource": "own", "action": "update"}
        ]
    },
    {
        "name": "guest",
        "description": "Guest User",
        "permissions": [
            {"name": "read_public", "description": "Read public data", "resource": "public", "action": "read"}
        ]
    }
]

# Security policies
DEFAULT_SECURITY_POLICIES = [
    {
        "name": "password_policy",
        "description": "Password requirements",
        "policy_type": "password",
        "settings": {
            "min_length": 8,
            "require_uppercase": True,
            "require_lowercase": True,
            "require_numbers": True,
            "require_special": True,
            "max_age_days": 90
        }
    },
    {
        "name": "session_policy",
        "description": "Session management",
        "policy_type": "session",
        "settings": {
            "session_timeout_hours": 24,
            "max_concurrent_sessions": 5,
            "inactivity_timeout_minutes": 30
        }
    },
    {
        "name": "login_policy",
        "description": "Login security",
        "policy_type": "login",
        "settings": {
            "max_failed_attempts": 5,
            "lockout_duration_minutes": 30,
            "require_mfa": False
        }
    }
]
