"""
Authentication and Authorization System
Handles JWT tokens, user authentication, and role-based access control
"""

import jwt
import bcrypt
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any
from fastapi import HTTPException, Depends, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.core.database import get_db
from app.core.config import settings


def utc_now() -> datetime:
    """Return current UTC time with timezone info (replaces deprecated datetime.utcnow())"""
    return datetime.now(timezone.utc)


# Security scheme
security = HTTPBearer()

# JWT Configuration
JWT_SECRET_KEY = settings.SECRET_KEY or "your-secret-key-change-in-production"
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
REFRESH_TOKEN_EXPIRE_DAYS = 7


class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int = ACCESS_TOKEN_EXPIRE_MINUTES * 60


class TokenData(BaseModel):
    username: Optional[str] = None
    user_id: Optional[str] = None
    role: Optional[str] = None
    client_id: Optional[str] = None


class User(BaseModel):
    id: str
    username: str
    email: str
    role: str
    client_id: Optional[str] = None
    is_active: bool = True


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = utc_now() + expires_delta
    else:
        expire = utc_now() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode.update({"exp": expire, "type": "access"})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
    return encoded_jwt


def create_refresh_token(data: dict) -> str:
    """Create JWT refresh token"""
    to_encode = data.copy()
    expire = utc_now() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire, "type": "refresh"})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
    return encoded_jwt


def verify_token(token: str) -> Dict[str, Any]:
    """Verify JWT token and return payload"""
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )


def hash_password(password: str) -> str:
    """Hash password using bcrypt"""
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode("utf-8"), salt)
    return hashed.decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against hash"""
    return bcrypt.checkpw(
        plain_password.encode("utf-8"), hashed_password.encode("utf-8")
    )


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
) -> User:
    """Get current authenticated user"""
    token = credentials.credentials
    payload = verify_token(token)

    if payload.get("type") != "access":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token type"
        )

    username: str = payload.get("sub")
    if username is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
        )

    # In a real implementation, you would fetch user from database
    # For now, return mock user data
    user = User(
        id=payload.get("user_id", "1"),
        username=username,
        email=payload.get("email", "user@example.com"),
        role=payload.get("role", "user"),
        client_id=payload.get("client_id"),
        is_active=True,
    )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user"
        )

    return user


async def get_current_active_user(
    current_user: User = Depends(get_current_user),
) -> User:
    """Get current active user"""
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user"
        )
    return current_user


def require_role(required_role: str):
    """Decorator to require specific role"""

    def role_checker(current_user: User = Depends(get_current_active_user)) -> User:
        if current_user.role != required_role and current_user.role != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions"
            )
        return current_user

    return role_checker


def require_admin(current_user: User = Depends(get_current_active_user)) -> User:
    """Require admin role"""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required"
        )
    return current_user


def require_client_access(
    current_user: User = Depends(get_current_active_user),
) -> User:
    """Require client access (admin or client role)"""
    if current_user.role not in ["admin", "client"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Client access required"
        )
    return current_user


async def get_current_user_optional(
    request: Request, db: Session = Depends(get_db)
) -> Optional[str]:
    """
    Optional authentication - returns user ID if authenticated, None otherwise.
    SECURITY: Properly validates tokens, no fake users.
    """
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return None

    try:
        token = auth_header.split(" ")[1]
        payload = verify_token(token)
        return payload.get("sub")
    except HTTPException:
        return None


def authenticate_user(
    username: str, password: str, db: Session
) -> Optional[Dict[str, Any]]:
    """
    Authenticate user with username and password from database.
    SECURITY: Queries actual database instead of mock users.
    """
    from app.models.user import User as UserModel

    user = (
        db.query(UserModel)
        .filter((UserModel.username == username) | (UserModel.email == username))
        .first()
    )

    if not user:
        return None

    if not verify_password(password, user.password_hash):
        return None

    return {
        "id": str(user.id),
        "username": user.username,
        "email": user.email,
        "role": user.role,
        "client_id": getattr(user, "client_id", None),
        "is_active": user.is_active,
    }


def create_user_tokens(user: Dict[str, Any]) -> Token:
    """Create access and refresh tokens for user"""
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    access_token_data = {
        "sub": user["username"],
        "user_id": user["id"],
        "email": user["email"],
        "role": user["role"],
        "client_id": user.get("client_id"),
    }

    access_token = create_access_token(access_token_data, access_token_expires)
    refresh_token = create_refresh_token(access_token_data)

    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )
