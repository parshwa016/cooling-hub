import random
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import Complaint, User, TechnicianJob
from app.schemas import ComplaintCreate, ComplaintResponse

router = APIRouter(prefix="/api/complaints", tags=["Complaint Management"])

@router.post("/raise", response_model=ComplaintResponse)
def raise_complaint(req: ComplaintCreate, db: Session = Depends(get_db)):
    ticket_num = f"CMP-2026-{random.randint(1000, 9999)}"

    # Auto assign technician
    tech = db.query(User).filter(User.role == "technician").first()
    tech_id = tech.id if tech else None

    complaint = Complaint(
        ticket_id=ticket_num,
        user_id=req.user_id,
        ac_brand_model=req.ac_brand_model,
        issue_category=req.issue_category,
        priority=req.priority,
        description=req.description,
        photo_url=req.photo_url or "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&auto=format&fit=crop&q=80",
        status="Technician Assigned" if tech_id else "Logged",
        technician_id=tech_id
    )
    db.add(complaint)
    db.commit()
    db.refresh(complaint)

    if tech_id:
        job = TechnicianJob(
            technician_id=tech_id,
            complaint_id=complaint.id,
            job_type=f"Complaint: {req.issue_category}",
            status="Assigned"
        )
        db.add(job)
        db.commit()

    return complaint

@router.get("/track/{ticket_id}", response_model=ComplaintResponse)
def track_complaint(ticket_id: str, db: Session = Depends(get_db)):
    complaint = db.query(Complaint).filter(Complaint.ticket_id == ticket_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint ticket ID not found")
    return complaint

@router.get("/user/{user_id}", response_model=List[ComplaintResponse])
def get_user_complaints(user_id: int, db: Session = Depends(get_db)):
    return db.query(Complaint).filter(Complaint.user_id == user_id).order_by(Complaint.created_at.desc()).all()
