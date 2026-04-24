"""
Unit tests for FastAPI admin routes.
Covers endpoints in backend/app/routes/admin.py.

Run with:
    pytest backend/app/pytests/test_admin_routes.py

Ensure the backend dependencies are installed:
    pip install -r backend/requirements.txt

These tests use FastAPI's TestClient and an in-memory SQLite database for isolation and speed.
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.models import Base, User, Listing, Transactions, SessionToken
from app.database import get_db
from datetime import datetime, timedelta

# --- Setup test DB ---
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base.metadata.create_all(bind=engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)

# --- Fixtures ---
@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

@pytest.fixture
def user():
    db = TestingSessionLocal()
    user = User(email="admin@example.com", username="admin", student_id=123456, password_hash="x", is_admin=True, created_at="2024-01-01T00:00:00")
    db.add(user)
    db.commit()
    db.refresh(user)
    db.close()
    return user

@pytest.fixture
def listing(user):
    db = TestingSessionLocal()
    listing = Listing(title="Test Listing", description="desc", price=10.0, status="pending", seller_email=user.email, image_key="img.jpg", category="cat")
    db.add(listing)
    db.commit()
    db.refresh(listing)
    db.close()
    return listing

@pytest.fixture
def transaction(user, listing):
    db = TestingSessionLocal()
    tx = Transactions(listing_id=listing.id, buyer_email=user.email, seller_email=user.email, transaction_timestamp=datetime.now())
    db.add(tx)
    db.commit()
    db.refresh(tx)
    db.close()
    return tx

# --- Tests ---
def test_get_users(user):
    resp = client.get("/api/admin/users")
    assert resp.status_code == 200
    assert any(u["email"] == user.email for u in resp.json())

def test_suspend_user(user):
    resp = client.put(f"/api/admin/suspend/{user.email}")
    assert resp.status_code == 200
    assert resp.json()["message"] == "User suspended"

def test_listings_CRUD(listing):
    # List
    resp = client.get("/api/admin/listings")
    assert resp.status_code == 200
    assert any(l["title"] == listing.title for l in resp.json())
    # Delete
    resp = client.delete(f"/api/admin/listings/{listing.id}")
    assert resp.status_code == 200
    assert resp.json()["status"] == "deleted"

def test_moderate_listing(listing):
    for action, expected in [("approve", "active"), ("deny", "denied"), ("archive", "archived"), ("mark_sold", "sold")]:
        resp = client.post(f"/api/admin/listings/{listing.id}/moderate", json={"action": action})
        assert resp.status_code == 200
        assert resp.json()["status"] == expected

def test_transactions(transaction):
    resp = client.get("/api/admin/transactions")
    assert resp.status_code == 200
    assert any(t["transaction_id"] == transaction.transaction_id for t in resp.json())

def test_create_transaction(user, listing):
    payload = {
        "listing_id": listing.id,
        "buyer_email": user.email,
        "seller_email": user.email,
        "transaction_timestamp": datetime.now().isoformat()
    }
    resp = client.post("/api/admin/transactions", json=payload)
    # Should fail if already exists
    assert resp.status_code in (200, 400)

def test_user_growth(user):
    resp = client.get("/api/admin/user_growth")
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)

def test_active_users(user):
    db = TestingSessionLocal()
    token = SessionToken(user_id=user.id, token="tok", created_at=datetime.now(), expires_at=datetime.now() + timedelta(days=1))
    db.add(token)
    db.commit()
    db.close()
    resp = client.get("/api/admin/active_users")
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)

def test_active_user_emails(user):
    db = TestingSessionLocal()
    token = SessionToken(user_id=user.id, token="tok2", created_at=datetime.now(), expires_at=datetime.now() + timedelta(days=1))
    db.add(token)
    db.commit()
    db.close()
    resp = client.get("/api/admin/active_user_emails")
    assert resp.status_code == 200
    assert any(u["email"] == user.email for u in resp.json())
