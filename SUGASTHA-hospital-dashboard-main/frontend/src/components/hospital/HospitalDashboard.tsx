import React, { useState, useMemo } from 'react';
import { useHealthcare } from '../../context/HealthcareContext';
import { ESanjeevaniModal } from '../shared/eSanjeevaniModal';
import { DoctorEditModal } from './DoctorEditModal';
import { DoctorPdfImportModal } from './DoctorPdfImportModal';
import { Doctor } from '../../types';
import {
  Building2,
  Users,
  Activity,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Stethoscope,
  UserPlus,
  Search,
  Sparkles,
  HeartPulse,
  Thermometer,
  Wind,
  FileText,
  X,
  ArrowUpRight,
  ShieldCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const HospitalDashboard: React.FC = () => {
  const {
    appointments,
    hospitals,
    doctors,
    currentHospitalId,
    setCurrentHospitalId,
    acceptAppointment,
    rejectAppointmentAndEscalate,
    submitDoctorConsultation,
    bookAppointmentWithSmartFallback,
    activeTab,
    setActiveTab,
    editDoctor,
    addDoctor,
    removeDoctor
  } = useHealthcare();

  // Active hospital
  const activeHospital = hospitals.find(h => h.id === currentHospitalId) || hospitals[0];

  // Modals & Active Consultations
  const [consultingAppointment, setConsultingAppointment] = useState<any | null>(null);
  const [showAddDoctorModal, setShowAddDoctorModal] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [showPdfImportModal, setShowPdfImportModal] = useState(false);
  const [showSimulateModal, setShowSimulateModal] = useState(false);

  // OPD Filter & Search State
  const [opdStatusFilter, setOpdStatusFilter] = useState<'ALL' | 'PENDING' | 'ACCEPTED' | 'COMPLETED'>('ALL');
  const [opdUrgencyFilter, setOpdUrgencyFilter] = useState<'ALL' | 'RED' | 'YELLOW' | 'GREEN'>('ALL');
  const [opdSearchQuery, setOpdSearchQuery] = useState('');

  // Doctor Specialty Filter State
  const [doctorSpecialtyFilter, setDoctorSpecialtyFilter] = useState<string>('ALL');

  // New Doctor Form State
  const [newDoctorName, setNewDoctorName] = useState('');
  const [newDoctorSpec, setNewDoctorSpec] = useState('Cardiology & General Medicine');
  const [newDoctorRoom, setNewDoctorRoom] = useState('OPD Room 108');

  // Doctor Consultation Form State
  const [consultDiagnosis, setConsultDiagnosis] = useState('');
  const [consultIcd10, setConsultIcd10] = useState('I10.0');
  const [consultAdvice, setConsultAdvice] = useState('Prescribed rest, regular vitals checkup, and low sodium diet.');
  const [consultFollowup, setConsultFollowup] = useState(3);

  // Filtered Appointments for the Active Hospital
  const hospitalAppointments = useMemo(() => {
    return appointments.filter(a => a.hospitalId === activeHospital.id);
  }, [appointments, activeHospital.id]);

  // OPD Counts calculated cleanly within the OPD section
  const opdCounts = useMemo(() => {
    return {
      total: hospitalAppointments.length,
      pending: hospitalAppointments.filter(a => a.status === 'PENDING_ACCEPTANCE').length,
      accepted: hospitalAppointments.filter(a => a.status === 'ACCEPTED' || a.status === 'ARRIVED').length,
      completed: hospitalAppointments.filter(a => a.status === 'COMPLETED').length
    };
  }, [hospitalAppointments]);

  // Filtered list based on current active filters
  const filteredOpdQueue = useMemo(() => {
    return hospitalAppointments.filter(apt => {
      // Status filter
      if (opdStatusFilter === 'PENDING' && apt.status !== 'PENDING_ACCEPTANCE') return false;
      if (opdStatusFilter === 'ACCEPTED' && apt.status !== 'ACCEPTED' && apt.status !== 'ARRIVED') return false;
      if (opdStatusFilter === 'COMPLETED' && apt.status !== 'COMPLETED') return false;

      // Urgency filter
      if (opdUrgencyFilter !== 'ALL' && apt.triageColor !== opdUrgencyFilter) return false;

      // Search query
      if (opdSearchQuery.trim()) {
        const q = opdSearchQuery.toLowerCase();
        const matchesName = apt.patientName.toLowerCase().includes(q);
        const matchesToken = apt.tokenNo.toLowerCase().includes(q);
        const matchesAbha = apt.abhaId.toLowerCase().includes(q);
        if (!matchesName && !matchesToken && !matchesAbha) return false;
      }

      return true;
    });
  }, [hospitalAppointments, opdStatusFilter, opdUrgencyFilter, opdSearchQuery]);

  // Doctor roster filtered for active hospital
  const hospitalDoctors = useMemo(() => {
    const docs = doctors.filter(d => d.hospitalId === activeHospital.id || activeHospital.doctorIds.includes(d.id));
    if (doctorSpecialtyFilter === 'ALL') return docs;
    return docs.filter(d => d.specialty.toLowerCase().includes(doctorSpecialtyFilter.toLowerCase()));
  }, [doctors, activeHospital.doctorIds, doctorSpecialtyFilter]);

  // Handle consultation submission with confetti
  const handleCompleteConsultation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!consultingAppointment) return;

    submitDoctorConsultation(consultingAppointment.id, {
      consultationDate: new Date().toISOString(),
      doctorId: consultingAppointment.doctorId,
      doctorName: consultingAppointment.doctorName,
      hospitalName: activeHospital.name,
      department: consultingAppointment.department,
      chiefComplaints: consultingAppointment.symptoms.join(', '),
      clinicalObservations: `Vitals stable. BP: ${consultingAppointment.vitals?.bloodPressureSystolic || 120}/${consultingAppointment.vitals?.bloodPressureDiastolic || 80} mmHg, SpO2: ${consultingAppointment.vitals?.spO2 || 98}%.`,
      diagnosis: consultDiagnosis || 'General Clinical Observation',
      icd10Code: consultIcd10 || 'Z00.0',
      medications: [
        { name: 'Tab Paracetamol', dosage: '650mg', timing: '1-0-1 (After Meals)', durationDays: 3, instructions: 'Take with warm water' },
        { name: 'Tab Pantoprazole', dosage: '40mg', timing: '1-0-0 (Empty Stomach)', durationDays: 5, instructions: 'Take before breakfast' }
      ],
      labTestsOrdered: ['Complete Blood Count (CBC)', 'Random Blood Sugar'],
      advice: consultAdvice,
      followUpDays: consultFollowup,
      abhaSynced: true,
      abhaTransactionId: `ABHA-TXN-${Date.now()}`
    });

    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.7 }
    });

    setConsultingAppointment(null);
    setConsultDiagnosis('');
  };

  // Quick simulate incoming referral
  const handleSimulateReferral = (triage: 'RED' | 'YELLOW' | 'GREEN') => {
    const symptomsMap = {
      RED: ['Acute Severe Dyspnea', 'Diaphoresis', 'Chest Heaviness'],
      YELLOW: ['High Grade Pyrexia (102°F)', 'Persistent Cough', 'Severe Headache'],
      GREEN: ['Mild Abdominal Discomfort', 'Nausea']
    };

    const names = ['Anita Sharma', 'Rajeshwari Patel', 'Sunil Kumar', 'Farooq Ahmed', 'Lalita Bai'];
    const randomName = names[Math.floor(Math.random() * names.length)];

    bookAppointmentWithSmartFallback({
      abhaId: `91-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
      patientName: randomName,
      patientPhone: '+91 98' + Math.floor(10000000 + Math.random() * 90000000),
      age: Math.floor(22 + Math.random() * 55),
      gender: Math.random() > 0.5 ? 'F' : 'M',
      triageColor: triage,
      triageReason: triage === 'RED' ? 'Critically low SpO2 (<90%) with severe respiratory distress.' : triage === 'YELLOW' ? 'Moderate vital fluctuations requiring specialist OPD evaluation.' : 'Routine outpatient consultation.',
      symptoms: symptomsMap[triage],
      vitals: {
        bloodPressureSystolic: triage === 'RED' ? 170 : 130,
        bloodPressureDiastolic: triage === 'RED' ? 105 : 85,
        heartRate: triage === 'RED' ? 118 : 82,
        spO2: triage === 'RED' ? 88 : 97,
        temperatureF: triage === 'YELLOW' ? 102.4 : 98.6
      },
      referralSource: 'ASHA_PHC',
      referralByAshaName: 'Sunita Devi (ASHA Sangini, Rampur Village)',
      candidateHospitals: [activeHospital, ...hospitals.filter(h => h.id !== activeHospital.id)],
      department: 'Emergency & General Medicine'
    });

    setShowSimulateModal(false);
    setActiveTab('OPD');
    setOpdStatusFilter('PENDING');
  };

  if (!activeHospital) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 font-sans">
      {/* 1. Hospital Executive Command Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 text-white p-6 sm:p-8 shadow-xl border border-slate-800 mb-6">
        {/* Subtle Ambient Glows */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          {/* Facility Identity */}
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/40 flex items-center justify-center flex-shrink-0 shadow-inner">
              <Building2 className="w-8 h-8 text-emerald-400" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {activeHospital.type}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono text-slate-400 bg-slate-800/80 border border-slate-700">
                  ABDM ID: HOSP-{activeHospital.id.toUpperCase()}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                {activeHospital.name}
              </h2>
              <p className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
                <span>{activeHospital.address}</span>
                <span className="hidden sm:inline text-slate-600">·</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> ABDM Milestone 3 Certified
                </span>
              </p>
            </div>
          </div>

          {/* Quick Command Status & Action Controls */}
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-start lg:justify-end pt-4 lg:pt-0 border-t border-slate-800 lg:border-t-0">
            <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl px-4 py-2.5 border border-slate-700/80 flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Shift Protocol</div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-400" /> Morning (08:00 - 16:00 IST)
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowSimulateModal(true)}
              className="bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs px-4 py-2.5 rounded-2xl shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-emerald-200" />
              <span>Simulate Patient Influx</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. In-Page Segmented Tab Navigation Bar (TRENDY, SLEEK, NO DUPLICATE COUNT BADGES) */}
      <div className="bg-white/80 backdrop-blur-md p-1.5 rounded-2xl border border-slate-200/90 shadow-xs mb-6 overflow-x-auto flex items-center gap-1">
        {[
          { id: 'OPD', label: 'OPD Queue & Triage', icon: <Users className="w-4 h-4" /> },
          { id: 'DOCTORS', label: 'Doctor Roster (AEBAS)', icon: <Stethoscope className="w-4 h-4" /> }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-slate-900 text-white shadow-md shadow-slate-900/10'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
            }`}
          >
            <span className={activeTab === tab.id ? 'text-emerald-400' : 'text-slate-400'}>
              {tab.icon}
            </span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* 3. Main Dynamic Workspace */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200/90 p-6 min-h-[580px] transition-all">

        {/* ========================================================================= */}
        {/* TAB 1: OPD QUEUE & TRIAGE                                                 */}
        {/* ========================================================================= */}
        {activeTab === 'OPD' && (
          <div className="space-y-6 animate-[fadeIn_0.2s_ease-out]">
            {/* Section Header with contextual counters ONLY in this section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                  <span>Outpatient Department (OPD) Triage Desk</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Real-time algorithmic triage intake, auto-escalation timer & ABHA consultation workflow.
                </p>
              </div>

              {/* Contextual Metric Badges (Strictly inside OPD) */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold">
                  Total Patients: {opdCounts.total}
                </span>
                <span className="px-3 py-1 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                  Action Required: {opdCounts.pending}
                </span>
                <span className="px-3 py-1 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                  Completed: {opdCounts.completed}
                </span>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50/70 p-3 rounded-2xl border border-slate-200/80">
              {/* Status Segment Filters */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
                {(['ALL', 'PENDING', 'ACCEPTED', 'COMPLETED'] as const).map(s => (
                  <button
                    key={s}
                    onClick={() => setOpdStatusFilter(s)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                      opdStatusFilter === s
                        ? 'bg-white text-slate-900 shadow-2xs border border-slate-200'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {s === 'ALL' ? 'All Patients' : s === 'PENDING' ? 'Pending Review' : s === 'ACCEPTED' ? 'Waiting in OPD' : 'Completed'}
                  </button>
                ))}
              </div>

              {/* Urgency Filter & Search Input */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <select
                    value={opdUrgencyFilter}
                    onChange={(e) => setOpdUrgencyFilter(e.target.value as any)}
                    className="bg-white border border-slate-200 text-slate-700 text-xs font-semibold py-1.5 pl-3 pr-8 rounded-xl outline-none cursor-pointer shadow-2xs"
                  >
                    <option value="ALL">All Triage Levels</option>
                    <option value="RED">Red (Emergency)</option>
                    <option value="YELLOW">Yellow (Urgent)</option>
                    <option value="GREEN">Green (Routine)</option>
                  </select>
                </div>

                <div className="relative flex-1 sm:w-60">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={opdSearchQuery}
                    onChange={(e) => setOpdSearchQuery(e.target.value)}
                    placeholder="Search name, token or ABHA..."
                    className="w-full bg-white border border-slate-200 text-slate-800 text-xs font-medium pl-8 pr-3 py-1.5 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-2xs"
                  />
                </div>
              </div>
            </div>

            {/* OPD Patients Queue List */}
            {filteredOpdQueue.length === 0 ? (
              <div className="text-center py-16 px-4 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
                <Users className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                <h4 className="text-base font-bold text-slate-800">No patients match the current filter</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Try adjusting the triage urgency or status filter, or simulate an incoming patient above.
                </p>
                <button
                  onClick={() => setShowSimulateModal(true)}
                  className="mt-4 px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl shadow-xs hover:bg-slate-800 transition"
                >
                  Generate Test Referral
                </button>
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredOpdQueue.map((apt: any) => {
                  const isRed = apt.triageColor === 'RED';
                  const isYellow = apt.triageColor === 'YELLOW';

                  return (
                    <div
                      key={apt.id}
                      className={`relative overflow-hidden rounded-2xl border p-5 sm:p-6 transition-all shadow-xs hover:shadow-md ${
                        isRed
                          ? 'border-rose-200 bg-rose-50/20'
                          : isYellow
                          ? 'border-amber-200 bg-amber-50/20'
                          : 'border-emerald-200 bg-emerald-50/20'
                      }`}
                    >
                      {/* Left Urgency Color Accent Strip */}
                      <div
                        className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                          isRed ? 'bg-rose-500' : isYellow ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                      />

                      {/* Header Row: Token + Priority Pill + Status */}
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs font-black px-2.5 py-1 rounded-lg bg-slate-900 text-white shadow-2xs">
                            Token #{apt.tokenNo}
                          </span>
                          <span
                            className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-lg border ${
                              isRed
                                ? 'bg-rose-100 text-rose-800 border-rose-300 animate-pulse'
                                : isYellow
                                ? 'bg-amber-100 text-amber-800 border-amber-300'
                                : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            }`}
                          >
                            {apt.triageColor} PRIORITY {isRed ? '· IMMEDIATE' : isYellow ? '· URGENT' : '· ROUTINE'}
                          </span>
                          <span className="text-[11px] font-mono text-slate-500 bg-white/80 px-2 py-0.5 rounded border border-slate-200">
                            ABHA: {apt.abhaId}
                          </span>
                        </div>

                        {/* Status Tag */}
                        <div className="flex items-center gap-2 self-end sm:self-center">
                          <span
                            className={`text-xs font-bold px-3 py-1 rounded-full ${
                              apt.status === 'PENDING_ACCEPTANCE'
                                ? 'bg-rose-100 text-rose-800 border border-rose-200 animate-pulse'
                                : apt.status === 'ACCEPTED' || apt.status === 'ARRIVED'
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            }`}
                          >
                            {apt.status === 'PENDING_ACCEPTANCE' ? 'Pending Review' : apt.status === 'ACCEPTED' ? 'Waiting in OPD' : apt.status}
                          </span>
                        </div>
                      </div>

                      {/* Patient Name, Age & Triage Details */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="md:col-span-2">
                          <h4 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            {apt.patientName}
                            <span className="text-xs font-medium text-slate-500">
                              ({apt.gender}, {apt.age} yrs)
                            </span>
                          </h4>
                          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                            <strong className="text-slate-700">Triage Assessment:</strong> {apt.triageReason}
                          </p>

                          {/* Symptoms list */}
                          <div className="flex flex-wrap gap-1.5 mt-2.5">
                            {apt.symptoms.map((sym: string, i: number) => (
                              <span
                                key={i}
                                className="text-[11px] font-medium bg-white/90 border border-slate-200 px-2.5 py-0.5 rounded-lg text-slate-700 shadow-2xs"
                              >
                                {sym}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Vitals Signs Grid */}
                        <div className="bg-white/90 rounded-xl p-3 border border-slate-200 shadow-2xs flex flex-col justify-center">
                          <div className="text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-2">
                            Vital Signs at Intake
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="flex items-center gap-1.5">
                              <HeartPulse className="w-3.5 h-3.5 text-rose-500" />
                              <span className="text-slate-600">BP:</span>
                              <span className="font-bold text-slate-900">
                                {apt.vitals?.bloodPressureSystolic || 120}/{apt.vitals?.bloodPressureDiastolic || 80}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Wind className={`w-3.5 h-3.5 ${(apt.vitals?.spO2 || 98) < 92 ? 'text-rose-500 animate-pulse' : 'text-sky-500'}`} />
                              <span className="text-slate-600">SpO₂:</span>
                              <span className={`font-bold ${(apt.vitals?.spO2 || 98) < 92 ? 'text-rose-600' : 'text-slate-900'}`}>
                                {apt.vitals?.spO2 || 98}%
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Activity className="w-3.5 h-3.5 text-emerald-500" />
                              <span className="text-slate-600">Pulse:</span>
                              <span className="font-bold text-slate-900">{apt.vitals?.heartRate || 76} bpm</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Thermometer className="w-3.5 h-3.5 text-amber-500" />
                              <span className="text-slate-600">Temp:</span>
                              <span className="font-bold text-slate-900">{apt.vitals?.temperatureF || 98.6}°F</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Referral and Logistics Footer */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t border-slate-200/60 text-xs text-slate-500">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="flex items-center gap-1 text-slate-700 font-medium">
                            <Building2 className="w-3.5 h-3.5 text-slate-400" />
                            {apt.roomNo} · {apt.doctorName}
                          </span>
                          {apt.referralByAshaName && (
                            <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md font-semibold text-[11px]">
                              Assisted by {apt.referralByAshaName}
                            </span>
                          )}
                        </div>

                        {/* Interactive Workflow Buttons */}
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          {apt.status === 'PENDING_ACCEPTANCE' && (
                            <>
                              <button
                                onClick={() => rejectAppointmentAndEscalate(apt.id, 'OPD Capacity Maxed')}
                                className="flex-1 sm:flex-none px-3.5 py-2 bg-white hover:bg-rose-50 text-rose-700 font-bold rounded-xl border border-rose-200 text-xs transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
                              >
                                <AlertTriangle className="w-3.5 h-3.5" />
                                <span>Auto-Escalate</span>
                              </button>
                              <button
                                onClick={() => acceptAppointment(apt.id)}
                                className="flex-1 sm:flex-none px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm shadow-emerald-600/20"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Accept Patient</span>
                              </button>
                            </>
                          )}

                          {(apt.status === 'ACCEPTED' || apt.status === 'ARRIVED') && (
                            <button
                              onClick={() => {
                                setConsultingAppointment(apt);
                                setConsultDiagnosis('');
                              }}
                              className="w-full sm:w-auto px-4 py-2 bg-slate-900 hover:bg-slate-800 active:scale-95 text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm"
                            >
                              <Stethoscope className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Start Doctor Consultation & ABHA Rx</span>
                            </button>
                          )}

                          {apt.status === 'COMPLETED' && (
                            <div className="flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Synced to ABHA Health Locker</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'DOCTORS' && (
          <div className="space-y-6 animate-[fadeIn_0.2s_ease-out]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
                  Doctor Roster & AEBAS Biometric Presence
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Aadhaar-Enabled Biometric Attendance System (AEBAS) sync & live OPD room allocations.
                </p>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                  onClick={() => setShowPdfImportModal(true)}
                  className="px-4 py-2 bg-white border border-slate-200 hover:border-emerald-400 active:scale-95 text-slate-700 font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Import from PDF</span>
                </button>
                <button
                  onClick={() => setShowAddDoctorModal(true)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Log Doctor / Punch In</span>
                </button>
              </div>
            </div>

            {/* Department Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {['ALL', 'Cardiology', 'Pulmonology', 'Orthopedics', 'Pediatrics'].map(dept => (
                <button
                  key={dept}
                  onClick={() => setDoctorSpecialtyFilter(dept)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    doctorSpecialtyFilter === dept
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {dept === 'ALL' ? 'All Specialties' : dept}
                </button>
              ))}
            </div>

            {/* Doctors Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {hospitalDoctors.map((doc) => (
                <div
                  key={doc.id}
                  className="rounded-2xl p-5 border border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs transition-all flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-sm border border-slate-200">
                        <Stethoscope className="w-6 h-6 text-emerald-600" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-slate-900 text-base">{doc.name}</h4>
                        <p className="text-xs text-slate-500 font-medium">{doc.specialty}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">{doc.qualification}</p>
                      </div>
                    </div>

                    {/* AEBAS Biometric Attendance Badge */}
                    <div className="text-right">
                      <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border ${
                        doc.aebasStatus === 'IN_OPD'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : doc.aebasStatus === 'ON_DUTY'
                          ? 'bg-sky-100 text-sky-800 border-sky-300'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}>
                        AEBAS: {doc.aebasStatus}
                      </span>
                      <div className="text-[10px] text-slate-400 mt-1 font-mono">{doc.aebasCheckInTime}</div>
                    </div>
                  </div>

                  {/* Availability / OPD Timing */}
                  {doc.opdTiming && (
                    <div className="mb-3 text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {doc.opdTiming}
                    </div>
                  )}

                  {/* Consultation Load Progress */}
                  <div className="pt-3 border-t border-slate-100">
                    <div className="flex justify-between items-center text-xs mb-1.5">
                      <span className="text-slate-600 font-medium">{doc.roomNo}</span>
                      <span className="font-bold text-slate-800">
                        {doc.bookedSlots} / {doc.maxDailySlots} Slots Active
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(doc.bookedSlots / doc.maxDailySlots) * 100}%` }}
                      />
                    </div>
                    <button
                      onClick={() => setEditingDoctor(doc)}
                      className="mt-3 w-full py-2 rounded-xl border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/60 text-slate-700 text-[11px] font-bold transition-all"
                    >
                      Edit Doctor Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: START DOCTOR CONSULTATION & SYNC TO ABHA                        */}
      {/* ========================================================================= */}
      {consultingAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-[fadeIn_0.15s_ease-out]">
          <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-6 bg-slate-900 text-white flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Clinical Encounter
                  </span>
                  <span className="text-xs text-slate-400 font-mono">Token #{consultingAppointment.tokenNo}</span>
                </div>
                <h3 className="text-xl font-black">
                  Consultation for {consultingAppointment.patientName}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  ABHA ID: {consultingAppointment.abhaId} · {consultingAppointment.age} yrs, {consultingAppointment.gender}
                </p>
              </div>
              <button
                onClick={() => setConsultingAppointment(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleCompleteConsultation} className="p-6 overflow-y-auto space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Primary Clinical Diagnosis
                </label>
                <input
                  type="text"
                  required
                  value={consultDiagnosis}
                  onChange={(e) => setConsultDiagnosis(e.target.value)}
                  placeholder="e.g. Essential Hypertension with Stable Angina Pectoris"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    ICD-10 Diagnostic Code
                  </label>
                  <input
                    type="text"
                    value={consultIcd10}
                    onChange={(e) => setConsultIcd10(e.target.value)}
                    placeholder="e.g. I10.0"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-900 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Follow-up (Days)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={consultFollowup}
                    onChange={(e) => setConsultFollowup(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-900 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Clinical Advice & Prescription Notes
                </label>
                <textarea
                  rows={3}
                  value={consultAdvice}
                  onChange={(e) => setConsultAdvice(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              {/* Digital Signature Confirmation */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-xs text-emerald-900">
                <div className="font-bold flex items-center gap-1.5 mb-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  ABDM Electronic Health Record (EHR) Sync
                </div>
                <p className="text-[11px] text-emerald-700">
                  Submitting this consultation will digitally sign the summary and push it directly into the patient's ABHA PHR app.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setConsultingAppointment(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/20 transition flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Sign & Sync to ABHA</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: SIMULATE LIVE PATIENT REFERRAL (EASY DEMO HELPER)                */}
      {/* ========================================================================= */}
      {showSimulateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-[fadeIn_0.15s_ease-out]">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="font-black text-lg text-slate-900">Simulate Incoming Patient Referral</h4>
                <p className="text-xs text-slate-500 mt-0.5">Test real-time OPD intake, triage alert sounds & auto-escalation</p>
              </div>
              <button
                onClick={() => setShowSimulateModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => handleSimulateReferral('RED')}
                className="w-full text-left p-4 rounded-2xl border border-rose-200 bg-rose-50/50 hover:bg-rose-50 transition-all flex items-start justify-between group"
              >
                <div>
                  <div className="text-xs font-bold text-rose-800 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                    RED Priority (Emergency)
                  </div>
                  <p className="text-xs text-rose-950 font-bold mt-1">Acute Dyspnea & Low SpO2 (88%)</p>
                  <p className="text-[11px] text-rose-700 mt-0.5">ASHA PHC Assisted referral requiring urgent bed</p>
                </div>
                <ArrowUpRight className="w-4 h-4 text-rose-500 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                onClick={() => handleSimulateReferral('YELLOW')}
                className="w-full text-left p-4 rounded-2xl border border-amber-200 bg-amber-50/50 hover:bg-amber-50 transition-all flex items-start justify-between group"
              >
                <div>
                  <div className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    YELLOW Priority (Urgent)
                  </div>
                  <p className="text-xs text-amber-950 font-bold mt-1">High Grade Fever (102.4°F) & Chest Discomfort</p>
                  <p className="text-[11px] text-amber-700 mt-0.5">104 Helpline voice transcription intake</p>
                </div>
                <ArrowUpRight className="w-4 h-4 text-amber-500 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                onClick={() => handleSimulateReferral('GREEN')}
                className="w-full text-left p-4 rounded-2xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 transition-all flex items-start justify-between group"
              >
                <div>
                  <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    GREEN Priority (Routine)
                  </div>
                  <p className="text-xs text-emerald-950 font-bold mt-1">Routine OPD Consultation & Prescription</p>
                  <p className="text-[11px] text-emerald-700 mt-0.5">Citizen Self-App registration</p>
                </div>
                <ArrowUpRight className="w-4 h-4 text-emerald-500 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: ADD DOCTOR / PUNCH IN MODAL                                      */}
      {/* ========================================================================= */}
      {showAddDoctorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-[fadeIn_0.15s_ease-out]">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="font-black text-lg text-slate-900">Add Doctor / AEBAS Check-In</h4>
                <p className="text-xs text-slate-500 mt-0.5">Register biometric presence to active hospital roster</p>
              </div>
              <button
                onClick={() => setShowAddDoctorModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setShowAddDoctorModal(false);
                setNewDoctorName('');
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Doctor Full Name
                </label>
                <input
                  type="text"
                  required
                  value={newDoctorName}
                  onChange={(e) => setNewDoctorName(e.target.value)}
                  placeholder="Dr. Sangeeta Rao, MD"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Specialty & Department
                </label>
                <select
                  value={newDoctorSpec}
                  onChange={(e) => setNewDoctorSpec(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 outline-none"
                >
                  <option value="Cardiology & General Medicine">Cardiology & General Medicine</option>
                  <option value="Pulmonology & Critical Care">Pulmonology & Critical Care</option>
                  <option value="Trauma & Emergency Surgery">Trauma & Emergency Surgery</option>
                  <option value="Pediatrics & Child Care">Pediatrics & Child Care</option>
                  <option value="Obstetrics & Gynecology">Obstetrics & Gynecology</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Assigned OPD Room Number
                </label>
                <input
                  type="text"
                  value={newDoctorRoom}
                  onChange={(e) => setNewDoctorRoom(e.target.value)}
                  placeholder="OPD Room 204, Wing B"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddDoctorModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition"
                >
                  Confirm AEBAS Punch-In
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: EDIT DOCTOR DETAILS                                              */}
      {/* ========================================================================= */}
      {editingDoctor && (
        <DoctorEditModal
          doctor={editingDoctor}
          onClose={() => setEditingDoctor(null)}
          onSave={(doctorId, updates) => editDoctor(doctorId, updates)}
          onDelete={(doctorId) => removeDoctor(doctorId)}
        />
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: IMPORT DOCTORS FROM PDF                                          */}
      {/* ========================================================================= */}
      {showPdfImportModal && (
        <DoctorPdfImportModal
          hospitalName={activeHospital.name}
          onClose={() => setShowPdfImportModal(false)}
          onAddRow={(row) => {
            const newDoctor: Doctor = {
              id: `doc-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
              hospitalId: activeHospital.id,
              name: row.name,
              specialty: row.specialty || 'General Medicine',
              specialtyHindi: row.specialty || 'सामान्य चिकित्सा',
              qualification: 'MBBS',
              experienceYears: 5,
              roomNo: row.roomNo || 'OPD Room TBD',
              aebasStatus: 'ON_DUTY',
              aebasCheckInTime: '09:00 AM IST',
              maxDailySlots: 30,
              bookedSlots: 0,
              currentQueueLength: 0,
              consultationFee: 0,
              rating: 4.5,
              opdTiming: row.opdTiming || 'Mon-Sat, 9:00 AM - 1:00 PM',
              availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
            };
            addDoctor(newDoctor);
          }}
        />
      )}
    </div>
  );
};
