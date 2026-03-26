# EMMANUELLA OBIDIKE
# LISTINGS LOGIC / SERVICES

from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import Listing, User
from app.listing_schemas.listings import ListingCreate


# Get all listings
def get_all_listings():
    db: Session = SessionLocal()
    try:
        listings = db.query(Listing).order_by(Listing.id.desc()).all()

        results = []
        for l in listings:
            seller = db.query(User).filter(User.email == l.seller_email).first()
            seller_name = seller.username if seller else l.seller_email

            results.append({
                "id": l.id,
                "title": l.title,
                "listing_title": l.title,
                "description": l.description,
                "listing_description": l.description,
                "price": float(l.price),
                "category": l.category,
                "image_url": f"https://petes-plaza-bucket.s3.amazonaws.com/{l.image_key}" if l.image_key else None,
                "image_key": l.image_key,
                "seller_email": l.seller_email,
                "seller_name": seller_name,
                "status": l.status,
            })

        return results
    finally:
        db.close()


# Get single listing by ID
def get_single_listing(listing_id: int):
    db: Session = SessionLocal()
    try:
        listing = db.query(Listing).filter(Listing.id == listing_id).first()
        if not listing:
            return {"message": "listing not found"}

        seller = db.query(User).filter(User.email == listing.seller_email).first()
        seller_name = seller.username if seller else listing.seller_email

        return {
            "id": listing.id,
            "title": listing.title,
            "listing_title": listing.title,
            "description": listing.description,
            "listing_description": listing.description,
            "price": float(listing.price),
            "category": listing.category,
            "image_url": f"https://petes-plaza-bucket.s3.amazonaws.com/{listing.image_key}" if listing.image_key else None,
            "image_key": listing.image_key,
            "seller_email": listing.seller_email,
            "seller_name": seller_name,
            "status": listing.status,
        }
    finally:
        db.close()


# Create a new listing
def create_listing(listing_data: ListingCreate, seller_email: str):
    db: Session = SessionLocal()
    try:
        new_listing = Listing(
            title=listing_data.listing_title,
            description=listing_data.listing_description,
            price=listing_data.price,
            seller_email=seller_email,
            category=listing_data.category,
            image_key=listing_data.image_key,
            status="active"
        )

        db.add(new_listing)
        db.commit()
        db.refresh(new_listing)

        seller = db.query(User).filter(User.email == new_listing.seller_email).first()
        seller_name = seller.username if seller else new_listing.seller_email

        return {
            "id": new_listing.id,
            "title": new_listing.title,
            "listing_title": new_listing.title,
            "description": new_listing.description,
            "listing_description": new_listing.description,
            "price": float(new_listing.price),
            "category": new_listing.category,
            "image_url": f"https://petes-plaza-bucket.s3.amazonaws.com/{new_listing.image_key}" if new_listing.image_key else None,
            "image_key": new_listing.image_key,
            "seller_email": new_listing.seller_email,
            "seller_name": seller_name,
            "status": new_listing.status,
        }
    finally:
        db.close()