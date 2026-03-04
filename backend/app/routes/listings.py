# Anthony Powell
# FastAPI routing + dependency injection helpers
from fastapi import APIRouter, Depends, Response, status
# SQLAlchemy session type
from sqlalchemy.orm import Session

# App imports:
# - schemas: request/response models
# - services: business logic layer
from app import schemas, services, models
# DB dependency
from app.database import get_db
from app.auth import require_login

# Expose listings routes under /api/listings to match frontend proxy/config
router = APIRouter(prefix="/api/listings", tags=["listings"])


@router.get("/{listing_id}", response_model=schemas.ListingResponse)
def get_listing(
    listing_id: int,
    db: Session = Depends(get_db),
):
    """
    Get one listing by ID.
    Returns 404 if listing does not exist.
    """
    return services.get_listing_or_404(db, listing_id)


@router.patch("/{listing_id}", response_model=schemas.ListingResponse)
def patch_listing(
    listing_id: int,
    payload: schemas.ListingUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_login),
):
    """
    Update a listing (partial update).
    Ownership enforcement is in service layer:
    - 404 if listing does not exist
    - 403 if logged in user is not owner
    """
    return services.update_listing(db, listing_id, payload, current_user)


@router.delete("/{listing_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_listing(
    listing_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_login),
):
    """
    Delete a listing.
    Ownership enforcement is in service layer:
    - 404 if listing does not exist
    - 403 if logged in user is not owner

    Returns 204 No Content on success.
    """
    services.delete_listing(db, listing_id, current_user)
    return Response(status_code=status.HTTP_204_NO_CONTENT)