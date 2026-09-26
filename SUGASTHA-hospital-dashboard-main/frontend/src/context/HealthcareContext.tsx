import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import {
  PortalType,
  Language,
  UserPatient,
  Hospital,
  Doctor,
  AshaWorker,
  Appointment,
  VoiceTask,
  SystemEventLog,
  ConsultationSummary,
  TriageLevel,
  ReferralSource,
  Vitals
} from '../types';
import {
  INITIAL_PATIENTS,
  INITIAL_HOSPITALS,
  INITIAL_DOCTORS,
  INITIAL_ASHA_WORKERS,
  INITIAL_APPOINTMENTS,
  INITIAL_VOICE_TASKS,
  INITIAL_EVENT_LOGS
} from '../data/mockData';
import {
  playHospitalChime,
  playSuccessBeep,
  playEmergencyAlarm,
  announceVoice
} from '../utils/audio';
import confetti from 'canvas-confetti';
import { api } from '../services/api';

interface FallbackTimerState {
  appointmentId: string;
  candidateHospitals: Hospital[];
  currentHospitalIndex: number;
  secondsRemaining: number;
  totalTimeoutSeconds: number;
  reason: string;
}

interface HealthcareContextType {
  isAuthenticated: boolean;
  login: (id: string, pass: string) => boolean;
  logout: () => void;
  // Dashboard Tab Navigation
  activeTab: 'OPD' | 'DOCTORS';
  setActiveTab: (tab: 'OPD' | 'DOCTORS') => void;
  // Navigation & UI Settings
  portal: PortalType;
  setPortal: (p: PortalType) => void;
  lang: Language;
  setLang: (l: Language) => void;
  highContrast: boolean;
  setHighContrast: (v: boolean | ((prev: boolean) => boolean)) => void;
  fontSize: 'normal' | 'large' | 'xlarge';
  setFontSize: (s: 'normal' | 'large' | 'xlarge') => void;
  soundEnabled: boolean;
  setSoundEnabled: (v: boolean | ((prev: boolean) => boolean)) => void;

  // Active Entities
  currentUser: UserPatient;
  setCurrentUser: (u: UserPatient) => void;
  allPatients: UserPatient[];
  currentHospitalId: string;
  setCurrentHospitalId: (id: string) => void;
  currentAshaId: string;
  setCurrentAshaId: (id: string) => void;

  // Collections
  hospitals: Hospital[];
  doctors: Doctor[];
  ashas: AshaWorker[];
  appointments: Appointment[];
  voiceTasks: VoiceTask[];
  eventLogs: SystemEventLog[];

  // Fallback Engine State
  activeFallback: FallbackTimerState | null;

  // Core Orchestration Actions
  bookAppointmentWithSmartFallback: (params: {
    abhaId: string;
    patientName: string;
    patientPhone: string;
    age: number;
    gender: 'M' | 'F' | 'Other';
    triageColor: TriageLevel;
    triageReason: string;
    symptoms: string[];
    vitals?: Vitals;
    referralSource: ReferralSource;
    referralByAshaName?: string;
    candidateHospitals: Hospital[];
    department: string;
  }) => Appointment;

  acceptAppointment: (appointmentId: string) => void;
  rejectAppointmentAndEscalate: (appointmentId: string, rejectReason?: string) => void;
  checkInPatientByCode: (qrOrPin: string) => { success: boolean; message: string; appointment?: Appointment };
  submitDoctorConsultation: (appointmentId: string, summary: ConsultationSummary) => void;
  createAshaPhcReferral: (params: {
    patient: UserPatient;
    triageColor: TriageLevel;
    triageReason: string;
    symptoms: string[];
    vitals?: Vitals;
    selectedHospital: Hospital;
    department: string;
    selectedDoctor?: Doctor;
  }) => Appointment;
  submitVoiceNoteFallback: (params: {
    callerPhone: string;
    callerName?: string;
    village: string;
    transcription: string;
    transcriptionHindi: string;
    extractedSymptoms: string[];
    urgency: TriageLevel;
  }) => VoiceTask;
  claimVoiceTask: (taskId: string, ashaId: string) => void;
  convertVoiceTaskToAppointment: (taskId: string, hospitalId: string, department: string) => Appointment | null;
  addEventLog: (log: Omit<SystemEventLog, 'id' | 'timestamp'>) => void;
  triggerEdgeCaseDemo: (caseId: 'hospital_timeout' | 'asha_cascade' | 'voice_stt' | 'capacity_overload') => void;
  editDoctor: (doctorId: string, updates: Partial<Doctor>) => void;
  addDoctor: (doctor: Doctor) => void;
  removeDoctor: (doctorId: string) => void;
}

const HealthcareContext = createContext<HealthcareContextType | undefined>(undefined);

