# EMMANUELLA OBIDIKE
# LISTINGS LOGIC / SERVICES

# TEMP fake data (for debugging)
# this will be replaced with real database later
fake_listings_db = []


def get_all_listings():
    return fake_listings_db


def get_single_listing(listing_id):

    for listing in fake_listings_db:
        if listing["id"] == listing_id:
            return listing

    return {"message": "listing not found"}


def create_listing(listing_data):

    new_listing = {
        "id": len(fake_listings_db) + 1,
        "listing_title": listing_data.listing_title,
        "listing_description": listing_data.listing_description,
        "price": listing_data.price,
        "category": listing_data.category,
        "user_id": listing_data.user_id
    }

    fake_listings_db.append(new_listing)

    return new_listing