#Jania Southall
# Schemas for user registration, login, and responses using Pydantic
# PYDANTIC is a data validation library that allows us to define data models with type annotations and validation rules. 
# It is commonly used in FastAPI to define request and response schemas.
from decimal import Decimal
from pydantic import BaseModel, EmailStr, Field
# Datetime is used to represent the created_at field in UserOut schema
from datetime import datetime
from typing import Optional


class RegisterIn(BaseModel):
    """
    Schema for user registration request.
    Validates that email is a proper email, username is 3-100 chars, student_id is 6 digits, and password is at least 8 chars.
    Also checks that password and confirm_password match.
    """
    email: EmailStr = Field(..., description="User email address")
    username: str = Field(..., min_length=3, max_length=100, description="Username (3-100 characters)")
    student_id: int = Field(..., ge=100000, le=999999, description="Student ID")
    password: str = Field(..., min_length=8, max_length=100, description="Password (minimum 8 characters)")
    confirm_password: str = Field(..., description="Confirm password")
    
    
    def validate_passwords_match(self):
        """Check passwords match."""
        if self.password != self.confirm_password:
            raise ValueError("Passwords do not match")
    
    class Config:
        json_schema_extra = {
            "example": {
                "email": "student@example.com",
                "username": "sample_Seller",
                "student_id": 12345,
                "password": "FakePassword123!",
                "confirm_password": "FakePassword123!",
            }
        }


class LoginIn(BaseModel):
    """
    Schema for user login request.
    User can login by email or username.
    """
    identifier: str = Field(..., description="Email or username")
    password: str = Field(..., description="Password")
    
    class Config:
        json_schema_extra = {
            "example": {
                "identifier": "student@example.com",
                "password": "FakePassword123!",
            }
        }


class UserOut(BaseModel):
    """
    Schema for user response.
    does not includes password_hash.
    """
    email: str = Field(..., description="User email")
    username: str = Field(..., description="Username")
    student_id: int = Field(..., description="Student ID")
    created_at: datetime = Field(..., description="Account creation timestamp")
    
    class Config:
        # Allow creation from SQLAlchemy ORM 
        from_attributes = True 
        json_schema_extra = {
            "example": {
                "email": "student@example.com",
                "username": "sample_Seller",
                "student_id": 12345,
                "created_at": "2026-02-26T12:00:00",
            }
        }


class TokenOut(BaseModel):
    """
    Schema for token/session response.
    """
    access_token: Optional[str] = Field(None, description="Session token (if applicable)")
    token_type: str = Field(default="bearer", description="Token type")
    user: UserOut = Field(..., description="User info")
    
    class Config:
        json_schema_extra = {
            "example": {
                "access_token": "session_token_string",
                "token_type": "bearer",
                "user": {
                    "email": "student@example.com",
                    "username": "sample_Seller",
                    "student_id": 12345,
                    "created_at": "2026-02-26T12:00:00",
                }
            }
        }


class ErrorOut(BaseModel):
    """
    Schema for error responses.
    """
    detail: str = Field(..., description="Error message")
    
    class Config:
        json_schema_extra = {
            "example": {
                "detail": "Invalid credentials"
            }
        }
        
# ======= Daye Karibi-Whyte - Added admin and listing schemas for admin moderation endpoints =======
class AdminUserResponse(UserOut):
    is_admin: bool = Field(False, description="Whether user is admin")

class ListingModeration(BaseModel):
    action: str # approve | deny | archive | mark_sold

class ListingCreate(BaseModel): # Define the schema for creating a new listing
    title: str
    description: Optional[str] = None
    price: Decimal
    pickup_location: str
    seller_email: str
    image_url: Optional[str] = None
    category: Optional[str] = "Other" # Default category if not provided


class ListingResponse(BaseModel): # Define the schema for the response when fetching a listing
    id: int
    title: str
    description: Optional[str]
    price: Decimal
    status: str
    seller_email: str
    image_url: Optional[str] = None
    category: Optional[str] = None
    
    class Config:
        orm_mode = True # This allows Pydantic to work with SQLAlchemy models and convert them to the response format correctly
        from_attributes = True # This allows Pydantic to read data from SQLAlchemy model attributes when creating the response object