from sqlalchemy import Column, Integer, String, ForeignKey, Numeric, PrimaryKeyConstraint, Boolean
from sqlalchemy.orm import relationship
from app.database import Base
from datetime import datetime

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    student_id = Column(Integer, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    created_at = Column(String, default=datetime.now)
    is_suspended = Column(Boolean, default=False)
    is_admin = Column(Boolean, default=False)
    listings = relationship("Listing", back_populates="seller")


