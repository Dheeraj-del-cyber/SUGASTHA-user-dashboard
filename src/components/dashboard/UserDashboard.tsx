import React, { useState } from 'react';
import {
  Stethoscope,
  Calendar,
  Users,
  Building2,
  Video,
  Sparkles,
  FileText,
  Pill,
  HeartPulse,
  Brain,
  Bone,
  Eye,
  Smile,
  Baby,
  Activity,
  X,
} from 'lucide-react';
import {
  AbhaProfile,
  HealthRecord,
  ChronicCondition,
  Allergy,
  ConsultationRequest,
  Hospital,
  Doctor,
} from '../../types';

import { MOCK_HOSPITALS } from '../../data/mockHospitals';
import {
  MOCK_UPCOMING_APPOINTMENTS,
  MOCK_TELECONSULT_OPTIONS,
  MOCK_RECOMMENDED_DOCTORS,
} from '../../data/mockDashboardData';

import { HorizontalCardSection } from '../common/HorizontalCardSection';
import { QuickActionCard } from './QuickActionCard';
import { AppointmentCard, AppointmentData } from './AppointmentCard';
import { DoctorCard } from './DoctorCard';
import { SpecialityCard, SpecialityItem } from './SpecialityCard';
import { FacilityCard } from './FacilityCard';
import { ConsultOnlineCard, TeleconsultOption } from './ConsultOnlineCard';
import { AISymptomCard } from './AISymptomCard';
import { ActiveConsultationCard } from '../consultation/ActiveConsultationCard';

