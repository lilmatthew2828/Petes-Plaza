from datetime import datetime
from sqlalchemy import DECIMAL, Column, String, DateTime, ForeignKey, Integer, Index, Float, UniqueConstraint
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
    listings = relationship("Listing", back_populates="seller", foreign_keys="[Listing.seller_email]") # Establish relationship to Listing model, allowing access to seller's listings from user
    purchases = relationship("Transactions", back_populates="buyer", foreign_keys="[Transactions.buyer_email]")
    sales = relationship("Transactions", back_populates="seller", foreign_keys="[Transactions.seller_email]")
    def __repr__(self):
        return f"<User(email={self.email}, username={self.username})>"

# SessionToken model for server-side session management
class SessionToken(Base):
    __tablename__ = "session_tokens"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    token = Column(String(255), unique=True, nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime, default=datetime.now, nullable=False)
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
    status = Column(String, default="draft") # draft for the default
    seller_email = Column(String, ForeignKey("users.email"), nullable=False) # foreign key to users table
    image_key = Column(String, nullable=True) # S3 key for the listing image
    # use callables so defaults are evaluated at insert/update time
    created_at = Column(String, default=lambda: datetime.now().isoformat())
    updated_at = Column(String, default=lambda: datetime.now().isoformat(), onupdate=lambda: datetime.now().isoformat())
    category = Column(String, nullable=True) # New category field for listing categorization

    seller = relationship("User", back_populates="listings", foreign_keys=[seller_email])
    transaction = relationship("Transactions", back_populates="listing", uselist=False)

    def __repr__(self):
        return f"<Listing(title={self.title}, price={self.price}, status={self.status}, category={self.category}, created_at={self.created_at}, updated_at={self.updated_at}, description={self.description[:50]}...), seller_email={self.seller_email}>" # Updated repr to include category and seller_email for easier debugging and visualization of listing details# from sqlalchemy import Column, String, DateTime, ForeignKey, Integer, Index, Float


# Wishlist model (NEW)
class Wishlist(Base):  # Matthew Kilpatrick
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

# Daye Karibi-Whyte - Added transactions model to represent completed purchases in the marketplace, linking buyers, sellers, and listings together for record-keeping and potential future features like order history or dispute resolution.
class Transactions(Base):
    __tablename__ = "transactions"
    
    transaction_id = Column(Integer, primary_key=True, index=True)
    buyer_email = Column(String, ForeignKey("users.email"), nullable=False)
    seller_email = Column(String, ForeignKey("users.email"), nullable=False)
    listing_id = Column(Integer, ForeignKey("listings.id", ondelete="CASCADE"), nullable=False)
    transaction_timestamp = Column(DateTime, default=datetime.now, nullable=False)
    
    buyer = relationship("User", back_populates="purchases", foreign_keys=[buyer_email])
    seller = relationship("User", back_populates="sales", foreign_keys=[seller_email])
    listing = relationship("Listing", back_populates="transaction")
    
    def __repr__(self):
        return f"<Transaction(transaction_id={self.transaction_id}, buyer_email={self.buyer_email}, listing_id={self.listing_id}, transaction_timestamp={self.transaction_timestamp})>"

class Announcement(Base):
    __tablename__ = "announcements"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    body = Column(String, nullable=False)
    recipient_type = Column(String(20), nullable=False)  # admins, users, all
    announcement_type = Column(String(50), nullable=False)  # event, update, notice, etc.
    send_at = Column(DateTime, nullable=False)
    is_sent = Column(Boolean, default=False)
    announcer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    announcer = relationship("User", foreign_keys=[announcer_id])
    deliveries = relationship("AnnouncementDelivery", back_populates="announcement", cascade="all, delete-orphan")

class AnnouncementDelivery(Base):
    __tablename__ = "announcement_deliveries"

    id = Column(Integer, primary_key=True, index=True)
    announcement_id = Column(Integer, ForeignKey("announcements.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    is_read = Column(Boolean, default=False)
    read_at = Column(DateTime, nullable=True)
    delivered_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (UniqueConstraint("announcement_id", "user_id", name="uq_announcement_user"),)

    announcement = relationship("Announcement", back_populates="deliveries")
    user = relationship("User")
from sqlalchemy import Enum as PgEnum
import enum
# --- Announcements Feature ---
class RecipientType(enum.Enum):
    admins = "admins"
    users = "users"
    all = "all"

class AnnouncementType(enum.Enum):
    event = "event"
    update = "update"
    notice = "notice"