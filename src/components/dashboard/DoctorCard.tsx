import React from 'react';
import { Star, Award, Clock, Languages, CalendarCheck } from 'lucide-react';
import { Doctor } from '../../types';

interface DoctorCardProps {
  doctor: Doctor;
  hospitalName?: string;
  onBook: (doctor: Doctor) => void;
}

export const DoctorCard: React.FC<DoctorCardProps> = ({
  doctor,
  hospitalName,
  onBook,
}) => {
  // Generate avatar initials or clean background avatar initials
  const initials = doctor.name
    .replace('Dr.', '')
    .trim()
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2);

  return (
    <div className="doctor-card">
      <div className="doctor-card-top">
        <div className="avatar-wrapper">
          <div className="avatar-circle">{initials}</div>
          <span className="verify-dot" title="Verified Doctor">✓</span>
        </div>

        <div className="doctor-basic-info">
          <div className="rating-badge">
            <Star size={12} fill="#F59E0B" color="#F59E0B" />
            <span>{doctor.rating}</span>
          </div>
          <h4 className="doctor-name">{doctor.name}</h4>
          <span className="doctor-spec">{doctor.specialization}</span>
          {hospitalName && <span className="doctor-hosp">{hospitalName}</span>}
        </div>
      </div>

      <div className="doctor-meta-grid">
        <div className="meta-chip">
          <Award size={13} className="meta-icon" />
          <span>{doctor.experienceYears} yrs exp</span>
        </div>
        <div className="meta-chip">
          <Clock size={13} className="meta-icon" />
          <span>{doctor.availableSlotToday}</span>
        </div>
        {doctor.languages && doctor.languages.length > 0 && (
          <div className="meta-chip full-width-chip">
            <Languages size={13} className="meta-icon" />
            <span>{doctor.languages.join(', ')}</span>
          </div>
        )}
      </div>

      <button
        onClick={() => onBook(doctor)}
        className="btn btn-primary btn-sm book-doc-btn"
      >
        <CalendarCheck size={14} />
        <span>Book Appointment</span>
      </button>

      <style>{`
        .doctor-card {
          width: 100%;
          background: var(--white);
          border: 1px solid var(--border-light);
          border-radius: var(--radius-lg);
          padding: 1.1rem;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          gap: 0.85rem;
          box-shadow: var(--shadow-sm);
          height: 100%;
          transition: transform var(--transition-fast), box-shadow var(--transition-fast);
        }
        .doctor-card:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
          border-color: var(--pastel-sky-blue);
        }
        .doctor-card-top {
          display: flex;
          align-items: flex-start;
          gap: 0.85rem;
        }
        .avatar-wrapper {
          position: relative;
        }
        .avatar-circle {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          background: var(--pastel-sky-blue);
          color: var(--brand-primary);
          font-family: var(--font-display);
          font-size: 1.1rem;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid var(--pastel-light-blue);
        }
        .verify-dot {
          position: absolute;
          bottom: 0;
          right: 0;
          background: #2E8B57;
          color: #FFFFFF;
          font-size: 0.6rem;
          font-weight: 800;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid var(--white);
        }
        .doctor-basic-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
          flex: 1;
        }
        .rating-badge {
          display: inline-flex;
          align-items: center;
          gap: 3px;
          background: #FEF3C7;
          color: #B45309;
          padding: 2px 6px;
          border-radius: var(--radius-full);
          font-size: 0.72rem;
          font-weight: 700;
          width: fit-content;
        }
        .doctor-name {
          font-size: 1rem;
          font-weight: 700;
          color: var(--dark-navy-text);
          line-height: 1.2;
        }
        .doctor-spec {
          font-size: 0.78rem;
          font-weight: 600;
          color: var(--brand-primary);
        }
        .doctor-hosp {
          font-size: 0.72rem;
          color: var(--text-muted);
        }
        .doctor-meta-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 0.4rem;
        }
        .meta-chip {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: var(--pastel-light-blue);
          color: var(--dark-navy-text);
          padding: 4px 8px;
          border-radius: var(--radius-sm);
          font-size: 0.72rem;
          font-weight: 600;
        }
        .full-width-chip {
          width: 100%;
        }
        .meta-icon {
          color: var(--brand-primary);
        }
        .book-doc-btn {
          width: 100%;
          margin-top: 0.25rem;
        }
      `}</style>
    </div>
  );
};
