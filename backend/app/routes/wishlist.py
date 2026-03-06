
# Matthew Kilpatrick
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Wishlist, Listing, User
from app.auth import require_login  # ✅ use the working session auth

router = APIRouter(prefix="/api/wishlist", tags=["wishlist"])  # ✅ put under /api


@router.get("/")
def get_wishlist(
    db: Session = Depends(get_db),
    user: User = Depends(require_login),
):
    items = (
        db.query(Listing)
        .join(Wishlist, Wishlist.listing_id == Listing.id)
        .filter(Wishlist.user_id == user.id)
        .all()
    )
    return items


@router.post("/{listing_id}")
def add_to_wishlist(
    listing_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(require_login),
):
    # prevent duplicates
    exists = (
        db.query(Wishlist)
        .filter(Wishlist.user_id == user.id, Wishlist.listing_id == listing_id)
        .first()
    )
    if exists:
        return {"message": "Already in wishlist"}

    db.add(Wishlist(user_id=user.id, listing_id=listing_id))
    db.commit()
    return {"message": "Added to wishlist"}


@router.delete("/{listing_id}")
def remove_from_wishlist(
    listing_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(require_login),
):
    db.query(Wishlist).filter(
        Wishlist.user_id == user.id,
        Wishlist.listing_id == listing_id,
    ).delete()

    db.commit()
    return {"message": "Removed from wishlist"}