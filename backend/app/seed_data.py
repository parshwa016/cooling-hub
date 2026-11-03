from datetime import datetime, timedelta
from app.database import SessionLocal, engine, Base
from app.models import User, Product, Service, AMCPlan, AMCSubscription, Order, OrderItem, ServiceBooking, Complaint, TechnicianJob, Review
from sqlalchemy import text

OFFICIAL_PRODUCTS_DATA = [
    {
        "id": 1,
        "title": "Daikin 1.5 Ton 5 Star Inverter Split AC (Copper, Dew Clean, PM2.5 Filter)",
        "brand": "Daikin",
        "model": "FTKM50U",
        "ac_type": "Split",
        "tonnage": 1.5,
        "star_rating": 5,
        "is_inverter": True,
        "price": 45490,
        "original_price": 58400,
        "discount_percent": 22,
        "noise_level_db": 32,
        "cooling_capacity_w": 5280,
        "iseer_rating": 5.2,
        "annual_power_kwh": 785.0,
        "image": "/images/products/daikin_split.jpg",
        "features": "Dew Clean Auto Wash, 3D Coanda Airflow, PM2.5 Particulate Filter, Neo Swing Inverter Compressor, Econo Power Saver, 100% Inner Grooved Copper, Triple Display (Set Temp, Room Temp, Power %)",
        "description": "The Daikin 1.5 Ton 5 Star Inverter Split AC is engineered for peak cooling efficiency and unmatched reliability. Powered by Daikin's patented Neo Swing Inverter Compressor, it delivers whisper-quiet operation at just 32 dB while slashing electricity consumption. It features proprietary Dew Clean Technology that automatically freezes and washes the indoor heat exchanger with condensation water at the press of a button, eliminating mold, dust, and odors. Equipped with 3D Coanda Airflow to circulate cool air to every corner without harsh direct drafts, PM 2.5 particulate air purification, and 100% Inner Grooved Pure Copper Tubes with anti-corrosive coating to prevent refrigerant leakage.",
        "warranty_summary": "1 Year Comprehensive, 5 Years on PCB, 10 Years on Compressor",
        "warranty_details": "1 Year Comprehensive Warranty on entire AC unit including gas charging and labor | 5 Years Warranty on Inverter Printed Circuit Board (PCB) | 10 Years Warranty on Patented Neo Swing Compressor. 100% Grooved Copper Condenser backed by Daikin India Authorized Manufacturer Warranty.",
        "rating": 4.8,
        "reviews_count": 142
    },
    {
        "id": 2,
        "title": "LG 1.5 Ton 5 Star AI Dual Inverter Split AC (Copper, 6-in-1 Cooling, Ocean Black)",
        "brand": "LG",
        "model": "RS-Q19YNZE",
        "ac_type": "Split",
        "tonnage": 1.5,
        "star_rating": 5,
        "is_inverter": True,
        "price": 46990,
        "original_price": 68990,
        "discount_percent": 31,
        "noise_level_db": 31,
        "cooling_capacity_w": 5300,
        "iseer_rating": 5.2,
        "annual_power_kwh": 744.0,
        "image": "/images/products/lg_dual_inverter.jpg",
        "features": "AI Convertible 6-in-1 Cooling, Viraat 110% Overload Mode, Ocean Black Anti-Corrosion Protection, HD Anti-Virus Filter, Low Gas Detection Sensor, 100% Copper Tubes, Stabilizer-Free Operation (120V-290V)",
        "description": "LG AI Dual Inverter Split Air Conditioner features an intelligent twin-rotary compressor that predicts required cooling capacity based on room occupancy, heat load, and ambient temperature patterns. With AI Convertible 6-in-1 cooling, scale cooling output from 40% up to Viraat Mode (110% overload cooling) for instant heat relief. Engineered with 100% Copper Tubes shielded by Ocean Black Protection, an advanced multi-layered anti-corrosion barrier that repels salt, sand, industrial smoke, and pollutants. Includes an HD Micro-Dust Filter with Anti-Virus protection, EZ Clean Filter frame, Low Gas Detection sensor, and stabilizer-free operation across 120V to 290V.",
        "warranty_summary": "1 Year Comprehensive, 5 Years on PCB Controller, 10 Years on Smart Inverter Compressor",
        "warranty_details": "1 Year Comprehensive Warranty on Product & Functional Parts | 5 Years Warranty on Inverter Controller PCB | 10 Years Warranty on Dual Rotary Inverter Compressor with Gas Charging included during warranty service. Supported by LG India Authorized Service Network.",
        "rating": 4.7,
        "reviews_count": 98
    },
    {
        "id": 3,
        "title": "Voltas 1.5 Ton 3 Star Adjustable Inverter Split AC (Copper, 4-in-1 Modes, Cools at 52°C)",
        "brand": "Voltas",
        "model": "183V Vectra Prism",
        "ac_type": "Split",
        "tonnage": 1.5,
        "star_rating": 3,
        "is_inverter": True,
        "price": 32990,
        "original_price": 49990,
        "discount_percent": 34,
        "noise_level_db": 38,
        "cooling_capacity_w": 4800,
        "iseer_rating": 3.81,
        "annual_power_kwh": 975.0,
        "image": "/images/products/voltas_inverter.jpg",
        "features": "4-in-1 Adjustable Tonnage Modes, High Ambient Cooling up to 52°C, Superdry Monsoon Dehumidifier, Anti-Microbial Filter, 100% Copper with Blue Hydrophilic Fins, Dual Temp Display",
        "description": "Engineered by Tata, the Voltas 1.5 Ton 3 Star Adjustable Inverter Split AC is built to conquer extreme Indian summers, delivering relentless cooling even at 52°C ambient temperatures. Its 4-in-1 Adjustable Cooling mode enables you to toggle between multiple tonnage configurations (0.9T, 1.1T, 1.3T, 1.5T) to match changing room loads and slash power bills. Features 100% Copper Condenser Coils with Blue Hydrophilic fin coating for rapid heat transfer and rust resistance. Includes Superdry Mode for heavy monsoon humidity control, Anti-Microbial Dust Filter, Dual Temperature Display, and Self-Diagnosis with automatic error code readout.",
        "warranty_summary": "1 Year Comprehensive, 5 Years on PCB, 10 Years on Inverter Compressor",
        "warranty_details": "1 Year Comprehensive Warranty on AC Unit | 5 Years Extended Warranty on Inverter Controller PCB | 10 Years Warranty on High-Torque Inverter Compressor. Backed by Voltas TATA Nationwide Service Guarantee.",
        "rating": 4.4,
        "reviews_count": 76
    },
    {
        "id": 4,
        "title": "Blue Star 1.5 Ton 5 Star Heavy Duty Inverter Split AC (Copper, Precision Cooling 0.5°C)",
        "brand": "Blue Star",
        "model": "IC518YNU",
        "ac_type": "Split",
        "tonnage": 1.5,
        "star_rating": 5,
        "is_inverter": True,
        "price": 44990,
        "original_price": 62000,
        "discount_percent": 27,
        "noise_level_db": 30,
        "cooling_capacity_w": 5250,
        "iseer_rating": 5.05,
        "annual_power_kwh": 810.0,
        "image": "/images/products/bluestar_split.jpg",
        "features": "Precision Cooling 0.5°C Step, Acoustic Jacket for 30dB Silent Run, Anti-Corrosive Blue Fins, Turbo Cool Instant Pull-down, 5-in-1 Convertible Modes, Self-Clean Dust Blow",
        "description": "Blue Star 1.5 Ton 5 Star Heavy Duty Inverter Split AC delivers commercial-grade reliability with residential acoustic comfort. Features Precision Cooling that allows ultra-fine temperature adjustments in 0.5°C increments. Equipped with a Brushless DC (BLDC) Motor and an Acoustic Jacket enclosure around the compressor, achieving whisper-quiet operation at 30 dB. Features 100% Pure Copper heat exchangers treated with Anti-Corrosive Blue Fins that prevent moisture accumulation and acid rain damage. Includes Turbo Cool for instant rapid temperature pull-down, Comfort Sleep Mode, and Eco Mode for energy efficiency.",
        "warranty_summary": "1 Year Comprehensive, 5 Years on Inverter PCB, 10 Years on Heavy Duty Compressor",
        "warranty_details": "1 Year Comprehensive Warranty on Complete Unit | 5 Years Extended Warranty on Inverter PCB Assembly | 10 Years Warranty on Heavy Duty Inverter Compressor. 100% Copper Condenser Coil with Blue Star India Authorized Warranty.",
        "rating": 4.6,
        "reviews_count": 64
    },
    {
        "id": 5,
        "title": "Panasonic 1.5 Ton 5 Star Wi-Fi Inverter Split AC (Copper, Miraie App, PM 0.1 Filter)",
        "brand": "Panasonic",
        "model": "CS/CU-NU18YKY5W",
        "ac_type": "Split",
        "tonnage": 1.5,
        "star_rating": 5,
        "is_inverter": True,
        "price": 44490,
        "original_price": 57900,
        "discount_percent": 23,
        "noise_level_db": 33,
        "cooling_capacity_w": 5100,
        "iseer_rating": 5.10,
        "annual_power_kwh": 774.0,
        "image": "/images/products/panasonic_wifi.jpg",
        "features": "Miraie Smart App & Voice Control (Alexa/Google), PM 0.1 Health Filter, 7-in-1 AI Convertible Cooling, Shield Blu+ Anti-Corrosion Protection, 100% Pure Copper Coils, Customizable Sleep Profiles",
        "description": "The Panasonic 1.5 Ton 5 Star Smart Wi-Fi Inverter Split AC connects to your smart home ecosystem via the Panasonic Miraie IoT app, Amazon Alexa, and Google Assistant. Schedule custom hourly sleep temperature profiles, monitor real-time energy consumption, and control your AC from anywhere in the world. Features 7-in-1 Convertible Modes with AI Mode that auto-senses room temperature and adjusts cooling capacity. Incorporates a PM 0.1 particulate health filter to trap microscopic airborne allergens and bacteria. Built with 100% Pure Copper Coils and Shield Blu+ anti-corrosion coating across both indoor and outdoor units.",
        "warranty_summary": "1 Year Comprehensive, 5 Years on Inverter PCB, 10 Years on Twin-Cool Compressor",
        "warranty_details": "1 Year Comprehensive Warranty on Unit & Remote | 5 Years Warranty on Main Controller Inverter PCB | 10 Years Warranty on Twin Rotary Inverter Compressor with Eco-Tough Casing Guarantee. Official Panasonic India Warranty.",
        "rating": 4.7,
        "reviews_count": 112
    },
    {
        "id": 6,
        "title": "Daikin 1.5 Ton 3 Star Fixed Speed Window AC (Copper Condenser, Auto Restart)",
        "brand": "Daikin",
        "model": "FRWL50TV16U",
        "ac_type": "Window",
        "tonnage": 1.5,
        "star_rating": 3,
        "is_inverter": False,
        "price": 29990,
        "original_price": 37900,
        "discount_percent": 21,
        "noise_level_db": 44,
        "cooling_capacity_w": 5000,
        "iseer_rating": 3.15,
        "annual_power_kwh": 1150.0,
        "image": "/images/products/daikin_window.jpg",
        "features": "100% Inner Grooved Copper Condenser, High Ambient Cooling, Auto Restart with Memory, Self-Diagnosis Malfunction Display, Washable High-Density Dust Filter, Slide-Out Chassis",
        "description": "Daikin 1.5 Ton 3 Star Fixed Speed Window Air Conditioner combines heavy-duty cooling output with a space-saving single-cabinet design. Built with high-grade Inner Grooved 100% Copper Condenser Tubes that maximize thermal conductivity and prevent corrosion. Features high-velocity wide-angle horizontal airflow louvres to cool medium to large rooms rapidly. Includes Self-Diagnosis with front panel malfunction code display, Power Chill Mode, Auto-Restart with memory backup after power cuts, and an easily removable, washable high-density dust filter.",
        "warranty_summary": "1 Year Comprehensive, 5 Years on High-Efficiency Compressor",
        "warranty_details": "1 Year Comprehensive Warranty on Complete Window AC Unit including electrical components | 5 Years Warranty on Fixed Speed Rotary Compressor. 100% Copper Condenser backed by Daikin India Authorized Manufacturer Warranty.",
        "rating": 4.3,
        "reviews_count": 49
    },
    {
        "id": 7,
        "title": "Lloyd 1.0 Ton 3 Star Inverter Split AC (Copper, 5-in-1 Convertible, Golden Fin)",
        "brand": "Lloyd",
        "model": "GLS12I3FWAEV",
        "ac_type": "Split",
        "tonnage": 1.0,
        "star_rating": 3,
        "is_inverter": True,
        "price": 28990,
        "original_price": 41990,
        "discount_percent": 31,
        "noise_level_db": 34,
        "cooling_capacity_w": 3450,
        "iseer_rating": 3.85,
        "annual_power_kwh": 690.0,
        "image": "/images/products/lloyd_split.jpg",
        "features": "5-in-1 Convertible Cooling, Golden Fin Corrosion Protection, 4-Way Motorized Air Swing, PM 2.5 Clean Air Filter, Hidden Digital LED Display, 100% Inner Grooved Copper",
        "description": "Designed by Havells, the Lloyd 1.0 Ton 3 Star Inverter Split AC is optimized for bedrooms and compact rooms up to 120 sq ft. Features 5-in-1 Convertible Cooling modes that allow operating at 40%, 60%, 80%, 100%, and 110% Turbo capacity. Both evaporator and condenser coils are coated with Golden Fin Technology, an anti-corrosion layer that repels salt water, rain, and humidity to extend coil lifespan up to 3x. Features 4-Way Air Swing (horizontal and vertical motorized louvres), PM 2.5 Clean Air Filter, Hidden LED Temperature Display, and 100% Inner Grooved Copper Tubes.",
        "warranty_summary": "1 Year Comprehensive, 5 Years on Inverter PCB, 10 Years on Compressor",
        "warranty_details": "1 Year Comprehensive Warranty on Product & Parts | 5 Years Extended Warranty on Inverter Controller PCB | 10 Years Warranty on Inverter Compressor. Havells Lloyd Authorized Pan-India Service Support.",
        "rating": 4.5,
        "reviews_count": 53
    },
    {
        "id": 8,
        "title": "Mitsubishi Heavy Industries 2.0 Ton 5 Star Heavy Duty Inverter Split AC (Jet Flow 18m)",
        "brand": "Mitsubishi",
        "model": "SRK20CXS-W6",
        "ac_type": "Split",
        "tonnage": 2.0,
        "star_rating": 5,
        "is_inverter": True,
        "price": 72990,
        "original_price": 94000,
        "discount_percent": 22,
        "noise_level_db": 29,
        "cooling_capacity_w": 7100,
        "iseer_rating": 5.40,
        "annual_power_kwh": 1020.0,
        "image": "/images/products/mitsubishi_heavy.jpg",
        "features": "Aerodynamic Jet Flow 18-Meter Long Throw, 3D Auto Multi-Motor Airflow, Allergen Clear & Deodorizing Dual Filters, Ultra-Quiet 29 dB Indoor Operation, 100% Heavy Duty Copper, Micro-Computer Self Diagnosis",
        "description": "The Mitsubishi Heavy Industries 2.0 Ton 5 Star Inverter Split AC represents Japanese HVAC engineering at its pinnacle. Specifically designed for large living rooms, luxury penthouses, open-concept halls, and executive offices up to 260 sq ft. Features Jet Flow Air Technology, derived from jet engine aerodynamic blade designs, achieving an astounding 18-meter long-distance air throw. Equipped with 3D Auto Airflow with independent multi-motor louvre control for draft-free multi-dimensional circulation. Operates at an ultra-low 29 dB library whisper level. Features Allergen Clear and Photocatalytic Deodorizing Filters, Self-Clean operation, and 100% Heavy Duty Copper coils.",
        "warranty_summary": "1 Year Comprehensive, 5 Years on Heavy Duty Inverter PCB, 10 Years on Compressor",
        "warranty_details": "1 Year Comprehensive Warranty on Unit & All Functional Components | 5 Years Warranty on Heavy Duty Inverter PCB | 10 Years Warranty on Heavy Duty Inverter Compressor. Backed by Mitsubishi Heavy Industries (IAPL) Authorized Manufacturer Warranty.",
        "rating": 4.9,
        "reviews_count": 38
    }
]

