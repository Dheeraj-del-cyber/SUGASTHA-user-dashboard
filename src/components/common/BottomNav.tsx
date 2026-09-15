import React from 'react';
import { LayoutDashboard, Stethoscope, Clock, FileText } from 'lucide-react';

export type ActiveTab = 'dashboard' | 'triage' | 'tracking' | 'records';

interface BottomNavProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  hasActiveConsultation: boolean;
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
        <LayoutDashboard size={20} />
        <span>Home</span>
      </button>

      <button
        onClick={() => onSelectTab('triage')}
        className={`nav-item ${activeTab === 'triage' ? 'active' : ''}`}
      >
        <Stethoscope size={20} />
        <span>AI Triage</span>
      </button>

      <button
        onClick={() => onSelectTab('tracking')}
        className={`nav-item ${activeTab === 'tracking' ? 'active' : ''}`}
      >
        <div className="nav-icon-container">
          <Clock size={20} />
          {hasActiveConsultation && <span className="nav-ping"></span>}
        </div>
        <span>Tracking</span>
      </button>

      <button
        onClick={() => onSelectTab('records')}
        className={`nav-item ${activeTab === 'records' ? 'active' : ''}`}
      >
        <FileText size={20} />
        <span>ABHA Records</span>
      </button>

      <style>{`
        .bottom-nav-bar {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          height: var(--bottom-nav-height);
          background: rgba(15, 23, 42, 0.94);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-top: 1px solid var(--border-subtle);
          display: flex;
          align-items: center;
          justify-content: space-around;
          z-index: 90;
          padding: 0 0.5rem;
        }
        .nav-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4px;
          color: var(--text-muted);
          font-size: 0.72rem;
          font-weight: 500;
          padding: 6px 12px;
          border-radius: var(--radius-sm);
          transition: all var(--transition-fast);
          flex: 1;
        }
        .nav-item.active {
          color: var(--brand-accent);
        }
        .nav-item:hover {
          color: var(--text-primary);
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
          background: #10b981;
          box-shadow: 0 0 6px #10b981;
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
