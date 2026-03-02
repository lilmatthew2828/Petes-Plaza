# Jania Southall - Fix
# Service functions for user management, authentication, and session handling.
from datetime import datetime, timedelta
import secrets
from sqlalchemy.orm import Session

from fastapi import HTTPException, status
from app.models import User, SessionToken
from app.security import hash_password, verify_password


def create_user(db: Session, email: str, username: str, student_id: int, password: str) -> User:
    """
    Create a new user with hashed password.
    Raises 409 if email, username, or student_id already exists.
    """
    # Check if email already exists
    if db.query(User).filter(User.email == email).first():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        )
    
    # Check if username already exists
    if db.query(User).filter(User.username == username).first():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Username already taken",
        )
    
    # Check if student_id already exists
    if db.query(User).filter(User.student_id == student_id).first():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Student ID already registered",
        )
    
    # Create user with hashed password
    user = User(
        email=email,
        username=username,
        student_id=student_id,
        password_hash=hash_password(password),
        created_at=datetime.utcnow(),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def authenticate_user(db: Session, email: str, password: str) -> User | None:
    """
    Find user by email and verify password.
    Returns User if valid, None otherwise.
    """
    user = db.query(User).filter(User.email == email).first()
    if user and verify_password(password, user.password_hash):
        return user
    return None


def authenticate_user_by_username(db: Session, username: str, password: str) -> User | None:
    """
    Find user by username and verify password.
    Returns User if valid, None otherwise.
    """
    user = db.query(User).filter(User.username == username).first()
    if user and verify_password(password, user.password_hash):
        return user
    return None


def create_session(db: Session, user_id: int) -> str:
    """
    Create a server-side session token for a user.
    Returns the session token (to be set as cookie value).
    """
    token = secrets.token_urlsafe(32)
    # Set expiration to 7 days from now
    expires_at = datetime.utcnow() + timedelta(days=7)
    # Store session in database
    session = SessionToken(
        token=token,
        user_id=user_id,
        expires_at=expires_at,
        created_at=datetime.utcnow(),
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return token


def revoke_session(db: Session, token: str) -> bool:
    """
    Revoke a session token by setting revoked_at timestamp.
    Returns True if revoked, False if not found.
    """
    session = db.query(SessionToken).filter(SessionToken.token == token).first()
    if session:
        session.revoked_at = datetime.utcnow()
        db.commit()
        return True
    return False


def get_session_user(db: Session, token: str) -> User | None:
    """
    Get the user associated with a valid session token.
    Returns User if token is valid (not revoked, not expired), None otherwise.
    """
    session = db.query(SessionToken).filter(
        SessionToken.token == token,
        # Not revoked
        SessionToken.revoked_at.is_(None), 
        # Not expired
        SessionToken.expires_at > datetime.utcnow(),  
    ).first()
    
    if not session:
        return None
    
    # Return the associated user
    return db.query(User).filter(User.id == session.user_id).first()


def revoke_user_sessions(db: Session, email: str) -> bool:
    """
    Revoke all active sessions for a user.
    Useful for logout-all, password reset, etc.
    """
    sessions = db.query(SessionToken).filter(
        SessionToken.user_id == User.id,
        SessionToken.revoked_at.is_(None),
    ).all()
    
    if not sessions:
        return False
    
    for session in sessions:
        session.revoked_at = datetime.utcnow()
    
    db.commit()
    return True