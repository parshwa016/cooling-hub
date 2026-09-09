from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import TechnicianJob, ServiceBooking, Complaint
from app.schemas import TechnicianJobUpdate

router = APIRouter(prefix="/api/technician", tags=["Technician Portal"])

@router.get("/jobs/{technician_id}")
def get_technician_jobs(technician_id: int, db: Session = Depends(get_db)):
    jobs = db.query(TechnicianJob).filter(TechnicianJob.technician_id == technician_id).order_by(TechnicianJob.created_at.desc()).all()
    result = []
    for job in jobs:
        detail = {
            "id": job.id,
            "job_type": job.job_type,
            "status": job.status,
            "diagnosis": job.diagnosis,
            "parts_used": job.parts_used,
            "before_photo": job.before_photo,
            "after_photo": job.after_photo,
            "customer_signature": job.customer_signature,
            "rating": job.rating,
            "feedback": job.feedback,
            "created_at": job.created_at,
            "completed_at": job.completed_at
        }
        if job.booking:
            detail["customer_name"] = job.booking.user.name if job.booking.user else "Customer"
            detail["customer_phone"] = job.booking.user.phone if job.booking.user else "N/A"
            detail["address"] = job.booking.address
            detail["service_name"] = job.booking.service.title if job.booking.service else "Service"
            detail["time_slot"] = f"{job.booking.service_date} ({job.booking.service_time_slot})"
        elif job.complaint:
            detail["customer_name"] = job.complaint.user.name if job.complaint.user else "Customer"
            detail["customer_phone"] = job.complaint.user.phone if job.complaint.user else "N/A"
            detail["address"] = job.complaint.user.address if job.complaint.user else "Customer Address"
            detail["ac_details"] = job.complaint.ac_brand_model
            detail["issue"] = job.complaint.issue_category
            detail["description"] = job.complaint.description
        result.append(detail)
    return result

@router.post("/jobs/{job_id}/update")
def update_job(job_id: int, req: TechnicianJobUpdate, db: Session = Depends(get_db)):
    job = db.query(TechnicianJob).filter(TechnicianJob.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Technician job not found")

    job.status = req.status
    if req.diagnosis:
        job.diagnosis = req.diagnosis
    if req.parts_used:
        job.parts_used = req.parts_used
    if req.before_photo:
        job.before_photo = req.before_photo
    if req.after_photo:
        job.after_photo = req.after_photo
    if req.customer_signature:
        job.customer_signature = req.customer_signature
    if req.rating:
        job.rating = req.rating
    if req.feedback:
        job.feedback = req.feedback

    if req.status == "Completed":
        job.completed_at = datetime.utcnow()
        if job.booking:
            job.booking.status = "Completed"
        if job.complaint:
            job.complaint.status = "Resolved"
            job.complaint.resolution_notes = req.diagnosis or "Service completed by technician."

    db.commit()
    return {"message": "Job updated successfully", "status": job.status}
