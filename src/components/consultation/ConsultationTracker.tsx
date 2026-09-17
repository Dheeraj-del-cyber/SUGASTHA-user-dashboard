import React, { useState } from 'react';
import {
  Clock,
  CheckCircle2,
  Building2,
  Layers,
  ArrowRight,
  Sparkles,
  RefreshCw,
  FileCheck,
} from 'lucide-react';
import { ConsultationRequest, HealthcareJourneySummary } from '../../types';
import { consultationService } from '../../services/consultationService';
import { QrCodeDisplay } from './QrCodeDisplay';

interface ConsultationTrackerProps {
  consultation: ConsultationRequest;
  onConsultationUpdated: (updated: ConsultationRequest) => void;
  onJourneyCompleted: (summary: HealthcareJourneySummary) => void;
  onClose?: () => void;
}

export const ConsultationTracker: React.FC<ConsultationTrackerProps> = ({
  consultation,
  onConsultationUpdated,
  onJourneyCompleted,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showDevTools, setShowDevTools] = useState(false);

  // Status timeline steps (patient-friendly wording; internal state keys unchanged)
  const steps = [
    { key: 'REQUEST_CREATED', label: 'Visit booked', desc: 'Your request was sent' },
    { key: 'PENDING', label: 'Waiting for hospital', desc: 'The hospital is checking' },
    { key: 'CONFIRMED', label: 'Visit confirmed', desc: 'Get your hospital pass' },
    { key: 'COMPLETED', label: 'Visit completed', desc: 'Summary saved to records' },
  ];

  const getStepIndex = (status: string) => {
    switch (status) {
      case 'REQUEST_CREATED':
        return 0;
      case 'PENDING':
        return 1;
      case 'HOSPITAL_ACCEPTED':
      case 'CONFIRMED':
        return 2;
      case 'COMPLETED':
        return 3;
      default:
        return 1;
    }
  };

  const currentStepIdx = getStepIndex(consultation.status);

  // Backend / Webhook Simulation triggers (User-side test harness)
  const handleSimulateHospitalAccept = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const updated = consultationService.confirmConsultation(consultation);
      setIsProcessing(false);
      onConsultationUpdated(updated);
    }, 600);
  };

  const handleSimulateHospitalFailover = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const updated = consultationService.failoverToNextBackupHospital(
        consultation,
        'Hospital ER Capacity at Maximum Threshold'
      );
      setIsProcessing(false);
      onConsultationUpdated(updated);
    }, 700);
  };

  const handleCompleteHealthcareJourney = async () => {
    setIsProcessing(true);
    const summary = await consultationService.completeHealthcareJourney(
      consultation,
      null,
      ['Type 2 Diabetes (Active)', 'Hypertension Stage 1']
    );
    setIsProcessing(false);
    onJourneyCompleted(summary);
  };

  const activeNode =
    consultation.queueState.queueNodes.find((n) => n.status === 'PENDING_RESPONSE') ||
    consultation.queueState.queueNodes.find((n) => n.status === 'ACCEPTED') ||
    consultation.queueState.queueNodes[0];

  return (
    <div className="tracker-wrapper animate-fade-in">
      {/* Visit details and hospital pass */}
      <div className="card tracker-top-card">
        <div className="tracker-id-row">
          <div className="id-col">
            <span className="label">YOUR VISIT</span>
            <h2 className="consult-id">{consultation.selectedHospital.name}</h2>
          </div>

        </div>

        <div className="visit-details-row">
          <div>
            <span>Hospital</span>
            <strong>{consultation.selectedHospital.name}</strong>
          </div>
          <div>
            <span>Doctor</span>
            <strong>{consultation.selectedDoctor.name}</strong>
          </div>
          <div>
            <span>Time</span>
            <strong>{consultation.appointmentSlot}</strong>
          </div>
        </div>

        <div className="tracker-visit-grid">
          <QrCodeDisplay consultation={consultation} size={180} />
        </div>

        {/* Status Callout Banner */}
        <div
          className={`status-callout ${
            consultation.status === 'CONFIRMED' ? 'callout-confirmed' : 'callout-pending'
          }`}
        >
          {consultation.status === 'CONFIRMED' ? (
            <CheckCircle2 size={24} className="text-emerald flex-shrink-0" />
          ) : (
            <Clock size={24} className="text-amber flex-shrink-0" />
          )}
          <div className="callout-text">
            <h4>
              {consultation.status === 'CONFIRMED'
                ? 'Visit confirmed!'
                : `Waiting for ${activeNode.hospitalName}`}
            </h4>
            <p>
              {consultation.status === 'CONFIRMED'
                ? `Go to ${consultation.selectedHospital.name} at your appointment time. Show your QR pass or PIN #${consultation.consultationNumber} at the desk.`
                : `The hospital is checking your request. If they are full, we will try the next hospital for you.`}
            </p>
          </div>
        </div>
      </div>

      {/* Progress Timeline Tracker */}
      <div className="card timeline-card">
        <h3 className="section-title">What is happening</h3>
        <div className="tracker-steps-line">
          {steps.map((step, idx) => {
            const isCompleted = idx < currentStepIdx;
            const isCurrent = idx === currentStepIdx;
            return (
              <div
                key={step.key}
                className={`tracker-step-item ${isCompleted ? 'completed' : ''} ${
                  isCurrent ? 'current' : ''
                }`}
              >
                <div className="step-marker">
                  {isCompleted ? <CheckCircle2 size={16} /> : idx + 1}
                </div>
                <div className="step-info">
                  <span className="step-title">{step.label}</span>
                  <span className="step-sub">{step.desc}</span>
                </div>
                {idx < steps.length - 1 && <div className="step-connector"></div>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Hospital list status (simple wording; internal queue state unchanged) */}
      <div className="card queue-tracking-card">
        <div className="queue-card-top">
          <div className="flex-row items-center gap-2">
            <Layers size={18} className="text-teal" />
            <h3 className="section-title">Hospitals we are trying</h3>
          </div>
        </div>

        <div className="queue-nodes-stream">
          {consultation.queueState.queueNodes.map((node) => {
            const isNodeActive = node.status === 'PENDING_RESPONSE';
            const isNodeAccepted = node.status === 'ACCEPTED';
            const isNodePassed = node.status === 'PASSED_TO_NEXT';

            return (
              <div
                key={node.priorityOrder}
                className={`queue-node-box ${
                  isNodeAccepted
                    ? 'node-accepted'
                    : isNodeActive
                    ? 'node-active'
                    : isNodePassed
                    ? 'node-passed'
                    : 'node-queued'
                }`}
              >
                <div className="node-rank-badge">
                  {node.priorityOrder === 1 ? 'Selected' : 'Backup'}
                </div>

                <div className="node-details">
                  <div className="node-hosp-row">
                    <Building2 size={15} className="text-muted" />
                    <strong>{node.hospitalName}</strong>
                  </div>
                  {node.rejectionReason && (
                    <span className="rejection-hint">Hospital full</span>
                  )}
                </div>

                <div className="node-status-pill">
                  {isNodeAccepted ? (
                    <span className="badge badge-green">Here</span>
                  ) : isNodeActive ? (
                    <span className="badge badge-yellow">Waiting</span>
                  ) : isNodePassed ? (
                    <span className="badge badge-red">Full</span>
                  ) : (
                    <span className="badge badge-info">Next</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Primary action: finish visit after confirmation */}
      {consultation.status === 'CONFIRMED' && (
        <div className="card finish-action-card">
          <button
            type="button"
            onClick={handleCompleteHealthcareJourney}
            disabled={isProcessing}
            className="btn btn-primary btn-sm btn-finish"
          >
            <FileCheck size={16} />
            <span>Visit done — View Summary</span>
            <ArrowRight size={16} />
          </button>
        </div>
      )}

      {/* Developer-only hospital simulation tools (collapsed by default) */}
      <div className="card test-api-toolbar">
        <button
          type="button"
          className="dev-toggle-btn"
          onClick={() => setShowDevTools(!showDevTools)}
        >
          <Sparkles size={14} className="text-amber" />
          <span>{showDevTools ? 'Hide developer tools' : 'Developer tools (demo)'}</span>
        </button>

        {showDevTools && (
          <>
            <p className="toolbar-desc">
              Simulates incoming hospital webhook events to test the user-side tracker (the hospital system is a separate build):
            </p>

            <div className="toolbar-actions">
              {consultation.status === 'PENDING' && (
                <>
                  <button
                    type="button"
                    onClick={handleSimulateHospitalAccept}
                    disabled={isProcessing}
                    className="btn btn-primary btn-sm"
                  >
                    <CheckCircle2 size={15} />
                    <span>Simulate: Hospital Accepts Request (Confirm)</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSimulateHospitalFailover}
                    disabled={isProcessing || consultation.queueState.activePriority >= 3}
                    className="btn btn-secondary btn-sm"
                  >
                    <RefreshCw size={14} />
                    <span>Simulate: Hospital Busy → Failover to Backup</span>
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </div>

      <style>{`
        .tracker-wrapper {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .tracker-top-card {
          display: flex;
          flex-direction: column;
          gap: 0.7rem;
          align-items: stretch;
          border: 1px solid #000000;
        }
        .timeline-card,
        .queue-tracking-card,
        .finish-action-card {
          border: 1px solid #000000;
        }
        .tracker-id-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 1rem;
        }
        .tracker-visit-grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr);
          align-items: center;
          gap: 1rem;
        }
        .visit-details-row {
          display: grid;
          grid-template-columns: 1.5fr 1fr 1fr;
          gap: 0.5rem;
          padding: 0.5rem 0.65rem;
          background: var(--pastel-light-blue);
          border: 1px solid #17202A;
          border-radius: var(--radius-sm);
        }
        .visit-details-row div {
          display: flex;
          flex-direction: column;
          gap: 2px;
          min-width: 0;
        }
        .visit-details-row span {
          color: var(--text-muted);
          font-size: 0.65rem;
          text-transform: uppercase;
          font-weight: 700;
        }
        .visit-details-row strong {
          color: #000000;
          font-size: 0.72rem;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .id-col {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .id-col .label {
          font-size: 0.68rem;
          font-weight: 700;
          color: var(--text-muted);
          letter-spacing: 0.06em;
        }
        .consult-id {
          font-size: 1.35rem;
          color: var(--dark-navy-text);
        }
        .status-callout {
          display: flex;
          align-items: flex-start;
          gap: 0.55rem;
          padding: 0.65rem 0.75rem;
          border-radius: var(--radius-sm);
        }
        .callout-pending {
          background: rgba(245, 158, 11, 0.12);
          border: 1px solid #000000;
        }
        .callout-confirmed {
          background: rgba(16, 185, 129, 0.12);
          border: 1px solid #000000;
        }
        .callout-text h4 {
          font-size: 0.85rem;
          color: #000000;
        }
        .callout-text p {
          font-size: 0.72rem;
          color: #000000;
          margin-top: 1px;
        }
        @media (max-width: 768px) {
          .tracker-visit-grid {
            grid-template-columns: 1fr;
          }
          .visit-details-row {
            grid-template-columns: 1fr;
            gap: 0.35rem;
            padding: 0.45rem 0.55rem;
          }
          .visit-details-row div {
            gap: 1px;
          }
          .visit-details-row span {
            font-size: 0.58rem;
          }
          .visit-details-row strong {
            font-size: 0.68rem;
          }
          .status-callout {
            gap: 0.4rem;
            padding: 0.55rem 0.6rem;
          }
          .status-callout svg {
            width: 18px;
            height: 18px;
          }
          .callout-text h4 {
            font-size: 0.78rem;
          }
          .callout-text p {
            font-size: 0.68rem;
          }
          .queue-tracking-card {
            gap: 0.55rem;
            padding: 0.75rem;
          }
          .queue-card-top .section-title {
            font-size: 0.82rem;
          }
          .queue-card-top svg {
            width: 15px;
            height: 15px;
          }
          .queue-nodes-stream {
            gap: 0.35rem;
          }
          .queue-node-box {
            grid-template-columns: auto minmax(0, 1fr) auto;
            gap: 0.45rem;
            padding: 0.45rem 0.55rem;
          }
          .node-rank-badge {
            font-size: 0.6rem;
          }
          .node-hosp-row {
            font-size: 0.7rem;
          }
          .node-hosp-row svg {
            width: 13px;
            height: 13px;
          }
          .node-status-pill .badge {
            font-size: 0.58rem;
            padding: 2px 5px;
          }
        }
        .timeline-card {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        .tracker-steps-line {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0.5rem;
          position: relative;
        }
        .tracker-step-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 0.5rem;
          position: relative;
        }
        .step-marker {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: var(--bg-surface-3);
          border: 2px solid #000000;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.85rem;
          color: var(--text-muted);
          z-index: 2;
        }
        .tracker-step-item.completed .step-marker {
          background: #10b981;
          border-color: #10b981;
          color: #ffffff;
        }
        .tracker-step-item.current .step-marker {
          border-color: var(--brand-primary);
          background: var(--brand-primary);
          color: #ffffff;
          box-shadow: 0 0 12px var(--brand-primary-glow);
        }
        .step-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .step-title {
          font-size: 0.82rem;
          font-weight: 600;
          color: #ffffff;
        }
        .step-sub {
          font-size: 0.7rem;
          color: var(--text-muted);
        }
        .step-connector {
          position: absolute;
          top: 17px;
          left: 50%;
          width: 100%;
          height: 2px;
          background: var(--border-subtle);
          z-index: 1;
        }
        .tracker-step-item.completed .step-connector {
          background: #10b981;
        }
        .queue-tracking-card {
          display: flex;
          flex-direction: column;
          gap: 1.1rem;
        }
        .queue-card-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .queue-explanation {
          font-size: 0.85rem;
          color: var(--text-secondary);
        }
        .queue-nodes-stream {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .queue-node-box {
          display: grid;
          grid-template-columns: auto 1fr auto;
          align-items: center;
          gap: 1rem;
          padding: 0.85rem 1.1rem;
          border-radius: var(--radius-sm);
          background: var(--bg-surface-2);
          border: 1px solid #000000;
        }
        .node-active {
          border-color: #000000;
          background: rgba(14, 165, 233, 0.1);
        }
        .node-accepted {
          border-color: #000000;
          background: rgba(16, 185, 129, 0.1);
        }
        .node-passed {
          opacity: 0.65;
          border-color: #000000;
        }
        .node-rank-badge {
          font-size: 0.72rem;
          font-weight: 700;
          color: var(--brand-accent);
        }
        .node-details {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .node-hosp-row, .node-doc-row {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.85rem;
        }
        .rejection-hint {
          font-size: 0.72rem;
          color: #f87171;
        }
        .finish-action-card {
          display: flex;
          justify-content: center;
          padding: 1.25rem;
        }
        .finish-action-card .btn-finish {
          width: 100%;
          max-width: 440px;
          height: 52px;
          font-size: 1rem;
        }
        .test-api-toolbar {
          background: rgba(245, 158, 11, 0.06);
          border: 1px solid #000000;
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
          padding: 1.25rem;
        }
        .dev-toggle-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-muted);
          width: fit-content;
        }
        .dev-toggle-btn:hover {
          color: var(--text-secondary);
        }
        .toolbar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .toolbar-desc {
          font-size: 0.8rem;
          color: var(--text-muted);
        }
        .toolbar-actions {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
        }
        .btn-finish {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        }
        @media (max-width: 768px) {
          .tracker-steps-line {
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 0.15rem;
            overflow: hidden;
            padding-bottom: 0;
          }
          .tracker-step-item {
            min-width: 0;
            gap: 0.3rem;
          }
          .step-marker {
            width: 26px;
            height: 26px;
            font-size: 0.68rem;
          }
          .step-title {
            font-size: 0.62rem;
            line-height: 1.15;
          }
          .step-sub {
            font-size: 0.54rem;
            line-height: 1.15;
          }
          .step-connector {
            top: 13px;
          }
          .queue-node-box {
            grid-template-columns: 1fr;
            gap: 0.5rem;
          }
        }
      `}</style>
    </div>
  );
};
