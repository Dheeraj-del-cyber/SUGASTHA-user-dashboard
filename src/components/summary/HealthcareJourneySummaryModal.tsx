import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Building2,
  Activity,
  FileText,
  Clock,
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
      title="SUGASTHA Healthcare Journey Summary"
      subtitle="Comprehensive clinical encounter record compiled for ABHA integration"
      maxWidth="620px"
    >
      <div className="journey-modal-body animate-fade-in">
        {/* Verification Strip */}
        <div className="summary-token-strip">
          <div>
            <span className="text-xs text-muted">CONSULTATION NUMBER</span>
            <strong className="token-display">#{summary.consultationNumber}</strong>
          </div>
          <div className="text-right">
            <span className="text-xs text-muted">ENCOUNTER DATE</span>
            <div className="flex-row items-center gap-1">
              <Calendar size={13} className="text-muted" />
              <strong>{summary.date}</strong>
            </div>
          </div>
        </div>

        {/* Section 1: Clinical Symptoms & History Considered */}
        <div className="summary-section-box">
          <h4 className="section-title-sm">
            <Activity size={15} className="text-teal" /> 1. Reported Symptoms & Considered ABHA History
          </h4>
          <div className="symptoms-tags-row">
            {summary.reportedSymptoms.map((sym, i) => (
              <span key={i} className="sym-tag">
                {sym}
              </span>
            ))}
          </div>
          {summary.consideredMedicalHistory.length > 0 && (
            <div className="history-considered-row">
              <span className="text-xs text-muted">Past Medical Records Corroborated:</span>
              <p className="text-xs text-secondary">
                {summary.consideredMedicalHistory.join(' • ')}
              </p>
            </div>
          )}
        </div>

        {/* Section 2: AI Triage & Recommendation */}
        <div className="summary-section-box">
          <h4 className="section-title-sm">
            <ShieldCheck size={15} className="text-teal" /> 2. System-Generated Clinical Triage
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
              {summary.triageOutcome.level} Priority
            </span>
            <span className="rec-path">
              Route: <strong>{summary.recommendationType.replace('_', ' ')}</strong>
            </span>
          </div>
          <p className="triage-rationale-text">{summary.triageOutcome.rationale}</p>
        </div>

        {/* Section 3: Hospital, Doctor & Queue Details */}
        {summary.hospitalDetails && (
          <div className="summary-section-box">
            <h4 className="section-title-sm">
              <Building2 size={15} className="text-teal" /> 3. Healthcare Provider & Queue Execution
            </h4>
            <div className="provider-details-grid">
              <div>
                <span className="text-muted text-xs">Consulted Facility:</span>
                <p className="font-semibold text-white">{summary.hospitalDetails.hospitalName}</p>
              </div>
              <div>
                <span className="text-muted text-xs">Attending Physician:</span>
                <p className="font-semibold text-teal">{summary.hospitalDetails.doctorName}</p>
              </div>
              <div className="full-col">
                <span className="text-muted text-xs">Queue Progression Buffer:</span>
                <p className="text-xs text-secondary font-mono">
                  {summary.hospitalDetails.queueProgression}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Section 4: Journey Timeline Events */}
        <div className="summary-section-box">
          <h4 className="section-title-sm">
            <Clock size={15} className="text-teal" /> 4. Journey Timeline Events
          </h4>
          <div className="events-timeline-list">
            {summary.eventsTimeline.map((ev, i) => (
              <div key={i} className="timeline-event-item">
                <span className="event-bullet"></span>
                <div className="event-content">
                  <strong>{ev.event}</strong>
                  <p>{ev.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ABHA Synchronization Action */}
        <div className="abha-sync-card">
          <div className="flex-row items-center gap-2">
            <FileText size={20} className="text-teal" />
            <div>
              <strong className="text-white">Update ABHA Health Locker</strong>
              <p className="text-xs text-muted">
                Save this full clinical encounter record to your permanent ABDM health profile.
              </p>
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
                <span>Synced to ABHA!</span>
              </>
            ) : (
              <>
                <ShieldCheck size={15} />
                <span>Sync to ABHA Record</span>
              </>
            )}
          </button>
        </div>
      </div>

      <style>{`
        .journey-modal-body {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .summary-token-strip {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: rgba(14, 165, 233, 0.1);
          border: 1px solid rgba(14, 165, 233, 0.3);
          padding: 0.75rem 1rem;
          border-radius: var(--radius-sm);
        }
        .token-display {
          font-family: var(--font-display);
          font-size: 1.25rem;
          color: var(--brand-accent);
        }
        .summary-section-box {
          background: var(--bg-surface-2);
          border: 1px solid var(--border-subtle);
          padding: 0.85rem 1rem;
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
          color: #ffffff;
        }
        .symptoms-tags-row {
          display: flex;
          flex-wrap: wrap;
          gap: 0.4rem;
        }
        .sym-tag {
          background: rgba(255, 255, 255, 0.08);
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
          color: #ffffff;
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
        .events-timeline-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          position: relative;
        }
        .timeline-event-item {
          display: flex;
          align-items: flex-start;
          gap: 0.65rem;
          font-size: 0.78rem;
        }
        .event-bullet {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--brand-primary);
          margin-top: 5px;
          flex-shrink: 0;
        }
        .event-content strong {
          color: #ffffff;
          display: block;
        }
        .event-content p {
          color: var(--text-muted);
          font-size: 0.72rem;
        }
        .abha-sync-card {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: linear-gradient(135deg, rgba(14, 165, 233, 0.15) 0%, rgba(15, 23, 42, 0.95) 100%);
          border: 1px solid rgba(14, 165, 233, 0.4);
          padding: 1rem 1.25rem;
          border-radius: var(--radius-sm);
        }
      `}</style>
    </Modal>
  );
};
