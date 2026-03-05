# from sqlalchemy import Column, String, DateTime, ForeignKey, Integer, Index, Float
# from sqlalchemy.ext.declarative import declarative_base
# from sqlalchemy.types import Boolean
# from datetime import datetime
# from app.database import Base
# from sqlalchemy.orm import relationship



# from sqlalchemy.ext.declarative import declarative_base
# Base = declarative_base()

# # Models for SQLAlchemy ORM mapping to database tables.
# class User(Base):
#     __tablename__ = "users"
    
#     id = Column(Integer, primary_key=True, index=True)
#     email = Column(String, unique=True, index=True, nullable=False)
#     student_id = Column(Integer, unique=True, index=True, nullable=False)
#     username = Column(String, unique=True, index=True, nullable=False)
#     password_hash = Column(String, nullable=False)
#     created_at = Column(String, default=datetime.now)
#     is_suspended = Column(Boolean, default=False)
#     is_admin = Column(Boolean, default=False)
#     listings = relationship("Listing", back_populates="seller")
#     def __repr__(self):
#         return f"<User(email={self.email}, username={self.username})>"

# # SessionToken model for server-side session management
# class SessionToken(Base):
#     __tablename__ = "session_tokens"
    
#     id = Column(Integer, primary_key=True, autoincrement=True)
#     token = Column(String(255), unique=True, nullable=False, index=True)
#     user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
#     created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
#     expires_at = Column(DateTime, nullable=False)
#     revoked_at = Column(DateTime, nullable=True)
    
#     __table_args__ = (
#         Index("idx_active_sessions", "user_id", "revoked_at"),
#     )
    
#     def __repr__(self):
#         return f"<SessionToken(user_id={self.user_id}, active={self.revoked_at is None})>"
    

# #Daye Karibi-Whyte - Added listing model to represent items for sale in the marketplace
# class Listing(Base):
#     __tablename__ = "listings"
    
#     id = Column(Integer, primary_key=True, index=True)
#     title = Column(String, index=True, nullable=False)
#     description = Column(String, nullable=False)
#     price = Column(Float, nullable=False)
#     status = Column(String, default="available") # available or sold
#     seller_email = Column(String, ForeignKey("users.email"), nullable=False) # foreign key to users table
#     image_key = Column(String, nullable=True) # S3 key for the listing image
#     # use callables so defaults are evaluated at insert/update time
#     created_at = Column(String, default=lambda: datetime.now().isoformat())
#     updated_at = Column(String, default=lambda: datetime.now().isoformat(), onupdate=lambda: datetime.now().isoformat())
#     category = Column(String, nullable=True) # New category field for listing categorization

#     seller = relationship("User", back_populates="listings") # Establish relationship to User model, allowing access to seller info from listing
    
#     def __repr__(self):
#         return f"<Listing(title={self.title}, price={self.price}, status={self.status}, category={self.category}, created_at={self.created_at}, updated_at={self.updated_at}, description={self.description[:50]}...), seller_email={self.seller_email}>" # Updated repr to include category and seller_email for easier debugging and visualization of listing details

from datetime import datetime

from sqlalchemy import (
    Column,
    String,
    DateTime,
    ForeignKey,
    Integer,
    Index,
    Float,
    UniqueConstraint,
)
from sqlalchemy.types import Boolean
from sqlalchemy.orm import relationship

from app.database import Base


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

    listings = relationship("Listing", back_populates="seller")

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


# Daye Karibi-Whyte - Added listing model to represent items for sale in the marketplace
class Listing(Base):
    __tablename__ = "listings"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True, nullable=False)
    description = Column(String, nullable=False)
    price = Column(Float, nullable=False)
    status = Column(String, default="available")  # available or sold
    seller_email = Column(String, ForeignKey("users.email"), nullable=False)
    image_key = Column(String, nullable=True)  # S3 key for the listing image

    # use callables so defaults are evaluated at insert/update time
    created_at = Column(String, default=lambda: datetime.now().isoformat())
    updated_at = Column(
        String,
        default=lambda: datetime.now().isoformat(),
        onupdate=lambda: datetime.now().isoformat(),
    )
    category = Column(String, nullable=True)

    seller = relationship("User", back_populates="listings")

    def __repr__(self):
        return (
            f"<Listing(title={self.title}, price={self.price}, status={self.status}, "
            f"category={self.category}, created_at={self.created_at}, updated_at={self.updated_at}, "
            f"description={self.description[:50]}...), seller_email={self.seller_email}>"
        )


# ✅ Wishlist model (NEW)
class Wishlist(Base):
    __tablename__ = "wishlist"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    listing_id = Column(Integer, ForeignKey("listings.id", ondelete="CASCADE"), nullable=False)

    __table_args__ = (
        UniqueConstraint("user_id", "listing_id", name="uq_user_listing_wishlist"),
        Index("idx_wishlist_user", "user_id"),
    )

    user = relationship("User")
    listing = relationship("Listing")

    def __repr__(self):
        return f"<Wishlist(user_id={self.user_id}, listing_id={self.listing_id})>"