import { AbhaProfile, HealthRecord, ChronicCondition, Allergy, HealthcareJourneySummary } from '../types';
import { MOCK_ABHA_PROFILES, DEFAULT_ABHA_NUMBER } from '../data/mockAbhaData';

const ABHA_STORAGE_KEY = 'sugastha_active_abha_user';
const ABHA_DATASTORE_KEY = 'sugastha_abha_profiles_store';

// Initialize localStorage with mock data if absent
function getStoredDataStore(): typeof MOCK_ABHA_PROFILES {
  try {
    const saved = localStorage.getItem(ABHA_DATASTORE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {
    // fallback
  }
  localStorage.setItem(ABHA_DATASTORE_KEY, JSON.stringify(MOCK_ABHA_PROFILES));
  return MOCK_ABHA_PROFILES;
}

function saveToDataStore(data: typeof MOCK_ABHA_PROFILES) {
  localStorage.setItem(ABHA_DATASTORE_KEY, JSON.stringify(data));
}

export const abhaService = {
  // Get currently logged-in user profile from storage
  getCurrentSession(): {
    profile: AbhaProfile;
    records: HealthRecord[];
    conditions: ChronicCondition[];
    allergies: Allergy[];
  } | null {
    const savedAbhaNumber = localStorage.getItem(ABHA_STORAGE_KEY) || DEFAULT_ABHA_NUMBER;
    const store = getStoredDataStore();
    return store[savedAbhaNumber] || store[DEFAULT_ABHA_NUMBER] || null;
  },

  // Login by ABHA ID or ABHA Address
  async login(identifier: string, _authType: 'OTP' | 'PASSWORD', _secret: string): Promise<{
    profile: AbhaProfile;
    records: HealthRecord[];
    conditions: ChronicCondition[];
    allergies: Allergy[];
  }> {
    // Simulated network delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    const store = getStoredDataStore();
    const cleanId = identifier.trim().toLowerCase();

    // Look for match by ABHA number or address
    let matchedKey: string | undefined;
    for (const [key, value] of Object.entries(store)) {
      if (
        key.toLowerCase() === cleanId ||
        value.profile.abhaAddress.toLowerCase() === cleanId ||
        value.profile.mobileNumber.replace(/\s+/g, '').includes(cleanId.replace(/\s+/g, ''))
      ) {
        matchedKey = key;
        break;
      }
    }

    // If identifier is not found, fallback gracefully to default profile for testing convenience
    const targetKey = matchedKey || DEFAULT_ABHA_NUMBER;
    const session = store[targetKey];

    localStorage.setItem(ABHA_STORAGE_KEY, targetKey);
    return session;
  },

  // Register new ABHA ID via Aadhaar simulation
  async registerNewAbha(params: {
    aadhaarNumber: string;
    mobileNumber: string;
    fullName: string;
    dateOfBirth: string;
    gender: 'MALE' | 'FEMALE' | 'OTHER';
    preferredAbhaAddress: string;
  }): Promise<AbhaProfile> {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Generate compliant 14-digit format: 91-XXXX-XXXX-XXXX
    const randomDigits = () => Math.floor(1000 + Math.random() * 9000).toString();
    const newAbhaNumber = `91-${randomDigits()}-${randomDigits()}-${randomDigits()}`;
    const cleanAddress = params.preferredAbhaAddress.includes('@')
      ? params.preferredAbhaAddress
      : `${params.preferredAbhaAddress}@abdm`;

    const newProfile: AbhaProfile = {
      abhaNumber: newAbhaNumber,
      abhaAddress: cleanAddress,
      fullName: params.fullName,
      gender: params.gender,
      dateOfBirth: params.dateOfBirth,
      mobileNumber: params.mobileNumber,
      bloodGroup: 'A+',
      address: {
        line: 'Aadhaar Verified Address, Main Road',
        district: 'New Delhi',
        state: 'Delhi',
        pincode: '110001',
      },
      emergencyContact: {
        name: 'Family Member',
        relation: 'Relative',
        phone: params.mobileNumber,
      },
      kycVerified: true,
    };

    const store = getStoredDataStore();
    store[newAbhaNumber] = {
      profile: newProfile,
      records: [],
      conditions: [],
      allergies: [],
    };
    saveToDataStore(store);
    localStorage.setItem(ABHA_STORAGE_KEY, newAbhaNumber);

    return newProfile;
  },

  // Recover forgotten ABHA ID
  async recoverAbhaId(identifier: string): Promise<{ abhaNumber: string; abhaAddress: string; maskedMobile: string }> {
    await new Promise((resolve) => setTimeout(resolve, 800));
    const store = getStoredDataStore();
    const clean = identifier.replace(/\s+/g, '');

    for (const [, val] of Object.entries(store)) {
      const storedMobile = val.profile.mobileNumber.replace(/\s+/g, '');
      if (storedMobile.includes(clean) || clean.length >= 10) {
        return {
          abhaNumber: val.profile.abhaNumber,
          abhaAddress: val.profile.abhaAddress,
          maskedMobile: val.profile.mobileNumber.slice(0, 7) + 'XXXX',
        };
      }
    }

    // Default return
    const def = store[DEFAULT_ABHA_NUMBER];
    return {
      abhaNumber: def.profile.abhaNumber,
      abhaAddress: def.profile.abhaAddress,
      maskedMobile: def.profile.mobileNumber.slice(0, 7) + 'XXXX',
    };
  },

  // Update ABHA Health Record with SUGASTHA Consultation Summary
  async appendHealthcareJourneySummary(abhaNumber: string, summary: HealthcareJourneySummary): Promise<boolean> {
    const store = getStoredDataStore();
    const entry = store[abhaNumber];
    if (!entry) return false;

    // Convert journey summary into an official ABDM Health Record
    const newRecord: HealthRecord = {
      id: `rec-sugastha-${Date.now()}`,
      date: summary.date,
      category: 'DIAGNOSIS',
      title: `SUGASTHA Consultation [${summary.consultationNumber}] - ${summary.triageOutcome.level} Triage`,
      facilityName: summary.hospitalDetails?.hospitalName || 'SUGASTHA Tele-Triage Network',
      doctorName: summary.hospitalDetails?.doctorName || 'Assigned Specialist',
      details: `Symptoms: ${summary.reportedSymptoms.join(', ')}. AI Triage Result: ${summary.triageOutcome.level} (${summary.triageOutcome.rationale}). Recommendation: ${summary.recommendationType}. Queue progression: ${summary.hospitalDetails?.queueProgression || 'Direct'}. Status: Completed.`,
      criticalFlags: summary.triageOutcome.level === 'RED' ? ['High Priority Consultation', 'Emergency Pathway'] : undefined,
    };

    entry.records.unshift(newRecord);
    saveToDataStore(store);
    return true;
  },

  logout() {
    localStorage.removeItem(ABHA_STORAGE_KEY);
  },
};
