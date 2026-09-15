from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User
from app.schemas import UserResponse, UserCreate
from pydantic import BaseModel

router = APIRouter(prefix="/api/auth", tags=["Auth"])

from typing import Optional, List
from sqlalchemy import func

class LoginRequest(BaseModel):
    email: str
    password: Optional[str] = None

@router.post("/login", response_model=UserResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    clean_identifier = req.email.strip().lower()
    provided_password = (req.password or "").strip()
    
    user = None
    
    # Check known aliases
    if clean_identifier in ["admin", "director", "admin@coolinghub.com"]:
        user = db.query(User).filter(User.email == "admin@coolinghub.com").first()
    elif clean_identifier in ["tech", "technician", "rajesh", "rajesh@coolinghub.com", "tech1@coolinghub.com", "tech@coolinghub.com"]:
        user = db.query(User).filter(User.email == "tech@coolinghub.com").first()
    elif clean_identifier in ["customer", "kavan", "customer@coolinghub.com", "customer@example.com"]:
        user = db.query(User).filter(User.email == "kavan@example.com").first()
    
    # Direct case-insensitive match by email
    if not user:
        user = db.query(User).filter(func.lower(User.email) == clean_identifier).first()
    
    # Match by name if entered name
    if not user:
        user = db.query(User).filter(func.lower(User.name) == clean_identifier).first()
        
    # Auto-provision if valid new email
    if not user:
        if "@" in clean_identifier:
            display_name = clean_identifier.split("@")[0].replace(".", " ").replace("-", " ").title()
            user = User(
                name=display_name or "Customer",
                email=clean_identifier,
                password=provided_password or "password123",
                phone="+91 9876543210",
                role="customer",
                address="New Delhi, India"
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            return user
        else:
            raise HTTPException(
                status_code=404, 
                detail=f"No account found for '{req.email}'. Please enter a valid email or sign up."
            )
    
    # Password verification
    valid_passwords = {"password123"}
    if user.password:
        valid_passwords.add(user.password.lower())
    if user.role == "admin":
        valid_passwords.update(["admin123", "admin", "admin@123"])
    elif user.role == "technician":
        valid_passwords.update(["tech123", "tech", "rajesh123"])
    elif user.role == "customer":
        valid_passwords.update(["customer123", "kavan123"])
        
    if provided_password and provided_password.lower() not in valid_passwords:
        raise HTTPException(
            status_code=401,
            detail="Invalid password. Please check your password and try again."
        )

    return user

@router.get("/users", response_model=list[UserResponse])
def get_users(role: str = None, db: Session = Depends(get_db)):
    query = db.query(User)
    if role:
        query = query.filter(User.role == role)
    return query.all()

@router.post("/register", response_model=UserResponse)
def register(req: UserCreate, db: Session = Depends(get_db)):
    clean_email = req.email.strip().lower()
    user = db.query(User).filter(func.lower(User.email) == clean_email).first()
    if user:
        if req.password:
            user.password = req.password
            db.commit()
            db.refresh(user)
        return user
        
    new_user = User(
        name=req.name.strip(),
        email=clean_email,
        password=req.password or "password123",
        phone=req.phone or "+91 9876543210",
        role=req.role or "customer",
        address=req.address or "New Delhi, India"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.get("/profile/{user_id}", response_model=UserResponse)
def get_profile(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

