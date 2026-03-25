from fastapi import Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from typing import Optional
from app.db.session import get_db
from app.services.auth_service import get_session_user
from app.models.user import User
from backend.app.config import settings


async def get_current_user(
    request: Request,
    db: Session = Depends(get_db),
) -> Optional[User]:
    """
    Extract session token from cookie and return current user.
    Returns None if no valid session.
    
    Usage:
        @router.get("/protected")
        def protected_route(user: User = Depends(get_current_user)):
            if not user:
                raise HTTPException(status_code=401)
            return {"user": user}
    """
    session_token = request.cookies.get(settings.session_cookie_name)
    
    if not session_token:
        return None
    
    user = get_session_user(db, session_token)
    return user


def require_login(
    current_user: User = Depends(get_current_user),
) -> User:
    """
    Dependency that requires user to be authenticated.
    Raises 401 if not logged in.
    
    Usage:
        @router.get("/protected")
        def protected_route(user: User = Depends(require_login)):
            return {"user": user}  # user is guaranteed to exist
    """
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return current_user
