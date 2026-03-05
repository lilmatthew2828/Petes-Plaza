
from fastapi import Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from typing import Optional

from app.database import get_db
from app.services import get_session_user
from app.models import User
from app.config import settings
# Your User model might be in app/models.py (single-file style)
# If you do NOT have app/models/user.py, fix this import (see note below).
from app.models import User



async def get_current_user(
    request: Request,
    db: Session = Depends(get_db),
) -> Optional[User]:
    session_token = request.cookies.get(settings.session_cookie_name)
    if not session_token:
        return None
    return get_session_user(db, session_token)
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