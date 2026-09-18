import React from 'react';
import { Building2, Calendar, Clock, UserCheck } from 'lucide-react';
import { ConsultationRequest } from '../../types';

interface DoctorHistoryProps {
  history: ConsultationRequest[];
}

export const DoctorHistory: React.FC<DoctorHistoryProps> = ({ history }) => {
  return (
    <div className="doctor-history-view animate-fade-in">
      <div className="doctor-history-header">
        <div>
          <h3 className="section-title">Doctor History</h3>
          <p className="text-secondary text-sm">Your previous doctor consultations.</p>
        </div>
      </div>

      {history.length === 0 ? (
        <div className="card empty-doctor-history-card">
          <UserCheck size={36} className="text-muted" />
          <h4>No doctor history yet</h4>
          <p className="text-secondary text-sm">
            Your booked doctor consultations will appear here.
          </p>
        </div>
      ) : (
        <div className="doctor-history-list">
          {history.map((item) => (
            <div key={item.id} className="card doctor-history-card">
              <div className="doctor-history-card-top">
                <div className="doctor-history-identity">
                  <div className="doctor-history-icon">
                    <UserCheck size={18} />
                  </div>
                  <div>
                    <h4>{item.selectedDoctor.name}</h4>
                    <span>{item.selectedDoctor.specialization}</span>
                  </div>
                </div>
                <span className="doctor-history-status">
                  {item.status === 'COMPLETED' ? 'Completed' : 'Consultation'}
                </span>
              </div>

              <div className="doctor-history-details">
                <span>
                  <Building2 size={14} />
                  {item.selectedHospital.name}
                </span>
                <span>
                  <Calendar size={14} />
                  {new Date(item.createdAt).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
                {item.appointmentSlot && (
                  <span>
                    <Clock size={14} />
                    {item.appointmentSlot}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        .doctor-history-view {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        .doctor-history-header {
          display: flex;
          justify-content: space-between;
        }
        .doctor-history-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .doctor-history-card {
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
          padding: 1rem;
          border-left: 3px solid var(--brand-primary);
        }
        .doctor-history-card-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 0.75rem;
        }
        .doctor-history-identity {
          display: flex;
          align-items: center;
          gap: 0.7rem;
          min-width: 0;
        }
        .doctor-history-icon {
          width: 36px;
          height: 36px;
          display: grid;
          place-items: center;
          flex-shrink: 0;
          color: var(--brand-primary);
          background: var(--pastel-light-blue);
          border-radius: var(--radius-sm);
        }
        .doctor-history-identity h4 {
          color: var(--dark-navy-text);
          font-size: 0.95rem;
        }
        .doctor-history-identity span {
          display: block;
          margin-top: 2px;
          color: var(--text-secondary);
          font-size: 0.78rem;
        }
        .doctor-history-status {
          flex-shrink: 0;
          color: var(--pastel-green-accent);
          background: var(--pastel-green-bg);
          border: 1px solid #B7DEC2;
          border-radius: var(--radius-xs);
          padding: 0.25rem 0.5rem;
          font-size: 0.7rem;
          font-weight: 700;
        }
        .doctor-history-details {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem 1rem;
          padding-top: 0.7rem;
          border-top: 1px solid var(--border-light);
          color: var(--text-muted);
          font-size: 0.75rem;
        }
        .doctor-history-details span {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
        }
        .empty-doctor-history-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
          padding: 3rem;
          text-align: center;
        }
        @media (max-width: 480px) {
          .doctor-history-card-top {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};
