from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from app.database import get_db
from app.models import TechnicianJob, ServiceBooking, Complaint, Notification, User

router = APIRouter(prefix="/api/technician", tags=["Technician Portal"])

class TechnicianJobUpdateDetailed(BaseModel):
    status: str # In Progress, Completed
    problem_identified: Optional[str] = None
    work_performed: Optional[str] = None
    parts_replaced: Optional[str] = None
    additional_notes: Optional[str] = None
    diagnosis: Optional[str] = None
    parts_used: Optional[str] = None
    before_photo: Optional[str] = None
    after_photo: Optional[str] = None
    customer_signature: Optional[str] = None
    rating: Optional[int] = None
    feedback: Optional[str] = None

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
            detail["booking_id"] = job.booking.id
            detail["ticket_id"] = job.booking.booking_number
            detail["customer_name"] = job.booking.user.name if job.booking.user else "Customer"
            detail["customer_phone"] = job.booking.user.phone if job.booking.user else "N/A"
            detail["address"] = job.booking.address
            detail["service_name"] = job.booking.service.title if job.booking.service else "Service"
            detail["time_slot"] = f"{job.booking.service_date} ({job.booking.service_time_slot})"
        elif job.complaint:
            detail["complaint_id"] = job.complaint.id
            detail["ticket_id"] = job.complaint.ticket_id
            detail["customer_name"] = job.complaint.customer_name or (job.complaint.user.name if job.complaint.user else "Customer")
            detail["customer_phone"] = job.complaint.customer_phone or (job.complaint.user.phone if job.complaint.user else "N/A")
            detail["address"] = job.complaint.customer_address or (job.complaint.user.address if job.complaint.user else "Customer Address")
            detail["ac_details"] = job.complaint.ac_brand_model
            detail["issue"] = job.complaint.issue_category
            detail["description"] = job.complaint.description
            detail["photo_url"] = job.complaint.photo_url
            detail["priority"] = job.complaint.priority
            detail["time_slot"] = job.complaint.preferred_slot or "Preferred Slot (Today)"
            detail["service_notes"] = job.complaint.service_notes
            detail["resolution_notes"] = job.complaint.resolution_notes
        result.append(detail)
    return result

@router.post("/jobs/{job_id}/update")
def update_job(job_id: int, req: TechnicianJobUpdateDetailed, db: Session = Depends(get_db)):
    job = db.query(TechnicianJob).filter(TechnicianJob.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Technician job not found")

    # Guard: Cannot complete service before setting to In Progress
    if req.status == "Completed" and job.status not in ["In Progress", "Completed"]:
        raise HTTPException(
            status_code=400,
            detail="You must start the service (set to 'In Progress') before marking it as completed."
        )

    job.status = req.status
    if req.diagnosis:
        job.diagnosis = req.diagnosis
    if req.parts_used or req.parts_replaced:
        job.parts_used = req.parts_used or req.parts_replaced
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

    tech_name = job.technician.name if job.technician else "Service Man"

    # Status: In Progress (Requirement 5: Service Man Starts the Service)
    if req.status == "In Progress":
        job.status = "In Progress"
        if job.complaint:
            job.complaint.status = "In Progress"
            # Customer notification: Service In Progress
            if job.complaint.user_id:
                notif = Notification(
                    user_id=job.complaint.user_id,
                    role="customer",
                    title="Service In Progress",
                    message=f"Service man {tech_name} has started work on your request #{job.complaint.ticket_id}.",
                    type="service_started",
                    related_id=job.complaint.ticket_id
                )
                db.add(notif)
        if job.booking:
            job.booking.status = "In Progress"
            if job.booking.user_id:
                notif = Notification(
                    user_id=job.booking.user_id,
                    role="customer",
                    title="Service In Progress",
                    message=f"Service man {tech_name} has started work on your booking #{job.booking.booking_number}.",
                    type="service_started",
                    related_id=job.booking.booking_number
                )
                db.add(notif)

    # Status: Completed (Requirement 6: Service Completion)
    elif req.status == "Completed":
        # Guard: Cannot mark completed immediately without starting service
        if job.status not in ["In Progress", "Completed"]:
            raise HTTPException(
                status_code=400, 
                detail="You must start the service (set to 'In Progress') before marking it as completed."
            )

        job.status = "Completed"
        completion_time = datetime.utcnow()
        job.completed_at = completion_time

        notes_parts = []
        if req.problem_identified:
            notes_parts.append(f"Problem Identified: {req.problem_identified}")
        if req.work_performed:
            notes_parts.append(f"Work Performed: {req.work_performed}")
        if req.parts_replaced:
            notes_parts.append(f"Parts Replaced: {req.parts_replaced}")
        if req.additional_notes:
            notes_parts.append(f"Notes: {req.additional_notes}")
        
        full_service_notes = " | ".join(notes_parts) if notes_parts else (req.diagnosis or "Service completed successfully.")

        if job.complaint:
            job.complaint.status = "Completed"
            job.complaint.service_notes = full_service_notes
            job.complaint.resolution_notes = req.work_performed or req.diagnosis or "Service completed."
            job.complaint.completed_at = completion_time

            # Requirement 6 & 8: Customer receives completion notification
            if job.complaint.user_id:
                cust_notif = Notification(
                    user_id=job.complaint.user_id,
                    role="customer",
                    title="Service Completed",
                    message=f"Your service request #{job.complaint.ticket_id} has been completed.",
                    type="service_completed",
                    related_id=job.complaint.ticket_id
                )
                db.add(cust_notif)
            
            # Requirement 8: Admin receives completion notification
            admin_notif = Notification(
                role="admin",
                title="Service Request Completed",
                message=f"Service man {tech_name} has completed service request #{job.complaint.ticket_id}.",
                type="service_completed",
                related_id=job.complaint.ticket_id
            )
            db.add(admin_notif)

        if job.booking:
            job.booking.status = "Completed"
            job.booking.service_notes = full_service_notes
            job.booking.completed_at = completion_time

            if job.booking.user_id:
                cust_notif = Notification(
                    user_id=job.booking.user_id,
                    role="customer",
                    title="Service Completed",
                    message=f"Your service request #{job.booking.booking_number} has been completed.",
                    type="service_completed",
                    related_id=job.booking.booking_number
                )
                db.add(cust_notif)

            admin_notif = Notification(
                role="admin",
                title="Service Request Completed",
                message=f"Service man {tech_name} has completed service booking #{job.booking.booking_number}.",
                type="service_completed",
                related_id=job.booking.booking_number
            )
            db.add(admin_notif)

    db.commit()
    return {"message": "Job updated successfully", "status": job.status}
