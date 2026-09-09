import random
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import Service, ServiceBooking, User, TechnicianJob
from app.schemas import ServiceResponse, ServiceBookingCreate, ServiceBookingResponse

router = APIRouter(prefix="/api/services", tags=["AC Services"])

SERVICEABLE_PINCODES = ["110001", "110002", "110003", "110016", "110020", "201301", "201309", "122001", "122002", "400001", "560001"]

@router.get("", response_model=List[ServiceResponse])
def get_services(db: Session = Depends(get_db)):
    return db.query(Service).all()

@router.get("/check-pincode/{pincode}")
def check_pincode(pincode: str):
    # Check 6-digit valid format, allow all valid 6-digit pincodes for great demo experience
    if len(pincode) == 6 and pincode.isdigit():
        is_serviceable = True
        est_arrival = "Same-Day Service Available" if pincode in SERVICEABLE_PINCODES else "Service Available within 24 Hours"
        return {"serviceable": is_serviceable, "pincode": pincode, "delivery_time": est_arrival, "message": "Good news! Cooling Hub technicians are active in your area."}
    return {"serviceable": False, "pincode": pincode, "message": "Please enter a valid 6-digit Indian Pincode."}

@router.post("/book", response_model=ServiceBookingResponse)
def book_service(req: ServiceBookingCreate, db: Session = Depends(get_db)):
    service = db.query(Service).filter(Service.id == req.service_id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")

    booking_num = f"CH-SRV-2026-{random.randint(1000, 9999)}"
    
    # Auto-assign available technician if any
    tech = db.query(User).filter(User.role == "technician").first()
    tech_id = tech.id if tech else None

    booking = ServiceBooking(
        booking_number=booking_num,
        user_id=req.user_id,
        service_id=req.service_id,
        pincode=req.pincode,
        service_date=req.service_date,
        service_time_slot=req.service_time_slot,
        address=req.address,
        notes=req.notes,
        status="Technician Assigned" if tech_id else "Scheduled",
        price=service.price,
        technician_id=tech_id
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)

    if tech_id:
        job = TechnicianJob(
            technician_id=tech_id,
            booking_id=booking.id,
            job_type=f"Service: {service.title}",
            status="Assigned"
        )
        db.add(job)
        db.commit()

    return booking

@router.get("/user/{user_id}", response_model=List[ServiceBookingResponse])
def get_user_bookings(user_id: int, db: Session = Depends(get_db)):
    return db.query(ServiceBooking).filter(ServiceBooking.user_id == user_id).order_by(ServiceBooking.created_at.desc()).all()
