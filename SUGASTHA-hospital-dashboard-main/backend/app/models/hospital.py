from sqlalchemy import Column, String, Integer, Float, Boolean, Text
from app.db.base import Base

class Hospital(Base):
    __tablename__ = "hospitals"

    id = Column(String(36), primary_key=True)
    name = Column(String(255), nullable=False)
    name_hindi = Column(String(255), nullable=True)
    hospital_type = Column(String(100), nullable=False)  # AIIMS / Apex, District Hospital, Civil Hospital, etc.
    district = Column(String(100), nullable=False)
    state = Column(String(100), nullable=False)
    address = Column(String(255), nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    distance_km = Column(Float, default=4.2)
    travel_cost_inr = Column(Integer, default=25)
    emergency_available = Column(Boolean, default=True)
    icu_beds_available = Column(Integer, default=14)
    total_beds = Column(Integer, default=120)
    oxygen_beds_available = Column(Integer, default=45)
    opd_capacity = Column(Integer, default=1200)
    opd_active_queue = Column(Integer, default=412)
    departments = Column(Text, default="[]")  # JSON encoded list of strings
    doctor_ids = Column(Text, default="[]")   # JSON encoded list of doctor IDs
    rating = Column(Float, default=4.8)
    phone = Column(String(50), default="+91 11 2658 8500")