export const HealthcareProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Authentication
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  const login = useCallback((id: string, pass: string) => {
    // Master admin override (sees all hospitals)
    if (id === 'admin' && pass === 'password123') {
      setIsAuthenticated(true);
      return true;
    }
    // Per-hospital login: each hospital has its own Hospital ID + password
    const matchedHospital = INITIAL_HOSPITALS.find(
      h => h.loginId.toLowerCase() === id.trim().toLowerCase() && h.password === pass
    );
    if (matchedHospital) {
      setIsAuthenticated(true);
      setCurrentHospitalId(matchedHospital.id);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
  }, []);

  // Dashboard Tab State
  const [activeTab, setActiveTab] = useState<'OPD' | 'DOCTORS'>('OPD');

  // Navigation & Settings
  const [portal, setPortal] = useState<PortalType>('hospital');
  const [lang, setLang] = useState<Language>('en');
  const [highContrast, setHighContrast] = useState<boolean>(false);
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Entities & Master State
  const [allPatients, setAllPatients] = useState<UserPatient[]>(() => {
    const saved = localStorage.getItem('sugastha_patients');
    return saved ? JSON.parse(saved) : INITIAL_PATIENTS;
  });
  const [currentUser, setCurrentUser] = useState<UserPatient>(allPatients[0]);
  const [hospitals, setHospitals] = useState<Hospital[]>(INITIAL_HOSPITALS);
  const [doctors, setDoctors] = useState<Doctor[]>(INITIAL_DOCTORS);
  const [ashas, setAshas] = useState<AshaWorker[]>(INITIAL_ASHA_WORKERS);
  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const saved = localStorage.getItem('sugastha_appointments');
    return saved ? JSON.parse(saved) : INITIAL_APPOINTMENTS;
  });
  const [voiceTasks, setVoiceTasks] = useState<VoiceTask[]>(() => {
    const saved = localStorage.getItem('sugastha_voice_tasks');
    return saved ? JSON.parse(saved) : INITIAL_VOICE_TASKS;
  });
  const [eventLogs, setEventLogs] = useState<SystemEventLog[]>(INITIAL_EVENT_LOGS);

  const [currentHospitalId, setCurrentHospitalId] = useState<string>(INITIAL_HOSPITALS[0].id);
  const [currentAshaId, setCurrentAshaId] = useState<string>(INITIAL_ASHA_WORKERS[0].id);

  // Automated Fallback Engine Timer State
  const [activeFallback, setActiveFallback] = useState<FallbackTimerState | null>(null);

  // Persist key state
  useEffect(() => {
    localStorage.setItem('sugastha_patients', JSON.stringify(allPatients));
  }, [allPatients]);

  useEffect(() => {
    localStorage.setItem('sugastha_appointments', JSON.stringify(appointments));
  }, [appointments]);

  useEffect(() => {
    localStorage.setItem('sugastha_voice_tasks', JSON.stringify(voiceTasks));
  }, [voiceTasks]);

  // Sync with live FastAPI backend on startup, then keep polling so new
  // appointments booked from the citizen app (or another hospital session)
  // show up without the staff needing to reload the page.
  useEffect(() => {
    let isMounted = true;
    const fetchBackendData = async () => {
      try {
        const isHealthy = await api.checkHealth();
        if (isHealthy && isMounted) {
          const [backendHospitals, backendDoctors, backendAppointments] = await Promise.all([
            api.getHospitals().catch(() => null),
            api.getDoctors().catch(() => null),
            api.getAppointments().catch(() => null)
          ]);

          if (backendHospitals && backendHospitals.length > 0 && isMounted) {
            setHospitals(backendHospitals);
          }
          if (backendDoctors && backendDoctors.length > 0 && isMounted) {
            setDoctors(backendDoctors);
          }
          if (backendAppointments && backendAppointments.length > 0 && isMounted) {
            setAppointments(backendAppointments);
          }
        }
      } catch (e) {
        console.warn('Backend unavailable, running with local resilience state', e);
      }
    };
    fetchBackendData();
    const pollInterval = window.setInterval(fetchBackendData, 15000);
    return () => { isMounted = false; window.clearInterval(pollInterval); };
  }, []);

  // Audio helper
  const triggerSound = useCallback((type: 'chime' | 'beep' | 'emergency') => {
    if (!soundEnabled) return;
    if (type === 'chime') playHospitalChime();
    else if (type === 'beep') playSuccessBeep();
    else if (type === 'emergency') playEmergencyAlarm();
  }, [soundEnabled]);

  // Add system event log
  const addEventLog = useCallback((log: Omit<SystemEventLog, 'id' | 'timestamp'>) => {
    const newLog: SystemEventLog = {
      ...log,
      id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' IST'
    };
    setEventLogs(prev => [newLog, ...prev.slice(0, 49)]);
  }, []);

  // Central Dispatch: Book Appointment with automated hospital cascade fallback
  const bookAppointmentWithSmartFallback = useCallback((params: {
    abhaId: string;
    patientName: string;
    patientPhone: string;
    age: number;
    gender: 'M' | 'F' | 'Other';
    triageColor: TriageLevel;
    triageReason: string;
    symptoms: string[];
    vitals?: Vitals;
    referralSource: ReferralSource;
    referralByAshaName?: string;
    candidateHospitals: Hospital[];
    department: string;
  }): Appointment => {
    const primaryHospital = params.candidateHospitals[0] || hospitals[0];
    const hospitalDocs = doctors.filter(d => primaryHospital.doctorIds.includes(d.id));
    const assignedDoc = hospitalDocs[0] || doctors[0];

    const randomPin = Math.floor(100000 + Math.random() * 900000).toString();
    const tokenNum = `${primaryHospital.type === 'AIIMS / Apex' ? 'AIIMS' : 'SGH'}-${params.department.substring(0, 3).toUpperCase()}-${Math.floor(10 + Math.random() * 90)}`;
    const appointmentId = `apt-${Date.now()}`;

    const newAppointment: Appointment = {
      id: appointmentId,
      tokenNo: tokenNum,
      abhaId: params.abhaId,
      patientName: params.patientName,
      patientPhone: params.patientPhone,
      age: params.age,
      gender: params.gender,
      hospitalId: primaryHospital.id,
      hospitalName: primaryHospital.name,
      department: params.department,
      doctorId: assignedDoc.id,
      doctorName: assignedDoc.name,
      roomNo: assignedDoc.roomNo,
      triageColor: params.triageColor,
      triageReason: params.triageReason,
      symptoms: params.symptoms,
      vitals: params.vitals,
      status: 'PENDING_ACCEPTANCE',
      referralSource: params.referralSource,
      referralByAshaName: params.referralByAshaName,
      qrCodeData: `SUGASTHA-SECURE-TOKEN-${tokenNum}-${params.abhaId}-PIN-${randomPin}`,
      pinCode: randomPin,
      timestamp: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
      slotTime: params.triageColor === 'RED' ? 'IMMEDIATE EMERGENCY' : 'Today 11:30 AM - 12:30 PM',
      fallbackCascadeTrail: [`${primaryHospital.name} (Request Dispatched)`]
    };

    setAppointments(prev => [newAppointment, ...prev]);

    addEventLog({
      source: params.referralSource === 'SELF_APP' ? 'PATIENT_APP' : 'ASHA_PORTAL',
      type: 'DISPATCH_TO_HOSPITAL',
      title: `OPD Request Dispatched ➔ ${primaryHospital.name}`,
      detail: `Token #${tokenNum} for ${params.patientName} (${params.triageColor} Triage). Auto-acceptance timer active (12s timeout).`,
      abdmTransactionHash: `0x${Math.random().toString(16).substring(2, 12).toUpperCase()}`,
      severity: params.triageColor === 'RED' ? 'CRITICAL' : 'INFO'
    });

    if (params.triageColor === 'RED') {
      triggerSound('emergency');
    }

    // Start automated hospital fallback countdown timer
    setActiveFallback({
      appointmentId,
      candidateHospitals: params.candidateHospitals.length > 0 ? params.candidateHospitals : hospitals,
      currentHospitalIndex: 0,
      secondsRemaining: 12,
      totalTimeoutSeconds: 12,
      reason: 'Awaiting Hospital OPD desk acceptance confirmation...'
    });

    // Sync appointment to backend database
    api.createAppointment({
      id: newAppointment.id,
      token_no: newAppointment.tokenNo,
      abha_id: newAppointment.abhaId,
      patient_name: newAppointment.patientName,
      patient_phone: newAppointment.patientPhone,
      age: newAppointment.age,
      gender: newAppointment.gender,
      hospital_id: newAppointment.hospitalId,
      hospital_name: newAppointment.hospitalName,
      department: newAppointment.department,
      doctor_id: newAppointment.doctorId,
      doctor_name: newAppointment.doctorName,
      room_no: newAppointment.roomNo,
      triage_color: newAppointment.triageColor,
      triage_reason: newAppointment.triageReason,
      symptoms: newAppointment.symptoms,
      vitals: newAppointment.vitals,
      status: newAppointment.status,
      referral_source: newAppointment.referralSource,
      referral_by_asha_name: newAppointment.referralByAshaName,
      qr_code_data: newAppointment.qrCodeData,
      pin_code: newAppointment.pinCode,
      slot_time: newAppointment.slotTime,
      fallback_cascade_trail: newAppointment.fallbackCascadeTrail
    }).catch(err => console.warn('Backend appointment sync error:', err));

    return newAppointment;
  }, [doctors, hospitals, addEventLog, triggerSound]);

  // Reject Appointment & Escalate immediately to next available facility
  const rejectAppointmentAndEscalate = useCallback((appointmentId: string, rejectReason: string = 'OPD Capacity Overload / Specialist in Emergency') => {
    // Sync escalation with backend
    api.escalateAppointment(appointmentId, rejectReason).catch(err => console.warn('Backend escalation error:', err));

    setAppointments(prev => {
      const apt = prev.find(a => a.id === appointmentId);
      if (!apt) return prev;

      const currentHospIndex = hospitals.findIndex(h => h.id === apt.hospitalId);
      const nextHosp = hospitals[(currentHospIndex + 1) % hospitals.length];
      const nextDoc = doctors.find(d => nextHosp.doctorIds.includes(d.id)) || doctors[0];

      const updatedTrail = [
        ...apt.fallbackCascadeTrail,
        `❌ ${apt.hospitalName} Rejected (${rejectReason})`,
        `⚡ Auto-Escalated to ${nextHosp.name} (Slot Confirmed)`
      ];

      addEventLog({
        source: 'FALLBACK_ENGINE',
        type: 'HOSPITAL_CASCADE_FALLBACK',
        title: `Automatic Hospital Cascade: ${apt.hospitalName} ➔ ${nextHosp.name}`,
        detail: `Hospital A unavailable. System automatically identified next suitable facility with available doctors and low load. Confirmed Token #${apt.tokenNo}.`,
        abdmTransactionHash: `0xCASCADE_${Math.random().toString(16).substring(2, 10).toUpperCase()}`,
        severity: 'WARNING'
      });

      triggerSound('chime');

      return prev.map(a => a.id === appointmentId ? {
        ...a,
        hospitalId: nextHosp.id,
        hospitalName: nextHosp.name,
        doctorId: nextDoc.id,
        doctorName: nextDoc.name,
        roomNo: nextDoc.roomNo,
        status: 'ACCEPTED',
        fallbackCascadeTrail: updatedTrail
      } : a);
    });

    setActiveFallback(null);
  }, [hospitals, doctors, addEventLog, triggerSound]);

  // Accept Appointment
  const acceptAppointment = useCallback((appointmentId: string) => {
    // Sync acceptance with backend
    api.acceptAppointment(appointmentId).catch(err => console.warn('Backend accept error:', err));

    setAppointments(prev => prev.map(a => {
      if (a.id === appointmentId) {
        const updatedTrail = [...a.fallbackCascadeTrail, `✅ ${a.hospitalName} Confirmed & Token Issued`];
        return {
          ...a,
          status: 'ACCEPTED',
          fallbackCascadeTrail: updatedTrail
        };
      }
      return a;
    }));

    setActiveFallback(null);
    triggerSound('chime');

    addEventLog({
      source: 'HOSPITAL_CMD',
      type: 'APPOINTMENT_ACCEPTED',
      title: 'Appointment Request Accepted by Hospital',
      detail: `Hospital desk confirmed appointment ID ${appointmentId}. Digital QR & 6-digit PIN ready for check-in.`,
      abdmTransactionHash: `0xACCEPT_${Math.random().toString(16).substring(2, 10).toUpperCase()}`,
      severity: 'SUCCESS'
    });
  }, [triggerSound, addEventLog]);

  // Check-In Patient at Hospital Kiosk by scanning QR or typing 6-digit PIN
  const checkInPatientByCode = useCallback((qrOrPin: string): { success: boolean; message: string; appointment?: Appointment } => {
    const cleanCode = qrOrPin.trim().replace(/\s|-/g, '');
    const found = appointments.find(a => 
      a.pinCode === cleanCode || 
      a.qrCodeData.includes(cleanCode) ||
      a.tokenNo.toLowerCase() === cleanCode.toLowerCase()
    );

    if (!found) {
      return {
        success: false,
        message: `No matching appointment or referral found for code "${qrOrPin}". Please verify PIN or ABHA ID.`
      };
    }

    if (found.status === 'ARRIVED') {
      return {
        success: true,
        message: `Patient ${found.patientName} (Token #${found.tokenNo}) has ALREADY checked in and is in the active OPD queue.`,
        appointment: found
      };
    }

    if (found.status === 'COMPLETED') {
      return {
        success: true,
        message: `Consultation for Token #${found.tokenNo} was already completed. Summary synced to ABHA.`,
        appointment: found
      };
    }

    // Mark as ARRIVED
    setAppointments(prev => prev.map(a => a.id === found.id ? {
      ...a,
      status: 'ARRIVED',
      fallbackCascadeTrail: [...a.fallbackCascadeTrail, `🏥 Patient Arrived at Hospital (Verified via PIN: ${found.pinCode})`]
    } : a));

    // Update Doctor current queue
    setDoctors(prev => prev.map(d => d.id === found.doctorId ? {
      ...d,
      currentQueueLength: d.currentQueueLength + 1
    } : d));

    triggerSound('chime');
    announceVoice(`Token Number ${found.tokenNo.replace('-', ' ')}, Please Proceed to ${found.roomNo}`);
    
    try {
      confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
    } catch {
      // Confetti optional
    }

    addEventLog({
      source: 'HOSPITAL_CMD',
      type: 'PATIENT_ARRIVED_VERIFIED',
      title: `Patient Arrival Verified: ${found.patientName}`,
      detail: `Token #${found.tokenNo} checked in at Kiosk via PIN ${found.pinCode}. Assigned to ${found.doctorName} (${found.roomNo}).`,
      abdmTransactionHash: `0xCHECKIN_${Math.random().toString(16).substring(2, 10).toUpperCase()}`,
      severity: 'SUCCESS'
    });

    return {
      success: true,
      message: `Arrival Verified! Patient ${found.patientName} assigned Token #${found.tokenNo} in ${found.roomNo}.`,
      appointment: { ...found, status: 'ARRIVED' }
    };
  }, [appointments, triggerSound, addEventLog]);

  // Submit Doctor Consultation & Synchronize to ABHA Health Locker
  const submitDoctorConsultation = useCallback((appointmentId: string, summary: ConsultationSummary) => {
    const apt = appointments.find(a => a.id === appointmentId);
    if (!apt) return;

    // Sync consultation to backend database
    api.submitConsultation({
      appointment_id: appointmentId,
      consultation_date: summary.consultationDate,
      doctor_id: summary.doctorId,
      doctor_name: summary.doctorName,
      hospital_name: summary.hospitalName,
      department: summary.department,
      chief_complaints: summary.chiefComplaints,
      clinical_observations: summary.clinicalObservations,
      diagnosis: summary.diagnosis,
      icd10_code: summary.icd10Code,
      medications: summary.medications,
      lab_tests_ordered: summary.labTestsOrdered,
      advice: summary.advice,
      follow_up_days: summary.followUpDays,
      abha_synced: summary.abhaSynced,
      abha_transaction_id: summary.abhaTransactionId
    }).catch(err => console.warn('Backend consultation sync error:', err));

    // 1. Mark Appointment Completed
    setAppointments(prev => prev.map(a => a.id === appointmentId ? {
      ...a,
      status: 'COMPLETED',
      consultationSummary: summary,
      fallbackCascadeTrail: [...a.fallbackCascadeTrail, `🩺 Consultation Completed by ${summary.doctorName} (Synced to ABHA)`]
    } : a));

    // 2. Push Record into Patient's ABHA Longitudinal Record
    const newHealthRecord = {
      id: `rec-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      facility: summary.hospitalName,
      doctorName: summary.doctorName,
      department: summary.department,
      diagnosis: summary.diagnosis,
      prescription: summary.medications.map(m => `${m.name} (${m.dosage}) - ${m.timing} for ${m.durationDays} days`),
      labReports: summary.labTestsOrdered,
      abhaHash: summary.abhaTransactionId
    };

    setAllPatients(prev => prev.map(p => p.abhaId === apt.abhaId ? {
      ...p,
      pastRecords: [newHealthRecord, ...p.pastRecords]
    } : p));

    if (currentUser.abhaId === apt.abhaId) {
      setCurrentUser(prev => ({
        ...prev,
        pastRecords: [newHealthRecord, ...prev.pastRecords]
      }));
    }

    // 3. Decrement doctor queue
    setDoctors(prev => prev.map(d => d.id === apt.doctorId ? {
      ...d,
      currentQueueLength: Math.max(0, d.currentQueueLength - 1),
      bookedSlots: Math.min(d.maxDailySlots, d.bookedSlots + 1)
    } : d));

    triggerSound('beep');

    addEventLog({
      source: 'ABDM_GATEWAY',
      type: 'ABHA_EHR_SYNC',
      title: `EHR Synced to ABHA Health Locker: ${apt.patientName}`,
      detail: `Rx for ${summary.diagnosis} digitally signed by ${summary.doctorName} and pushed to ABHA ID ${apt.abhaId} under ABDM transaction ${summary.abhaTransactionId}.`,
      abdmTransactionHash: summary.abhaTransactionId,
      severity: 'SUCCESS'
    });
  }, [appointments, currentUser.abhaId, triggerSound, addEventLog]);

  // ASHA PHC Referral Creation
  const createAshaPhcReferral = useCallback((params: {
    patient: UserPatient;
    triageColor: TriageLevel;
    triageReason: string;
    symptoms: string[];
    vitals?: Vitals;
    selectedHospital: Hospital;
    department: string;
    selectedDoctor?: Doctor;
  }): Appointment => {
    const activeAsha = ashas.find(a => a.id === currentAshaId) || ashas[0];
    const targetDoc = params.selectedDoctor || doctors.find(d => params.selectedHospital.doctorIds.includes(d.id)) || doctors[0];
    const randomPin = Math.floor(100000 + Math.random() * 900000).toString();
    const tokenNum = `PHC-REF-${Math.floor(100 + Math.random() * 900)}`;

    const newAppointment: Appointment = {
      id: `apt-${Date.now()}`,
      tokenNo: tokenNum,
      abhaId: params.patient.abhaId,
      patientName: params.patient.name,
      patientPhone: params.patient.phone,
      age: params.patient.age,
      gender: params.patient.gender,
      hospitalId: params.selectedHospital.id,
      hospitalName: params.selectedHospital.name,
      department: params.department,
      doctorId: targetDoc.id,
      doctorName: targetDoc.name,
      roomNo: targetDoc.roomNo,
      triageColor: params.triageColor,
      triageReason: params.triageReason,
      symptoms: params.symptoms,
      vitals: params.vitals,
      status: 'ACCEPTED', // PHC referrals are directly authorized
      referralSource: 'ASHA_PHC',
      referralByAshaName: activeAsha.name,
      qrCodeData: `SUGASTHA-PHC-REF-${tokenNum}-${params.patient.abhaId}-PIN-${randomPin}`,
      pinCode: randomPin,
      timestamp: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
      slotTime: params.triageColor === 'RED' ? 'IMMEDIATE EMERGENCY REFERRAL' : 'Today 12:00 PM - 01:00 PM',
      fallbackCascadeTrail: [
        `PHC Assessment by ${activeAsha.name}`,
        `Authorized Digital Referral to ${params.selectedHospital.name}`,
        `Referral Confirmed (PIN: ${randomPin})`
      ]
    };

    setAppointments(prev => [newAppointment, ...prev]);

    // Update ASHA stats
    setAshas(prev => prev.map(a => a.id === activeAsha.id ? {
      ...a,
      completedTasksCount: a.completedTasksCount + 1
    } : a));

    triggerSound('beep');

    addEventLog({
      source: 'ASHA_PORTAL',
      type: 'DIGITAL_PHC_REFERRAL',
      title: `ASHA Referral Created: ${params.patient.name} ➔ ${params.selectedHospital.name}`,
      detail: `Referred by ${activeAsha.name} for ${params.department}. Priority: ${params.triageColor}. Token #${tokenNum} issued.`,
      abdmTransactionHash: `0xASHA_${Math.random().toString(16).substring(2, 10).toUpperCase()}`,
      severity: 'SUCCESS'
    });

    return newAppointment;
  }, [ashas, currentAshaId, doctors, triggerSound, addEventLog]);

  // Submit Voice Note Fallback from 104 IVR
  const submitVoiceNoteFallback = useCallback((params: {
    callerPhone: string;
    callerName?: string;
    village: string;
    transcription: string;
    transcriptionHindi: string;
    extractedSymptoms: string[];
    urgency: TriageLevel;
  }): VoiceTask => {
    const newTask: VoiceTask = {
      id: `vtask-${Date.now()}`,
      callerPhone: params.callerPhone,
      callerName: params.callerName || 'Gramin Citizen (Phone Assistance)',
      village: params.village,
      recordedAudioDurationSec: 16,
      audioSampleKey: 'user_recorded_voice',
      transcription: params.transcription,
      transcriptionHindi: params.transcriptionHindi,
      extractedSymptoms: params.extractedSymptoms,
      urgency: params.urgency,
      status: 'PENDING_CLAIM',
      createdTimestamp: 'Just now'
    };

    setVoiceTasks(prev => [newTask, ...prev]);

    addEventLog({
      source: 'IVR_104',
      type: 'VOICE_TASK_CREATED',
      title: `104 Voice Message Transcribed via Neural STT`,
      detail: `Caller ${params.callerPhone} (${params.village}). Symptoms: ${params.extractedSymptoms.join(', ')}. Urgency: ${params.urgency}. Placed in ASHA Task Pool.`,
      abdmTransactionHash: `0xSTT_${Math.random().toString(16).substring(2, 10).toUpperCase()}`,
      severity: 'WARNING'
    });

    return newTask;
  }, [addEventLog]);

  // Claim Voice Task by an ASHA worker
  const claimVoiceTask = useCallback((taskId: string, ashaId: string) => {
    const asha = ashas.find(a => a.id === ashaId) || ashas[0];
    setVoiceTasks(prev => prev.map(t => t.id === taskId ? {
      ...t,
      status: 'CLAIMED',
      claimedByAshaId: asha.id,
      claimedByAshaName: asha.name
    } : t));

    addEventLog({
      source: 'ASHA_PORTAL',
      type: 'TASK_CLAIMED',
      title: `ASHA Claimed Voice Task: ${asha.name}`,
      detail: `ASHA ${asha.name} claimed task ${taskId}. Initiating outreach to caller.`,
      severity: 'INFO'
    });
  }, [ashas, addEventLog]);

  // Convert Voice Task to Hospital Appointment
  const convertVoiceTaskToAppointment = useCallback((taskId: string, hospitalId: string, department: string): Appointment | null => {
    const task = voiceTasks.find(t => t.id === taskId);
    if (!task) return null;

    const targetHosp = hospitals.find(h => h.id === hospitalId) || hospitals[0];
    const targetDoc = doctors.find(d => targetHosp.doctorIds.includes(d.id)) || doctors[0];
    const randomPin = Math.floor(100000 + Math.random() * 900000).toString();
    const tokenNum = `IVR-OPD-${Math.floor(100 + Math.random() * 900)}`;

    const newApt: Appointment = {
      id: `apt-${Date.now()}`,
      tokenNo: tokenNum,
      abhaId: `91-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
      patientName: task.callerName || `Citizen (${task.callerPhone.substring(task.callerPhone.length - 4)})`,
      patientPhone: task.callerPhone,
      age: 48,
      gender: 'M',
      hospitalId: targetHosp.id,
      hospitalName: targetHosp.name,
      department: department,
      doctorId: targetDoc.id,
      doctorName: targetDoc.name,
      roomNo: targetDoc.roomNo,
      triageColor: task.urgency,
      triageReason: `Voice Fallback Assistance: ${task.extractedSymptoms.join(', ')}`,
      symptoms: task.extractedSymptoms,
      status: 'ACCEPTED',
      referralSource: 'VOICE_FALLBACK',
      referralByAshaName: task.claimedByAshaName || 'ASHA Sangini Pool',
      qrCodeData: `SUGASTHA-VOICE-FALLBACK-${tokenNum}-PIN-${randomPin}`,
      pinCode: randomPin,
      timestamp: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
      slotTime: 'Today 01:30 PM - 02:30 PM',
      fallbackCascadeTrail: [
        `104 Call Speech-to-Text Voicemail Recorded`,
        `Claimed & Assisted by ${task.claimedByAshaName || 'ASHA Pool'}`,
        `Hospital Appointment Confirmed at ${targetHosp.name} (PIN: ${randomPin})`
      ]
    };

    setAppointments(prev => [newApt, ...prev]);

    setVoiceTasks(prev => prev.map(t => t.id === taskId ? {
      ...t,
      status: 'CONVERTED_TO_APPOINTMENT'
    } : t));

    triggerSound('chime');

    addEventLog({
      source: 'ASHA_PORTAL',
      type: 'VOICE_TASK_CONVERTED',
      title: `Voice Task Converted to OPD Appointment: Token #${tokenNum}`,
      detail: `Citizen ${task.callerPhone} booked at ${targetHosp.name} by ${task.claimedByAshaName}. SMS dispatch with PIN ${randomPin} sent to caller.`,
      abdmTransactionHash: `0xCONV_${Math.random().toString(16).substring(2, 10).toUpperCase()}`,
      severity: 'SUCCESS'
    });

    return newApt;
  }, [voiceTasks, hospitals, doctors, triggerSound, addEventLog]);

  // Automated Fallback Countdown Ticker
  useEffect(() => {
    if (!activeFallback) return;

    const interval = setInterval(() => {
      setActiveFallback(prev => {
        if (!prev) return null;
        if (prev.secondsRemaining <= 1) {
          // Timeout Reached! Trigger Automatic Hospital Cascade Escalation
          const nextIndex = prev.currentHospitalIndex + 1;
          if (nextIndex < prev.candidateHospitals.length) {
            const nextHosp = prev.candidateHospitals[nextIndex];
            const nextDoc = doctors.find(d => nextHosp.doctorIds.includes(d.id)) || doctors[0];

            setAppointments(currentApts => currentApts.map(a => {
              if (a.id === prev.appointmentId) {
                return {
                  ...a,
                  hospitalId: nextHosp.id,
                  hospitalName: nextHosp.name,
                  doctorId: nextDoc.id,
                  doctorName: nextDoc.name,
                  roomNo: nextDoc.roomNo,
                  status: 'ACCEPTED',
                  fallbackCascadeTrail: [
                    ...a.fallbackCascadeTrail,
                    `⏱️ Hospital A Unresponsive (>12s Timeout)`,
                    `⚡ Auto-Rerouted to ${nextHosp.name} (Auto-Accepted)`
                  ]
                };
              }
              return a;
            }));

            addEventLog({
              source: 'FALLBACK_ENGINE',
              type: 'AUTO_CASCADE_TIMEOUT',
              title: `Automated Fallback Triggered: Hospital A Timeout ➔ Escalated to ${nextHosp.name}`,
              detail: `Primary facility did not respond within defined SLA. SUGASTHA Smart Routing automatically transferred the patient's token to ${nextHosp.name} based on proximity and capacity.`,
              abdmTransactionHash: `0xTIMEOUT_${Math.random().toString(16).substring(2, 10).toUpperCase()}`,
              severity: 'WARNING'
            });

            triggerSound('chime');
          }
          return null; // Stop timer
        }

        return {
          ...prev,
          secondsRemaining: prev.secondsRemaining - 1
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeFallback, doctors, addEventLog, triggerSound]);

  // Trigger Edge-Case Demo Scenarios for demonstration
  const triggerEdgeCaseDemo = useCallback((caseId: 'hospital_timeout' | 'asha_cascade' | 'voice_stt' | 'capacity_overload') => {
    if (caseId === 'hospital_timeout') {
      bookAppointmentWithSmartFallback({
        abhaId: currentUser.abhaId,
        patientName: currentUser.name,
        patientPhone: currentUser.phone,
        age: currentUser.age,
        gender: currentUser.gender,
        triageColor: 'YELLOW',
        triageReason: 'Simulation: Acute abdominal cramps with dehydration',
        symptoms: ['abdominal_pain', 'fever_high'],
        referralSource: 'SELF_APP',
        candidateHospitals: hospitals,
        department: 'General Medicine'
      });
    } else if (caseId === 'voice_stt') {
      submitVoiceNoteFallback({
        callerPhone: '+91 98991 22334',
        callerName: 'Ram Avatar Sharma',
        village: 'Kanganheri Village',
        transcription: 'Namaste doctor sahab, mujhe 2 din se seene me dard aur sans lene me pareshani hai.',
        transcriptionHindi: 'नमस्ते डॉक्टर साहब, मुझे 2 दिन से सीने में दर्द और सांस लेने में परेशानी है।',
        extractedSymptoms: ['Severe Chest Pain', 'Breathlessness'],
        urgency: 'RED'
      });
      triggerSound('emergency');
    } else if (caseId === 'capacity_overload') {
      rejectAppointmentAndEscalate(appointments[0]?.id || 'apt-101', 'Hospital Emergency Trauma Overload (100% Beds Occupied)');
    }
  }, [currentUser, hospitals, appointments, bookAppointmentWithSmartFallback, submitVoiceNoteFallback, rejectAppointmentAndEscalate, triggerSound]);

  // Edit an existing doctor's details (used by the Doctor Roster "Edit" modal)
  const editDoctor = useCallback((doctorId: string, updates: Partial<Doctor>) => {
    setDoctors(prev => prev.map(d => (d.id === doctorId ? { ...d, ...updates } : d)));
    api.updateDoctor?.(doctorId, updates).catch(() => {
      // Backend may be offline; local state is already updated.
    });
  }, []);

  // Add a new doctor (manual entry or from PDF extraction)
  const addDoctor = useCallback((doctor: Doctor) => {
    setDoctors(prev => [...prev, doctor]);
    api.createDoctor?.(doctor).catch(() => {});
  }, []);

  // Remove a doctor from the roster
  const removeDoctor = useCallback((doctorId: string) => {
    setDoctors(prev => prev.filter(d => d.id !== doctorId));
  }, []);

  return (
    <HealthcareContext.Provider
      value={{
        isAuthenticated,
        login,
        logout,
        activeTab,
        setActiveTab,
        portal,
        setPortal,
        lang,
        setLang,
        highContrast,
        setHighContrast,
        fontSize,
        setFontSize,
        soundEnabled,
        setSoundEnabled,
        currentUser,
        setCurrentUser,
        allPatients,
        currentHospitalId,
        setCurrentHospitalId,
        currentAshaId,
        setCurrentAshaId,
        hospitals,
        doctors,
        ashas,
        appointments,
        voiceTasks,
        eventLogs,
        activeFallback,
        bookAppointmentWithSmartFallback,
        acceptAppointment,
        rejectAppointmentAndEscalate,
        checkInPatientByCode,
        submitDoctorConsultation,
        createAshaPhcReferral,
        submitVoiceNoteFallback,
        claimVoiceTask,
        convertVoiceTaskToAppointment,
        addEventLog,
        triggerEdgeCaseDemo,
        editDoctor,
        addDoctor,
        removeDoctor
      }}
    >
      {children}
    </HealthcareContext.Provider>
  );
};

export const useHealthcare = () => {
  const context = useContext(HealthcareContext);
  if (!context) {
    throw new Error('useHealthcare must be used within a HealthcareProvider');
  }
  return context;
};
