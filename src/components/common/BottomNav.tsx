import React from 'react';
import { Home, FileText, UserRound, Stethoscope, ShieldCheck } from 'lucide-react';

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
  const handleConsentAction = () => {
    onSelectTab(hasActiveConsultation ? 'tracking' : 'appointments');
  };

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
        onClick={() => onSelectTab('records')}
        className={`nav-item ${activeTab === 'records' ? 'active' : ''}`}
      >
        <FileText size={23} />
        <span>My Records</span>
      </button>

      <button
        onClick={handleConsentAction}
        className={`nav-center-action ${activeTab === 'appointments' || activeTab === 'tracking' ? 'active' : ''}`}
        aria-label={hasActiveConsultation ? 'Open active visit' : 'Open my consents'}
      >
        <span className="nav-center-icon">
          <Stethoscope size={27} />
          {hasActiveConsultation && <span className="nav-ping"></span>}
        </span>
      </button>

      <button
        onClick={() => onSelectTab('appointments')}
        className={`nav-item ${activeTab === 'appointments' || activeTab === 'tracking' ? 'active' : ''}`}
      >
        <ShieldCheck size={23} />
        <span>My Consents</span>
      </button>

      <button
        onClick={() => onSelectTab('profile')}
        className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
      >
        <UserRound size={23} />
        <span>My Profile</span>
      </button>

      <style>{`
        .bottom-nav-bar {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          height: calc(var(--bottom-nav-height) + env(safe-area-inset-bottom));
          background: rgba(255, 255, 255, 0.97);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          border-top: 1px solid rgba(226, 232, 240, 0.9);
          display: flex;
          align-items: center;
          justify-content: space-around;
          z-index: 90;
          padding: 0.15rem 0.35rem env(safe-area-inset-bottom);
          box-shadow: 0 -8px 24px rgba(23, 32, 42, 0.08);
        }
        .nav-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 5px;
          color: var(--text-muted);
          font-size: 0.66rem;
          font-weight: 600;
          padding: 7px 4px 3px;
          border-radius: var(--radius-md);
          transition: all var(--transition-fast);
          flex: 1;
          min-width: 0;
          white-space: nowrap;
        }
        .nav-item.active {
          color: #0b3b78;
        }
        .nav-item.active svg {
          stroke-width: 2.5;
        }
        .nav-item:hover {
          color: var(--brand-primary);
        }
        .nav-center-action {
          position: relative;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          width: 20%;
          height: 100%;
          padding: 0;
          color: var(--white);
          flex-shrink: 0;
        }
        .nav-center-icon {
          position: relative;
          display: grid;
          place-items: center;
          width: 64px;
          height: 64px;
          margin-top: -27px;
          border: 7px solid rgba(255, 255, 255, 0.95);
          border-radius: 50%;
          background: #0c4190;
          box-shadow: 0 8px 20px rgba(12, 65, 144, 0.28);
          transition: transform var(--transition-normal), background var(--transition-normal);
        }
        .nav-center-action.active .nav-center-icon,
        .nav-center-action:hover .nav-center-icon {
          background: var(--brand-primary);
          transform: translateY(-2px);
        }
        .nav-icon-container {
          position: relative;
        }
        .nav-ping {
          position: absolute;
          top: 0;
          right: -1px;
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
