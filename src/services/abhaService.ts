import { AbhaProfile, HealthRecord, ChronicCondition, Allergy, HealthcareJourneySummary } from '../types';
import { MOCK_ABHA_PROFILES } from '../data/mockAbhaData';
import { DEMO_ABHA_PROFILES } from '../data/demoAbhaProfiles';

// Udupi demo patients first, then the older Delhi demo profiles.
const SEED_PROFILES: typeof MOCK_ABHA_PROFILES = { ...DEMO_ABHA_PROFILES, ...MOCK_ABHA_PROFILES };

const ABHA_STORAGE_KEY = 'sugastha_active_abha_user';
// Bump SEED_VERSION whenever demo/mock profile data changes so browsers that
// already saved an older copy pick up the new seed data.
const SEED_VERSION = '2';
const ABHA_DATASTORE_KEY = 'sugastha_abha_profiles_store';
const ABHA_SEED_VERSION_KEY = 'sugastha_abha_seed_version';

function saveToDataStore(data: typeof MOCK_ABHA_PROFILES) {
  localStorage.setItem(ABHA_DATASTORE_KEY, JSON.stringify(data));
}

// Initialize localStorage with mock data if absent or outdated
function getStoredDataStore(): typeof MOCK_ABHA_PROFILES {
  try {
    const saved = localStorage.getItem(ABHA_DATASTORE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as typeof MOCK_ABHA_PROFILES;
      if (localStorage.getItem(ABHA_SEED_VERSION_KEY) !== SEED_VERSION) {
        // Seed changed: reset seeded profiles to the new data, but keep
        // profiles the user registered themselves.
        const userCreated = Object.fromEntries(
          Object.entries(parsed).filter(([key]) => !(key in SEED_PROFILES))
        );
        const migrated = { ...userCreated, ...SEED_PROFILES };
        saveToDataStore(migrated);
        localStorage.setItem(ABHA_SEED_VERSION_KEY, SEED_VERSION);
        return migrated;
      }
      // Same version: saved data wins (keeps profile edits and new records),
      // seed only fills in missing profiles.
      return { ...SEED_PROFILES, ...parsed };
    }
  } catch {
    // fallback to seed below
  }
  saveToDataStore(SEED_PROFILES);
  localStorage.setItem(ABHA_SEED_VERSION_KEY, SEED_VERSION);
  return SEED_PROFILES;
}

export const abhaService = {
  // Get currently logged-in user profile from storage
  getCurrentSession(): {
    profile: AbhaProfile;
    records: HealthRecord[];
    conditions: ChronicCondition[];
    allergies: Allergy[];
  } | null {
    const savedAbhaNumber = localStorage.getItem(ABHA_STORAGE_KEY);
    if (!savedAbhaNumber) return null;
    const store = getStoredDataStore();
    return store[savedAbhaNumber] || null;
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

    const digits = (v: string) => v.replace(/\D/g, '');
    let matchedKey: string | undefined;
    for (const [key, value] of Object.entries(store)) {
      const idDigits = digits(cleanId);
      if (
        key.toLowerCase() === cleanId ||
        (idDigits.length >= 10 && digits(key) === idDigits) ||
        value.profile.abhaAddress.toLowerCase() === cleanId ||
        (idDigits.length >= 10 && digits(value.profile.mobileNumber).endsWith(idDigits.slice(-10)))
      ) {
        matchedKey = key;
        break;
      }
    }

    // No silent fallback to a default person: unknown IDs must fail.
    if (!matchedKey) {
      throw new Error('No ABHA profile found for this ID or mobile number.');
    }
    const targetKey = matchedKey;
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

  // Recover forgotten ABHA ID (by registered mobile number)
  async recoverAbhaId(identifier: string): Promise<{ abhaNumber: string; abhaAddress: string; maskedMobile: string }> {
    await new Promise((resolve) => setTimeout(resolve, 800));
    const store = getStoredDataStore();
    const inputDigits = identifier.replace(/\D/g, '');

    if (inputDigits.length >= 10) {
      const last10 = inputDigits.slice(-10);
      for (const val of Object.values(store)) {
        const storedDigits = val.profile.mobileNumber.replace(/\D/g, '');
        if (storedDigits.endsWith(last10)) {
          return {
            abhaNumber: val.profile.abhaNumber,
            abhaAddress: val.profile.abhaAddress,
            maskedMobile: val.profile.mobileNumber.slice(0, 7) + 'XXXX',
          };
        }
      }
    }

    // No silent fallback to a default person: unknown numbers must fail.
    throw new Error('No ABHA profile found for this mobile number.');
  },

  // Persist edited profile details so they survive refresh / re-login
  updateProfile(profile: AbhaProfile): boolean {
    const store = getStoredDataStore();
    const entry = store[profile.abhaNumber];
    if (!entry) return false;
    entry.profile = profile;
    saveToDataStore(store);
    return true;
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
