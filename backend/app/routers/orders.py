import random
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import Order, OrderItem, Product
from app.schemas import OrderCreate, OrderResponse

router = APIRouter(prefix="/api/orders", tags=["Orders & Checkout"])

VALID_COUPONS = {
    "COOL2026": {"type": "percent", "value": 10, "desc": "10% Off on All AC Purchases"},
    "SAVE10": {"type": "percent", "value": 10, "desc": "10% Instant Discount"},
    "FIRSTAC": {"type": "flat", "value": 2000, "desc": "Flat ₹2,000 Off on your First AC"}
}

@router.post("/validate-coupon")
def validate_coupon(coupon_code: str, total_amount: float):
    code = coupon_code.upper().strip()
    if code in VALID_COUPONS:
        c = VALID_COUPONS[code]
        if c["type"] == "percent":
            discount = round((total_amount * c["value"]) / 100, 2)
        else:
            discount = float(c["value"])
        return {
            "valid": True,
            "code": code,
            "discount_amount": discount,
            "description": c["desc"]
        }
    return {"valid": False, "discount_amount": 0.0, "message": "Invalid Coupon Code. Try COOL2026 or FIRSTAC."}

@router.post("/checkout", response_model=OrderResponse)
def checkout(req: OrderCreate, db: Session = Depends(get_db)):
    if not req.items:
        raise HTTPException(status_code=400, detail="Cart is empty")

    order_num = f"CH-ORD-2026-{random.randint(1000, 9999)}"

    order = Order(
        order_number=order_num,
        user_id=req.user_id,
        total_amount=req.total_amount,
        discount_amount=req.discount_amount,
        coupon_used=req.coupon_used,
        payment_method=req.payment_method,
        payment_status="Paid",
        order_status="Confirmed",
        shipping_address=req.shipping_address
    )
    db.add(order)
    db.commit()
    db.refresh(order)

    for item in req.items:
        order_item = OrderItem(
            order_id=order.id,
            product_id=item.product_id,
            quantity=item.quantity,
            unit_price=item.unit_price
        )
        db.add(order_item)

    db.commit()
    return order

@router.get("/user/{user_id}", response_model=List[OrderResponse])
def get_user_orders(user_id: int, db: Session = Depends(get_db)):
    return db.query(Order).filter(Order.user_id == user_id).order_by(Order.created_at.desc()).all()

@router.get("/track/{order_number}", response_model=OrderResponse)
def track_order(order_number: str, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.order_number == order_number).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order