interface UserDashboardProps {
  profile: AbhaProfile;
  records?: HealthRecord[];
  conditions?: ChronicCondition[];
  allergies?: Allergy[];
  activeConsultation: ConsultationRequest | null;
  onStartNewConsultation: () => void;
  onOpenTracker: () => void;
  onOpenRecords: () => void;
  onOpenHistory?: () => void;
  onSelectHospitalAndDoctor?: (hosp: Hospital, doc: Doctor) => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({
  profile,
  records = [],
  activeConsultation,
  onStartNewConsultation,
  onOpenTracker,
  onOpenRecords,
  onSelectHospitalAndDoctor,
}) => {
  // Local state for appointments list (to support reschedule/cancel interactive actions)
  const [appointments, setAppointments] = useState<AppointmentData[]>(MOCK_UPCOMING_APPOINTMENTS);
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentData | null>(null);
  const [appointmentModalMode, setAppointmentModalMode] = useState<'VIEW' | 'RESCHEDULE' | 'CANCEL' | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');

  // Specialities data
  const specialities: SpecialityItem[] = [
    {
      id: 'gen-med',
      name: 'General Medicine',
      icon: <Stethoscope size={22} />,
      doctorCount: 42,
      description: 'Fever, cough, general infections, health checkups',
    },
    {
      id: 'cardio',
      name: 'Cardiology',
      icon: <HeartPulse size={22} />,
      doctorCount: 18,
      description: 'Chest pain, high blood pressure, heart diseases',
    },
    {
      id: 'neuro',
      name: 'Neurology',
      icon: <Brain size={22} />,
      doctorCount: 12,
      description: 'Headache, dizziness, stroke, nerve care',
    },
    {
      id: 'ortho',
      name: 'Orthopedics',
      icon: <Bone size={22} />,
      doctorCount: 24,
      description: 'Joint pain, fractures, bone health, spine',
    },
    {
      id: 'gynae',
      name: 'Gynecology',
      icon: <Activity size={22} />,
      doctorCount: 29,
      description: 'Women health, pregnancy, hormonal care',
    },
    {
      id: 'ophthal',
      name: 'Ophthalmology',
      icon: <Eye size={22} />,
      doctorCount: 15,
      description: 'Eye checkup, vision, cataract, glaucoma',
    },
    {
      id: 'dentistry',
      name: 'Dentistry',
      icon: <Smile size={22} />,
      doctorCount: 31,
      description: 'Toothache, dental surgery, cleaning, braces',
    },
    {
      id: 'peds',
      name: 'Pediatrics',
      icon: <Baby size={22} />,
      doctorCount: 27,
      description: 'Child healthcare, vaccinations, growth',
    },
  ];

  // Appointment Action Handlers
  const handleViewAppointment = (app: AppointmentData) => {
    setSelectedAppointment(app);
    setAppointmentModalMode('VIEW');
  };

  const handleOpenReschedule = (app: AppointmentData) => {
    setSelectedAppointment(app);
    setRescheduleDate(app.date);
    setRescheduleTime(app.time);
    setAppointmentModalMode('RESCHEDULE');
  };

  const handleOpenCancel = (app: AppointmentData) => {
    setSelectedAppointment(app);
    setAppointmentModalMode('CANCEL');
  };

  const handleConfirmReschedule = () => {
    if (!selectedAppointment) return;
    setAppointments((prev) =>
      prev.map((a) =>
        a.id === selectedAppointment.id
          ? { ...a, date: rescheduleDate || a.date, time: rescheduleTime || a.time }
          : a
      )
    );
    setAppointmentModalMode(null);
    setSelectedAppointment(null);
  };

  const handleConfirmCancel = () => {
    if (!selectedAppointment) return;
    setAppointments((prev) =>
      prev.map((a) => (a.id === selectedAppointment.id ? { ...a, status: 'CANCELLED' } : a))
    );
    setAppointmentModalMode(null);
    setSelectedAppointment(null);
  };

  const handleJoinVideoCall = (app: AppointmentData) => {
    if (app.meetUrl) {
      window.open(app.meetUrl, '_blank');
    } else {
      alert(`Joining video consultation with ${app.doctorName}...`);
    }
  };

  const handleSpecialityClick = (_spec: SpecialityItem) => {
    onStartNewConsultation();
  };

  const handleTeleconsultSelect = (_opt: TeleconsultOption) => {
    onStartNewConsultation();
  };

  const handleBookDoctorClick = (doc: Doctor) => {
    const parentHosp = MOCK_HOSPITALS.find((h) => h.doctors.some((d) => d.id === doc.id)) || MOCK_HOSPITALS[0];
    if (onSelectHospitalAndDoctor) {
      onSelectHospitalAndDoctor(parentHosp, doc);
    } else {
      onStartNewConsultation();
    }
  };

  return (
    <div className="home-dashboard-layout animate-fade-in">
      {/* 0. ACTIVE CONSULTATION HERO BAR (If present) */}
      {activeConsultation && (
        <div className="active-visit-hero-banner">
          <ActiveConsultationCard
            consultation={activeConsultation}
            onOpenTracker={onOpenTracker}
          />
        </div>
      )}

      {/* WELCOME BANNER */}
      <div className="welcome-banner-card">
        <div className="welcome-badge-tag">
          <Sparkles size={14} className="sparkle-gold" />
          <span>NAMASTE • ABDM VERIFIED HEALTH SERVICE</span>
        </div>
        <h1 className="welcome-title">Welcome back, {profile.fullName.split(' ')[0]}!</h1>
        <p className="welcome-subtext">
          How can SUGASTHA support your health today? Access doctor bookings, teleconsultation, health records & emergency services.
        </p>
      </div>

      {/* 1. QUICK ACTIONS (Horizontal Scroll) */}
      <HorizontalCardSection
        title="Quick Actions"
        subtitle="Access key healthcare services instantly"
        icon={<Sparkles size={20} />}
        pastelBg="var(--pastel-light-blue)"
        itemMinWidth="150px"
      >
        <QuickActionCard
          title="Book Doctor"
          icon={<Users size={22} />}
          bgPastel="var(--pastel-sky-blue)"
          onClick={onStartNewConsultation}
        />
        <QuickActionCard
          title="Teleconsult"
          icon={<Video size={22} />}
          bgPastel="var(--pastel-light-blue)"
          onClick={onStartNewConsultation}
        />
        <QuickActionCard
          title="Find Hospital"
          icon={<Building2 size={22} />}
          bgPastel="var(--pastel-cream-yellow)"
          onClick={onStartNewConsultation}
        />
        <QuickActionCard
          title="Health Records"
          icon={<FileText size={22} />}
          bgPastel="var(--pastel-sky-blue)"
          badge={records.length > 0 ? `${records.length}` : undefined}
          onClick={onOpenRecords}
        />
        <QuickActionCard
          title="Medicines"
          icon={<Pill size={22} />}
          bgPastel="var(--pastel-cream-yellow)"
          onClick={onOpenRecords}
        />
      </HorizontalCardSection>

      {/* 2. UPCOMING APPOINTMENTS (Horizontal Scroll) */}
      <HorizontalCardSection
        title="Upcoming Appointments"
        subtitle="Your scheduled consultations and hospital visits"
        icon={<Calendar size={20} />}
        badgeText={`${appointments.filter((a) => a.status !== 'CANCELLED').length} Active`}
        pastelBg="var(--pastel-soft-pink)"
        itemMinWidth="300px"
      >
        {appointments.map((app) => (
          <AppointmentCard
            key={app.id}
            appointment={app}
            onView={handleViewAppointment}
            onReschedule={handleOpenReschedule}
            onCancel={handleOpenCancel}
            onJoinVideo={handleJoinVideoCall}
          />
        ))}
      </HorizontalCardSection>

      {/* 3. RECOMMENDED DOCTORS (Horizontal Scroll) */}
      <HorizontalCardSection
        title="Recommended Doctors"
        subtitle="Top-rated specialists available for immediate booking"
        icon={<Users size={20} />}
        pastelBg="var(--pastel-sky-blue)"
        itemMinWidth="280px"
      >
        {MOCK_RECOMMENDED_DOCTORS.map((doc) => (
          <DoctorCard
            key={doc.id}
            doctor={doc}
            hospitalName="AIIMS / Safdarjung Network"
            onBook={handleBookDoctorClick}
          />
        ))}
      </HorizontalCardSection>

      {/* 4. FIND BY SPECIALITY (Horizontal Scroll) */}
      <HorizontalCardSection
        title="Find by Speciality"
        subtitle="Select a medical discipline to view specialists"
        icon={<Stethoscope size={20} />}
        pastelBg="var(--pastel-cream-yellow)"
        itemMinWidth="260px"
      >
        {specialities.map((spec) => (
          <SpecialityCard
            key={spec.id}
            speciality={spec}
            onClick={handleSpecialityClick}
          />
        ))}
      </HorizontalCardSection>

      {/* 5. NEARBY HEALTHCARE FACILITIES (Horizontal Scroll) */}
      <HorizontalCardSection
        title="Nearby Healthcare Facilities"
        subtitle="Government tertiary, district hospitals & accredited centers"
        icon={<Building2 size={20} />}
        pastelBg="var(--pastel-light-blue)"
        itemMinWidth="310px"
      >
        {MOCK_HOSPITALS.map((hosp) => (
          <FacilityCard
            key={hosp.id}
            hospital={hosp}
            onViewDetails={(h) => {
              if (h.doctors.length > 0) handleBookDoctorClick(h.doctors[0]);
              else onStartNewConsultation();
            }}
          />
        ))}
      </HorizontalCardSection>

      {/* 6. CONSULT ONLINE (Horizontal Scroll) */}
      <HorizontalCardSection
        title="Consult Online"
        subtitle="Instant teleconsultations with certified practitioners"
        icon={<Video size={20} />}
        pastelBg="var(--pastel-sky-blue)"
        itemMinWidth="260px"
      >
        {MOCK_TELECONSULT_OPTIONS.map((opt) => (
          <ConsultOnlineCard
            key={opt.id}
            option={opt}
            onSelect={handleTeleconsultSelect}
          />
        ))}
      </HorizontalCardSection>

      {/* 7. AI SYMPTOM ASSISTANT */}
      <div className="section-block">
        <AISymptomCard onCheckSymptoms={onStartNewConsultation} />
      </div>

      {/* APPOINTMENT MODAL (View / Reschedule / Cancel) */}
      {selectedAppointment && appointmentModalMode && (
        <div className="modal-backdrop">
          <div className="modal-card animate-fade-in">
            <div className="modal-header">
              <h3 className="modal-title">
                {appointmentModalMode === 'VIEW' && 'Appointment Details'}
                {appointmentModalMode === 'RESCHEDULE' && 'Reschedule Appointment'}
                {appointmentModalMode === 'CANCEL' && 'Cancel Appointment'}
              </h3>
              <button
                onClick={() => {
                  setAppointmentModalMode(null);
                  setSelectedAppointment(null);
                }}
                className="modal-close-btn"
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <div className="app-detail-box">
                <h4 className="doc-name">{selectedAppointment.doctorName}</h4>
                <p className="doc-spec">{selectedAppointment.speciality}</p>
                <p className="fac-name">{selectedAppointment.facilityName}</p>
                <div className="detail-row">
                  <span>Date & Time:</span>
                  <strong>{selectedAppointment.date} at {selectedAppointment.time}</strong>
                </div>
                {selectedAppointment.tokenNumber && (
                  <div className="detail-row">
                    <span>Visit PIN:</span>
                    <strong className="pin-highlight">#{selectedAppointment.tokenNumber}</strong>
                  </div>
                )}
              </div>

              {appointmentModalMode === 'RESCHEDULE' && (
                <div className="reschedule-inputs">
                  <label>Select New Date</label>
                  <input
                    type="text"
                    value={rescheduleDate}
                    onChange={(e) => setRescheduleDate(e.target.value)}
                    placeholder="e.g. 20 Sep 2026"
                  />
                  <label>Select Preferred Time</label>
                  <input
                    type="text"
                    value={rescheduleTime}
                    onChange={(e) => setRescheduleTime(e.target.value)}
                    placeholder="e.g. 03:00 PM"
                  />
                </div>
              )}

              {appointmentModalMode === 'CANCEL' && (
                <p className="cancel-warning-text">
                  Are you sure you want to cancel this appointment with {selectedAppointment.doctorName}? This slot will be released back to the hospital queue.
                </p>
              )}
            </div>

            <div className="modal-footer">
              <button
                onClick={() => {
                  setAppointmentModalMode(null);
                  setSelectedAppointment(null);
                }}
                className="btn btn-secondary btn-sm"
              >
                Close
              </button>

              {appointmentModalMode === 'RESCHEDULE' && (
                <button
                  onClick={handleConfirmReschedule}
                  className="btn btn-primary btn-sm"
                >
                  Confirm Reschedule
                </button>
              )}

              {appointmentModalMode === 'CANCEL' && (
                <button
                  onClick={handleConfirmCancel}
                  className="btn btn-danger btn-sm"
                >
                  Confirm Cancel
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .home-dashboard-layout {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          padding-bottom: 1rem;
          width: 100%;
        }
        .active-visit-hero-banner {
          width: 100%;
        }
        .welcome-banner-card {
          background: linear-gradient(135deg, #DDF4FF 0%, #BFE9F8 50%, #FFFFFF 100%);
          border: 1px solid #93C5FD;
          border-radius: var(--radius-lg);
          padding: 1.15rem 1rem;
          box-shadow: var(--shadow-sm);
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .welcome-badge-tag {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 0.7rem;
          font-weight: 800;
          color: var(--brand-primary);
          background: var(--white);
          padding: 4px 10px;
          border-radius: var(--radius-full);
          width: fit-content;
          border: 1px solid #BFDBFE;
        }
        .sparkle-gold {
          color: #D97706;
        }
        .welcome-title {
          font-size: 1.45rem;
          font-weight: 800;
          color: var(--dark-navy-text);
          line-height: 1.2;
        }
        .welcome-subtext {
          font-size: 0.85rem;
          color: var(--text-secondary);
          max-width: 720px;
        }
        .section-block {
          width: 100%;
          margin-bottom: 1rem;
        }

        /* Modal Styles */
        .modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(23, 32, 42, 0.4);
          backdrop-filter: blur(4px);
          z-index: 200;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
        }
        .modal-card {
          background: var(--white);
          border-radius: var(--radius-lg);
          border: 1px solid var(--border-light);
          box-shadow: var(--shadow-lg);
          width: 100%;
          max-width: 480px;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid var(--border-light);
          padding-bottom: 0.75rem;
        }
        .modal-title {
          font-size: 1.15rem;
          font-weight: 700;
          color: var(--dark-navy-text);
        }
        .modal-close-btn {
          color: var(--text-muted);
          padding: 4px;
          border-radius: 50%;
        }
        .modal-close-btn:hover {
          background: var(--bg-app);
          color: var(--dark-navy-text);
        }
        .modal-body {
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
        }
        .app-detail-box {
          background: var(--pastel-light-blue);
          padding: 1rem;
          border-radius: var(--radius-md);
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }
        .doc-name {
          font-size: 1.05rem;
          font-weight: 700;
          color: var(--dark-navy-text);
        }
        .doc-spec {
          font-size: 0.82rem;
          font-weight: 600;
          color: var(--brand-primary);
        }
        .fac-name {
          font-size: 0.78rem;
          color: var(--text-muted);
        }
        .detail-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 0.82rem;
          margin-top: 0.35rem;
        }
        .pin-highlight {
          color: var(--brand-primary);
          font-family: var(--font-display);
        }
        .reschedule-inputs {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          font-size: 0.85rem;
        }
        .reschedule-inputs label {
          font-weight: 600;
          color: var(--dark-navy-text);
        }
        .cancel-warning-text {
          font-size: 0.88rem;
          color: #DC2626;
          background: var(--pastel-soft-pink);
          padding: 0.75rem;
          border-radius: var(--radius-sm);
        }
        .modal-footer {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 0.5rem;
          border-top: 1px solid var(--border-light);
          padding-top: 0.75rem;
        }
        @media (min-width: 769px) {
          .home-dashboard-layout {
            gap: 1.5rem;
            padding-bottom: 2rem;
          }
          .welcome-banner-card {
            padding: 1.5rem 1.75rem;
          }
          .welcome-title {
            font-size: 1.75rem;
          }
          .welcome-subtext {
            font-size: 0.92rem;
          }
        }
        @media (min-width: 1100px) {
          .home-dashboard-layout {
            gap: 1.75rem;
          }
          .welcome-banner-card {
            padding: 1.75rem 2rem;
          }
          .welcome-title {
            font-size: 1.95rem;
          }
          .welcome-subtext {
            max-width: 780px;
          }
        }
        @media (max-width: 480px) {
          .welcome-badge-tag {
            font-size: 0.62rem;
          }
          .welcome-title {
            font-size: 1.35rem;
          }
          .modal-card {
            padding: 1rem;
            border-radius: var(--radius-md);
          }
          .modal-footer {
            flex-direction: column-reverse;
            align-items: stretch;
          }
          .modal-footer .btn {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};
