import React, { useEffect, useState } from 'react';
import { Video, Building2, FileText, Sparkles, Check, ShieldCheck, Clock3, Route, ArrowRight } from 'lucide-react';
import {
  AbhaProfile,
  HealthRecord,
  ChronicCondition,
  Allergy,
  ConsultationRequest,
  Hospital,
  Doctor,
} from '../../types';
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
  onSelectOption?: (symptomText: string, route: 'TELECONSULTATION' | 'HOSPITAL_VISIT') => void;
}

const COMMON_SYMPTOMS = ['Fever', 'Cough', 'Headache'];

const FEATURE_SLIDES = [
  {
    eyebrow: 'START HERE',
    title: 'Understand your symptoms',
    description: 'Describe how you feel and get a guided care path in under a minute.',
    action: 'AI symptom check',
    icon: Sparkles,
    theme: 'feature-slide-blue',
  },
  {
    eyebrow: 'CARE WHEN YOU NEED IT',
    title: 'Talk to a doctor online',
    description: 'Connect to a teleconsultation without leaving your home.',
    action: 'Teleconsultation',
    icon: Video,
    theme: 'feature-slide-mint',
  },
  {
    eyebrow: 'YOUR HEALTH, TOGETHER',
    title: 'Keep records in one place',
    description: 'Access your ABHA-linked health history whenever you need it.',
    action: 'Health records',
    icon: FileText,
    theme: 'feature-slide-yellow',
  },
  {
    eyebrow: 'FIND THE RIGHT CARE',
    title: 'Discover doctors and hospitals',
    description: 'Compare nearby facilities and find specialists for your needs.',
    action: 'Care network',
    icon: Building2,
    theme: 'feature-slide-lilac',
  },
];

