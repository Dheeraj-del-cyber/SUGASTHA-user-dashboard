import { AbhaProfile, HealthRecord, ChronicCondition, Allergy } from '../types';

// 5 SYNTHETIC demo patients (Udupi district, Karnataka). Names, numbers and
// records are invented for testing - they are not real people or real ABHA IDs.
type Entry = {
  profile: AbhaProfile;
  records: HealthRecord[];
  conditions: ChronicCondition[];
  allergies: Allergy[];
};

const mk = (
  abhaNumber: string,
  abhaAddress: string,
  fullName: string,
  gender: AbhaProfile['gender'],
  dateOfBirth: string,
  mobileNumber: string,
  bloodGroup: string,
  line: string,
  district: string,
  pincode: string,
  emergency: [string, string, string],
  conditions: ChronicCondition[] = [],
  allergies: Allergy[] = [],
  records: HealthRecord[] = []
): Entry => ({
  profile: {
    abhaNumber,
    abhaAddress,
    fullName,
    gender,
    dateOfBirth,
    mobileNumber,
    bloodGroup,
    address: { line, district, state: 'Karnataka', pincode },
    emergencyContact: { name: emergency[0], relation: emergency[1], phone: emergency[2] },
    kycVerified: true,
  },
  conditions,
  allergies,
  records,
});

export const DEMO_ABHA_PROFILES: Record<string, Entry> = {
  '91-1001-2001-3001': mk(
    '91-1001-2001-3001', 'suresh.shetty@abdm', 'Suresh Shetty', 'MALE', '1968-03-22',
    '+91 90000 10001', 'O+', 'Main Road, Kundapura', 'Udupi', '576201',
    ['Lata Shetty', 'Spouse', '+91 90000 10011'],
    [{ id: 'c1', condition: 'Type 2 Diabetes Mellitus', diagnosedYear: 2015, status: 'ACTIVE',
       currentMedications: ['Metformin 500mg BID'], severityNote: 'Fasting sugar borderline high' }],
    [],
    [{ id: 'r1', date: '2026-07-10', category: 'LAB_REPORT', title: 'HbA1c and Fasting Sugar',
       facilityName: 'Taluk Government Hospital, Kundapura', doctorName: 'Lab Officer',
       details: 'HbA1c 7.6%. Fasting glucose 142 mg/dL.' }]
  ),
  '91-1002-2002-3002': mk(
    '91-1002-2002-3002', 'savitha.naik@abdm', 'Savitha Naik', 'FEMALE', '1991-11-05',
    '+91 90000 10002', 'A+', 'Near Bus Stand, Byndoor', 'Udupi', '576214',
    ['Ganesh Naik', 'Spouse', '+91 90000 10012'],
    [],
    [{ id: 'a1', allergen: 'Dust / Pollen', reaction: 'Sneezing and wheeze', severity: 'MILD' }]
  ),
  '91-1003-2003-3003': mk(
    '91-1003-2003-3003', 'mohammed.rafiq@abdm', 'Mohammed Rafiq', 'MALE', '1955-01-30',
    '+91 90000 10003', 'B+', 'Gangolli Port Road, Gangolli', 'Udupi', '576216',
    ['Ayesha Rafiq', 'Daughter', '+91 90000 10013'],
    [{ id: 'c1', condition: 'Essential Hypertension', diagnosedYear: 2012, status: 'MANAGED',
       currentMedications: ['Amlodipine 5mg OD'], severityNote: 'Average BP 142/90 mmHg' },
     { id: 'c2', condition: 'Osteoarthritis (Knee)', diagnosedYear: 2019, status: 'ACTIVE',
       currentMedications: ['Paracetamol as needed'] }],
    [{ id: 'a1', allergen: 'Aspirin', reaction: 'Gastric irritation', severity: 'MODERATE' }]
  ),
  '91-1004-2004-3004': mk(
    '91-1004-2004-3004', 'anjali.pai@abdm', 'Anjali Pai', 'FEMALE', '2016-08-17',
    '+91 90000 10004', 'AB+', 'Hebri Road, Karkala', 'Udupi', '574104',
    ['Ramesh Pai', 'Father', '+91 90000 10014'],
    [],
    [{ id: 'a1', allergen: 'Peanuts', reaction: 'Hives', severity: 'MODERATE' }],
    [{ id: 'r1', date: '2026-05-02', category: 'PRESCRIPTION', title: 'Childhood Vaccination Update',
       facilityName: 'Community Health Centre, Karkala', doctorName: 'Paediatrician on duty',
       details: 'Routine immunisation booster given. No adverse reaction.' }]
  ),
  '91-1005-2005-3005': mk(
    '91-1005-2005-3005', 'prakash.poojary@abdm', 'Prakash Poojary', 'MALE', '1983-12-09',
    '+91 90000 10005', 'O-', 'Malpe Beach Road, Malpe', 'Udupi', '576108',
    ['Rekha Poojary', 'Spouse', '+91 90000 10015'],
    [{ id: 'c1', condition: 'Chronic Lower Back Pain', diagnosedYear: 2021, status: 'ACTIVE',
       currentMedications: [], severityNote: 'Fisherman; worsens with heavy lifting' }]
  ),
};

export const DEMO_DEFAULT_LOGIN_ID = '91-1001-2001-3001';
