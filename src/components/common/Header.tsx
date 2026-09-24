import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { User, Bell, Check, CheckCircle2, ChevronDown, Home, FileText, Ticket } from 'lucide-react';
import { AbhaProfile, ConsultationRequest } from '../../types';
import { ActiveTab } from './BottomNav';
import logoImage from '../../../images/logo.png';

interface HeaderProps {
  profile: AbhaProfile | null;
  activeConsultation: ConsultationRequest | null;
  onOpenLogin: () => void;
  onLogout: () => void;
  onOpenProfile?: () => void;
  onGoHome?: () => void;
  activeTab?: ActiveTab;
  activeSubView?: 'DASHBOARD' | 'SYMPTOMS' | 'TRIAGE_RESULT' | 'RECOMMENDATION' | 'TRACKER' | 'RECORDS' | 'HISTORY' | 'CONSENTS' | 'PROFILE';
  onSelectTab?: (tab: ActiveTab) => void;
  recordsCount?: number;
  historyCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  profile,
  activeConsultation,
  onOpenLogin,
  onGoHome,
  activeTab,
  activeSubView,
  onSelectTab,
  recordsCount,
  historyCount,
}) => {
  const { t, i18n } = useTranslation();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(2);
  const languages = [
    { code: 'en', label: t('language.english') },
    { code: 'kn', label: t('language.kannada') },
    { code: 'hi', label: t('language.hindi') },
    { code: 'mr', label: t('language.marathi') },
    { code: 'ta', label: t('language.tamil') },
    { code: 'te', label: t('language.telugu') },
  ];
  const currentLanguage = languages.find((language) => i18n.language.startsWith(language.code)) ?? languages[0];

  const notifications = [
    {
      id: 'notif-1',
      title: t('nav.abhaConnected'),
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

  const changeLanguage = (language: string) => {
    void i18n.changeLanguage(language);
    localStorage.setItem('sugastha-language', language);
    setIsLanguageMenuOpen(false);
  };

  useEffect(() => {
    const closeLanguageMenu = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.language-selector-wrap')) setIsLanguageMenuOpen(false);
    };
    document.addEventListener('click', closeLanguageMenu);
    return () => document.removeEventListener('click', closeLanguageMenu);
  }, []);

  return (
    <header className="swasthya-header">
      <div className="container header-container">
        {/* Brand Logo & Title */}
        <div className="brand-group" onClick={onGoHome ?? (() => onSelectTab?.('dashboard'))}>
          <div className="brand-icon-wrapper">
            <img src={logoImage} alt="SUGASTHA logo" className="brand-logo-image" />
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
            <span>{t('nav.home')}</span>
          </button>

          <button
            onClick={() => onSelectTab?.('records')}
            className={`desktop-nav-item ${
              activeTab === 'records' || activeSubView === 'RECORDS' ? 'active' : ''
            }`}
          >
            <FileText size={17} className="desktop-nav-icon" />
            <span>{t('nav.records')}</span>
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
            <span>{t('nav.hospitalPasses')}</span>
            {activeConsultation ? (
              <span className="desktop-nav-active-dot" title="Active Visit Token Live" />
            ) : typeof historyCount === 'number' && historyCount > 0 ? (
              <span className="desktop-nav-count">{historyCount}</span>
            ) : null}
          </button>
        </nav>

        {/* Action Controls & Patient Status */}
        <div className="header-actions">
          <div className="language-selector-wrap">
            <button
              type="button"
              className="language-selector"
              aria-haspopup="listbox"
              aria-expanded={isLanguageMenuOpen}
              aria-label={t('nav.language')}
              onClick={(event) => {
                event.stopPropagation();
                setIsLanguageMenuOpen((open) => !open);
              }}
            >
              <span>{currentLanguage.label}</span>
              <ChevronDown size={15} aria-hidden="true" />
            </button>
            {isLanguageMenuOpen && (
              <div className="language-menu" role="listbox" aria-label={t('nav.language')}>
                {languages.map((language) => (
                  <button
                    key={language.code}
                    type="button"
                    role="option"
                    aria-selected={currentLanguage.code === language.code}
                    className={`language-option ${currentLanguage.code === language.code ? 'active' : ''}`}
                    onClick={() => changeLanguage(language.code)}
                  >
                    <span>{language.label}</span>
                    {currentLanguage.code === language.code && <Check size={15} aria-hidden="true" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notifications Dropdown */}
          <div className="notification-wrapper">
            <button
              onClick={() => {
                setIsNotificationsOpen(!isNotificationsOpen);
                setUnreadCount(0);
              }}
              className="btn-icon-head"
              title={t('nav.notifications')}
            >
              <Bell size={18} />
              {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
            </button>

            {isNotificationsOpen && (
              <div className="notifications-popover">
                <div className="popover-header">
                  <h4>{t('nav.notifications')}</h4>
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
          
          <div id="google_translate_element" className="translate-widget"></div>

          {!profile && (
            <button onClick={onOpenLogin} className="btn btn-primary btn-sm">
              <User size={16} />
              <span>{t('nav.loginAbha')}</span>
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
        .language-selector-wrap {
          position: relative;
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }
        .language-selector {
          display: inline-flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.45rem;
          min-width: 112px;
          max-width: 132px;
          height: 34px;
          padding: 0 0.65rem 0 0.75rem;
          border: 1px solid var(--border-light);
          border-radius: var(--radius-full);
          background: var(--bg-app);
          color: var(--dark-navy-text);
          font-size: 0.78rem;
          font-weight: 600;
          line-height: 1;
          outline: none;
          cursor: pointer;
          white-space: nowrap;
          transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
        }
        .language-selector:hover,
        .language-selector:focus-visible {
          border-color: var(--brand-primary);
          box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.14);
        }
        .language-menu {
          position: absolute;
          top: calc(100% + 0.5rem);
          right: 0;
          z-index: 130;
          display: flex;
          flex-direction: column;
          width: 178px;
          padding: 0.35rem;
          background: var(--white);
          border: 1px solid var(--border-light);
          border-radius: var(--radius-md);
          box-shadow: var(--shadow-lg);
        }
        .language-option {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.5rem;
          min-height: 36px;
          padding: 0.55rem 0.65rem;
          border: 0;
          border-radius: var(--radius-sm);
          background: transparent;
          color: var(--dark-navy-text);
          font-size: 0.78rem;
          text-align: left;
          cursor: pointer;
        }
        .language-option:hover,
        .language-option.active {
          background: var(--pastel-light-blue);
          color: var(--brand-primary-hover);
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
          .language-selector-wrap {
            display: flex;
            order: -2;
          }
          .language-selector {
            min-width: 104px;
            max-width: 118px;
            height: 32px;
            font-size: 0.74rem;
          }
          .language-menu {
            right: -0.25rem;
            width: 168px;
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
