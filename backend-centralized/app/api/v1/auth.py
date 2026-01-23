"""
Authentication API endpoints
Handles login, logout, token refresh, and user management
"""

from datetime import timedelta
from typing import Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from app.core.auth import (
    authenticate_user, create_user_tokens, get_current_user, 
    get_current_active_user, require_admin, hash_password,
    verify_token, create_access_token, create_refresh_token
)
from app.core.database import get_db
from app.core.logging import audit_logger

router = APIRouter()

class LoginRequest(BaseModel):
    username: str
    password: str

class LoginResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int
    user: Dict[str, Any]

class RefreshTokenRequest(BaseModel):
    refresh_token: str

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

class RegisterRequest(BaseModel):
    username: str
    email: str
    password: str
    role: str = "user"
    client_id: Optional[str] = None

class ResetPasswordRequest(BaseModel):
    username: str
    email: str
    new_password: str

class UserProfile(BaseModel):
    username: str
    email: EmailStr
    role: str
    client_id: Optional[str] = None
    is_active: bool = True

@router.post("/login", response_model=LoginResponse)
async def login(
    login_data: LoginRequest,
    request: Request,
    db: Session = Depends(get_db)
):
    """Authenticate user and return JWT tokens"""
    try:
        # Authenticate user
        user = authenticate_user(login_data.username, login_data.password)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        if not user["is_active"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Inactive user account"
            )
        
        # Create tokens
        tokens = create_user_tokens(user)
        
        # Log successful login
        audit_logger.info(f"User {user['username']} logged in successfully from {request.client.host}")
        
        return LoginResponse(
            access_token=tokens.access_token,
            refresh_token=tokens.refresh_token,
            token_type=tokens.token_type,
            expires_in=tokens.expires_in,
            user={
                "id": user["id"],
                "username": user["username"],
                "email": user["email"],
                "role": user["role"],
                "client_id": user.get("client_id"),
                "is_active": user["is_active"]
            }
        )
        
    except Exception as e:
        audit_logger.error(f"Login failed for user {login_data.username}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Login failed"
        )

