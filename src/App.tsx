import React, { useState, useEffect } from 'react';
import { Header } from './components/common/Header';
import { BottomNav, ActiveTab } from './components/common/BottomNav';
import { AbhaLoginModal } from './components/auth/AbhaLoginModal';
import { AbhaRegisterModal } from './components/auth/AbhaRegisterModal';
import { AbhaRecoverModal } from './components/auth/AbhaRecoverModal';
import { UserDashboard } from './components/dashboard/UserDashboard';
import { SymptomInputForm } from './components/triage/SymptomInputForm';
import { TriageResultCard } from './components/triage/TriageResultCard';
import { TeleconsultationCard } from './components/recommendations/TeleconsultationCard';
import { HospitalList } from './components/recommendations/HospitalList';
import { BookingConfirmationModal } from './components/consultation/BookingConfirmationModal';
import { ConsultationTracker } from './components/consultation/ConsultationTracker';
import { HealthRecordsView } from './components/profile/HealthRecordsView';
import { ConsultationHistory } from './components/history/ConsultationHistory';
import { HealthcareJourneySummaryModal } from './components/summary/HealthcareJourneySummaryModal';

import { abhaService } from './services/abhaService';
import { triageEngine } from './services/triageEngine';
import { consultationService } from './services/consultationService';

import {
  AbhaProfile,
  HealthRecord,
  ChronicCondition,
  Allergy,
  SymptomInput,
  TriageResult,
  Hospital,
  Doctor,
  ConsultationRequest,
  HealthcareJourneySummary,
} from './types';

