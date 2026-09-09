from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import AMCPlan, AMCSubscription
from app.schemas import AMCPlanResponse, AMCSubscribeRequest, AMCSubscriptionResponse
from pydantic import BaseModel

router = APIRouter(prefix="/api/amc", tags=["Annual Maintenance Contract"])

class EligibilityCheckRequest(BaseModel):
    ac_brand: str
    ac_age_years: float
    is_working: bool

@router.get("/plans", response_model=List[AMCPlanResponse])
def get_amc_plans(db: Session = Depends(get_db)):
    return db.query(AMCPlan).all()

@router.post("/check-eligibility")
def check_eligibility(req: EligibilityCheckRequest):
    if req.ac_age_years > 10:
        return {
            "eligible": False,
            "message": "ACs older than 10 years require a physical inspection before AMC enrollment.",
            "recommended_action": "Book an AC Comprehensive Inspection Service first."
        }
    if not req.is_working:
        return {
            "eligible": False,
            "message": "AC must be in working condition before initiating an AMC contract.",
            "recommended_action": "Raise a repair complaint or service booking to resolve existing issues."
        }
    return {
        "eligible": True,
        "message": f"Congratulations! Your {req.ac_brand} AC ({req.ac_age_years} yrs old) is eligible for all AMC Protection Plans.",
        "recommended_plan": "Standard Gold AMC" if req.ac_age_years > 3 else "Premium Platinum AMC"
    }

@router.post("/subscribe", response_model=AMCSubscriptionResponse)
def subscribe_amc(req: AMCSubscribeRequest, db: Session = Depends(get_db)):
    plan = db.query(AMCPlan).filter(AMCPlan.id == req.plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="AMC Plan not found")

    start_date = datetime.utcnow()
    end_date = start_date + timedelta(days=365)

    sub = AMCSubscription(
        user_id=req.user_id,
        plan_id=req.plan_id,
        ac_brand_model=req.ac_brand_model,
        ac_tonnage=req.ac_tonnage,
        start_date=start_date,
        end_date=end_date,
        visits_total=plan.covered_visits,
        visits_completed=0,
        status="Active"
    )
    db.add(sub)
    db.commit()
    db.refresh(sub)
    return sub

@router.get("/user/{user_id}", response_model=List[AMCSubscriptionResponse])
def get_user_subscriptions(user_id: int, db: Session = Depends(get_db)):
    return db.query(AMCSubscription).filter(AMCSubscription.user_id == user_id).all()
