import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Building2,
  Activity,
  FileText,
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { HealthcareJourneySummary } from '../../types';

interface HealthcareJourneySummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  summary: HealthcareJourneySummary | null;
  onSynced: () => void;
}

export const HealthcareJourneySummaryModal: React.FC<HealthcareJourneySummaryModalProps> = ({
  isOpen,
  onClose,
  summary,
  onSynced,
}) => {
  const [synced, setSynced] = useState(false);

  if (!summary) return null;

  const handleSyncClick = () => {
    setSynced(true);
    setTimeout(() => {
      onSynced();
      onClose();
    }, 1200);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Visit Summary"
      subtitle="Your visit details"
      maxWidth="560px"
    >
      <div className="journey-modal-body animate-fade-in">
        {/* PIN & date */}
        <div className="summary-token-strip">
          <div>
            <span className="summary-label">PIN</span>
            <strong className="token-display">{summary.consultationNumber}</strong>
          </div>
          <div className="text-right">
            <span className="text-xs text-muted">DATE</span>
            <div className="flex-row items-center gap-1">
              <Calendar size={13} className="text-muted" />
              <strong>{summary.date}</strong>
            </div>
          </div>
        </div>

        {/* Section 1: Your symptoms */}
        <div className="summary-section-box">
          <h4 className="section-title-sm">
            <Activity size={15} className="text-teal" /> Your symptoms
          </h4>
          <div className="symptoms-tags-row">
            {summary.reportedSymptoms.map((sym, i) => (
              <span key={i} className="sym-tag">
                {sym}
              </span>
            ))}
          </div>
        </div>

        {/* Care priority */}
        <div className="summary-section-box">
          <h4 className="section-title-sm">
            <ShieldCheck size={15} className="text-teal" /> Your health priority
          </h4>
          <div className="triage-pill-row">
            <span
              className={`badge ${
                summary.triageOutcome.level === 'RED'
                  ? 'badge-red'
                  : summary.triageOutcome.level === 'YELLOW'
                  ? 'badge-yellow'
                  : 'badge-green'
              }`}
            >
              {summary.triageOutcome.level === 'RED'
                ? 'Urgent — go now'
                : summary.triageOutcome.level === 'YELLOW'
                ? 'See a doctor soon'
                : 'Normal visit'}
            </span>
            <span className="rec-path">
              Care: <strong>{summary.recommendationType === 'TELECONSULTATION' ? 'Doctor video call' : 'Hospital visit'}</strong>
            </span>
          </div>
        </div>

        {/* Hospital & doctor */}
        {summary.hospitalDetails && (
          <div className="summary-section-box">
            <h4 className="section-title-sm">
              <Building2 size={15} className="text-teal" /> Visit details
            </h4>
            <div className="provider-details-grid">
              <div>
                <span className="text-muted text-xs">Hospital:</span>
                <p className="font-semibold summary-dark-text">{summary.hospitalDetails.hospitalName}</p>
              </div>
              <div>
                <span className="text-muted text-xs">Doctor:</span>
                <p className="font-semibold text-teal">{summary.hospitalDetails.doctorName}</p>
              </div>
            </div>
          </div>
        )}

        {/* Save to records */}
        <div className="abha-sync-card">
          <div className="flex-row items-center gap-2">
            <FileText size={20} className="text-teal" />
            <div>
              <strong className="summary-dark-text">Save this visit</strong>
            </div>
          </div>

          <button
            onClick={handleSyncClick}
            disabled={synced}
            className={`btn ${synced ? 'btn-secondary' : 'btn-primary'} btn-sm`}
          >
            {synced ? (
              <>
                <CheckCircle2 size={15} className="text-emerald" />
                <span>Saved!</span>
              </>
            ) : (
              <>
                <ShieldCheck size={15} />
                <span>Save visit</span>
              </>
            )}
          </button>
        </div>
      </div>

      <style>{`
        .journey-modal-body {
          display: flex;
          flex-direction: column;
          gap: 0.7rem;
        }
        .summary-token-strip {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: var(--pastel-light-blue);
          border: 1px solid #000000;
          padding: 0.55rem 0.75rem;
          border-radius: var(--radius-sm);
        }
        .token-display {
          font-family: var(--font-display);
          font-size: 1.25rem;
          color: var(--brand-accent);
        }
        .summary-label {
          display: block;
          color: var(--text-muted);
          font-size: 0.65rem;
          font-weight: 700;
          text-transform: uppercase;
        }
        .summary-dark-text {
          color: var(--dark-navy-text);
        }
        .summary-section-box {
          background: var(--bg-surface-2);
          border: 1px solid #000000;
          padding: 0.65rem 0.75rem;
          border-radius: var(--radius-sm);
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .section-title-sm {
          font-size: 0.88rem;
          display: flex;
          align-items: center;
          gap: 6px;
          color: var(--dark-navy-text);
        }
        .symptoms-tags-row {
          display: flex;
          flex-wrap: wrap;
          gap: 0.4rem;
        }
        .sym-tag {
          background: var(--pastel-light-blue);
          font-size: 0.75rem;
          padding: 2px 8px;
          border-radius: var(--radius-xs);
          color: var(--text-primary);
        }
        .triage-pill-row {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .rec-path {
          font-size: 0.8rem;
          color: var(--text-secondary);
        }
        .rec-path strong {
          color: var(--dark-navy-text);
        }
        .triage-rationale-text {
          font-size: 0.8rem;
          color: var(--text-secondary);
          line-height: 1.4;
        }
        .provider-details-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.6rem;
          font-size: 0.82rem;
        }
        .abha-sync-card {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: var(--pastel-light-blue);
          border: 1px solid #000000;
          padding: 0.65rem 0.75rem;
          border-radius: var(--radius-sm);
        }
      `}</style>
    </Modal>
  );
};
