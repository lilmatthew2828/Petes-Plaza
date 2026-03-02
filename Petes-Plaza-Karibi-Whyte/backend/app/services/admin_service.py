# package-qualified imports so module works when running as package
from sqlalchemy import func
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.listing import Listing
# from models.order import Order


def moderate_listing(db: Session, listing_id: int, action: str):
    
    listing = db.query(Listing).filter(Listing.id == listing_id).first() #Grab the listing given its ID
    if not listing:
        return {"error": "Listing not found"} # If the listing doesn't exist, return an error message
    
    if action == "approve":
        listing.status = "active" # If the action is to approve, set the listing status to active
    elif action == "deny":
        listing.status = "denied"
    elif action == "archive":
        listing.status = "archived"
    elif action == "mark_sold":
        listing.status = "sold"
    else:
        return {"error": "Invalid action"} # If the action is not valid, return an error message
    
    db.commit() # Commit the changes to the database
    return listing # Return the updated listing object

def suspend_user(db: Session, user_id: int):
    user = db.query(User).filter(User.id == user_id).first() #Grab the user given their ID
    if not user:
        return {"error": "User not found"} # If the user doesn't exist, return an error message
    
    if user.is_suspended:
        return {"error": "User is already suspended"} # If the user is already suspended, return an error message
    else:
        user.is_suspended = True # Set the user's suspended status to True
        db.commit() # Commit the changes to the database
        return user # Return the updated user object    
# Admin service to handle admin-related operations like fetching dashboard metrics, managing listings, etc.
def get_dashboard_metrics(db):
    total_users = db.query(func.count(User.id)).scalar() # count the total number of users in the database
    total_listings = db.query(func.count(Listing.id)).scalar() # count the total number of listings in the database
    active_listings = db.query(func.count(Listing.id)).filter(Listing.status == "active").scalar() # count the number of active listings in the database
    # total_orders = db.query(func.count(Order.id)).scalar() # Uncomment when Order model is defined
    return {
        "total_users": total_users,
        "total_listings": total_listings,
        "active_listings": active_listings,
        # "total_orders": total_orders
    }
