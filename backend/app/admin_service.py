# package-qualified imports so module works when running as package
from sqlalchemy import func
from sqlalchemy.orm import Session
from app.models import User
from app.models import Listing
# from models.order import Order

# Admin service to handle admin-related operations like fetching dashboard metrics, managing listings, etc. - Daye Karibi-Whyte
def moderate_listing(db: Session, listing_id: int, action: str) -> dict: # Specify that the function returns a dictionary
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        return {"error": "Listing not found"}  # return dict 
    #All the possible actions for moderating a listing except for deletion.
    if action == "approve":
        listing.status = "active"
    elif action == "deny":
        listing.status = "denied"
    elif action == "archive":
        listing.status = "archived"
    elif action == "mark_sold":
        listing.status = "sold"
    else:
        return {"error": "Invalid action"}  # return dict 

    db.commit()
    db.refresh(listing)

    # return a dict with the listing id, title, and new status for frontend to display in moderation queue
    return {
        "id": listing.id,
        "title": listing.title,
        "status": listing.status
    }

def suspend_user(db: Session, user_id: int) -> dict: # Specify that the function returns a dictionary
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
def get_dashboard_metrics(db: Session) -> dict: # Specify that the function returns a dictionary
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

def get_all_listings(db: Session) -> list[Listing]: # Specify that the function returns a list of Listing objects
    listings = db.query(Listing).all() # Query all listings from the database
    return listings # Return the list of listings to the caller

def get_all_users(db: Session) -> list[User]: # Specify that the function returns a list of User objects
    users = db.query(User).all() # Query all users from the database
    return users # Return the list of users to the caller