import random
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import Service, ServiceBooking, User, TechnicianJob
from app.schemas import ServiceResponse, ServiceBookingCreate, ServiceBookingResponse

router = APIRouter(prefix="/api/services", tags=["AC Services"])

# ==============================================================================
# VERIFIED AHMEDABAD PINCODES & LOCALITIES (COOLING HUB OPERATIONAL ZONE)
# ==============================================================================
AHMEDABAD_PINCODES = {
    "380001": "Bhadra / Lal Darwaja / G.P.O.",
    "380002": "Kalupur / Railway Station",
    "380004": "Shahibaug / Delhi Darwaja",
    "380005": "Sabarmati / Chandkheda",
    "380006": "Ellisbridge / Ambawadi",
    "380007": "Paldi / Sharda Mandir",
    "380008": "Maninagar / Kankaria Lake",
    "380009": "Navrangpura / Ashram Road / University",
    "380013": "Naranpura / Vadaj",
    "380014": "Navjivan / Usmanpura",
    "380015": "Vastrapur / Satellite / Bodakdev",
    "380016": "Civil Hospital / Asarwa",
    "380018": "Saraspur / Gomtipur",
    "380019": "Vatva Industrial Estate",
    "380021": "Amraiwadi / C.T.M.",
    "380022": "Bapunagar / Rakhial",
    "380024": "Odhav GIDC",
    "380026": "Danilimda / Isanpur",
    "380027": "Ranip / New Ranip",
    "380028": "Naroda / Krishnanagar",
    "380050": "Ghodasar / Isanpur",
    "380051": "Prahlad Nagar / Makarba / Vejalpur",
    "380052": "Memnagar / Gurukul / Drive-In",
    "380054": "Thaltej / S.G. Highway / Science City",
    "380058": "Bopal / South Bopal / Ghuma",
    "380059": "Gota / Chandlodiya",
    "380060": "Motera / Narendra Modi Stadium",
    "380061": "Ghatlodiya / Chanakyapuri",
    "380063": "Science City / Sola",
    "382421": "Chandkheda / Zundal",
    "382424": "Naroda GIDC",
    "382443": "Vatva GIDC Phase IV",
    "382481": "Sanand / Extended S.G. Road",
    "382110": "Sanand Industrial Area",
    "382445": "Ramol / C.T.M."
}

def is_ahmedabad_pincode(pincode: str) -> bool:
    clean_pin = str(pincode).strip()
    if not (len(clean_pin) == 6 and clean_pin.isdigit()):
        return False
    # Ahmedabad city pincodes 380001 - 380099
    if clean_pin.startswith("380"):
        return True
    # Or listed Ahmedabad suburban/GIDC areas
    return clean_pin in AHMEDABAD_PINCODES

@router.get("", response_model=List[ServiceResponse])
def get_services(db: Session = Depends(get_db)):
    return db.query(Service).all()

@router.get("/check-pincode/{pincode}")
def check_pincode(pincode: str):
    clean_pin = str(pincode).strip()
    if not (len(clean_pin) == 6 and clean_pin.isdigit()):
        return {
            "serviceable": False,
            "pincode": clean_pin,
            "message": "Please enter a valid 6-digit Indian Pincode (e.g. 380015 for Vastrapur, Ahmedabad)."
        }

    if is_ahmedabad_pincode(clean_pin):
        area = AHMEDABAD_PINCODES.get(clean_pin, "Ahmedabad City")
        return {
            "serviceable": True,
            "pincode": clean_pin,
            "city": "Ahmedabad",
            "area": area,
            "delivery_time": "Same-Day Service Available (within 2-4 Hours)",
            "message": f"🎉 Excellent! Cooling Hub doorstep technicians are active in {area}, Ahmedabad ({clean_pin})."
        }

    # Entered a pincode outside Ahmedabad
    return {
        "serviceable": False,
        "pincode": clean_pin,
        "city": "Ahmedabad Only",
        "message": f"❌ We're sorry! Cooling Hub services are currently ONLY available in Ahmedabad. We are not available at pincode {clean_pin} yet."
    }

@router.post("/book", response_model=ServiceBookingResponse)
def book_service(req: ServiceBookingCreate, db: Session = Depends(get_db)):
    # Validate that the requested pincode is in Ahmedabad
    if not is_ahmedabad_pincode(req.pincode):
        raise HTTPException(
            status_code=400,
            detail=f"Cooling Hub doorstep services are currently only available in Ahmedabad. Pincode {req.pincode} is outside our current service area."
        )
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
