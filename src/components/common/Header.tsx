import React from 'react';
import { ShieldCheck, Activity, User, LogOut, PhoneCall } from 'lucide-react';
import { AbhaProfile, ConsultationRequest } from '../../types';

interface HeaderProps {
  profile: AbhaProfile | null;
  activeConsultation: ConsultationRequest | null;
  onOpenLogin: () => void;
  onLogout: () => void;
  onViewActiveConsultation: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  profile,
  activeConsultation,
  onOpenLogin,
  onLogout,
  onViewActiveConsultation,
}) => {
  return (
    <header className="sugastha-header">
      <div className="container header-container">
        {/* Brand Logo */}
        <div className="brand-group">
          <div className="brand-icon-wrapper">
            <Activity className="brand-icon" size={24} />
          </div>
          <div className="brand-text">
            <div className="brand-title-row">
              <span className="brand-name">SUGASTHA</span>
              <span className="brand-badge-gov">ABDM COMPLIANT</span>
            </div>
            <span className="brand-tagline">Citizen Healthcare & AI Triage Platform</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="header-actions">
          {/* Emergency SOS Button */}
          <a
            href="tel:108"
            className="sos-chip"
            title="Emergency Ambulance Hotline: 108"
          >
            <PhoneCall size={14} className="sos-icon" />
            <span className="sos-text">SOS 108</span>
          </a>

          {/* Active Consultation Pill if present */}
          {activeConsultation && (
            <button
              onClick={onViewActiveConsultation}
              className={`active-token-chip ${
                activeConsultation.status === 'CONFIRMED' ? 'token-confirmed' : 'token-pending'
              }`}
            >
              <span className="status-ping"></span>
              <span className="token-label">Token:</span>
              <strong className="token-num">#{activeConsultation.consultationNumber}</strong>
              <span className="token-status">
                {activeConsultation.status === 'CONFIRMED' ? 'Confirmed' : 'Pending'}
              </span>
            </button>
          )}

          {/* User ABHA Profile / Login Button */}
          {profile ? (
            <div className="user-profile-badge">
              <div className="abha-id-tag">
                <ShieldCheck size={16} className="text-teal" />
                <div className="abha-details">
                  <span className="user-name">{profile.fullName.split(' ')[0]}</span>
                  <span className="abha-addr">{profile.abhaAddress}</span>
                </div>
              </div>
              <button
                onClick={onLogout}
                className="btn-icon-logout"
                title="Log out of ABHA session"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button onClick={onOpenLogin} className="btn btn-primary btn-sm">
              <User size={16} />
              <span>ABHA Login</span>
            </button>
          )}
        </div>
      </div>

      <style>{`
        .sugastha-header {
          position: sticky;
          top: 0;
          z-index: 100;
          background: rgba(11, 17, 32, 0.88);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-bottom: 1px solid var(--border-subtle);
          height: var(--header-height);
          display: flex;
          align-items: center;
        }
        .header-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
        }
        .brand-group {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          cursor: pointer;
        }
        .brand-icon-wrapper {
          width: 42px;
          height: 42px;
          border-radius: var(--radius-sm);
          background: var(--brand-gradient);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          box-shadow: 0 4px 12px var(--brand-primary-glow);
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
          background: linear-gradient(135deg, #38bdf8 0%, #ffffff 70%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .brand-badge-gov {
          background: rgba(249, 115, 22, 0.16);
          border: 1px solid rgba(249, 115, 22, 0.35);
          color: #fb923c;
          font-size: 0.62rem;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: var(--radius-xs);
          letter-spacing: 0.04em;
        }
        .brand-tagline {
          font-size: 0.75rem;
          color: var(--text-muted);
          font-weight: 400;
        }
        .header-actions {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .sos-chip {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          background: rgba(239, 68, 68, 0.15);
          border: 1px solid rgba(239, 68, 68, 0.4);
          color: #f87171;
          padding: 0.4rem 0.75rem;
          border-radius: var(--radius-full);
          font-weight: 700;
          font-size: 0.75rem;
          letter-spacing: 0.02em;
          transition: all var(--transition-fast);
        }
        .sos-chip:hover {
          background: #ef4444;
          color: #ffffff;
        }
        .active-token-chip {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.35rem 0.85rem;
          border-radius: var(--radius-full);
          font-size: 0.8rem;
          background: var(--bg-surface-2);
          border: 1px solid var(--border-subtle);
          color: var(--text-primary);
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        .active-token-chip:hover {
          transform: translateY(-1px);
        }
        .token-pending {
          border-color: rgba(245, 158, 11, 0.4);
          background: rgba(245, 158, 11, 0.1);
        }
        .token-confirmed {
          border-color: rgba(16, 185, 129, 0.4);
          background: rgba(16, 185, 129, 0.1);
        }
        .status-ping {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #10b981;
          box-shadow: 0 0 8px #10b981;
          animation: pulseGlow 1.5s infinite;
        }
        .token-pending .status-ping {
          background: #f59e0b;
          box-shadow: 0 0 8px #f59e0b;
        }
        .token-num {
          color: var(--brand-accent);
          font-family: var(--font-display);
        }
        .token-status {
          font-size: 0.7rem;
          text-transform: uppercase;
          opacity: 0.8;
        }
        .user-profile-badge {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: var(--bg-surface-2);
          border: 1px solid var(--border-subtle);
          padding: 0.3rem 0.65rem;
          border-radius: var(--radius-sm);
        }
        .abha-id-tag {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .text-teal {
          color: var(--brand-primary);
        }
        .abha-details {
          display: flex;
          flex-direction: column;
          line-height: 1.2;
        }
        .user-name {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-primary);
        }
        .abha-addr {
          font-size: 0.7rem;
          color: var(--text-muted);
        }
        .btn-icon-logout {
          color: var(--text-muted);
          padding: 4px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color var(--transition-fast);
        }
        .btn-icon-logout:hover {
          color: #ef4444;
        }
        @media (max-width: 640px) {
          .brand-tagline, .brand-badge-gov {
            display: none;
          }
          .abha-addr {
            display: none;
          }
        }
      `}</style>
    </header>
  );
};
