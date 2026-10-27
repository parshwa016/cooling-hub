from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from fastapi.staticfiles import StaticFiles
from app.seed_data import seed_database
from app.routers import auth, products, calculator, services, complaints, amc, technician, orders, chatbot, admin, notifications

app = FastAPI(
    title="Cooling Hub API",
    description="Backend services for Cooling Hub - AC Shopping, Servicing, AMC, Complaints, AI Assistant & Analytics",
    version="2.0.0"
)

# Enable static files for uploaded product images
static_dir = os.path.join(os.path.dirname(__file__), "..", "static")
uploads_dir = os.path.join(static_dir, "uploads")
os.makedirs(uploads_dir, exist_ok=True)
app.mount("/static", StaticFiles(directory=static_dir), name="static")

# Enable CORS for local Vite dev server and production clients
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_db_seed():
    try:
        seed_database()
    except Exception as e:
        print("Startup database seed notice:", e)

app.include_router(auth.router)
app.include_router(products.router)
app.include_router(calculator.router)
app.include_router(services.router)
app.include_router(complaints.router)
app.include_router(amc.router)
app.include_router(technician.router)
app.include_router(orders.router)
app.include_router(chatbot.router)
app.include_router(admin.router)
app.include_router(notifications.router)

@app.get("/")
def root():
    return {
        "status": "online",
        "app": "Cooling Hub API Engine",
        "docs": "/docs",
        "version": "2.0.0"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
