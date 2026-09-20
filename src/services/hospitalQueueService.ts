import { Hospital, Doctor, TriageResult, HospitalQueueNode } from '../types';
import { MOCK_HOSPITALS } from '../data/mockHospitals';

const getDistanceKm = (
  latitude1: number,
  longitude1: number,
  latitude2: number,
  longitude2: number
) => {
  const toRadians = (value: number) => (value * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const deltaLat = toRadians(latitude2 - latitude1);
  const deltaLon = toRadians(longitude2 - longitude1);
  const lat1 = toRadians(latitude1);
  const lat2 = toRadians(latitude2);

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);

  return (2 * earthRadiusKm * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))) / 1;
};

export const hospitalQueueService = {
  /**
   * Filter and rank hospitals according to triage level, suggested specialties, and distance.
   */
  getRecommendedHospitals(
    triage: TriageResult,
    userLocation?: { latitude: number; longitude: number },
    hospitalCatalog: Hospital[] = MOCK_HOSPITALS
  ): Hospital[] {
    const list = [...hospitalCatalog].map((hospital) => {
      if (
        userLocation &&
        typeof hospital.latitude === 'number' &&
        typeof hospital.longitude === 'number'
      ) {
        const distanceKm = getDistanceKm(
          userLocation.latitude,
          userLocation.longitude,
          hospital.latitude,
          hospital.longitude
        );

        return {
          ...hospital,
          distanceKm: Number(distanceKm.toFixed(1)),
          estimatedTravelTimeMinutes: Math.max(5, Math.round(distanceKm * 4.5)),
        };
      }

      return hospital;
    });

    return list.sort((a, b) => {
      if (userLocation) {
        const aEmergency = a.type === 'GOVERNMENT_TERTIARY' || a.type === 'PRIVATE_SUPERSPECIALTY';
        const bEmergency = b.type === 'GOVERNMENT_TERTIARY' || b.type === 'PRIVATE_SUPERSPECIALTY';

        const distanceDiff = a.distanceKm - b.distanceKm;
        if (Math.abs(distanceDiff) > 0.1) {
          return distanceDiff;
        }

        if (triage.level === 'RED') {
          if (aEmergency && !bEmergency) return -1;
          if (!aEmergency && bEmergency) return 1;
        }

        return distanceDiff;
      }

      // If RED triage, prioritize tertiary government / superspeciality hospitals with active emergency desks
      if (triage.level === 'RED') {
        const aEmergency = a.type === 'GOVERNMENT_TERTIARY' || a.type === 'PRIVATE_SUPERSPECIALTY';
        const bEmergency = b.type === 'GOVERNMENT_TERTIARY' || b.type === 'PRIVATE_SUPERSPECIALTY';
        if (aEmergency && !bEmergency) return -1;
        if (!aEmergency && bEmergency) return 1;
      }

      return a.distanceKm - b.distanceKm;
    });
  },

  /**
   * Find the most fitting doctor in a given hospital for the triage result
   */
  getBestMatchingDoctor(hospital: Hospital, triage: TriageResult): Doctor {
    const safeDoctors = Array.isArray(hospital.doctors) ? hospital.doctors : [];

    if (!safeDoctors.length) {
      return {
        id: `demo-fallback-${hospital.id}`,
        name: 'Demo Doctor',
        specialization: 'General Consultation',
        qualifications: 'Prototype fallback only',
        experienceYears: 0,
        availableSlotToday: 'Prototype availability',
        rating: 4.5,
        languages: ['English'],
      };
    }

    const preferredSpecialties = triage.suggestedSpecialties.map((s) => s.toLowerCase());

    const matchingDoc = safeDoctors.find((doc) =>
      preferredSpecialties.some((pref) => doc.specialization.toLowerCase().includes(pref))
    );

    return matchingDoc || safeDoctors[0];
  },

  /**
   * Constructs the 3-tier queue buffer:
   * 1 Selected Primary Hospital + 2 Automated Backup Fallback Hospitals
   */
  build3TierHospitalQueue(
    selectedHospital: Hospital,
    selectedDoctor: Doctor,
    allHospitals: Hospital[],
    triage: TriageResult,
    userLocation?: { latitude: number; longitude: number }
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

    const rankedHospitals = userLocation
      ? this.getRecommendedHospitals(triage, userLocation, allHospitals)
      : allHospitals.length
        ? [...allHospitals]
        : this.getRecommendedHospitals(triage);

    const fallbackCandidates = rankedHospitals.filter((h) => h.id !== selectedHospital.id);

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
