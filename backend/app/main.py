from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.seed_data import seed_database
from app.routers import auth, products, calculator, services, complaints, amc, technician, orders, chatbot, admin

app = FastAPI(
    title="Cooling Hub API",
    description="Backend services for Cooling Hub - AC Shopping, Servicing, AMC, Complaints, AI Assistant & Analytics",
    version="2.0.0"
)

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
    seed_database()

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
