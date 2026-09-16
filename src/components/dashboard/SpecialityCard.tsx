import React from 'react';
import { ArrowRight } from 'lucide-react';

export interface SpecialityItem {
  id: string;
  name: string;
  icon: React.ReactNode;
  doctorCount: number;
  description: string;
}

interface SpecialityCardProps {
  speciality: SpecialityItem;
  onClick: (spec: SpecialityItem) => void;
}

export const SpecialityCard: React.FC<SpecialityCardProps> = ({
  speciality,
  onClick,
}) => {
  return (
    <button
      onClick={() => onClick(speciality)}
      className="speciality-card-btn"
    >
      <div className="speciality-icon-circle">
        {speciality.icon}
      </div>

      <div className="speciality-info">
        <h4 className="speciality-name">{speciality.name}</h4>
        <p className="speciality-count">{speciality.doctorCount} Doctors Available</p>
      </div>

      <div className="speciality-arrow">
        <ArrowRight size={14} />
      </div>

      <style>{`
        .speciality-card-btn {
          width: 100%;
          background: var(--pastel-cream-yellow);
          border: 1px solid #FDE68A;
          border-radius: var(--radius-lg);
          padding: 1rem;
          display: flex;
          align-items: center;
          gap: 0.85rem;
          text-align: left;
          box-shadow: var(--shadow-sm);
          transition: transform var(--transition-fast), box-shadow var(--transition-fast), background var(--transition-fast);
          height: 100%;
        }
        .speciality-card-btn:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
          background: var(--pastel-soft-yellow);
        }
        .speciality-icon-circle {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: var(--white);
          color: #B45309;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 2px 6px rgba(180, 83, 9, 0.1);
        }
        .speciality-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
          flex: 1;
        }
        .speciality-name {
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--dark-navy-text);
        }
        .speciality-count {
          font-size: 0.75rem;
          color: #B45309;
          font-weight: 600;
        }
        .speciality-arrow {
          color: #B45309;
          opacity: 0.7;
          transition: transform var(--transition-fast);
        }
        .speciality-card-btn:hover .speciality-arrow {
          transform: translateX(3px);
          opacity: 1;
        }
      `}</style>
    </button>
  );
};
