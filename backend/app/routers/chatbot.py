from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Product, Service
from app.schemas import ChatbotRequest, ChatbotResponse

router = APIRouter(prefix="/api/chatbot", tags=["AI Chatbot Assistant"])

@router.post("/query", response_model=ChatbotResponse)
def query_chatbot(req: ChatbotRequest, db: Session = Depends(get_db)):
    msg = req.message.lower().strip()
    
    # 1. AC Recommendation
    if any(k in msg for k in ["recommend", "best ac", "buy", "which ac", "suggestion", "split", "window"]):
        products = db.query(Product).order_by(Product.rating.desc()).limit(2).all()
        prod_names = ", ".join([f"{p.brand} {p.title} (₹{p.price:,.0f})" for p in products])
        reply = (
            f"🤖 **Coolie AI Recommendation**: Based on top customer ratings and energy efficiency, I highly recommend:\n\n"
            f"1️⃣ **{products[0].title}** - 5 Star Inverter with ISEER {products[0].iseer_rating}\n"
            f"2️⃣ **{products[1].title}** - Premium cooling with quiet operation.\n\n"
            f"💡 *Tip: For a 120-150 sq ft room, a 1.5 Ton 5-Star Inverter AC is ideal for maximum electricity savings!*"
        )
        return ChatbotResponse(
            reply=reply,
            intent="ac_recommendation",
            suggestions=["Compare 5-Star Inverters", "Calculate Electricity Savings", "Book AC Installation"],
            action_type="navigate_shop"
        )

    # 2. Electricity / Energy Savings Calculation
    elif any(k in msg for k in ["electricity", "bill", "power", "save", "saving", "inverter vs", "calculator", "cost"]):
        reply = (
            "⚡ **Energy Savings Analysis**:\n\n"
            "Switching from a 3-Star Non-Inverter AC to a **5-Star Inverter AC** saves approx **35% to 40%** on electricity bills!\n\n"
            "• **Avg Yearly Units Saved**: ~600 to 750 kWh\n"
            "• **Avg Yearly Money Saved**: ₹5,000 - ₹7,000\n"
            "• **Break-even Period**: ~18 to 24 months!\n\n"
            "Would you like to customize your room size and usage hours in our interactive Energy Calculator?"
        )
        return ChatbotResponse(
            reply=reply,
            intent="energy_calculator",
            suggestions=["Open Energy Calculator", "View 5-Star ACs", "Book Maintenance"],
            action_type="navigate_calculator"
        )

    # 3. AC Troubleshooting / Issues
    elif any(k in msg for k in ["not cooling", "leakage", "water", "noise", "repair", "problem", "error", "smell", "gas"]):
        reply = (
            "🔧 **Coolie AI Quick Troubleshooting Guide**:\n\n"
            "1. **Water Leakage**: Usually caused by clogged drain line or dirt accumulation. Needs Jet Wash Service.\n"
            "2. **Low Cooling / Warm Air**: May indicate dirty air filters or low refrigerant (R32/R410A) gas pressure.\n"
            "3. **Loud Rattling Noise**: Inspect fan motor alignment or loose casing screws.\n\n"
            "Would you like me to register a priority complaint ticket or schedule a technician visit?"
        )
        return ChatbotResponse(
            reply=reply,
            intent="troubleshooting",
            suggestions=["Raise Emergency Complaint", "Book Deep Cleaning Service", "Check AMC Plans"],
            action_type="navigate_complaint"
        )

    # 4. Service / Booking
    elif any(k in msg for k in ["service", "installation", "cleaning", "jet wash", "gas charging", "book"]):
        services = db.query(Service).limit(3).all()
        reply = (
            "🛠️ **Available Cooling Hub Services**:\n\n" +
            "\n".join([f"• **{s.title}** - ₹{s.price:,.0f} ({s.estimated_time})" for s in services]) +
            "\n\nWe provide 100% background-verified technicians with 30-day service warranty!"
        )
        return ChatbotResponse(
            reply=reply,
            intent="service_booking",
            suggestions=["Book Foam Jet Wash", "Book Installation", "Check Pincode Serviceability"],
            action_type="navigate_services"
        )

    # 5. AMC Contract
    elif any(k in msg for k in ["amc", "maintenance contract", "yearly plan", "protection"]):
        reply = (
            "📅 **Annual Maintenance Contract (AMC)**:\n\n"
            "Protect your AC year-round with Cooling Hub AMC:\n"
            "• **Basic Shield (₹2,499/yr)**: 2 Wet Services + 10% off parts\n"
            "• **Standard Gold (₹4,499/yr)**: 3 Jet Wash Services + Priority Visit within 6 hrs\n"
            "• **Premium Platinum (₹6,999/yr)**: Unlimited Repairs + FREE Gas Charging + FREE Spare Parts!"
        )
        return ChatbotResponse(
            reply=reply,
            intent="amc_info",
            suggestions=["Check AC AMC Eligibility", "Subscribe to Standard AMC", "Talk to Support Agent"],
            action_type="navigate_amc"
        )

    # 6. Default / Fallback Support
    else:
        reply = (
            "👋 Hi! I'm **Coolie AI**, your 24/7 HVAC Assistant at **Cooling Hub**!\n\n"
            "How can I assist you today?\n"
            "• Find the best AC for your room\n"
            "• Calculate monthly electricity savings\n"
            "• Book AC service or repair\n"
            "• Raise or track a complaint ticket\n"
            "• Explore AMC Protection Plans"
        )
        return ChatbotResponse(
            reply=reply,
            intent="general_greeting",
            suggestions=["Recommend an AC", "Calculate Electricity Savings", "Book AC Cleaning", "Raise Complaint Ticket"]
        )
