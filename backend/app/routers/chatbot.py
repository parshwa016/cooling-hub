import re
from typing import Optional, Dict, Any, List, Tuple
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Product, Service
from app.schemas import ChatbotRequest, ChatbotResponse

router = APIRouter(prefix="/api/chatbot", tags=["AI Chatbot Assistant"])

# ==============================================================================
# VERIFIED HVAC MANUFACTURER ERROR CODE KNOWLEDGE BASE
# Sources: Voltas, Daikin, LG, Blue Star, Lloyd, Panasonic, Hitachi, Samsung OEM Manuals
# ==============================================================================
ERROR_CODES_DB: Dict[Tuple[str, str], Dict[str, Any]] = {
    # ------------------ VOLTAS ------------------
    ("voltas", "e1"): {
        "title": "Voltas Error E1: Indoor Room Temperature Sensor Malfunction",
        "meaning": "The indoor room temperature sensor (thermistor) circuit is open, shorted, or disconnected.",
        "steps": [
            "Turn off the AC and turn off the dedicated MCB switch for 5 minutes to reset the indoor PCB microcomputer.",
            "Open the front panel and gently remove the mesh air filters.",
            "Inspect the small black-tipped room sensor resting against the coil; ensure its connector is securely plugged into the indoor PCB.",
            "Turn power back on. If E1 reappears immediately, the thermistor resistance is abnormal and requires a replacement sensor (approx 10kΩ)."
        ],
        "safety_alert": "Turn off the main electrical switch before opening the front panel.",
        "requires_tech": True
    },
    ("voltas", "e2"): {
        "title": "Voltas Error E2: Indoor Coil / Evaporator Temperature Sensor Fault",
        "meaning": "The copper pipe evaporator temperature sensor is reading out of normal resistance range.",
        "steps": [
            "Perform a 5-minute electrical power-cycle via the main MCB.",
            "Check if air filters are heavily clogged; choked airflow can cause coil frost and trigger E2 freeze protection.",
            "Clean the air filters under running water and allow them to dry completely before reinserting.",
            "If the indoor unit displays E2 after cleaning, the coil thermistor needs sensor testing or replacement by a technician."
        ],
        "safety_alert": "Do not use hot water or corrosive chemicals to clean the evaporator coil.",
        "requires_tech": True
    },
    ("voltas", "e4"): {
        "title": "Voltas Error E4: Indoor/Outdoor Communication or Fan Motor Failure",
        "meaning": "Communication signal loss between the indoor and outdoor control boards, or indoor blower motor locked.",
        "steps": [
            "Switch off the AC and MCB for 5 minutes to clear temporary communication glitches caused by voltage surges.",
            "Check the indoor blower wheel with a gentle push (with power OFF) to ensure no foreign object is jamming the fan.",
            "Verify your voltage stabilizer: ensure the output voltage is within 210V - 240V.",
            "If E4 persists, the interconnecting communication cable (S wire) or the outdoor inverter PCB is faulty and requires technician inspection."
        ],
        "safety_alert": "Never touch interconnecting wiring between indoor and outdoor units while energized.",
        "requires_tech": True
    },
    ("voltas", "f1"): {
        "title": "Voltas Error F1: Indoor Coil Anti-Freeze Protection",
        "meaning": "The indoor coil temperature has dropped below freezing point for over 2 minutes.",
        "steps": [
            "Turn off the AC immediately to allow any ice built up on the cooling coils to melt naturally.",
            "Remove and wash the dust filters. A 50% choked filter is the #1 cause of indoor coil freezing.",
            "Ensure the indoor blower is blowing strong air (not on low or quiet mode during extreme heat).",
            "If ice forms on the thin outdoor copper pipe while running, refrigerant (R32) gas is low due to a micro-leak."
        ],
        "safety_alert": "Place a towel under the indoor unit as melting coil frost may cause water dripping.",
        "requires_tech": True
    },
    ("voltas", "f3"): {
        "title": "Voltas Error F3: Outdoor Compressor Discharge Pipe Overheat",
        "meaning": "The compressor discharge temperature has exceeded 115°C, triggering safety shutoff.",
        "steps": [
            "Switch off the AC immediately to protect the compressor from permanent winding damage.",
            "Check if the outdoor unit is enclosed or blocked by cardboard, plants, or walls; it needs at least 2 feet of clear airflow around the condenser fan.",
            "Ensure the outdoor fan is spinning freely when the AC is started.",
            "F3 frequently indicates severe refrigerant gas leakage or thermal expansion valve blockage requiring a certified technician."
        ],
        "safety_alert": "Outdoor condenser coils can become scalding hot. Do not touch bare metal fins.",
        "requires_tech": True
    },
    ("voltas", "ec"): {
        "title": "Voltas Error EC: Refrigerant Leakage Detected",
        "meaning": "The microcomputer detected that the compressor is running but the evaporator coil is not cooling, confirming gas loss.",
        "steps": [
            "Turn off the AC to prevent running the compressor dry without oil circulation.",
            "Inspect the copper service valves on the outdoor unit for oily residue or ice crystallization (oil residue confirms a flare nut leak).",
            "This issue cannot be resolved by DIY resets — it requires professional nitrogen leak testing, brazing, evacuation, and R32/R410A weight-based gas charging."
        ],
        "safety_alert": "Refrigerant R32 is mildly flammable. Only certified HVAC personnel should handle pressure manifolds.",
        "requires_tech": True
    },

    # ------------------ DAIKIN ------------------
    ("daikin", "u0"): {
        "title": "Daikin Error U0: Low Refrigerant Gas / Low Suction Pressure",
        "meaning": "Refrigerant shortage or electronic expansion valve (EEV) obstruction.",
        "steps": [
            "Power off the AC and check for ice forming on the narrow outdoor service valve.",
            "Check if the indoor air filters are thoroughly clean.",
            "Perform a 3-minute power cycle from the MCB breaker.",
            "U0 almost always indicates a micro-leak in copper piping or flared joints. A technician must perform nitrogen pressure testing and re-gas."
        ],
        "safety_alert": "Do not keep restarting a U0 error as it can cause inverter compressor burnout.",
        "requires_tech": True
    },
    ("daikin", "u4"): {
        "title": "Daikin Error U4: Indoor to Outdoor Transmission Malfunction",
        "meaning": "Serial communication link between the indoor unit PCB and outdoor inverter PCB is broken.",
        "steps": [
            "Turn off the AC via the remote, then trip the MCB for 10 minutes to reset the inverter microprocessor.",
            "Check for loose connections in the terminal block if accessible safely.",
            "Check if an electrical surge or lightning storm occurred recently (may blow the outdoor PCB glass fuse).",
            "If U4 persists after the power reset, the outdoor control board or communication signal line requires technician diagnostic testing."
        ],
        "safety_alert": "Inverter outdoor PCBs hold high DC voltage (>380V DC) even after power is turned off. Do not open the outdoor casing.",
        "requires_tech": True
    },
    ("daikin", "a6"): {
        "title": "Daikin Error A6: Indoor Fan Motor (DC BLDC) Locked / Abnormality",
        "meaning": "The indoor cross-flow fan motor is not rotating or the Hall sensor feedback signal is lost.",
        "steps": [
            "Switch off the AC power completely.",
            "Gently lift the horizontal louver and use a torch to check if dust build-up or a lizard/pest is blocking the cylindrical blower wheel.",
            "Spin the blower wheel with a clean stick or fingers — it should spin smoothly without resistance.",
            "If it is stiff or squeals, the motor bearing is seized or the indoor PCB fan driver IC is burned out."
        ],
        "safety_alert": "Never insert fingers into the blower wheel while power is turned on.",
        "requires_tech": True
    },
    ("daikin", "c4"): {
        "title": "Daikin Error C4: Indoor Heat Exchanger Liquid Pipe Thermistor Fault",
        "meaning": "The thermistor sensor on the indoor copper liquid pipe is defective or loose.",
        "steps": [
            "Reset power at the MCB for 5 minutes.",
            "Check for rodent damage on the wiring bundle coming into the indoor unit.",
            "If C4 stays on display, the thermistor probe must be replaced with genuine Daikin 20kΩ sensor."
        ],
        "safety_alert": "Turn off power prior to inspecting indoor wire connections.",
        "requires_tech": True
    },
    ("daikin", "l5"): {
        "title": "Daikin Error L5: Inverter Compressor Instantaneous Overcurrent",
        "meaning": "The outdoor inverter IPM module detected a sudden current spike or compressor mechanical stall.",
        "steps": [
            "Check your mains voltage — extreme low voltage (<180V) forces the compressor to draw dangerous amperage.",
            "Inspect the outdoor unit: ensure the outdoor fan is blowing hot air and not jammed.",
            "Turn off the breaker and allow the compressor to cool down for 45 minutes.",
            "If L5 trips immediately on startup, the compressor winding has grounded or the outdoor inverter IPM module is shorted."
        ],
        "safety_alert": "High current electrical hazard. Technician intervention is mandatory.",
        "requires_tech": True
    },

    # ------------------ LG DUAL INVERTER ------------------
    ("lg", "ch01"): {
        "title": "LG Error CH01 / 01: Indoor Air Thermistor Open / Short Circuit",
        "meaning": "The indoor room temperature sensor is disconnected or out of electrical resistance specifications.",
        "steps": [
            "Turn off the AC from the remote and trip the main power switch for 5 minutes.",
            "Open the front panel, remove the mesh filters, and check the sensor clipped on the right of the coil.",
            "Power back on. If CH01 remains, the thermistor probe has failed and needs replacement."
        ],
        "safety_alert": "Ensure power is completely cut before opening the electrical cover.",
        "requires_tech": True
    },
    ("lg", "ch02"): {
        "title": "LG Error CH02 / 02: Indoor Pipe Thermistor Open / Short Circuit",
        "meaning": "The indoor copper pipe temperature sensor is malfunctioning.",
        "steps": [
            "Power cycle the AC from the MCB for 5 minutes.",
            "Check for clean air filters; if filters are choked with dirt, wash them thoroughly.",
            "If CH02 persists, the pipe sensor needs professional replacement."
        ],
        "safety_alert": "High voltage on main board. Turn off power switch.",
        "requires_tech": True
    },
    ("lg", "ch05"): {
        "title": "LG Error CH05 / 05: Indoor-Outdoor Serial Communication Error",
        "meaning": "No serial communication signal received between indoor and outdoor PCBs for more than 3 minutes.",
        "steps": [
            "Turn off the AC and turn off the dedicated stabilizer/MCB for 5 minutes.",
            "Ensure the dedicated voltage stabilizer is turned on and delivering power to the outdoor unit.",
            "Inspect the external communication cable between indoor and outdoor for cuts or rat bites.",
            "If error persists, the outdoor inverter PCB or communication optocoupler circuit is damaged."
        ],
        "safety_alert": "Outdoor unit holds lethal DC bus voltages. Do not attempt board repairs yourself.",
        "requires_tech": True
    },
    ("lg", "ch38"): {
        "title": "LG Error CH38: Low Refrigerant Gas Level Detected",
        "meaning": "The smart inverter system detected that the compressor is running at high frequency but heat exchange is insufficient, confirming refrigerant leak.",
        "steps": [
            "Turn off the AC immediately. Continuing to run with CH38 will damage the Dual Inverter compressor.",
            "Check the outdoor unit brass flare nuts for oil stains (indicates point of leakage).",
            "This requires a certified technician to find the leak, braze or tighten flare nuts, pull a deep vacuum below 500 microns, and charge R32 gas by weight."
        ],
        "safety_alert": "Never add top-up gas without fixing the leak first.",
        "requires_tech": True
    },
    ("lg", "ch21"): {
        "title": "LG Error CH21: IPM Inverter Over-Current Protection",
        "meaning": "The Intelligent Power Module (IPM) on the outdoor PCB detected excessive current drawn by the DC compressor.",
        "steps": [
            "Turn off the breaker and check mains electricity line voltage with a multimeter or stabilizer display (must be 220V - 240V).",
            "Allow the outdoor unit to cool down for 30 minutes.",
            "If CH21 reappears, either the outdoor PCB inverter circuit has failed or compressor motor has locked."
        ],
        "safety_alert": "Technician diagnosis required for compressor winding resistance check.",
        "requires_tech": True
    },

    # ------------------ BLUE STAR ------------------
    ("bluestar", "e1"): {
        "title": "Blue Star Error E1: Indoor Room Temperature Sensor Failure",
        "meaning": "The indoor ambient sensor is reading open or short circuit.",
        "steps": [
            "Power cycle the AC via the MCB for 5 minutes.",
            "Clean the dust mesh filter located under the front flap.",
            "If E1 remains displayed on the LED screen, the sensor thermistor probe needs replacement."
        ],
        "safety_alert": "Turn off power prior to opening the front panel.",
        "requires_tech": True
    },
    ("bluestar", "e2"): {
        "title": "Blue Star Error E2: Indoor Coil Pipe Temperature Sensor Error",
        "meaning": "Evaporator coil temperature thermistor is damaged or loose.",
        "steps": [
            "Turn off the AC for 5 minutes from the main circuit breaker.",
            "Wash and dry the air filters to eliminate freeze triggers.",
            "If error persists, book a technician to replace the indoor coil probe."
        ],
        "safety_alert": "Keep hands clear of sharp aluminum fins.",
        "requires_tech": True
    },
    ("bluestar", "e4"): {
        "title": "Blue Star Error E4: Indoor/Outdoor Communication or PCB Failure",
        "meaning": "Communication signal interruption between the indoor control board and outdoor unit.",
        "steps": [
            "Power off the AC and MCB for 5 minutes to clear voltage spike latches.",
            "Verify your voltage stabilizer output (should be 220-230V).",
            "If the error does not clear, the communication signal wiring or outdoor PCB is damaged."
        ],
        "safety_alert": "Do not touch live terminal terminals.",
        "requires_tech": True
    },
    ("bluestar", "ec"): {
        "title": "Blue Star Error EC: Refrigerant Leakage Protection",
        "meaning": "The indoor coil temperature does not decrease after the compressor has run for 10 minutes, indicating loss of refrigerant.",
        "steps": [
            "Turn off the AC immediately to avoid overheating the compressor.",
            "Check outdoor service valves for signs of oil or ice build-up.",
            "Requires a certified Cooling Hub technician for nitrogen pressure testing, leak sealing, and gas recharge."
        ],
        "safety_alert": "Running with zero gas can burn the compressor motor.",
        "requires_tech": True
    },

    # ------------------ LLOYD ------------------
    ("lloyd", "e1"): {
        "title": "Lloyd Error E1: High Pressure Protection / Indoor Sensor Fault",
        "meaning": "The compressor discharge pressure is excessively high, or the indoor ambient sensor is faulty.",
        "steps": [
            "Check if the outdoor unit fan is spinning freely and the condenser fins are not blocked by dirt or walls.",
            "Switch off the main power breaker for 5 minutes.",
            "If the outdoor unit is clean and E1 persists, the sensor or high pressure switch needs technician attention."
        ],
        "safety_alert": "High pressure safety hazard. Ensure outdoor unit has clear ventilation.",
        "requires_tech": True
    },
    ("lloyd", "e2"): {
        "title": "Lloyd Error E2: Indoor Coil Freeze Prevention Protection",
        "meaning": "Indoor evaporator coil temperature has fallen too low, causing icing on the coil.",
        "steps": [
            "Turn off the AC and wait 30 minutes for any ice to melt completely.",
            "Clean the dusty mesh air filters thoroughly.",
            "Check if the indoor fan is blowing at full speed.",
            "If ice forms again within 15 minutes of turning on, refrigerant gas is low."
        ],
        "safety_alert": "Place a bucket or towel below the indoor unit to catch melting water.",
        "requires_tech": True
    },
    ("lloyd", "e4"): {
        "title": "Lloyd Error E4: Compressor Discharge Overheat / Exhaust Temperature High",
        "meaning": "The compressor discharge temperature has crossed the safety threshold.",
        "steps": [
            "Turn off the AC immediately.",
            "Ensure the outdoor unit is shaded from extreme direct sunlight if possible and has 2+ feet clearance.",
            "Often caused by low refrigerant gas or choked outdoor condenser fins."
        ],
        "safety_alert": "Allow outdoor unit 45 minutes to cool down before any inspection.",
        "requires_tech": True
    },

    # ------------------ PANASONIC ------------------
    ("panasonic", "h11"): {
        "title": "Panasonic Error H11: Indoor/Outdoor Communication Anomaly",
        "meaning": "The indoor and outdoor microcomputers cannot establish serial communication.",
        "steps": [
            "Turn off the power at the main breaker for 5 minutes.",
            "Ensure voltage stabilizer is providing stable power to both indoor and outdoor units.",
            "If H11 returns within 1 minute of turning on, communication signal wires or the outdoor control board need service."
        ],
        "safety_alert": "Do not touch live terminal block connections.",
        "requires_tech": True
    },
    ("panasonic", "h16"): {
        "title": "Panasonic Error H16: Outdoor Current Transformer (CT) Anomaly / Low Gas",
        "meaning": "Outdoor compressor running current is abnormally low, signaling a refrigerant leak or compressor disconnection.",
        "steps": [
            "Power cycle the AC via the MCB switch.",
            "Check for ice on the outdoor valve copper lines.",
            "This error typically requires professional gas leak detection and recharging."
        ],
        "safety_alert": "Certified technician required to inspect outdoor electrical current transformer.",
        "requires_tech": True
    },
    ("panasonic", "f91"): {
        "title": "Panasonic Error F91: Refrigeration Cycle Abnormality (Gas Leak)",
        "meaning": "The system detected an abnormal refrigeration cycle, commonly a severe refrigerant leak or clogged capillary tube.",
        "steps": [
            "Turn off the unit immediately.",
            "Inspect outdoor copper line connections for oil stains.",
            "Requires nitrogen leak detection, flare repair, evacuation, and R32 charging by a technician."
        ],
        "safety_alert": "Do not continue running the AC on F91.",
        "requires_tech": True
    },

    # ------------------ GENERIC / OTHER BRANDS ------------------
    ("general", "e1"): {
        "title": "AC Error E1: Indoor Room Temperature Sensor / High Pressure Fault",
        "meaning": "Most split ACs use E1 to signal an indoor ambient temperature sensor fault or high pressure lockout.",
        "steps": [
            "Turn off the AC and trip the dedicated MCB switch for 5 minutes to clear temporary PCB memory latches.",
            "Open the front panel and remove the dust filters to inspect the sensor wire.",
            "If the code persists after turning power back on, the sensor thermistor (5kΩ-10kΩ) is defective and needs replacement."
        ],
        "safety_alert": "Turn off main power before touching internal components.",
        "requires_tech": True
    },
    ("general", "e2"): {
        "title": "AC Error E2: Indoor Coil Sensor / Anti-Freezing Protection",
        "meaning": "Indicates indoor copper pipe temperature sensor failure or coil ice build-up.",
        "steps": [
            "Turn off the AC and inspect if the indoor cooling coil has visible white frost/ice.",
            "Thoroughly wash and dry both air filter meshes.",
            "Allow any ice to melt for 20 minutes, then restart in Cool Mode at 24°C with Fan on High.",
            "If E2 reappears quickly, the coil sensor has failed or gas is leaking."
        ],
        "safety_alert": "Keep a towel ready for water dripping from melting coil ice.",
        "requires_tech": True
    },
    ("general", "e4"): {
        "title": "AC Error E4: Communication Error or Blower Fan Motor Malfunction",
        "meaning": "Signal loss between indoor and outdoor boards, or indoor blower speed feedback is missing.",
        "steps": [
            "Perform a complete 5-minute power cycle from the MCB breaker.",
            "Ensure the indoor blower wheel spins freely when pushed gently (power OFF).",
            "Check if your voltage stabilizer shows normal voltage (210V - 240V).",
            "If E4 persists, technician service is needed to test signal wires and control boards."
        ],
        "safety_alert": "Never touch electrical terminals while energized.",
        "requires_tech": True
    },
    ("general", "f1"): {
        "title": "AC Error F1: Indoor Temperature Sensor or Fan Driver Fault",
        "meaning": "Sensor circuit open/short or indoor fan motor control issue.",
        "steps": [
            "Switch off AC from the main power board for 5 minutes.",
            "Clean the dust filters thoroughly.",
            "If F1 remains, the thermistor or fan board driver requires professional replacement."
        ],
        "safety_alert": "Always turn off mains electricity before inspecting the unit.",
        "requires_tech": True
    },
    ("general", "ec"): {
        "title": "AC Error EC: Refrigerant Gas Leakage Detected",
        "meaning": "The AC detected that cooling is not occurring despite the compressor running, confirming refrigerant loss.",
        "steps": [
            "Turn off the AC immediately to protect the compressor from burnout.",
            "Check outdoor copper pipe connections for dark oily spots.",
            "Book a certified Cooling Hub technician for nitrogen pressure leak testing, flare tightening, and R32/R410A gas refill."
        ],
        "safety_alert": "Never run an AC with zero refrigerant.",
        "requires_tech": True
    }
}

