import React from 'react';
import {
  ShieldCheck,
  Building2,
  UserCheck,
  Layers,
  ArrowRight,
  Clock,
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { Hospital, Doctor, TriageResult, AbhaProfile } from '../../types';
import { hospitalQueueService } from '../../services/hospitalQueueService';
import { MOCK_HOSPITALS } from '../../data/mockHospitals';

interface BookingConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  hospital: Hospital;
  doctor: Doctor;
  triage: TriageResult;
  profile: AbhaProfile;
  onConfirmBooking: () => void;
  isBooking: boolean;
}

export const BookingConfirmationModal: React.FC<BookingConfirmationModalProps> = ({
  isOpen,
  onClose,
  hospital,
  doctor,
  triage,
  profile,
  onConfirmBooking,
  isBooking,
}) => {
  const queueNodes = hospitalQueueService.build3TierHospitalQueue(
    hospital,
    doctor,
    MOCK_HOSPITALS,
    triage
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Confirm Your Visit"
      subtitle="Please check the details before booking"
      maxWidth="580px"
    >
      <div className="booking-confirm-body">
        {/* Patient Demographics Banner */}
        <div className="patient-banner">
          <div className="patient-info">
            <span className="label">Your name:</span>
            <strong>{profile.fullName}</strong>
          </div>
          <div className="patient-info">
            <span className="label">ABHA number:</span>
            <strong className="text-teal font-mono">{profile.abhaNumber}</strong>
          </div>
          <div className="patient-info">
            <span className="label">Priority:</span>
            <span className={`badge ${triage.level === 'RED' ? 'badge-red' : 'badge-yellow'}`}>
              {triage.level === 'RED' ? 'Urgent' : 'Soon'}
            </span>
          </div>
        </div>

        {/* Selected Hospital */}
        <div className="primary-booking-box">
          <div className="box-header">
            <span className="priority-pill priority-1">Your selected hospital</span>
            <span className="slot-badge">
              <Clock size={12} /> {doctor.availableSlotToday}
            </span>
          </div>

          <div className="entity-row">
            <Building2 size={20} className="text-teal" />
            <div>
              <h4 className="entity-name">{hospital.name}</h4>
              <p className="entity-sub">
                {hospital.address} • {hospital.distanceKm} km away
              </p>
            </div>
          </div>

          <div className="entity-row doc-row">
            <UserCheck size={18} className="text-emerald" />
            <div>
              <div className="doc-name-spec">
                <strong>{doctor.name}</strong>
                <span className="spec-tag">{doctor.specialization}</span>
              </div>
              <p className="doc-sub">{doctor.experienceYears} years experience</p>
            </div>
          </div>
        </div>

        {/* Backup Hospitals (simple explanation) */}
        <div className="queue-buffer-section">
          <div className="queue-section-header">
            <Layers size={16} className="text-teal" />
            <h4 className="queue-title">Backup hospitals</h4>
          </div>

          <p className="queue-desc">
            If this hospital is full, we will automatically try these nearby hospitals for you:
          </p>

          <div className="queue-tiers-list">
            {queueNodes.map((node) => (
              <div key={node.priorityOrder} className={`tier-node-card tier-${node.priorityOrder}`}>
                <div className="tier-rank">
                  {node.priorityOrder === 1 ? 'Your choice' : 'Another nearby hospital'}
                </div>
                <div className="tier-content">
                  <strong>{node.hospitalName}</strong>
                  <span className="tier-doc">Dr. {node.doctorName}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <div className="booking-modal-actions">
          <button type="button" onClick={onClose} className="btn btn-secondary">
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirmBooking}
            disabled={isBooking}
            className="btn btn-primary btn-lg book-btn"
          >
            {isBooking ? (
              <span>Booking your visit...</span>
            ) : (
              <>
                <ShieldCheck size={18} />
                <span>Book Visit</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </div>
      </div>

      <style>{`
        .booking-confirm-body {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        .patient-banner {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.75rem;
          background: var(--bg-surface-2);
          border: 1px solid var(--border-subtle);
          padding: 0.75rem 1rem;
          border-radius: var(--radius-sm);
        }
        .patient-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
          font-size: 0.8rem;
        }
        .patient-info .label {
          font-size: 0.68rem;
          color: var(--text-muted);
          text-transform: uppercase;
        }
        .font-mono {
          font-family: monospace;
          letter-spacing: 0.04em;
        }
        .primary-booking-box {
          background: linear-gradient(135deg, rgba(14, 165, 233, 0.12) 0%, rgba(15, 23, 42, 0.9) 100%);
          border: 1px solid rgba(14, 165, 233, 0.4);
          border-radius: var(--radius-md);
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
        }
        .box-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .priority-pill {
          font-size: 0.72rem;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: var(--radius-full);
          text-transform: uppercase;
        }
        .priority-1 {
          background: rgba(14, 165, 233, 0.2);
          border: 1px solid rgba(14, 165, 233, 0.4);
          color: #38bdf8;
        }
        .slot-badge {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.75rem;
          color: #10b981;
          font-weight: 600;
        }
        .entity-row {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
        }
        .entity-name {
          font-size: 1.15rem;
          color: #ffffff;
        }
        .entity-sub {
          font-size: 0.8rem;
          color: var(--text-secondary);
        }
        .doc-row {
          background: rgba(0, 0, 0, 0.25);
          padding: 0.65rem 0.85rem;
          border-radius: var(--radius-sm);
        }
        .doc-name-spec {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
          font-size: 0.92rem;
          color: #ffffff;
        }
        .spec-tag {
          font-size: 0.72rem;
          color: var(--brand-accent);
          background: rgba(14, 165, 233, 0.12);
          padding: 1px 6px;
          border-radius: var(--radius-xs);
        }
        .doc-sub {
          font-size: 0.75rem;
          color: var(--text-muted);
        }
        .queue-buffer-section {
          background: var(--bg-surface-2);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          padding: 1.1rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .queue-section-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .queue-title {
          font-size: 0.95rem;
          color: #ffffff;
        }
        .queue-desc {
          font-size: 0.8rem;
          color: var(--text-secondary);
          line-height: 1.45;
        }
        .queue-tiers-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .tier-node-card {
          display: grid;
          grid-template-columns: auto 1fr auto;
          align-items: center;
          gap: 0.75rem;
          background: rgba(0, 0, 0, 0.25);
          border: 1px solid var(--border-subtle);
          padding: 0.5rem 0.85rem;
          border-radius: var(--radius-sm);
          font-size: 0.8rem;
        }
        .tier-1 {
          border-left: 3px solid #0ea5e9;
        }
        .tier-2 {
          border-left: 3px solid #f59e0b;
        }
        .tier-3 {
          border-left: 3px solid #a855f7;
        }
        .tier-rank {
          font-size: 0.72rem;
          font-weight: 700;
          color: var(--text-muted);
        }
        .tier-content {
          display: flex;
          flex-direction: column;
          gap: 1px;
        }
        .tier-doc {
          font-size: 0.72rem;
          color: var(--text-muted);
        }
        .tier-status {
          font-size: 0.7rem;
          color: var(--brand-accent);
        }
        .booking-modal-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
          padding-top: 0.5rem;
        }
        .book-btn {
          flex: 1;
        }
        @media (max-width: 640px) {
          .patient-banner {
            grid-template-columns: 1fr;
          }
          .tier-node-card {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </Modal>
  );
};
