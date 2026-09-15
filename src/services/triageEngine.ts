import { SymptomInput, ChronicCondition, HealthRecord, Allergy, TriageResult, ClinicalFactor, TriageLevel } from '../types';

export const triageEngine = {
  /**
   * Evaluates patient symptoms alongside historical ABHA records.
   * Classifies into GREEN, YELLOW, or RED triage level automatically.
   */
  evaluateTriage(
    symptoms: SymptomInput,
    chronicConditions: ChronicCondition[],
    pastRecords: HealthRecord[],
    allergies: Allergy[]
  ): TriageResult {
    const factors: ClinicalFactor[] = [];
    const warningFlags: string[] = [];
    let severityScore = 0; // 0 to 100

    const symptomText = symptoms.primarySymptoms.join(' ').toLowerCase() + ' ' + symptoms.additionalNotes.toLowerCase();

    // 1. Check for Emergency Red Flags
    const hasChestPain = /chest|angina|cardiac|heart|pressure in chest/.test(symptomText) || !!symptoms.hasRedFlags.chestPressure;
    const hasBreathlessness = /breath|dyspnea|gasping|suffocat|shortness of breath/.test(symptomText) || !!symptoms.hasRedFlags.difficultyBreathing;
    const hasUnconsciousness = /faint|syncope|unconscious|blackout|seizure/.test(symptomText) || !!symptoms.hasRedFlags.lossOfConsciousness;
    const hasStrokeSigns = /paralysis|slurred speech|facial droop|sudden numbness/.test(symptomText) || !!symptoms.hasRedFlags.suddenWeakness;
    const hasSevereBleeding = /heavy bleed|hemorrhage|coughing blood|vomiting blood/.test(symptomText) || !!symptoms.hasRedFlags.severeBleeding;
    const hasHighFeverChills = /high fever|rigors|extreme shivering/.test(symptomText) || !!symptoms.hasRedFlags.feverWithChills;

    // 2. Cross-reference ABHA Chronic History
    const hasCardiacHistory = chronicConditions.some((c) =>
      /hyper|cardio|heart|coronary|angina|infarct/i.test(c.condition)
    );
    const hasDiabeticHistory = chronicConditions.some((c) =>
      /diabet|sugar|hba1c/i.test(c.condition)
    );
    const hasRespiratoryHistory = chronicConditions.some((c) =>
      /asthma|copd|bronchitis|respiratory/i.test(c.condition)
    );

    // Evaluate Factors & Score
    if (hasChestPain) {
      severityScore += 45;
      factors.push({
        title: 'Acute Chest Discomfort / Pressure',
        impact: 'CRITICAL',
        description: 'Reported chest pain or thoracic tightness is an immediate emergency indicator requiring exclusion of Acute Coronary Syndrome.',
        source: 'CURRENT_SYMPTOMS',
      });
      warningFlags.push('Cardiac Event Risk');
    }

    if (hasBreathlessness) {
      severityScore += 35;
      factors.push({
        title: 'Respiratory Distress',
        impact: 'CRITICAL',
        description: 'Shortness of breath indicates impaired respiratory drive or cardiogenic pulmonary congestion.',
        source: 'CURRENT_SYMPTOMS',
      });
      warningFlags.push('Respiratory Compromise');
    }

    if (hasUnconsciousness || hasStrokeSigns || hasSevereBleeding) {
      severityScore += 50;
      factors.push({
        title: 'Neurological / Acute Hemorrhagic Red Flag',
        impact: 'CRITICAL',
        description: 'Loss of consciousness, focal neurological deficit, or severe bleeding demands urgent emergency resuscitation.',
        source: 'CURRENT_SYMPTOMS',
      });
      warningFlags.push('Urgent Resuscitation Indicator');
    }

    // Chronic Risk Escalation from ABHA Records
    if (hasChestPain && (hasCardiacHistory || hasDiabeticHistory)) {
      severityScore += 25;
      factors.push({
        title: 'High-Risk ABHA Comorbidity Multiplier',
        impact: 'CRITICAL',
        description: `Patient has verified ABHA records indicating ${hasCardiacHistory ? 'Hypertension/Cardiovascular disease' : ''} ${hasDiabeticHistory ? '& Type 2 Diabetes' : ''}. Diabetics frequently experience atypical or silent myocardial ischemia.`,
        source: 'ABHA_CHRONIC_HISTORY',
      });
      warningFlags.push('Diabetic / Hypertensive Cardiac Risk Multiplier');
    }

    if (hasBreathlessness && hasRespiratoryHistory) {
      severityScore += 20;
      factors.push({
        title: 'Pre-existing Chronic Respiratory Condition',
        impact: 'MODERATE',
        description: 'Patient medical history records underlying chronic airway vulnerability, elevating the likelihood of acute exacerbation.',
        source: 'ABHA_CHRONIC_HISTORY',
      });
    }

    // Pain scale contribution
    if (symptoms.painScale >= 8) {
      severityScore += 20;
      factors.push({
        title: `Severe Pain Score (${symptoms.painScale}/10)`,
        impact: 'CRITICAL',
        description: 'Intense subjective pain level indicates significant acute pathology requiring immediate medical analgesia and workup.',
        source: 'CURRENT_SYMPTOMS',
      });
    } else if (symptoms.painScale >= 5) {
      severityScore += 10;
      factors.push({
        title: `Moderate Pain Score (${symptoms.painScale}/10)`,
        impact: 'MODERATE',
        description: 'Noticeable discomfort impacting daily activities.',
        source: 'CURRENT_SYMPTOMS',
      });
    }

    // Past Records Evaluation (e.g. recent abnormal lab flags)
    const recentAbnormalLabs = pastRecords.filter(
      (r) => r.criticalFlags && r.criticalFlags.length > 0
    );
    if (recentAbnormalLabs.length > 0) {
      factors.push({
        title: 'Corroborating Lab Flags in ABHA Health Records',
        impact: 'MODERATE',
        description: `Verified historical records show: ${recentAbnormalLabs[0].criticalFlags?.join(', ')}.`,
        source: 'PAST_RECORDS',
      });
    }

    // Allergy check
    if (allergies.length > 0) {
      factors.push({
        title: `Known Drug Allergies (${allergies.map((a) => a.allergen).join(', ')})`,
        impact: 'INFO',
        description: 'Allergy flags registered in ABHA record will be transmitted with consultation to avoid adverse contraindications.',
        source: 'ABHA_CHRONIC_HISTORY',
      });
    }

    // Duration weighting
    if (symptoms.durationDays > 7 && severityScore < 30) {
      severityScore += 15;
      factors.push({
        title: `Subacute Symptom Duration (${symptoms.durationDays} days)`,
        impact: 'MODERATE',
        description: 'Symptoms persisting beyond a week warrant physical clinical examination and targeted diagnostic testing.',
        source: 'CURRENT_SYMPTOMS',
      });
    }

    // 3. Final Triage Level Determination
    let level: TriageLevel = 'GREEN';
    let urgencyWindow = 'Routine / 24-48 Hours';
    let recommendedRoute: 'HOSPITAL_VISIT' | 'TELECONSULTATION' = 'TELECONSULTATION';
    let category = 'Mild / Ambulatory Care';
    let title = 'Low Priority - Green';
    let summary = 'Your symptoms and past medical history indicate a mild, non-emergency condition that can be effectively managed through remote teleconsultation.';
    const suggestedSpecialties: string[] = ['General Physician', 'Family Medicine'];

    if (severityScore >= 60 || hasChestPain || hasUnconsciousness || hasStrokeSigns || hasSevereBleeding) {
      level = 'RED';
      urgencyWindow = 'Immediate Emergency (0 - 1 Hour)';
      recommendedRoute = 'HOSPITAL_VISIT';
      category = 'High Emergency Priority - Immediate Medical Attention';
      title = 'Emergency / High Priority - RED';
      summary = 'URGENT: Your current symptoms, combined with your ABHA-linked health history, exhibit high-risk clinical markers. Immediate in-person hospital evaluation is strongly advised.';
      if (hasChestPain || hasCardiacHistory) {
        suggestedSpecialties.unshift('Cardiology & Emergency Medicine', 'Critical Care');
      } else if (hasStrokeSigns) {
        suggestedSpecialties.unshift('Neurology & Stroke Care', 'Emergency Medicine');
      } else {
        suggestedSpecialties.unshift('Emergency & Trauma Care');
      }
    } else if (severityScore >= 25 || symptoms.painScale >= 5 || symptoms.durationDays >= 4 || hasHighFeverChills) {
      level = 'YELLOW';
      urgencyWindow = 'Moderate Priority (Within 4 - 12 Hours)';
      recommendedRoute = 'HOSPITAL_VISIT';
      category = 'Moderate Priority - Physical Clinical Evaluation';
      title = 'Moderate Priority - YELLOW';
      summary = 'Your condition requires direct clinical evaluation and potentially physical diagnostic examinations (e.g. vitals, bloodwork, imaging) at a nearby hospital or clinic.';
      if (/skin|rash|itching/.test(symptomText)) {
        suggestedSpecialties.unshift('Dermatology');
      } else if (/stomach|abdomen|vomit|nausea/.test(symptomText)) {
        suggestedSpecialties.unshift('Gastroenterology', 'General Surgery');
      } else if (/cough|fever|throat|flu/.test(symptomText)) {
        suggestedSpecialties.unshift('Internal Medicine', 'Pulmonology');
      }
    } else {
      level = 'GREEN';
      urgencyWindow = 'Elective / Teleconsultation Today';
      recommendedRoute = 'TELECONSULTATION';
      category = 'Low Priority - Teleconsultation Recommended';
      title = 'Low Priority - GREEN';
      summary = 'Your reported symptoms are stable and can be safely addressed via government eSanjeevani teleconsultation from home, avoiding unnecessary travel and hospital waiting queues.';
    }

    return {
      level,
      title,
      category,
      summary,
      urgencyWindow,
      recommendedRoute,
      clinicalFactors: factors,
      suggestedSpecialties,
      vitalsRiskScore: Math.min(100, Math.max(10, severityScore)),
      warningFlags,
    };
  },
};
