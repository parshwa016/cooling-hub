from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models import Order, ServiceBooking, Complaint, AMCSubscription, Product, User, TechnicianJob
from pydantic import BaseModel

router = APIRouter(prefix="/api/admin", tags=["Admin Dashboard & Analytics"])

class AssignTechnicianRequest(BaseModel):
    technician_id: int

@router.get("/analytics")
def get_admin_analytics(db: Session = Depends(get_db)):
    total_sales_revenue = db.query(func.sum(Order.total_amount)).scalar() or 0.0
    total_service_revenue = db.query(func.sum(ServiceBooking.price)).filter(ServiceBooking.status == "Completed").scalar() or 0.0
    total_amc_revenue = 4499.0 * (db.query(AMCSubscription).count() or 1) # estimated average
    
    total_orders = db.query(Order).count()
    total_bookings = db.query(ServiceBooking).count()
    total_complaints = db.query(Complaint).count()
    active_amc = db.query(AMCSubscription).filter(AMCSubscription.status == "Active").count()

    technicians = db.query(User).filter(User.role == "technician").all()
    tech_performance = []
    for tech in technicians:
        completed_jobs = db.query(TechnicianJob).filter(TechnicianJob.technician_id == tech.id, TechnicianJob.status == "Completed").count()
        assigned_jobs = db.query(TechnicianJob).filter(TechnicianJob.technician_id == tech.id).count()
        tech_performance.append({
            "id": tech.id,
            "name": tech.name,
            "completed_jobs": completed_jobs,
            "assigned_jobs": assigned_jobs,
            "rating": 4.8
        })

    brand_distribution = [
        {"brand": "Daikin", "sales": 42},
        {"brand": "LG", "sales": 38},
        {"brand": "Voltas", "sales": 29},
        {"brand": "Blue Star", "sales": 25},
        {"brand": "Panasonic", "sales": 18}
    ]

    monthly_revenue_trend = [
        {"month": "Apr", "sales": 280000, "service": 45000, "amc": 22000},
        {"month": "May", "sales": 420000, "service": 68000, "amc": 35000},
        {"month": "Jun", "sales": 390000, "service": 62000, "amc": 31000},
        {"month": "Jul", "sales": 310000, "service": 51000, "amc": 26000},
        {"month": "Aug", "sales": 290000, "service": 48000, "amc": 24000},
        {"month": "Sep", "sales": 340000, "service": 55000, "amc": 29000}
    ]

    return {
        "kpis": {
            "total_sales_revenue": total_sales_revenue,
            "total_service_revenue": total_service_revenue,
            "total_amc_revenue": total_amc_revenue,
            "grand_total_revenue": total_sales_revenue + total_service_revenue + total_amc_revenue,
            "total_orders": total_orders,
            "total_bookings": total_bookings,
            "total_complaints": total_complaints,
            "active_amc_subscriptions": active_amc
        },
        "tech_performance": tech_performance,
        "brand_distribution": brand_distribution,
        "monthly_revenue_trend": monthly_revenue_trend
    }

@router.get("/complaints")
def list_admin_complaints(db: Session = Depends(get_db)):
    complaints = db.query(Complaint).order_by(Complaint.created_at.desc()).all()
    res = []
    for c in complaints:
        res.append({
            "id": c.id,
            "ticket_id": c.ticket_id,
            "customer_name": c.user.name if c.user else "Customer",
            "ac_details": c.ac_brand_model,
            "issue_category": c.issue_category,
            "priority": c.priority,
            "description": c.description,
            "status": c.status,
            "technician_name": c.technician.name if c.technician else "Unassigned",
            "created_at": c.created_at
        })
    return res

@router.post("/complaints/{complaint_id}/assign")
def assign_complaint_technician(complaint_id: int, req: AssignTechnicianRequest, db: Session = Depends(get_db)):
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    
    complaint.technician_id = req.technician_id
    complaint.status = "Technician Assigned"
    
    # Update or create job
    job = db.query(TechnicianJob).filter(TechnicianJob.complaint_id == complaint_id).first()
    if not job:
        job = TechnicianJob(
            technician_id=req.technician_id,
            complaint_id=complaint_id,
            job_type=f"Complaint: {complaint.issue_category}",
            status="Assigned"
        )
        db.add(job)
    else:
        job.technician_id = req.technician_id
        job.status = "Assigned"

    db.commit()
    return {"message": "Technician assigned successfully"}

@router.get("/bookings")
def list_admin_bookings(db: Session = Depends(get_db)):
    bookings = db.query(ServiceBooking).order_by(ServiceBooking.created_at.desc()).all()
    res = []
    for b in bookings:
        res.append({
            "id": b.id,
            "booking_number": b.booking_number,
            "customer_name": b.user.name if b.user else "Customer",
            "service_title": b.service.title if b.service else "Service",
            "date": b.service_date,
            "slot": b.service_time_slot,
            "pincode": b.pincode,
            "price": b.price,
            "status": b.status,
            "technician_name": b.technician.name if b.technician else "Unassigned"
        })
    return res
