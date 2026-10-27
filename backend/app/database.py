import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Support DATABASE_URL from Render (PostgreSQL) or fallback to local SQLite
DATABASE_URL = os.getenv("DATABASE_URL")
engine = None

if DATABASE_URL:
    # Render PostgreSQL URLs typically start with "postgres://", which SQLAlchemy 1.4+ expects as "postgresql://"
    if DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)
    try:
        # Test connection with a fast 5-second timeout so it never hangs if PostgreSQL is down/expired
        temp_engine = create_engine(DATABASE_URL, connect_args={"connect_timeout": 5}, pool_pre_ping=True)
        with temp_engine.connect() as conn:
            pass
        engine = temp_engine
        print("Connected successfully to PostgreSQL database!")
    except Exception as e:
        print(f"Warning: PostgreSQL connection failed ({e}). Falling back to local SQLite.")
        engine = None

if not engine:
    DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "cooling_hub.db")
    SQLALCHEMY_DATABASE_URL = f"sqlite:///{DB_PATH}"
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
    )
    print("Using local SQLite database.")

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
