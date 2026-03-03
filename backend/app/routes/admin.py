from datetime import datetime, timedelta

from fastapi import Body
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.schemas import ListingModeration, AdminUserResponse
from app.schemas import ListingResponse
from app.admin_service import moderate_listing, suspend_user, get_dashboard_metrics
from app.models import Listing, User

# package-qualified imports so module works when running as package - Daye Karibi-Whyte
# expose endpoints under /api/admin to match frontend expectations

router = APIRouter(prefix="/api/admin", tags=["admin"])

# PATCH endpoint to update listing status (e.g., mark as sold)
@router.patch("/listings/{listing_id}")
def update_listing_status(listing_id: int, status: str = Body(...), db: Session = Depends(get_db)):
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    listing.status = status
    db.commit()
    db.refresh(listing)
    return {"id": listing.id, "status": listing.status}

# DELETE endpoint to delete a listing
@router.delete("/listings/{listing_id}")
def delete_listing(listing_id: int, db: Session = Depends(get_db)):
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    db.delete(listing)
    db.commit()
    return {"id": listing_id, "deleted": True}

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

# Endpoint to get user growth for last 30 days
@router.get("/user_growth")
def user_growth(db: Session = Depends(get_db)):
    today = datetime.now()
    start_date = today - timedelta(days=30)
    # Query users created in last 30 days, group by day
    results = db.query(func.date(User.created_at), func.count(User.id)).filter(User.created_at >= start_date.isoformat()).group_by(func.date(User.created_at)).all()
    # Format for frontend chart
    growth = []
    for day, count in results:
        growth.append({"date": str(day), "count": count})
    return growth