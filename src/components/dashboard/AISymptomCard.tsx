import React from 'react';
import { Sparkles, Stethoscope, ShieldAlert, ArrowRight } from 'lucide-react';

interface AISymptomCardProps {
  onCheckSymptoms: () => void;
}

export const AISymptomCard: React.FC<AISymptomCardProps> = ({ onCheckSymptoms }) => {
  return (
    <div className="ai-symptom-card">
      <div className="ai-card-content">
        <div className="ai-badge-row">
          <span className="ai-pill-badge">
            <Sparkles size={14} className="sparkle-icon" />
            <span>AI TRIAGE ASSISTANT</span>
          </span>
          <span className="multilingual-tag">ENG • HIN • REGIONAL</span>
        </div>

        <h3 className="ai-title">Not sure which doctor to consult?</h3>
        <p className="ai-desc">
          Describe your symptoms in your preferred language. SUGASTHA clinical AI will analyze your inputs and guide you to the appropriate specialist.
        </p>

        <div className="ai-disclaimer-box">
          <ShieldAlert size={14} className="disclaimer-icon" />
          <span>SUGASTHA AI triage is an assistive tool and does not replace qualified clinical diagnosis by a medical professional.</span>
        </div>

        <div className="ai-action-row">
          <button
            onClick={onCheckSymptoms}
            className="btn btn-primary btn-lg check-symptoms-btn"
          >
            <Stethoscope size={18} />
            <span>Check My Symptoms Now</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>

      <style>{`
        .ai-symptom-card {
          width: 100%;
          background: linear-gradient(135deg, #FFF3C7 0%, #FFF8DD 50%, #FFFFFF 100%);
          border: 1.5px solid #FDE68A;
          border-radius: var(--radius-lg);
          padding: 1.75rem;
          box-shadow: var(--shadow-sm);
          position: relative;
          overflow: hidden;
        }
        .ai-card-content {
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
          max-width: 800px;
        }
        .ai-badge-row {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-wrap: wrap;
        }
        .ai-pill-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #FEF3C7;
          border: 1px solid #FDE68A;
          color: #B45309;
          font-size: 0.72rem;
          font-weight: 800;
          padding: 4px 12px;
          border-radius: var(--radius-full);
          letter-spacing: 0.04em;
        }
        .sparkle-icon {
          color: #D97706;
        }
        .multilingual-tag {
          font-size: 0.68rem;
          font-weight: 700;
          color: var(--text-muted);
          background: var(--white);
          padding: 3px 8px;
          border-radius: var(--radius-xs);
          border: 1px solid #FEF3C7;
        }
        .ai-title {
          font-size: 1.4rem;
          font-weight: 800;
          color: var(--dark-navy-text);
          line-height: 1.25;
        }
        .ai-desc {
          font-size: 0.92rem;
          line-height: 1.5;
          color: var(--text-secondary);
        }
        .ai-disclaimer-box {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          background: rgba(255, 255, 255, 0.7);
          border: 1px solid #FDE68A;
          padding: 0.6rem 0.85rem;
          border-radius: var(--radius-sm);
          font-size: 0.76rem;
          color: #92400E;
          line-height: 1.4;
        }
        .disclaimer-icon {
          flex-shrink: 0;
          margin-top: 2px;
          color: #D97706;
        }
        .ai-action-row {
          margin-top: 0.5rem;
        }
        .check-symptoms-btn {
          box-shadow: 0 4px 14px rgba(2, 132, 199, 0.2);
        }
        @media (max-width: 640px) {
          .ai-title {
            font-size: 1.2rem;
          }
          .ai-symptom-card {
            padding: 1.25rem;
          }
        }
      `}</style>
    </div>
  );
};
