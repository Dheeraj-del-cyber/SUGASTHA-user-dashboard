import React from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  CheckCircle,
  Activity,
  ArrowRight,
  ShieldCheck,
  Clock,
  RotateCcw,
} from 'lucide-react';
import { TriageResult, TriageLevel } from '../../types';

interface TriageResultCardProps {
  triage: TriageResult;
  onProceedRecommendation: () => void;
  onReevaluate: () => void;
}

export const TriageResultCard: React.FC<TriageResultCardProps> = ({
  triage,
  onProceedRecommendation,
  onReevaluate,
}) => {
  const [showWhy, setShowWhy] = React.useState(false);

  const getLevelConfig = (lvl: TriageLevel) => {
    switch (lvl) {
      case 'RED':
        return {
          icon: <AlertOctagon size={32} />,
          badgeClass: 'badge-red',
          borderClass: 'border-red-glow',
          title: 'You need urgent medical care',
          badgeText: 'Urgent — go now',
          accentColor: '#ef4444',
          bgBanner: 'linear-gradient(135deg, rgba(239, 68, 68, 0.25) 0%, rgba(15, 23, 42, 0.9) 100%)',
        };
      case 'YELLOW':
        return {
          icon: <AlertTriangle size={32} />,
          badgeClass: 'badge-yellow',
          borderClass: 'border-yellow-glow',
          title: 'Please see a doctor soon',
          badgeText: 'See a doctor today',
          accentColor: '#f59e0b',
          bgBanner: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(15, 23, 42, 0.9) 100%)',
        };
      case 'GREEN':
      default:
        return {
          icon: <CheckCircle size={32} />,
          badgeClass: 'badge-green',
          borderClass: 'border-green-glow',
          title: 'You can visit a doctor normally',
          badgeText: 'Not an emergency',
          accentColor: '#10b981',
          bgBanner: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(15, 23, 42, 0.9) 100%)',
        };
    }
  };

  const config = getLevelConfig(triage.level);

  return (
    <div className={`card triage-result-card animate-fade-in ${config.borderClass}`}>
      {/* Dynamic Triage Hero Banner */}
      <div className="triage-hero" style={{ background: config.bgBanner }}>
        <div className="hero-top-row">
          <div className="triage-icon-wrap" style={{ color: config.accentColor }}>
            {config.icon}
          </div>
          <div className="triage-title-group">
            <div className="triage-level-label">YOUR HEALTH PRIORITY</div>
            <h2 className="triage-main-title" style={{ color: config.accentColor }}>
              {config.title}
            </h2>
          </div>
        </div>

        <p className="triage-summary-text">{triage.summary}</p>

        {/* Urgency & Care Strip */}
        <div className="triage-vitals-strip">
          <div className="vital-item">
            <Clock size={15} className="text-muted" />
            <span className="vital-label">See a doctor:</span>
            <strong className="vital-value">{triage.urgencyWindow}</strong>
          </div>

          <div className="vital-item">
            <ShieldCheck size={15} className="text-teal" />
            <span className="vital-label">Suggested care:</span>
            <strong className="vital-value text-teal">
              {triage.recommendedRoute === 'HOSPITAL_VISIT' ? 'Go to a hospital' : 'Doctor on video call'}
            </strong>
          </div>
        </div>
      </div>

      {/* Expandable "Why this priority?" section */}
      <div className="factors-section">
        <button type="button" className="why-toggle-btn" onClick={() => setShowWhy(!showWhy)}>
          <Activity size={16} className="text-teal" />
          <span>Why this priority?</span>
          <span className="why-chevron">{showWhy ? '▲' : '▼'}</span>
        </button>
        {showWhy && (
          <div className="factors-list">
            {triage.clinicalFactors.map((factor, idx) => (
              <div key={idx} className="factor-card">
                <div className="factor-header">
                  <span className="factor-title">{factor.title}</span>
                  <span
                    className={`factor-source-badge ${
                      factor.source === 'ABHA_CHRONIC_HISTORY' ? 'source-abha' : 'source-symptom'
                    }`}
                  >
                    {factor.source === 'ABHA_CHRONIC_HISTORY'
                      ? 'Your health history'
                      : factor.source === 'PAST_RECORDS'
                      ? 'Past records'
                      : 'Your symptoms'}
                  </span>
                </div>
                <p className="factor-desc">{factor.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recommended Specialities */}
      {triage.suggestedSpecialties.length > 0 && (
        <div className="specialties-row">
          <span className="spec-label">Doctor type you may need:</span>
          <div className="spec-tags">
            {triage.suggestedSpecialties.slice(0, 3).map((spec, i) => (
              <span key={i} className="spec-badge">
                {spec}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Action Footer */}
      <div className="triage-action-footer">
        <button onClick={onReevaluate} className="btn btn-secondary btn-sm">
          <RotateCcw size={15} />
          <span>Change Symptoms</span>
        </button>

        <button onClick={onProceedRecommendation} className="btn btn-primary btn-lg proceed-btn">
          <span>{triage.recommendedRoute === 'HOSPITAL_VISIT' ? 'See Hospitals' : 'Get Doctor Call'}</span>
          <ArrowRight size={18} />
        </button>
      </div>

      <style>{`
        .triage-result-card {
          padding: 0;
          overflow: hidden;
        }
        .border-red-glow {
          border: 1px solid rgba(239, 68, 68, 0.6);
          box-shadow: 0 0 35px rgba(239, 68, 68, 0.25);
        }
        .border-yellow-glow {
          border: 1px solid rgba(245, 158, 11, 0.5);
          box-shadow: 0 0 30px rgba(245, 158, 11, 0.18);
        }
        .border-green-glow {
          border: 1px solid rgba(16, 185, 129, 0.5);
          box-shadow: 0 0 30px rgba(16, 185, 129, 0.18);
        }
        .triage-hero {
          padding: 1.75rem 2rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          border-bottom: 1px solid var(--border-subtle);
        }
        .hero-top-row {
          display: flex;
          align-items: center;
          gap: 1.25rem;
        }
        .triage-icon-wrap {
          width: 58px;
          height: 58px;
          border-radius: var(--radius-sm);
          background: rgba(0, 0, 0, 0.35);
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .triage-title-group {
          display: flex;
          flex-direction: column;
        }
        .triage-level-label {
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          color: #94a3b8;
        }
        .triage-main-title {
          font-size: 1.6rem;
          font-weight: 800;
          letter-spacing: -0.01em;
        }
        .triage-summary-text {
          font-size: 1rem;
          line-height: 1.5;
          color: #f1f5f9;
        }
        .triage-vitals-strip {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem 2rem;
          background: rgba(0, 0, 0, 0.4);
          padding: 0.85rem 1.25rem;
          border-radius: var(--radius-sm);
          border: 1px solid rgba(255, 255, 255, 0.06);
        }
        .vital-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.82rem;
        }
        .vital-label {
          color: #94a3b8;
        }
        .vital-value {
          color: #ffffff;
        }
        .factors-section {
          padding: 1.5rem 2rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .why-toggle-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--text-primary);
          width: fit-content;
          padding: 0.35rem 0.75rem;
          border-radius: var(--radius-sm);
          background: var(--bg-surface-2);
          border: 1px solid var(--border-subtle);
        }
        .why-toggle-btn:hover {
          border-color: var(--border-highlight);
        }
        .why-chevron {
          font-size: 0.6rem;
          color: var(--text-muted);
        }
        .factors-heading {
          font-size: 1.05rem;
          color: var(--text-primary);
        }
        .factors-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .factor-card {
          background: var(--bg-surface-2);
          border: 1px solid var(--border-subtle);
          padding: 0.85rem 1.1rem;
          border-radius: var(--radius-sm);
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }
        .factor-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .factor-title {
          font-weight: 600;
          font-size: 0.92rem;
          color: #ffffff;
        }
        .factor-source-badge {
          font-size: 0.68rem;
          font-weight: 600;
          padding: 2px 8px;
          border-radius: var(--radius-xs);
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }
        .source-abha {
          background: rgba(14, 165, 233, 0.15);
          color: #38bdf8;
          border: 1px solid rgba(14, 165, 233, 0.35);
        }
        .source-symptom {
          background: rgba(255, 255, 255, 0.08);
          color: #94a3b8;
          border: 1px solid var(--border-subtle);
        }
        .factor-desc {
          font-size: 0.82rem;
          line-height: 1.45;
          color: var(--text-secondary);
        }
        .specialties-row {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0 2rem 1.25rem 2rem;
          flex-wrap: wrap;
        }
        .spec-label {
          font-size: 0.82rem;
          color: var(--text-muted);
        }
        .spec-tags {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        .spec-badge {
          font-size: 0.75rem;
          background: rgba(14, 165, 233, 0.12);
          border: 1px solid rgba(14, 165, 233, 0.3);
          color: var(--brand-accent);
          padding: 2px 10px;
          border-radius: var(--radius-full);
          font-weight: 500;
        }
        .triage-action-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.25rem 2rem;
          background: rgba(15, 23, 42, 0.75);
          border-top: 1px solid var(--border-subtle);
        }
        .proceed-btn {
          padding: 0.85rem 2rem;
          font-size: 1.05rem;
        }
        @media (max-width: 640px) {
          .triage-hero, .factors-section, .triage-action-footer, .specialties-row {
            padding-left: 1.25rem;
            padding-right: 1.25rem;
          }
          .hero-top-row {
            flex-direction: column;
            align-items: flex-start;
          }
          .triage-main-title {
            font-size: 1.3rem;
          }
          .triage-action-footer {
            flex-direction: column-reverse;
            gap: 0.75rem;
          }
          .proceed-btn {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};
