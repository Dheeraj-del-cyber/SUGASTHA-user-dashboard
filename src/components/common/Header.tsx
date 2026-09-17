import React, { useState } from 'react';
import { ShieldCheck, User, LogOut, Bell, CheckCircle2, Home, FileText, Ticket } from 'lucide-react';
import { AbhaProfile, ConsultationRequest } from '../../types';
import { ActiveTab } from './BottomNav';

interface HeaderProps {
  profile: AbhaProfile | null;
  activeConsultation: ConsultationRequest | null;
  onOpenLogin: () => void;
  onLogout: () => void;
  onOpenProfile?: () => void;
  onGoHome?: () => void;
  activeTab?: ActiveTab;
  activeSubView?: 'DASHBOARD' | 'SYMPTOMS' | 'TRIAGE_RESULT' | 'RECOMMENDATION' | 'TRACKER' | 'RECORDS' | 'HISTORY';
  onSelectTab?: (tab: ActiveTab) => void;
  recordsCount?: number;
  historyCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  profile,
  activeConsultation,
  onOpenLogin,
  onLogout,
  onOpenProfile,
  onGoHome,
  activeTab,
  activeSubView,
  onSelectTab,
  recordsCount,
  historyCount,
}) => {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(2);

  const notifications = [
    {
      id: 'notif-1',
      title: 'ABHA Health Card Active',
      time: '10 mins ago',
      desc: 'Your health records are synced with ABDM registry.',
      type: 'ABHA',
    },
    {
      id: 'notif-2',
      title: 'Queue Priority Updated',
      time: '1 hour ago',
      desc: 'AIIMS Emergency desk has 3 patients ahead in queue.',
      type: 'QUEUE',
    },
  ];

  return (
    <header className="swasthya-header">
      <div className="container header-container">
        {/* Brand Logo & Title */}
        <div className="brand-group" onClick={onGoHome ?? (() => onSelectTab?.('dashboard'))}>
          <div className="brand-icon-wrapper">
            <img src="/images/logo.png" alt="SUGASTHA logo" className="brand-logo-image" />
          </div>
          <div className="brand-text">
            <div className="brand-title-row">
              <span className="brand-name">SUGASTHA</span>
            </div>
          </div>
        </div>

        {/* Desktop Navigation Links (Visible on Desktop / Tablet >= 769px) */}
        <nav className="desktop-nav-menu" aria-label="Main Navigation">
          <button
            onClick={() => onSelectTab?.('dashboard')}
            className={`desktop-nav-item ${
              activeTab === 'dashboard' || activeSubView === 'DASHBOARD' ? 'active' : ''
            }`}
          >
            <Home size={17} className="desktop-nav-icon" />
            <span>Home</span>
          </button>

          <button
            onClick={() => onSelectTab?.('records')}
            className={`desktop-nav-item ${
              activeTab === 'records' || activeSubView === 'RECORDS' ? 'active' : ''
            }`}
          >
            <FileText size={17} className="desktop-nav-icon" />
            <span>Records</span>
            {typeof recordsCount === 'number' && recordsCount > 0 && (
              <span className="desktop-nav-count">{recordsCount}</span>
            )}
          </button>

          <button
            onClick={() => onSelectTab?.('tracking')}
            className={`desktop-nav-item ${
              activeTab === 'tracking' ||
              activeTab === 'appointments' ||
              activeSubView === 'TRACKER' ||
              activeSubView === 'HISTORY'
                ? 'active'
                : ''
            }`}
          >
            <Ticket size={17} className="desktop-nav-icon" />
            <span>Hospital Passes</span>
            {activeConsultation ? (
              <span className="desktop-nav-active-dot" title="Active Visit Token Live" />
            ) : typeof historyCount === 'number' && historyCount > 0 ? (
              <span className="desktop-nav-count">{historyCount}</span>
            ) : null}
          </button>
        </nav>

        {/* Action Controls & Patient Status */}
        <div className="header-actions">
          {/* Notifications Dropdown */}
          <div className="notification-wrapper">
            <button
              onClick={() => {
                setIsNotificationsOpen(!isNotificationsOpen);
                setUnreadCount(0);
              }}
              className="btn-icon-head"
              title="Notifications"
            >
              <Bell size={18} />
              {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
            </button>

            {isNotificationsOpen && (
              <div className="notifications-popover">
                <div className="popover-header">
                  <h4>Notifications</h4>
                  <span className="popover-count">2 New</span>
                </div>
                <div className="popover-body">
                  {notifications.map((n) => (
                    <div key={n.id} className="notif-item">
                      <CheckCircle2 size={16} className="notif-icon text-green" />
                      <div className="notif-content">
                        <span className="notif-title">{n.title}</span>
                        <p className="notif-desc">{n.desc}</p>
                        <span className="notif-time">{n.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Profile & ABHA Connected Status */}
          {profile ? (
            <div className="user-profile-chip">
              <div
                className="profile-info-trigger"
                onClick={onOpenProfile}
                title="View ABHA Profile"
              >
                <div className="avatar-mini">
                  {profile.fullName.substring(0, 1)}
                </div>
                <div className="profile-text-group">
                  <div className="name-status-row">
                    <span className="user-name-text">{profile.fullName.split(' ')[0]}</span>
                    <span className="abha-status-badge">
                      <ShieldCheck size={12} className="text-green" />
                      <span>ABHA Connected</span>
                    </span>
                  </div>
                  <span className="abha-number-text">{profile.abhaNumber}</span>
                </div>
              </div>

              <button
                onClick={onLogout}
                className="btn-icon-head logout-btn"
                title="Log Out"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button onClick={onOpenLogin} className="btn btn-primary btn-sm">
              <User size={16} />
              <span>Log in ABHA</span>
            </button>
          )}
        </div>
      </div>

      <style>{`
        .swasthya-header {
          position: sticky;
          top: 0;
          z-index: 100;
          background: rgba(255, 255, 255, 0.92);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-bottom: 1px solid var(--border-light);
          min-height: var(--header-height);
          height: auto;
          padding: 0.5rem 0;
          display: flex;
          align-items: center;
          box-shadow: 0 2px 12px rgba(23, 32, 42, 0.03);
        }
        .header-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          gap: 0.75rem;
        }
        .brand-group {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          cursor: pointer;
        }
        .brand-icon-wrapper {
          width: 42px;
          height: 42px;
          border-radius: var(--radius-sm);
          background: var(--white);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(14, 165, 233, 0.15);
        }
        .brand-logo-image {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
        .brand-text {
          display: flex;
          flex-direction: column;
        }
        .brand-title-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .brand-name {
          font-family: var(--font-display);
          font-weight: 800;
          font-size: 1.35rem;
          letter-spacing: -0.02em;
          color: var(--brand-primary);
        }
        .brand-badge-gov {
          background: var(--pastel-cream-yellow);
          border: 1px solid #FDE68A;
          color: #B45309;
          font-size: 0.6rem;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: var(--radius-xs);
          letter-spacing: 0.04em;
        }
        .brand-tagline {
          font-size: 0.73rem;
          color: var(--text-muted);
        }
        .header-actions {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          flex-shrink: 0;
        }
        .active-token-chip {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 0.35rem 0.75rem;
          border-radius: var(--radius-full);
          font-size: 0.78rem;
          background: var(--pastel-light-blue);
          border: 1px solid var(--pastel-sky-blue);
          color: var(--dark-navy-text);
          cursor: pointer;
        }
        .status-ping {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #2E8B57;
          box-shadow: 0 0 6px #2E8B57;
          animation: pulseGlow 1.5s infinite;
        }
        .token-num {
          color: var(--brand-primary);
        }
        .notification-wrapper {
          position: relative;
        }
        .btn-icon-head {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: var(--bg-app);
          border: 1px solid var(--border-light);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--dark-navy-text);
          position: relative;
          transition: all var(--transition-fast);
        }
        .btn-icon-head:hover {
          background: var(--pastel-light-blue);
          color: var(--brand-primary);
        }
        .notif-badge {
          position: absolute;
          top: -2px;
          right: -2px;
          background: #DC2626;
          color: var(--white);
          font-size: 0.6rem;
          font-weight: 800;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .notifications-popover {
          position: absolute;
          top: 44px;
          right: 0;
          width: 300px;
          background: var(--white);
          border: 1px solid var(--border-light);
          border-radius: var(--radius-md);
          box-shadow: var(--shadow-lg);
          padding: 0.85rem;
          z-index: 120;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .popover-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid var(--border-light);
          padding-bottom: 0.5rem;
        }
        .popover-header h4 {
          font-size: 0.9rem;
        }
        .popover-count {
          font-size: 0.7rem;
          font-weight: 700;
          color: var(--brand-primary);
          background: var(--pastel-light-blue);
          padding: 2px 6px;
          border-radius: var(--radius-full);
        }
        .popover-body {
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
        }
        .notif-item {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          font-size: 0.78rem;
          padding: 6px;
          border-radius: var(--radius-xs);
          background: var(--bg-surface-2);
        }
        .notif-icon {
          color: #2E8B57;
          margin-top: 2px;
          flex-shrink: 0;
        }
        .notif-title {
          font-weight: 700;
          color: var(--dark-navy-text);
          display: block;
        }
        .notif-desc {
          font-size: 0.72rem;
          color: var(--text-muted);
        }
        .notif-time {
          font-size: 0.65rem;
          color: var(--text-subtle);
        }
        .user-profile-chip {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: var(--pastel-light-blue);
          border: 1px solid var(--pastel-sky-blue);
          padding: 4px 8px;
          border-radius: var(--radius-full);
        }
        .profile-info-trigger {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
        }
        .avatar-mini {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: var(--brand-primary);
          color: var(--white);
          font-family: var(--font-display);
          font-weight: 800;
          font-size: 0.9rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .profile-text-group {
          display: flex;
          flex-direction: column;
          line-height: 1.1;
        }
        .name-status-row {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .user-name-text {
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--dark-navy-text);
        }
        .abha-status-badge {
          display: inline-flex;
          align-items: center;
          gap: 2px;
          font-size: 0.65rem;
          font-weight: 700;
          color: #2E8B57;
          background: #E8F5E9;
          padding: 1px 5px;
          border-radius: var(--radius-full);
        }
        .text-green {
          color: #2E8B57;
        }
        .abha-number-text {
          font-size: 0.68rem;
          color: var(--text-muted);
        }
        .logout-btn:hover {
          color: #DC2626;
          background: #FEE2E2;
        }

        /* Desktop Navigation Links Styling */
        .desktop-nav-menu {
          display: none;
        }

        @media (min-width: 769px) {
          .desktop-nav-menu {
            display: flex;
            align-items: center;
            gap: 0.35rem;
            background: rgba(241, 245, 249, 0.75);
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            padding: 4px 6px;
            border-radius: var(--radius-full);
            border: 1px solid rgba(226, 232, 240, 0.8);
            box-shadow: inset 0 1px 2px rgba(15, 23, 42, 0.03);
          }
          .desktop-nav-item {
            display: inline-flex;
            align-items: center;
            gap: 0.45rem;
            padding: 0.45rem 0.9rem;
            border-radius: var(--radius-full);
            font-size: 0.84rem;
            font-weight: 600;
            color: var(--text-secondary);
            transition: all 0.2s ease;
            position: relative;
            border: none;
            outline: none;
            cursor: pointer;
            white-space: nowrap;
          }
          .desktop-nav-icon {
            color: var(--text-muted);
            transition: color 0.2s ease, transform 0.2s ease;
          }
          .desktop-nav-item:hover {
            color: var(--brand-primary);
            background: rgba(255, 255, 255, 0.9);
            box-shadow: 0 2px 6px rgba(2, 132, 199, 0.08);
          }
          .desktop-nav-item:hover .desktop-nav-icon {
            color: var(--brand-primary);
            transform: translateY(-1px);
          }
          .desktop-nav-item.active {
            color: var(--brand-primary);
            background: var(--white);
            font-weight: 700;
            box-shadow: 0 2px 10px rgba(2, 132, 199, 0.16), 0 0 0 1px var(--pastel-sky-blue);
          }
          .desktop-nav-item.active .desktop-nav-icon {
            color: var(--brand-primary);
            stroke-width: 2.3;
          }
          .desktop-nav-count {
            font-size: 0.68rem;
            font-weight: 700;
            background: var(--pastel-sky-blue);
            color: var(--brand-primary-hover);
            padding: 1px 6px;
            border-radius: var(--radius-full);
            line-height: 1;
          }
          .desktop-nav-item.active .desktop-nav-count {
            background: var(--brand-primary);
            color: var(--white);
          }
          .nav-badge-pulse {
            font-size: 0.62rem;
            font-weight: 800;
            letter-spacing: 0.03em;
            background: linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%);
            color: var(--white);
            padding: 2px 6px;
            border-radius: var(--radius-full);
            line-height: 1;
            box-shadow: 0 2px 6px rgba(14, 165, 233, 0.3);
          }
          .desktop-nav-active-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #10B981;
            box-shadow: 0 0 8px #10B981;
            animation: pulseGlow 1.5s infinite;
          }
        }

        @media (min-width: 769px) and (max-width: 1100px) {
          .brand-tagline,
          .brand-badge-gov,
          .abha-number-text {
            display: none;
          }
          .header-actions {
            gap: 0.45rem;
          }
          .user-profile-chip {
            padding: 3px 6px;
          }
          .desktop-nav-item {
            padding: 0.4rem 0.7rem;
            font-size: 0.8rem;
            gap: 0.35rem;
          }
        }
        @media (min-width: 1200px) {
          .swasthya-header {
            padding: 0.65rem 0;
          }
          .header-container {
            gap: 1.5rem;
          }
          .brand-group {
            gap: 0.9rem;
          }
          .brand-icon-wrapper {
            width: 46px;
            height: 46px;
          }
          .brand-name {
            font-size: 1.45rem;
          }
          .header-actions {
            gap: 0.75rem;
          }
          .desktop-nav-menu {
            gap: 0.45rem;
            padding: 5px 8px;
          }
          .desktop-nav-item {
            padding: 0.5rem 1.15rem;
            font-size: 0.88rem;
          }
        }
        @media (max-width: 768px) {
          .brand-group {
            min-width: 0;
          }
          .brand-icon-wrapper {
            width: 36px;
            height: 36px;
          }
          .brand-name {
            font-size: 1.05rem;
          }
          .brand-tagline, .brand-badge-gov {
            display: none;
          }
          .abha-number-text {
            display: none;
          }
          .user-profile-chip {
            padding: 3px;
            background: transparent;
            border: 0;
          }
          .profile-text-group {
            display: none;
          }
          .logout-btn {
            display: flex;
            width: 34px;
            height: 34px;
            background: rgba(255, 255, 255, 0.8);
            border: 1px solid var(--border-light);
            box-shadow: 0 2px 8px rgba(17, 24, 39, 0.06);
          }
          .notification-wrapper {
            order: -1;
          }
          .notifications-popover {
            position: fixed;
            top: calc(var(--header-height) + 0.5rem);
            left: 0.875rem;
            right: 0.875rem;
            width: auto;
          }
        }
      `}</style>
    </header>
  );
};
