import React from 'react';

interface QuickActionCardProps {
  title: string;
  icon: React.ReactNode;
  bgPastel: string;
  badge?: string;
  onClick: () => void;
}

export const QuickActionCard: React.FC<QuickActionCardProps> = ({
  title,
  icon,
  bgPastel,
  badge,
  onClick,
}) => {
  return (
    <button onClick={onClick} className="quick-action-card-btn">
      <div className="quick-action-icon-circle" style={{ backgroundColor: bgPastel }}>
        {icon}
      </div>
      <span className="quick-action-label">{title}</span>
      {badge && <span className="quick-action-badge">{badge}</span>}

      <style>{`
        .quick-action-card-btn {
          width: 100%;
          background: var(--white);
          border: 1px solid var(--border-light);
          border-radius: var(--radius-md);
          padding: 1rem 0.75rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.6rem;
          box-shadow: var(--shadow-sm);
          transition: all var(--transition-fast);
          position: relative;
        }
        .quick-action-card-btn:hover {
          transform: translateY(-3px);
          box-shadow: var(--shadow-md);
          border-color: var(--pastel-sky-blue);
        }
        .quick-action-icon-circle {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--dark-navy-text);
          box-shadow: inset 0 0 0 1px rgba(23, 32, 42, 0.05);
        }
        .quick-action-label {
          font-size: 0.82rem;
          font-weight: 700;
          color: var(--dark-navy-text);
          text-align: center;
          line-height: 1.2;
          white-space: nowrap;
        }
        .quick-action-badge {
          position: absolute;
          top: 6px;
          right: 6px;
          background: #DC2626;
          color: #FFFFFF;
          font-size: 0.62rem;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: var(--radius-full);
        }
      `}</style>
    </button>
  );
};
