from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.core.config import settings
from app.db.database import engine, SessionLocal
from app.db.base import Base
from app.api.v1 import api_router

# Ensure all database tables are created automatically
import app.models  # Load all models so Base has metadata
Base.metadata.create_all(bind=engine)

def _ensure_hospital_geo_columns_and_backfill():
    """Lightweight, idempotent startup migration: adds latitude/longitude
    columns to a pre-existing hospitals table (if missing) and backfills
    known coordinates, so the /hospitals/nearby-govt endpoint used by the
    citizen app always has coordinates to work with, even on a DB created
    before this feature existed."""
    from app.models.hospital import Hospital

    known_coordinates = {
        "hosp-1": (28.5670, 77.2100),
        "hosp-2": (28.5697, 77.2064),
        "hosp-3": (28.6259, 77.2018),
    }

    try:
        with engine.connect() as conn:
            existing_cols = {row[1] for row in conn.execute(text("PRAGMA table_info(hospitals)"))}
    except Exception:
        return

    if not existing_cols:
        return

    try:
        with engine.begin() as conn:
            if "latitude" not in existing_cols:
                conn.execute(text("ALTER TABLE hospitals ADD COLUMN latitude FLOAT"))
            if "longitude" not in existing_cols:
                conn.execute(text("ALTER TABLE hospitals ADD COLUMN longitude FLOAT"))
    except Exception:
        pass

    db = SessionLocal()
    try:
        for hosp_id, (lat, lng) in known_coordinates.items():
            h = db.query(Hospital).filter(Hospital.id == hosp_id).first()
            if h and (h.latitude is None or h.longitude is None):
                h.latitude = lat
                h.longitude = lng
        db.commit()
    except Exception:
        db.rollback()
    finally:
        db.close()

_ensure_hospital_geo_columns_and_backfill()

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Backend for SUGASTHA Healthcare System",
    version="1.0.0",
)

# Set all CORS enabled origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {
        "message": "Welcome to SUGASTHA National Unified Healthcare API",
        "status": "online",
        "docs_url": "/docs"
    }

@app.get("/health")
def health_check():
    # Check DB connection
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        db_status = "ok"
    except Exception as e:
        db_status = f"error: {str(e)}"

    return {
        "status": "healthy",
        "database": db_status
    }

app.include_router(api_router, prefix=settings.API_V1_STR)
