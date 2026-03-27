# Daye Karibi-Whyte - Pytest unit tests for admin service functions
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models import Base, User, Listing
from app.admin_service import (
    moderate_listing,
    suspend_user,
    get_dashboard_metrics,
    get_all_listings,
    get_all_users
)

# In-memory SQLite for testing
@pytest.fixture(scope="function")
def db():
    engine = create_engine("sqlite:///:memory:", echo=False, future=True)
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    yield session
    session.close()
    Base.metadata.drop_all(engine)

@pytest.fixture
def sample_user(db):
    user = User(
        id=1,
        username="testuser",
        email="test@example.com",
        is_suspended=False,
        is_admin=False,
        password_hash="hashedpassword",
        student_id=123456,
        created_at="2024-01-01T00:00:00"
        
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@pytest.fixture
def sample_listing(db):
    listing = Listing(
        title="Test Listing",
        description="Test description",
        price=10.0,
        status="pending",
        seller_email="seller@example.com",
        image_key="test.jpg",
        category="test"
    )
    db.add(listing)
    db.commit()
    db.refresh(listing)
    return listing

# ------------------- Tests -------------------

def test_suspend_user(db, sample_user):
    result = suspend_user(db, "test@example.com")
    assert result.is_suspended is True

    # Test suspending again
    duplicate_result = suspend_user(db, "test@example.com")
    assert "error" in duplicate_result
    assert duplicate_result["error"] == "User is already suspended"

def test_moderate_listing_approve(db, sample_listing):
    result = moderate_listing(db, sample_listing.id, "approve")
    assert result["status"] == "active"

def test_moderate_listing_deny(db, sample_listing):
    result = moderate_listing(db, sample_listing.id, "deny")
    assert result["status"] == "denied"

def test_moderate_listing_archive(db, sample_listing):
    result = moderate_listing(db, sample_listing.id, "archive")
    assert result["status"] == "archived"

def test_moderate_listing_mark_sold(db, sample_listing):
    result = moderate_listing(db, sample_listing.id, "mark_sold")
    assert result["status"] == "sold"

def test_moderate_listing_invalid(db, sample_listing):
    result = moderate_listing(db, sample_listing.id, "invalid_action")
    assert "error" in result

def test_get_dashboard_metrics(db, sample_user, sample_listing):
    metrics = get_dashboard_metrics(db)
    assert metrics["total_users"] >= 1
    assert metrics["total_listings"] >= 1
    assert metrics["active_listings"] >= 0

def test_get_all_users(db, sample_user):
    users = get_all_users(db)
    assert sample_user in users

def test_get_all_listings(db, sample_listing):
    listings = get_all_listings(db)
    assert sample_listing in listings