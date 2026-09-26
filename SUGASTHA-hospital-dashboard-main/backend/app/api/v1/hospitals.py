import json
import math
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.hospital import Hospital
from app.schemas.hospital import HospitalOut, BedUpdate

router = APIRouter()

# Keywords used to recognise a hospital as a government facility from its
# free-text hospital_type field (e.g. "AIIMS / Apex", "Central Govt Hospital",
# "District Hospital", "Civil Hospital", "PHC", "CHC").
GOVERNMENT_TYPE_KEYWORDS = [
    "govt", "government", "aiims", "district hospital", "civil hospital",
    "phc", "chc", "sub-district", "sub district", "state hospital",
    "municipal", "esic",
]

def _is_government_hospital(hospital_type: str) -> bool:
    t = (hospital_type or "").lower()
    return any(keyword in t for keyword in GOVERNMENT_TYPE_KEYWORDS)

def _haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    r = 6371.0
    p1, p2 = math.radians(lat1), math.radians(lat2)
    d_lat = math.radians(lat2 - lat1)
    d_lon = math.radians(lon2 - lon1)
    a = math.sin(d_lat / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(d_lon / 2) ** 2
    return 2 * r * math.asin(math.sqrt(a))

def serialize_hospital(h: Hospital) -> dict:
    return {
        "id": h.id,
        "name": h.name,
        "name_hindi": h.name_hindi,
        "hospital_type": h.hospital_type,
        "district": h.district,
        "state": h.state,
        "address": h.address,
        "latitude": h.latitude,
        "longitude": h.longitude,
        "distance_km": h.distance_km,
        "travel_cost_inr": h.travel_cost_inr,
        "emergency_available": h.emergency_available,
        "icu_beds_available": h.icu_beds_available,
        "total_beds": h.total_beds,
        "oxygen_beds_available": h.oxygen_beds_available,
        "opd_capacity": h.opd_capacity,
        "opd_active_queue": h.opd_active_queue,
        "departments": json.loads(h.departments) if h.departments else [],
        "doctor_ids": json.loads(h.doctor_ids) if h.doctor_ids else [],
        "rating": h.rating,
        "phone": h.phone
    }

@router.get("", response_model=List[HospitalOut])
def get_hospitals(db: Session = Depends(get_db)):
    hospitals = db.query(Hospital).all()
    return [serialize_hospital(h) for h in hospitals]

@router.get("/nearby-govt")
def get_nearby_government_hospitals(
    lat: float = Query(..., description="User latitude"),
    lng: float = Query(..., description="User longitude"),
    limit: int = Query(4, ge=1, le=20),
    db: Session = Depends(get_db)
):
    """
    Used by the citizen (user) app right after login: given the location the
    user shared, returns the nearest registered government hospitals ranked
    by live distance from the user, so the recommendation always reflects
    where the patient actually is rather than a hardcoded distance.
    """
    hospitals = db.query(Hospital).all()

    ranked = []
    for h in hospitals:
        if not _is_government_hospital(h.hospital_type):
            continue
        if h.latitude is None or h.longitude is None:
            # No coordinates on record for this hospital; skip it rather
            # than guess, so distances shown are always trustworthy.
            continue
        live_distance_km = round(_haversine_km(lat, lng, h.latitude, h.longitude), 1)
        payload = serialize_hospital(h)
        payload["distance_km"] = live_distance_km
        ranked.append(payload)

    ranked.sort(key=lambda hosp: hosp["distance_km"])
    return ranked[:limit]

@router.get("/{hospital_id}", response_model=HospitalOut)
def get_hospital(hospital_id: str, db: Session = Depends(get_db)):
    h = db.query(Hospital).filter(Hospital.id == hospital_id).first()
    if not h:
        raise HTTPException(status_code=404, detail="Hospital not found")
    return serialize_hospital(h)

@router.patch("/{hospital_id}/beds", response_model=HospitalOut)
def update_hospital_beds(hospital_id: str, bed_data: BedUpdate, db: Session = Depends(get_db)):
    h = db.query(Hospital).filter(Hospital.id == hospital_id).first()
    if not h:
        raise HTTPException(status_code=404, detail="Hospital not found")
    
    if bed_data.total_beds is not None:
        h.total_beds = bed_data.total_beds
    if bed_data.icu_beds_available is not None:
        h.icu_beds_available = bed_data.icu_beds_available
    if bed_data.oxygen_beds_available is not None:
        h.oxygen_beds_available = bed_data.oxygen_beds_available

    db.commit()
    db.refresh(h)
    return serialize_hospital(h)
