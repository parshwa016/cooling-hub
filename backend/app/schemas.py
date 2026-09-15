from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class UserBase(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None
    role: str = "customer"
    address: Optional[str] = None

class UserCreate(UserBase):
    password: Optional[str] = "password123"

class UserResponse(UserBase):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True

class ProductBase(BaseModel):
    title: str
    brand: str
    ac_type: str
    tonnage: float
    star_rating: int
    is_inverter: bool = True
    price: float
    original_price: float
    discount_percent: int = 0
    noise_level_db: int = 32
    cooling_capacity_w: int = 5200
    iseer_rating: float = 4.5
    annual_power_kwh: float = 850.0
    image: str
    features: Optional[str] = None
    description: Optional[str] = None
    stock: int = 50
    rating: float = 4.5
    reviews_count: int = 12
    model: Optional[str] = None
    is_featured: bool = False
    badge: Optional[str] = ""

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    title: Optional[str] = None
    brand: Optional[str] = None
    ac_type: Optional[str] = None
    tonnage: Optional[float] = None
    star_rating: Optional[int] = None
    is_inverter: Optional[bool] = None
    price: Optional[float] = None
    original_price: Optional[float] = None
    discount_percent: Optional[int] = None
    noise_level_db: Optional[int] = None
    cooling_capacity_w: Optional[int] = None
    iseer_rating: Optional[float] = None
    annual_power_kwh: Optional[float] = None
    image: Optional[str] = None
    features: Optional[str] = None
    description: Optional[str] = None
    stock: Optional[int] = None
    model: Optional[str] = None
    is_featured: Optional[bool] = None
    badge: Optional[str] = None

class ProductResponse(ProductBase):
    id: int
    class Config:
        from_attributes = True

class ServiceBase(BaseModel):
    title: str
    category: str
    description: str
    price: float
    estimated_time: str
    image: str
    includes: Optional[str] = None

class ServiceCreate(ServiceBase):
    pass

class ServiceUpdate(BaseModel):
    title: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    estimated_time: Optional[str] = None
    image: Optional[str] = None
    includes: Optional[str] = None

class ServiceResponse(ServiceBase):
    id: int
    class Config:
        from_attributes = True

class AMCPlanBase(BaseModel):
    name: str
    tier: str
    price_per_year: float
    covered_visits: int
    free_gas_charging: bool
    priority_service: bool
    discount_parts_percent: int
    description: Optional[str] = None

class AMCPlanCreate(AMCPlanBase):
    pass

class AMCPlanUpdate(BaseModel):
    name: Optional[str] = None
    tier: Optional[str] = None
    price_per_year: Optional[float] = None
    covered_visits: Optional[int] = None
    free_gas_charging: Optional[bool] = None
    priority_service: Optional[bool] = None
    discount_parts_percent: Optional[int] = None
    description: Optional[str] = None

class AMCPlanResponse(AMCPlanBase):
    id: int
    class Config:
        from_attributes = True

class AMCSubscribeRequest(BaseModel):
    user_id: int
    plan_id: int
    ac_brand_model: str
    ac_tonnage: float = 1.5

class AMCSubscriptionResponse(BaseModel):
    id: int
    user_id: int
    plan_id: int
    ac_brand_model: str
    ac_tonnage: float
    start_date: datetime
    end_date: datetime
    visits_total: int
    visits_completed: int
    status: str
    plan: Optional[AMCPlanResponse] = None
    class Config:
        from_attributes = True

class ServiceBookingCreate(BaseModel):
    user_id: int
    service_id: int
    pincode: str
    service_date: str
    service_time_slot: str
    address: str
    notes: Optional[str] = None

class ServiceBookingResponse(BaseModel):
    id: int
    booking_number: str
    user_id: int
    service_id: int
    pincode: str
    service_date: str
    service_time_slot: str
    address: str
    notes: Optional[str] = None
    status: str
    price: float
    technician_id: Optional[int] = None
    service_notes: Optional[str] = None
    technician_name: Optional[str] = None
    technician_phone: Optional[str] = None
    accepted_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    created_at: datetime
    service: Optional[ServiceResponse] = None
    technician: Optional[UserResponse] = None
    class Config:
        from_attributes = True

class ComplaintCreate(BaseModel):
    user_id: int
    ac_brand_model: str
    issue_category: str
    priority: str = "Normal"
    description: str
    photo_url: Optional[str] = None
    customer_name: Optional[str] = None
    customer_phone: Optional[str] = None
    customer_address: Optional[str] = None
    preferred_slot: Optional[str] = None

class ComplaintResponse(BaseModel):
    id: int
    ticket_id: str
    user_id: int
    ac_brand_model: str
    issue_category: str
    priority: str
    description: str
    photo_url: Optional[str] = None
    status: str
    technician_id: Optional[int] = None
    resolution_notes: Optional[str] = None
    service_notes: Optional[str] = None
    customer_name: Optional[str] = None
    customer_phone: Optional[str] = None
    customer_address: Optional[str] = None
    preferred_slot: Optional[str] = None
    technician_name: Optional[str] = None
    accepted_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    created_at: datetime
    class Config:
        from_attributes = True

class NotificationResponse(BaseModel):
    id: int
    user_id: Optional[int] = None
    role: Optional[str] = None
    title: str
    message: str
    type: str
    related_id: Optional[str] = None
    is_read: bool
    created_at: datetime
    class Config:
        from_attributes = True

class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int = 1
    unit_price: float

class OrderCreate(BaseModel):
    user_id: int
    items: List[OrderItemCreate]
    total_amount: float
    discount_amount: float = 0.0
    coupon_used: Optional[str] = None
    shipping_address: str
    payment_method: str = "Online Payment (UPI/Card)"

class OrderResponse(BaseModel):
    id: int
    order_number: str
    user_id: int
    total_amount: float
    discount_amount: float
    coupon_used: Optional[str] = None
    payment_method: str
    payment_status: str
    order_status: str
    shipping_address: str
    created_at: datetime
    class Config:
        from_attributes = True

class EnergyEstimateRequest(BaseModel):
    tonnage: float = 1.5
    star_rating: int = 5
    is_inverter: bool = True
    usage_hours_per_day: float = 8.0
    electricity_rate: float = 8.5 # ₹/kWh
    months_per_year: int = 8
    non_inverter_baseline_star: int = 3

class EnergyEstimateResponse(BaseModel):
    daily_kwh: float
    monthly_kwh: float
    yearly_kwh: float
    monthly_cost: float
    yearly_cost: float
    units_saved_yearly: float
    money_saved_yearly: float
    savings_percentage: float
    breakeven_months: float
    comparison_baseline_cost: float

class ChatbotRequest(BaseModel):
    message: str
    user_id: Optional[int] = None
    context: Optional[dict] = None

class ChatbotResponse(BaseModel):
    reply: str
    intent: str
    suggestions: List[str]
    action_type: Optional[str] = None
    payload: Optional[dict] = None

class TechnicianJobUpdate(BaseModel):
    status: str
    diagnosis: Optional[str] = None
    parts_used: Optional[str] = None
    before_photo: Optional[str] = None
    after_photo: Optional[str] = None
    customer_signature: Optional[str] = None
    rating: Optional[int] = None
    feedback: Optional[str] = None
