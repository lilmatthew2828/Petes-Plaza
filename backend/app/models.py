from sqlalchemy import Column, String, DateTime, ForeignKey, Integer, Index
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.types import Boolean
from datetime import datetime

Base = declarative_base()

# Models for SQLAlchemy ORM mapping to database tables.
class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True)
    email = Column(String(255), unique=True, nullable=False)
    student_id = Column(Integer)
    created_at = Column(DateTime, nullable=False)
    is_admin = Column(Boolean, nullable=False, default=False)
    password_hash = Column(String(255))
    username = Column(String(255))
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