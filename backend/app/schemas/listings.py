# EMMANUELLA OBIDIKE
# LISTINGS SCHEMA (VALIDATION)

# Used for input validation (checks data types automatically)
from pydantic import BaseModel

# data required to create a listing
class ListingCreate(BaseModel):

    # title of listing
    listing_title: str

    # user id who created listing
    user_id: int

    # category name
    category: str

    # description of listing
    listing_description: str

    # price of item
    price: float

    

    