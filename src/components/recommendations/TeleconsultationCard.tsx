import React from 'react';
import { useTranslation } from 'react-i18next';
import { Video, Clock3, ShieldCheck, Stethoscope, ArrowLeft, ArrowRight } from 'lucide-react';
import { TriageResult } from '../../types';

interface TeleconsultationCardProps {
  triage: TriageResult;
  onBookTeleconsultation: () => void;
  onSwitchToHospitalVisit: () => void;
}

export const TeleconsultationCard: React.FC<TeleconsultationCardProps> = ({
  triage,
  onBookTeleconsultation,
  onSwitchToHospitalVisit,
}) => {
  const { t } = useTranslation();

  return (
    <div className="card teleconsult-card animate-fade-in">
      <div className="teleconsult-topline">
        <span className="teleconsult-service-mark"><ShieldCheck size={15} /> ONLINE CARE OPTION</span>
        <span className={`triage-indicator triage-${triage.level.toLowerCase()}`}>{triage.level} PRIORITY</span>
      </div>

      <div className="teleconsult-main">
        <section className="teleconsult-intro">
          <div className="teleconsult-brand-lockup">
            <span className="video-icon-circle"><Video size={27} /></span>
            <span className="teleconsult-wordmark">eSanjeevani</span>
          </div>

          <h2 className="tele-title">Talk to a doctor from home</h2>
          <p className="tele-desc">
            Your assessment suggests online care may be suitable. Review your triage details and create a consultation request when you are ready.
          </p>

          <div className="teleconsult-facts">
            <span><Clock3 size={16} /> No travel to a clinic</span>
            <span><Stethoscope size={16} /> General online care</span>
          </div>
        </section>

        <aside className="teleconsult-assessment" aria-label="Your assessment summary">
          <div className="assessment-label">YOUR ASSESSMENT</div>
          <div className="assessment-category">{triage.category}</div>
          <p className="assessment-summary">{triage.summary}</p>
          <div className="assessment-divider" />
          <div className="assessment-detail-row">
            <span>Suggested specialty</span>
            <strong>{triage.suggestedSpecialties[0] || 'General Medicine'}</strong>
          </div>
          <div className="assessment-detail-row">
            <span>Recommended timing</span>
            <strong>{triage.urgencyWindow}</strong>
          </div>
        </aside>
      </div>

      <div className="teleconsult-safety-note">
        <ShieldCheck size={17} />
        <span>This demo records the request in SUGASTHA but is not connected to eSanjeevani yet. For emergencies, seek immediate in-person care.</span>
      </div>

      <div className="teleconsult-footer">
        <button
          type="button"
          className="teleconsult-back-btn"
          onClick={onSwitchToHospitalVisit}
        >
          <ArrowLeft size={16} />
          <span>{t('recommendations.preferHospital')}</span>
        </button>

        <button
          type="button"
          className="teleconsult-connect-btn"
          onClick={onBookTeleconsultation}
        >
          <Video size={18} />
          <span>{t('recommendations.doctorCall')}</span>
          <ArrowRight size={18} />
        </button>
      </div>

      <style>{`
        .teleconsult-card {
          --tele-ink: #17202a;
          --tele-muted: #4a5568;
          --tele-blue: #0284c7;
          --tele-border: #bfe9f8;
          position: relative;
          overflow: hidden;
          border: 1px solid var(--tele-border);
          background: #f4faff;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          padding: clamp(1rem, 3vw, 2rem);
          box-shadow: 0 14px 34px rgba(2, 132, 199, 0.08);
        }
        .teleconsult-topline,
        .teleconsult-brand-lockup,
        .teleconsult-facts,
        .teleconsult-footer,
        .teleconsult-service-mark,
        .triage-indicator {
          display: flex;
          align-items: center;
        }
        .teleconsult-topline {
          justify-content: space-between;
          gap: 0.75rem;
          flex-wrap: wrap;
        }
        .teleconsult-service-mark {
          gap: 0.4rem;
          color: var(--brand-primary);
          font-size: 0.77rem;
          font-weight: 700;
        }
        .triage-indicator {
          min-height: 28px;
          padding: 0.25rem 0.55rem;
          border-radius: 4px;
          font-size: 0.68rem;
          font-weight: 800;
        }
        .triage-green { background: #dff3e8; color: #176b42; }
        .triage-yellow { background: #fff1c9; color: #865c00; }
        .triage-red { background: #fde2df; color: #a02c24; }
        .teleconsult-main {
          display: grid;
          grid-template-columns: minmax(0, 1.25fr) minmax(250px, 0.75fr);
          gap: clamp(1.25rem, 4vw, 3rem);
          align-items: center;
        }
        .teleconsult-intro {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 0.8rem;
        }
        .teleconsult-brand-lockup { gap: 0.65rem; }
        .teleconsult-wordmark {
          color: var(--brand-primary-hover);
          font-family: var(--font-display);
          font-size: 1rem;
          font-weight: 750;
        }
        .video-icon-circle {
          display: inline-flex;
          width: 42px;
          height: 42px;
          border-radius: 8px;
          background: var(--pastel-light-blue);
          border: 1px solid var(--pastel-sky-blue);
          color: var(--brand-primary);
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .tele-title {
          max-width: 520px;
          color: var(--tele-ink);
          font-size: clamp(1.45rem, 3vw, 2rem);
          line-height: 1.15;
        }
        .tele-desc {
          max-width: 560px;
          color: var(--tele-muted);
          font-size: 0.92rem;
          line-height: 1.55;
        }
        .teleconsult-facts {
          flex-wrap: wrap;
          gap: 0.55rem 1rem;
          margin-top: 0.2rem;
        }
        .teleconsult-facts span {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          color: #36576a;
          font-size: 0.77rem;
        }
        .teleconsult-assessment {
          padding: 1.1rem;
          background: #ffffff;
          border: 1px solid #d5e8f1;
          border-left: 3px solid var(--brand-accent);
          border-radius: 6px;
        }
        .assessment-label {
          color: var(--text-muted);
          font-size: 0.65rem;
          font-weight: 800;
          letter-spacing: 0.08em;
        }
        .assessment-category {
          margin-top: 0.45rem;
          color: var(--tele-ink);
          font-size: 0.95rem;
          font-weight: 750;
        }
        .assessment-summary {
          margin-top: 0.4rem;
          color: var(--text-secondary);
          font-size: 0.79rem;
          line-height: 1.5;
        }
        .assessment-divider {
          height: 1px;
          margin: 0.8rem 0;
          background: var(--border-light);
        }
        .assessment-detail-row {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          gap: 0.75rem;
          padding: 0.28rem 0;
          font-size: 0.72rem;
        }
        .assessment-detail-row span { color: var(--text-muted); }
        .assessment-detail-row strong {
          color: var(--dark-navy-text);
          text-align: right;
        }
        .teleconsult-safety-note {
          display: flex;
          align-items: flex-start;
          gap: 0.5rem;
          color: var(--text-secondary);
          font-size: 0.75rem;
          line-height: 1.45;
        }
        .teleconsult-safety-note svg { color: var(--brand-primary); flex: 0 0 auto; }
        .teleconsult-footer {
          justify-content: space-between;
          gap: 0.75rem;
          padding-top: 0.25rem;
          border-top: 1px solid #d5e8f1;
        }
        .teleconsult-back-btn,
        .teleconsult-connect-btn {
          display: inline-flex;
          min-height: 46px;
          align-items: center;
          justify-content: center;
          gap: 0.55rem;
          padding: 0.65rem 1rem;
          border-radius: 5px;
          font-size: 0.85rem;
          font-weight: 700;
          transition: background-color 150ms ease, transform 150ms ease;
        }
        .teleconsult-back-btn {
          color: var(--brand-primary-hover);
          border: 1px solid #b9ddeb;
          background: #fff;
        }
        .teleconsult-back-btn:hover { background: var(--pastel-light-blue); }
        .teleconsult-connect-btn {
          min-width: 230px;
          color: #fff;
          background: var(--brand-primary);
          box-shadow: 0 5px 14px rgba(2, 132, 199, 0.2);
        }
        .teleconsult-connect-btn:hover {
          background: var(--brand-primary-hover);
          transform: translateY(-1px);
        }
        @media (max-width: 768px) {
          .teleconsult-main {
            grid-template-columns: 1fr;
          }
          .teleconsult-footer {
            align-items: stretch;
            flex-direction: column-reverse;
          }
          .teleconsult-connect-btn,
          .teleconsult-back-btn {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};
