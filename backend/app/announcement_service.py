# Announcement Service Logic
from sqlalchemy.orm import Session
from datetime import datetime
from app.models import Announcement, AnnouncementDelivery, User
from app.schemas import AnnouncementCreate, AnnouncementUpdate

# --- Announcement CRUD ---
def create_announcement(db: Session, data: AnnouncementCreate) -> Announcement:
    ann = Announcement(**data.dict())
    db.add(ann)
    db.commit()
    db.refresh(ann)
    return ann

def update_announcement(db: Session, ann_id: int, data: AnnouncementUpdate) -> Announcement:
    ann = db.query(Announcement).filter(Announcement.id == ann_id).first()
    if not ann:
        return None
    for field, value in data.dict(exclude_unset=True).items():
        setattr(ann, field, value)
    db.commit()
    db.refresh(ann)
    return ann

def delete_announcement(db: Session, ann_id: int) -> bool:
    ann = db.query(Announcement).filter(Announcement.id == ann_id).first()
    if not ann:
        return False
    db.delete(ann)
    db.commit()
    return True

def get_announcements_by_admin(db: Session, admin_id: int):
    return db.query(Announcement).filter(Announcement.announcer_id == admin_id).order_by(Announcement.created_at.desc()).all()

def get_announcement(db: Session, ann_id: int):
    return db.query(Announcement).filter(Announcement.id == ann_id).first()

# --- Delivery Logic ---
def schedule_deliveries(db: Session, ann: Announcement):
    # Only schedule if not sent and send_at <= now
    if ann.is_sent or ann.send_at > datetime.utcnow():
        return

    # Find users based on recipient type
    if ann.recipient_type == "admins":
        users = db.query(User).filter(User.is_admin == True, User.is_suspended == False).all()
    elif ann.recipient_type == "users":
        users = db.query(User).filter(User.is_admin == False, User.is_suspended == False).all()
    else:  # "all"
        users = db.query(User).filter(User.is_suspended == False).all()

    # Always include the sender (admin) in deliveries
    sender = db.query(User).filter(User.id == ann.announcer_id).first()
    if sender and sender not in users:
        users.append(sender)

    # Create deliveries for all users
    for user in users:
        exists = db.query(AnnouncementDelivery).filter_by(
            announcement_id=ann.id,
            user_id=user.id
        ).first()
        if not exists:
            delivery = AnnouncementDelivery(announcement_id=ann.id, user_id=user.id)
            db.add(delivery)

    # Mark announcement as sent and commit all changes at once
    ann.is_sent = True
    db.commit()
    db.refresh(ann)

def get_user_announcements(db: Session, user_id: int):
    # Only show delivered announcements with eager loading of announcement
    from sqlalchemy.orm import joinedload
    return db.query(AnnouncementDelivery).options(
        joinedload(AnnouncementDelivery.announcement)
    ).filter(
        AnnouncementDelivery.user_id == user_id
    ).order_by(AnnouncementDelivery.delivered_at.desc()).all()

def mark_announcement_read(db: Session, delivery_id: int, user_id: int):
    delivery = db.query(AnnouncementDelivery).filter_by(id=delivery_id, user_id=user_id).first()
    if delivery and not delivery.is_read:
        delivery.is_read = True
        delivery.read_at = datetime.utcnow()
        db.commit()
    return delivery

def unread_count(db: Session, user_id: int):
    return db.query(AnnouncementDelivery).filter_by(user_id=user_id, is_read=False).count()
