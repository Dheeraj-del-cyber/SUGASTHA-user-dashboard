import { AbhaProfile, HealthRecord, ChronicCondition, Allergy } from '../types';

export const MOCK_ABHA_PROFILES: Record<string, {
  profile: AbhaProfile;
  records: HealthRecord[];
  conditions: ChronicCondition[];
  allergies: Allergy[];
}> = {
  '91-4523-8901-2345': {
    profile: {
      abhaNumber: '91-4523-8901-2345',
      abhaAddress: 'rajesh.verma@abdm',
      fullName: 'Rajesh Kumar Verma',
      gender: 'MALE',
      dateOfBirth: '1974-06-14',
      mobileNumber: '+91 98765 43210',
      email: 'rajesh.verma74@gmail.com',
      bloodGroup: 'B+',
      address: {
        line: 'Flat 402, Nilgiri Heights, Sector 18',
        district: 'New Delhi',
        state: 'Delhi',
        pincode: '110001',
      },
      emergencyContact: {
        name: 'Sunita Verma',
        relation: 'Spouse',
        phone: '+91 98765 43211',
      },
      kycVerified: true,
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    },
    conditions: [
      {
        id: 'cond-1',
        condition: 'Type 2 Diabetes Mellitus',
        diagnosedYear: 2018,
        status: 'ACTIVE',
        currentMedications: ['Metformin 500mg BID', 'Glimepiride 1mg OD'],
        severityNote: 'HbA1c elevated at last check (8.1%)',
      },
      {
        id: 'cond-2',
        condition: 'Essential Hypertension (Stage 1)',
        diagnosedYear: 2020,
        status: 'MANAGED',
        currentMedications: ['Telmisartan 40mg OD'],
        severityNote: 'Average BP 138/88 mmHg',
      },
    ],
    allergies: [
      {
        id: 'alg-1',
        allergen: 'Penicillin / Beta-lactams',
        reaction: 'Urticaria and facial angioedema',
        severity: 'SEVERE',
      },
      {
        id: 'alg-2',
        allergen: 'Sulfonamides',
        reaction: 'Skin rash & pruritus',
        severity: 'MODERATE',
      },
    ],
    records: [
      {
        id: 'rec-101',
        date: '2026-06-20',
        category: 'DIAGNOSIS',
        title: 'Quarterly Diabetic & Cardio Evaluation',
        facilityName: 'AIIMS Heart & Diabetes Centre, New Delhi',
        doctorName: 'Dr. Anandita Roy, MD (Cardiology)',
        details: 'Patient reported occasional exertional heaviness in chest. Resting ECG was borderline normal with mild sinus tachycardia. Advised lifestyle management and stress echo if symptoms persist.',
        criticalFlags: ['Elevated cardiovascular risk profile', 'Metabolic syndrome'],
      },
      {
        id: 'rec-102',
        date: '2026-05-12',
        category: 'LAB_REPORT',
        title: 'Comprehensive Metabolic Panel & Lipid Profile',
        facilityName: 'Dr. Lal PathLabs, Connaught Place',
        doctorName: 'Dr. S. K. Gupta, Pathologist',
        details: 'Fasting Blood Sugar: 168 mg/dL (High). HbA1c: 8.1% (Suboptimal control). LDL Cholesterol: 142 mg/dL. Serum Creatinine: 1.0 mg/dL.',
        attachments: [
          { name: 'Lipid_Panel_Report_May2026.pdf', type: 'application/pdf', size: '1.4 MB' },
        ],
      },
      {
        id: 'rec-103',
        date: '2025-11-04',
        category: 'PRESCRIPTION',
        title: 'Antihypertensive Adjustment',
        facilityName: 'Max Super Speciality Hospital, Saket',
        doctorName: 'Dr. Vikram Malhotra, MD (Internal Medicine)',
        details: 'Telmisartan increased from 20mg to 40mg once daily morning. Patient advised low-sodium diet and home BP monitoring log.',
      },
      {
        id: 'rec-104',
        date: '2023-08-15',
        category: 'SURGERY',
        title: 'Laparoscopic Cholecystectomy',
        facilityName: 'Fortis Escorts, Okhla Road',
        doctorName: 'Dr. Pradeep Bansal, MS (Gen Surgery)',
        details: 'Elective removal of gallbladder for symptomatic cholelithiasis. Uneventful recovery. Histopathology benign.',
      },
    ],
  },
  '91-7890-1234-5678': {
    profile: {
      abhaNumber: '91-7890-1234-5678',
      abhaAddress: 'ananya.sen@abdm',
      fullName: 'Ananya Sen',
      gender: 'FEMALE',
      dateOfBirth: '1998-03-22',
      mobileNumber: '+91 98111 22334',
      email: 'ananya.sen98@outlook.com',
      bloodGroup: 'O+',
      address: {
        line: 'A-12, Green Park Extension',
        district: 'South Delhi',
        state: 'Delhi',
        pincode: '110016',
      },
      emergencyContact: {
        name: 'Debashis Sen',
        relation: 'Father',
        phone: '+91 98111 22335',
      },
      kycVerified: true,
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    },
    conditions: [
      {
        id: 'cond-3',
        condition: 'Mild Allergic Rhinitis',
        diagnosedYear: 2021,
        status: 'ACTIVE',
        currentMedications: ['Levocetirizine 5mg PRN'],
      },
    ],
    allergies: [
      {
        id: 'alg-3',
        allergen: 'Dust Mites & Pollen',
        reaction: 'Sneezing, nasal congestion',
        severity: 'MILD',
      },
    ],
    records: [
      {
        id: 'rec-201',
        date: '2026-01-15',
        category: 'LAB_REPORT',
        title: 'Routine Health Checkup & CBC',
        facilityName: 'Apollo Diagnostics, Hauz Khas',
        doctorName: 'Dr. Reena Joseph, Pathologist',
        details: 'Hemoglobin: 12.8 g/dL. Total Leukocyte Count: 6,400 /uL. Platelets: 240,000 /uL. All parameters within normal biological reference intervals.',
      },
    ],
  },
};

export const DEFAULT_ABHA_NUMBER = '91-4523-8901-2345';
