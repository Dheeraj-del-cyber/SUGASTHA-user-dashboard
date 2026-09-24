import React, { useState } from 'react';
import {
  Clock,
  Building2,
  UserCheck,
  Calendar,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ConsultationRequest } from '../../types';

interface ConsultationHistoryProps {
  history: ConsultationRequest[];
}

export const ConsultationHistory: React.FC<ConsultationHistoryProps> = ({ history }) => {
  const { t } = useTranslation();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="history-view-container animate-fade-in">
      <div className="history-header">
        <div>
          <h3 className="section-title">{t('history.passesTitle')}</h3>
        </div>
      </div>

      {history.length === 0 ? (
        <div className="card empty-history-card">
          <Clock size={36} className="text-muted" />
          <h4>{t('history.noPasses')}</h4>
          <p className="text-secondary text-sm">
            {t('history.noPassesDesc')}
          </p>
        </div>
      ) : (
        <div className="history-cards-list">
          {history.map((item) => (
            <div key={item.id} className="card history-item-card">
              <div className="history-card-top">
                <div>
                  <span className="token-tag">PIN #{item.consultationNumber}</span>
                  <h4 className="item-id">{item.selectedHospital.name}</h4>
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
                    {item.triageLevel === 'RED'
                      ? t('history.urgent')
                      : item.triageLevel === 'YELLOW'
                      ? t('history.soon')
                      : t('history.normal')}
                  </span>
                  <span className="badge badge-green">
                    {item.status === 'CONFIRMED'
                      ? t('history.visitConfirmed')
                      : item.status === 'PENDING'
                      ? t('history.waitingHospital')
                      : item.status === 'COMPLETED'
                      ? t('history.visitCompleted')
                      : t('history.visitUpdated')}
                  </span>
                </div>
              </div>

              <div className="history-card-footer">
                <button
                  type="button"
                  onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                  className="history-more-btn"
                  aria-expanded={expandedId === item.id}
                >
                  {expandedId === item.id ? t('history.hideDetails') : t('history.more')}
                </button>
              </div>

              {expandedId === item.id && (
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

                  <span className="symptoms-hint">
                    {t('history.symptoms')}: {item.primarySymptoms.slice(0, 2).join(', ')}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

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
          gap: 0.55rem;
          padding: 0.8rem 1rem;
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
          font-size: 0.95rem;
          color: var(--dark-navy-text);
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
          border-top: 1px solid var(--border-light);
          padding-top: 0.45rem;
        }
        .history-more-btn {
          margin-left: auto;
          color: var(--brand-primary);
          font-size: 0.72rem;
          font-weight: 700;
          background: none;
          border: 0;
          padding: 0;
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
            gap: 0.6rem;
            padding: 0.65rem;
          }
          .history-card-footer {
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  );
};