# ==============================================================================
# HELPER FUNCTIONS: BRAND & CODE EXTRACTION
# ==============================================================================
KNOWN_BRANDS = {
    "voltas": "Voltas",
    "daikin": "Daikin",
    "lg": "LG",
    "blue star": "Blue Star",
    "bluestar": "Blue Star",
    "lloyd": "Lloyd",
    "panasonic": "Panasonic",
    "hitachi": "Hitachi",
    "samsung": "Samsung",
    "haier": "Haier",
    "carrier": "Carrier",
    "mitsubishi": "Mitsubishi",
    "godrej": "Godrej",
    "whirlpool": "Whirlpool",
    "onida": "Onida",
    "croma": "Croma"
}

def extract_brand(text: str) -> Optional[str]:
    text_lower = text.lower()
    for key in KNOWN_BRANDS:
        if key in text_lower:
            return "bluestar" if key in ["blue star", "bluestar"] else key
    return None

def extract_error_code(text: str) -> Optional[str]:
    patterns = [
        r'\b(ch\s*\d{1,2})\b',
        r'\b([eEfF]\s*[0-9]{1,2})\b',
        r'\b([uU]\s*[0-9a-zA-Z]{1,2})\b',
        r'\b([hH]\s*[0-9]{1,2})\b',
        r'\b(ec|EC)\b',
        r'\b([pP]\s*[0-9]{1,2})\b',
        r'\b([lL]\s*[0-9]{1,2})\b',
        r'\b([cC]\s*[0-9]{1,2})\b',
        r'\b([aA]\s*[0-9]{1,2})\b',
        r'\b(f\s*9[19])\b',
        r'error\s*(?:code\s*)?([a-zA-Z0-9]{2,4})\b'
    ]
    text_clean = text.lower().replace("error code", "error").replace("code", "error")
    for p in patterns:
        m = re.search(p, text_clean)
        if m:
            code = m.group(1).replace(" ", "").lower()
            if code not in ["ac", "amc", "r32", "r410a", "inverter", "ton", "room"]:
                return code
    return None

