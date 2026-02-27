from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Listing(Base):
    __tablename__ = "listings"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True, nullable=False)
    description = Column(String, nullable=False)
    price = Column(Float, nullable=False)
    status = Column(String, default="available") # available or sold
    seller_id = Column(Integer, ForeignKey("users.id"), nullable=False) # foreign key to users table

    seller = relationship("User", back_populates="listings")