from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session # Import Session from SQLAlchemy
from app.database import get_db # Import the get_db function to get a database session
from app.schemas.admin import ListingModeration, AdminUserResponse
from app.services.admin_service import moderate_listing, suspend_user, get_dashboard_metrics

router = APIRouter(prefix="/admin", tags=["admin"]) # Create an APIRouter instance with a prefix of /admin and a tag of admin

@router.get("/dashboard") # Endpoint to get admin dashboard metrics
def get_admin_dashboard(db: Session = Depends(get_db)):
    return get_dashboard_metrics(db)

@router.post("/listings/{listing_id}/moderate") # Endpoint to moderate a listing (approve, deny, archive, mark as sold)
def moderate_listing_endpoint(listing_id: int, moderation: ListingModeration, db: Session = Depends(get_db)):
    result = moderate_listing(db, listing_id, moderation.action)
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return result