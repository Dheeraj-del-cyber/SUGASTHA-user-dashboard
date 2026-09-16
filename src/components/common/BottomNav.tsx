import React from 'react';
import { Home, Calendar, Users, FileText, User } from 'lucide-react';

export type ActiveTab = 'dashboard' | 'appointments' | 'doctors' | 'records' | 'profile' | 'triage' | 'tracking';

interface BottomNavProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  hasActiveConsultation?: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onSelectTab,
  hasActiveConsultation,
}) => {
  return (
    <nav className="bottom-nav-bar">
      <button
        onClick={() => onSelectTab('dashboard')}
        className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
      >
        <Home size={20} />
        <span>Home</span>
      </button>

      <button
        onClick={() => onSelectTab('appointments')}
        className={`nav-item ${activeTab === 'appointments' || activeTab === 'tracking' ? 'active' : ''}`}
      >
        <div className="nav-icon-container">
          <Calendar size={20} />
          {hasActiveConsultation && <span className="nav-ping"></span>}
        </div>
        <span>Appointments</span>
      </button>

      <button
        onClick={() => onSelectTab('doctors')}
        className={`nav-item ${activeTab === 'doctors' || activeTab === 'triage' ? 'active' : ''}`}
      >
        <Users size={20} />
        <span>Doctors</span>
      </button>

      <button
        onClick={() => onSelectTab('records')}
        className={`nav-item ${activeTab === 'records' ? 'active' : ''}`}
      >
        <FileText size={20} />
        <span>Records</span>
      </button>

      <button
        onClick={() => onSelectTab('profile')}
        className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
      >
        <User size={20} />
        <span>Profile</span>
      </button>

      <style>{`
        .bottom-nav-bar {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          height: var(--bottom-nav-height);
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-top: 1px solid var(--border-light);
          display: flex;
          align-items: center;
          justify-content: space-around;
          z-index: 90;
          padding: 0 0.25rem;
          box-shadow: 0 -4px 16px rgba(23, 32, 42, 0.05);
        }
        .nav-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 3px;
          color: var(--text-muted);
          font-size: 0.7rem;
          font-weight: 600;
          padding: 6px 8px;
          border-radius: var(--radius-sm);
          transition: all var(--transition-fast);
          flex: 1;
        }
        .nav-item.active {
          color: var(--brand-primary);
        }
        .nav-item.active svg {
          transform: translateY(-1px);
        }
        .nav-item:hover {
          color: var(--dark-navy-text);
        }
        .nav-icon-container {
          position: relative;
        }
        .nav-ping {
          position: absolute;
          top: -2px;
          right: -4px;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #2E8B57;
          box-shadow: 0 0 6px #2E8B57;
        }
        @media (min-width: 769px) {
          .bottom-nav-bar {
            display: none;
          }
        }
      `}</style>
    </nav>
  );
};
