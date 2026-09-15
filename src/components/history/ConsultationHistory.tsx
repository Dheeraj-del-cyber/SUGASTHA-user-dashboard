import React, { useState } from 'react';
import {
  Clock,
  QrCode,
  Building2,
  UserCheck,
  Calendar,
} from 'lucide-react';
import { ConsultationRequest } from '../../types';
import { Modal } from '../common/Modal';
import { QrCodeDisplay } from '../consultation/QrCodeDisplay';

interface ConsultationHistoryProps {
  history: ConsultationRequest[];
}

export const ConsultationHistory: React.FC<ConsultationHistoryProps> = ({ history }) => {
  const [selectedPass, setSelectedPass] = useState<ConsultationRequest | null>(null);

  return (
    <div className="history-view-container animate-fade-in">
      <div className="history-header">
        <div>
          <h3 className="section-title">Consultation & Verification Pass History</h3>
          <p className="section-subtitle">
            All your generated consultation tokens and scannable QR passes are permanently archived here for hospital desk verification.
          </p>
        </div>
      </div>

      {history.length === 0 ? (
        <div className="card empty-history-card">
          <Clock size={36} className="text-muted" />
          <h4>No Consultation History Yet</h4>
          <p className="text-secondary text-sm">
            When you complete a symptom evaluation and book a consultation, your records and passes will appear here.
          </p>
        </div>
      ) : (
        <div className="history-cards-list">
          {history.map((item) => (
            <div key={item.id} className="card history-item-card">
              <div className="history-card-top">
                <div>
                  <span className="token-tag">TOKEN #{item.consultationNumber}</span>
                  <h4 className="item-id font-mono">{item.id}</h4>
                </div>

                <div className="history-top-badges">
                  <span
                    className={`badge ${
                      item.triageLevel === 'RED'
                        ? 'badge-red'
                        : item.triageLevel === 'YELLOW'
                        ? 'badge-yellow'
                        : 'badge-green'
                    }`}
                  >
                    {item.triageLevel} Triage
                  </span>
                  <span className="badge badge-green">{item.status}</span>
                </div>
              </div>

              <div className="history-details-grid">
                <div className="history-detail-item">
                  <Building2 size={15} className="text-teal" />
                  <div>
                    <strong>{item.selectedHospital.name}</strong>
                    <span className="text-xs text-muted block">
                      {item.selectedHospital.address}
                    </span>
                  </div>
                </div>

                <div className="history-detail-item">
                  <UserCheck size={15} className="text-emerald" />
                  <div>
                    <strong>{item.selectedDoctor.name}</strong>
                    <span className="text-xs text-muted block">
                      {item.selectedDoctor.specialization}
                    </span>
                  </div>
                </div>

                <div className="history-detail-item">
                  <Calendar size={15} className="text-muted" />
                  <span className="text-sm">
                    {new Date(item.createdAt).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </div>

              {/* QR Verification Action */}
              <div className="history-card-footer">
                <span className="symptoms-hint">
                  Symptoms: {item.primarySymptoms.slice(0, 2).join(', ')}
                </span>

                <button
                  onClick={() => setSelectedPass(item)}
                  className="btn btn-secondary btn-sm"
                >
                  <QrCode size={14} className="text-teal" />
                  <span>Show QR Pass & Token</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View Pass Modal */}
      <Modal
        isOpen={!!selectedPass}
        onClose={() => setSelectedPass(null)}
        title="Archived Consultation Pass"
        subtitle="Verification Token for Hospital Check-in"
        maxWidth="440px"
      >
        {selectedPass && <QrCodeDisplay consultation={selectedPass} size={200} />}
      </Modal>

      <style>{`
        .history-view-container {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        .history-cards-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .history-item-card {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          border-left: 3px solid var(--brand-primary);
        }
        .history-card-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        .token-tag {
          font-size: 0.72rem;
          font-weight: 700;
          color: var(--brand-accent);
          letter-spacing: 0.05em;
        }
        .item-id {
          font-size: 1.15rem;
          color: #ffffff;
        }
        .history-top-badges {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .history-details-grid {
          display: grid;
          grid-template-columns: 1fr 1fr auto;
          gap: 1rem;
          background: var(--bg-surface-2);
          padding: 0.85rem 1rem;
          border-radius: var(--radius-sm);
        }
        .history-detail-item {
          display: flex;
          align-items: flex-start;
          gap: 0.6rem;
        }
        .history-card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-top: 1px solid var(--border-subtle);
          padding-top: 0.75rem;
        }
        .symptoms-hint {
          font-size: 0.78rem;
          color: var(--text-muted);
        }
        .empty-history-card {
          text-align: center;
          padding: 3rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
        }
        @media (max-width: 768px) {
          .history-details-grid {
            grid-template-columns: 1fr;
          }
          .history-card-footer {
            flex-direction: column;
            gap: 0.6rem;
            align-items: flex-start;
          }
          .history-card-footer button {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};
