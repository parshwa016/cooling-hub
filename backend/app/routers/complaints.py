import os
import uuid
import shutil
import random
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import Complaint, User, Notification
from app.schemas import ComplaintCreate, ComplaintResponse

router = APIRouter(prefix="/api/complaints", tags=["Complaint Management"])

@router.post("/upload-photo")
async def upload_complaint_photo(file: UploadFile = File(...)):
    static_uploads = os.path.join(os.path.dirname(__file__), "..", "..", "static", "uploads", "complaints")
    os.makedirs(static_uploads, exist_ok=True)
    
    ext = os.path.splitext(file.filename)[1] or ".jpg"
    unique_name = f"complaint_{uuid.uuid4().hex[:12]}{ext}"
    dest_path = os.path.join(static_uploads, unique_name)
    
    with open(dest_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    photo_url = f"http://127.0.0.1:8000/static/uploads/complaints/{unique_name}"
    return {"url": photo_url, "filename": unique_name}


def serialize_complaint(c: Complaint) -> dict:
    return {
        "id": c.id,
        "ticket_id": c.ticket_id,
        "user_id": c.user_id,
        "customer_name": c.customer_name or (c.user.name if c.user else "Customer"),
        "customer_phone": c.customer_phone or (c.user.phone if c.user else "N/A"),
        "customer_address": c.customer_address or (c.user.address if c.user else "N/A"),
        "preferred_slot": c.preferred_slot or "Morning (9 AM - 12 PM)",
        "ac_brand_model": c.ac_brand_model,
        "issue_category": c.issue_category,
        "priority": c.priority,
        "description": c.description,
        "photo_url": c.photo_url,
        "status": c.status,
        "technician_id": c.technician_id,
        "technician_name": c.technician.name if c.technician else None,
        "resolution_notes": c.resolution_notes,
        "service_notes": c.service_notes,
        "accepted_at": c.accepted_at,
        "completed_at": c.completed_at,
        "created_at": c.created_at
    }

@router.post("/raise", response_model=ComplaintResponse)
def raise_complaint(req: ComplaintCreate, db: Session = Depends(get_db)):
    while True:
        ticket_num = f"CMP-2026-{random.randint(1000, 99999)}"
        if not db.query(Complaint).filter(Complaint.ticket_id == ticket_num).first():
            break

    user = db.query(User).filter(User.id == req.user_id).first()
    cust_name = req.customer_name or (user.name if user else "Customer")
    cust_phone = req.customer_phone or (user.phone if user else "")
    cust_addr = req.customer_address or (user.address if user else "")

    # Requirement 1: Create request with initial status Pending. DO NOT mark confirmed, assigned, or completed.
    complaint = Complaint(
        ticket_id=ticket_num,
        user_id=req.user_id,
        customer_name=cust_name,
        customer_phone=cust_phone,
        customer_address=cust_addr,
        preferred_slot=req.preferred_slot or "Tomorrow (10 AM - 1 PM)",
        ac_brand_model=req.ac_brand_model,
        issue_category=req.issue_category,
        priority=req.priority,
        description=req.description,
        photo_url=req.photo_url or "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&auto=format&fit=crop&q=80",
        status="Pending",
        technician_id=None
    )
    db.add(complaint)

    # Requirement 1 & 8: Admin immediately receives a new service request notification
    admin_notif = Notification(
        role="admin",
        title="New Service Request",
        message=f"Customer {cust_name} has submitted a new service request (#{ticket_num}).",
        type="service_request_submitted",
        related_id=ticket_num
    )
    db.add(admin_notif)

    db.commit()
    db.refresh(complaint)

    return serialize_complaint(complaint)

@router.get("/track/{ticket_id}", response_model=ComplaintResponse)
def track_complaint(ticket_id: str, db: Session = Depends(get_db)):
    complaint = db.query(Complaint).filter(Complaint.ticket_id == ticket_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint ticket ID not found")
    return serialize_complaint(complaint)

@router.get("/user/{user_id}", response_model=List[ComplaintResponse])
def get_user_complaints(user_id: int, db: Session = Depends(get_db)):
    complaints = db.query(Complaint).filter(Complaint.user_id == user_id).order_by(Complaint.created_at.desc()).all()
    return [serialize_complaint(c) for c in complaints]
