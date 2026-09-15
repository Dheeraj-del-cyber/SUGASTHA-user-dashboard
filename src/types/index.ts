// ABHA & Patient Models
export interface AbhaProfile {
  abhaNumber: string; // 14-digit format: "91-4523-8901-2345"
  abhaAddress: string; // e.g., "rahul.sharma@abdm"
  fullName: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  dateOfBirth: string; // YYYY-MM-DD
  mobileNumber: string;
  email?: string;
  address: {
    line: string;
    district: string;
    state: string;
    pincode: string;
  };
  bloodGroup: string;
  emergencyContact: {
    name: string;
    relation: string;
    phone: string;
  };
  avatarUrl?: string;
  kycVerified: boolean;
}

export interface HealthRecord {
  id: string;
  date: string;
  category: 'DIAGNOSIS' | 'PRESCRIPTION' | 'LAB_REPORT' | 'SURGERY' | 'IMMUNIZATION';
  title: string;
  facilityName: string;
  doctorName: string;
  details: string;
  attachments?: {
    name: string;
    type: string;
    size: string;
  }[];
  criticalFlags?: string[];
}

export interface ChronicCondition {
  id: string;
  condition: string;
  diagnosedYear: number;
  status: 'ACTIVE' | 'MANAGED' | 'INACTIVE';
  currentMedications: string[];
  severityNote?: string;
}

export interface Allergy {
  id: string;
  allergen: string;
  reaction: string;
  severity: 'MILD' | 'MODERATE' | 'SEVERE';
}

// Symptom & Triage Models
export type TriageLevel = 'GREEN' | 'YELLOW' | 'RED';

export interface SymptomInput {
  primarySymptoms: string[]; // e.g. ["Chest Pain", "Shortness of Breath"]
  durationDays: number;
  painScale: number; // 0 to 10
  bodyRegion: string; // e.g. "Chest / Thorax", "Head & Neck", "Abdomen", "General"
  additionalNotes: string;
  hasRedFlags: {
    feverWithChills?: boolean;
    difficultyBreathing?: boolean;
    lossOfConsciousness?: boolean;
    chestPressure?: boolean;
    suddenWeakness?: boolean;
    severeBleeding?: boolean;
  };
}

export interface ClinicalFactor {
  title: string;
  impact: 'CRITICAL' | 'MODERATE' | 'INFO';
  description: string;
  source: 'CURRENT_SYMPTOMS' | 'ABHA_CHRONIC_HISTORY' | 'PAST_RECORDS';
}

export interface TriageResult {
  level: TriageLevel;
  title: string;
  category: string;
  summary: string;
  urgencyWindow: string; // e.g., "Immediate (0-1 hour)", "Within 4-12 hours", "Routine / 24-48 hours"
  recommendedRoute: 'HOSPITAL_VISIT' | 'TELECONSULTATION';
  clinicalFactors: ClinicalFactor[];
  suggestedSpecialties: string[];
  vitalsRiskScore: number; // 0 - 100
  warningFlags: string[];
}

// Hospital & Doctor Models
export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  qualifications: string;
  experienceYears: number;
  availableSlotToday: string;
  rating: number;
  languages: string[];
}

export interface Hospital {
  id: string;
  name: string;
  type: 'GOVERNMENT_TERTIARY' | 'DISTRICT_HOSPITAL' | 'PRIVATE_SUPERSPECIALTY' | 'URBAN_HEALTH_CENTRE';
  address: string;
  district: string;
  pincode: string;
  distanceKm: number;
  estimatedTravelTimeMinutes: number;
  fareEstimates: {
    autoFare: number;
    cabFare: number;
    transitFare?: number;
  };
  bedAvailabilityStatus: 'AVAILABLE' | 'LIMITED' | 'HIGH_DEMAND';
  emergencyQueueStatus: 'NORMAL' | 'MODERATE' | 'BUSY';
  nabhAccredited: boolean;
  doctors: Doctor[];
  contactPhone: string;
  ambulanceHotline: string;
}

// Queue & Backup Consultation System Models
export type ConsultationStatus =
  | 'REQUEST_CREATED'
  | 'PENDING'
  | 'HOSPITAL_ACCEPTED'
  | 'CONFIRMED'
  | 'COMPLETED'
  | 'CANCELLED';

export interface HospitalQueueNode {
  hospitalId: string;
  hospitalName: string;
  doctorName: string;
  doctorSpecialization: string;
  priorityOrder: 1 | 2 | 3;
  status: 'QUEUED' | 'PENDING_RESPONSE' | 'ACCEPTED' | 'PASSED_TO_NEXT' | 'REJECTED';
  requestedAt: string;
  respondedAt?: string;
  rejectionReason?: string;
}

export interface ConsultationRequest {
  id: string; // SUG-2026-XXXXX
  consultationNumber: string; // 5-digit number, e.g. "49201"
  qrDataPayload: string;
  abhaNumber: string;
  patientName: string;
  createdAt: string;
  status: ConsultationStatus;
  triageLevel: TriageLevel;
  primarySymptoms: string[];
  routeType: 'HOSPITAL_VISIT' | 'TELECONSULTATION';
  
  // Selected Primary Hospital & Doctor
  selectedHospital: Hospital;
  selectedDoctor: Doctor;

  // 3-Tier Queue System (Primary + 2 Fallback Hospitals)
  queueState: {
    activePriority: 1 | 2 | 3;
    queueNodes: HospitalQueueNode[];
  };

  confirmedHospitalId?: string;
  confirmedDoctorName?: string;
  appointmentSlot?: string;
  estimatedWaitTime?: string;
  referralNote?: string;
}

// Healthcare Journey Summary (ABHA Integration Sync)
export interface HealthcareJourneySummary {
  journeyId: string;
  consultationId: string;
  consultationNumber: string;
  date: string;
  abhaNumber: string;
  patientName: string;
  reportedSymptoms: string[];
  consideredMedicalHistory: string[];
  triageOutcome: {
    level: TriageLevel;
    rationale: string;
    clinicalFactors: string[];
  };
  recommendationType: 'HOSPITAL_VISIT' | 'TELECONSULTATION';
  hospitalDetails?: {
    hospitalName: string;
    doctorName: string;
    specialization: string;
    status: ConsultationStatus;
    queueProgression: string;
  };
  teleconsultationDetails?: {
    platform: string;
    connected: boolean;
    sessionRef?: string;
  };
  eventsTimeline: {
    timestamp: string;
    event: string;
    description: string;
  }[];
  fhirBundlePayload: Record<string, unknown>; // ABDM FHIR Health Record format structure
  syncedToAbha: boolean;
  syncedAt?: string;
}
