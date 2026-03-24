from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Listing, User, Transactions
from app.auth import get_current_user
from datetime import datetime

router = APIRouter(prefix="/purchase-history", tags=["purchase-history"])

@router.get("/", response_model=List[dict])
async def get_user_purchase_history(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get purchase history for the current user"""
    try:
        # Query transactions using the correct primary key
        transactions = db.query(Transactions).filter(
            Transactions.buyer_email == current_user.email
        ).order_by(Transactions.transaction_timestamp.desc()).all()
        
        result = []
        for transaction in transactions:
            # Get the listing separately
            listing = db.query(Listing).filter(Listing.id == transaction.listing_id).first()
            
            if listing:
                result.append({
                    "id": transaction.transaction_id,  # Use transaction_id from your model
                    "listing_id": transaction.listing_id,
                    "title": listing.title,
                    "description": listing.description,
                    "price": float(listing.price),
                    "image_key": listing.image_key,
                    "purchased_at": transaction.transaction_timestamp,  # Already a string in your model
                    "seller_email": transaction.seller_email
                })
        
        return result
    except Exception as e:
        print(f"Error in get_user_purchase_history: {e}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@router.post("/purchase/{listing_id}")
async def purchase_item(
    listing_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Purchase a listing"""
    try:
        listing = db.query(Listing).filter(
            Listing.id == listing_id,
            Listing.status == "active"
        ).first()
        
        if not listing:
            raise HTTPException(status_code=404, detail="Listing not found or not available for purchase")
        
        if listing.seller_email == current_user.email:
            raise HTTPException(status_code=400, detail="Cannot purchase your own listing")
        
        # Check if already purchased
        existing_transaction = db.query(Transactions).filter(
            Transactions.listing_id == listing_id
        ).first()
        
        if existing_transaction:
            raise HTTPException(status_code=400, detail="Item already purchased")
        
        # Create transaction record
        transaction = Transactions(
            listing_id=listing_id,
            buyer_email=current_user.email,
            seller_email=listing.seller_email,
            transaction_timestamp=datetime.now().isoformat()  # String format to match your model
        )
        
        # Mark listing as sold
        listing.status = "sold"
        
        db.add(transaction)
        db.commit()
        db.refresh(transaction)
        
        return {"message": "Item purchased successfully", "transaction_id": transaction.transaction_id}
    except Exception as e:
        print(f"Error in purchase_item: {e}")
        raise HTTPException(status_code=500, detail=f"Purchase failed: {str(e)}")