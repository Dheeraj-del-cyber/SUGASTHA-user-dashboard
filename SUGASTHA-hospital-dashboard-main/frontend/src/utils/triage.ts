import { TriageEvaluation, TriageLevel, Vitals, Hospital, Doctor } from '../types';

export interface SymptomInput {
  selectedSymptoms: string[];
  durationDays: number;
  painSeverity: number; // 1 to 10
  vitals?: Vitals;
  pastConditions: string[];
}

export const COMMON_SYMPTOMS = [
  { id: 'chest_pain', label: 'Severe Chest Pain / Pressure', labelHi: 'सीने में तेज दर्द या दबाव', highRisk: true, category: 'Cardiac / Emergency' },
  { id: 'dyspnea', label: 'Shortness of Breath / Wheezing', labelHi: 'सांस लेने में अत्यधिक तकलीफ', highRisk: true, category: 'Pulmonary' },
  { id: 'fever_high', label: 'High Fever (>102°F) with Chills', labelHi: 'तेज बुखार (>102°F) और कंपकंपी', highRisk: false, category: 'Infectious' },
  { id: 'severe_headache', label: 'Sudden Severe Headache / Vision Blur', labelHi: 'अचानक तेज सिरदर्द या धुंधला दिखना', highRisk: true, category: 'Neurological' },
  { id: 'abdominal_pain', label: 'Acute Abdominal Pain / Vomiting', labelHi: 'पेट में असहनीय दर्द / उल्टी', highRisk: false, category: 'Gastrointestinal' },
  { id: 'joint_swelling', label: 'Joint Pain & Swelling / Difficulty Walking', labelHi: 'जोड़ों में दर्द व सूजन / चलने में असमर्थ', highRisk: false, category: 'Orthopedics' },
  { id: 'skin_rash', label: 'Skin Rash / Itching / Lesions', labelHi: 'त्वचा पर चकत्ते / खुजली', highRisk: false, category: 'Dermatology' },
  { id: 'throat_pain', label: 'Sore Throat / Cough / Cold', labelHi: 'गले में खराश / सामान्य खांसी-जुकाम', highRisk: false, category: 'General' },
  { id: 'dizziness', label: 'Dizziness / Near Fainting', labelHi: 'चक्कर आना / बेहोशी जैसा लगना', highRisk: false, category: 'General' },
  { id: 'high_sugar_fatigue', label: 'Extreme Thirst / Frequent Urination / Fatigue', labelHi: 'अत्यधिक प्यास / बार-बार पेशाब / कमजोरी', highRisk: false, category: 'Endocrine' },
  { id: 'pregnancy_pain', label: 'Pregnancy Pain / Bleeding / Decreased Fetal Movement', labelHi: 'गर्भावस्था में दर्द / रक्तस्राव / हलचल में कमी', highRisk: true, category: 'Obstetrics' },
  { id: 'trauma_wound', label: 'Deep Cut / Bleeding / Suspected Fracture', labelHi: 'गहरी चोट / अत्यधिक खून बहना / फ्रैक्चर', highRisk: true, category: 'Trauma' }
];

