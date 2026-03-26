# Matthew Kilpatrick - Seller Routes
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, Listing, Transactions

router = APIRouter(prefix="/api/sellers", tags=["sellers"])


@router.get("/{seller_email}")
def get_seller_page(seller_email: str, db: Session = Depends(get_db)):
    seller = db.query(User).filter(User.email == seller_email).first()

    if not seller:
        raise HTTPException(status_code=404, detail="Seller not found")

    listings = (
        db.query(Listing)
        .filter(
            Listing.seller_email == seller_email,
            Listing.status == "active"
        )
        .order_by(Listing.id.desc())
        .all()
    )

    return {
        "seller": {
            "id": seller.id,
            "username": seller.username,
            "email": seller.email,
        },
        "listings": [
            {
                "id": l.id,
                "title": l.title,
                "price": float(l.price),
                "description": l.description,
                "image_url": l.image_key,
                "category": l.category,
                "seller_email": l.seller_email,
                "status": l.status,
            }
            for l in listings
        ],
    }


@router.get("/{seller_email}/transactions")
def get_seller_transactions(seller_email: str, db: Session = Depends(get_db)):
    seller = db.query(User).filter(User.email == seller_email).first()

    if not seller:
        raise HTTPException(status_code=404, detail="Seller not found")

    transactions = (
        db.query(Transactions)
        .filter(Transactions.seller_email == seller_email)
        .order_by(Transactions.transaction_timestamp.desc())
        .all()
    )

    return {
        "transactions": [
            {
                "id": tx.transaction_id,
                "listing_id": tx.listing_id,
                "buyer_email": tx.buyer_email,
                "amount": None,  # not stored in DB
                "status": "completed",
                "created_at": tx.transaction_timestamp,
            }
            for tx in transactions
        ]
    }