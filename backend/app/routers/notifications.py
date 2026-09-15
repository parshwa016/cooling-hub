from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models import Notification
from app.schemas import NotificationResponse

router = APIRouter(prefix="/api/notifications", tags=["Notifications"])

@router.get("", response_model=List[NotificationResponse])
def get_notifications(
    user_id: Optional[int] = None,
    role: Optional[str] = None,
    limit: int = 30,
    db: Session = Depends(get_db)
):
    query = db.query(Notification)
    if user_id:
        if role:
            query = query.filter((Notification.user_id == user_id) | (Notification.role == role) | (Notification.role == "all"))
        else:
            query = query.filter((Notification.user_id == user_id) | (Notification.role == "all"))
    elif role:
        query = query.filter((Notification.role == role) | (Notification.role == "all"))
    
    return query.order_by(Notification.created_at.desc()).limit(limit).all()

@router.post("/{notification_id}/read")
def mark_notification_read(notification_id: int, db: Session = Depends(get_db)):
    notif = db.query(Notification).filter(Notification.id == notification_id).first()
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
    notif.is_read = True
    db.commit()
    return {"message": "Notification marked as read"}

@router.post("/mark-all-read")
def mark_all_notifications_read(
    user_id: Optional[int] = None,
    role: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Notification)
    if user_id:
        query = query.filter((Notification.user_id == user_id) | (Notification.role == role))
    elif role:
        query = query.filter(Notification.role == role)
    
    query.update({Notification.is_read: True}, synchronize_session=False)
    db.commit()
    return {"message": "All notifications marked as read"}
