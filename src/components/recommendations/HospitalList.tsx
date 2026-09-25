import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  MapPin,
  Car,
  Clock,
  UserCheck,
  CheckCircle,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { Hospital, Doctor, TriageResult } from '../../types';
import { hospitalQueueService } from '../../services/hospitalQueueService';
import { hospitalDashboardService } from '../../services/hospitalDashboardService';

interface HospitalListProps {
  triage: TriageResult;
  onSelectHospitalAndDoctor: (
    hospital: Hospital,
    doctor: Doctor,
    userLocation?: { latitude: number; longitude: number },
    nearbyHospitals?: Hospital[]
  ) => void;
}

export const HospitalList: React.FC<HospitalListProps> = ({
  triage,
  onSelectHospitalAndDoctor,
}) => {
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState<
    'idle' | 'loading' | 'granted' | 'denied' | 'unsupported' | 'unreachable' | 'no-hospitals' | 'no-doctors'
  >('idle');
  const { t, i18n } = useTranslation();
  const languageCode = i18n.language.startsWith('hi') ? 'hi' : i18n.language.startsWith('kn') ? 'kn' : i18n.language.startsWith('mr') ? 'mr' : i18n.language.startsWith('ta') ? 'ta' : i18n.language.startsWith('te') ? 'te' : 'en';
  const hospitalNameMap: Record<string, string> = {
    'AIIMS (All India Institute of Medical Sciences)': { en: 'AIIMS (All India Institute of Medical Sciences)', hi: 'एम्स (ऑल इंडिया इंस्टीट्यूट ऑफ मेडिकल साइंसेज)', kn: 'AIIMS (ಎಲ್ಲ ಭಾರತ ವೈದ್ಯಕೀಯ ವಿಜ್ಞಾನಗಳ ಸಂಸ್ಥೆ)', mr: 'एम्स (ऑल इंडिया इन्स्टिट्यूट ऑफ मेडिकल सायन्सेस)', ta: 'AIIMS (அனைத்திந்திய மருத்துவ அறிவியல் நிறுவனம்)', te: 'AIIMS (అన్ని భారత వైద్య శాస్త్రాల సంస్థ)' }[languageCode],
    'VMMMC & Safdarjung Hospital': { en: 'VMMMC & Safdarjung Hospital', hi: 'वीएमएमएमसी एंड सफदरजंग अस्पताल', kn: 'VMMMC & ಸಫ್ದರ್ಜಂಗ ಆಸ್ಪತ್ರೆ', mr: 'VMMMC & सफदरजंग रुग्णालय', ta: 'VMMMC & சஃப்தர்ஜங் மருத்துவமனை', te: 'VMMMC & సఫ్దర్జంగ్ ఆసుపత్రి' }[languageCode],
    'Max Super Speciality Hospital': { en: 'Max Super Speciality Hospital', hi: 'मैक्स सुपर स्पेशियलिटी अस्पताल', kn: 'ಮ್ಯಾಕ್ಸ್ ಸೂಪರ್ ಸ್ಪೆಷಾಲಿಟಿ ಆಸ್ಪತ್ರೆ', mr: 'मॅक्स सुपर स्पेशालिटी रुग्णालय', ta: 'மக்ஸ் சூப்பர் ஸ்பெஷாலிட்டி மருத்துவமனை', te: 'మ్యాక్స్ సూపర్ స్పెషాలిటీ ఆసుపత్రి' }[languageCode],
    'Indraprastha Apollo Hospital': { en: 'Indraprastha Apollo Hospital', hi: 'इंद्रप्रस्थ अपोलो अस्पताल', kn: 'ಇಂದ್ರಪ್ರಸ್ಥ ಅಪೋಲೋ ಆಸ್ಪತ್ರೆ', mr: 'इंद्रप्रस्थ अपोलो रुग्णालय', ta: 'இந்திரபிரஸ்தா அப்பல்லோ மருத்துவமனை', te: 'ఇంద్రప్రస్థ అపోలో ఆసుపత్రి' }[languageCode],
    'Acharya Shree Bhikshu District Hospital': { en: 'Acharya Shree Bhikshu District Hospital', hi: 'आचार्य श्री भिक्षु जिला अस्पताल', kn: 'ಅಚಾರ್ಯ ಶ್ರೀ ಭಿಕ್ಷು ಜಿಲ್ಲೆ ಆಸ್ಪತ್ರೆ', mr: 'आचार्य श्री भिक्षु जिल्हा रुग्णालय', ta: 'ஆச்சார்யா ஸ்ரீ பிக்ஷு மாவட்ட மருத்துவமனை', te: 'ఆచార్య శ్రీ భిక్షు జిల్లా ఆసుపత్రి' }[languageCode],
  };
  const doctorNameMap: Record<string, string> = {
    'Dr. Vivek Sharma': { en: 'Dr. Vivek Sharma', hi: 'डॉ. विवेक शर्मा', kn: 'ಡಾ. ವಿವೇಕ ಶರ್ಮಾ', mr: 'डॉ. विवेक शर्मा', ta: 'டாக்டர் விவேக் ஷர்மா', te: 'డా. వివేక్ శర్మ' }[languageCode],
    'Dr. Suniti Singhania': { en: 'Dr. Suniti Singhania', hi: 'डॉ. सुनिती सिंग्हानिया', kn: 'ಡಾ. ಸುನಿತಿ ಸಿಂಗ್‌ಹಾನಿಯಾ', mr: 'डॉ. सुनिती सिंगहनिया', ta: 'டாக்டர் சுனிதி சிங்ஹானியா', te: 'డా. సునితి సింగ్‌హానియా' }[languageCode],
    'Dr. Arvind Mehra': { en: 'Dr. Arvind Mehra', hi: 'डॉ. अरविंद मेहरा', kn: 'ಡಾ. ಅರ್ವಿಂದ ಮೆಹ್ರಾ', mr: 'डॉ. अरविंद मेहरा', ta: 'டாக்டர் அர்விந்த் மெஹ்ரா', te: 'డా. అర్వింద్ మెహ్రా' }[languageCode],
    'Dr. Rajeshwari Nair': { en: 'Dr. Rajeshwari Nair', hi: 'डॉ. राजेश्वरी नायर', kn: 'ಡಾ. ರಾಜೇಶ್ವರಿ ನಾಯರ್', mr: 'डॉ. राजेश्वरी नायर', ta: 'டாக்டர் ராஜேஷ்வரி நாயர்', te: 'డా. రాజేశ్వరి నాయర్' }[languageCode],
    'Dr. Harsh Vardhan Rao': { en: 'Dr. Harsh Vardhan Rao', hi: 'डॉ. हर्ष वर्धन राव', kn: 'ಡಾ. ಹರಷ್ ವರ್ಧನ್ ರಾವ್', mr: 'डॉ. हर्षवर्धन राव', ta: 'டாக்டர் ஹர்ஷ் வர்தன் ராவ்', te: 'డా. హర్ష్ వర్థన్ రావ్' }[languageCode],
    'Dr. Anupam Sachdev': { en: 'Dr. Anupam Sachdev', hi: 'डॉ. अनुपम सचदेव', kn: 'ಡಾ. ಅನೂಪಮ್ ಸಚ್ಚದೇವ್', mr: 'डॉ. अनुपम साचदेव', ta: 'டாக்டர் ஆனுப்பம் சச்சதேவ்', te: 'డా. అనుపమ్ సచ్దేవ్' }[languageCode],
    'Dr. Shalini Taneja': { en: 'Dr. Shalini Taneja', hi: 'डॉ. शालिनी तनेजा', kn: 'ಡಾ. ಶಾಲಿನಿ ತನೆಜಾ', mr: 'डॉ. शालिनी तनेजा', ta: 'டாக்டர் ஷாலினி தானேஜா', te: 'డా. శాలిని తానెజా' }[languageCode],
    'Dr. Preeti Khosla': { en: 'Dr. Preeti Khosla', hi: 'डॉ. प्रीति खोसला', kn: 'ಡಾ. ಪ್ರೀತಿ ಖೋಸ್ಲಾ', mr: 'डॉ. प्रीति खोसला', ta: 'டாக்டர் ப்ரீதி கோஸ்லா', te: 'డా. ప్రీతి ఖోస్లా' }[languageCode],
    'Dr. Manoj Saxena': { en: 'Dr. Manoj Saxena', hi: 'डॉ. मनोज सक्सेना', kn: 'ಡಾ. ಮನೋಜ್ ಸಕ್ಸೆನಾ', mr: 'डॉ. मनोज सक्सेना', ta: 'டாக்டர் மனோஜ் சாக்சேனா', te: 'డా. మనోజ్ సక్సేన' }[languageCode],
    'Dr. K. N. Bhardwaj': { en: 'Dr. K. N. Bhardwaj', hi: 'डॉ. के. एन. भारद्वाज', kn: 'ಡಾ. ಕೆ. ಎನ್. ಭಾರದ್ವಾಜ್', mr: 'डॉ. के. एन. भारद्वाज', ta: 'டாக்டர் கே. என். பார்த்வாஜ்', te: 'డా. కె. ఎన్. భారద్వాజ్' }[languageCode],
    'Dr. Ananya Rao': { en: 'Dr. Ananya Rao', hi: 'डॉ. अनन्या राव', kn: 'ಡಾ. ಅನನ್ಯ ರಾವ್', mr: 'डॉ. अनन्या राव', ta: 'டாக்டர் அனன்யா ராவ்', te: 'డా. అనన్య రావు' }[languageCode],
    'Dr. Arjun Nair': { en: 'Dr. Arjun Nair', hi: 'डॉ. अर्जुन नायर', kn: 'ಡಾ. ಅರ್ಜುನ್ ನಾಯರ್', mr: 'डॉ. अर्जुन नायर', ta: 'டாக்டர் அர்ஜுன் நாயர்', te: 'డా. అర్జున్ నాయర్' }[languageCode],
    'Dr. Meera Sharma': { en: 'Dr. Meera Sharma', hi: 'डॉ. मीरा शर्मा', kn: 'ಡಾ. ಮೀನಾ ಶರ್ಮಾ', mr: 'डॉ. मीरा शर्मा', ta: 'டாக்டர் மீரா ஷர்மா', te: 'డా. మీరా శర్మ' }[languageCode],
    'Dr. Rahul Menon': { en: 'Dr. Rahul Menon', hi: 'डॉ. राहुल मेनन', kn: 'ಡಾ. ರಾಹುಲ್ ಮೇನನ್', mr: 'डॉ. राहुल मेनन', ta: 'டாக்டர் ரஹுல் மேனன்', te: 'డా. రాహుల్ మేనన్' }[languageCode],
  };
  const [hospitals, setHospitals] = useState<Hospital[]>([]);

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationStatus('unsupported');
      setHospitals([]);
      return;
    }

    setLocationStatus('loading');
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const nextLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        setUserLocation(nextLocation);
        setLocationStatus('granted');

        let registeredHospitals: Hospital[];
        try {
          registeredHospitals = await hospitalDashboardService.getNearbyHospitals(nextLocation);
        } catch {
          setHospitals([]);
          setLocationStatus('unreachable');
          return;
        }

        if (!registeredHospitals.length) {
          setHospitals([]);
          setLocationStatus('no-hospitals');
          return;
        }

        const connectedHospitals = registeredHospitals.filter((hospital) => hospital.doctors.length > 0);
        setHospitals(connectedHospitals);
        if (!connectedHospitals.length) {
          setLocationStatus('no-doctors');
        }
      },
      () => {
        setLocationStatus('denied');
        setHospitals([]);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  }, [triage]);

  const baseHospitals = hospitals;

  // Selected hospital and doctor states
  const [selectedHospId, setSelectedHospId] = useState<string>(baseHospitals[0]?.id || '');
  const [selectedDocIdByHosp, setSelectedDocIdByHosp] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    baseHospitals.forEach((h) => {
      const bestDoc = hospitalQueueService.getBestMatchingDoctor(h, triage);
      initial[h.id] = bestDoc.id;
    });
    return initial;
  });

  useEffect(() => {
    if (!hospitals.length) return;

    if (!selectedHospId || !hospitals.some((h) => h.id === selectedHospId)) {
      setSelectedHospId(hospitals[0].id);
    }
  }, [hospitals, selectedHospId]);

  const handleDoctorChange = (hospId: string, docId: string) => {
    setSelectedDocIdByHosp({
      ...selectedDocIdByHosp,
      [hospId]: docId,
    });
  };

  const currentHospital = hospitals.find((h) => h.id === selectedHospId) || hospitals[0] || null;
  const demoDoctorFallbacks: Doctor[] = [
    {
      id: 'demo-doctor-ananya-rao',
      name: t('providers.doctors.ananyaRao'),
      specialization: t('providers.specializations.generalMedicine'),
      qualifications: 'Demo Physician • Prototype Only',
      experienceYears: 10,
      availableSlotToday: t('providers.demoAvailability'),
      rating: 4.7,
      languages: ['English', 'Hindi'],
    },
    {
      id: 'demo-doctor-arjun-nair',
      name: t('providers.doctors.arjunNair'),
      specialization: t('providers.specializations.cardiology'),
      qualifications: 'Demo Specialist • Prototype Only',
      experienceYears: 12,
      availableSlotToday: t('providers.demoAvailability'),
      rating: 4.8,
      languages: ['English', 'Hindi', 'Malayalam'],
    },
    {
      id: 'demo-doctor-meera-sharma',
      name: t('providers.doctors.meeraSharma'),
      specialization: t('providers.specializations.neurology'),
      qualifications: 'Demo Specialist • Prototype Only',
      experienceYears: 9,
      availableSlotToday: t('providers.demoAvailability'),
      rating: 4.6,
      languages: ['English', 'Hindi'],
    },
    {
      id: 'demo-doctor-rahul-menon',
      name: t('providers.doctors.rahulMenon'),
      specialization: t('providers.specializations.orthopedics'),
      qualifications: 'Demo Specialist • Prototype Only',
      experienceYears: 11,
      availableSlotToday: t('providers.demoAvailability'),
      rating: 4.7,
      languages: ['English', 'Hindi', 'Tamil'],
    },
  ];

  const currentDoctorList = currentHospital?.doctors?.length ? currentHospital.doctors : demoDoctorFallbacks;
  const currentDocId = currentHospital ? (selectedDocIdByHosp[currentHospital.id] || currentDoctorList[0].id) : currentDoctorList[0].id;
  const currentDoctor = currentDoctorList.find((d) => d.id === currentDocId) || currentDoctorList[0];

  const handleProceed = () => {
    if (!currentHospital) return;
    onSelectHospitalAndDoctor(
      currentHospital,
      currentDoctor,
      userLocation ?? undefined,
      hospitals.length ? hospitals : baseHospitals
    );
  };

  return (
    <div className="hospital-rec-container animate-fade-in">
      {/* Header Banner */}
      <div className="rec-header">
        <div>
          <h2 className="rec-title">{t('recommendations.chooseHospital')}</h2>
        </div>

        {userLocation && (
          <div className="queue-tip-card location-tip-card">
            <MapPin size={18} className="text-teal flex-shrink-0" />
            <div className="queue-tip-text">
              <strong>Nearby hospitals are ranked using your current location.</strong>
              <div className="location-coords">
                Current location: {userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)}
              </div>
            </div>
          </div>
        )}

        {locationStatus === 'denied' && (
          <div className="queue-tip-card location-tip-card">
            <MapPin size={18} className="text-teal flex-shrink-0" />
            <div className="queue-tip-text">
              <strong>Location access was not shared, so nearby hospitals cannot be verified.</strong>
              <div>Allow location access in your browser settings and try again.</div>
            </div>
          </div>
        )}

        {locationStatus === 'unsupported' && (
          <div className="queue-tip-card location-tip-card">
            <MapPin size={18} className="text-teal flex-shrink-0" />
            <div className="queue-tip-text">
              <strong>This browser does not support location access, so nearby hospitals cannot be verified.</strong>
            </div>
          </div>
        )}

        {/* 3-Tier Queue Info Card */}
        <div className="queue-tip-card">
          <ShieldCheck size={18} className="text-teal flex-shrink-0" />
          <div className="queue-tip-text">
            <strong>{t('recommendations.queueTip')}</strong>
          </div>
        </div>
      </div>

      {/* Hospital Cards Feed */}
      {(!hospitals.length && locationStatus === 'loading') && (
        <div className="queue-tip-card location-tip-card">
          <MapPin size={18} className="text-teal flex-shrink-0" />
          <div className="queue-tip-text">
            <strong>Finding nearby hospitals from your current location…</strong>
          </div>
        </div>
      )}

      {locationStatus === 'no-hospitals' && (
        <div className="queue-tip-card location-tip-card" role="status">
          <MapPin size={18} className="text-teal flex-shrink-0" />
          <div className="queue-tip-text">
            <strong>No hospitals are registered in the connected hospital network yet.</strong>
            <div>Please try again later or contact local emergency services if this is urgent.</div>
          </div>
        </div>
      )}

      {locationStatus === 'no-doctors' && (
        <div className="queue-tip-card location-tip-card" role="status">
          <UserCheck size={18} className="text-teal flex-shrink-0" />
          <div className="queue-tip-text">
            <strong>Hospitals were found, but no doctors are listed as available.</strong>
            <div>Please try again later or contact the hospital directly.</div>
          </div>
        </div>
      )}

      {locationStatus === 'unreachable' && (
        <div className="queue-tip-card location-tip-card" role="alert">
          <MapPin size={18} className="text-teal flex-shrink-0" />
          <div className="queue-tip-text">
            <strong>Could not connect to the hospital network.</strong>
            <div>Please try again later or use local emergency services if this is urgent.</div>
          </div>
        </div>
      )}

      {hospitals.length > 0 && (
        <div className="hospitals-list-feed">
          {hospitals.map((hosp, index) => {
            const isSelectedHosp = hosp.id === selectedHospId;
            const doctorList = hosp.doctors?.length ? hosp.doctors : demoDoctorFallbacks;
            const activeDocId = selectedDocIdByHosp[hosp.id] || doctorList[0].id;
            const activeDoc = doctorList.find((d) => d.id === activeDocId) || doctorList[0];

            return (
              <div
                key={hosp.id}
                onClick={() => setSelectedHospId(hosp.id)}
                className={`card hospital-card card-interactive ${
                  isSelectedHosp ? 'selected-hospital-card' : ''
                }`}
              >
                {/* Card Top: Name, Distance & Accreditation */}
                <div className="hosp-card-header">
                  <div className="hosp-main-info">
                    <div className="rank-indicator">{index === 0 ? '★' : index + 1}</div>
                    <div>
                      <div className="hosp-name-row">
                        <h3 className="hosp-name">{hospitalNameMap[hosp.name] ?? hosp.name}</h3>
                        {index === 0 && <span className="nabh-badge">{t('recommendations.bestMatch')}</span>}
                      </div>
                      <div className="hosp-address">
                        <MapPin size={13} className="text-muted" />
                        <span>{hosp.address}</span>
                      </div>
                    </div>
                  </div>

                  {/* Selection Radio Indicator */}
                  <div className={`selection-radio ${isSelectedHosp ? 'checked' : ''}`}>
                    {isSelectedHosp && <div className="radio-inner"></div>}
                  </div>
                </div>

                {/* Travel & Wait Strip */}
                <div className="travel-fare-strip">
                  <div className="strip-item">
                    <MapPin size={14} className="text-teal" />
                    <span className="strip-val">{hosp.distanceKm} km</span>
                    <span className="strip-sub">{t('recommendations.away')}</span>
                  </div>

                  <div className="strip-item">
                    <Clock size={14} className="text-amber" />
                    <span className="strip-val">~{hosp.estimatedTravelTimeMinutes} mins</span>
                    <span className="strip-sub">{t('recommendations.travel')}</span>
                  </div>

                  <div className="strip-item fare-item">
                    <Car size={14} className="text-emerald" />
                    <div className="fare-col">
                      <span className="strip-val">
                        {hosp.source === 'LIVE_OSM' ? t('recommendations.liveData') : `₹${hosp.fareEstimates.autoFare} - ₹${hosp.fareEstimates.cabFare}`}
                      </span>
                      <span className="strip-sub">{hosp.source === 'LIVE_OSM' ? t('recommendations.source') : t('recommendations.autoCab')}</span>
                    </div>
                  </div>

                  <div className="strip-item desk-item">
                    <span className={`status-dot ${hosp.emergencyQueueStatus === 'NORMAL' ? 'dot-green' : 'dot-yellow'}`}></span>
                    <span className="strip-val">
                      {hosp.availabilityNote ? 'Live queue status pending' : (hosp.emergencyQueueStatus === 'NORMAL' ? t('recommendations.steadyFlow') : t('recommendations.moderateWait'))}
                    </span>
                    <span className="strip-sub">{t('recommendations.now')}</span>
                  </div>
                </div>

                {/* Doctor Selection Section */}
                <div className="doctor-select-section">
                  <div className="doc-section-title">
                    <UserCheck size={15} className="text-teal" />
                    <span>{t('recommendations.doctors')}</span>
                  </div>

                  <div className="doctors-chips-grid" aria-label={`Doctors at ${hosp.name}`}>
                    {doctorList.map((doc) => {
                      const isDocSelected = doc.id === activeDocId;
                      return (
                        <div
                          key={doc.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedHospId(hosp.id);
                            handleDoctorChange(hosp.id, doc.id);
                          }}
                          className={`doc-chip ${isDocSelected ? 'active-doc-chip' : ''}`}
                        >
                          <div className="doc-chip-top">
                            <strong className="doc-name">{doctorNameMap[doc.name] ?? doc.name}</strong>
                          </div>
                          <span className="doc-spec text-teal">{doc.specialization}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Selected Highlight Footer */}
                {isSelectedHosp && (
                  <div className="selected-confirmation-pill">
                    <CheckCircle size={15} className="text-emerald" />
                    <span>
                      {t('recommendations.selected')}: <strong>{doctorNameMap[activeDoc.name] ?? activeDoc.name}</strong>
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {!hospitals.length && locationStatus === 'granted' && (
        <div className="queue-tip-card location-tip-card">
          <MapPin size={18} className="text-teal flex-shrink-0" />
          <div className="queue-tip-text">
            <strong>No nearby hospitals were available yet. Please try again in a moment.</strong>
          </div>
        </div>
      )}

      {/* Sticky Bottom Action Drawer */}
      {currentHospital && (
        <div className="selection-cta-drawer">
          <div className="selected-summary-col">
            <div className="selected-entity-title">
              <strong>{hospitalNameMap[currentHospital.name] ?? currentHospital.name}</strong>
            </div>
          </div>

          <button
            onClick={handleProceed}
            className="btn btn-primary btn-lg book-request-btn"
          >
            <span>{t('recommendations.bookVisit')}</span>
            <ArrowRight size={18} />
          </button>
        </div>
      )}

      <style>{`
        .hospital-rec-container {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .rec-header {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .rec-badge-row {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          margin-bottom: 0.5rem;
          flex-wrap: wrap;
        }
        .spec-match-pill {
          display: flex;
          align-items: center;
          gap: 4px;
          background: rgba(14, 165, 233, 0.12);
          border: 1px solid rgba(14, 165, 233, 0.35);
          color: #38bdf8;
          font-size: 0.75rem;
          padding: 3px 10px;
          border-radius: var(--radius-full);
          font-weight: 500;
        }
        .rec-title {
          font-size: 1.4rem;
        }
        .rec-subtitle {
          font-size: 0.88rem;
          color: var(--text-secondary);
        }
        .queue-tip-card {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          background: var(--pastel-light-blue);
          border: 1px solid var(--pastel-sky-blue);
          border-radius: var(--radius-sm);
          padding: 0.85rem 1.1rem;
        }
        .location-tip-card {
          background: rgba(16, 185, 129, 0.12);
          border-color: rgba(16, 185, 129, 0.28);
        }
        .location-coords {
          margin-top: 0.4rem;
          font-size: 0.75rem;
          color: var(--text-secondary);
          letter-spacing: 0.02em;
        }
        .queue-tip-text {
          font-size: 0.82rem;
          color: var(--text-secondary);
          line-height: 1.45;
        }
        .queue-tip-text strong {
          color: var(--brand-primary);
        }
        .hospitals-list-feed {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        .hospital-card {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          cursor: pointer;
          border: 1px solid #17202A;
          position: relative;
          padding: 1rem;
        }
        .selected-hospital-card {
          border-color: #17202A;
          background: var(--pastel-light-blue);
          box-shadow: var(--shadow-soft);
        }
        .hosp-card-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
        }
        .hosp-main-info {
          display: flex;
          align-items: flex-start;
          gap: 0.85rem;
        }
        .rank-indicator {
          width: 32px;
          height: 32px;
          border-radius: var(--radius-xs);
          background: var(--bg-surface-3);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.85rem;
          color: var(--brand-accent);
          flex-shrink: 0;
        }
        .hosp-name-row {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          flex-wrap: wrap;
        }
        .hosp-name {
          font-size: 1.15rem;
          font-weight: 700;
          color: var(--dark-navy-text);
        }
        .nabh-badge {
          font-size: 0.65rem;
          font-weight: 800;
          background: var(--pastel-green-bg);
          color: var(--pastel-green-accent);
          border: 1px solid #B7DEC2;
          padding: 1px 6px;
          border-radius: var(--radius-xs);
        }
        .hosp-address {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 0.8rem;
          color: var(--text-muted);
          margin-top: 3px;
        }
        .selection-radio {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          border: 2px solid var(--border-subtle);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .selection-radio.checked {
          border-color: var(--brand-primary);
        }
        .radio-inner {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: var(--brand-primary);
        }
        .travel-fare-strip {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0.75rem;
          background: var(--bg-surface-3);
          padding: 0.6rem 0.8rem;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-light);
        }
        .strip-item {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .fare-col {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .strip-val {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--dark-navy-text);
        }
        .strip-sub {
          font-size: 0.7rem;
          color: var(--text-muted);
        }
        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          display: inline-block;
          margin-bottom: 2px;
        }
        .dot-green {
          background: #10b981;
          box-shadow: 0 0 6px #10b981;
        }
        .dot-yellow {
          background: #f59e0b;
          box-shadow: 0 0 6px #f59e0b;
        }
        .doctor-select-section {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }
        .doc-section-title {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-secondary);
        }
        .doctors-chips-grid {
          display: flex;
          gap: 0.65rem;
          overflow-x: auto;
          padding: 0.1rem 0.1rem 0.3rem;
          scroll-snap-type: x proximity;
          scrollbar-width: thin;
        }
        .doc-chip {
          flex: 0 0 220px;
          background: var(--bg-surface-3);
          border: 1px solid #000000;
          padding: 0.6rem;
          border-radius: var(--radius-sm);
          display: flex;
          flex-direction: column;
          gap: 3px;
          min-height: 92px;
          scroll-snap-align: start;
          transition: all var(--transition-fast);
        }
        .doc-chip:hover {
          border-color: #000000;
        }
        .doc-chip.active-doc-chip {
          background: var(--pastel-light-blue);
          border-color: #000000;
        }
        .doc-chip-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .doc-name {
          font-size: 0.85rem;
          color: var(--dark-navy-text);
        }
        .doc-spec {
          font-size: 0.75rem;
        }
        .doc-slot-row {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          font-size: 0.7rem;
          color: var(--text-muted);
          margin-top: 2px;
        }
        .doc-slot {
          color: var(--pastel-green-accent);
          font-weight: 500;
        }
        .selected-confirmation-pill {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: var(--pastel-green-bg);
          border: 1px solid #B7DEC2;
          padding: 0.4rem 0.7rem;
          border-radius: var(--radius-sm);
          font-size: 0.8rem;
          color: var(--dark-navy-text);
          min-width: 0;
        }
        .selected-confirmation-pill span {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .selection-cta-drawer {
          position: sticky;
          bottom: 1rem;
          background: rgba(255, 255, 255, 0.96);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid var(--border-light);
          border-radius: var(--radius-sm);
          padding: 0.65rem 0.85rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          box-shadow: var(--shadow-md);
          z-index: 50;
        }
        .selected-summary-col {
          display: flex;
          flex-direction: column;
          min-width: 0;
        }
        .selected-entity-title {
          font-size: 0.9rem;
          color: var(--dark-navy-text);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .selected-entity-title strong {
          color: var(--brand-primary);
        }
        .book-request-btn {
          padding: 0.55rem 1rem;
          font-size: 0.85rem;
          flex-shrink: 0;
        }
        @media (max-width: 768px) {
          .hospital-rec-container {
            gap: 1rem;
          }
          .hospital-card {
            padding: 1rem;
            gap: 0.85rem;
          }
          .hosp-name {
            font-size: 1.05rem;
          }
          .hosp-address {
            max-width: 250px;
            line-height: 1.3;
          }
          .travel-fare-strip {
            display: flex;
            align-items: center;
            gap: 0.35rem;
            padding: 0.5rem 0.55rem;
            overflow: hidden;
          }
          .travel-fare-strip .strip-item {
            flex: 1 1 0;
            min-width: 0;
            flex-direction: row;
            align-items: center;
            gap: 3px;
            overflow: hidden;
          }
          .travel-fare-strip .desk-item {
            display: none;
          }
          .travel-fare-strip .strip-item > svg {
            width: 12px;
            height: 12px;
            flex-shrink: 0;
          }
          .travel-fare-strip .strip-val {
            min-width: 0;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            font-size: 0.68rem;
          }
          .travel-fare-strip .strip-sub {
            display: none;
          }
          .travel-fare-strip .fare-col {
            min-width: 0;
            flex-direction: row;
          }
          .selection-cta-drawer {
            gap: 0.65rem;
            bottom: calc(var(--bottom-nav-height) + 1.25rem);
          }
          .book-request-btn {
            width: auto;
          }
          .doc-chip {
            flex-basis: 220px;
          }
        }
      `}</style>
    </div>
  );
};
