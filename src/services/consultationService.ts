import {
  ConsultationRequest,
  Hospital,
  Doctor,
  TriageResult,
  SymptomInput,
  AbhaProfile,
  HealthcareJourneySummary,
} from '../types';
import { hospitalQueueService } from './hospitalQueueService';
import { MOCK_HOSPITALS } from '../data/mockHospitals';
import { abhaService } from './abhaService';

const ACTIVE_CONSULTATION_KEY = 'sugastha_active_consultation';
const CONSULTATION_HISTORY_KEY = 'sugastha_consultation_history';

// Generate 5-digit number
function generate5DigitNumber(): string {
  return Math.floor(10000 + Math.random() * 90000).toString();
}

// Generate Consultation ID
function generateConsultationId(): string {
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `SUG-2026-${rand}`;
}

export const consultationService = {
  // Get active consultation if any
  getActiveConsultation(): ConsultationRequest | null {
    try {
      const data = localStorage.getItem(ACTIVE_CONSULTATION_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  // Get past consultation history
  getConsultationHistory(): ConsultationRequest[] {
    try {
      const data = localStorage.getItem(CONSULTATION_HISTORY_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  // Book a new consultation with 3-tier queue buffer
  createConsultation(
    profile: AbhaProfile,
    symptoms: SymptomInput,
    triage: TriageResult,
    hospital: Hospital,
    doctor: Doctor
  ): ConsultationRequest {
    const consultationId = generateConsultationId();
    const consultationNumber = generate5DigitNumber();

    // Construct 3-tier queue nodes
    const queueNodes = hospitalQueueService.build3TierHospitalQueue(
      hospital,
      doctor,
      MOCK_HOSPITALS,
      triage
    );

    // Cryptographic-style QR verification payload
    const qrPayload = JSON.stringify({
      protocol: 'SUGASTHA-ABDM-QR',
      id: consultationId,
      token: consultationNumber,
      abha: profile.abhaNumber,
      patient: profile.fullName,
      hosp: hospital.id,
      doc: doctor.name,
      triage: triage.level,
      authSignature: `SIG_${btoa(consultationId + consultationNumber).slice(0, 16)}`,
      verifyUrl: `https://verify.sugastha.gov.in/c/${consultationNumber}`,
    });

    const newRequest: ConsultationRequest = {
      id: consultationId,
      consultationNumber,
      qrDataPayload: qrPayload,
      abhaNumber: profile.abhaNumber,
      patientName: profile.fullName,
      createdAt: new Date().toISOString(),
      status: 'PENDING', // Initially set to Pending
      triageLevel: triage.level,
      primarySymptoms: symptoms.primarySymptoms,
      routeType: 'HOSPITAL_VISIT',
      selectedHospital: hospital,
      selectedDoctor: doctor,
      queueState: {
        activePriority: 1,
        queueNodes,
      },
      appointmentSlot: doctor.availableSlotToday,
      referralNote: `AI Triage [${triage.level}]: ${triage.summary}`,
    };

    localStorage.setItem(ACTIVE_CONSULTATION_KEY, JSON.stringify(newRequest));
    return newRequest;
  },

  // Create Teleconsultation request
  createTeleconsultation(
    profile: AbhaProfile,
    symptoms: SymptomInput,
    triage: TriageResult
  ): ConsultationRequest {
    const consultationId = generateConsultationId();
    const consultationNumber = generate5DigitNumber();

    const mockTeleHospital: Hospital = {
      id: 'esanjeevani-national-portal',
      name: 'eSanjeevani National Teleconsultation Portal',
      type: 'URBAN_HEALTH_CENTRE',
      address: 'MoHFW, Government of India Online OPD Gateway',
      district: 'National Digital OPD',
      pincode: '110001',
      distanceKm: 0,
      estimatedTravelTimeMinutes: 0,
      fareEstimates: { autoFare: 0, cabFare: 0 },
      bedAvailabilityStatus: 'AVAILABLE',
      emergencyQueueStatus: 'NORMAL',
      nabhAccredited: true,
      contactPhone: '1800 180 1104',
      ambulanceHotline: '108',
      doctors: [
        {
          id: 'doc-tele-1',
          name: 'Dr. Neha Kapoor',
          specialization: 'General Tele-Medicine & OPD',
          qualifications: 'MBBS, MD (Community Medicine)',
          experienceYears: 9,
          availableSlotToday: 'Next 10 mins (Virtual Queue)',
          rating: 4.8,
          languages: ['English', 'Hindi'],
        },
      ],
    };

    const qrPayload = JSON.stringify({
      protocol: 'SUGASTHA-ESANJEEVANI-QR',
      id: consultationId,
      token: consultationNumber,
      abha: profile.abhaNumber,
      patient: profile.fullName,
      route: 'eSanjeevani',
      verifyUrl: `https://esanjeevani.gov.in/token/${consultationNumber}`,
    });

    const newRequest: ConsultationRequest = {
      id: consultationId,
      consultationNumber,
      qrDataPayload: qrPayload,
      abhaNumber: profile.abhaNumber,
      patientName: profile.fullName,
      createdAt: new Date().toISOString(),
      status: 'PENDING',
      triageLevel: triage.level,
      primarySymptoms: symptoms.primarySymptoms,
      routeType: 'TELECONSULTATION',
      selectedHospital: mockTeleHospital,
      selectedDoctor: mockTeleHospital.doctors[0],
      queueState: {
        activePriority: 1,
        queueNodes: [
          {
            hospitalId: mockTeleHospital.id,
            hospitalName: mockTeleHospital.name,
            doctorName: mockTeleHospital.doctors[0].name,
            doctorSpecialization: mockTeleHospital.doctors[0].specialization,
            priorityOrder: 1,
            status: 'PENDING_RESPONSE',
            requestedAt: new Date().toISOString(),
          },
        ],
      },
      appointmentSlot: 'Immediate Virtual Room Slot',
      referralNote: 'Automated Green Triage Referral for eSanjeevani OPD',
    };

    localStorage.setItem(ACTIVE_CONSULTATION_KEY, JSON.stringify(newRequest));
    return newRequest;
  },

  // Simulate External Hospital System accepting the request (Pending -> Confirmed)
  confirmConsultation(activeReq: ConsultationRequest): ConsultationRequest {
    const { updatedQueue, acceptedNode } = hospitalQueueService.acceptAtActiveNode(
      activeReq.queueState.queueNodes
    );

    const updated: ConsultationRequest = {
      ...activeReq,
      status: 'CONFIRMED',
      queueState: {
        ...activeReq.queueState,
        queueNodes: updatedQueue,
      },
      confirmedHospitalId: acceptedNode?.hospitalId || activeReq.selectedHospital.id,
      confirmedDoctorName: acceptedNode?.doctorName || activeReq.selectedDoctor.name,
      estimatedWaitTime: 'Approx 15-20 minutes upon arrival at hospital desk',
    };

    localStorage.setItem(ACTIVE_CONSULTATION_KEY, JSON.stringify(updated));
    return updated;
  },

  // Simulate Hospital 1 failing/rejecting, passing to Backup Hospital 1 or 2
  failoverToNextBackupHospital(activeReq: ConsultationRequest, reason?: string): ConsultationRequest {
    const result = hospitalQueueService.advanceQueueToNextHospital(
      activeReq.queueState.queueNodes,
      reason
    );

    const updated: ConsultationRequest = {
      ...activeReq,
      status: result.isExhausted ? 'CANCELLED' : 'PENDING',
      queueState: {
        activePriority: result.newActivePriority,
        queueNodes: result.updatedQueue,
      },
    };

    localStorage.setItem(ACTIVE_CONSULTATION_KEY, JSON.stringify(updated));
    return updated;
  },

  // Complete consultation journey & update ABHA health record
  async completeHealthcareJourney(
    activeReq: ConsultationRequest,
    triage: TriageResult | null,
    consideredRecords: string[] = []
  ): Promise<HealthcareJourneySummary> {
    const now = new Date().toISOString();
    const dateFormatted = new Date().toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    const activeNode = activeReq.queueState.queueNodes.find((n) => n.status === 'ACCEPTED') ||
      activeReq.queueState.queueNodes[0];

    const queueProgressionText = activeReq.queueState.queueNodes
      .map((n) => `Tier ${n.priorityOrder} (${n.hospitalName.split(' ')[0]}): ${n.status}`)
      .join(' -> ');

    const summary: HealthcareJourneySummary = {
      journeyId: `JRN-${Date.now()}`,
      consultationId: activeReq.id,
      consultationNumber: activeReq.consultationNumber,
      date: dateFormatted,
      abhaNumber: activeReq.abhaNumber,
      patientName: activeReq.patientName,
      reportedSymptoms: activeReq.primarySymptoms,
      consideredMedicalHistory: consideredRecords,
      triageOutcome: {
        level: activeReq.triageLevel,
        rationale: triage?.summary || 'Clinical urgency assessed via SUGASTHA automated AI rules.',
        clinicalFactors: triage?.clinicalFactors.map((f) => `${f.title} (${f.source})`) || [],
      },
      recommendationType: activeReq.routeType,
      hospitalDetails: {
        hospitalName: activeNode.hospitalName,
        doctorName: activeNode.doctorName,
        specialization: activeNode.doctorSpecialization,
        status: 'COMPLETED',
        queueProgression: queueProgressionText,
      },
      eventsTimeline: [
        {
          timestamp: activeReq.createdAt,
          event: 'Request Initiated',
          description: `Patient logged symptoms and initiated triage consultation request [${activeReq.consultationNumber}].`,
        },
        {
          timestamp: activeNode.requestedAt,
          event: `Hospital Dispatch (Priority ${activeNode.priorityOrder})`,
          description: `Dispatched to ${activeNode.hospitalName} backend queue.`,
        },
        {
          timestamp: now,
          event: 'Consultation Completed',
          description: 'Encounter completed. Clinical report generated and prepared for ABDM sync.',
        },
      ],
      fhirBundlePayload: {
        resourceType: 'Bundle',
        type: 'document',
        timestamp: now,
        identifier: {
          system: 'https://abdm.gov.in/fhir/bundle',
          value: activeReq.id,
        },
        entry: [
          {
            resource: {
              resourceType: 'Encounter',
              id: activeReq.consultationNumber,
              status: 'finished',
              class: { code: activeReq.routeType === 'TELECONSULTATION' ? 'VR' : 'AMB' },
              subject: { reference: `Patient/${activeReq.abhaNumber}` },
            },
          },
        ],
      },
      syncedToAbha: true,
      syncedAt: now,
    };

    // Append to ABHA store
    await abhaService.appendHealthcareJourneySummary(activeReq.abhaNumber, summary);

    // Save completed into history list
    const history = this.getConsultationHistory();
    const completedReq: ConsultationRequest = {
      ...activeReq,
      status: 'COMPLETED',
    };
    history.unshift(completedReq);
    localStorage.setItem(CONSULTATION_HISTORY_KEY, JSON.stringify(history));

    // Remove from active
    localStorage.removeItem(ACTIVE_CONSULTATION_KEY);

    return summary;
  },

  // Reset or cancel
  cancelActiveConsultation() {
    localStorage.removeItem(ACTIVE_CONSULTATION_KEY);
  },
};
