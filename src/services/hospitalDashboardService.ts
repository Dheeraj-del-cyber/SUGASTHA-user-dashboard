// Connects the citizen-facing SUGASTHA app to the separately-deployed
// SUGASTHA hospital dashboard backend (FastAPI service in the
// `SUGASTHA-hospital-dashboard` repo). Two things are bridged here:
//
//   1. Nearest-government-hospital lookup: once the user shares their
//      location, we ask the hospital dashboard's own hospital registry
//      (the real, onboarded government hospitals) which ones are closest,
//      instead of guessing from a static local list.
//
//   2. Appointment push: once a consultation is booked and a QR/5-digit
//      token is generated on the citizen side, the same booking is sent to
//      the hospital dashboard as an Appointment, so hospital reception/staff
//      see the patient, their triage color, and can scan/verify the token
//      the moment the patient walks in.
//
// Both calls are best-effort: if the hospital dashboard backend isn't
// reachable (e.g. running only the user app in isolation), the citizen app
// keeps working exactly as before on its own local/mock data.

import { AbhaProfile, ConsultationRequest, Hospital, TriageResult } from '../types';

const HOSPITAL_API_BASE_URL: string =
  (import.meta as any).env?.VITE_HOSPITAL_API_BASE_URL || 'http://localhost:8000/api/v1';

export interface UserGeoLocation {
  latitude: number;
  longitude: number;
}

export interface GovtHospitalRecommendation {
  id: string;
  name: string;
  name_hindi?: string | null;
  hospital_type: string;
  district: string;
  state: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  distance_km: number;
  travel_cost_inr: number;
  emergency_available: boolean;
  icu_beds_available: number;
  total_beds: number;
  oxygen_beds_available: number;
  opd_capacity: number;
  opd_active_queue: number;
  departments: string[];
  rating: number;
  phone: string;
}

async function withTimeout<T>(promise: Promise<T>, ms = 6000): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ms);
  try {
    return await promise;
  } finally {
    clearTimeout(timeout);
  }
}

export const hospitalDashboardService = {
  /**
   * True when the hospital dashboard backend responds. Used to silently
   * decide whether to show "connected to hospital network" state.
   */
  async isReachable(): Promise<boolean> {
    try {
      const res = await fetch(`${HOSPITAL_API_BASE_URL.replace(/\/api\/v1$/, '')}/health`, {
        signal: AbortSignal.timeout(3000),
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  /**
   * Fetches the nearest registered *government* hospitals from the hospital
   * dashboard's own database, ranked by live distance from the user's
   * shared location. Returns [] (never throws) if the hospital dashboard
   * backend is unreachable, so callers can gracefully fall back to local
   * recommendations.
   */
  async getNearbyGovtHospitals(
    location: UserGeoLocation,
    limit = 4
  ): Promise<GovtHospitalRecommendation[]> {
    try {
      const url = `${HOSPITAL_API_BASE_URL}/hospitals/nearby-govt?lat=${location.latitude}&lng=${location.longitude}&limit=${limit}`;
      const res = await withTimeout(fetch(url, { signal: AbortSignal.timeout(6000) }));
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  },

  /**
   * Converts a govt-hospital recommendation from the hospital dashboard into
   * the local `Hospital` shape used throughout the citizen app's booking UI.
   */
  toLocalHospital(rec: GovtHospitalRecommendation): Hospital {
    return {
      id: rec.id,
      name: rec.name,
      type: 'GOVERNMENT_TERTIARY',
      address: rec.address,
      district: rec.district,
      pincode: '',
      latitude: rec.latitude ?? undefined,
      longitude: rec.longitude ?? undefined,
      distanceKm: rec.distance_km,
      estimatedTravelTimeMinutes: Math.max(5, Math.round(rec.distance_km * 4.5)),
      fareEstimates: {
        autoFare: Math.round(rec.travel_cost_inr * 1.3),
        cabFare: rec.travel_cost_inr * 3,
        transitFare: rec.travel_cost_inr,
      },
      bedAvailabilityStatus:
        rec.icu_beds_available > 5 ? 'AVAILABLE' : rec.icu_beds_available > 0 ? 'LIMITED' : 'HIGH_DEMAND',
      emergencyQueueStatus:
        rec.opd_active_queue > 350 ? 'BUSY' : rec.opd_active_queue > 150 ? 'MODERATE' : 'NORMAL',
      nabhAccredited: true,
      doctors: [],
      contactPhone: rec.phone,
      ambulanceHotline: '108',
      source: 'MOCK',
      availabilityNote: `${rec.icu_beds_available} ICU beds • ${rec.oxygen_beds_available} oxygen beds available now (from hospital dashboard registry).`,
    };
  },

  /**
   * Pushes a booked consultation (QR + 5-digit token already generated on
   * the citizen side) into the hospital dashboard as an Appointment, so it
   * shows up immediately in that hospital's live queue. Best-effort: swallows
   * network errors so the citizen-side booking flow never breaks because the
   * hospital dashboard happens to be offline.
   */
  async pushAppointmentToHospitalDashboard(
    profile: AbhaProfile,
    consultation: ConsultationRequest,
    triage: TriageResult | null
  ): Promise<{ ok: boolean; appointmentId?: string }> {
    try {
      const hospital = consultation.selectedHospital;
      const doctor = consultation.selectedDoctor;

      const payload = {
        abha_id: profile.abhaNumber,
        patient_name: profile.fullName,
        patient_phone: profile.mobileNumber,
        age: yearsSince(profile.dateOfBirth),
        gender: profile.gender === 'MALE' ? 'M' : profile.gender === 'FEMALE' ? 'F' : 'O',
        hospital_id: hospital.id,
        hospital_name: hospital.name,
        department: doctor?.specialization || (triage?.suggestedSpecialties?.[0] ?? 'General Medicine'),
        doctor_id: doctor?.id || 'unassigned',
        doctor_name: doctor?.name || 'To be assigned at hospital desk',
        room_no: 'OPD Front Desk',
        triage_color: consultation.triageLevel,
        triage_reason: triage?.summary || consultation.referralNote || 'Assessed via SUGASTHA AI triage.',
        symptoms: consultation.primarySymptoms,
        vitals: {},
        status: 'PENDING_ACCEPTANCE',
        referral_source: 'SELF_APP',
        qr_code_data: consultation.qrDataPayload,
        pin_code: consultation.consultationNumber,
        token_no: consultation.id,
        slot_time: consultation.appointmentSlot || "Today's Session",
        fallback_cascade_trail: [
          `Dispatched from SUGASTHA citizen app to ${hospital.name} (Consultation ${consultation.id}).`,
        ],
      };

      const res = await withTimeout(
        fetch(`${HOSPITAL_API_BASE_URL}/appointments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(6000),
        })
      );

      if (!res.ok) return { ok: false };
      const created = await res.json();
      return { ok: true, appointmentId: created?.id };
    } catch {
      return { ok: false };
    }
  },
};

function yearsSince(dateOfBirthIso: string): number {
  const dob = new Date(dateOfBirthIso);
  if (Number.isNaN(dob.getTime())) return 30;
  const diffMs = Date.now() - dob.getTime();
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24 * 365.25)));
}
