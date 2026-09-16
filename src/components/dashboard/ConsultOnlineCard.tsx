import React from 'react';
import { Video, Phone, MessageSquare, RefreshCw, Clock } from 'lucide-react';

export interface TeleconsultOption {
  id: 'video' | 'audio' | 'chat' | 'followup';
  title: string;
  subtitle: string;
  iconType: 'video' | 'audio' | 'chat' | 'followup';
  waitTime: string;
  badge: string;
  priceTag: string;
}

interface ConsultOnlineCardProps {
  option: TeleconsultOption;
  onSelect: (option: TeleconsultOption) => void;
}

export const ConsultOnlineCard: React.FC<ConsultOnlineCardProps> = ({
  option,
  onSelect,
}) => {
  const renderIcon = () => {
    switch (option.iconType) {
      case 'video':
        return <Video size={24} />;
      case 'audio':
        return <Phone size={24} />;
      case 'chat':
        return <MessageSquare size={24} />;
      case 'followup':
        return <RefreshCw size={24} />;
      default:
        return <Video size={24} />;
    }
  };

  return (
    <div className="consult-online-card">
      <div className="consult-card-top">
        <div className="consult-icon-pill">{renderIcon()}</div>
        <span className="consult-price-badge">{option.priceTag}</span>
      </div>

      <div className="consult-card-body">
        <h4 className="consult-title">{option.title}</h4>
        <p className="consult-subtitle">{option.subtitle}</p>

        <div className="wait-time-row">
          <Clock size={13} className="wait-icon" />
          <span>{option.waitTime}</span>
        </div>
      </div>

      <button
        onClick={() => onSelect(option)}
        className="btn btn-primary btn-sm start-consult-btn"
      >
        <span>Start Consultation</span>
      </button>

      <style>{`
        .consult-online-card {
          width: 100%;
          background: var(--pastel-sky-blue);
          border: 1px solid #93C5FD;
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
        .consult-online-card:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }
        .consult-card-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .consult-icon-pill {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: var(--white);
          color: var(--brand-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(2, 132, 199, 0.15);
        }
        .consult-price-badge {
          background: var(--white);
          color: #2E8B57;
          font-size: 0.72rem;
          font-weight: 800;
          padding: 3px 8px;
          border-radius: var(--radius-full);
          border: 1px solid #A5D6A7;
        }
        .consult-card-body {
          display: flex;
          flex-direction: column;
          gap: 0.3rem;
          flex: 1;
        }
        .consult-title {
          font-size: 1.05rem;
          font-weight: 700;
          color: var(--dark-navy-text);
        }
        .consult-subtitle {
          font-size: 0.78rem;
          color: var(--text-secondary);
        }
        .wait-time-row {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--brand-primary);
          margin-top: 0.25rem;
        }
        .wait-icon {
          color: var(--brand-primary);
        }
        .start-consult-btn {
          width: 100%;
        }
      `}</style>
    </div>
  );
};
