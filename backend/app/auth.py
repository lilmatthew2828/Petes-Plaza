# Jania Southall - Authentication routes and dependencies 
# for user registration, login, logout, and session management. 
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from typing import Optional
from app.schemas import AdminUserResponse
from app.database import get_db
from .models import User
from .schemas import RegisterIn, LoginIn, UserOut
from app.config import settings
from app.services import (
    create_user,
    authenticate_user,
    authenticate_user_by_username,
    create_session,
    revoke_session,
    get_session_user,
)
from fastapi.responses import JSONResponse

router = APIRouter(prefix="/api/auth", tags=["auth"])

# Anthony Powell
# Setting email requirements for User vs Admins
USER_EMAIL_DOMAIN = "my.hamptonu.edu"
ADMIN_EMAIL_DOMAIN = "petesplaza.com"


def get_current_user(request: Request, db: Session = Depends(get_db)) -> Optional[User]:
    """
    Extract session token from cookie and return current user.
    Returns None if no valid session.
    
    Usage:
        @router.get("/protected")
        def protected(user: User = Depends(get_current_user)):
            if not user:
                raise HTTPException(status_code=401)
    """
    token = request.cookies.get(settings.session_cookie_name)
    if not token:
        return None
    
    return get_session_user(db, token)


def require_login(current_user: User = Depends(get_current_user)) -> User:
    """
    Require user to be authenticated.
    Raises 401 if not logged in.
    
    Usage:
        @router.get("/protected")
        def protected(user: User = Depends(require_login)):
            return {"user": user}  # user always exists here
    """
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return current_user


@router.post("/register", response_model=UserOut, status_code=201)
def register(payload: RegisterIn, db: Session = Depends(get_db)):
    """
    Register a new user.
    - Validates passwords match
    - Checks email, username, student_id uniqueness
    - Returns created user
    """
    # Validate passwords match
    if payload.password != payload.confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Passwords do not match",
        )

    email = payload.email.strip().lower()
    if not email.endswith(f"@{USER_EMAIL_DOMAIN}"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Email must end with @{USER_EMAIL_DOMAIN}",
        )
    
    # Create user (handles uniqueness checks)
    user = create_user(
        db,
        email=email,
        username=payload.username,
        student_id=payload.student_id,
        password=payload.password,
    )
    
    return user


@router.post("/login", status_code=200)
def login(payload: LoginIn, db: Session = Depends(get_db)):
    """
    Authenticate user by email or username.
    - Creates session token
    - Sets HttpOnly cookie
    - Returns user info
    """
    # Try email first
    user = authenticate_user(db, email=payload.identifier, password=payload.password)
    
    # Try username if email failed
    if not user:
        user = authenticate_user_by_username(
            db,
            username=payload.identifier,
            password=payload.password,
        )
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )
    
    # Create session
    session_token = create_session(db, user_id=user.id)
    
    # Build response with user info
    created_at = user.created_at
    if hasattr(created_at, "isoformat"):
        created_at = created_at.isoformat()
    else:
        created_at = str(created_at)

    response = JSONResponse(
        content={
            "email": user.email,
            "username": user.username,
            "student_id": user.student_id,
            "created_at": created_at,
        },
        status_code=200,
    )
    
    # Set HttpOnly cookie
    response.set_cookie(
        key=settings.session_cookie_name,
        value=session_token,
        httponly=settings.session_cookie_httponly,
        secure=settings.session_cookie_secure,
        samesite=settings.session_cookie_samesite,
        path="/",
        max_age=7 * 24 * 60 * 60,  # 7 days
    )
    
    return response


@router.post("/admin/login", status_code=200)
def admin_login(payload: LoginIn, db: Session = Depends(get_db)):
    identifier = payload.identifier.strip().lower()
    if "@" not in identifier or not identifier.endswith(f"@{ADMIN_EMAIL_DOMAIN}"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Admin login requires an @{ADMIN_EMAIL_DOMAIN} email",
        )

    user = authenticate_user(db, email=identifier, password=payload.password)

    if not user or not bool(getattr(user, "is_admin", False)):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid admin credentials",
        )

    session_token = create_session(db, user_id=user.id)

    created_at = user.created_at
    if hasattr(created_at, "isoformat"):
        created_at = created_at.isoformat()
    else:
        created_at = str(created_at)

    response = JSONResponse(
        content={
            "email": user.email,
            "username": user.username,
            "student_id": user.student_id,
            "created_at": created_at,
            "is_admin": True,
        },
        status_code=200,
    )

    response.set_cookie(
        key=settings.session_cookie_name,
        value=session_token,
        httponly=settings.session_cookie_httponly,
        secure=settings.session_cookie_secure,
        samesite=settings.session_cookie_samesite,
        path="/",
        max_age=7 * 24 * 60 * 60,
    )

    return response


@router.post("/logout", status_code=204)
def logout(
    request: Request,
    current_user: User = Depends(require_login),
    db: Session = Depends(get_db),
):
    """
    Logout user.
    - Revokes session token in DB
    - Clears cookie
    """
    token = request.cookies.get(settings.session_cookie_name)
    if token:
        revoke_session(db, token)
    
    response = JSONResponse(content=None, status_code=204)
    response.delete_cookie(key=settings.session_cookie_name, path="/")
    return response


@router.get("/me", response_model=AdminUserResponse, status_code=200)
def get_me(current_user: User = Depends(require_login)):
    """
    Get current authenticated user, including admin status.
    Returns 401 if not logged in.
    """
    return AdminUserResponse(
        email=current_user.email,
        username=current_user.username,
        student_id=current_user.student_id,
        created_at=current_user.created_at,
        is_admin=bool(getattr(current_user, 'is_admin', False)),
    )