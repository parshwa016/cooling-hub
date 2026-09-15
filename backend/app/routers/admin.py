import os
import uuid
import shutil
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models import Order, ServiceBooking, Complaint, AMCSubscription, Product, User, TechnicianJob, Notification, Service, AMCPlan
from app.schemas import (
    ProductCreate, ProductUpdate, ProductResponse,
    ServiceCreate, ServiceUpdate, ServiceResponse,
    AMCPlanCreate, AMCPlanUpdate, AMCPlanResponse
)
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

router = APIRouter(prefix="/api/admin", tags=["Admin Dashboard & Management"])

class AssignTechnicianRequest(BaseModel):
    technician_id: int

class UpdateComplaintStatusRequest(BaseModel):
    status: str

# ----------------- ANALYTICS -----------------
@router.get("/analytics")
def get_admin_analytics(db: Session = Depends(get_db)):
    total_sales_revenue = db.query(func.sum(Order.total_amount)).scalar() or 0.0
    total_service_revenue = db.query(func.sum(ServiceBooking.price)).filter(ServiceBooking.status == "Completed").scalar() or 0.0
    total_amc_revenue = 4499.0 * (db.query(AMCSubscription).count() or 1)
    
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

# ----------------- PRODUCT MANAGEMENT (CRUD) -----------------
@router.get("/products", response_model=List[ProductResponse])
def admin_list_products(db: Session = Depends(get_db)):
    return db.query(Product).order_by(Product.id.desc()).all()

@router.post("/products", response_model=ProductResponse)
def admin_create_product(req: ProductCreate, db: Session = Depends(get_db)):
    discount = req.discount_percent
    if req.original_price and req.price and req.original_price > req.price:
        discount = round(((req.original_price - req.price) / req.original_price) * 100)
    
    new_prod = Product(
        title=req.title,
        brand=req.brand,
        ac_type=req.ac_type,
        tonnage=req.tonnage,
        star_rating=req.star_rating,
        is_inverter=req.is_inverter,
        price=req.price,
        original_price=req.original_price,
        discount_percent=discount,
        noise_level_db=req.noise_level_db,
        cooling_capacity_w=req.cooling_capacity_w,
        iseer_rating=req.iseer_rating,
        annual_power_kwh=req.annual_power_kwh,
        image=req.image,
        features=req.features,
        description=req.description,
        stock=req.stock,
        rating=req.rating,
        reviews_count=req.reviews_count,
        model=req.model or f"{req.brand[:3].upper()}-{int(req.tonnage*10)}T",
        is_featured=req.is_featured,
        badge=req.badge or ""
    )
    db.add(new_prod)
    db.commit()
    db.refresh(new_prod)
    return new_prod

@router.put("/products/{product_id}", response_model=ProductResponse)
def admin_update_product(product_id: int, req: ProductUpdate, db: Session = Depends(get_db)):
    prod = db.query(Product).filter(Product.id == product_id).first()
    if not prod:
        raise HTTPException(status_code=404, detail="Product not found")

    update_data = req.dict(exclude_unset=True)
    
    # Recalculate discount if price or original_price changed
    new_price = update_data.get("price", prod.price)
    new_orig = update_data.get("original_price", prod.original_price)
    if new_orig and new_price and new_orig > new_price:
        update_data["discount_percent"] = round(((new_orig - new_price) / new_orig) * 100)

    for key, value in update_data.items():
        setattr(prod, key, value)

    db.commit()
    db.refresh(prod)
    return prod

@router.delete("/products/{product_id}")
def admin_delete_product(product_id: int, db: Session = Depends(get_db)):
    prod = db.query(Product).filter(Product.id == product_id).first()
    if not prod:
        raise HTTPException(status_code=404, detail="Product not found")
    
    db.delete(prod)
    db.commit()
    return {"message": "Product deleted successfully", "deleted_id": product_id}

