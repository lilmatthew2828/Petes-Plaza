from pydantic import BaseModel, EmailStr

class UserCreate(BaseModel): # Define the schema for creating a new user
    email: EmailStr
    password: str
    student_id: int
    username: str

class UserResponse(BaseModel): # Define the schema for the response when fetching user data
    id: int
    email: EmailStr
    student_id: int
    username: str
    created_at: str
    is_suspended: bool
    is_admin: bool
    
    class Config:
        orm_mode = True # This allows Pydantic to work with SQLAlchemy models and convert them to the response format correctly
        from_attributes = True # This allows Pydantic to read data from SQLAlchemy model attributes when creating the response object