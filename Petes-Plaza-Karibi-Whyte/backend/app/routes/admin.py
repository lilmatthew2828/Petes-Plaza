from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.admin import ListingModeration, AdminUserResponse
from app.schemas.listing import ListingResponse
from app.services.admin_service import moderate_listing, suspend_user, get_dashboard_metrics
from app.models.listing import Listing

# expose endpoints under /api/admin to match frontend expectations
router = APIRouter(prefix="/api/admin", tags=["admin"])

@router.get("/dashboard") # Endpoint to get admin dashboard metrics
def get_admin_dashboard(db: Session = Depends(get_db)):
    return get_dashboard_metrics(db)


@router.get("/metrics")
def get_metrics(db: Session = Depends(get_db)):
    return get_dashboard_metrics(db)

@router.post("/listings/{listing_id}/moderate") # Endpoint to moderate a listing (approve, deny, archive, mark as sold)
def moderate_listing_endpoint(listing_id: int, moderation: ListingModeration, db: Session = Depends(get_db)):
    result = moderate_listing(db, listing_id, moderation.action)
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return result


@router.get("/listings", response_model=List[ListingResponse])
def list_listings(db: Session = Depends(get_db)):
    listings = db.query(Listing).all()
    return listings