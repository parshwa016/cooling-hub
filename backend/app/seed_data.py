from datetime import datetime, timedelta
from app.database import SessionLocal, engine, Base
from app.models import User, Product, Service, AMCPlan, AMCSubscription, Order, OrderItem, ServiceBooking, Complaint, TechnicianJob, Review

def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # Check if already seeded
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

    # Products
    products = [
        Product(
            title="Daikin 1.5 Ton 5 Star Inverter Split AC",
            brand="Daikin",
            ac_type="Split",
            tonnage=1.5,
            star_rating=5,
            is_inverter=True,
            price=45490,
            original_price=58400,
            discount_percent=22,
            noise_level_db=32,
            cooling_capacity_w=5280,
            iseer_rating=5.2,
            annual_power_kwh=785.0,
            image="/images/products/daikin_split.jpg",
            features="Dew Clean Technology, 3D Airflow, PM2.5 Filter, Coanda Airflow, Econo Mode, 100% Copper Condenser",
            description="Experience ultimate cooling comfort with Daikin's 5-Star 1.5 Ton Inverter Split AC. Equipped with Streamer Discharge technology and Dew Clean operation to keep your indoor air pure.",
            rating=4.8,
            reviews_count=142
        ),
        Product(
            title="LG 1.5 Ton 5 Star AI Dual Inverter Split AC",
            brand="LG",
            ac_type="Split",
            tonnage=1.5,
            star_rating=5,
            is_inverter=True,
            price=46990,
            original_price=68990,
            discount_percent=31,
            noise_level_db=31,
            cooling_capacity_w=5300,
            iseer_rating=5.2,
            annual_power_kwh=744.0,
            image="/images/products/lg_dual_inverter.jpg",
            features="AI Convertible 6-in-1 Cooling, Diet Mode, Ocean Black Protection, HD Filter with Anti-Virus, ADC Sensors",
            description="LG AI Dual Inverter AC adjusts cooling capacity based on room occupancy. Features 100% Copper Tubes with Ocean Black Protection against corrosion.",
            rating=4.7,
            reviews_count=98
        ),
        Product(
            title="Voltas 1.5 Ton 3 Star Inverter Split AC",
            brand="Voltas",
            ac_type="Split",
            tonnage=1.5,
            star_rating=3,
            is_inverter=True,
            price=32990,
            original_price=49990,
            discount_percent=34,
            noise_level_db=38,
            cooling_capacity_w=4800,
            iseer_rating=3.81,
            annual_power_kwh=975.0,
            image="/images/products/voltas_inverter.jpg",
            features="4-in-1 Adjustable Cooling, Anti-Microbial Filter, Superdry Mode, High Ambient Cooling up to 52°C",
            description="Voltas 1.5 Ton 3 Star AC offers reliable cooling even under harsh summer conditions up to 52°C ambient temperature.",
            rating=4.4,
            reviews_count=76
        ),
        Product(
            title="Blue Star 1.5 Ton 5 Star Heavy Duty Inverter Split AC",
            brand="Blue Star",
            ac_type="Split",
            tonnage=1.5,
            star_rating=5,
            is_inverter=True,
            price=44990,
            original_price=62000,
            discount_percent=27,
            noise_level_db=30,
            cooling_capacity_w=5250,
            iseer_rating=5.05,
            annual_power_kwh=810.0,
            image="/images/products/bluestar_split.jpg",
            features="Precision Cooling 0.5°C, Turbo Cool, Acoustic Jacket on Compressor, Anti-Corrosive Blue Fins",
            description="Blue Star Heavy Duty AC delivers rapid turbo cooling with acoustic dampening for ultra-quiet operation.",
            rating=4.6,
            reviews_count=64
        ),
        Product(
            title="Panasonic 1.5 Ton 5 Star Wi-Fi Twin-Cool Inverter AC",
            brand="Panasonic",
            ac_type="Split",
            tonnage=1.5,
            star_rating=5,
            is_inverter=True,
            price=44490,
            original_price=57900,
            discount_percent=23,
            noise_level_db=33,
            cooling_capacity_w=5100,
            iseer_rating=5.10,
            annual_power_kwh=774.0,
            image="/images/products/panasonic_wifi.jpg",
            features="Miraie Smart App Control, Alexa & Google Assistant Voice Commands, PM 0.1 Filter, Shield Blu Anti-Corrosion",
            description="Smart AC with Miraie app control, voice assistant integration, and PM 0.1 health filter for allergen-free cooling.",
            rating=4.7,
            reviews_count=112
        ),
        Product(
            title="Daikin 1.5 Ton 3 Star Fixed Speed Window AC",
            brand="Daikin",
            ac_type="Window",
            tonnage=1.5,
            star_rating=3,
            is_inverter=False,
            price=29990,
            original_price=37900,
            discount_percent=21,
            noise_level_db=44,
            cooling_capacity_w=5000,
            iseer_rating=3.15,
            annual_power_kwh=1150.0,
            image="/images/products/daikin_window.jpg",
            features="Copper Condenser, Auto Restart, Self Diagnosis, Dust Filter, High Ambient Cooling",
            description="Durable Window AC with high airflow capacity, compact installation frame, and low maintenance requirement.",
            rating=4.3,
            reviews_count=49
        ),
        Product(
            title="Lloyd 1.0 Ton 3 Star Inverter Split AC",
            brand="Lloyd",
            ac_type="Split",
            tonnage=1.0,
            star_rating=3,
            is_inverter=True,
            price=28990,
            original_price=41990,
            discount_percent=31,
            noise_level_db=34,
            cooling_capacity_w=3450,
            iseer_rating=3.85,
            annual_power_kwh=690.0,
            image="/images/products/lloyd_split.jpg",
            features="Golden Fin Evaporator, 5-in-1 Convertible, Clean Air Filter, Smart 4-Way Air Swing",
            description="Ideal for compact rooms up to 120 sq ft. Golden Fin protection prevents moisture build-up and rusting.",
            rating=4.5,
            reviews_count=53
        ),
        Product(
            title="Mitsubishi Heavy Duty 2.0 Ton 5 Star Inverter Split AC",
            brand="Mitsubishi",
            ac_type="Split",
            tonnage=2.0,
            star_rating=5,
            is_inverter=True,
            price=72990,
            original_price=94000,
            discount_percent=22,
            noise_level_db=29,
            cooling_capacity_w=7100,
            iseer_rating=5.40,
            annual_power_kwh=1020.0,
            image="/images/products/mitsubishi_heavy.jpg",
            features="3D Auto Airflow, 18m Long Distance Air Throw, Jet Flow Technology, Self Clean Operation",
            description="Commercial grade cooling for large halls and master suites. Long throw 18-meter airflow with ultra-quiet indoor unit.",
            rating=4.9,
            reviews_count=38
        )
    ]
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
            title="AC Standard Installation",
            category="Installation",
            description="Professional mounting of indoor and outdoor units, vacuum testing, pipe connection, electrical wiring, and operational demo.",
            price=1499,
            estimated_time="90 - 120 Mins",
            image="https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=600&auto=format&fit=crop&q=80",
            includes="Wall bracket installation, Copper pipe coupling, Vacuum purge, Core drilling up to 3 feet, Power check"
        ),
        Service(
            title="AC Uninstallation & Dismantling",
            category="Installation",
            description="Safe refrigerant gas pump-down back into compressor, dismounting indoor and outdoor units without refrigerant loss.",
            price=799,
            estimated_time="45 Mins",
            image="https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600&auto=format&fit=crop&q=80",
            includes="Gas pump down, Safe unit dismounting, Pipe sealing, Packing advice"
        ),
        Service(
            title="Refrigerant Gas Charging (R32 / R410A / R22)",
            category="Gas Charging",
            description="Complete leak test, pressure vacuum, and precision gas refill using genuine OEM grade refrigerant.",
            price=2299,
            estimated_time="60 Mins",
            image="https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600&auto=format&fit=crop&q=80",
            includes="Nitrogen leak detection, Flare nut tightening, Vacuum evacuation, Full gas refill, Ampere load check"
        ),
        Service(
            title="AC Water Leakage & Drain Clearing",
            category="Repair",
            description="Thorough cleaning of clogged drain pipe, tray alignment, and condensation insulation repair.",
            price=699,
            estimated_time="45 Mins",
            image="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&auto=format&fit=crop&q=80",
            includes="Drain line unclogging, Tray rust treatment, Water flow test, Insulation wrapping"
        ),
        Service(
            title="Complete Diagnostic & Inspection Repair",
            category="Repair",
            description="Comprehensive electronic diagnosis for non-cooling, sensor issues, error codes, noise, or power trip failures.",
            price=499,
            estimated_time="30 Mins",
            image="https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=600&auto=format&fit=crop&q=80",
            includes="PCB error code reading, Capacitor check, Sensor calibration, Compressor health test, Detailed estimate report"
        )
    ]
    db.add_all(services)
    db.commit()

    # AMC Plans
    amc_plans = [
        AMCPlan(
            name="Basic Shield AMC",
            tier="basic",
            price_per_year=2499,
            covered_visits=2,
            free_gas_charging=False,
            priority_service=False,
            discount_parts_percent=10,
            description="Essential protection covering 2 routine wet services per year and 10% discount on spare parts."
        ),
        AMCPlan(
            name="Standard Gold AMC",
            tier="standard",
            price_per_year=4499,
            covered_visits=3,
            free_gas_charging=False,
            priority_service=True,
            discount_parts_percent=20,
            description="Our most popular plan: 3 foam jet services, priority technician response within 6 hours, 20% discount on all spare parts."
        ),
        AMCPlan(
            name="Premium Platinum AMC (Comprehensive)",
            tier="premium",
            price_per_year=6999,
            covered_visits=4,
            free_gas_charging=True,
            priority_service=True,
            discount_parts_percent=100,
            description="100% Peace of mind: Unlimited breakdown visits, 4 Jet Cleaning services, FREE gas charging, and FREE spare parts replacement."
        )
    ]
    db.add_all(amc_plans)
    db.commit()

    # Sample AMC Subscription for user1
    sub1 = AMCSubscription(
        user_id=user1.id,
        plan_id=amc_plans[1].id,
        ac_brand_model="Daikin 1.5T 5-Star Split AC",
        ac_tonnage=1.5,
        start_date=datetime.utcnow() - timedelta(days=60),
        end_date=datetime.utcnow() + timedelta(days=305),
        visits_total=3,
        visits_completed=1,
        status="Active"
    )
    db.add(sub1)
    db.commit()

    # Sample Service Booking
    booking1 = ServiceBooking(
        booking_number="CH-SRV-2026-1042",
        user_id=user1.id,
        service_id=services[0].id, # Jet Cleaning
        pincode="110001",
        service_date="2026-09-10",
        service_time_slot="10:00 AM - 12:00 PM",
        address="Flat 402, Green Valley Apartments, Connaught Place, New Delhi",
        notes="Please call before arrival. AC is installed in main bedroom.",
        status="Technician Assigned",
        price=1199,
        technician_id=tech1.id
    )
    db.add(booking1)
    db.commit()

    # Sample Complaint
    complaint1 = Complaint(
        ticket_id="CMP-2026-8941",
        user_id=user1.id,
        ac_brand_model="LG 1.5T Split AC",
        issue_category="Water Leakage",
        priority="High",
        description="Water is dripping heavily from indoor unit onto bedroom floor when running for more than 30 minutes.",
        status="Technician Assigned",
        technician_id=tech1.id
    )
    db.add(complaint1)
    db.commit()

    # Sample Technician Job
    job1 = TechnicianJob(
        technician_id=tech1.id,
        complaint_id=complaint1.id,
        job_type="Complaint Repair",
        status="In Progress",
        diagnosis="Drain tray clogged with mold dust. Minor insulation degradation.",
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
