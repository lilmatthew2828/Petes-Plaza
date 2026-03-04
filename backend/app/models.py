from sqlalchemy import Column, String, DateTime, ForeignKey, Integer, Index, Float
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.types import Boolean
from datetime import datetime
from app.database import Base
from sqlalchemy.orm import relationship



Base = declarative_base()

# Models for SQLAlchemy ORM mapping to database tables.
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
    #listings = relationship("Listing", back_populates="seller")
    def __repr__(self):
        return f"<User(email={self.email}, username={self.username})>"

# SessionToken model for server-side session management
class SessionToken(Base):
    __tablename__ = "session_tokens"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    token = Column(String(255), unique=True, nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    revoked_at = Column(DateTime, nullable=True)
    
    __table_args__ = (
        Index("idx_active_sessions", "user_id", "revoked_at"),
    )
    
    def __repr__(self):
        return f"<SessionToken(user_id={self.user_id}, active={self.revoked_at is None})>"
    

#Daye Karibi-Whyte - Added listing model to represent items for sale in the marketplace
class Listing(Base):
    __tablename__ = "listings"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True, nullable=False)
    description = Column(String, nullable=False)
    price = Column(Float, nullable=False)
    status = Column(String, default="available") # available or sold
    seller_email = Column(String, nullable=False)    
    image_key = Column(String, nullable=True) # S3 key for the listing image
    category = Column(String)
    # use callables so defaults are evaluated at insert/update time
    created_at = Column(String, default=lambda: datetime.now().isoformat())
    updated_at = Column(String, default=lambda: datetime.now().isoformat(), onupdate=lambda: datetime.now().isoformat())

    #seller = relationship("User", back_populates="listings")    
    
    def __repr__(self):
        return f"<Listing(title={self.title}, price={self.price}, status={self.status})>"