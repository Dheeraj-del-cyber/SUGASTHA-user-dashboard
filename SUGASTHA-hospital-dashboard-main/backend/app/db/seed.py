import json
from sqlalchemy import text
from app.db.database import SessionLocal, engine
from app.db.base import Base
from app.models.hospital import Hospital
from app.models.doctor import Doctor
from app.models.appointment import Appointment
from app.models.user import User
from app.core.security import get_password_hash

# Real-world coordinates for the seeded government hospitals, used by the
# nearest-government-hospital lookup that the citizen (user) app calls into.
HOSPITAL_COORDINATES = {
    "hosp-1": (28.5670, 77.2100),   # AIIMS New Delhi
    "hosp-2": (28.5697, 77.2064),   # Safdarjung Hospital
    "hosp-3": (28.6259, 77.2018),   # Dr. RML Hospital
}

def _ensure_lat_lng_columns():
    """SQLite/Postgres safe 'migration': add latitude/longitude columns to an
    already-existing hospitals table if this DB was created before they
    were added to the model."""
    existing_cols = set()
    try:
        with engine.connect() as conn:
            result = conn.execute(text("PRAGMA table_info(hospitals)"))
            existing_cols = {row[1] for row in result}
    except Exception:
        return

    if not existing_cols:
        return

    with engine.begin() as conn:
        if "latitude" not in existing_cols:
            conn.execute(text("ALTER TABLE hospitals ADD COLUMN latitude FLOAT"))
        if "longitude" not in existing_cols:
            conn.execute(text("ALTER TABLE hospitals ADD COLUMN longitude FLOAT"))

