import React from 'react';

export type StatusVariant =
  | 'CONFIRMED'
  | 'AVAILABLE'
  | 'LIMITED'
  | 'HIGH_DEMAND'
  | 'QUEUED'
  | 'PENDING'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NORMAL'
  | 'MODERATE'
  | 'BUSY'
  | 'GREEN'
  | 'YELLOW'
  | 'RED';

interface StatusBadgeProps {
  status: StatusVariant | string;
  label?: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  size = 'md',
}) => {
  const normStatus = (status || '').toUpperCase();

  let bg = '#E8F5E9';
  let color = '#2E8B57';
  let border = '#A5D6A7';
  let dotColor = '#2E8B57';

  if (['CONFIRMED', 'AVAILABLE', 'GREEN', 'NORMAL', 'COMPLETED'].includes(normStatus)) {
    bg = '#E8F5E9';
    color = '#2E8B57';
    border = '#A5D6A7';
    dotColor = '#2E8B57';
  } else if (['LIMITED', 'MODERATE', 'QUEUED', 'PENDING', 'YELLOW'].includes(normStatus)) {
    bg = '#FFF3C7';
    color = '#B45309';
    border = '#FDE68A';
    dotColor = '#D97706';
  } else if (['HIGH_DEMAND', 'BUSY', 'RED', 'CANCELLED'].includes(normStatus)) {
    bg = '#FCE1E8';
    color = '#991B1B';
    border = '#FCA5A5';
    dotColor = '#DC2626';
  }

  const textLabel = label || status.replace(/_/g, ' ');

  return (
    <span
      className={`status-badge-pill ${size}`}
      style={{
        backgroundColor: bg,
        color: color,
        border: `1px solid ${border}`,
      }}
    >
      <span className="status-dot" style={{ backgroundColor: dotColor }}></span>
      <span>{textLabel}</span>

      <style>{`
        .status-badge-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          border-radius: 9999px;
          font-weight: 600;
          letter-spacing: 0.02em;
          white-space: nowrap;
          text-transform: capitalize;
        }
        .status-badge-pill.sm {
          padding: 2px 8px;
          font-size: 0.72rem;
        }
        .status-badge-pill.md {
          padding: 4px 10px;
          font-size: 0.78rem;
        }
        .status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          flex-shrink: 0;
        }
      `}</style>
    </span>
  );
};
