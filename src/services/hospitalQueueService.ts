import { Hospital, Doctor, TriageResult, HospitalQueueNode } from '../types';
import { MOCK_HOSPITALS } from '../data/mockHospitals';

export const hospitalQueueService = {
  /**
   * Filter and rank hospitals according to triage level, suggested specialties, and distance.
   */
  getRecommendedHospitals(triage: TriageResult): Hospital[] {
    const list = [...MOCK_HOSPITALS];

    return list.sort((a, b) => {
      // If RED triage, prioritize tertiary government / superspeciality hospitals with active emergency desks
      if (triage.level === 'RED') {
        const aEmergency = a.type === 'GOVERNMENT_TERTIARY' || a.type === 'PRIVATE_SUPERSPECIALTY';
        const bEmergency = b.type === 'GOVERNMENT_TERTIARY' || b.type === 'PRIVATE_SUPERSPECIALTY';
        if (aEmergency && !bEmergency) return -1;
        if (!aEmergency && bEmergency) return 1;
      }

      // Distance score
      return a.distanceKm - b.distanceKm;
    });
  },

  /**
   * Find the most fitting doctor in a given hospital for the triage result
   */
  getBestMatchingDoctor(hospital: Hospital, triage: TriageResult): Doctor {
    const preferredSpecialties = triage.suggestedSpecialties.map((s) => s.toLowerCase());

    const matchingDoc = hospital.doctors.find((doc) =>
      preferredSpecialties.some((pref) => doc.specialization.toLowerCase().includes(pref))
    );

    return matchingDoc || hospital.doctors[0];
  },

  /**
   * Constructs the 3-tier queue buffer:
   * 1 Selected Primary Hospital + 2 Automated Backup Fallback Hospitals
   */
  build3TierHospitalQueue(
    selectedHospital: Hospital,
    selectedDoctor: Doctor,
    allHospitals: Hospital[],
    triage: TriageResult
  ): HospitalQueueNode[] {
    const queue: HospitalQueueNode[] = [];

    // Priority 1: User's explicitly chosen hospital and doctor
    queue.push({
      hospitalId: selectedHospital.id,
      hospitalName: selectedHospital.name,
      doctorName: selectedDoctor.name,
      doctorSpecialization: selectedDoctor.specialization,
      priorityOrder: 1,
      status: 'PENDING_RESPONSE',
      requestedAt: new Date().toISOString(),
    });

    // Pick top 2 remaining suitable hospitals as Priority 2 & Priority 3 fallbacks
    const fallbackCandidates = allHospitals.filter((h) => h.id !== selectedHospital.id);

    // Fallback 1
    if (fallbackCandidates.length > 0) {
      const fb1 = fallbackCandidates[0];
      const doc1 = this.getBestMatchingDoctor(fb1, triage);
      queue.push({
        hospitalId: fb1.id,
        hospitalName: fb1.name,
        doctorName: doc1.name,
        doctorSpecialization: doc1.specialization,
        priorityOrder: 2,
        status: 'QUEUED',
        requestedAt: new Date().toISOString(),
      });
    }

    // Fallback 2
    if (fallbackCandidates.length > 1) {
      const fb2 = fallbackCandidates[1];
      const doc2 = this.getBestMatchingDoctor(fb2, triage);
      queue.push({
        hospitalId: fb2.id,
        hospitalName: fb2.name,
        doctorName: doc2.name,
        doctorSpecialization: doc2.specialization,
        priorityOrder: 3,
        status: 'QUEUED',
        requestedAt: new Date().toISOString(),
      });
    }

    return queue;
  },

  /**
   * Advances the queue if the current hospital rejects or times out
   */
  advanceQueueToNextHospital(
    currentQueue: HospitalQueueNode[],
    reason = 'Hospital triage unit busy / No bed immediately available'
  ): {
    updatedQueue: HospitalQueueNode[];
    newActivePriority: 1 | 2 | 3;
    isExhausted: boolean;
  } {
    const updated = currentQueue.map((node) => ({ ...node }));
    const currentActiveIdx = updated.findIndex((n) => n.status === 'PENDING_RESPONSE');

    if (currentActiveIdx === -1) {
      return { updatedQueue: updated, newActivePriority: 1, isExhausted: false };
    }

    // Mark current active as passed to next
    updated[currentActiveIdx].status = 'PASSED_TO_NEXT';
    updated[currentActiveIdx].respondedAt = new Date().toISOString();
    updated[currentActiveIdx].rejectionReason = reason;

    // Check if next exists
    const nextIdx = currentActiveIdx + 1;
    if (nextIdx < updated.length) {
      updated[nextIdx].status = 'PENDING_RESPONSE';
      updated[nextIdx].requestedAt = new Date().toISOString();
      return {
        updatedQueue: updated,
        newActivePriority: updated[nextIdx].priorityOrder,
        isExhausted: false,
      };
    }

    // Queue exhausted
    return {
      updatedQueue: updated,
      newActivePriority: updated[currentActiveIdx].priorityOrder,
      isExhausted: true,
    };
  },

  /**
   * Accepts the consultation at the currently active priority node
   */
  acceptAtActiveNode(currentQueue: HospitalQueueNode[]): {
    updatedQueue: HospitalQueueNode[];
    acceptedNode: HospitalQueueNode | undefined;
  } {
    const updated = currentQueue.map((node) => ({ ...node }));
    const activeNode = updated.find((n) => n.status === 'PENDING_RESPONSE');

    if (activeNode) {
      activeNode.status = 'ACCEPTED';
      activeNode.respondedAt = new Date().toISOString();
    }

    return { updatedQueue: updated, acceptedNode: activeNode };
  },

  /**
   * Formats the clean REST/Webhook API payload for the interconnected hospital system
   */
  generateHospitalApiPayload(consultationNumber: string, queueNode: HospitalQueueNode, abhaNumber: string) {
    return {
      protocolVersion: 'ABDM-SUGASTHA-v1.0',
      event: 'CONSULTATION_REQUEST_DISPATCH',
      timestamp: new Date().toISOString(),
      consultationToken: consultationNumber,
      targetHospitalId: queueNode.hospitalId,
      assignedPriorityTier: queueNode.priorityOrder,
      patientAbhaId: abhaNumber,
      callbackWebhookUrl: `https://api.sugastha.gov.in/v1/consultations/${consultationNumber}/webhook`,
    };
  },
};
