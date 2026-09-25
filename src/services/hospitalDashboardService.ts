import { AbhaProfile, Doctor, Hospital, SymptomInput, TriageResult } from '../types';

const API_BASE_URL = (
  import.meta.env.VITE_HOSPITAL_API_BASE_URL || 'http://localhost:8000/api/v1'
).replace(/\/$/, '');

interface BackendHospital {
  id: string;
  name: string;
  hospital_type: string;
  district: string;
  state: string;
  address: string;
  latitude?: number | null;
  longitude?: number | null;
  distance_km: number;
  travel_cost_inr: number;
  emergency_available: boolean;
  icu_beds_available: number;
  total_beds: number;
  rating: number;
  phone: string;
}

interface BackendDoctor {
  id: string;
  name: string;
  specialty: string;
  qualification: string;
  experience_years: number;
  room_no: string;
  aebas_status: string;
  rating: number;
  opd_timing?: string | null;
}

interface BackendAppointment {
  id: string;
  status: string;
  hospital_id: string;
  hospital_name: string;
  doctor_name: string;
  triage_color: string;
  token_no: string;
}

const requestJson = async <T>(url: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(url, init);
  if (!response.ok) {
    const detail = await response.json().catch(() => null);
    throw new Error(detail?.detail || `Hospital service request failed (${response.status})`);
  }
  return response.json() as Promise<T>;
};

const mapDoctor = (doctor: BackendDoctor): Doctor => ({
  id: doctor.id,
  name: doctor.name,
  specialization: doctor.specialty,
  qualifications: doctor.qualification,
  experienceYears: doctor.experience_years,
  availableSlotToday: doctor.opd_timing || 'Availability to be confirmed',
  rating: doctor.rating,
  languages: ['English', 'Hindi'],
  roomNo: doctor.room_no,
});

const mapHospital = (hospital: BackendHospital, doctors: Doctor[]): Hospital => {
  const hospitalType = hospital.hospital_type.toLowerCase();
  const type = hospitalType.includes('district')
    ? 'DISTRICT_HOSPITAL'
    : hospitalType.includes('private')
      ? 'PRIVATE_SUPERSPECIALTY'
      : 'GOVERNMENT_TERTIARY';

  return {
    id: hospital.id,
    name: hospital.name,
    type,
    address: hospital.address,
    district: hospital.district,
    pincode: 'N/A',
    latitude: hospital.latitude ?? undefined,
    longitude: hospital.longitude ?? undefined,
    distanceKm: hospital.distance_km,
    estimatedTravelTimeMinutes: Math.max(5, Math.round(hospital.distance_km * 4.5)),
    fareEstimates: {
      autoFare: hospital.travel_cost_inr,
      cabFare: hospital.travel_cost_inr * 2,
    },
    bedAvailabilityStatus:
      hospital.icu_beds_available === 0
        ? 'HIGH_DEMAND'
        : hospital.icu_beds_available < 4
          ? 'LIMITED'
          : 'AVAILABLE',
    emergencyQueueStatus: hospital.emergency_available ? 'NORMAL' : 'BUSY',
    nabhAccredited: false,
    doctors,
    contactPhone: hospital.phone,
    ambulanceHotline: '108',
    source: 'HOSPITAL_BACKEND',
  };
};

const calculateAge = (dateOfBirth: string): number => {
  const birthDate = new Date(`${dateOfBirth}T00:00:00`);
  if (Number.isNaN(birthDate.getTime())) return 0;

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const beforeBirthday =
    today.getMonth() < birthDate.getMonth() ||
    (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate());
  if (beforeBirthday) age -= 1;
  return Math.max(age, 0);
};

export const hospitalDashboardService = {
  async getNearbyHospitals(location: { latitude: number; longitude: number }): Promise<Hospital[]> {
    const params = new URLSearchParams({
      lat: String(location.latitude),
      lng: String(location.longitude),
      limit: '8',
    });
    const hospitals = await requestJson<BackendHospital[]>(
      `${API_BASE_URL}/hospitals/nearby-govt?${params}`
    );

    return Promise.all(
      hospitals.map(async (hospital) => {
        const params = new URLSearchParams({ hospital_id: hospital.id });
        const doctors = await requestJson<BackendDoctor[]>(`${API_BASE_URL}/doctors?${params}`)
          .catch(() => []);
        return mapHospital(
          hospital,
          doctors.filter((doctor) => doctor.aebas_status !== 'ON_LEAVE').map(mapDoctor)
        );
      })
    );
  },

  async createAppointment(
    profile: AbhaProfile,
    symptoms: SymptomInput,
    triage: TriageResult,
    hospital: Hospital,
    doctor: Doctor,
    consultation: { id: string; consultationNumber: string; qrDataPayload: string },
    fallbackHospitals: Hospital[]
  ): Promise<BackendAppointment> {
    return requestJson<BackendAppointment>(`${API_BASE_URL}/appointments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token_no: consultation.consultationNumber,
        abha_id: profile.abhaNumber,
        patient_name: profile.fullName,
        patient_phone: profile.mobileNumber,
        age: calculateAge(profile.dateOfBirth),
        gender: profile.gender,
        hospital_id: hospital.id,
        hospital_name: hospital.name,
        department: doctor.specialization,
        doctor_id: doctor.id,
        doctor_name: doctor.name,
        room_no: doctor.roomNo || 'OPD Desk',
        triage_color: triage.level,
        triage_reason: triage.summary,
        symptoms: symptoms.primarySymptoms,
        status: 'PENDING_ACCEPTANCE',
        referral_source: 'SELF_APP',
        qr_code_data: consultation.qrDataPayload,
        pin_code: consultation.consultationNumber,
        slot_time: doctor.availableSlotToday,
        fallback_cascade_trail: fallbackHospitals
          .filter((candidate) => candidate.id !== hospital.id)
          .slice(0, 2)
          .map((candidate) => candidate.name),
      }),
    });
  },

  async getAppointmentStatus(
    appointmentId: string,
    hospitalId: string
  ): Promise<BackendAppointment | null> {
    const params = new URLSearchParams({ hospital_id: hospitalId });
    const appointments = await requestJson<BackendAppointment[]>(
      `${API_BASE_URL}/appointments?${params}`
    );
    return appointments.find((appointment) => appointment.id === appointmentId) ?? null;
  },
};