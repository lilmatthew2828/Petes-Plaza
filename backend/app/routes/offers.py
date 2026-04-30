# Jania Southall (whole file) - Routes for handling offers, including creating offers, retrieving offers for sellers and buyers, responding to offers, and completing transactions.
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from pydantic import BaseModel  

from app.database import get_db
from app.models import User, Listing, Offers, Transactions
from app.auth import require_login

router = APIRouter(prefix="/api/offers", tags=["offers"])

class RespondRequest(BaseModel):
    message: str


# ==========================================
# 1. SPECIFIC ROUTES (Must go first!)
# ==========================================

@router.get("/seller")  
def get_seller_offers(
    db: Session = Depends(get_db),
    current_user = Depends(require_login)
):
    """Get all offers for a seller's listings"""
    seller_email = current_user.email
    
    offers = (
        db.query(Offers)
        .filter(Offers.seller_email == seller_email)
        .order_by(Offers.created_at.desc())
        .all()
    )
    
    result = []
    for offer in offers:
        listing = db.query(Listing).filter(Listing.id == offer.listing_id).first()
        buyer = db.query(User).filter(User.email == offer.buyer_email).first()
        
        result.append({
            "offer_id": offer.offer_id,
            "listing_id": offer.listing_id,
            "listing_title": listing.title if listing else "Listing Removed",
            "listing_price": float(listing.price) if listing else 0,
            "buyer_email": offer.buyer_email,
            "buyer_name": buyer.username if buyer else "Unknown",
            "status": offer.status,
            "seller_message": offer.seller_message,
            "created_at": offer.created_at.isoformat() if offer.created_at else None,
            "updated_at": offer.updated_at.isoformat() if offer.updated_at else None
        })
    
    return {"offers": result}

@router.get("/buyer")
def get_buyer_offers(
    db: Session = Depends(get_db),
    current_user = Depends(require_login)
):
    """Get all offers for a buyer"""
    buyer_email = current_user.email
    
    offers = (
        db.query(Offers)
        .filter(Offers.buyer_email == buyer_email)
        .order_by(Offers.created_at.desc())
        .all()
    )
    
    result = []
    for offer in offers:
        listing = db.query(Listing).filter(Listing.id == offer.listing_id).first()
        
        result.append({
            "offer_id": offer.offer_id,
            "listing_id": offer.listing_id,
            "listing_title": listing.title if listing else "Listing Removed",
            "listing_price": float(listing.price) if listing else 0,
            "seller_email": offer.seller_email,
            "status": offer.status,
            "seller_message": offer.seller_message,
            "created_at": offer.created_at.isoformat() if offer.created_at else None,
            "updated_at": offer.updated_at.isoformat() if offer.updated_at else None
        })
    
    return {"offers": result}


# ==========================================
# 2. DYNAMIC ROUTES (Must go last!)
# ==========================================

@router.post("/{listing_id}") 
def create_offer(
    listing_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(require_login)
):
    """Buyer expresses interest in a listing"""
    # Check if listing exists and is active
    listing = db.query(Listing).filter(
        Listing.id == listing_id,
        Listing.status == "active"
    ).first()
    
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found or not available")
    
    # Makes sure that you can't be interested in your own listing
    if listing.seller_email == current_user.email:
        raise HTTPException(status_code=400, detail="Cannot express interest in your own listing")
    
    # Check if already interested
    existing = db.query(Offers).filter(
        Offers.listing_id == listing_id,
        Offers.buyer_email == current_user.email
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Already expressed interest in this listing")
    
    # Create new offer
    offer = Offers(
        listing_id=listing_id,
        buyer_email=current_user.email,
        seller_email=listing.seller_email,
        status="pending"
    )
    
    db.add(offer)
    db.commit()
    db.refresh(offer)
    
    return {"message": "Interest expressed successfully", "offer_id": offer.offer_id}

@router.patch("/{offer_id}/respond")
def respond_to_offer(
    offer_id: int,
    request: RespondRequest,  
    db: Session = Depends(get_db),
    current_user = Depends(require_login)
):
    """Seller responds to an offer with pickup information"""
    offer = db.query(Offers).filter(Offers.offer_id == offer_id).first()
    
    if not offer:
        raise HTTPException(status_code=404, detail="Offer not found")
    
    if offer.seller_email != current_user.email:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    if offer.status != "pending":
        raise HTTPException(status_code=400, detail="Offer is no longer pending")
    
    # Update offer
    offer.seller_message = request.message  
    offer.status = "accepted"
    offer.updated_at = datetime.now()
    
    db.commit()
    
    return {"message": "Response sent successfully"}

@router.post("/{offer_id}/complete")
def complete_offer(
    offer_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(require_login)
):
    """Seller marks offer as completed, creates transaction, marks listing as sold"""
    offer = db.query(Offers).filter(Offers.offer_id == offer_id).first()
    
    if not offer:
        raise HTTPException(status_code=404, detail="Offer not found")
    
    if offer.seller_email != current_user.email:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    if offer.status != "accepted":
        raise HTTPException(status_code=400, detail="Offer must be accepted first")
    
    # Get listing to mark as sold
    listing = db.query(Listing).filter(Listing.id == offer.listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    
    # Create transaction
    transaction = Transactions(
        listing_id=offer.listing_id,
        buyer_email=offer.buyer_email,
        seller_email=offer.seller_email,
        transaction_timestamp=datetime.now()
    )
    
    db.add(transaction)
    
    # Mark offer as completed
    offer.status = "completed"
    offer.updated_at = datetime.now()
    
    # Mark listing as sold
    listing.status = "sold"
    listing.updated_at = datetime.now().isoformat()
    
    db.commit()
    
    return {"message": "Transaction completed successfully", "transaction_id": transaction.transaction_id}