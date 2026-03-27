# Daye Karibi-Whyte - FastAPI routes for admin functionalities
from datetime import datetime, timedelta

from fastapi import Body
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.schemas import ListingModeration, ListingResponse, TransactionResponse, UserListResponse, TransactionCreate
from app.admin_service import moderate_listing, get_dashboard_metrics, get_all_listings, get_all_users, suspend_user
from app.models import Listing, User, SessionToken, Transactions

# package-qualified imports so module works when running as package - Daye Karibi-Whyte
# expose endpoints under /api/admin to match frontend expectations

router = APIRouter(prefix="/api/admin", tags=["admin"])


# DELETE endpoint to delete a listing
@router.delete("/listings/{listing_id}")
def delete_listing(listing_id: int, db: Session = Depends(get_db)):
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    listing.status = "deleted"
    db.commit()
    db.refresh(listing)

    return {
        "id": listing.id,
        "status": listing.status,
        "message": "Listing successfully deleted. It will no longer appear publicly."
    }

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
    return get_all_listings(db)

# Endpoint to get user growth for last 30 days
@router.get("/user_growth")
def user_growth(db: Session = Depends(get_db)):
    today = datetime.now()
    start_date = today - timedelta(days=30)
    # Query users created in last 30 days, group by day
    results = db.query(func.date(User.created_at), func.count(User.id)).filter(User.created_at >= start_date).group_by(func.date(User.created_at)).all()
    # Format for frontend chart
    growth = []
    for day, count in results:
        growth.append({"date": str(day), "count": count})
    return growth

@router.get("/active_users")
def active_users(db: Session = Depends(get_db)):
    today = datetime.now()
    start_date = today - timedelta(days=30)

    # Query unique active users per day
    results = (
        db.query(
            func.date(SessionToken.created_at),
            func.count(func.distinct(SessionToken.user_id))
        )
        .filter(SessionToken.created_at >= start_date)
        .group_by(func.date(SessionToken.created_at))
        .all()
    )

    # Format for frontend
    active_users_data = [{"date": str(day), "count": count} for day, count in results]
    return active_users_data

@router.get("/users", response_model=List[UserListResponse])
def get_users(db: Session = Depends(get_db)):
    return get_all_users(db)

@router.post("/transactions", response_model=TransactionResponse)
def create_transaction(transaction: TransactionCreate, db: Session = Depends(get_db)):
    new_transaction = Transactions(
        listing_id=transaction.listing_id,
        buyer_email=transaction.buyer_email,
        seller_email=transaction.seller_email,
        transaction_timestamp=transaction.transaction_timestamp
    )
    existing = db.query(Transactions).filter(
    Transactions.listing_id == transaction.listing_id
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="Transaction already exists for this listing")
    db.add(new_transaction)
    db.commit()
    db.refresh(new_transaction)
    return TransactionResponse.from_orm(new_transaction)

@router.get("/transactions", response_model=List[TransactionResponse])
def list_transactions(db: Session = Depends(get_db)):
    transactions = db.query(Transactions).order_by(Transactions.transaction_timestamp.desc()).all()
    return [TransactionResponse.from_orm(t) for t in transactions]


@router.get("/active_user_emails")
def get_active_user_emails(db: Session = Depends(get_db)):
    active_users = (
        db.query(User)
        .join(SessionToken, User.id == SessionToken.user_id)
        .filter(SessionToken.revoked_at == None)
        .filter(User.is_suspended == False)
        .distinct()
        .all()
    )

    return [{"id": user.id, "email": user.email} for user in active_users]

@router.put("/suspend/{email}")
def suspend_user_by_email(email: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == email).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.is_suspended = True
    db.commit()

    return {"message": "User suspended"}