@router.post("/refresh", response_model=LoginResponse)
async def refresh_token(
    refresh_data: RefreshTokenRequest,
    db: Session = Depends(get_db)
):
    """Refresh access token using refresh token"""
    try:
        # Verify refresh token
        payload = verify_token(refresh_data.refresh_token)
        
        if payload.get("type") != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token type"
            )
        
        # Create new access token
        access_token_data = {
            "sub": payload.get("sub"),
            "user_id": payload.get("user_id"),
            "email": payload.get("email"),
            "role": payload.get("role"),
            "client_id": payload.get("client_id")
        }
        
        access_token = create_access_token(access_token_data)
        new_refresh_token = create_refresh_token(access_token_data)
        
        audit_logger.info(f"Token refreshed for user {payload.get('sub')}")
        
        return LoginResponse(
            access_token=access_token,
            refresh_token=new_refresh_token,
            token_type="bearer",
            expires_in=30 * 60,  # 30 minutes
            user={
                "id": payload.get("user_id"),
                "username": payload.get("sub"),
                "email": payload.get("email"),
                "role": payload.get("role"),
                "client_id": payload.get("client_id"),
                "is_active": True
            }
        )
        
    except Exception as e:
        audit_logger.error(f"Token refresh failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )

@router.get("/me", response_model=UserProfile)
async def get_current_user_profile(
    current_user = Depends(get_current_active_user)
):
    """Get current user profile"""
    return UserProfile(
        username=current_user.username,
        email=current_user.email,
        role=current_user.role,
        client_id=current_user.client_id,
        is_active=current_user.is_active
    )

@router.post("/change-password")
async def change_password(
    password_data: ChangePasswordRequest,
    current_user = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Change user password"""
    try:
        # Verify current password
        user = authenticate_user(current_user.username, password_data.current_password)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Current password is incorrect"
            )
        
        # Hash new password
        new_password_hash = hash_password(password_data.new_password)
        
        # Update password in database (mock for now)
        # In real implementation, update user.password_hash in database
        
        audit_logger.info(f"Password changed for user {current_user.username}")
        
        return {"message": "Password changed successfully"}
        
    except Exception as e:
        audit_logger.error(f"Password change failed for user {current_user.username}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to change password"
        )

@router.post("/logout")
async def logout(
    current_user = Depends(get_current_active_user),
    request: Request = None
):
    """Logout user (invalidate tokens)"""
    try:
        # In a real implementation, you would:
        # 1. Add token to blacklist
        # 2. Invalidate refresh token
        # 3. Clear session data
        
        audit_logger.info(f"User {current_user.username} logged out")
        
        return {"message": "Logged out successfully"}
        
    except Exception as e:
        audit_logger.error(f"Logout failed for user {current_user.username}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Logout failed"
        )

@router.get("/validate")
async def validate_token(
    current_user = Depends(get_current_active_user)
):
    """Validate current token"""
    return {
        "valid": True,
        "user": {
            "id": current_user.id,
            "username": current_user.username,
            "email": current_user.email,
            "role": current_user.role,
            "client_id": current_user.client_id,
            "is_active": current_user.is_active
        }
    }

# Development endpoints (remove in production)
@router.post("/dev-login")
async def dev_login(login_data: LoginRequest):
    """Development login endpoint"""
    user = authenticate_user(login_data.username, login_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    tokens = create_user_tokens(user)
    
    return {
        "access_token": tokens.access_token,
        "refresh_token": tokens.refresh_token,
        "token_type": "bearer",
        "user": {
            "id": user["id"],
            "username": user["username"],
            "email": user["email"],
            "role": user["role"],
            "client_id": user.get("client_id")
        }
    }

@router.get("/dev-users")
async def get_dev_users():
    """Get development users (remove in production)"""
    from app.core.auth import MOCK_USERS
    
    users = []
    for username, user_data in MOCK_USERS.items():
        users.append({
            "username": username,
            "email": user_data["email"],
            "role": user_data["role"],
            "client_id": user_data.get("client_id")
        })
    
    return {"users": users}

@router.post("/register", response_model=LoginResponse)
async def register_user(
    register_data: RegisterRequest,
    request: Request,
    db: Session = Depends(get_db)
):
    """Register a new user"""
    try:
        from app.core.auth import MOCK_USERS as mock_users_db
        
        # Check if username already exists
        if register_data.username in mock_users_db:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already exists"
            )
        
        # Create new user
        user_count = len(list(mock_users_db.keys()))
        new_user = {
            "id": str(user_count + 1),
            "username": register_data.username,
            "email": register_data.email,
            "password_hash": hash_password(register_data.password),
            "role": register_data.role,
            "client_id": register_data.client_id,
            "is_active": True
        }
        
        # Add to mock users (in real app, save to database)
        mock_users_db[register_data.username] = new_user
        
        # Create tokens
        tokens = create_user_tokens(new_user)
        
        # Log successful registration
        audit_logger.info(f"User {register_data.username} registered successfully from {request.client.host}")
        
        return LoginResponse(
            access_token=tokens.access_token,
            refresh_token=tokens.refresh_token,
            token_type=tokens.token_type,
            expires_in=tokens.expires_in,
            user={
                "id": new_user["id"],
                "username": new_user["username"],
                "email": new_user["email"],
                "role": new_user["role"],
                "client_id": new_user.get("client_id"),
                "is_active": new_user["is_active"]
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        audit_logger.error(f"Registration failed for user {register_data.username}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration failed"
        )

@router.post("/reset-password")
async def reset_password(
    reset_data: ResetPasswordRequest,
    request: Request,
    db: Session = Depends(get_db)
):
    """Reset user password"""
    try:
        from app.core.auth import MOCK_USERS as mock_users_db
        
        # Find user by username or email
        user = None
        for username, user_data in mock_users_db.items():
            if username == reset_data.username or user_data["email"] == reset_data.email:
                user = user_data
                user["username"] = username
                break
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Hash new password
        new_password_hash = hash_password(reset_data.new_password)
        
        # Update password in mock users (in real app, update database)
        mock_users_db[user["username"]]["password_hash"] = new_password_hash
        
        # Log password reset
        audit_logger.info(f"Password reset for user {user['username']} from {request.client.host}")
        
        return {
            "message": "Password reset successfully",
            "user": {
                "username": user["username"],
                "email": user["email"]
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        audit_logger.error(f"Password reset failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Password reset failed"
        )