def upgrade_products_columns_and_data(db):
    # Ensure columns exist in products table
    with engine.connect() as conn:
        for col, col_type in [('warranty_summary', 'VARCHAR DEFAULT \'1 Year Comprehensive, 5 Years PCB, 10 Years Compressor\''), ('warranty_details', 'TEXT')]:
            try:
                conn.execute(text(f"ALTER TABLE products ADD COLUMN {col} {col_type};"))
                conn.commit()
            except Exception:
                pass

    # Update existing products with official specs, warranty and descriptions
    for item in OFFICIAL_PRODUCTS_DATA:
        p = db.query(Product).filter(Product.id == item["id"]).first()
        if p:
            p.title = item["title"]
            p.brand = item["brand"]
            p.model = item["model"]
            p.ac_type = item["ac_type"]
            p.tonnage = item["tonnage"]
            p.star_rating = item["star_rating"]
            p.is_inverter = item["is_inverter"]
            p.price = item["price"]
            p.original_price = item["original_price"]
            p.discount_percent = item["discount_percent"]
            p.noise_level_db = item["noise_level_db"]
            p.cooling_capacity_w = item["cooling_capacity_w"]
            p.iseer_rating = item["iseer_rating"]
            p.annual_power_kwh = item["annual_power_kwh"]
            p.image = item["image"]
            p.features = item["features"]
            p.description = item["description"]
            p.warranty_summary = item["warranty_summary"]
            p.warranty_details = item["warranty_details"]
            p.rating = item["rating"]
            p.reviews_count = item["reviews_count"]
    db.commit()

