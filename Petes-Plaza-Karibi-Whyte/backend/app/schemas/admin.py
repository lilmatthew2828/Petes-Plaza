from pydantic import BaseModel

from .user import UserResponse

class AdminUserResponse(UserResponse):
    pass

class ListingModeration(BaseModel):
    action: str # approve | deny | archive | mark_sold