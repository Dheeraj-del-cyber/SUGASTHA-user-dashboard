import React, { useState } from 'react';
import {
  Building2,
  UserCheck,
  QrCode,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { ConsultationRequest } from '../../types';
import { Modal } from '../common/Modal';
import { QrCodeDisplay } from './QrCodeDisplay';

interface ActiveConsultationCardProps {
  consultation: ConsultationRequest;
  onOpenTracker: () => void;
}

export const ActiveConsultationCard: React.FC<ActiveConsultationCardProps> = ({
  consultation,
  onOpenTracker,
}) => {
  const [showQrModal, setShowQrModal] = useState(false);

  const isConfirmed = consultation.status === 'CONFIRMED';
  const activeNode =
    consultation.queueState.queueNodes.find((n) => n.status === 'PENDING_RESPONSE') ||
    consultation.queueState.queueNodes.find((n) => n.status === 'ACCEPTED') ||
    consultation.queueState.queueNodes[0];

  return (
    <div className={`card active-consultation-banner ${isConfirmed ? 'banner-confirmed' : 'banner-pending'}`}>
      <div className="banner-top-row">
        <div className="banner-title-group">
          <div className="flex-row items-center gap-2">
            <span className="live-ping"></span>
            <span className="status-kicker">ACTIVE CONSULTATION IN PROGRESS</span>
          </div>
          <h3 className="consultation-id-title font-mono">{consultation.id}</h3>
        </div>

        <div className="banner-right-badges">
          {/* 5-Digit Token Display */}
          <div className="token-capsule">
            <span className="cap-label">Token:</span>
            <strong className="cap-num">#{consultation.consultationNumber}</strong>
          </div>

          <span className={`badge ${isConfirmed ? 'badge-green' : 'badge-yellow'}`}>
            {isConfirmed ? 'CONFIRMED' : 'PENDING'}
          </span>
        </div>
      </div>

      {/* Hospital & Doctor Details */}
      <div className="hospital-quick-details">
        <div className="detail-col">
          <div className="flex-row items-center gap-2">
            <Building2 size={16} className="text-teal" />
            <strong className="text-white">{consultation.selectedHospital.name}</strong>
          </div>
          <span className="text-sub">
            {consultation.selectedHospital.address} • {consultation.selectedHospital.distanceKm} km
          </span>
        </div>

        <div className="detail-col">
          <div className="flex-row items-center gap-2">
            <UserCheck size={16} className="text-emerald" />
            <strong className="text-white">{consultation.selectedDoctor.name}</strong>
          </div>
          <span className="text-sub">{consultation.selectedDoctor.specialization}</span>
        </div>

        <div className="detail-col">
          <div className="flex-row items-center gap-2">
            <ShieldCheck size={16} className="text-teal" />
            <span className="text-muted">Queue Status:</span>
          </div>
          <span className="text-sub text-teal">
            Tier {activeNode.priorityOrder} ({activeNode.hospitalName.split(' ')[0]})
          </span>
        </div>
      </div>

      {/* Action Footer */}
      <div className="banner-footer-actions">
        <button onClick={() => setShowQrModal(true)} className="btn btn-secondary btn-sm">
          <QrCode size={15} className="text-teal" />
          <span>Show QR Verification Pass</span>
        </button>

        <button onClick={onOpenTracker} className="btn btn-primary btn-sm">
          <span>Open Full Tracking Interface</span>
          <ArrowRight size={15} />
        </button>
      </div>

      {/* QR Modal */}
      <Modal
        isOpen={showQrModal}
        onClose={() => setShowQrModal(false)}
        title="Consultation Pass & QR Verification"
        subtitle="Verification Token for Hospital Check-in"
        maxWidth="440px"
      >
        <QrCodeDisplay consultation={consultation} size={200} />
      </Modal>

      <style>{`
        .active-consultation-banner {
          background: linear-gradient(135deg, rgba(22, 32, 54, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%);
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          padding: 1.5rem;
          position: relative;
        }
        .banner-pending {
          border-left: 4px solid #f59e0b;
        }
        .banner-confirmed {
          border-left: 4px solid #10b981;
        }
        .banner-top-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          flex-wrap: wrap;
          gap: 1rem;
        }
        .banner-title-group {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }
        .live-ping {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #10b981;
          box-shadow: 0 0 8px #10b981;
          animation: pulseGlow 1.5s infinite;
        }
        .status-kicker {
          font-size: 0.68rem;
          font-weight: 700;
          color: #94a3b8;
          letter-spacing: 0.08em;
        }
        .consultation-id-title {
          font-size: 1.35rem;
          color: #ffffff;
        }
        .banner-right-badges {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .token-capsule {
          display: flex;
          align-items: center;
          gap: 4px;
          background: rgba(14, 165, 233, 0.12);
          border: 1px solid rgba(14, 165, 233, 0.35);
          padding: 4px 10px;
          border-radius: var(--radius-full);
        }
        .cap-label {
          font-size: 0.72rem;
          color: var(--text-muted);
        }
        .cap-num {
          font-family: var(--font-display);
          font-size: 1.15rem;
          color: var(--brand-accent);
        }
        .hospital-quick-details {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
          background: rgba(0, 0, 0, 0.3);
          padding: 0.85rem 1.1rem;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-subtle);
        }
        .detail-col {
          display: flex;
          flex-direction: column;
          gap: 2px;
          font-size: 0.85rem;
        }
        .text-sub {
          font-size: 0.75rem;
          color: var(--text-muted);
        }
        .banner-footer-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 0.75rem;
        }
        @media (max-width: 768px) {
          .hospital-quick-details {
            grid-template-columns: 1fr;
          }
          .banner-footer-actions {
            flex-direction: column;
            width: 100%;
          }
          .banner-footer-actions button {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};