def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # Always ensure existing products get updated with latest official specifications & warranty
    try:
        upgrade_products_columns_and_data(db)
    except Exception as e:
        print("Notice during upgrade_products_columns_and_data:", e)

    # Check if base data already seeded
    if db.query(User).first():
        db.close()
        return

    print("Seeding database with Cooling Hub initial data...")

    # Users
    admin = User(name="Admin Director", email="admin@coolinghub.com", phone="+91 9876543210", role="admin", address="Cooling Hub HQ, Tech Park, Sector 62, Noida")
    tech1 = User(name="Rajesh Kumar (Senior Technician)", email="tech@coolinghub.com", phone="+91 9811223344", role="technician", address="Service Hub West, Delhi")
    tech2 = User(name="Amit Sharma (HVAC Specialist)", email="tech2@coolinghub.com", phone="+91 9822334455", role="technician", address="Service Hub East, Delhi")
    user1 = User(name="John Doe", email="john@example.com", phone="+91 9988776655", role="customer", address="Flat 402, Green Valley Apartments, Connaught Place, New Delhi - 110001")

    db.add_all([admin, tech1, tech2, user1])
    db.commit()

    # Initial Products Seeding
    products = [Product(**item) for item in OFFICIAL_PRODUCTS_DATA]
    db.add_all(products)
    db.commit()

    # Services
    services = [
        Service(
            title="AC Foam & Jet Deep Cleaning",
            category="Cleaning",
            description="High-pressure jet pump cleaning of evaporator coils, blower fan, drain tray, and outdoor unit with anti-bacterial foam solution.",
            price=1199,
            estimated_time="60 - 90 Mins",
            image="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&auto=format&fit=crop&q=80",
            includes="Indoor coil jet cleaning, Outdoor unit washing, Anti-bacterial foam coat, Drain line flushing, Temperature output check"
        ),
        Service(
            title="Complete AC Master Servicing",
            category="Maintenance",
            description="End-to-end checkup including gas pressure measurement, electrical wiring check, fan motor lubrication, and deep filter sanitization.",
            price=799,
            estimated_time="45 - 60 Mins",
            image="https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80",
            includes="Operating ampere check, Gas pressure test, Filter wash & sanitization, Blower vibration tuning, Condenser inspection"
        ),
        Service(
            title="Eco-Friendly Gas Refill (R32 / R410A)",
            category="Gas Charging",
            description="Complete system vacuuming with nitrogen leak testing, followed by precision weight-based refrigerant charging of pure R32/R410A.",
            price=2499,
            estimated_time="60 - 75 Mins",
            image="https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=600&auto=format&fit=crop&q=80",
            includes="Nitrogen pressure leak check, Flare nut sealing, Vacuum pump evacuation, Precision scale gas filling, Cooling test"
        ),
        Service(
            title="Split AC Safe Uninstallation & Installation",
            category="Installation",
            description="Professional copper pipe flaring, outdoor bracket wall mounting, vacuuming, and leveling to prevent vibration and gas leakage.",
            price=1499,
            estimated_time="90 - 120 Mins",
            image="https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600&auto=format&fit=crop&q=80",
            includes="Wall core drilling, Outdoor stand fixing, Indoor unit level mounting, Flare connection vacuuming, Performance test"
        )
    ]
    db.add_all(services)
    db.commit()

    # AMC Plans
    plans = [
        AMCPlan(
            title="Silver Care Protection",
            tier="silver",
            price_annual=1999,
            description="Basic maintenance covering 2 wet foam services per year and priority diagnostic visits.",
            free_services_count=2,
            gas_refill_discount_percent=15,
            spare_parts_discount_percent=10,
            priority_response_hours=24,
            emergency_visits_included=2,
            features="2 Jet Clean Services, 10% Spares Discount, 24h Response SLA, Free Electrical Diagnostics"
        ),
        AMCPlan(
            title="Gold Comprehensive Shield",
            tier="gold",
            price_annual=3499,
            description="Most popular comprehensive plan with 3 jet cleans, 1 free gas top-up, and 4-hour emergency SLA.",
            free_services_count=3,
            gas_refill_discount_percent=50,
            spare_parts_discount_percent=25,
            priority_response_hours=4,
            emergency_visits_included=4,
            features="3 Jet Clean Services, 1 Free Gas Top-up, 25% Spares Discount, 4h Priority Dispatch, Free Breakdown Visits"
        ),
        AMCPlan(
            title="Platinum VIP Zero-Downtime",
            tier="platinum",
            price_annual=4999,
            description="Unlimited breakdown visits, 100% free gas charging, 50% discount on all spare parts, and VIP technician dispatch.",
            free_services_count=4,
            gas_refill_discount_percent=100,
            spare_parts_discount_percent=50,
            priority_response_hours=2,
            emergency_visits_included=10,
            features="4 Deep Jet Cleanings, 100% Free Gas Refills, 50% Spares Discount, 2h Express Dispatch, Dedicated Relationship Mgr"
        )
    ]
    db.add_all(plans)
    db.commit()

    # Sample AMC Subscription for user1
    sub1 = AMCSubscription(
        user_id=user1.id,
        plan_id=plans[1].id,
        ac_brand_model="Daikin 1.5T 5-Star Split AC",
        ac_serial_number="DKN-2024-88491A",
        ac_age_years=1,
        installation_address="Flat 402, Green Valley Apartments, Connaught Place, New Delhi - 110001",
        services_remaining=2,
        emergency_visits_remaining=3,
        status="active",
        end_date=datetime.utcnow() + timedelta(days=280)
    )
    db.add(sub1)
    db.commit()

    # Sample Service Booking
    booking1 = ServiceBooking(
        booking_number="CH-SRV-2026-9041",
        user_id=user1.id,
        service_id=services[0].id,
        scheduled_date=datetime.utcnow().strftime("%Y-%m-%d"),
        preferred_time_slot="10:00 AM - 12:00 PM",
        customer_name=user1.name,
        customer_phone=user1.phone,
        service_address=user1.address,
        technician_id=tech1.id,
        technician_name=tech1.name,
        technician_phone=tech1.phone,
        status="in_progress",
        payment_status="paid",
        total_amount=1199.0
    )
    db.add(booking1)
    db.commit()

    # Technician Job for booking1
    job1 = TechnicianJob(
        booking_id=booking1.id,
        technician_id=tech1.id,
        customer_name=booking1.customer_name,
        customer_phone=booking1.customer_phone,
        service_title=services[0].title,
        service_address=booking1.service_address,
        time_slot=booking1.preferred_time_slot,
        service_type="Foam Jet Cleaning",
        status="in_progress",
        diagnosis_notes="Indoor cooling coil had mild fungal accumulation. High-pressure foam spray applied. Temperature delta improved from 7C to 14C.",
        parts_used="Drain Pipe extension (1 meter)",
        before_photo="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&auto=format&fit=crop&q=80",
        created_at=datetime.utcnow() - timedelta(hours=3)
    )
    db.add(job1)
    db.commit()

    # Sample Order
    order1 = Order(
        order_number="CH-ORD-2026-5591",
        user_id=user1.id,
        total_amount=40941.0,
        discount_amount=4549.0,
        coupon_used="COOL2026",
        payment_method="Online Payment (UPI)",
        payment_status="Paid",
        order_status="Out for Delivery",
        shipping_address="Flat 402, Green Valley Apartments, Connaught Place, New Delhi - 110001",
        created_at=datetime.utcnow() - timedelta(days=2)
    )
    db.add(order1)
    db.commit()

    order_item1 = OrderItem(
        order_id=order1.id,
        product_id=products[0].id,
        quantity=1,
        unit_price=45490.0
    )
    db.add(order_item1)
    db.commit()

    print("Database seeding completed successfully!")

if __name__ == "__main__":
    seed_database()
