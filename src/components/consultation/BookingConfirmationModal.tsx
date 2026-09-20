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

interface BookingConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  hospital: Hospital;
  doctor: Doctor;
  triage: TriageResult;
  profile: AbhaProfile;
  userLocation?: { latitude: number; longitude: number } | null;
  nearbyHospitals?: Hospital[];
  onConfirmBooking: () => void;
  isBooking: boolean;
}

export const BookingConfirmationModal: React.FC<BookingConfirmationModalProps> = ({
  isOpen,
  onClose,
  hospital,
  doctor,
  triage,
  userLocation,
  nearbyHospitals,
  onConfirmBooking,
  isBooking,
}) => {
  const queueNodes = hospitalQueueService.build3TierHospitalQueue(
    hospital,
    doctor,
    nearbyHospitals && nearbyHospitals.length > 0 ? nearbyHospitals : [hospital],
    triage,
    userLocation ?? undefined
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Confirm Your Visit"
      subtitle="Check details"
      maxWidth="540px"
    >
      <div className="booking-confirm-body">
        {/* Selected Hospital */}
        <div className="primary-booking-box">
          <div className="box-header">
            <span className="priority-pill priority-1">Hospital</span>
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
              </div>
            </div>
          </div>
        </div>

        {/* Backup Hospitals (simple explanation) */}
        <div className="queue-buffer-section">
          <div className="queue-section-header">
            <Layers size={16} className="text-teal" />
            <h4 className="queue-title">Backup hospitals</h4>
          </div>

          <p className="queue-desc">Backup hospitals if needed</p>

          <div className="queue-tiers-list">
            {queueNodes.map((node) => (
              <div key={node.priorityOrder} className={`tier-node-card tier-${node.priorityOrder}`}>
                <div className="tier-rank">
                  {node.priorityOrder === 1 ? 'Selected' : `Backup ${node.priorityOrder - 1}`}
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
          gap: 0.8rem;
        }
        .primary-booking-box {
          background: var(--pastel-light-blue);
          border: 1px solid #17202A;
          border-radius: var(--radius-sm);
          padding: 0.8rem;
          display: flex;
          flex-direction: column;
          gap: 0.55rem;
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
          color: var(--brand-primary);
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
          font-size: 1rem;
          color: var(--dark-navy-text);
        }
        .entity-sub {
          font-size: 0.72rem;
          color: var(--text-secondary);
        }
        .doc-row {
          background: var(--white);
          border: 1px solid var(--border-light);
          padding: 0.45rem 0.65rem;
          border-radius: var(--radius-xs);
        }
        .doc-name-spec {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
          font-size: 0.92rem;
          color: var(--dark-navy-text);
        }
        .queue-buffer-section {
          background: var(--bg-surface-2);
          border: 1px solid #17202A;
          border-radius: var(--radius-sm);
          padding: 0.7rem;
          display: flex;
          flex-direction: column;
          gap: 0.45rem;
        }
        .queue-section-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .queue-title {
          font-size: 0.85rem;
          color: var(--dark-navy-text);
        }
        .queue-desc {
          font-size: 0.72rem;
          color: var(--text-secondary);
          line-height: 1.2;
        }
        .queue-tiers-list {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }
        .tier-node-card {
          display: grid;
          grid-template-columns: auto 1fr auto;
          align-items: center;
          gap: 0.75rem;
          background: var(--white);
          border: 1px solid var(--border-light);
          padding: 0.35rem 0.55rem;
          border-radius: var(--radius-xs);
          font-size: 0.72rem;
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
          padding-top: 0.1rem;
        }
        .book-btn {
          flex: 1;
          padding: 0.65rem 1rem;
        }
        @media (max-width: 640px) {
          .tier-node-card {
            grid-template-columns: auto 1fr;
            gap: 0.45rem;
          }
          .booking-confirm-body {
            gap: 0.65rem;
          }
          .primary-booking-box,
          .queue-buffer-section {
            padding: 0.65rem;
          }
        }
      `}</style>
    </Modal>
  );
};
