import React, { useState } from 'react';
import { Video, Building2, Sparkles, Check } from 'lucide-react';
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

export const UserDashboard: React.FC<UserDashboardProps> = ({
  activeConsultation,
  onOpenTracker,
  onStartNewConsultation,
  onSelectOption,
}) => {
  const [symptomInput, setSymptomInput] = useState('');
  const [isGenerated, setIsGenerated] = useState(false);

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

      {/* Main Minimal Home Card */}
      <div className="card symptom-home-card">
        {/* Heading */}
        <h2 className="symptom-heading">Enter your current symptoms</h2>

        {/* Input Form */}
        <form onSubmit={handleGenerate} className="symptom-input-group">
          <input
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
            <Sparkles size={18} />
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

      <style>{`
        .home-dashboard-layout {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          width: 100%;
          max-width: 720px;
          margin: 0 auto;
          padding-top: 1rem;
        }

        .active-visit-hero-banner {
          width: 100%;
        }

        .symptom-home-card {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          padding: 2rem;
          background: var(--white);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-md);
        }

        .symptom-heading {
          font-size: 1.6rem;
          font-weight: 800;
          color: var(--dark-navy-text);
          text-align: center;
        }

        .symptom-input-group {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
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

        @media (max-width: 640px) {
          .symptom-home-card {
            padding: 1.25rem;
            gap: 1.25rem;
          }

          .symptom-heading {
            font-size: 1.35rem;
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
