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


# Get listing by id (shows one listing)
@listings_router.get("/listings/{listing_id}")
def view_listing(listing_id: int):
    return get_single_listing(listing_id)

# Create a new listing
@listings_router.post("/listings/new")
def create_new_listing(
    listing_data: ListingCreate,
    current_user = Depends(get_current_user)
):
    return create_listing(listing_data, current_user.email)