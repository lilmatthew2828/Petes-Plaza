from pydantic import BaseModel
from typing import Optional
from decimal import Decimal

class ListingCreate(BaseModel): # Define the schema for creating a new listing
    title: str
    description: Optional[str] = None
    price: Decimal
    pickup_location: str
    image_url: Optional[str] = None
    category: Optional[str] = "Other" # Default category if not provided


class ListingResponse(BaseModel): # Define the schema for the response when fetching a listing
    id: int
    title: str
    description: Optional[str]
    price: Decimal
    status: str
    seller_id: int
    image_url: Optional[str] = None
    category: Optional[str] = None
    
    class Config:
        orm_mode = True # This allows Pydantic to work with SQLAlchemy models and convert them to the response format correctly
        from_attributes = True # This allows Pydantic to read data from SQLAlchemy model attributes when creating the response object