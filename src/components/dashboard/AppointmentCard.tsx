import React from 'react';
import { Calendar, Clock, Video, MapPin, ExternalLink, CalendarX } from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';

export interface AppointmentData {
  id: string;
  doctorName: string;
  speciality: string;
  date: string;
  time: string;
  type: 'VIDEO' | 'HOSPITAL';
  facilityName: string;
  status: 'CONFIRMED' | 'QUEUED' | 'COMPLETED' | 'CANCELLED';
  meetUrl?: string;
  tokenNumber?: string;
}

interface AppointmentCardProps {
  appointment: AppointmentData;
  onView: (app: AppointmentData) => void;
  onReschedule?: (app: AppointmentData) => void;
  onCancel?: (app: AppointmentData) => void;
  onJoinVideo?: (app: AppointmentData) => void;
}

export const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  onView,
  onReschedule,
  onCancel,
  onJoinVideo,
}) => {
  return (
    <div className="appointment-card">
      {/* Soft Pink Card Header Banner */}
      <div className="appointment-card-header">
        <div className="type-badge-group">
          {appointment.type === 'VIDEO' ? (
            <span className="type-chip video">
              <Video size={13} />
              <span>Video Call</span>
            </span>
          ) : (
            <span className="type-chip hospital">
              <MapPin size={13} />
              <span>Hospital Visit</span>
            </span>
          )}
          {appointment.tokenNumber && (
            <span className="token-chip">PIN #{appointment.tokenNumber}</span>
          )}
        </div>
        <StatusBadge status={appointment.status} size="sm" />
      </div>

      {/* Appointment Body */}
      <div className="appointment-card-body">
        <h4 className="doctor-title">{appointment.doctorName}</h4>
        <p className="speciality-text">{appointment.speciality}</p>
        <p className="facility-text">{appointment.facilityName}</p>

        <div className="date-time-box">
          <div className="dt-item">
            <Calendar size={14} className="dt-icon" />
            <span>{appointment.date}</span>
          </div>
          <div className="dt-item">
            <Clock size={14} className="dt-icon" />
            <span>{appointment.time}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons Footer */}
      <div className="appointment-card-actions">
        {appointment.type === 'VIDEO' && appointment.status === 'CONFIRMED' && (
          <button
            onClick={() => onJoinVideo?.(appointment)}
            className="btn btn-primary btn-sm join-btn"
          >
            <Video size={14} />
            <span>Join Call</span>
          </button>
        )}

        <button
          onClick={() => onView(appointment)}
          className="btn btn-secondary btn-sm"
        >
          <ExternalLink size={13} />
          <span>View</span>
        </button>

        {appointment.status !== 'CANCELLED' && appointment.status !== 'COMPLETED' && (
          <>
            {onReschedule && (
              <button
                onClick={() => onReschedule(appointment)}
                className="btn btn-outline btn-sm"
                title="Reschedule"
              >
                <span>Reschedule</span>
              </button>
            )}
            {onCancel && (
              <button
                onClick={() => onCancel(appointment)}
                className="btn btn-danger btn-sm"
                title="Cancel Appointment"
              >
                <CalendarX size={13} />
              </button>
            )}
          </>
        )}
      </div>

      <style>{`
        .appointment-card {
          width: 100%;
          background: var(--white);
          border: 1px solid #FBCFE8;
          border-radius: var(--radius-lg);
          overflow: hidden;
          box-shadow: var(--shadow-sm);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          height: 100%;
          transition: transform var(--transition-fast), box-shadow var(--transition-fast);
        }
        .appointment-card:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }
        .appointment-card-header {
          background: var(--pastel-soft-pink);
          padding: 0.75rem 1rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid #FCE1E8;
        }
        .type-badge-group {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .type-chip {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 0.72rem;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: var(--radius-full);
          text-transform: uppercase;
        }
        .type-chip.video {
          background: #DBEAFE;
          color: #1E40AF;
        }
        .type-chip.hospital {
          background: #FEF3C7;
          color: #92400E;
        }
        .token-chip {
          font-size: 0.7rem;
          font-weight: 700;
          color: var(--dark-navy-text);
          background: var(--white);
          padding: 2px 6px;
          border-radius: var(--radius-xs);
        }
        .appointment-card-body {
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
          flex: 1;
        }
        .doctor-title {
          font-size: 1.05rem;
          font-weight: 700;
          color: var(--dark-navy-text);
        }
        .speciality-text {
          font-size: 0.82rem;
          font-weight: 600;
          color: var(--brand-primary);
        }
        .facility-text {
          font-size: 0.78rem;
          color: var(--text-muted);
        }
        .date-time-box {
          margin-top: 0.5rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          background: var(--bg-surface-2);
          padding: 0.5rem 0.75rem;
          border-radius: var(--radius-sm);
        }
        .dt-item {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.78rem;
          font-weight: 600;
          color: var(--dark-navy-text);
        }
        .dt-icon {
          color: var(--brand-primary);
        }
        .appointment-card-actions {
          padding: 0.75rem 1rem;
          border-top: 1px solid var(--border-light);
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
          background: #FAFAFA;
        }
        .join-btn {
          background: #2E8B57;
          color: #FFFFFF;
        }
        .join-btn:hover {
          background: #1E7E48;
        }
      `}</style>
    </div>
  );
};