def lookup_error_code(brand: Optional[str], code: str) -> Tuple[Optional[Dict[str, Any]], str]:
    code_norm = code.lower().replace(" ", "")
    if brand:
        b_key = brand.lower().replace(" ", "")
        if (b_key, code_norm) in ERROR_CODES_DB:
            return ERROR_CODES_DB[(b_key, code_norm)], brand
    if ("general", code_norm) in ERROR_CODES_DB:
        return ERROR_CODES_DB[("general", code_norm)], "General HVAC"
    for (b, c), data in ERROR_CODES_DB.items():
        if c == code_norm:
            return data, b.capitalize()
    return None, ""

# ==============================================================================
# MAIN CHATBOT QUERY ENDPOINT
# ==============================================================================
@router.post("/query", response_model=ChatbotResponse)
def query_chatbot(req: ChatbotRequest, db: Session = Depends(get_db)):
    msg = req.message.lower().strip()
    ctx = req.context or {}
    
    current_issue = ctx.get("current_issue")
    awaiting_feedback = ctx.get("awaiting_feedback", False)
    awaiting_brand = ctx.get("awaiting_brand", False)
    pending_code = ctx.get("pending_code")
    saved_brand = ctx.get("brand") or extract_brand(msg)

    # --------------------------------------------------------------------------
    # 0. RESOLUTION FEEDBACK / FOLLOW-UP HANDLING
    # --------------------------------------------------------------------------
    positive_phrases = ["yes", "resolved", "fixed", "it worked", "it is fixed", "working now", "it's working", "solved", "all good", "done", "works now", "problem solved"]
    negative_phrases = ["no", "not working", "still not working", "still error", "didn't work", "did not work", "not resolved", "same problem", "problem persists", "not fixed", "still same", "still leaking", "still no cooling", "failed"]

    if awaiting_feedback or any(msg == p or msg.startswith(p + " ") for p in positive_phrases + negative_phrases):
        if any(p in msg for p in positive_phrases):
            reply = (
                "🎉 **Awesome! I'm glad your AC is working properly again!**\n\n"
                "💡 **Expert Care Tips to Prevent Future Breakdowns**:\n"
                "• **Clean air filters every 15 days**: Improves cooling efficiency by up to 15% and cuts power bills.\n"
                "• **Keep outdoor unit clear**: Ensure 2+ feet of unobstructed airflow around the condenser fan.\n"
                "• **Annual Maintenance (AMC)**: Regular deep foam jet wash extends compressor life by 5+ years.\n\n"
                "Would you like to explore our comprehensive AMC Protection Plans or need help with anything else?"
            )
            return ChatbotResponse(
                reply=reply,
                intent="troubleshooting_resolved",
                suggestions=["Explore AMC Protection Plans", "Calculate Electricity Savings", "Recommend Best AC"],
                action_type="navigate_amc",
                payload={"context": {"current_issue": None, "awaiting_feedback": False}}
            )
        elif any(p in msg for p in negative_phrases):
            reply = (
                "😔 **I understand. Since the basic troubleshooting steps didn't resolve the issue, this indicates a deeper hardware or refrigerant fault.**\n\n"
                "⚠️ **Safety Recommendation**:\n"
                "Internal electrical components, fan motor bearings, and high-pressure refrigerant circuits require specialized diagnostic tools (digital manifold gauges, multimeters, vacuum pumps) and OEM replacement parts.\n\n"
                "👨‍🔧 **Would you like me to book a certified Cooling Hub technician for an on-site inspection?**\n"
                "• 100% background-verified technician\n"
                "• Standard transparent pricing\n"
                "• 30-day service warranty on all repairs"
            )
            return ChatbotResponse(
                reply=reply,
                intent="troubleshooting_unresolved",
                suggestions=["Book a Technician Now", "Raise Priority Complaint", "Check AMC Plans"],
                action_type="navigate_services",
                payload={"context": {"current_issue": current_issue, "awaiting_feedback": False, "recommend_technician": True}}
            )

    # --------------------------------------------------------------------------
    # 0B. AWAITING BRAND FOR PENDING ERROR CODE
    # --------------------------------------------------------------------------
    if awaiting_brand and pending_code:
        brand = extract_brand(msg)
        if brand:
            err_data, matched_brand = lookup_error_code(brand, pending_code)
            if err_data:
                steps_formatted = "\n".join([f"{i+1}️⃣ {step}" for i, step in enumerate(err_data["steps"])])
                reply = (
                    f"🔍 **{err_data['title']}**\n\n"
                    f"📌 **What this means**: {err_data['meaning']}\n\n"
                    f"🛠️ **Step-by-step Troubleshooting Instructions**:\n{steps_formatted}\n\n"
                    f"{err_data['safety_alert']}\n\n"
                    f"👉 **Did this resolve the issue, or is your AC still displaying the {pending_code.upper()} error?**"
                )
                return ChatbotResponse(
                    reply=reply,
                    intent="troubleshooting_error_code",
                    suggestions=["✅ Yes, problem resolved!", "❌ No, still showing error", "👨‍🔧 Book a Technician"],
                    action_type="navigate_services" if err_data.get("requires_tech") else None,
                    payload={"context": {"current_issue": "error_code", "brand": brand, "error_code": pending_code, "awaiting_feedback": True}}
                )
            else:
                reply = (
                    f"🔍 **{brand.capitalize()} AC - Error Code {pending_code.upper()}**\n\n"
                    f"📌 **Diagnostic Summary**: On {brand.capitalize()} split ACs, error code **{pending_code.upper()}** typically indicates a sensor communication anomaly, PCB voltage protection, or an operational lockout.\n\n"
                    f"🛠️ **Safe Diagnostic Steps**:\n"
                    f"1️⃣ **Power Reset**: Switch off the AC remote, then turn off the dedicated MCB switch for 5 to 7 minutes to clear transient microcomputer memory lockouts.\n"
                    f"2️⃣ **Filter Check**: Open the indoor front panel and clean the mesh air filters thoroughly under running water.\n"
                    f"3️⃣ **Stabilizer Verification**: Ensure your voltage stabilizer is delivering between 210V and 240V.\n\n"
                    f"⚠️ *If the code reappears immediately after turning the breaker back on, the unit requires a professional sensor or PCB check.*\n\n"
                    f"👉 **Did this reset resolve the error, or does the code still appear?**"
                )
                return ChatbotResponse(
                    reply=reply,
                    intent="troubleshooting_error_code",
                    suggestions=["✅ Yes, error cleared!", "❌ No, still showing error", "👨‍🔧 Book a Technician"],
                    action_type="navigate_services",
                    payload={"context": {"current_issue": "error_code", "brand": brand, "error_code": pending_code, "awaiting_feedback": True}}
                )

    # --------------------------------------------------------------------------
    # 1. ERROR CODE TROUBLESHOOTING
    # --------------------------------------------------------------------------
    detected_code = extract_error_code(msg)
    detected_brand = extract_brand(msg) or saved_brand

    if detected_code or any(k in msg for k in ["error code", "error e", "error f", "error ch", "error u", "fault code", "code on display"]):
        if detected_code:
            if not detected_brand:
                reply = (
                    f"⚠️ You mentioned error code **{detected_code.upper()}**. Because error codes differ significantly between AC manufacturers, could you tell me your **AC brand and model** so I can look up the verified OEM troubleshooting steps?\n\n"
                    f"*(e.g., Voltas, Daikin, LG Dual Inverter, Blue Star, Lloyd, Panasonic, Hitachi, Samsung)*"
                )
                return ChatbotResponse(
                    reply=reply,
                    intent="ask_brand_for_error",
                    suggestions=["Voltas", "Daikin", "LG", "Blue Star", "Lloyd", "Panasonic", "Hitachi", "Samsung"],
                    payload={"context": {"current_issue": "error_code", "pending_code": detected_code, "awaiting_brand": True}}
                )

            err_data, matched_brand = lookup_error_code(detected_brand, detected_code)
            if err_data:
                steps_formatted = "\n".join([f"{i+1}️⃣ {step}" for i, step in enumerate(err_data["steps"])])
                reply = (
                    f"🔍 **{err_data['title']}**\n\n"
                    f"📌 **What this means**: {err_data['meaning']}\n\n"
                    f"🛠️ **Step-by-step Troubleshooting Instructions**:\n{steps_formatted}\n\n"
                    f"{err_data['safety_alert']}\n\n"
                    f"👉 **Did this resolve the issue, or is your AC still displaying error {detected_code.upper()}?**"
                )
                return ChatbotResponse(
                    reply=reply,
                    intent="troubleshooting_error_code",
                    suggestions=["✅ Yes, problem resolved!", "❌ No, still showing error", "👨‍🔧 Book a Technician"],
                    action_type="navigate_services" if err_data.get("requires_tech") else None,
                    payload={"context": {"current_issue": "error_code", "brand": detected_brand, "error_code": detected_code, "awaiting_feedback": True}}
                )
            else:
                reply = (
                    f"🔍 **{detected_brand.capitalize()} AC - Error Code {detected_code.upper()}**\n\n"
                    f"📌 **Diagnostic Summary**: On {detected_brand.capitalize()} models, error **{detected_code.upper()}** generally indicates an internal sensor out-of-range, communication signal timeout, or inverter safety trip.\n\n"
                    f"🛠️ **Recommended Diagnostic Procedure**:\n"
                    f"1️⃣ **Hardware Reset**: Turn off the AC remote, then trip the dedicated MCB breaker for 5 minutes.\n"
                    f"2️⃣ **Airflow Check**: Clean the mesh air filters to rule out coil freeze protection.\n"
                    f"3️⃣ **Power Stability**: Verify that your line voltage is stable.\n\n"
                    f"⚠️ *If {detected_code.upper()} persists upon powering back on, a physical component (thermistor, PCB, or fan motor) needs technician inspection.*\n\n"
                    f"👉 **Did this resolve the issue, or is your AC still displaying error {detected_code.upper()}?**"
                )
                return ChatbotResponse(
                    reply=reply,
                    intent="troubleshooting_error_code",
                    suggestions=["✅ Yes, problem resolved!", "❌ No, still showing error", "👨‍🔧 Book a Technician"],
                    action_type="navigate_services",
                    payload={"context": {"current_issue": "error_code", "brand": detected_brand, "error_code": detected_code, "awaiting_feedback": True}}
                )
        else:
            reply = (
                "⚠️ **AC Error Code Diagnostic Assistant**:\n\n"
                "I can diagnose verified error codes for all major brands (Voltas, Daikin, LG, Blue Star, Lloyd, Panasonic, Hitachi, Samsung, etc.).\n\n"
                "👉 **Please tell me: What is the error code displayed on your AC indoor display, and which brand is it?**\n\n"
                "*(Examples: 'Voltas E1', 'Daikin U0', 'LG CH05', 'Blue Star EC', 'Lloyd E4')*"
            )
            return ChatbotResponse(
                reply=reply,
                intent="ask_error_code",
                suggestions=["Voltas E1 error", "Daikin U0 error", "LG CH05 error", "Blue Star EC error", "Lloyd E4 error"],
                payload={"context": {"current_issue": "error_code", "awaiting_code": True}}
            )

    # --------------------------------------------------------------------------
    # 2. AC REMOTE NOT WORKING
    # --------------------------------------------------------------------------
    if any(k in msg for k in ["remote", "remote not working", "remote control", "display on remote", "buttons not working", "remote buttons", "ac not responding to remote"]):
        reply = (
            "📱 **Troubleshooting: AC Remote Not Working**\n\n"
            "Follow these quick, verified diagnostic checks:\n\n"
            "1️⃣ **Camera IR Flash Test (Quickest Check)**:\n"
            "• Open the camera app on your smartphone.\n"
            "• Point the front IR bulb of your AC remote directly into the camera lens.\n"
            "• Press any button on the remote while looking at your phone screen.\n"
            "• *If you see a purple/bluish flashing light on screen, your remote is transmitting correctly.* If not, the batteries or remote board are dead.\n\n"
            "2️⃣ **Power & Capacitor Reset**:\n"
            "• Remove both AAA batteries.\n"
            "• Press and hold the **Power Button** for 20 seconds to drain residual circuit capacitance.\n"
            "• Insert brand-new, leak-free alkaline batteries (ensure correct +/- polarity).\n\n"
            "3️⃣ **Indoor Unit Receiver & Manual Test**:\n"
            "• Gently wipe the dark infrared receiver window on the indoor AC panel with a soft dry cloth.\n"
            "• Open the indoor front panel and press the small manual emergency power button (labelled 'AUTO/COOL' or 'ON/OFF'). If the AC turns on, the AC unit itself is fine.\n\n"
            "👉 **Did this fix your remote, or is it still not responding?**"
        )
        return ChatbotResponse(
            reply=reply,
            intent="troubleshooting_remote",
            suggestions=["✅ Yes, remote is working!", "❌ No, still not responding", "👨‍🔧 Book a Technician"],
            action_type="navigate_services",
            payload={"context": {"current_issue": "remote", "awaiting_feedback": True}}
        )

    # --------------------------------------------------------------------------
    # 3. AC NOT TURNING ON / NO POWER / MCB TRIPPING
    # --------------------------------------------------------------------------
    if any(k in msg for k in ["not turning on", "won't turn on", "wont turn on", "not starting", "no power", "not switching on", "dead", "power issue", "mcb trip", "tripping", "tripping mcb"]):
        reply = (
            "🔌 **Troubleshooting: AC Not Turning On / No Power**\n\n"
            "Let's trace the electrical power flow step-by-step:\n\n"
            "1️⃣ **Check the Main MCB Breaker**:\n"
            "• Locate your home electrical distribution box and verify if the dedicated AC circuit breaker (usually 20A or 25A) has tripped to the middle/down position.\n"
            "• *If it trips immediately every time you flip it up, DO NOT force it — this indicates a short circuit in the compressor, wiring, or stabilizer.* Technician inspection is required.\n\n"
            "2️⃣ **Voltage Stabilizer Delay Check**:\n"
            "• Most AC stabilizers have a built-in 3-minute time delay circuit to protect the compressor from voltage spikes.\n"
            "• Wait at least 3 minutes to see if the stabilizer indicator turns from amber/delay to green.\n\n"
            "3️⃣ **16A Power Socket & Plug Inspection**:\n"
            "• Unplug the AC plug and inspect the metal pins for dark black burn marks or melting (loose socket contacts often cause high resistance heating).\n\n"
            "4️⃣ **Manual Emergency Switch**:\n"
            "• Lift the indoor AC front grille and press the small manual 'Manual / Emergency Run' button to bypass the remote sensor.\n\n"
            "⚠️ **Safety Warning**: Never insert bare wires or bypass a tripping MCB.\n\n"
            "👉 **Did the AC turn on after these checks, or is there still no power?**"
        )
        return ChatbotResponse(
            reply=reply,
            intent="troubleshooting_power",
            suggestions=["✅ Yes, AC turned on!", "❌ No, still not turning on", "👨‍🔧 Book a Technician"],
            action_type="navigate_services",
            payload={"context": {"current_issue": "not_turning_on", "awaiting_feedback": True}}
        )

    # --------------------------------------------------------------------------
    # 4. AC NOT COOLING PROPERLY / WEAK AIRFLOW / WARM AIR
    # --------------------------------------------------------------------------
    if any(k in msg for k in ["not cooling", "low cooling", "cooling properly", "warm air", "hot air", "less cooling", "cooling slow", "weak airflow", "low air", "no cooling", "air not coming", "slow fan"]):
        reply = (
            "❄️ **Troubleshooting: AC Not Cooling Properly or Weak Airflow**\n\n"
            "Follow these verified steps to restore cooling power:\n\n"
            "1️⃣ **Mode & Remote Settings Check**:\n"
            "• Ensure your remote is set to **Cool Mode** (indicated by a ❄️ snowflake icon), NOT 'Fan Only' (🌀) or 'Dry' (💧) mode.\n"
            "• Set the temperature to **22°C - 24°C** and Fan Speed to **High or Auto**.\n\n"
            "2️⃣ **Inspect & Wash Dust Filters**:\n"
            "• Clogged mesh filters reduce airflow by over 45% and make the indoor coil freeze up.\n"
            "• Lift the front flap, take out the 2 mesh filters, rinse thoroughly under cool tap water, and shake dry before putting back.\n\n"
            "3️⃣ **Outdoor Unit Ventilation Check**:\n"
            "• Look at your outdoor unit: is the outdoor fan spinning and blowing hot air out?\n"
            "• Clear any cardboard, bird nets, or dust blankets blocking the outdoor condenser coils. The outdoor unit requires at least 2 feet of open air.\n\n"
            "4️⃣ **Refrigerant Gas & Ice Inspection**:\n"
            "• Look at the copper piping connected to the outdoor unit. If you see white powdery ice or frost on the thin copper tube, refrigerant gas is low due to a micro-leak.\n\n"
            "👉 **Did cleaning the filters and verifying the settings restore normal cooling?**"
        )
        return ChatbotResponse(
            reply=reply,
            intent="troubleshooting_cooling",
            suggestions=["✅ Yes, cooling restored!", "❌ No, still blowing warm air", "👨‍🔧 Book a Technician"],
            action_type="navigate_services",
            payload={"context": {"current_issue": "not_cooling", "awaiting_feedback": True}}
        )

    # --------------------------------------------------------------------------
    # 5. WATER LEAKAGE
    # --------------------------------------------------------------------------
    if any(k in msg for k in ["water leakage", "water leaking", "water dripping", "dripping", "water dropping", "leakage", "water inside", "water problem"]):
        reply = (
            "💧 **Troubleshooting: AC Water Leakage Inside Room**\n\n"
            "Water dripping from the indoor unit is almost always caused by drainage obstruction. Here is what to do:\n\n"
            "1️⃣ **Turn Off the AC Immediately**:\n"
            "• Turn off the unit to prevent overflow into the indoor motor or electrical junction box.\n\n"
            "2️⃣ **Check the Drain Pipe Exit**:\n"
            "• Trace the flexible white drain pipe running outside your window/balcony.\n"
            "• Check if the end of the pipe is submerged in a bucket of water, curled upward, or blocked by algae/mud. The pipe must slope continuously downward.\n\n"
            "3️⃣ **Inspect for Coil Ice Melt**:\n"
            "• Open the front flap: if you see thick white ice on the cooling fins, the drain tray is overflowing because the frozen coil is melting faster than the drain can handle.\n"
            "• Cause: Choked air filters or low refrigerant (R32/R410A) gas.\n\n"
            "4️⃣ **Indoor Unit Leveling**:\n"
            "• If the indoor unit tilts slightly toward the wrong side, condensed water overflows the internal drain pan instead of flowing toward the drain outlet.\n\n"
            "💡 *For choked drain lines, our technicians use high-pressure Foam Jet pumps to clear internal sludge safely.*\n\n"
            "👉 **Did clearing the external drain pipe solve the leak, or is water still dripping?**"
        )
        return ChatbotResponse(
            reply=reply,
            intent="troubleshooting_water",
            suggestions=["✅ Yes, leakage stopped!", "❌ No, still dripping inside", "👨‍🔧 Book a Technician"],
            action_type="navigate_services",
            payload={"context": {"current_issue": "water_leakage", "awaiting_feedback": True}}
        )

    # --------------------------------------------------------------------------
    # 6. UNUSUAL NOISE / VIBRATION
    # --------------------------------------------------------------------------
    if any(k in msg for k in ["noise", "unusual noise", "sound", "vibration", "rattling", "squealing", "whistling", "grinding", "clicking", "buzzing", "humming"]):
        reply = (
            "🔊 **Troubleshooting: Unusual AC Noise or Vibration**\n\n"
            "Let's identify the source of the noise by sound type:\n\n"
            "1️⃣ **Rattling or Vibrating Sound**:\n"
            "• **Indoor unit**: Front plastic grille not clicked in securely. Press firmly on both lower corners until you hear a snap.\n"
            "• **Outdoor unit**: Loose wall mounting bracket bolts or missing anti-vibration rubber pads.\n\n"
            "2️⃣ **Whistling or Whooshing Sound**:\n"
            "• Caused by choked mesh filters forcing the fan to suck air through restricted gaps. Washing the filters immediately resolves this.\n\n"
            "3️⃣ **Clicking or Ticking Sound**:\n"
            "• Normal when cooling starts/stops due to plastic casing expansion and contraction with temperature changes.\n"
            "• If continuous fast clicking occurs, a relay on the PCB or the louver swing motor is jammed.\n\n"
            "4️⃣ **Squealing, Grinding, or Harsh Humming**:\n"
            "• Indicates worn-out blower fan bearings, a dry outdoor fan motor, or a locked compressor rotor.\n"
            "• ⚠️ *Requires professional lubrication or motor replacement by a certified technician.*\n\n"
            "👉 **Were you able to eliminate the noise by securing the front grille or cleaning the filters?**"
        )
        return ChatbotResponse(
            reply=reply,
            intent="troubleshooting_noise",
            suggestions=["✅ Yes, noise eliminated!", "❌ No, harsh noise persists", "👨‍🔧 Book a Technician"],
            action_type="navigate_services",
            payload={"context": {"current_issue": "noise", "awaiting_feedback": True}}
        )

    # --------------------------------------------------------------------------
    # 7. AC SWITCHING OFF AUTOMATICALLY / SHUTTING DOWN
    # --------------------------------------------------------------------------
    if any(k in msg for k in ["switching off", "turns off automatically", "shuts off", "stopping", "stops after", "cuts off", "turning off automatically", "shutting down", "shut off"]):
        reply = (
            "⏱️ **Troubleshooting: AC Switching Off Automatically**\n\n"
            "When an AC turns off unexpectedly after running for a few minutes, here are the primary causes:\n\n"
            "1️⃣ **Check Sleep / Timer Settings on Remote**:\n"
            "• Check if the remote screen shows a **Timer Off (OFF)** or **Sleep (🌙)** indicator.\n"
            "• Press the 'Cancel' or 'Timer' button on your remote to disable any scheduled auto-shutdown.\n\n"
            "2️⃣ **Compressor Thermal Overload Cut-Off**:\n"
            "• If the outdoor condenser coil is choked with heavy dust, or ambient temperatures exceed 45°C with direct scorching sun and poor ventilation, the compressor thermal protector trips to prevent motor burnout.\n"
            "• Clear any obstructions around the outdoor unit and spray the rear condenser fins gently with water (power OFF).\n\n"
            "3️⃣ **Voltage Stabilizer High/Low Voltage Cut-Off**:\n"
            "• Watch your voltage stabilizer when the AC cuts off. If input voltage drops below 190V or rises above 260V, the stabilizer cuts power to protect delicate inverter boards.\n\n"
            "4️⃣ **Choked Air Filters (Evaporator Freeze Cut-Off)**:\n"
            "• Severely blocked filters trigger the indoor freeze sensor, shutting off the compressor after 10-15 minutes.\n\n"
            "👉 **Did checking the timer and cleaning the filters resolve the automatic shut-off?**"
        )
        return ChatbotResponse(
            reply=reply,
            intent="troubleshooting_shutoff",
            suggestions=["✅ Yes, running normally now!", "❌ No, still shutting down", "👨‍🔧 Book a Technician"],
            action_type="navigate_services",
            payload={"context": {"current_issue": "auto_shutoff", "awaiting_feedback": True}}
        )

    # --------------------------------------------------------------------------
    # 8. DIRECT TECHNICIAN BOOKING REQUEST
    # --------------------------------------------------------------------------
    if any(k in msg for k in ["book technician", "book a technician", "technician", "mechanic", "send technician", "technician visit", "call mechanic", "call technician", "service man", "serviceman", "book service", "book repair"]):
        services = db.query(Service).limit(3).all()
        service_list = "\n".join([f"• **{s.title}** - ₹{s.price:,.0f} ({s.estimated_time})" for s in services])
        reply = (
            "👨‍🔧 **Book a Certified Cooling Hub Technician**\n\n"
            f"We have available technicians ready for on-site diagnosis and repair in your area:\n\n"
            f"{service_list}\n\n"
            "✅ 100% Background-Verified Technicians\n"
            "✅ 30-Day Service Warranty & Transparent Rates\n"
            "✅ Digital Completion Reports with Verified Spares\n\n"
            "Click **Book Service Technician** below to choose your preferred date and time slot!"
        )
        return ChatbotResponse(
            reply=reply,
            intent="service_booking",
            suggestions=["Book AC Service Now", "Raise Priority Complaint", "Check AMC Coverage"],
            action_type="navigate_services"
        )

    # --------------------------------------------------------------------------
    # 9. AC RECOMMENDATIONS (EXISTING FEATURE PRESERVED)
    # --------------------------------------------------------------------------
    if any(k in msg for k in ["recommend", "best ac", "buy ac", "which ac", "suggestion", "split ac", "window ac", "top ac"]):
        products = db.query(Product).order_by(Product.rating.desc()).limit(2).all()
        prod_names = ", ".join([f"{p.brand} {p.title} (₹{p.price:,.0f})" for p in products])
        reply = (
            f"🤖 **Coolie AI AC Recommendation**:\n\n"
            f"Based on customer ratings, COP cooling performance, and Indian climatic conditions:\n\n"
            f"1️⃣ **{products[0].title}** - 5 Star Inverter with ISEER {products[0].iseer_rating} (₹{products[0].price:,.0f})\n"
            f"2️⃣ **{products[1].title}** - Ultra-quiet cooling and heavy-duty compressor (₹{products[1].price:,.0f})\n\n"
            f"💡 *Sizing Rule of Thumb*:\n"
            f"• Up to 120 sq ft: 1.0 Ton 5-Star Inverter\n"
            f"• 120 - 170 sq ft: 1.5 Ton 5-Star Inverter\n"
            f"• 170 - 240 sq ft: 2.0 Ton 5-Star Inverter"
        )
        return ChatbotResponse(
            reply=reply,
            intent="ac_recommendation",
            suggestions=["Compare 5-Star Inverters", "Calculate Electricity Savings", "Book AC Installation"],
            action_type="navigate_shop"
        )

    # --------------------------------------------------------------------------
    # 10. ENERGY CALCULATOR (EXISTING FEATURE PRESERVED)
    # --------------------------------------------------------------------------
    if any(k in msg for k in ["electricity", "bill", "power", "save", "saving", "inverter vs", "calculator", "cost", "kwh"]):
        reply = (
            "⚡ **Energy & Electricity Savings Analysis**:\n\n"
            "Upgrading from an older 3-Star Non-Inverter AC to a modern **5-Star Inverter AC** cuts power consumption by up to **35% - 40%**:\n\n"
            "• **Annual Units Saved**: ~650 to 800 kWh\n"
            "• **Annual Rupee Savings**: ₹5,500 - ₹7,500 (at ₹8.5/unit)\n"
            "• **Payback Period**: 18 to 22 months\n\n"
            "Would you like to customize your exact room size, daily running hours, and regional electricity rate in our interactive Energy Calculator?"
        )
        return ChatbotResponse(
            reply=reply,
            intent="energy_calculator",
            suggestions=["Open Energy Calculator", "Browse 5-Star ACs", "Explore AMC Plans"],
            action_type="navigate_calculator"
        )

    # --------------------------------------------------------------------------
    # 11. AMC CONTRACTS (EXISTING FEATURE PRESERVED)
    # --------------------------------------------------------------------------
    if any(k in msg for k in ["amc", "maintenance contract", "yearly plan", "protection plan", "annual maintenance"]):
        reply = (
            "📅 **Cooling Hub Annual Maintenance Contracts (AMC)**:\n\n"
            "Never worry about sudden summer AC breakdowns again:\n\n"
            "• **Basic Shield (₹2,499/yr)**: 2 Deep Wet Services + 10% off spare parts.\n"
            "• **Standard Gold (₹4,499/yr)**: 3 Foam Jet Wash Services + Priority 6-hour dispatch.\n"
            "• **Premium Platinum (₹6,999/yr)**: Unlimited Repair Visits + **FREE Gas Charging** + **FREE Spare Parts**!\n\n"
            "Subscribe online with instant digital certificate issuance."
        )
        return ChatbotResponse(
            reply=reply,
            intent="amc_info",
            suggestions=["Subscribe to AMC Plan", "Check AMC Eligibility", "Book Single Service"],
            action_type="navigate_amc"
        )

    # --------------------------------------------------------------------------
    # 12. COMPLAINT DESK / GENERAL HELP
    # --------------------------------------------------------------------------
    if any(k in msg for k in ["complaint", "ticket", "escalation", "track complaint", "bad service"]):
        reply = (
            "📢 **Cooling Hub Complaint & Service Desk**:\n\n"
            "We take service issues very seriously. You can raise a priority complaint ticket with photo upload and live technician tracking:\n\n"
            "• Fast 4-hour technician dispatch\n"
            "• Real-time job status tracking\n"
            "• Verified digital job sign-off\n\n"
            "Click **Open Complaint Desk** below to register your ticket immediately."
        )
        return ChatbotResponse(
            reply=reply,
            intent="complaints",
            suggestions=["Raise Priority Complaint", "Book a Technician", "Check AMC Coverage"],
            action_type="navigate_complaint"
        )

    # --------------------------------------------------------------------------
    # 13. DEFAULT / GENERAL GREETING & INTERACTIVE TOPICS
    # --------------------------------------------------------------------------
    reply = (
        "👋 Hi! I'm **Coolie AI**, your 24/7 HVAC AC Specialist at **Cooling Hub**!\n\n"
        "How can I assist you right now?\n\n"
        "🔧 **Interactive AC Problem Troubleshooting**:\n"
        "• Remote not working or not responding\n"
        "• AC not turning on or no power\n"
        "• AC not cooling properly or weak airflow\n"
        "• Error codes on display (E1, E2, E4, F1, CH05, U0, etc.)\n"
        "• Water leakage or unusual noises\n"
        "• AC switching off automatically\n\n"
        "💡 **You can also ask about**:\n"
        "• AC buying recommendations & 5-star inverter comparison\n"
        "• Electricity bill savings calculator\n"
        "• Booking verified technician service or AMC plans"
    )
    return ChatbotResponse(
        reply=reply,
        intent="general_greeting",
        suggestions=[
            "❄️ AC Not Cooling",
            "🔋 Remote Not Working",
            "⚠️ Error Code on Display",
            "💧 Water Leakage",
            "🔊 Strange Noise",
            "🔌 AC Won't Turn On",
            "👨‍🔧 Book a Technician"
        ],
        payload={"context": {"current_issue": None, "awaiting_feedback": False}}
    )

