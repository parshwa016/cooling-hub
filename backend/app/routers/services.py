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

    while True:
        booking_num = f"CH-SRV-2026-{random.randint(1000, 99999)}"
        if not db.query(ServiceBooking).filter(ServiceBooking.booking_number == booking_num).first():
            break
    
    # Requirement 1 & 7: Initial status must always be Pending. DO NOT mark confirmed or assigned.
    booking = ServiceBooking(
        booking_number=booking_num,
        user_id=req.user_id,
        service_id=req.service_id,
        pincode=req.pincode,
        service_date=req.service_date,
        service_time_slot=req.service_time_slot,
        address=req.address,
        notes=req.notes,
        status="Pending",
        price=service.price,
        technician_id=None
    )
    db.add(booking)

    cust = db.query(User).filter(User.id == req.user_id).first()
    cust_name = cust.name if cust else "Customer"

    # Admin notification
    from app.models import Notification
    admin_notif = Notification(
        role="admin",
        title="New Service Request",
        message=f"Customer {cust_name} has submitted a new service request '{service.title}' (#{booking_num}).",
        type="service_request_submitted",
        related_id=booking_num
    )
    db.add(admin_notif)

    db.commit()
    db.refresh(booking)

    return booking

def serialize_booking(b: ServiceBooking) -> dict:
    return {
        "id": b.id,
        "booking_number": b.booking_number,
        "user_id": b.user_id,
        "service_id": b.service_id,
        "pincode": b.pincode,
        "service_date": b.service_date,
        "service_time_slot": b.service_time_slot,
        "address": b.address,
        "notes": b.notes,
        "status": b.status,
        "price": b.price,
        "technician_id": b.technician_id,
        "technician_name": b.technician.name if b.technician else None,
        "technician_phone": b.technician.phone if b.technician else None,
        "service_notes": b.service_notes,
        "accepted_at": b.accepted_at,
        "completed_at": b.completed_at,
        "created_at": b.created_at,
        "service": b.service,
        "technician": b.technician
    }

@router.get("/user/{user_id}", response_model=List[ServiceBookingResponse])
def get_user_bookings(user_id: int, db: Session = Depends(get_db)):
    bookings = db.query(ServiceBooking).filter(ServiceBooking.user_id == user_id).order_by(ServiceBooking.created_at.desc()).all()
    return [serialize_booking(b) for b in bookings]