@router.post("/upload-image")
async def upload_image(file: UploadFile = File(...)):
    static_uploads = os.path.join(os.path.dirname(__file__), "..", "..", "static", "uploads")
    os.makedirs(static_uploads, exist_ok=True)
    
    ext = os.path.splitext(file.filename)[1] or ".jpg"
    unique_name = f"ac_{uuid.uuid4().hex[:12]}{ext}"
    dest_path = os.path.join(static_uploads, unique_name)
    
    with open(dest_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    image_url = f"http://127.0.0.1:8000/static/uploads/{unique_name}"
    return {"url": image_url, "filename": unique_name}

# ----------------- COMPLAINT DISPATCH & MANAGEMENT -----------------
@router.get("/complaints")
def list_admin_complaints(db: Session = Depends(get_db)):
    complaints = db.query(Complaint).order_by(Complaint.created_at.desc()).all()
    res = []
    for c in complaints:
        customer_name = c.customer_name or (c.user.name if c.user else "Customer")
        customer_phone = c.customer_phone or (c.user.phone if c.user else "N/A")
        customer_address = c.customer_address or (c.user.address if c.user else "N/A")

        res.append({
            "id": c.id,
            "ticket_id": c.ticket_id,
            "user_id": c.user_id,
            "customer_name": customer_name,
            "customer_phone": customer_phone,
            "customer_address": customer_address,
            "preferred_slot": c.preferred_slot or "Tomorrow (10 AM - 1 PM)",
            "ac_details": c.ac_brand_model,
            "issue_category": c.issue_category,
            "priority": c.priority,
            "description": c.description,
            "photo_url": c.photo_url,
            "status": c.status,
            "technician_id": c.technician_id,
            "technician_name": c.technician.name if c.technician else "Unassigned",
            "technician_phone": c.technician.phone if c.technician else None,
            "resolution_notes": c.resolution_notes,
            "service_notes": c.service_notes,
            "accepted_at": c.accepted_at,
            "completed_at": c.completed_at,
            "created_at": c.created_at
        })
    return res

@router.get("/technicians")
def list_available_technicians(db: Session = Depends(get_db)):
    technicians = db.query(User).filter(User.role == "technician").all()
    res = []
    for t in technicians:
        active_count = db.query(Complaint).filter(
            Complaint.technician_id == t.id,
            Complaint.status.in_(["Assigned", "In Progress"])
        ).count()
        
        spec = "Senior HVAC Specialist & Inverter Expert" if "Senior" in t.name else "Split & Window AC Diagnostics Specialist"
        avail = "Available" if active_count < 3 else "Busy (High Load)"

        res.append({
            "id": t.id,
            "name": t.name,
            "email": t.email,
            "phone": t.phone or "+91 9800011223",
            "specialization": spec,
            "active_complaints": active_count,
            "availability": avail,
            "rating": 4.8
        })
    return res

# Requirement 3: Admin Accepts the Request
@router.post("/complaints/{complaint_id}/accept")
def accept_complaint(complaint_id: int, db: Session = Depends(get_db)):
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    
    # Change status: Pending -> Confirmed
    complaint.status = "Confirmed"
    complaint.accepted_at = datetime.utcnow()
    
    # Send notification to the customer's panel
    if complaint.user_id:
        cust_notif = Notification(
            user_id=complaint.user_id,
            role="customer",
            title="Service Request Confirmed",
            message=f"Your service request #{complaint.ticket_id} has been accepted by the admin.",
            type="service_confirmed",
            related_id=complaint.ticket_id
        )
        db.add(cust_notif)

    db.commit()
    db.refresh(complaint)
    return {
        "message": "Service request accepted successfully",
        "complaint_id": complaint.id,
        "ticket_id": complaint.ticket_id,
        "status": complaint.status,
        "accepted_at": complaint.accepted_at
    }

# Admin Rejects the Request
@router.post("/complaints/{complaint_id}/reject")
def reject_complaint(complaint_id: int, db: Session = Depends(get_db)):
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    
    complaint.status = "Rejected"
    
    if complaint.user_id:
        cust_notif = Notification(
            user_id=complaint.user_id,
            role="customer",
            title="Service Request Update",
            message=f"Your service request #{complaint.ticket_id} could not be approved at this time.",
            type="service_rejected",
            related_id=complaint.ticket_id
        )
        db.add(cust_notif)

    db.commit()
    db.refresh(complaint)
    return {
        "message": "Service request rejected",
        "complaint_id": complaint.id,
        "ticket_id": complaint.ticket_id,
        "status": complaint.status
    }

# Requirement 4: Admin Assigns Service Man (Only available after request has been accepted)
@router.post("/complaints/{complaint_id}/assign")
def assign_complaint_technician(complaint_id: int, req: AssignTechnicianRequest, db: Session = Depends(get_db)):
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    
    # Validation: Workflow must be Confirmed -> Assigned (or reassigned if already Assigned)
    if complaint.status == "Pending":
        raise HTTPException(
            status_code=400, 
            detail="Cannot assign service man to a Pending request. Please accept the request first."
        )

    technician = db.query(User).filter(User.id == req.technician_id, User.role == "technician").first()
    if not technician:
        raise HTTPException(status_code=404, detail="Technician not found")

    complaint.technician_id = req.technician_id
    complaint.status = "Assigned"
    
    # Update or create technician job
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

    # Notification for Assigned Service Man
    tech_notif = Notification(
        user_id=technician.id,
        role="technician",
        title="New Service Job Assigned",
        message=f"You have been assigned to Service Request #{complaint.ticket_id} ({complaint.ac_brand_model} - {complaint.issue_category}).",
        type="technician_assigned",
        related_id=complaint.ticket_id
    )
    db.add(tech_notif)

    # Notification for Customer
    if complaint.user_id:
        cust_notif = Notification(
            user_id=complaint.user_id,
            role="customer",
            title="Service Man Assigned",
            message=f"Your service request #{complaint.ticket_id} has been assigned to {technician.name} ({technician.phone or '+91 9800011223'}).",
            type="technician_assigned",
            related_id=complaint.ticket_id
        )
        db.add(cust_notif)

    db.commit()
    return {
        "message": f"Service man {technician.name} assigned successfully",
        "complaint_id": complaint.id,
        "status": complaint.status,
        "technician_name": technician.name
    }

@router.post("/complaints/{complaint_id}/status")
def update_complaint_status(complaint_id: int, req: UpdateComplaintStatusRequest, db: Session = Depends(get_db)):
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    
    complaint.status = req.status
    if req.status == "Closed":
        job = db.query(TechnicianJob).filter(TechnicianJob.complaint_id == complaint_id).first()
        if job and job.status != "Completed":
            job.status = "Completed"
    
    db.commit()
    return {"message": "Complaint status updated", "status": complaint.status}

# ----------------- SERVICE BOOKINGS -----------------
@router.get("/bookings")
def list_admin_bookings(db: Session = Depends(get_db)):
    bookings = db.query(ServiceBooking).order_by(ServiceBooking.created_at.desc()).all()
    res = []
    for b in bookings:
        res.append({
            "id": b.id,
            "booking_number": b.booking_number,
            "customer_name": b.user.name if b.user else "Customer",
            "customer_phone": b.user.phone if b.user else "N/A",
            "service_title": b.service.title if b.service else "Service",
            "date": b.service_date,
            "slot": b.service_time_slot,
            "pincode": b.pincode,
            "price": b.price,
            "status": b.status,
            "technician_id": b.technician_id,
            "technician_name": b.technician.name if b.technician else "Unassigned",
            "accepted_at": b.accepted_at,
            "completed_at": b.completed_at
        })
    return res

@router.post("/bookings/{booking_id}/accept")
def accept_booking(booking_id: int, db: Session = Depends(get_db)):
    booking = db.query(ServiceBooking).filter(ServiceBooking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Service booking not found")
    
    booking.status = "Confirmed"
    booking.accepted_at = datetime.utcnow()
    
    if booking.user_id:
        cust_notif = Notification(
            user_id=booking.user_id,
            role="customer",
            title="Service Request Confirmed",
            message=f"Your service booking #{booking.booking_number} has been accepted by the admin.",
            type="service_confirmed",
            related_id=booking.booking_number
        )
        db.add(cust_notif)

    db.commit()
    return {"message": "Booking confirmed successfully", "status": booking.status}

@router.post("/bookings/{booking_id}/reject")
def reject_booking(booking_id: int, db: Session = Depends(get_db)):
    booking = db.query(ServiceBooking).filter(ServiceBooking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Service booking not found")
    
    booking.status = "Rejected"
    if booking.user_id:
        cust_notif = Notification(
            user_id=booking.user_id,
            role="customer",
            title="Service Request Update",
            message=f"Your service booking #{booking.booking_number} could not be accepted at this time.",
            type="service_rejected",
            related_id=booking.booking_number
        )
        db.add(cust_notif)

    db.commit()
    return {"message": "Booking rejected", "status": booking.status}

@router.post("/bookings/{booking_id}/assign")
def assign_booking_technician(booking_id: int, req: AssignTechnicianRequest, db: Session = Depends(get_db)):
    booking = db.query(ServiceBooking).filter(ServiceBooking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Service booking not found")
    
    if booking.status == "Pending":
        raise HTTPException(status_code=400, detail="Please accept the service booking before assigning a technician.")

    technician = db.query(User).filter(User.id == req.technician_id, User.role == "technician").first()
    if not technician:
        raise HTTPException(status_code=404, detail="Technician not found")

    booking.technician_id = req.technician_id
    booking.status = "Assigned"

    job = db.query(TechnicianJob).filter(TechnicianJob.booking_id == booking_id).first()
    if not job:
        job = TechnicianJob(
            technician_id=req.technician_id,
            booking_id=booking_id,
            job_type=f"Service Booking: {booking.service.title if booking.service else 'Service'}",
            status="Assigned"
        )
        db.add(job)
    else:
        job.technician_id = req.technician_id
        job.status = "Assigned"

    # Notify technician
    tech_notif = Notification(
        user_id=technician.id,
        role="technician",
        title="New Service Job Assigned",
        message=f"You have been assigned to service booking #{booking.booking_number}.",
        type="technician_assigned",
        related_id=booking.booking_number
    )
    db.add(tech_notif)

    # Notify customer
    if booking.user_id:
        cust_notif = Notification(
            user_id=booking.user_id,
            role="customer",
            title="Service Man Assigned",
            message=f"Your service booking #{booking.booking_number} has been assigned to {technician.name}.",
            type="technician_assigned",
            related_id=booking.booking_number
        )
        db.add(cust_notif)

    db.commit()
    return {
        "message": f"Service man {technician.name} assigned successfully",
        "booking_id": booking.id,
        "status": booking.status,
        "technician_name": technician.name
    }

# ----------------- AC SERVICES MANAGEMENT (CRUD) -----------------
@router.get("/services", response_model=List[ServiceResponse])
def admin_list_services(db: Session = Depends(get_db)):
    return db.query(Service).order_by(Service.id.asc()).all()

@router.post("/services", response_model=ServiceResponse)
def admin_create_service(req: ServiceCreate, db: Session = Depends(get_db)):
    new_service = Service(
        title=req.title,
        category=req.category,
        description=req.description,
        price=req.price,
        estimated_time=req.estimated_time or "1-2 Hours",
        image=req.image,
        includes=req.includes or ""
    )
    db.add(new_service)
    db.commit()
    db.refresh(new_service)
    return new_service

@router.put("/services/{service_id}", response_model=ServiceResponse)
def admin_update_service(service_id: int, req: ServiceUpdate, db: Session = Depends(get_db)):
    srv = db.query(Service).filter(Service.id == service_id).first()
    if not srv:
        raise HTTPException(status_code=404, detail="Service package not found")
    
    update_data = req.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(srv, key, value)
    
    db.commit()
    db.refresh(srv)
    return srv

@router.delete("/services/{service_id}")
def admin_delete_service(service_id: int, db: Session = Depends(get_db)):
    srv = db.query(Service).filter(Service.id == service_id).first()
    if not srv:
        raise HTTPException(status_code=404, detail="Service package not found")
    
    active_count = db.query(ServiceBooking).filter(
        ServiceBooking.service_id == service_id,
        ServiceBooking.status.in_(["Pending", "Confirmed", "Assigned", "In Progress"])
    ).count()
    if active_count > 0:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot delete service '{srv.title}' because {active_count} active service bookings are associated with it."
        )

    db.delete(srv)
    db.commit()
    return {"message": "Service package deleted successfully", "deleted_id": service_id}

# ----------------- AMC PLANS MANAGEMENT (CRUD) -----------------
@router.get("/amc-plans", response_model=List[AMCPlanResponse])
def admin_list_amc_plans(db: Session = Depends(get_db)):
    return db.query(AMCPlan).order_by(AMCPlan.price_per_year.asc()).all()

@router.post("/amc-plans", response_model=AMCPlanResponse)
def admin_create_amc_plan(req: AMCPlanCreate, db: Session = Depends(get_db)):
    new_plan = AMCPlan(
        name=req.name,
        tier=req.tier.lower(),
        price_per_year=req.price_per_year,
        covered_visits=req.covered_visits,
        free_gas_charging=req.free_gas_charging,
        priority_service=req.priority_service,
        discount_parts_percent=req.discount_parts_percent,
        description=req.description or ""
    )
    db.add(new_plan)
    db.commit()
    db.refresh(new_plan)
    return new_plan

@router.put("/amc-plans/{plan_id}", response_model=AMCPlanResponse)
def admin_update_amc_plan(plan_id: int, req: AMCPlanUpdate, db: Session = Depends(get_db)):
    plan = db.query(AMCPlan).filter(AMCPlan.id == plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="AMC Plan not found")
    
    update_data = req.dict(exclude_unset=True)
    if "tier" in update_data and update_data["tier"]:
        update_data["tier"] = update_data["tier"].lower()

    for key, value in update_data.items():
        setattr(plan, key, value)
    
    db.commit()
    db.refresh(plan)
    return plan

@router.delete("/amc-plans/{plan_id}")
def admin_delete_amc_plan(plan_id: int, db: Session = Depends(get_db)):
    plan = db.query(AMCPlan).filter(AMCPlan.id == plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="AMC Plan not found")
    
    active_count = db.query(AMCSubscription).filter(
        AMCSubscription.plan_id == plan_id,
        AMCSubscription.status == "Active"
    ).count()
    if active_count > 0:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot delete AMC plan '{plan.name}' because {active_count} active customer subscriptions are enrolled."
        )

    db.delete(plan)
    db.commit()
    return {"message": "AMC Plan deleted successfully", "deleted_id": plan_id}