export const UserDashboard: React.FC<UserDashboardProps> = ({
  records = [],
  conditions = [],
  allergies = [],
  activeConsultation,
  onOpenTracker,
  onStartNewConsultation,
  onSelectOption,
}) => {
  const [symptomInput, setSymptomInput] = useState('');
  const [isGenerated, setIsGenerated] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const [isFeaturePaused, setIsFeaturePaused] = useState(false);

  useEffect(() => {
    if (isFeaturePaused) return;
    const featureTimer = window.setInterval(() => {
      setActiveFeature((current) => (current + 1) % FEATURE_SLIDES.length);
    }, 3800);
    return () => window.clearInterval(featureTimer);
  }, [isFeaturePaused]);

  const handleAddSymptom = (symptom: string) => {
    if (!symptomInput.trim()) {
      setSymptomInput(symptom);
    } else {
      const currentList = symptomInput.split(',').map((s) => s.trim());
      if (currentList.includes(symptom)) {
        const updated = currentList.filter((s) => s !== symptom).join(', ');
        setSymptomInput(updated);
      } else {
        setSymptomInput(`${symptomInput.trim()}, ${symptom}`);
      }
    }
  };

  const handleGenerate = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsGenerated(true);
  };

  const handleOptionClick = (route: 'TELECONSULTATION' | 'HOSPITAL_VISIT') => {
    const textToUse = symptomInput.trim() || 'General Consultation';
    if (onSelectOption) {
      onSelectOption(textToUse, route);
    } else {
      onStartNewConsultation();
    }
  };

  return (
    <div className="home-dashboard-layout animate-fade-in">
      {/* Active Consultation Hero Bar if present */}
      {activeConsultation && (
        <div className="active-visit-hero-banner">
          <ActiveConsultationCard
            consultation={activeConsultation}
            onOpenTracker={onOpenTracker}
          />
        </div>
      )}

      <section
        className="feature-carousel"
        aria-label="What you can do with SUGASTHA"
        onMouseEnter={() => setIsFeaturePaused(true)}
        onMouseLeave={() => setIsFeaturePaused(false)}
        onFocus={() => setIsFeaturePaused(true)}
        onBlur={() => setIsFeaturePaused(false)}
      >
        <div
          className="feature-slide-track"
          style={{ transform: `translateX(-${activeFeature * 100}%)` }}
        >
          {FEATURE_SLIDES.map((slide) => {
            const SlideIcon = slide.icon;
            return (
              <article key={slide.title} className={`feature-slide ${slide.theme}`}>
                <div className="feature-slide-copy">
                  <span className="feature-slide-eyebrow">{slide.eyebrow}</span>
                  <h2>{slide.title}</h2>
                  <p>{slide.description}</p>
                  <span className="feature-slide-action">
                    {slide.action}
                    <ArrowRight size={15} />
                  </span>
                </div>
                <div className="feature-slide-icon" aria-hidden="true">
                  <SlideIcon size={34} />
                </div>
              </article>
            );
          })}
        </div>
        <div className="feature-carousel-controls">
          <div className="feature-slide-dots">
            {FEATURE_SLIDES.map((slide, index) => (
              <button
                key={slide.title}
                type="button"
                className={`feature-dot ${activeFeature === index ? 'active' : ''}`}
                onClick={() => setActiveFeature(index)}
                aria-label={`Show slide ${index + 1}: ${slide.title}`}
                aria-current={activeFeature === index ? 'true' : undefined}
              />
            ))}
          </div>
          <span className="feature-slide-count">{String(activeFeature + 1).padStart(2, '0')} / 04</span>
        </div>
      </section>

      {/* Main Minimal Home Card */}
      <div className="card symptom-home-card">
        <div className="symptom-intro-row">
          <div className="symptom-intro-icon">
            <Sparkles size={20} />
          </div>
          <div className="symptom-intro-copy">
            <span className="eyebrow-label">AI HEALTH CHECK</span>
            <span className="intro-time"><Clock3 size={13} /> Takes about 1 minute</span>
          </div>
        </div>

        <div className="symptom-heading-group">
          <h2 className="symptom-heading">How are you feeling today?</h2>
          <p className="symptom-description">Tell us what you are experiencing and we will help you find the right next step.</p>
        </div>

        <div className="health-context-strip">
          <ShieldCheck size={18} />
          <div>
            <strong>Your health context is ready</strong>
            <span>{records.length} records · {conditions.length} conditions · {allergies.length} allergies checked</span>
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleGenerate} className="symptom-input-group">
          <label htmlFor="symptom-input" className="input-label">Describe your symptoms</label>
          <input
            id="symptom-input"
            type="text"
            className="form-input symptom-input-field"
            placeholder="Type your symptoms here (e.g. Fever, Cough)"
            value={symptomInput}
            onChange={(e) => setSymptomInput(e.target.value)}
          />

          {/* Common Suggestions */}
          <div className="symptom-suggestions-row">
            {COMMON_SYMPTOMS.map((sym) => {
              const isSelected = symptomInput
                .split(',')
                .map((s) => s.trim().toLowerCase())
                .includes(sym.toLowerCase());
              return (
                <button
                  type="button"
                  key={sym}
                  onClick={() => handleAddSymptom(sym)}
                  className={`symptom-suggestion-chip ${isSelected ? 'selected' : ''}`}
                >
                  {isSelected && <Check size={14} className="chip-icon" />}
                  <span>{sym}</span>
                </button>
              );
            })}
          </div>

          {/* Generate Button */}
          <button type="submit" className="btn btn-primary btn-lg generate-btn">
            <span>Generate</span>
          </button>
        </form>

        {/* Two Options Below - Revealed after Generate */}
        {isGenerated && (
          <div className="options-container animate-fade-in">
            <div
              className="option-card option-esanjeevani card-interactive"
              onClick={() => handleOptionClick('TELECONSULTATION')}
            >
              <div className="option-icon-wrapper esanjeevani-icon">
                <Video size={32} />
              </div>
              <div className="option-content">
                <h3 className="option-title">eSanjeevani</h3>
                <p className="option-description">For remote/online consultation</p>
              </div>
            </div>

            <div
              className="option-card option-hospital card-interactive"
              onClick={() => handleOptionClick('HOSPITAL_VISIT')}
            >
              <div className="option-icon-wrapper hospital-icon">
                <Building2 size={32} />
              </div>
              <div className="option-content">
                <h3 className="option-title">Hospital Dashboard</h3>
                <p className="option-description">For in-person hospital/doctor access</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {!isGenerated && (
        <section className="next-steps-panel" aria-label="What happens next">
          <div className="next-steps-heading">
            <div>
              <span className="eyebrow-label">YOUR CARE PATH</span>
              <h3>What happens next?</h3>
            </div>
            <Route size={22} />
          </div>
          <div className="next-steps-list">
            <div className="next-step-item">
              <span className="step-number">01</span>
              <div><strong>Share symptoms</strong><span>Use your own words</span></div>
              <ArrowRight size={16} />
            </div>
            <div className="next-step-item">
              <span className="step-number">02</span>
              <div><strong>Get guidance</strong><span>Review your care options</span></div>
              <ArrowRight size={16} />
            </div>
            <div className="next-step-item">
              <span className="step-number">03</span>
              <div><strong>Choose what suits you</strong><span>Online or hospital care</span></div>
            </div>
          </div>
        </section>
      )}

      <style>{`
        .home-dashboard-layout {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          width: 100%;
          max-width: 760px;
          margin: 0 auto;
          padding-top: 1rem;
        }

        .active-visit-hero-banner {
          width: 100%;
        }

        .feature-carousel {
          width: 100%;
          overflow: hidden;
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-md);
          background: var(--white);
        }

        .feature-slide-track {
          display: flex;
          transition: transform 600ms cubic-bezier(0.16, 1, 0.3, 1);
          touch-action: pan-y;
        }

        .feature-slide {
          min-width: 100%;
          min-height: 190px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1.5rem;
          padding: 1.6rem 1.75rem 1.35rem;
          position: relative;
          overflow: hidden;
        }

        .feature-slide::after {
          content: '';
          position: absolute;
          width: 180px;
          height: 180px;
          right: 8%;
          bottom: -95px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.42);
        }

        .feature-slide-blue { background: linear-gradient(135deg, #dff5ff 0%, #bfe9f8 100%); }
        .feature-slide-mint { background: linear-gradient(135deg, #e5f7ee 0%, #c6ead7 100%); }
        .feature-slide-yellow { background: linear-gradient(135deg, #fff8dc 0%, #ffe9a8 100%); }
        .feature-slide-lilac { background: linear-gradient(135deg, #f1ecff 0%, #ddd4ff 100%); }

        .feature-slide-copy {
          position: relative;
          z-index: 1;
          max-width: 510px;
        }

        .feature-slide-eyebrow {
          color: var(--brand-primary);
          font-size: 0.68rem;
          font-weight: 800;
          letter-spacing: 0.1em;
        }

        .feature-slide h2 {
          margin-top: 0.35rem;
          font-size: clamp(1.35rem, 3vw, 1.9rem);
          line-height: 1.1;
        }

        .feature-slide p {
          max-width: 430px;
          margin-top: 0.45rem;
          color: var(--text-secondary);
          font-size: 0.86rem;
        }

        .feature-slide-action {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          margin-top: 0.85rem;
          color: var(--brand-primary);
          font-size: 0.78rem;
          font-weight: 800;
        }

        .feature-slide-icon {
          position: relative;
          z-index: 1;
          display: grid;
          place-items: center;
          width: 76px;
          height: 76px;
          flex-shrink: 0;
          border: 1px solid rgba(255, 255, 255, 0.72);
          border-radius: 24px;
          color: var(--brand-primary);
          background: rgba(255, 255, 255, 0.62);
          box-shadow: 0 12px 24px rgba(23, 32, 42, 0.07);
        }

        .feature-carousel-controls {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 1.75rem 0.9rem;
          background: inherit;
        }

        .feature-slide-dots {
          display: flex;
          align-items: center;
          gap: 0.35rem;
        }

        .feature-dot {
          width: 7px;
          height: 7px;
          padding: 0;
          border-radius: 50%;
          background: rgba(2, 132, 199, 0.25);
          transition: all var(--transition-normal);
        }

        .feature-dot.active {
          width: 22px;
          border-radius: var(--radius-full);
          background: var(--brand-primary);
        }

        .feature-slide-count {
          color: var(--text-muted);
          font-family: var(--font-display);
          font-size: 0.68rem;
          font-weight: 700;
        }

        .symptom-home-card {
          display: flex;
          flex-direction: column;
          gap: 1.15rem;
          padding: 2rem;
          background: var(--white);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-md);
        }

        .symptom-intro-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
        }

        .symptom-intro-icon {
          width: 40px;
          height: 40px;
          display: grid;
          place-items: center;
          border-radius: 13px;
          color: var(--brand-primary);
          background: var(--pastel-light-blue);
          border: 1px solid var(--pastel-sky-blue);
        }

        .symptom-intro-copy {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          margin-left: auto;
        }

        .eyebrow-label {
          color: var(--brand-primary);
          font-size: 0.68rem;
          font-weight: 800;
          letter-spacing: 0.08em;
        }

        .intro-time {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          color: var(--text-muted);
          font-size: 0.72rem;
        }

        .symptom-heading-group {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        .symptom-heading {
          font-size: 1.6rem;
          font-weight: 800;
          color: var(--dark-navy-text);
          text-align: center;
        }

        .symptom-description {
          max-width: 510px;
          margin: 0 auto;
          color: var(--text-secondary);
          font-size: 0.88rem;
          text-align: center;
        }

        .health-context-strip {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          padding: 0.7rem 0.8rem;
          border: 1px solid var(--triage-green-border);
          border-radius: var(--radius-sm);
          background: var(--triage-green-bg);
          color: var(--triage-green);
        }

        .health-context-strip div {
          display: flex;
          flex-direction: column;
          gap: 0.1rem;
        }

        .health-context-strip strong {
          font-size: 0.78rem;
        }

        .health-context-strip span {
          color: var(--text-secondary);
          font-size: 0.72rem;
        }

        .symptom-input-group {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .input-label {
          color: var(--text-primary);
          font-size: 0.82rem;
          font-weight: 700;
        }

        .symptom-input-field {
          width: 100%;
          padding: 1rem 1.25rem;
          font-size: 1.05rem;
          border-radius: var(--radius-md);
          border: 1.5px solid var(--border-light);
          background: var(--bg-surface-2);
          transition: all var(--transition-fast);
        }

        .symptom-input-field:focus {
          background: var(--white);
          border-color: var(--border-focus);
          box-shadow: 0 0 0 4px rgba(14, 165, 233, 0.15);
        }

        .symptom-suggestions-row {
          display: flex;
          flex-wrap: wrap;
          gap: 0.6rem;
          align-items: center;
        }

        .symptom-suggestion-chip {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.5rem 1rem;
          border-radius: var(--radius-full);
          font-size: 0.9rem;
          font-weight: 600;
          background: var(--pastel-light-blue);
          color: var(--brand-primary);
          border: 1px solid var(--pastel-sky-blue);
          transition: all var(--transition-fast);
          cursor: pointer;
        }

        .symptom-suggestion-chip:hover {
          background: var(--pastel-sky-blue);
          transform: translateY(-1px);
        }

        .symptom-suggestion-chip.selected {
          background: var(--brand-primary);
          color: var(--white);
          border-color: var(--brand-primary);
        }

        .chip-icon {
          color: var(--white);
        }

        .generate-btn {
          width: 100%;
          padding: 0.9rem;
          font-size: 1.05rem;
          font-weight: 700;
          margin-top: 0.5rem;
        }

        .options-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.25rem;
          margin-top: 0.5rem;
          padding-top: 1.5rem;
          border-top: 1px solid var(--border-light);
        }

        .option-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 1.75rem 1.25rem;
          border-radius: var(--radius-lg);
          border: 1.5px solid var(--border-light);
          background: var(--bg-surface-2);
          cursor: pointer;
          transition: all var(--transition-normal);
          gap: 1rem;
        }

        .option-card:hover {
          border-color: var(--brand-primary);
          background: var(--white);
          transform: translateY(-3px);
          box-shadow: var(--shadow-md);
        }

        .option-icon-wrapper {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .esanjeevani-icon {
          background: var(--pastel-light-blue);
          color: var(--brand-primary);
          border: 1px solid var(--pastel-sky-blue);
        }

        .hospital-icon {
          background: var(--pastel-cream-yellow);
          color: var(--abdm-orange);
          border: 1px solid #FDE68A;
        }

        .option-content {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        .option-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--dark-navy-text);
        }

        .option-description {
          font-size: 0.88rem;
          color: var(--text-secondary);
          line-height: 1.3;
        }

        .next-steps-panel {
          padding: 1.25rem 1.35rem;
          border: 1px solid var(--border-light);
          border-radius: var(--radius-lg);
          background: rgba(255, 255, 255, 0.78);
          box-shadow: var(--shadow-sm);
        }

        .next-steps-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          color: var(--brand-primary);
        }

        .next-steps-heading h3 {
          margin-top: 0.15rem;
          font-size: 1.05rem;
        }

        .next-steps-list {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.75rem;
          margin-top: 1rem;
        }

        .next-step-item {
          display: flex;
          align-items: center;
          gap: 0.55rem;
          min-width: 0;
          padding: 0.7rem;
          border-radius: var(--radius-sm);
          background: var(--bg-surface-2);
          color: var(--text-muted);
        }

        .next-step-item > div {
          display: flex;
          flex-direction: column;
          min-width: 0;
          flex: 1;
        }

        .next-step-item strong {
          color: var(--text-primary);
          font-size: 0.76rem;
        }

        .next-step-item span:not(.step-number) {
          font-size: 0.68rem;
          line-height: 1.2;
        }

        .step-number {
          color: var(--brand-primary);
          font-family: var(--font-display);
          font-size: 0.7rem;
          font-weight: 800;
        }

        @media (max-width: 640px) {
          .feature-slide {
            min-height: 172px;
            padding: 1.25rem 1rem 1rem;
          }

          .feature-slide h2 {
            font-size: 1.3rem;
          }

          .feature-slide p {
            max-width: 245px;
            font-size: 0.78rem;
          }

          .feature-slide-icon {
            width: 58px;
            height: 58px;
            border-radius: 18px;
          }

          .feature-carousel-controls {
            padding: 0 1rem 0.75rem;
          }

          .symptom-home-card {
            padding: 1.25rem;
            gap: 1.25rem;
          }

          .symptom-intro-copy {
            flex-direction: column;
            align-items: flex-end;
            gap: 0.2rem;
          }

          .symptom-heading {
            font-size: 1.35rem;
          }

          .symptom-description {
            font-size: 0.8rem;
          }

          .next-steps-panel {
            padding: 1rem;
          }

          .next-steps-list {
            grid-template-columns: 1fr;
            gap: 0.5rem;
          }

          .next-step-item {
            padding: 0.65rem;
          }

          .options-container {
            grid-template-columns: 1fr;
            gap: 1rem;
          }

          .option-card {
            flex-direction: row;
            text-align: left;
            padding: 1.25rem;
            align-items: center;
          }

          .option-icon-wrapper {
            width: 52px;
            height: 52px;
          }
        }
      `}</style>
    </div>
  );
};
