from sqlalchemy import Column, String, Integer, Float, ForeignKey
from app.db.base import Base

class Doctor(Base):
    __tablename__ = "doctors"

    id = Column(String(36), primary_key=True)
    hospital_id = Column(String(36), ForeignKey("hospitals.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False)
    specialty = Column(String(255), nullable=False)
    specialty_hindi = Column(String(255), nullable=True)
    qualification = Column(String(255), nullable=False)
    experience_years = Column(Integer, default=10)
    room_no = Column(String(100), nullable=False)
    aebas_status = Column(String(50), default="IN_OPD")  # IN_OPD, ON_DUTY, IN_SURGERY, ON_LEAVE
    aebas_check_in_time = Column(String(50), default="08:30 AM IST")
    max_daily_slots = Column(Integer, default=45)
    booked_slots = Column(Integer, default=20)
    current_queue_length = Column(Integer, default=4)
    consultation_fee = Column(Integer, default=0)
    rating = Column(Float, default=4.9)
    opd_timing = Column(String(255), nullable=True, default="Mon-Sat, 9:00 AM - 1:00 PM")
    available_days = Column(String(255), nullable=True, default="Mon,Tue,Wed,Thu,Fri,Sat")
    phone = Column(String(50), nullable=True)
    email = Column(String(255), nullable=True)
