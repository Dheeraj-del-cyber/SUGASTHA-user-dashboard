export type TriageLevel = 'GREEN' | 'YELLOW' | 'RED';

export type PortalType = 'patient' | 'hospital' | 'asha' | 'ivr' | 'fallback' | 'splitscreen';

export type Language = 'en' | 'hi';

export interface Vitals {
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  heartRate?: number;
  spO2?: number;
  temperatureF?: number;
  bloodSugar?: number;
}

export interface PastHealthRecord {
  id: string;
  date: string;
  facility: string;
  doctorName: string;
  department: string;
  diagnosis: string;
  prescription: string[];
  labReports?: string[];
  abhaHash: string;
}

export interface UserPatient {
  id: string;
  abhaId: string;
  abhaAddress: string;
  name: string;
  nameHindi: string;
  age: number;
  gender: 'M' | 'F' | 'Other';
  phone: string;
  bloodGroup: string;
  address: string;
  district: string;
  state: string;
  pincode: string;
  allergies: string[];
  chronicConditions: string[];
  pastRecords: PastHealthRecord[];
}

export interface Doctor {
  id: string;
  hospitalId: string;
  name: string;
  specialty: string;
  specialtyHindi: string;
  qualification: string;
  experienceYears: number;
  roomNo: string;
  aebasStatus: 'ON_DUTY' | 'IN_OPD' | 'IN_SURGERY' | 'ON_LEAVE';
  aebasCheckInTime: string;
  maxDailySlots: number;
  bookedSlots: number;
  currentQueueLength: number;
  consultationFee: number; // 0 for Govt
  rating: number;
  opdTiming: string; // e.g. "Mon-Sat, 9:00 AM - 1:00 PM"
  availableDays: string[]; // e.g. ["Mon","Tue","Wed","Thu","Fri","Sat"]
  phone?: string;
  email?: string;
}

export interface Hospital {
  id: string;
  loginId: string;
  password: string;
  name: string;
  nameHindi: string;
  type: 'AIIMS / Apex' | 'District Hospital' | 'Civil Hospital' | 'Community Health Centre (CHC)' | 'Primary Health Centre (PHC)';
  district: string;
  state: string;
  address: string;
  distanceKm: number;
  travelCostInr: number;
  emergencyAvailable: boolean;
  icuBedsAvailable: number;
  totalBeds: number;
  opdCapacity: number;
  opdActiveQueue: number;
  departments: string[];
  doctorIds: string[];
  rating: number;
  phone: string;
  coordinates: { lat: number; lng: number };
}

export type AppointmentStatus = 
  | 'PENDING_ACCEPTANCE'
  | 'ACCEPTED'
  | 'ARRIVED'
  | 'IN_CONSULTATION'
  | 'COMPLETED'
  | 'RE_ROUTED'
  | 'CANCELLED';

export type ReferralSource = 'SELF_APP' | 'ASHA_PHC' | 'IVR_104' | 'VOICE_FALLBACK';

export interface Medication {
  name: string;
  dosage: string;
  timing: string; // e.g., '1-0-1 (After Food)'
  durationDays: number;
  instructions: string;
}

export interface ConsultationSummary {
  consultationDate: string;
  doctorId: string;
  doctorName: string;
  hospitalName: string;
  department: string;
  chiefComplaints: string;
  clinicalObservations: string;
  diagnosis: string;
  icd10Code: string;
  medications: Medication[];
  labTestsOrdered: string[];
  advice: string;
  followUpDays: number;
  abhaSynced: boolean;
  abhaTransactionId: string;
}

export interface Appointment {
  id: string;
  tokenNo: string; // e.g. "AIIMS-OPD-104"
  abhaId: string;
  patientName: string;
  patientPhone: string;
  age: number;
  gender: 'M' | 'F' | 'Other';
  hospitalId: string;
  hospitalName: string;
  department: string;
  doctorId: string;
  doctorName: string;
  roomNo: string;
  triageColor: TriageLevel;
  triageReason: string;
  symptoms: string[];
  vitals?: Vitals;
  status: AppointmentStatus;
  referralSource: ReferralSource;
  referralByAshaName?: string;
  qrCodeData: string;
  pinCode: string; // 6-digit PIN e.g. "849201"
  timestamp: string;
  slotTime: string;
  fallbackCascadeTrail: string[];
  consultationSummary?: ConsultationSummary;
}

export interface AshaWorker {
  id: string;
  name: string;
  phone: string;
  assignedVillage: string;
  gramPanchayat: string;
  phcCenter: string;
  status: 'AVAILABLE' | 'ON_CALL' | 'FIELD_VISIT' | 'OFFLINE';
  activeTasksCount: number;
  completedTasksCount: number;
  rating: number;
  photoUrl?: string;
}

export interface VoiceTask {
  id: string;
  callerPhone: string;
  callerName?: string;
  village: string;
  recordedAudioDurationSec: number;
  audioSampleKey: string;
  transcription: string;
  transcriptionHindi: string;
  extractedSymptoms: string[];
  urgency: TriageLevel;
  status: 'PENDING_CLAIM' | 'CLAIMED' | 'CONVERTED_TO_APPOINTMENT' | 'RESOLVED';
  claimedByAshaId?: string;
  claimedByAshaName?: string;
  createdTimestamp: string;
}

export interface SystemEventLog {
  id: string;
  timestamp: string;
  source: 'PATIENT_APP' | 'ASHA_PORTAL' | 'HOSPITAL_CMD' | 'IVR_104' | 'FALLBACK_ENGINE' | 'ABDM_GATEWAY';
  type: string;
  title: string;
  detail: string;
  abdmTransactionHash?: string;
  severity: 'INFO' | 'SUCCESS' | 'WARNING' | 'CRITICAL';
}

export interface TriageEvaluation {
  color: TriageLevel;
  levelName: string;
  score: number;
  rationale: string;
  recommendedAction: string;
  urgencyTimeframe: string;
  matchedConditions: string[];
}
