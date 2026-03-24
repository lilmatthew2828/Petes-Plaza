# EMMANUELLA OBIDIKE
# LISTINGS LOGIC / SERVICES 

from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import Listing
from app.listing_schemas.listings import ListingCreate


# Get all listings
def get_all_listings():
    db: Session = SessionLocal()
    try:
        listings = db.query(Listing).order_by(Listing.id.desc()).all()
        return [
            {
                "id": l.id,
                "title": l.title,
                "listing_title": l.title,
                "description": l.description,
                "listing_description": l.description,
                "price": float(l.price),
                "category": l.category,  
                "image_url": l.image_key,
                "image_key": l.image_key,
            }
            for l in listings
        ]
    finally:
        db.close()

# Get sold listings for the current user
def get_my_sold_listings(user_email: str):
    db = SessionLocal()

    listings = db.query(Listing).filter(
        Listing.seller_email == user_email,
        Listing.sold == True
    ).all()

    db.close()
    return listings

# Get single listing by ID
def get_single_listing(listing_id: int):
    db: Session = SessionLocal()
    try:
        listing = db.query(Listing).filter(Listing.id == listing_id).first()
        if not listing:
            return {"message": "listing not found"}

        return {
            "id": listing.id,
            "title": listing.title,
            "listing_title": listing.title,
            "description": listing.description,
            "listing_description": listing.description,
            "price": listing.price,
            "category": listing.category,
            "image_url": listing.image_key,
            "image_key": listing.image_key,
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

        return {
            "id": new_listing.id,
            "title": new_listing.title,
            "listing_title": new_listing.title,
            "description": new_listing.description,
            "listing_description": new_listing.description,
            "price": new_listing.price,
            "category": new_listing.category,
            "image_url": new_listing.image_key,
            "image_key": new_listing.image_key,
        }
    finally:
        db.close()