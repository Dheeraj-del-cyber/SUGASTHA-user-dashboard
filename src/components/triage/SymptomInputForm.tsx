import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Stethoscope,
  AlertCircle,
  Sparkles,
  Plus,
  X,
  Flame,
  Clock,
  MapPin,
  ShieldCheck,
  Mic,
  Square,
  Globe,
} from 'lucide-react';
import { SymptomInput, AbhaProfile } from '../../types';

interface SymptomInputFormProps {
  profile: AbhaProfile;
  onSubmit: (symptoms: SymptomInput) => void;
  isAnalyzing: boolean;
}

const SUPPORTED_LANGUAGES = [
  { code: 'en-IN', label: 'English' },
  { code: 'hi-IN', label: 'Hindi (हिंदी)' },
  { code: 'mr-IN', label: 'Marathi (मराठी)' },
  { code: 'ta-IN', label: 'Tamil (தமிழ்)' },
  { code: 'te-IN', label: 'Telugu (తెలుగు)' },
  { code: 'bn-IN', label: 'Bengali (বাংলা)' },
  { code: 'gu-IN', label: 'Gujarati (ગુજરાતી)' },
  { code: 'kn-IN', label: 'Kannada (ಕನ್ನಡ)' },
  { code: 'ml-IN', label: 'Malayalam (മലയാളം)' },
];

