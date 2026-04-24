# Jania Southall - Lines (1 - 150)
# Service functions for user management, authentication, and session handling.
from datetime import datetime, timedelta
import secrets
from sqlalchemy.orm import Session

from typing import Optional
from fastapi import HTTPException, status
from app.models import User, SessionToken, Listing
from app.security import hash_password, verify_password
from app import schemas

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
        is_admin=False,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
    user = db.query(User).filter(User.email == email).first()
    if not user:
        return None
    try:
        if verify_password(password, user.password_hash):
            return user
    except Exception:
        # password_hash in the database is not a valid bcrypt hash
        # (e.g. plain text was inserted directly). Treat as wrong password.
        pass
    return None


def authenticate_user_by_username(db: Session, username: str, password: str) -> Optional[User]:
    user = db.query(User).filter(User.username == username).first()
    if not user:
        return None
    try:
        if verify_password(password, user.password_hash):
            return user
    except Exception:
        pass
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


def get_session_user(db: Session, token: str) -> Optional[User]:
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
    Revoke all active sessions for a user by email.
    """
    user = db.query(User).filter(User.email == email).first()
    if not user:
        return False

    sessions = db.query(SessionToken).filter(
        SessionToken.user_id == user.id,
        SessionToken.revoked_at.is_(None),
    ).all()

    if not sessions:
        return False

    for session in sessions:
        session.revoked_at = datetime.utcnow()

    db.commit()
    return True

# Anthony Powell - Used for update and delete logic
def get_listing_or_404(db: Session, listing_id: int):
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Listing not found",
        )
    return listing

# Update listing details
def update_listing(db: Session, listing_id: int, payload: schemas.ListingUpdate, current_user: User):
    listing = get_listing_or_404(db, listing_id)

    if not _can_manage_listing(listing, current_user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="403 Forbidden --> Logged in but not the owner",
        )

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(listing, field, value)

    db.commit()
    db.refresh(listing)
    return listing

# Mark listing as deleted instead of removing it so we keep a record in the database
def delete_listing(db: Session, listing_id: int, current_user: User):
    listing = get_listing_or_404(db, listing_id)

    if not _can_manage_listing(listing, current_user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="403 Forbidden --> Logged in but not the owner",
        )

    # Soft delete — preserve the row for record-keeping
    listing.status = "deleted"
    db.commit()
    db.refresh(listing)
    return listing

def _is_owner(listing: Listing, current_user: User) -> bool:
    # Support whichever ownership field exists in your model
    if hasattr(listing, "owner_id"):
        return int(listing.owner_id) == int(current_user.id)
    if hasattr(listing, "user_id"):
        return int(listing.user_id) == int(current_user.id)
    if hasattr(listing, "seller_email"):
        return str(listing.seller_email).lower() == str(current_user.email).lower()
    return False

# Anthony Powell
# Admin-or-owner listing management 
def _can_manage_listing(listing: Listing, current_user: User) -> bool:
    return bool(getattr(current_user, "is_admin", False)) or _is_owner(listing, current_user)
