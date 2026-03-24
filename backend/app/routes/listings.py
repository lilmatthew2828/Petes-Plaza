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

# EMMANUELLA OBIDIKE
# LISTINGS ROUTES
from fastapi import APIRouter, Depends
from app.auth import get_current_user


# import our schema (validation)
from app.listing_schemas.listings import ListingCreate

# import logic functions
from app.listing_services.listings import (
    get_all_listings,
    get_single_listing,
    create_listing
)

# create router object
listings_router = APIRouter(prefix="/api", tags=["listings"])

# Get listings (shows all listings)
@listings_router.get("/listings")
def view_listings():
    return get_all_listings()


# Get sold listings for the current user - Emmanuella Obidike
@router.get("/my-sold")
def view_my_sold_listings(
    current_user = Depends(require_login),
    db: Session = Depends(get_db)
):
    listings = db.query(models.Listing).filter(
        models.Listing.seller_email == current_user.email,
        models.Listing.sold == True
    ).all()

    return listings


# Get listing by id (shows one listing)
@listings_router.get("/my-listings/{listing_id}")
def view_listing(listing_id: int):
    return get_single_listing(listing_id)


# Create a new listing
@listings_router.post("/listings/new")
def create_new_listing(
    listing_data: ListingCreate,
    current_user = Depends(get_current_user)
):
    return create_listing(listing_data, current_user.email)


