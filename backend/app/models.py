from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    phone = Column(String, nullable=True)
    role = Column(String, default="customer") # customer, technician, admin
    password = Column(String, nullable=True, default="password123")
    address = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    orders = relationship("Order", back_populates="user")
    service_bookings = relationship("ServiceBooking", back_populates="user", foreign_keys="ServiceBooking.user_id")
    complaints = relationship("Complaint", back_populates="user", foreign_keys="Complaint.user_id")
    amc_subscriptions = relationship("AMCSubscription", back_populates="user")


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    brand = Column(String, nullable=False) # Daikin, Voltas, LG, Blue Star, Lloyd, Mitsubishi, Panasonic
    ac_type = Column(String, nullable=False) # Split, Window, Inverter, Non-Inverter, Cassette, Tower
    tonnage = Column(Float, nullable=False) # 1.0, 1.5, 2.0
    star_rating = Column(Integer, nullable=False) # 3, 4, 5
    is_inverter = Column(Boolean, default=True)
    price = Column(Float, nullable=False)
    original_price = Column(Float, nullable=False)
    discount_percent = Column(Integer, default=0)
    noise_level_db = Column(Integer, default=32)
    cooling_capacity_w = Column(Integer, default=5200)
    iseer_rating = Column(Float, default=4.5)
    annual_power_kwh = Column(Float, default=850.0)
    image = Column(String, nullable=False)
    features = Column(Text, nullable=True) # comma separated or JSON string
    description = Column(Text, nullable=True)
    stock = Column(Integer, default=50)
    rating = Column(Float, default=4.5)
    reviews_count = Column(Integer, default=12)
    model = Column(String, nullable=True)
    is_featured = Column(Boolean, default=False)
    badge = Column(String, default="")

    order_items = relationship("OrderItem", back_populates="product")
    reviews = relationship("Review", back_populates="product")


class Service(Base):
    __tablename__ = "services"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    category = Column(String, nullable=False) # Installation, Maintenance, Cleaning, Repair, Gas Charging
    description = Column(Text, nullable=False)
    price = Column(Float, nullable=False)
    estimated_time = Column(String, default="1-2 Hours")
    image = Column(String, nullable=False)
    includes = Column(Text, nullable=True) # comma separated list of included tasks

    bookings = relationship("ServiceBooking", back_populates="service")


class AMCPlan(Base):
    __tablename__ = "amc_plans"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    tier = Column(String, nullable=False) # basic, standard, premium
    price_per_year = Column(Float, nullable=False)
    covered_visits = Column(Integer, default=2)
    free_gas_charging = Column(Boolean, default=False)
    priority_service = Column(Boolean, default=False)
    discount_parts_percent = Column(Integer, default=0)
    description = Column(Text, nullable=True)

    subscriptions = relationship("AMCSubscription", back_populates="plan")


class AMCSubscription(Base):
    __tablename__ = "amc_subscriptions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    plan_id = Column(Integer, ForeignKey("amc_plans.id"))
    ac_brand_model = Column(String, nullable=False)
    ac_tonnage = Column(Float, default=1.5)
    start_date = Column(DateTime, default=datetime.utcnow)
    end_date = Column(DateTime)
    visits_total = Column(Integer, default=3)
    visits_completed = Column(Integer, default=0)
    status = Column(String, default="Active") # Active, Expired, Renewed

    user = relationship("User", back_populates="amc_subscriptions")
    plan = relationship("AMCPlan", back_populates="subscriptions")


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    order_number = Column(String, unique=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    total_amount = Column(Float, nullable=False)
    discount_amount = Column(Float, default=0.0)
    coupon_used = Column(String, nullable=True)
    payment_method = Column(String, default="Online Payment (UPI/Card)")
    payment_status = Column(String, default="Paid") # Paid, Pending
    order_status = Column(String, default="Confirmed") # Confirmed, Processing, Out for Delivery, Delivered
    shipping_address = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="orders")
    items = relationship("OrderItem", back_populates="order")


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"))
    product_id = Column(Integer, ForeignKey("products.id"))
    quantity = Column(Integer, default=1)
    unit_price = Column(Float, nullable=False)

    order = relationship("Order", back_populates="items")
    product = relationship("Product", back_populates="order_items")


class ServiceBooking(Base):
    __tablename__ = "service_bookings"

    id = Column(Integer, primary_key=True, index=True)
    booking_number = Column(String, unique=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    service_id = Column(Integer, ForeignKey("services.id"))
    pincode = Column(String, nullable=False)
    service_date = Column(String, nullable=False)
    service_time_slot = Column(String, nullable=False)
    address = Column(Text, nullable=False)
    notes = Column(Text, nullable=True)
    status = Column(String, default="Pending") # Pending, Confirmed, Assigned, In Progress, Completed, Cancelled
    price = Column(Float, nullable=False)
    technician_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    service_notes = Column(Text, nullable=True)
    accepted_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", foreign_keys=[user_id], back_populates="service_bookings")
    service = relationship("Service", back_populates="bookings")
    technician = relationship("User", foreign_keys=[technician_id])


class Complaint(Base):
    __tablename__ = "complaints"

    id = Column(Integer, primary_key=True, index=True)
    ticket_id = Column(String, unique=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    customer_name = Column(String, nullable=True)
    customer_phone = Column(String, nullable=True)
    customer_address = Column(Text, nullable=True)
    preferred_slot = Column(String, nullable=True)
    ac_brand_model = Column(String, nullable=False)
    issue_category = Column(String, nullable=False) # Cooling Problem, Water Leakage, Noise, Compressor, Electrical, Gas Leak
    priority = Column(String, default="Normal") # Normal, High, Emergency
    description = Column(Text, nullable=False)
    photo_url = Column(String, nullable=True)
    status = Column(String, default="Pending") # Pending, Confirmed, Assigned, In Progress, Completed, Rejected, Closed
    technician_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    resolution_notes = Column(Text, nullable=True)
    service_notes = Column(Text, nullable=True)
    accepted_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", foreign_keys=[user_id], back_populates="complaints")
    technician = relationship("User", foreign_keys=[technician_id])


class TechnicianJob(Base):
    __tablename__ = "technician_jobs"

    id = Column(Integer, primary_key=True, index=True)
    technician_id = Column(Integer, ForeignKey("users.id"))
    booking_id = Column(Integer, ForeignKey("service_bookings.id"), nullable=True)
    complaint_id = Column(Integer, ForeignKey("complaints.id"), nullable=True)
    job_type = Column(String, nullable=False) # Service, Complaint Repair
    status = Column(String, default="Assigned") # Assigned, Accepted, In Progress, Completed
    diagnosis = Column(Text, nullable=True)
    parts_used = Column(Text, nullable=True)
    before_photo = Column(String, nullable=True)
    after_photo = Column(String, nullable=True)
    customer_signature = Column(String, nullable=True)
    rating = Column(Integer, nullable=True)
    feedback = Column(Text, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    technician = relationship("User", foreign_keys=[technician_id])
    booking = relationship("ServiceBooking", foreign_keys=[booking_id])
    complaint = relationship("Complaint", foreign_keys=[complaint_id])


class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"))
    user_name = Column(String, nullable=False)
    rating = Column(Integer, default=5)
    title = Column(String, nullable=False)
    comment = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    product = relationship("Product", back_populates="reviews")


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    role = Column(String, nullable=True) # admin, technician, customer
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String, default="info") # complaint_created, technician_assigned, service_started, service_completed
    related_id = Column(String, nullable=True) # ticket_id, order_number, etc.
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", foreign_keys=[user_id])

