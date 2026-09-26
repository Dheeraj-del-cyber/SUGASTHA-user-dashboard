// The FastAPI backend returns snake_case fields (hospital_id, patient_name,
// icu_beds_available, ...) while this frontend's own types (see
// src/types/index.ts) are all camelCase (hospitalId, patientName,
// icuBedsAvailable, ...). Without translating between the two, data pulled
// from the live backend silently fails to match against `hospitalId`,
// `status`, etc. checks used throughout HospitalDashboard.tsx, so backend
// appointments/hospitals/doctors would never render correctly even though
// the API calls themselves succeed. These adapters are the translation
// layer, applied once, right where the backend responses enter the app.

import { Hospital, Doctor, Appointment } from '../types';

export function adaptHospital(raw: any, existing?: Hospital): Hospital {
  return {
    // Preserve locally-known login credentials (the backend has no concept
    // of a hospital dashboard login) instead of wiping them out.
    loginId: existing?.loginId ?? raw.login_id ?? raw.id,
    password: existing?.password ?? raw.password ?? 'sugastha123',
    id: raw.id,
    name: raw.name,
    nameHindi: raw.name_hindi ?? raw.name,
    type: raw.hospital_type,
    district: raw.district,
    state: raw.state,
    address: raw.address,
    distanceKm: raw.distance_km ?? 0,
    travelCostInr: raw.travel_cost_inr ?? 0,
    emergencyAvailable: !!raw.emergency_available,
    icuBedsAvailable: raw.icu_beds_available ?? 0,
    totalBeds: raw.total_beds ?? 0,
    opdCapacity: raw.opd_capacity ?? 0,
    opdActiveQueue: raw.opd_active_queue ?? 0,
    departments: raw.departments ?? [],
    doctorIds: raw.doctor_ids ?? [],
    rating: raw.rating ?? 0,
    phone: raw.phone ?? '',
    coordinates:
      raw.latitude != null && raw.longitude != null
        ? { lat: raw.latitude, lng: raw.longitude }
        : existing?.coordinates ?? { lat: 0, lng: 0 },
  } as Hospital;
}

export function adaptDoctor(raw: any): Doctor {
  return {
    id: raw.id,
    hospitalId: raw.hospital_id,
    name: raw.name,
    specialty: raw.specialty,
    specialtyHindi: raw.specialty_hindi ?? raw.specialty,
    qualification: raw.qualification,
    experienceYears: raw.experience_years ?? 0,
    roomNo: raw.room_no ?? '',
    aebasStatus: raw.aebas_status ?? 'IN_OPD',
    aebasCheckInTime: raw.aebas_check_in_time ?? '',
    maxDailySlots: raw.max_daily_slots ?? 0,
    bookedSlots: raw.booked_slots ?? 0,
    currentQueueLength: raw.current_queue_length ?? 0,
    consultationFee: raw.consultation_fee ?? 0,
    rating: raw.rating ?? 0,
    opdTiming: raw.opd_timing ?? '',
    availableDays:
      typeof raw.available_days === 'string'
        ? raw.available_days.split(',').map((d: string) => d.trim()).filter(Boolean)
        : raw.available_days ?? [],
    phone: raw.phone,
    email: raw.email,
  } as Doctor;
}

export function adaptAppointment(raw: any): Appointment {
  return {
    id: raw.id,
    tokenNo: raw.token_no,
    abhaId: raw.abha_id,
    patientName: raw.patient_name,
    patientPhone: raw.patient_phone,
    age: raw.age,
    gender: raw.gender,
    hospitalId: raw.hospital_id,
    hospitalName: raw.hospital_name,
    department: raw.department,
    doctorId: raw.doctor_id,
    doctorName: raw.doctor_name,
    roomNo: raw.room_no,
    triageColor: raw.triage_color,
    triageReason: raw.triage_reason,
    symptoms: raw.symptoms ?? [],
    vitals: raw.vitals ?? undefined,
    status: raw.status,
    referralSource: raw.referral_source,
    referralByAshaName: raw.referral_by_asha_name ?? undefined,
    qrCodeData: raw.qr_code_data,
    pinCode: raw.pin_code,
    timestamp: raw.created_at ?? new Date().toISOString(),
    slotTime: raw.slot_time,
    fallbackCascadeTrail: raw.fallback_cascade_trail ?? [],
  } as Appointment;
}
