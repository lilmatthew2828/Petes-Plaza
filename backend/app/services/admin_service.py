from fastapi import fastAPI
from sqlalchemy import func
from models.user import User
from models.listing import Listing
# from models.order import Order


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
