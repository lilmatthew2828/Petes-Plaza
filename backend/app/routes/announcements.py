# FastAPI routes for admin announcements
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.schemas import AnnouncementCreate, AnnouncementUpdate, AnnouncementOut, AnnouncementDeliveryOut
from app.announcement_service import (
    create_announcement, update_announcement, delete_announcement,
    get_announcements_by_admin, get_announcement, schedule_deliveries,
    get_user_announcements, mark_announcement_read, unread_count
)
from app.models import Announcement
from datetime import datetime

router = APIRouter(prefix="/api/announcements", tags=["announcements"])

# --- Admin Endpoints ---
@router.post("/", response_model=AnnouncementOut)
def create_announcement_route(data: AnnouncementCreate, db: Session = Depends(get_db)):
    try:
        print(f"DEBUG: Received announcement data: {data}")
        ann = create_announcement(db, data)
        print(f"DEBUG: Created announcement: {ann}")
        return ann
    except Exception as e:
        print(f"DEBUG: Error creating announcement: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/{ann_id}", response_model=AnnouncementOut)
def update_announcement_route(ann_id: int, data: AnnouncementUpdate, db: Session = Depends(get_db)):
    ann = update_announcement(db, ann_id, data)
    if not ann:
        raise HTTPException(status_code=404, detail="Announcement not found")
    return ann

@router.delete("/{ann_id}")
def delete_announcement_route(ann_id: int, db: Session = Depends(get_db)):
    ok = delete_announcement(db, ann_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Announcement not found")
    return {"ok": True}

@router.get("/by_admin/{admin_id}", response_model=List[AnnouncementOut])
def list_admin_announcements(admin_id: int, db: Session = Depends(get_db)):
    print(f"[BACKEND] GET /by_admin/{admin_id} - Starting request")
    try:
        # Schedule any due announcements before fetching (so status is up to date)
        from app.models import Announcement
        from datetime import datetime
        anns = db.query(Announcement).filter(Announcement.is_sent == False, Announcement.send_at <= datetime.utcnow()).all()
        print(f"[BACKEND] Found {len(anns)} announcements to schedule")
        for ann in anns:
            schedule_deliveries(db, ann)
        result = get_announcements_by_admin(db, admin_id)
        print(f"[BACKEND] Returning {len(result)} announcements for admin {admin_id}")
        return result
    except Exception as e:
        print(f"[BACKEND] Error in /by_admin/{admin_id}: {str(e)}")
        raise

@router.get("/all", response_model=List[AnnouncementOut])
def list_all_announcements(db: Session = Depends(get_db)):
    print(f"[BACKEND] GET /all - Starting request")
    try:
        # Get all announcements ordered by most recent first
        result = db.query(Announcement).order_by(Announcement.created_at.desc()).all()
        print(f"[BACKEND] Returning {len(result)} total announcements")
        return result
    except Exception as e:
        print(f"[BACKEND] Error in /all: {str(e)}")
        raise

# --- User Endpoints ---
@router.get("/for_user/{user_id}", response_model=List[AnnouncementDeliveryOut])
def list_user_announcements(user_id: int, db: Session = Depends(get_db)):
    try:
        # Schedule any due announcements before fetching
        anns = db.query(Announcement).filter(
            Announcement.is_sent == False,
            Announcement.send_at <= datetime.utcnow()
        ).all()
        for ann in anns:
            schedule_deliveries(db, ann)
        return get_user_announcements(db, user_id)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error fetching announcements: {str(e)}")

@router.post("/mark_read/{delivery_id}")
def mark_read(delivery_id: int, user_id: int, db: Session = Depends(get_db)):
    delivery = mark_announcement_read(db, delivery_id, user_id)
    if not delivery:
        raise HTTPException(status_code=404, detail="Delivery not found")
    return {"ok": True}

@router.get("/unread_count/{user_id}")
def unread_count_route(user_id: int, db: Session = Depends(get_db)):
    return {"count": unread_count(db, user_id)}
