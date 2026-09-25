import React, { useState, useEffect } from 'react';
import { Header } from './components/common/Header';
import { BottomNav, ActiveTab } from './components/common/BottomNav';
import { AbhaLoginPage } from './components/auth/AbhaLoginPage';
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
import { UserProfileView } from './components/profile/UserProfileView';
import { ConsultationHistory } from './components/history/ConsultationHistory';
import { DoctorHistory } from './components/history/DoctorHistory';
import { HealthcareJourneySummaryModal } from './components/summary/HealthcareJourneySummaryModal';
import { LocationCaptureModal } from './components/auth/LocationCaptureModal';
import logoImage from '../images/logo.png';

import { abhaService } from './services/abhaService';
import { triageEngine } from './services/triageEngine';
import { consultationService } from './services/consultationService';
import { hospitalDashboardService, UserGeoLocation } from './services/hospitalDashboardService';

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

const USER_LOCATION_KEY = 'sugastha_user_location';

export const App: React.FC = () => {
  // ABHA Session State
  const [isInitializing, setIsInitializing] = useState(true);
  const [profile, setProfile] = useState<AbhaProfile | null>(null);
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [conditions, setConditions] = useState<ChronicCondition[]>([]);
  const [allergies, setAllergies] = useState<Allergy[]>([]);

  // Auth Modals State
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isRecoverOpen, setIsRecoverOpen] = useState(false);

  // Post-login location capture (used to find nearest government hospitals
  // via the connected hospital dashboard backend)
  const [showLocationCapture, setShowLocationCapture] = useState(false);
  const [pendingLoginData, setPendingLoginData] = useState<{
    profile: AbhaProfile;
    records: HealthRecord[];
    conditions: ChronicCondition[];
    allergies: Allergy[];
  } | null>(null);
  const [userLocation, setUserLocation] = useState<UserGeoLocation | null>(null);


  // Active View State
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [activeSubView, setActiveSubView] = useState<
    'DASHBOARD' | 'SYMPTOMS' | 'TRIAGE_RESULT' | 'RECOMMENDATION' | 'TRACKER' | 'RECORDS' | 'HISTORY' | 'CONSENTS' | 'PROFILE'
  >('DASHBOARD');

  // Triage & Booking Pipeline State
  const [currentSymptoms, setCurrentSymptoms] = useState<SymptomInput | null>(null);
  const [isAnalyzingTriage, setIsAnalyzingTriage] = useState(false);
  const [triageResult, setTriageResult] = useState<TriageResult | null>(null);

  // Selected Hospital / Doctor for Booking
  const [pendingHospital, setPendingHospital] = useState<Hospital | null>(null);
  const [pendingDoctor, setPendingDoctor] = useState<Doctor | null>(null);
  const [pendingUserLocation, setPendingUserLocation] = useState<
    { latitude: number; longitude: number } | null
  >(null);
  const [pendingNearbyHospitals, setPendingNearbyHospitals] = useState<Hospital[]>([]);
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

    try {
      const savedLocation = window.localStorage.getItem(USER_LOCATION_KEY);
      if (savedLocation) {
        setUserLocation(JSON.parse(savedLocation));
      }
    } catch {
      // Ignore invalid stored location
    }

    const loadingTimer = window.setTimeout(() => setIsInitializing(false), 3000);
    return () => window.clearTimeout(loadingTimer);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeTab, activeSubView]);

  // Handle Login Success
  const handleLoginSuccess = (data: {
    profile: AbhaProfile;
    records: HealthRecord[];
    conditions: ChronicCondition[];
    allergies: Allergy[];
  }) => {
    // Defer entering the dashboard until the user has shared (or skipped)
    // their location, so we can immediately show nearest government
    // hospitals from the connected hospital dashboard.
    setPendingLoginData(data);
    setShowLocationCapture(true);
  };

  // Finish login after the location step: apply the ABHA session, persist
  // the location (if given), and enter the dashboard.
  const finalizeLogin = (location: UserGeoLocation | null) => {
    if (!pendingLoginData) return;
    setProfile(pendingLoginData.profile);
    setRecords(pendingLoginData.records);
    setConditions(pendingLoginData.conditions);
    setAllergies(pendingLoginData.allergies);
    setActiveTab('dashboard');
    setActiveSubView('DASHBOARD');
    setShowLocationCapture(false);
    setPendingLoginData(null);

    if (location) {
      setUserLocation(location);
      try {
        window.localStorage.setItem(USER_LOCATION_KEY, JSON.stringify(location));
      } catch {
        // Ignore storage errors (e.g. private browsing quota)
      }
    }
  };

  const handleLocationCaptured = (location: UserGeoLocation) => {
    finalizeLogin(location);
  };

  const handleLocationSkipped = () => {
    finalizeLogin(null);
  };

  // Re-open the location capture flow at any time (e.g. "Update location"
  // button on the Nearest Government Hospitals card).
  const handleRequestLocationUpdate = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = { latitude: position.coords.latitude, longitude: position.coords.longitude };
        setUserLocation(location);
        try {
          window.localStorage.setItem(USER_LOCATION_KEY, JSON.stringify(location));
        } catch {
          // Ignore storage errors
        }
      },
      () => {
        // Silently ignore denial; the card keeps its existing state.
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Book directly at a hospital selected from the Nearest Government
  // Hospitals card (skips manual doctor selection; a front-desk doctor
  // assignment is used and refined once the hospital accepts the request).
  const handleBookAtGovtHospital = (hospital: Hospital) => {
    const placeholderDoctor: Doctor = {
      id: 'unassigned',
      name: 'To be assigned at hospital desk',
      specialization: triageResult?.suggestedSpecialties?.[0] || 'General Medicine',
      qualifications: 'Assigned on arrival',
      experienceYears: 0,
      availableSlotToday: "Today's OPD Queue",
      rating: 0,
      languages: ['English', 'Hindi'],
    };
    handleSelectHospitalAndDoctor(hospital, placeholderDoctor, userLocation ?? undefined, [hospital]);
  };

  // Handle Registration Success
  const handleRegisterSuccess = (newProfile: AbhaProfile) => {
    const session = abhaService.getCurrentSession();
    const data = session
      ? {
          profile: session.profile,
          records: session.records,
          conditions: session.conditions,
          allergies: session.allergies,
        }
      : { profile: newProfile, records: [], conditions: [], allergies: [] };

    // Route through the same location-capture step as a normal login, so a
    // freshly registered account also gets nearest-government-hospital
    // recommendations from the first moment they land on the dashboard.
    setIsRegisterOpen(false);
    setPendingLoginData(data);
    setShowLocationCapture(true);
  };

  // Handle Recovery Selection
  const handleRecoverSelection = async (recoveredAbhaNumber: string) => {
    const session = await abhaService.login(recoveredAbhaNumber, 'OTP', '123456');
    handleLoginSuccess(session);
  };

  // Handle Logout
  const handleLogout = () => {
    abhaService.logout();
    window.localStorage.removeItem('sugastha_dashboard_state');
    setProfile(null);
    setRecords([]);
    setConditions([]);
    setAllergies([]);
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

  // Option selected from Home Dashboard (eSanjeevani or Hospital Dashboard)
  const handleHomeOptionSelect = (symptomText: string, route: 'TELECONSULTATION' | 'HOSPITAL_VISIT') => {
    const inputList = symptomText
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const symptoms: SymptomInput = {
      primarySymptoms: inputList.length > 0 ? inputList : ['General Health Checkup'],
      durationDays: 1,
      painScale: 2,
      bodyRegion: 'General',
      additionalNotes: 'Entered via Home Page',
      hasRedFlags: {},
    };

    setCurrentSymptoms(symptoms);
    const result = triageEngine.evaluateTriage(symptoms, conditions, records, allergies);
    result.recommendedRoute = route;
    setTriageResult(result);
    setActiveSubView('RECOMMENDATION');
  };

  // Proceed from Triage Result to Recommendation
  const handleProceedToRecommendation = () => {
    setActiveSubView('RECOMMENDATION');
  };

  // Switch between physical hospital and teleconsultation
  const handleSelectHospitalAndDoctor = (
    hosp: Hospital,
    doc: Doctor,
    userLocation?: { latitude: number; longitude: number },
    nearbyHospitals?: Hospital[]
  ) => {
    setPendingHospital(hosp);
    setPendingDoctor(doc);
    setPendingUserLocation(userLocation ?? null);
    setPendingNearbyHospitals(nearbyHospitals ?? [hosp]);
    setIsBookingModalOpen(true);
  };

  // Confirm and Book Hospital Consultation (3-Tier Queue Buffering)
  const handleConfirmHospitalBooking = () => {
    if (!profile || !pendingHospital || !pendingDoctor) return;

    // Fallback symptoms & triage if user selected doctor directly from home page
    const symptomsToUse: SymptomInput = currentSymptoms || {
      primarySymptoms: ['General Health Consultation'],
      durationDays: 1,
      painScale: 2,
      bodyRegion: 'General',
      additionalNotes: 'Direct Doctor Appointment Booking from Home Dashboard',
      hasRedFlags: {},
    };

    const triageToUse: TriageResult = triageResult || {
      level: 'GREEN',
      title: 'Routine General Consultation',
      category: 'OPD Checkup',
      summary: 'Direct appointment requested for general specialist evaluation.',
      urgencyWindow: 'Routine / 24-48 hours',
      recommendedRoute: 'HOSPITAL_VISIT',
      clinicalFactors: [],
      suggestedSpecialties: [pendingDoctor.specialization],
      vitalsRiskScore: 10,
      warningFlags: [],
    };

    setIsBookingInProgress(true);
    setTimeout(() => {
      const newConsultation = consultationService.createConsultation(
        profile,
        symptomsToUse,
        triageToUse,
        pendingHospital,
        pendingDoctor
      );
      setActiveConsultation(newConsultation);
      setIsBookingInProgress(false);
      setIsBookingModalOpen(false);
      setActiveSubView('TRACKER');
      setActiveTab('tracking');

      // Push the freshly-generated QR/5-digit token booking to the hospital
      // dashboard so it appears in that hospital's live queue. Best-effort:
      // this never blocks or breaks the citizen-side booking flow.
      hospitalDashboardService
        .pushAppointmentToHospitalDashboard(profile, newConsultation, triageToUse)
        .then((result) => {
          if (!result.ok) {
            console.warn('Could not sync this consultation to the hospital dashboard yet.');
          }
        });
    }, 800);
  };

  // Book Teleconsultation (eSanjeevani route)
  const handleBookTeleconsultation = () => {
    if (!profile) return;

    const symptomsToUse = currentSymptoms || {
      primarySymptoms: ['General Health Consultation'],
      durationDays: 1,
      painScale: 1,
      bodyRegion: 'General',
      additionalNotes: 'Online Teleconsultation',
      hasRedFlags: {},
    };

    const triageToUse = triageResult || {
      level: 'GREEN',
      title: 'Routine Teleconsultation',
      category: 'eSanjeevani Online',
      summary: 'Routine online video consultation request.',
      urgencyWindow: 'Routine / 24-48 hours',
      recommendedRoute: 'TELECONSULTATION',
      clinicalFactors: [],
      suggestedSpecialties: ['General Medicine'],
      vitalsRiskScore: 10,
      warningFlags: [],
    };

    setIsBookingInProgress(true);
    setTimeout(() => {
      const newConsultation = consultationService.createTeleconsultation(
        profile,
        symptomsToUse,
        triageToUse
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
    else if (tab === 'appointments' || tab === 'tracking') {
      if (activeConsultation) setActiveSubView('TRACKER');
      else setActiveSubView('HISTORY');
    } else if (tab === 'consents') setActiveSubView('CONSENTS');
    else if (tab === 'records') setActiveSubView('RECORDS');
    else if (tab === 'profile') setActiveSubView('PROFILE');
    else if (tab === 'doctors') setActiveSubView('SYMPTOMS');
  };

  if (isInitializing) {
    return (
      <main className="sugastha-loading-screen" aria-live="polite" aria-label="Loading SUGASTHA">
        <div className="loading-brand-lockup">
          <img src={logoImage} alt="SUGASTHA logo" className="loading-logo" />
          <div className="loading-brand-name">SUGASTHA</div>
          <div className="loading-progress" aria-hidden="true">
            <span />
          </div>
          <p className="loading-status">Preparing your health dashboard</p>
        </div>
      </main>
    );
  }

  // Show full-page login when not authenticated
  if (!profile) {
    return (
      <>
        <AbhaLoginPage
          onSuccess={handleLoginSuccess}
          onOpenRegister={() => setIsRegisterOpen(true)}
          onOpenRecover={() => setIsRecoverOpen(true)}
        />

        <AbhaRegisterModal
          isOpen={isRegisterOpen}
          onClose={() => setIsRegisterOpen(false)}
          onSuccess={handleRegisterSuccess}
          onBackToLogin={() => setIsRegisterOpen(false)}
        />

        <AbhaRecoverModal
          isOpen={isRecoverOpen}
          onClose={() => setIsRecoverOpen(false)}
          onSelectRecovered={handleRecoverSelection}
          onBackToLogin={() => setIsRecoverOpen(false)}
        />

        {pendingLoginData && (
          <LocationCaptureModal
            isOpen={showLocationCapture}
            patientName={pendingLoginData.profile.fullName}
            onLocationCaptured={handleLocationCaptured}
            onSkip={handleLocationSkipped}
          />
        )}
      </>
    );
  }

  return (
    <div className="sugastha-app-root">
      {/* Top Application Header */}
      <Header
        profile={profile}
        activeConsultation={activeConsultation}
        onOpenLogin={handleLogout}
        onLogout={handleLogout}
        onOpenProfile={() => {
          setActiveTab('profile');
          setActiveSubView('PROFILE');
        }}
        onGoHome={() => {
          setActiveTab('dashboard');
          setActiveSubView('DASHBOARD');
        }}
        activeTab={activeTab}
        activeSubView={activeSubView}
        onSelectTab={handleNavSelect}
        recordsCount={records.length}
        historyCount={consultationHistory.length}
      />

      {/* Main Content Area */}
      <main className="container main-content-wrapper">

        {/* View 1: Home Dashboard */}
        {activeSubView === 'DASHBOARD' && profile && (
          <UserDashboard
            profile={profile}
            records={records}
            conditions={conditions}
            allergies={allergies}
            userLocation={userLocation}
            onRequestLocation={handleRequestLocationUpdate}
            onBookAtGovtHospital={handleBookAtGovtHospital}
            onStartNewConsultation={() => {
              setActiveTab('triage');
              setActiveSubView('SYMPTOMS');
            }}
            onOpenRecords={() => {
              setActiveTab('records');
              setActiveSubView('RECORDS');
            }}
            onOpenHistory={() => {
              setActiveTab('tracking');
              setActiveSubView('HISTORY');
            }}
            onSelectHospitalAndDoctor={handleSelectHospitalAndDoctor}
            onSelectOption={handleHomeOptionSelect}
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
            profile={profile}
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

        {/* View 8: Doctor Consultation History */}
        {activeSubView === 'CONSENTS' && (
          <DoctorHistory history={consultationHistory} />
        )}

        {/* View 9: User Profile & Account Management */}
        {activeSubView === 'PROFILE' && profile && (
          <UserProfileView
            profile={profile}
            onLogout={handleLogout}
            onUpdateProfile={(updated) => setProfile(updated)}
          />
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onSelectTab={handleNavSelect}
        hasActiveConsultation={!!activeConsultation}
      />

      {/* Modals */}
      <AbhaRegisterModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onSuccess={handleRegisterSuccess}
        onBackToLogin={() => setIsRegisterOpen(false)}
      />

      <AbhaRecoverModal
        isOpen={isRecoverOpen}
        onClose={() => setIsRecoverOpen(false)}
        onSelectRecovered={handleRecoverSelection}
        onBackToLogin={() => setIsRecoverOpen(false)}
      />

      {pendingHospital && pendingDoctor && profile && (
        <BookingConfirmationModal
          isOpen={isBookingModalOpen}
          onClose={() => setIsBookingModalOpen(false)}
          hospital={pendingHospital}
          doctor={pendingDoctor}
          userLocation={pendingUserLocation}
          nearbyHospitals={pendingNearbyHospitals}
          triage={
            triageResult || {
              level: 'GREEN',
              title: 'General Consultation',
              category: 'OPD Checkup',
              summary: 'Direct doctor consultation request.',
              urgencyWindow: 'Routine / 24-48 hours',
              recommendedRoute: 'HOSPITAL_VISIT',
              clinicalFactors: [],
              suggestedSpecialties: [pendingDoctor.specialization],
              vitalsRiskScore: 10,
              warningFlags: [],
            }
          }
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
          padding-top: 0.875rem;
          padding-bottom: 2rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .view-switcher-bar {
          display: flex;
          gap: 0.5rem;
          border-bottom: 1px solid var(--border-light);
          padding-bottom: 0.75rem;
          overflow-x: auto;
        }
        .view-tab {
          padding: 0.5rem 1rem;
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-muted);
          border-radius: var(--radius-full);
          transition: all var(--transition-fast);
          white-space: nowrap;
        }
        .view-tab:hover {
          color: var(--dark-navy-text);
          background: var(--pastel-light-blue);
        }
        .view-tab.active {
          color: var(--brand-primary);
          background: var(--pastel-light-blue);
          border: 1px solid var(--pastel-sky-blue);
        }
        .recommendation-stage-wrap {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        @media (min-width: 769px) {
          .main-content-wrapper {
            padding-top: 1.25rem;
            padding-bottom: 3rem;
            gap: 1.25rem;
          }
        }
        @media (min-width: 1100px) {
          .main-content-wrapper {
            padding-top: 1.5rem;
            gap: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
};