export function evaluateTriage(input: SymptomInput): TriageEvaluation {
  const { selectedSymptoms, durationDays, painSeverity, vitals, pastConditions } = input;
  
  let score = 0;
  const matchedConditions: string[] = [];

  // 1. Critical Red Flag Symptoms
  const hasChestPain = selectedSymptoms.includes('chest_pain');
  const hasDyspnea = selectedSymptoms.includes('dyspnea');
  const hasSevereHeadache = selectedSymptoms.includes('severe_headache');
  const hasPregnancyEmergency = selectedSymptoms.includes('pregnancy_pain');
  const hasSevereTrauma = selectedSymptoms.includes('trauma_wound');

  if (hasChestPain) {
    score += 50;
    matchedConditions.push('Possible Acute Coronary Syndrome (ACS) / Myocardial Infarction');
  }
  if (hasDyspnea) {
    score += 40;
    matchedConditions.push('Acute Respiratory Distress / Severe Hypoxia Risk');
  }
  if (hasSevereHeadache) {
    score += 35;
    matchedConditions.push('Neurological Red Flag (Rule out Cerebrovascular Incident / Intracranial Pressure)');
  }
  if (hasPregnancyEmergency) {
    score += 45;
    matchedConditions.push('Obstetric Emergency (Immediate Fetal & Maternal Monitoring Required)');
  }
  if (hasSevereTrauma) {
    score += 45;
    matchedConditions.push('Acute Trauma / Hemorrhage');
  }

  // 2. Vitals Analysis
  if (vitals) {
    if (vitals.spO2 !== undefined && vitals.spO2 < 92) {
      score += 45;
      matchedConditions.push(`Hypoxemia (SpO2: ${vitals.spO2}% - Critical)`);
    }
    if (vitals.bloodPressureSystolic !== undefined && (vitals.bloodPressureSystolic > 180 || vitals.bloodPressureSystolic < 85)) {
      score += 40;
      matchedConditions.push(`Severe Blood Pressure Deviation (${vitals.bloodPressureSystolic} mmHg)`);
    }
    if (vitals.temperatureF !== undefined && vitals.temperatureF >= 103.5) {
      score += 25;
      matchedConditions.push(`High Hyperpyrexia (${vitals.temperatureF}°F)`);
    }
    if (vitals.heartRate !== undefined && (vitals.heartRate > 125 || vitals.heartRate < 45)) {
      score += 30;
      matchedConditions.push(`Arrhythmia / Tachycardia (${vitals.heartRate} bpm)`);
    }
  }

  // 3. Pain Severity
  if (painSeverity >= 8) {
    score += 20;
  } else if (painSeverity >= 5) {
    score += 10;
  }

  // 4. Past Chronic Comorbidities modifier
  const isHighRiskComorbid = pastConditions.some(c => 
    c.toLowerCase().includes('heart') || 
    c.toLowerCase().includes('diabetes') || 
    c.toLowerCase().includes('asthma') || 
    c.toLowerCase().includes('hypertension') ||
    c.toLowerCase().includes('kidney')
  );
  if (isHighRiskComorbid && (hasChestPain || hasDyspnea || selectedSymptoms.includes('fever_high'))) {
    score += 20;
    matchedConditions.push('Comorbidity Exacerbation (High-Risk Chronic Condition Background)');
  }

  // 5. Determine Triage Category
  if (score >= 60 || hasChestPain || (vitals?.spO2 && vitals.spO2 < 90) || hasPregnancyEmergency) {
    return {
      color: 'RED',
      levelName: 'RED (Level 1 - Immediate Resuscitation / Emergency)',
      score,
      rationale: 'Severe acute physiological distress or critical red-flag symptoms detected. Immediate emergency department stabilization required.',
      recommendedAction: 'Immediate In-Person Emergency Department OPD / Ambulance Dispatch. Priority #1 Bypass Queue.',
      urgencyTimeframe: 'Immediate (0 - 15 minutes)',
      matchedConditions: matchedConditions.length > 0 ? matchedConditions : ['Acute Severe Distress']
    };
  } else if (score >= 25 || selectedSymptoms.includes('abdominal_pain') || selectedSymptoms.includes('fever_high') || durationDays > 4) {
    return {
      color: 'YELLOW',
      levelName: 'YELLOW (Level 2 - Urgent Clinical Assessment)',
      score,
      rationale: 'Significant symptoms requiring urgent medical evaluation to prevent acute deterioration. Suitable for fast-track government OPD.',
      recommendedAction: 'Urgent Same-Day In-Person OPD or expedited eSanjeevani Teleconsultation.',
      urgencyTimeframe: 'Within 2 - 4 hours',
      matchedConditions: matchedConditions.length > 0 ? matchedConditions : ['Moderate Acute Symptoms', 'Prolonged illness duration']
    };
  } else {
    return {
      color: 'GREEN',
      levelName: 'GREEN (Level 3 - Routine / Non-Urgent Care)',
      score,
      rationale: 'Mild, stable symptoms with normal vital ranges. Suitable for routine PHC / CHC OPD or immediate eSanjeevani Teleconsultation.',
      recommendedAction: 'eSanjeevani Teleconsultation (Recommended from home) OR Scheduled Next-Day OPD Slot.',
      urgencyTimeframe: 'Routine (Within 24 - 48 hours)',
      matchedConditions: matchedConditions.length > 0 ? matchedConditions : ['Standard OPD Protocol']
    };
  }
}

/**
 * Smart Multi-Factor Hospital Matching Engine
 */
export function rankFacilities(
  hospitals: Hospital[],
  doctors: Doctor[],
  triageLevel: TriageLevel,
  requiredSpecialty?: string
): { hospital: Hospital; matchedDoctors: Doctor[]; suitabilityScore: number; recommendationReason: string }[] {
  return hospitals.map(h => {
    let suitabilityScore = 100;
    
    // Distance penalty (-3 points per km)
    suitabilityScore -= Math.min(45, h.distanceKm * 2.5);

    // OPD Queue load penalty
    const loadRatio = h.opdActiveQueue / Math.max(1, h.opdCapacity);
    if (loadRatio > 0.85) suitabilityScore -= 20;
    else if (loadRatio < 0.5) suitabilityScore += 10;

    // Emergency capability boost for RED triage
    if (triageLevel === 'RED') {
      if (h.emergencyAvailable && h.icuBedsAvailable > 0) suitabilityScore += 35;
      else suitabilityScore -= 40;
    }

    // Matching Doctors with AEBAS Biometric Check-in
    const hospitalDocs = doctors.filter(d => h.doctorIds.includes(d.id));
    const matchedDocs = requiredSpecialty 
      ? hospitalDocs.filter(d => d.specialty.toLowerCase().includes(requiredSpecialty.toLowerCase()))
      : hospitalDocs;

    const availableDocs = matchedDocs.filter(d => d.aebasStatus === 'ON_DUTY' || d.aebasStatus === 'IN_OPD');
    if (availableDocs.length > 0) {
      suitabilityScore += 20;
    } else {
      suitabilityScore -= 30;
    }

    let recommendationReason = 'Optimal balance of specialist doctor on-duty, low OPD queue, and proximity.';
    if (triageLevel === 'RED' && h.icuBedsAvailable > 0) {
      recommendationReason = `Emergency Trauma Ready with ${h.icuBedsAvailable} available ICU beds and on-duty resuscitation team.`;
    } else if (h.distanceKm < 4) {
      recommendationReason = `Closest government facility (${h.distanceKm} km) with nominal travel cost (₹${h.travelCostInr}).`;
    } else if (availableDocs.length > 0) {
      recommendationReason = `Specialist Dr. ${availableDocs[0].name} is currently verified On-Duty via AEBAS biometric.`;
    }

    return {
      hospital: h,
      matchedDoctors: matchedDocs.length > 0 ? matchedDocs : hospitalDocs,
      suitabilityScore: Math.max(10, Math.min(99, Math.round(suitabilityScore))),
      recommendationReason
    };
  }).sort((a, b) => b.suitabilityScore - a.suitabilityScore);
}