def seed_database():
    Base.metadata.create_all(bind=engine)
    _ensure_lat_lng_columns()
    db = SessionLocal()

    try:
        # 1. Seed Admin User
        admin_user = db.query(User).filter(User.phone == "admin").first()
        if not admin_user:
            admin_user = User(
                id="user-admin-01",
                phone="admin",
                role="HOSPITAL_ADMIN",
                hashed_password=get_password_hash("password123"),
                is_active=True
            )
            db.add(admin_user)
            print("Created default admin user (admin / password123)")

        # 2. Seed Clean Hospitals
        hospitals_data = [
            {
                "id": "hosp-1",
                "name": "All India Institute of Medical Sciences (AIIMS)",
                "name_hindi": "अखिल भारतीय आयुर्विज्ञान संस्थान (एम्स नई दिल्ली)",
                "hospital_type": "AIIMS / Apex",
                "district": "New Delhi",
                "state": "Delhi",
                "address": "Sri Aurobindo Marg, Ansari Nagar East, New Delhi - 110029",
                "latitude": 28.5670,
                "longitude": 77.2100,
                "distance_km": 4.2,
                "travel_cost_inr": 25,
                "emergency_available": True,
                "icu_beds_available": 14,
                "total_beds": 120,
                "oxygen_beds_available": 45,
                "opd_capacity": 1200,
                "opd_active_queue": 412,
                "departments": json.dumps(["Cardiology & General Medicine", "Pulmonology & Critical Care", "Neurology", "Orthopedics", "Emergency Medicine"]),
                "doctor_ids": json.dumps(["doc-1", "doc-2"]),
                "rating": 4.9,
                "phone": "+91 11 2658 8500"
            },
            {
                "id": "hosp-2",
                "name": "Safdarjung Hospital & Vardhman Mahavir Medical College",
                "name_hindi": "सफदरजंग अस्पताल एवं वीएमएमसी",
                "hospital_type": "Central Govt Hospital",
                "district": "New Delhi",
                "state": "Delhi",
                "address": "Ring Road, opposite AIIMS, Safdarjung Enclave, New Delhi - 110029",
                "latitude": 28.5697,
                "longitude": 77.2064,
                "distance_km": 4.8,
                "travel_cost_inr": 30,
                "emergency_available": True,
                "icu_beds_available": 8,
                "total_beds": 95,
                "oxygen_beds_available": 32,
                "opd_capacity": 1000,
                "opd_active_queue": 328,
                "departments": json.dumps(["Trauma & Emergency", "Cardiology", "Burns & Plastic Surgery", "General Medicine"]),
                "doctor_ids": json.dumps(["doc-3", "doc-4"]),
                "rating": 4.8,
                "phone": "+91 11 2616 5060"
            },
            {
                "id": "hosp-3",
                "name": "Dr. Ram Manohar Lohia Hospital (RML)",
                "name_hindi": "डॉ. राम मनोहर लोहिया अस्पताल",
                "hospital_type": "Central Govt Hospital",
                "district": "Central Delhi",
                "state": "Delhi",
                "address": "Baba Kharak Singh Marg, Connaught Place, New Delhi - 110001",
                "latitude": 28.6259,
                "longitude": 77.2018,
                "distance_km": 8.5,
                "travel_cost_inr": 45,
                "emergency_available": True,
                "icu_beds_available": 11,
                "total_beds": 80,
                "oxygen_beds_available": 28,
                "opd_capacity": 850,
                "opd_active_queue": 260,
                "departments": json.dumps(["General Medicine", "Orthopedics & Trauma Surgery", "Pediatrics"]),
                "doctor_ids": json.dumps(["doc-5"]),
                "rating": 4.7,
                "phone": "+91 11 2336 5525"
            }
        ]

        for h_data in hospitals_data:
            existing = db.query(Hospital).filter(Hospital.id == h_data["id"]).first()
            if not existing:
                db.add(Hospital(**h_data))
                print(f"Added hospital: {h_data['name']}")
            elif existing.latitude is None or existing.longitude is None:
                # Backfill coordinates on a hospital row created before lat/lng existed
                coords = HOSPITAL_COORDINATES.get(h_data["id"])
                if coords:
                    existing.latitude, existing.longitude = coords
                    print(f"Backfilled coordinates for: {h_data['name']}")

        # 3. Seed Doctors
        doctors_data = [
            {
                "id": "doc-1",
                "hospital_id": "hosp-1",
                "name": "Dr. Rajesh Sharma",
                "specialty": "Cardiology & General Medicine",
                "specialty_hindi": "हृदय रोग एवं सामान्य चिकित्सा",
                "qualification": "MD, DM (Cardiology, AIIMS New Delhi)",
                "experience_years": 18,
                "room_no": "OPD Room 104, New Rajkumari Block",
                "aebas_status": "IN_OPD",
                "aebas_check_in_time": "08:32 AM IST",
                "max_daily_slots": 45,
                "booked_slots": 32,
                "current_queue_length": 6,
                "consultation_fee": 0,
                "rating": 4.9
            },
            {
                "id": "doc-2",
                "hospital_id": "hosp-1",
                "name": "Dr. Ananya Sengupta",
                "specialty": "Pulmonology & Critical Care",
                "specialty_hindi": "श्वसन रोग एवं क्रिटिकल केयर",
                "qualification": "MD (Pulmonary Medicine, VP Chest)",
                "experience_years": 12,
                "room_no": "OPD Room 208, Pulmonary Wing",
                "aebas_status": "IN_OPD",
                "aebas_check_in_time": "08:45 AM IST",
                "max_daily_slots": 40,
                "booked_slots": 19,
                "current_queue_length": 3,
                "consultation_fee": 0,
                "rating": 4.8
            },
            {
                "id": "doc-3",
                "hospital_id": "hosp-2",
                "name": "Dr. Vikramaditya Rathore",
                "specialty": "Trauma & Emergency Surgery",
                "specialty_hindi": "आघात एवं आपातकालीन शल्य चिकित्सा",
                "qualification": "MS (General Surgery), MCh (Trauma)",
                "experience_years": 14,
                "room_no": "Room 12, Emergency OPD Block",
                "aebas_status": "ON_DUTY",
                "aebas_check_in_time": "08:15 AM IST",
                "max_daily_slots": 50,
                "booked_slots": 38,
                "current_queue_length": 8,
                "consultation_fee": 0,
                "rating": 4.9
            },
            {
                "id": "doc-4",
                "hospital_id": "hosp-2",
                "name": "Dr. Priya Narang",
                "specialty": "Cardiology",
                "specialty_hindi": "हृदय रोग विशेषज्ञ",
                "qualification": "MD, DM (Cardiology, PGIMER)",
                "experience_years": 16,
                "room_no": "Room 204, Super Specialty Block",
                "aebas_status": "ON_DUTY",
                "aebas_check_in_time": "08:50 AM IST",
                "max_daily_slots": 35,
                "booked_slots": 20,
                "current_queue_length": 3,
                "consultation_fee": 0,
                "rating": 4.9
            },
            {
                "id": "doc-5",
                "hospital_id": "hosp-3",
                "name": "Dr. Harsh Vardhan Meena",
                "specialty": "Orthopedics & Trauma Surgery",
                "specialty_hindi": "हड्डी एवं आघात शल्य चिकित्सा",
                "qualification": "MS (Orthopedics, RML Hospital)",
                "experience_years": 15,
                "room_no": "Room 305, Trauma Center",
                "aebas_status": "IN_OPD",
                "aebas_check_in_time": "08:40 AM IST",
                "max_daily_slots": 40,
                "booked_slots": 28,
                "current_queue_length": 5,
                "consultation_fee": 0,
                "rating": 4.8
            }
        ]

        for d_data in doctors_data:
            existing = db.query(Doctor).filter(Doctor.id == d_data["id"]).first()
            if not existing:
                db.add(Doctor(**d_data))
                print(f"Added doctor: {d_data['name']}")

        # 4. Seed Distinct Non-Duplicate Appointments
        appointments_data = [
            {
                "id": "apt-103",
                "token_no": "AIIMS-EMRG-019",
                "abha_id": "91-3312-7788-9901",
                "patient_name": "Pooja Sharma",
                "patient_phone": "+91 98112 77665",
                "age": 34,
                "gender": "F",
                "hospital_id": "hosp-1",
                "hospital_name": "All India Institute of Medical Sciences (AIIMS)",
                "department": "Pulmonology & Critical Care",
                "doctor_id": "doc-2",
                "doctor_name": "Dr. Ananya Sengupta",
                "room_no": "OPD Room 208, Pulmonary Wing",
                "triage_color": "RED",
                "triage_reason": "Acute respiratory distress with SpO2 dropping to 89% and audible wheezing.",
                "symptoms": json.dumps(["Severe Shortness of Breath (Dyspnea)", "Persistent Cough", "Chest Tightness"]),
                "vitals": json.dumps({"bloodPressureSystolic": 142, "bloodPressureDiastolic": 88, "heartRate": 112, "spO2": 89, "temperatureF": 101.4}),
                "status": "PENDING_ACCEPTANCE",
                "referral_source": "ASHA_PHC",
                "referral_by_asha_name": "Sunita Devi (ASHA Sangini, Rampur)",
                "qr_code_data": "SUGASTHA-AUTH-TOKEN-AIIMS-EMRG-019-ABHA-91-3312-7788-9901",
                "pin_code": "723819",
                "slot_time": "Priority Emergency Slot",
                "fallback_cascade_trail": json.dumps(["ASHA Assisted Referral Initiated ➔ AIIMS Triage Desk"])
            },
            {
                "id": "apt-104",
                "token_no": "AIIMS-MED-058",
                "abha_id": "91-6677-4433-2211",
                "patient_name": "Vikram Singh Negi",
                "patient_phone": "+91 97188 33445",
                "age": 47,
                "gender": "M",
                "hospital_id": "hosp-1",
                "hospital_name": "All India Institute of Medical Sciences (AIIMS)",
                "department": "Cardiology & General Medicine",
                "doctor_id": "doc-1",
                "doctor_name": "Dr. Rajesh Sharma",
                "room_no": "OPD Room 104, New Rajkumari Block",
                "triage_color": "YELLOW",
                "triage_reason": "Exertional angina episodes over 48h with diaphoresis and borderline hypertension.",
                "symptoms": json.dumps(["Substernal Chest Pain", "Palpitations", "Fatigue"]),
                "vitals": json.dumps({"bloodPressureSystolic": 158, "bloodPressureDiastolic": 96, "heartRate": 94, "spO2": 95, "temperatureF": 98.6}),
                "status": "PENDING_ACCEPTANCE",
                "referral_source": "IVR_104",
                "referral_by_asha_name": None,
                "qr_code_data": "SUGASTHA-AUTH-TOKEN-AIIMS-MED-058-ABHA-91-6677-4433-2211",
                "pin_code": "591402",
                "slot_time": "Today 11:45 AM - 12:15 PM",
                "fallback_cascade_trail": json.dumps(["104 Voice Helpline STT Intake ➔ AIIMS OPD Queue"])
            },
            {
                "id": "apt-101",
                "token_no": "AIIMS-MED-042",
                "abha_id": "91-4589-2041-9921",
                "patient_name": "Ramesh Kumar Verma",
                "patient_phone": "+91 98765 43210",
                "age": 52,
                "gender": "M",
                "hospital_id": "hosp-1",
                "hospital_name": "All India Institute of Medical Sciences (AIIMS)",
                "department": "Cardiology & General Medicine",
                "doctor_id": "doc-1",
                "doctor_name": "Dr. Rajesh Sharma",
                "room_no": "OPD Room 104, New Rajkumari Block",
                "triage_color": "YELLOW",
                "triage_reason": "Recurrent severe retrosternal discomfort on exertion with chronic diabetic comorbidity.",
                "symptoms": json.dumps(["Chest Pain", "Dizziness", "Tachycardia"]),
                "vitals": json.dumps({"bloodPressureSystolic": 154, "bloodPressureDiastolic": 94, "heartRate": 88, "spO2": 96, "temperatureF": 98.4}),
                "status": "ACCEPTED",
                "referral_source": "SELF_APP",
                "referral_by_asha_name": None,
                "qr_code_data": "SUGASTHA-AUTH-TOKEN-AIIMS-MED-042-ABHA-91-4589-2041-9921",
                "pin_code": "849201",
                "slot_time": "Today 11:30 AM - 12:00 PM",
                "fallback_cascade_trail": json.dumps(["AIIMS New Delhi (Accepted in 4s)"])
            },
            {
                "id": "apt-105",
                "token_no": "AIIMS-GEN-012",
                "abha_id": "91-8899-2211-5544",
                "patient_name": "Meera Devi Chauhan",
                "patient_phone": "+91 99554 11223",
                "age": 62,
                "gender": "F",
                "hospital_id": "hosp-1",
                "hospital_name": "All India Institute of Medical Sciences (AIIMS)",
                "department": "Cardiology & General Medicine",
                "doctor_id": "doc-1",
                "doctor_name": "Dr. Rajesh Sharma",
                "room_no": "OPD Room 104, New Rajkumari Block",
                "triage_color": "GREEN",
                "triage_reason": "Routine diabetic follow-up and prescription renewal. Vitals stable.",
                "symptoms": json.dumps(["Mild Joint Stiffness", "Prescription Refill"]),
                "vitals": json.dumps({"bloodPressureSystolic": 128, "bloodPressureDiastolic": 82, "heartRate": 74, "spO2": 98, "temperatureF": 98.2}),
                "status": "COMPLETED",
                "referral_source": "SELF_APP",
                "referral_by_asha_name": None,
                "qr_code_data": "SUGASTHA-AUTH-TOKEN-AIIMS-GEN-012-ABHA-91-8899-2211-5544",
                "pin_code": "318902",
                "slot_time": "Completed at 09:10 AM",
                "fallback_cascade_trail": json.dumps(["Consultation Finished ➔ Synced to ABHA Longitudinal Health Locker"])
            }
        ]

        for a_data in appointments_data:
            existing = db.query(Appointment).filter(Appointment.id == a_data["id"]).first()
            if not existing:
                db.add(Appointment(**a_data))
                print(f"Added appointment for: {a_data['patient_name']}")

        db.commit()
        print("Database successfully seeded with clean, real-world data!")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
