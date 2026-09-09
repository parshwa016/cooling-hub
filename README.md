# ❄️ Cooling Hub — Final Year Academic Project

**Cooling Hub** is a full-stack, modern HVAC web platform designed as an all-in-one ecosystem for **AC Shopping, Servicing, Complaint Management, Annual Maintenance Contracts (AMC), Technician Dispatching, and AI-Powered Assistance**.

---

## 🎨 Brand Color Palette

- **Primary (Sales & Cold)**: `#0F2942` *(Rich Deep Navy Blue for immaculate contrast)*
- **Secondary (Action & Urgency)**: `#D95400` *(Burnt Safety Orange with 4.51:1 contrast ratio)*
- **Background / Neutrals**: `#F8FAFC` *(Clean, crisp modern slate-gray tint)*

---

## 🔄 Core Business Flow

`Buy AC → Installation → Warranty → Service → Complaint → Repair → AMC → Maintenance → Renewal`

---

## 🚀 Key Feature Modules

1. **🛒 AC Shopping**: Multi-brand AC products (Daikin, Voltas, LG, Blue Star, Lloyd, Mitsubishi, Panasonic), filter by Brand, Type, Tonnage, Star Rating & Price. Includes side-by-side AC specification comparison, cart, wishlist, promo code coupons (`COOL2026`, `SAVE10`, `FIRSTAC`), and checkout.
2. **⚡ Energy Efficiency Calculator**: Real-time interactive calculation of power consumption (kWh), monthly/yearly electricity bill, units saved, money saved, and break-even payback period (months) comparing 5-Star Inverters against old non-inverter units with Recharts visualizations.
3. **🔧 Doorstep AC Services**: Service booking wizard for Installation, Uninstallation, Foam Jet Cleaning, Refrigerant Gas Refill, Water Leakage Repair, and Compressor Inspection with Pincode serviceability check.
4. **📢 Complaint Management**: Ticket registration system with priority level selection (Normal, High, Emergency), photo attachment simulation, unique ticket ID generation (`CMP-2026-XXXX`), and live visual status timeline tracking.
5. **📅 AMC (Annual Maintenance Contract)**: Basic, Standard & Premium plans, eligibility test based on AC age, visits tracker, and renewal reminders.
6. **👨‍🔧 Technician Field Portal**: Dedicated workspace for field engineers to view assigned jobs, update work order status, log diagnosis & spare parts used, upload before/after photos, and capture digital customer sign-off.
7. **🤖 AI Chatbot ("Coolie AI")**: Floating intelligent assistant for AC product selection, step-by-step troubleshooting decision trees, energy calculator guidance, and direct service/complaint creation.
8. **👤 Customer Dashboard**: Unified hub for orders, registered home ACs, AMC contracts, service history, complaints, and printable PDF tax invoices.
9. **🧑‍💼 Admin Panel & Analytics**: Executive control center with KPI cards, monthly revenue charts (Sales vs Service vs AMC), brand distribution charts, complaint dispatch manager, and technician performance leaderboard.

---

## 🛠️ Technology Stack

- **Backend**: FastAPI (Python 3.13), SQLAlchemy, SQLite, Pydantic v2 schemas.
- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, Recharts.
- **API Documentation**: Automatic OpenAPI Swagger UI accessible at `http://127.0.0.1:8000/docs`.

---

## ⚡ How to Run the Application

### 1️⃣ Start Backend Server (FastAPI)

```bash
cd backend
python run.py
```
*Backend will run at: `http://127.0.0.1:8000`*
*OpenAPI Documentation: `http://127.0.0.1:8000/docs`*

### 2️⃣ Start Frontend Dev Server (React + Vite)

```bash
cd frontend
npm run dev
```
*Frontend will run at: `http://127.0.0.1:5173`*

---

## 🔑 Demo Role Switcher

You can switch between user personas instantly from the top-right navbar menu:
- **👤 Customer**: `john@example.com` (John Doe)
- **👨‍🔧 Technician**: `tech@coolinghub.com` (Rajesh Kumar)
- **🧑‍💼 Admin**: `admin@coolinghub.com` (Admin Director)