export const App: React.FC = () => {
  // ABHA Session State
  const [profile, setProfile] = useState<AbhaProfile | null>(null);
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [conditions, setConditions] = useState<ChronicCondition[]>([]);
  const [allergies, setAllergies] = useState<Allergy[]>([]);

  // Auth Modals State
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isRecoverOpen, setIsRecoverOpen] = useState(false);

  // Active View State
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [activeSubView, setActiveSubView] = useState<
    'DASHBOARD' | 'SYMPTOMS' | 'TRIAGE_RESULT' | 'RECOMMENDATION' | 'TRACKER' | 'RECORDS' | 'HISTORY'
  >('DASHBOARD');

  // Triage & Booking Pipeline State
  const [currentSymptoms, setCurrentSymptoms] = useState<SymptomInput | null>(null);
  const [isAnalyzingTriage, setIsAnalyzingTriage] = useState(false);
  const [triageResult, setTriageResult] = useState<TriageResult | null>(null);

  // Selected Hospital / Doctor for Booking
  const [pendingHospital, setPendingHospital] = useState<Hospital | null>(null);
  const [pendingDoctor, setPendingDoctor] = useState<Doctor | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isBookingInProgress, setIsBookingInProgress] = useState(false);

  // Active Consultation & History
  const [activeConsultation, setActiveConsultation] = useState<ConsultationRequest | null>(null);
  const [consultationHistory, setConsultationHistory] = useState<ConsultationRequest[]>([]);

  // Healthcare Journey Completion Summary
  const [completedJourneySummary, setCompletedJourneySummary] = useState<HealthcareJourneySummary | null>(null);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);

  // Initialize Session & LocalStorage on Mount
  useEffect(() => {
    const session = abhaService.getCurrentSession();
    if (session) {
      setProfile(session.profile);
      setRecords(session.records);
      setConditions(session.conditions);
      setAllergies(session.allergies);
    }
    const savedActive = consultationService.getActiveConsultation();
    setActiveConsultation(savedActive);

    const savedHistory = consultationService.getConsultationHistory();
    setConsultationHistory(savedHistory);
  }, []);

  // Handle Login Success
  const handleLoginSuccess = (data: {
    profile: AbhaProfile;
    records: HealthRecord[];
    conditions: ChronicCondition[];
    allergies: Allergy[];
  }) => {
    setProfile(data.profile);
    setRecords(data.records);
    setConditions(data.conditions);
    setAllergies(data.allergies);
    setActiveTab('dashboard');
    setActiveSubView('DASHBOARD');
  };

  // Handle Registration Success
  const handleRegisterSuccess = (newProfile: AbhaProfile) => {
    const session = abhaService.getCurrentSession();
    if (session) {
      setProfile(session.profile);
      setRecords(session.records);
      setConditions(session.conditions);
      setAllergies(session.allergies);
    } else {
      setProfile(newProfile);
    }
    setActiveTab('dashboard');
    setActiveSubView('DASHBOARD');
  };

  // Handle Recovery Selection
  const handleRecoverSelection = async (recoveredAbhaNumber: string) => {
    const session = await abhaService.login(recoveredAbhaNumber, 'OTP', '123456');
    handleLoginSuccess(session);
  };

  // Handle Logout
  const handleLogout = () => {
    abhaService.logout();
    setProfile(null);
    setRecords([]);
    setConditions([]);
    setAllergies([]);
    setIsLoginOpen(true);
  };

  // Submit Symptoms -> Run AI Triage
  const handleSymptomSubmit = (symptoms: SymptomInput) => {
    setCurrentSymptoms(symptoms);
    setIsAnalyzingTriage(true);

    setTimeout(() => {
      const result = triageEngine.evaluateTriage(symptoms, conditions, records, allergies);
      setTriageResult(result);
      setIsAnalyzingTriage(false);
      setActiveSubView('TRIAGE_RESULT');
    }, 900);
  };

  // Proceed from Triage Result to Recommendation
  const handleProceedToRecommendation = () => {
    setActiveSubView('RECOMMENDATION');
  };

  // Switch between physical hospital and teleconsultation
  const handleSelectHospitalAndDoctor = (hosp: Hospital, doc: Doctor) => {
    setPendingHospital(hosp);
    setPendingDoctor(doc);
    setIsBookingModalOpen(true);
  };

  // Confirm and Book Hospital Consultation (3-Tier Queue Buffering)
  const handleConfirmHospitalBooking = () => {
    if (!profile || !currentSymptoms || !triageResult || !pendingHospital || !pendingDoctor) return;

    setIsBookingInProgress(true);
    setTimeout(() => {
      const newConsultation = consultationService.createConsultation(
        profile,
        currentSymptoms,
        triageResult,
        pendingHospital,
        pendingDoctor
      );
      setActiveConsultation(newConsultation);
      setIsBookingInProgress(false);
      setIsBookingModalOpen(false);
      setActiveSubView('TRACKER');
      setActiveTab('tracking');
    }, 800);
  };

  // Book Teleconsultation (eSanjeevani route)
  const handleBookTeleconsultation = () => {
    if (!profile || !currentSymptoms || !triageResult) return;

    setIsBookingInProgress(true);
    setTimeout(() => {
      const newConsultation = consultationService.createTeleconsultation(
        profile,
        currentSymptoms,
        triageResult
      );
      setActiveConsultation(newConsultation);
      setIsBookingInProgress(false);
      setActiveSubView('TRACKER');
      setActiveTab('tracking');
    }, 600);
  };

  // Track Consultation Updates
  const handleConsultationUpdated = (updated: ConsultationRequest) => {
    setActiveConsultation(updated);
  };

  // Consultation Journey Completed
  const handleJourneyCompleted = (summary: HealthcareJourneySummary) => {
    setActiveConsultation(null);
    setCompletedJourneySummary(summary);
    setIsSummaryModalOpen(true);

    // Refresh history and records from store
    setConsultationHistory(consultationService.getConsultationHistory());
    const refreshed = abhaService.getCurrentSession();
    if (refreshed) {
      setRecords(refreshed.records);
    }
  };

  // Handle Bottom Nav or Header Tab Changes
  const handleNavSelect = (tab: ActiveTab) => {
    setActiveTab(tab);
    if (tab === 'dashboard') setActiveSubView('DASHBOARD');
    else if (tab === 'triage') setActiveSubView('SYMPTOMS');
    else if (tab === 'tracking') {
      if (activeConsultation) setActiveSubView('TRACKER');
      else setActiveSubView('HISTORY');
    } else if (tab === 'records') setActiveSubView('RECORDS');
  };

  return (
    <div className="sugastha-app-root">
      {/* Top Application Header */}
      <Header
        profile={profile}
        activeConsultation={activeConsultation}
        onOpenLogin={() => setIsLoginOpen(true)}
        onLogout={handleLogout}
        onViewActiveConsultation={() => {
          setActiveTab('tracking');
          setActiveSubView('TRACKER');
        }}
      />

      {/* Main Content Area */}
      <main className="container main-content-wrapper">
        {/* Navigation Breadcrumb Bar (Desktop / Tablet) */}
        <div className="view-switcher-bar">
          <button
            onClick={() => {
              setActiveTab('dashboard');
              setActiveSubView('DASHBOARD');
            }}
            className={`view-tab ${activeSubView === 'DASHBOARD' ? 'active' : ''}`}
          >
            Home
          </button>
          <button
            onClick={() => {
              setActiveTab('triage');
              setActiveSubView('SYMPTOMS');
            }}
            className={`view-tab ${
              activeSubView === 'SYMPTOMS' || activeSubView === 'TRIAGE_RESULT' || activeSubView === 'RECOMMENDATION'
                ? 'active'
                : ''
            }`}
          >
            Check Symptoms
          </button>
          {activeConsultation && (
            <button
              onClick={() => {
                setActiveTab('tracking');
                setActiveSubView('TRACKER');
              }}
              className={`view-tab ${activeSubView === 'TRACKER' ? 'active' : ''}`}
            >
              My Visit Status
            </button>
          )}
          <button
            onClick={() => {
              setActiveTab('records');
              setActiveSubView('RECORDS');
            }}
            className={`view-tab ${activeSubView === 'RECORDS' ? 'active' : ''}`}
          >
            My Health Records ({records.length})
          </button>
          <button
            onClick={() => {
              setActiveTab('tracking');
              setActiveSubView('HISTORY');
            }}
            className={`view-tab ${activeSubView === 'HISTORY' ? 'active' : ''}`}
          >
            Hospital Passes ({consultationHistory.length})
          </button>
        </div>

        {/* View 1: Home Dashboard */}
        {activeSubView === 'DASHBOARD' && profile && (
          <UserDashboard
            profile={profile}
            records={records}
            conditions={conditions}
            allergies={allergies}
            activeConsultation={activeConsultation}
            onStartNewConsultation={() => {
              setActiveTab('triage');
              setActiveSubView('SYMPTOMS');
            }}
            onOpenTracker={() => {
              setActiveTab('tracking');
              setActiveSubView('TRACKER');
            }}
            onOpenRecords={() => {
              setActiveTab('records');
              setActiveSubView('RECORDS');
            }}
            onOpenHistory={() => {
              setActiveTab('tracking');
              setActiveSubView('HISTORY');
            }}
          />
        )}

        {/* View 2: Symptom Input Form */}
        {activeSubView === 'SYMPTOMS' && profile && (
          <SymptomInputForm
            profile={profile}
            onSubmit={handleSymptomSubmit}
            isAnalyzing={isAnalyzingTriage}
          />
        )}

        {/* View 3: Triage Result Card */}
        {activeSubView === 'TRIAGE_RESULT' && triageResult && (
          <TriageResultCard
            triage={triageResult}
            onProceedRecommendation={handleProceedToRecommendation}
            onReevaluate={() => setActiveSubView('SYMPTOMS')}
          />
        )}

        {/* View 4: Recommendation View (eSanjeevani OR Hospital List) */}
        {activeSubView === 'RECOMMENDATION' && triageResult && profile && (
          <div className="recommendation-stage-wrap animate-fade-in">
            {triageResult.recommendedRoute === 'TELECONSULTATION' ? (
              <TeleconsultationCard
                triage={triageResult}
                profile={profile}
                onBookTeleconsultation={handleBookTeleconsultation}
                onSwitchToHospitalVisit={() => {
                  setTriageResult({
                    ...triageResult,
                    recommendedRoute: 'HOSPITAL_VISIT',
                  });
                }}
              />
            ) : (
              <HospitalList
                triage={triageResult}
                onSelectHospitalAndDoctor={handleSelectHospitalAndDoctor}
              />
            )}
          </div>
        )}

        {/* View 5: Live Consultation Tracker */}
        {activeSubView === 'TRACKER' && activeConsultation && (
          <ConsultationTracker
            consultation={activeConsultation}
            onConsultationUpdated={handleConsultationUpdated}
            onJourneyCompleted={handleJourneyCompleted}
          />
        )}

        {/* View 6: ABHA Health Records */}
        {activeSubView === 'RECORDS' && (
          <HealthRecordsView
            records={records}
            conditions={conditions}
            allergies={allergies}
            onStartTriage={() => {
              setActiveTab('triage');
              setActiveSubView('SYMPTOMS');
            }}
          />
        )}

        {/* View 7: Consultation Passes & History */}
        {activeSubView === 'HISTORY' && (
          <ConsultationHistory history={consultationHistory} />
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onSelectTab={handleNavSelect}
        hasActiveConsultation={!!activeConsultation}
      />

      {/* Modals */}
      <AbhaLoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onSuccess={handleLoginSuccess}
        onOpenRegister={() => setIsRegisterOpen(true)}
        onOpenRecover={() => setIsRecoverOpen(true)}
      />

      <AbhaRegisterModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onSuccess={handleRegisterSuccess}
        onBackToLogin={() => {
          setIsRegisterOpen(false);
          setIsLoginOpen(true);
        }}
      />

      <AbhaRecoverModal
        isOpen={isRecoverOpen}
        onClose={() => setIsRecoverOpen(false)}
        onSelectRecovered={handleRecoverSelection}
        onBackToLogin={() => {
          setIsRecoverOpen(false);
          setIsLoginOpen(true);
        }}
      />

      {pendingHospital && pendingDoctor && triageResult && profile && (
        <BookingConfirmationModal
          isOpen={isBookingModalOpen}
          onClose={() => setIsBookingModalOpen(false)}
          hospital={pendingHospital}
          doctor={pendingDoctor}
          triage={triageResult}
          profile={profile}
          onConfirmBooking={handleConfirmHospitalBooking}
          isBooking={isBookingInProgress}
        />
      )}

      <HealthcareJourneySummaryModal
        isOpen={isSummaryModalOpen}
        onClose={() => setIsSummaryModalOpen(false)}
        summary={completedJourneySummary}
        onSynced={() => {
          setActiveSubView('DASHBOARD');
          setActiveTab('dashboard');
        }}
      />

      <style>{`
        .sugastha-app-root {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }
        .main-content-wrapper {
          flex: 1;
          padding-top: 1.5rem;
          padding-bottom: 3rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .view-switcher-bar {
          display: flex;
          gap: 0.5rem;
          border-bottom: 1px solid var(--border-subtle);
          padding-bottom: 0.75rem;
          overflow-x: auto;
        }
        .view-tab {
          padding: 0.5rem 1rem;
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-muted);
          border-radius: var(--radius-sm);
          transition: all var(--transition-fast);
          white-space: nowrap;
        }
        .view-tab:hover {
          color: var(--text-primary);
          background: rgba(255, 255, 255, 0.05);
        }
        .view-tab.active {
          color: var(--brand-accent);
          background: rgba(14, 165, 233, 0.12);
          border: 1px solid rgba(14, 165, 233, 0.3);
        }
        .recommendation-stage-wrap {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        @media (max-width: 768px) {
          .view-switcher-bar {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};
