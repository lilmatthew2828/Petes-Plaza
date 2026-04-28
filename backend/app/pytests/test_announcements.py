import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models import Base, User, Announcement, AnnouncementDelivery
from app.services.announcement_service import (
    create_announcement, update_announcement, delete_announcement,
    schedule_deliveries, get_user_announcements, mark_announcement_read, unread_count
)
from app.schemas import AnnouncementCreate, AnnouncementUpdate
from datetime import datetime, timedelta

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
def admin(db):
    user = User(
        id=1,
        username="admin",
        email="admin@example.com",
        is_suspended=False,
        is_admin=True,
        password_hash="x",
        student_id=123456,
        created_at="2024-01-01T00:00:00"
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@pytest.fixture
def user(db):
    user = User(
        id=2,
        username="user",
        email="user@example.com",
        is_suspended=False,
        is_admin=False,
        password_hash="x",
        student_id=654321,
        created_at="2024-01-01T00:00:00"
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def test_create_announcement(db, admin):
    data = AnnouncementCreate(
        title="Test",
        body="Body",
        recipient_type="all",
        announcement_type="event",
        send_at=datetime.utcnow() - timedelta(minutes=1),
        announcer_id=admin.id
    )
    ann = create_announcement(db, data)
    assert ann.id is not None
    assert ann.title == "Test"

def test_update_announcement(db, admin):
    data = AnnouncementCreate(
        title="Test",
        body="Body",
        recipient_type="all",
        announcement_type="event",
        send_at=datetime.utcnow(),
        announcer_id=admin.id
    )
    ann = create_announcement(db, data)
    upd = AnnouncementUpdate(title="Updated")
    ann2 = update_announcement(db, ann.id, upd)
    assert ann2.title == "Updated"

def test_delete_announcement(db, admin):
    data = AnnouncementCreate(
        title="Test",
        body="Body",
        recipient_type="all",
        announcement_type="event",
        send_at=datetime.utcnow(),
        announcer_id=admin.id
    )
    ann = create_announcement(db, data)
    ok = delete_announcement(db, ann.id)
    assert ok

def test_schedule_deliveries(db, admin, user):
    data = AnnouncementCreate(
        title="Test",
        body="Body",
        recipient_type="all",
        announcement_type="event",
        send_at=datetime.utcnow() - timedelta(minutes=1),
        announcer_id=admin.id
    )
    ann = create_announcement(db, data)
    schedule_deliveries(db, ann)
    deliveries = db.query(AnnouncementDelivery).filter_by(announcement_id=ann.id).all()
    assert len(deliveries) == 2

def test_get_user_announcements(db, admin, user):
    data = AnnouncementCreate(
        title="Test",
        body="Body",
        recipient_type="all",
        announcement_type="event",
        send_at=datetime.utcnow() - timedelta(minutes=1),
        announcer_id=admin.id
    )
    ann = create_announcement(db, data)
    schedule_deliveries(db, ann)
    user_deliveries = get_user_announcements(db, user.id)
    assert len(user_deliveries) == 1

def test_mark_announcement_read(db, admin, user):
    data = AnnouncementCreate(
        title="Test",
        body="Body",
        recipient_type="all",
        announcement_type="event",
        send_at=datetime.utcnow() - timedelta(minutes=1),
        announcer_id=admin.id
    )
    ann = create_announcement(db, data)
    schedule_deliveries(db, ann)
    delivery = db.query(AnnouncementDelivery).filter_by(user_id=user.id).first()
    assert not delivery.is_read
    mark_announcement_read(db, delivery.id, user.id)
    db.refresh(delivery)
    assert delivery.is_read
    assert delivery.read_at is not None

def test_unread_count(db, admin, user):
    data = AnnouncementCreate(
        title="Test",
        body="Body",
        recipient_type="all",
        announcement_type="event",
        send_at=datetime.utcnow() - timedelta(minutes=1),
        announcer_id=admin.id
    )
    ann = create_announcement(db, data)
    schedule_deliveries(db, ann)
    count = unread_count(db, user.id)
    assert count == 1
    delivery = db.query(AnnouncementDelivery).filter_by(user_id=user.id).first()
    mark_announcement_read(db, delivery.id, user.id)
    count2 = unread_count(db, user.id)
    assert count2 == 0