export const SymptomInputForm: React.FC<SymptomInputFormProps> = ({
  onSubmit,
  isAnalyzing,
}) => {
  const { t, i18n } = useTranslation();
  const languageCode = i18n.language.startsWith('hi') ? 'hi' : i18n.language.startsWith('kn') ? 'kn' : i18n.language.startsWith('mr') ? 'mr' : i18n.language.startsWith('ta') ? 'ta' : i18n.language.startsWith('te') ? 'te' : 'en';
  const symptomDictionary: Record<string, Record<string, string>> = {
    en: {
      chestPain: 'Chest Pain / Discomfort',
      shortnessOfBreath: 'Shortness of Breath',
      highFever: 'High Fever with Chills',
      severeHeadache: 'Severe Headache',
      stomachPain: 'Stomach Pain / Vomiting',
      dizziness: 'Dizziness / Fainting',
      skinRash: 'Skin Rash / Itching',
      coughSoreThroat: 'Dry Cough & Sore Throat',
      extremeFatigue: 'Extreme Fatigue',
      backPain: 'Back / Joint Pain',
    },
    hi: {
      chestPain: 'सीने में दर्द / असुविधा',
      shortnessOfBreath: 'साँस की तकलीफ',
      highFever: 'तेज़ बुखार के साथ ठंड लगना',
      severeHeadache: 'तीव्र सिरदर्द',
      stomachPain: 'पेट में दर्द / उल्टी',
      dizziness: 'चक्कर / बेहोशी',
      skinRash: 'त्वचा पर दाने / खुजली',
      coughSoreThroat: 'सूखी खाँसी और गले में खराश',
      extremeFatigue: 'अत्यधिक थकान',
      backPain: 'पीठ / जोड़ों में दर्द',
    },
    kn: {
      chestPain: 'ಮೂಗಿನ दर्द / ಅಸ್ವಸ್ಥತೆ',
      shortnessOfBreath: 'ಉಸಿರಾಟದ ತೊಂದರೆ',
      highFever: 'ಅಧಿಕ ಜ್ವರ ಮತ್ತು ಶೀತ',
      severeHeadache: 'ತೀವ್ರ ತಲೆಗೆ ನೋವು',
      stomachPain: 'ಕೆನ್ನೆ / ವಾಂತಿ',
      dizziness: 'ತಲೆತಿರುಗುವಿಕೆ / ಮೂರ್ಛೆ',
      skinRash: 'ಚರ್ಮದ ಹುಣ್ಣು / ಕಣ್ಣು',
      coughSoreThroat: 'ಒಣ ಸೈನ್ಸ್ ಮತ್ತು ಗಂಟಲು ನೋವು',
      extremeFatigue: 'ಅತ್ಯಂತ ಆಯಾಸ',
      backPain: 'ಮೇಲಿನ ಬೆನ್ನು / ಮೂಳೆ ನೋವು',
    },
    mr: {
      chestPain: 'छातीत दुखणे / अस्वस्थता',
      shortnessOfBreath: 'श्वास घेण्यास त्रास',
      highFever: 'उच्च ताप + थंडी',
      severeHeadache: 'तीव्र डोकेदुख',
      stomachPain: 'पोटदुख / उलटी',
      dizziness: 'चकवा / मळमळ',
      skinRash: 'त्वचेवर पुरळ / खाज',
      coughSoreThroat: 'कोरडी खोकला आणि गळा दुखणे',
      extremeFatigue: 'अत्यंत थकवा',
      backPain: 'पाठीचा / सांधे दुखणे',
    },
    ta: {
      chestPain: 'நெஞ்சுவலி / அசௌகரியம்',
      shortnessOfBreath: 'சுவாசக் கஷ்டம்',
      highFever: 'உயர் காய்ச்சல் + குளிர்',
      severeHeadache: 'கடுமையான தலைவலி',
      stomachPain: 'வயிற்று வலி / வாந்தி',
      dizziness: 'தலைசுற்றல் / மயக்கம்',
      skinRash: 'தோல் சொறி / அரிப்பு',
      coughSoreThroat: 'உலர்ந்த இருமல் & தொண்டை வலி',
      extremeFatigue: 'மிகுந்த சோர்வு',
      backPain: 'முதுகு / மூட்டு வலி',
    },
    te: {
      chestPain: 'చెయ్యు నొప్పి / అసౌకర్యం',
      shortnessOfBreath: 'శ్వాస ఆడకం',
      highFever: 'అధిక జ్వరం + చలి',
      severeHeadache: 'తీవ్ర తలనొప్పి',
      stomachPain: 'కడుపు నొప్పి / వాంతి',
      dizziness: 'తలనొప్పి / మూర్ఛ',
      skinRash: 'చర్మ పసుపు / కుట్టు',
      coughSoreThroat: 'పొడి దగ్గు & గొంతు నొప్పి',
      extremeFatigue: 'చాలా అలసట',
      backPain: 'వెన్ను / మోచేతి నొప్పి',
    },
  };
  const COMMON_SYMPTOMS = [
    symptomDictionary[languageCode].chestPain,
    symptomDictionary[languageCode].shortnessOfBreath,
    symptomDictionary[languageCode].highFever,
    symptomDictionary[languageCode].severeHeadache,
    symptomDictionary[languageCode].stomachPain,
    symptomDictionary[languageCode].dizziness,
    symptomDictionary[languageCode].skinRash,
    symptomDictionary[languageCode].coughSoreThroat,
    symptomDictionary[languageCode].extremeFatigue,
    symptomDictionary[languageCode].backPain,
  ];

  const BODY_REGIONS = [
    'Chest / Thorax',
    'Head, Neck & Brain',
    'Abdomen & Gastrointestinal',
    'Respiratory & Throat',
    'Musculoskeletal & Limbs',
    'Dermatological / Skin',
    'Whole Body / General',
  ];

  // Patient-friendly display names for body regions (values stay unchanged for triage data)
  const BODY_REGION_LABELS: Record<string, string> = {
    'Chest / Thorax': t('symptomRegions.chest'),
    'Head, Neck & Brain': t('symptomRegions.head'),
    'Abdomen & Gastrointestinal': t('symptomRegions.abdomen'),
    'Respiratory & Throat': t('symptomRegions.respiratory'),
    'Musculoskeletal & Limbs': t('symptomRegions.musculoskeletal'),
    'Dermatological / Skin': t('symptomRegions.skin'),
    'Whole Body / General': t('symptomRegions.general'),
  };
  // `profile` prop retained for interface compatibility; no longer displayed
  void ({} as SymptomInputFormProps['profile']);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([
    symptomDictionary[languageCode].chestPain,
    symptomDictionary[languageCode].shortnessOfBreath,
  ]);
  const [customSymptom, setCustomSymptom] = useState('');
  const [durationDays, setDurationDays] = useState<number>(2);
  const [painScale, setPainScale] = useState<number>(7);
  const [bodyRegion, setBodyRegion] = useState<string>('Chest / Thorax');
  const [additionalNotes, setAdditionalNotes] = useState(
    t('symptomLabels.sampleNote')
  );
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing] = useState(false);
  const [voiceError, setVoiceError] = useState('');
  const [speechLang, setSpeechLang] = useState('en-IN');
  const mediaRecorderRef = useRef<any>(null);
  const voiceTargetRef = useRef<'notes' | 'symptom'>('notes');

  // Red flags
  const [redFlags, setRedFlags] = useState({
    chestPressure: true,
    difficultyBreathing: true,
    lossOfConsciousness: false,
    feverWithChills: false,
    suddenWeakness: false,
    severeBleeding: false,
  });

  const toggleSymptom = (sym: string) => {
    if (selectedSymptoms.includes(sym)) {
      setSelectedSymptoms(selectedSymptoms.filter((s) => s !== sym));
    } else {
      setSelectedSymptoms([...selectedSymptoms, sym]);
    }
  };

  const addCustomSymptom = (e: React.FormEvent) => {
    e.preventDefault();
    if (customSymptom.trim() && !selectedSymptoms.includes(customSymptom.trim())) {
      setSelectedSymptoms([...selectedSymptoms, customSymptom.trim()]);
      setCustomSymptom('');
    }
  };

  const removeSymptom = (sym: string) => {
    setSelectedSymptoms(selectedSymptoms.filter((s) => s !== sym));
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  const startRecording = (target: 'notes' | 'symptom') => {
    const win = window as any;
    const SpeechRecognition = win.SpeechRecognition || win.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setVoiceError('Voice recording is not supported in this browser. Try using Chrome or Edge.');
      return;
    }

    try {
      voiceTargetRef.current = target;
      const recognition = new SpeechRecognition();
      recognition.lang = speechLang;
      recognition.interimResults = false;
      recognition.continuous = false;

      recognition.onstart = () => {
        setIsRecording(true);
        setVoiceError('');
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (voiceTargetRef.current === 'symptom') {
          setCustomSymptom((current) => current.trim() ? `${current.trim()} ${transcript}` : transcript);
        } else {
          setAdditionalNotes((current) => current.trim() ? `${current.trim()}\n${transcript}` : transcript);
        }
      };

      recognition.onerror = (event: any) => {
        setVoiceError(`Speech recognition error: ${event.error}`);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.start();
      mediaRecorderRef.current = recognition;
    } catch (error) {
      setVoiceError('Failed to start microphone. Check permissions.');
      setIsRecording(false);
    }
  };

  useEffect(() => () => {
    if (mediaRecorderRef.current && typeof mediaRecorderRef.current.stop === 'function') {
      mediaRecorderRef.current.stop();
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSymptoms.length === 0) {
      alert(t('dashboard.symptomError'));
      return;
    }
    onSubmit({
      primarySymptoms: selectedSymptoms,
      durationDays,
      painScale,
      bodyRegion,
      additionalNotes,
      hasRedFlags: redFlags,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="symptom-form-card card animate-fade-in">
      {/* Header */}
      <div className="form-header">
        <div className="icon-badge">
          <Stethoscope size={24} className="text-teal" />
        </div>
        <div>
          <h2 className="form-title">{t('dashboard.describeSymptoms')}</h2>
          <p className="form-subtitle">
            {t('dashboard.symptomCheckHelp')}
          </p>
        </div>
      </div>

      {/* ABDM Cross-Reference Banner */}
      <div className="cross-ref-banner">
        <ShieldCheck size={18} className="text-teal flex-shrink-0" />
        <div>
          <span className="banner-title">{t('triage.sourceHistory')}:</span>
          <span className="banner-text">
            {' '}{t('dashboard.healthContext')}
          </span>
        </div>
      </div>

      {/* Symptom Selection Chips */}
      <div className="section-block">
        <label className="section-label">1. Tap your symptoms</label>
        <div className="chips-wrap">
          {COMMON_SYMPTOMS.map((sym) => {
            const isSelected = selectedSymptoms.includes(sym);
            return (
              <button
                type="button"
                key={sym}
                onClick={() => toggleSymptom(sym)}
                className={`symptom-chip ${isSelected ? 'selected' : ''}`}
              >
                <span>{sym}</span>
                {isSelected && <span className="chip-check">✓</span>}
              </button>
            );
          })}
        </div>

        {/* Custom Symptom Input */}
        <div className="custom-symptom-row">
          <input
            type="text"
            className="form-input flex-grow"
            placeholder={t('dashboard.notListed')}
            value={customSymptom}
            onChange={(e) => setCustomSymptom(e.target.value)}
          />
          <div className="voice-lang-selector-sm">
            <Globe size={14} className="text-teal" />
            <select
              value={speechLang}
              onChange={(e) => setSpeechLang(e.target.value)}
              disabled={isRecording}
              className="lang-select-sm"
              title="Select speech language"
            >
              {SUPPORTED_LANGUAGES.map(lang => (
                <option key={lang.code} value={lang.code}>{lang.label}</option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={isRecording ? stopRecording : () => void startRecording('symptom')}
            className={`btn ${isRecording ? 'btn-danger' : 'btn-secondary'} voice-symptom-btn`}
            disabled={isTranscribing || isAnalyzing}
            aria-label={isRecording ? 'Stop recording symptom' : 'Speak a custom symptom'}
          >
            {isRecording ? <Square size={16} /> : <Mic size={16} />}
          </button>
          <button type="button" onClick={addCustomSymptom} className="btn btn-secondary btn-sm">
            <Plus size={16} />
            <span>{t('dashboard.add')}</span>
          </button>
        </div>

        {/* Active Selected List */}
        {selectedSymptoms.length > 0 && (
          <div className="selected-summary">
            <span className="summary-label">{t('dashboard.youSelected')}</span>
            <div className="selected-tags-row">
              {selectedSymptoms.map((sym) => (
                <span key={sym} className="active-tag">
                  {sym}
                  <button
                    type="button"
                    onClick={() => removeSymptom(sym)}
                    className="tag-remove-btn"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Body Region & Duration Grid */}
      <div className="grid-2-col">
        <div className="section-block">
          <label className="section-label">
            <MapPin size={14} className="text-teal" /> 2. {t('dashboard.whereProblem')}
          </label>
          <select
            className="form-input"
            value={bodyRegion}
            onChange={(e) => setBodyRegion(e.target.value)}
          >
            {BODY_REGIONS.map((region) => (
              <option key={region} value={region}>
                {BODY_REGION_LABELS[region] || region}
              </option>
            ))}
          </select>
        </div>

        <div className="section-block">
          <label className="section-label">
            <Clock size={14} className="text-teal" /> 3. {t('dashboard.sinceWhen')}
          </label>
          <div className="duration-picker">
            {[1, 2, 4, 7, 14].map((d) => (
              <button
                type="button"
                key={d}
                onClick={() => setDurationDays(d)}
                className={`duration-btn ${durationDays === d ? 'active' : ''}`}
              >
                {d === 1 ? t('dashboard.today') : t('dashboard.days', { count: d })}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Pain Severity Scale (0 - 10) */}
      <div className="section-block">
        <div className="pain-label-row">
          <label className="section-label">
            <Flame size={15} className="text-amber" /> 4. {t('dashboard.painScale')}
          </label>
          <span className={`pain-score-pill score-${painScale}`}>
            {painScale} / 10 -{' '}
            {painScale === 0
              ? t('dashboard.painLevels.noPain')
              : painScale <= 3
              ? t('dashboard.painLevels.mild')
              : painScale <= 6
              ? t('dashboard.painLevels.moderate')
              : painScale <= 8
              ? t('dashboard.painLevels.severe')
              : t('dashboard.painLevels.worst')}
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="10"
          step="1"
          value={painScale}
          onChange={(e) => setPainScale(parseInt(e.target.value))}
          className="pain-range-slider"
        />
        <div className="pain-ticks">
          <span>0 (None)</span>
          <span>3 (Mild)</span>
          <span>5 (Moderate)</span>
          <span>8 (Severe)</span>
          <span>10 (Worst)</span>
        </div>
      </div>

      {/* Immediate Red Flag Checkboxes */}
      <div className="section-block red-flags-box">
        <label className="red-flags-title">
          <AlertCircle size={16} className="text-red" />
          <span>Check any warning signs you have:</span>
        </label>
        <div className="red-flags-grid">
          <label className="checkbox-item">
            <input
              type="checkbox"
              checked={redFlags.chestPressure}
              onChange={(e) => setRedFlags({ ...redFlags, chestPressure: e.target.checked })}
            />
            <span>Pain or pressure in chest, or pain spreading to jaw or arm</span>
          </label>
          <label className="checkbox-item">
            <input
              type="checkbox"
              checked={redFlags.difficultyBreathing}
              onChange={(e) => setRedFlags({ ...redFlags, difficultyBreathing: e.target.checked })}
            />
            <span>Trouble breathing, or cannot speak a full sentence</span>
          </label>
          <label className="checkbox-item">
            <input
              type="checkbox"
              checked={redFlags.lossOfConsciousness}
              onChange={(e) => setRedFlags({ ...redFlags, lossOfConsciousness: e.target.checked })}
            />
            <span>Fainted, blacked out, or suddenly confused</span>
          </label>
          <label className="checkbox-item">
            <input
              type="checkbox"
              checked={redFlags.feverWithChills}
              onChange={(e) => setRedFlags({ ...redFlags, feverWithChills: e.target.checked })}
            />
            <span>Very high fever with strong chills</span>
          </label>
        </div>
      </div>

      {/* Additional Clinical Notes */}
      <div className="section-block">
        <label className="section-label">5. Anything else to tell us? (Optional)</label>
        <textarea
          rows={3}
          className="form-input"
          value={additionalNotes}
          onChange={(e) => setAdditionalNotes(e.target.value)}
          placeholder="Write in your own words if you want..."
        ></textarea>
        <div className="voice-input-row">
          <div className="voice-lang-selector">
            <Globe size={16} className="text-teal" />
            <select
              value={speechLang}
              onChange={(e) => setSpeechLang(e.target.value)}
              disabled={isRecording}
              className="lang-select"
            >
              {SUPPORTED_LANGUAGES.map(lang => (
                <option key={lang.code} value={lang.code}>{lang.label}</option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={isRecording ? stopRecording : () => void startRecording('notes')}
            className={`btn ${isRecording ? 'btn-danger' : 'btn-secondary'} voice-record-btn`}
            disabled={isTranscribing || isAnalyzing}
          >
            {isRecording ? <Square size={16} /> : <Mic size={16} />}
            <span>{isRecording ? 'Stop recording' : 'Speak symptoms'}</span>
          </button>
          {isRecording && <span className="voice-recording-status">Listening...</span>}
        </div>
        {voiceError && <p className="voice-error" role="alert">{voiceError}</p>}
      </div>

      {/* Automated Triage Notice */}
      <div className="auto-triage-notice">
        <Sparkles size={18} className="text-teal flex-shrink-0" />
        <p>
          <strong>We decide the urgency for you.</strong> You do not need to choose. After you submit, we will tell you how soon to see a doctor.
        </p>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className="btn btn-primary btn-lg w-full submit-triage-btn"
        disabled={isAnalyzing || selectedSymptoms.length === 0}
      >
        {isAnalyzing ? (
          <>
            <span className="spinner-border"></span>
            <span>Checking your symptoms...</span>
          </>
        ) : (
          <>
            <Sparkles size={18} />
            <span>Check My Symptoms</span>
          </>
        )}
      </button>

      <style>{`
        .symptom-form-card {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .form-header {
          display: flex;
          gap: 1rem;
          align-items: flex-start;
        }
        .icon-badge {
          width: 48px;
          height: 48px;
          border-radius: var(--radius-sm);
          background: rgba(14, 165, 233, 0.12);
          border: 1px solid rgba(14, 165, 233, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .form-title {
          font-size: 1.45rem;
        }
        .form-subtitle {
          font-size: 0.85rem;
          color: var(--text-secondary);
        }
        .cross-ref-banner {
          background: rgba(14, 165, 233, 0.08);
          border: 1px solid rgba(14, 165, 233, 0.25);
          border-radius: var(--radius-sm);
          padding: 0.75rem 1rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.82rem;
        }
        .banner-title {
          font-weight: 700;
          color: var(--brand-accent);
        }
        .banner-text {
          color: var(--text-secondary);
        }
        .section-block {
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
        }
        .section-label {
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--text-primary);
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }
        .chips-wrap {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        .symptom-chip {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.45rem 0.9rem;
          border-radius: var(--radius-full);
          font-size: 0.82rem;
          background: var(--bg-surface-2);
          border: 1px solid var(--border-subtle);
          color: var(--text-secondary);
          transition: all var(--transition-fast);
        }
        .symptom-chip:hover {
          border-color: var(--border-highlight);
          color: var(--text-primary);
        }
        .symptom-chip.selected {
          background: rgba(14, 165, 233, 0.15);
          border-color: var(--brand-primary);
          color: #ffffff;
          font-weight: 600;
        }
        .chip-check {
          color: var(--brand-accent);
          font-size: 0.75rem;
        }
        .custom-symptom-row {
          display: flex;
          gap: 0.5rem;
          margin-top: 0.25rem;
        }
        .selected-summary {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
          margin-top: 0.5rem;
          padding: 0.6rem;
          background: rgba(0, 0, 0, 0.2);
          border-radius: var(--radius-sm);
        }
        .summary-label {
          font-size: 0.72rem;
          color: var(--text-muted);
          text-transform: uppercase;
        }
        .selected-tags-row {
          display: flex;
          flex-wrap: wrap;
          gap: 0.4rem;
        }
        .active-tag {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          background: rgba(14, 165, 233, 0.2);
          border: 1px solid rgba(14, 165, 233, 0.4);
          color: var(--brand-accent);
          font-size: 0.75rem;
          padding: 2px 8px;
          border-radius: var(--radius-xs);
        }
        .tag-remove-btn {
          color: var(--text-muted);
          display: flex;
        }
        .tag-remove-btn:hover {
          color: #ef4444;
        }
        .grid-2-col {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.25rem;
        }
        .duration-picker {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 0.4rem;
        }
        .duration-btn {
          padding: 0.55rem 0;
          font-size: 0.8rem;
          background: var(--bg-surface-2);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-sm);
          color: var(--text-secondary);
          transition: all var(--transition-fast);
        }
        .duration-btn.active {
          background: var(--brand-primary);
          color: #ffffff;
          border-color: var(--brand-primary);
          font-weight: 700;
        }
        .pain-label-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .pain-score-pill {
          font-size: 0.8rem;
          font-weight: 700;
          padding: 3px 10px;
          border-radius: var(--radius-full);
        }
        .score-0, .score-1, .score-2, .score-3 {
          background: var(--triage-green-bg);
          border: 1px solid var(--triage-green-border);
          color: #34d399;
        }
        .score-4, .score-5, .score-6 {
          background: var(--triage-yellow-bg);
          border: 1px solid var(--triage-yellow-border);
          color: #fbbf24;
        }
        .score-7, .score-8, .score-9, .score-10 {
          background: var(--triage-red-bg);
          border: 1px solid var(--triage-red-border);
          color: #f87171;
        }
        .pain-range-slider {
          width: 100%;
          cursor: pointer;
          accent-color: var(--brand-primary);
          height: 6px;
        }
        .pain-ticks {
          display: flex;
          justify-content: space-between;
          font-size: 0.7rem;
          color: var(--text-muted);
        }
        .red-flags-box {
          background: rgba(239, 68, 68, 0.06);
          border: 1px solid rgba(239, 68, 68, 0.25);
          border-radius: var(--radius-sm);
          padding: 1rem;
        }
        .red-flags-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
          font-weight: 700;
          color: #f87171;
        }
        .red-flags-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.75rem;
          margin-top: 0.5rem;
        }
        .checkbox-item {
          display: flex;
          align-items: flex-start;
          gap: 0.5rem;
          font-size: 0.8rem;
          color: var(--text-secondary);
          cursor: pointer;
        }
        .checkbox-item input {
          margin-top: 3px;
          accent-color: #ef4444;
        }
        .auto-triage-notice {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid var(--border-subtle);
          padding: 0.75rem 1rem;
          border-radius: var(--radius-sm);
          font-size: 0.8rem;
          color: var(--text-secondary);
          line-height: 1.4;
        }
        .voice-input-row {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-wrap: wrap;
        }
        .voice-record-btn {
          min-height: 40px;
        }
        .voice-symptom-btn {
          min-width: 42px;
          min-height: 40px;
          padding: 0.65rem;
        }
        .voice-recording-status, .voice-error {
          font-size: 0.78rem;
          color: var(--text-secondary);
        }
        .voice-error {
          color: #dc2626;
        }
        .voice-lang-selector, .voice-lang-selector-sm {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          background: var(--bg-surface-2);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-sm);
          padding: 0 0.5rem;
        }
        .voice-lang-selector-sm {
          padding: 0 0.4rem;
        }
        .lang-select, .lang-select-sm {
          background: transparent;
          border: none;
          color: var(--text-primary);
          font-size: 0.85rem;
          padding: 0.5rem 0;
          outline: none;
          cursor: pointer;
        }
        .lang-select-sm {
          font-size: 0.75rem;
          padding: 0.4rem 0;
          max-width: 90px;
        }
        .flex-grow {
          flex-grow: 1;
        }
        .auto-triage-notice strong {
          color: var(--text-primary);
        }
        .submit-triage-btn {
          height: 52px;
          font-size: 1.05rem;
        }
        .spinner-border {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: #ffffff;
          border-radius: 50%;
          animation: spinSlow 0.8s linear infinite;
        }
        @media (max-width: 768px) {
          .grid-2-col, .red-flags-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </form>
  );
};
