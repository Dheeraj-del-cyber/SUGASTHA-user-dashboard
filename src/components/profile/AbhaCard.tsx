import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { ShieldCheck, Copy, Check, Heart, User, MapPin } from 'lucide-react';
import { AbhaProfile } from '../../types';

interface AbhaCardProps {
  profile: AbhaProfile;
}

export const AbhaCard: React.FC<AbhaCardProps> = ({ profile }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(profile.abhaNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="abha-card-wrapper animate-fade-in">
      <div className="abha-digital-card">
        {/* Holographic Header */}
        <div className="card-top-bar">
          <div className="gov-seal-group">
            <div className="emblem-placeholder">
              <ShieldCheck size={22} className="text-amber" />
            </div>
            <div className="gov-text">
              <span className="gov-india">NATIONAL HEALTH AUTHORITY</span>
              <span className="gov-abdm">Ayushman Bharat Digital Mission (ABDM)</span>
            </div>
          </div>
          <div className="abha-logo-badge">ABHA</div>
        </div>

        {/* Card Body */}
        <div className="card-mid-section">
          {/* Avatar / Photo */}
          <div className="avatar-frame">
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt={profile.fullName} className="avatar-img" />
            ) : (
              <User size={38} className="text-muted" />
            )}
            <span className="kyc-badge">KYC OK</span>
          </div>

          {/* Citizen Details */}
          <div className="citizen-info">
            <h3 className="patient-name">{profile.fullName}</h3>
            <div className="info-grid">
              <div>
                <span className="label">ABHA Address</span>
                <p className="value text-teal">{profile.abhaAddress}</p>
              </div>
              <div>
                <span className="label">DOB / Gender</span>
                <p className="value">
                  {profile.dateOfBirth} • {profile.gender}
                </p>
              </div>
              <div>
                <span className="label">Blood Group</span>
                <p className="value blood-val">
                  <Heart size={12} className="text-red" /> {profile.bloodGroup}
                </p>
              </div>
              <div>
                <span className="label">Mobile</span>
                <p className="value">{profile.mobileNumber}</p>
              </div>
            </div>
          </div>

          {/* ABDM Scannable QR */}
          <div className="card-qr-box">
            <QRCodeSVG
              value={`ABDM:VERIFY:${profile.abhaNumber}:${profile.abhaAddress}`}
              size={76}
              bgColor="#ffffff"
              fgColor="#0a0f1d"
              level="M"
            />
            <span className="qr-scan-label">Scan to Verify</span>
          </div>
        </div>

        {/* Card Footer with ABHA Number */}
        <div className="card-footer-bar">
          <div className="number-col">
            <span className="num-label">ABHA NUMBER</span>
            <div className="num-row">
              <strong className="num-digits">{profile.abhaNumber}</strong>
              <button onClick={handleCopy} className="btn-copy-num" title="Copy ABHA Number">
                {copied ? <Check size={14} className="text-green" /> : <Copy size={14} />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          <div className="address-snippet">
            <MapPin size={12} className="text-muted" />
            <span>{profile.address.district}, {profile.address.state}</span>
          </div>
        </div>
      </div>

      <style>{`
        .abha-card-wrapper {
          width: 100%;
        }
        .abha-digital-card {
          background: linear-gradient(135deg, #111d38 0%, #0d172e 50%, #162444 100%);
          border: 1px solid rgba(14, 165, 233, 0.35);
          border-radius: var(--radius-lg);
          padding: 1.25rem 1.5rem;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.45), 0 0 25px rgba(14, 165, 233, 0.12);
          position: relative;
          overflow: hidden;
          color: #f8fafc;
        }
        .abha-digital-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 200%;
          height: 100%;
          background: linear-gradient(
            60deg,
            transparent,
            rgba(255, 255, 255, 0.03),
            transparent
          );
          pointer-events: none;
        }
        .card-top-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          padding-bottom: 0.75rem;
          margin-bottom: 1rem;
        }
        .gov-seal-group {
          display: flex;
          align-items: center;
          gap: 0.6rem;
        }
        .emblem-placeholder {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(245, 158, 11, 0.15);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .text-amber {
          color: #f59e0b;
        }
        .gov-text {
          display: flex;
          flex-direction: column;
        }
        .gov-india {
          font-size: 0.68rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          color: #94a3b8;
        }
        .gov-abdm {
          font-size: 0.8rem;
          font-weight: 700;
          color: #38bdf8;
        }
        .abha-logo-badge {
          font-family: var(--font-display);
          font-weight: 900;
          font-size: 1.1rem;
          letter-spacing: 0.08em;
          background: linear-gradient(135deg, #f97316 0%, #10b981 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          border: 1px solid rgba(255, 255, 255, 0.15);
          padding: 2px 8px;
          border-radius: var(--radius-xs);
        }
        .card-mid-section {
          display: grid;
          grid-template-columns: auto 1fr auto;
          gap: 1.25rem;
          align-items: center;
          margin-bottom: 1rem;
        }
        .avatar-frame {
          position: relative;
          width: 78px;
          height: 78px;
          border-radius: var(--radius-sm);
          border: 2px solid rgba(14, 165, 233, 0.5);
          overflow: hidden;
          background: #1e293b;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .avatar-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .kyc-badge {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: #10b981;
          color: #ffffff;
          font-size: 0.55rem;
          font-weight: 800;
          text-align: center;
          padding: 1px 0;
          letter-spacing: 0.04em;
        }
        .citizen-info {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }
        .patient-name {
          font-size: 1.2rem;
          font-weight: 700;
          color: #ffffff;
          letter-spacing: -0.01em;
        }
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.4rem 1rem;
        }
        .label {
          font-size: 0.65rem;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }
        .value {
          font-size: 0.8rem;
          font-weight: 500;
          color: #e2e8f0;
        }
        .blood-val {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .text-red {
          color: #ef4444;
        }
        .text-teal {
          color: #38bdf8;
        }
        .card-qr-box {
          background: #ffffff;
          padding: 6px;
          border-radius: var(--radius-sm);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
        }
        .qr-scan-label {
          font-size: 0.55rem;
          color: #334155;
          font-weight: 700;
          text-transform: uppercase;
        }
        .card-footer-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: rgba(8, 12, 22, 0.6);
          padding: 0.75rem 1rem;
          border-radius: var(--radius-sm);
          border: 1px solid rgba(255, 255, 255, 0.06);
        }
        .number-col {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .num-label {
          font-size: 0.62rem;
          font-weight: 700;
          color: #94a3b8;
          letter-spacing: 0.08em;
        }
        .num-row {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .num-digits {
          font-family: monospace;
          font-size: 1.15rem;
          letter-spacing: 0.08em;
          color: #38bdf8;
        }
        .btn-copy-num {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.72rem;
          background: rgba(255, 255, 255, 0.08);
          padding: 3px 8px;
          border-radius: var(--radius-xs);
          color: #94a3b8;
          transition: all var(--transition-fast);
        }
        .btn-copy-num:hover {
          color: #ffffff;
          background: rgba(255, 255, 255, 0.15);
        }
        .text-green {
          color: #10b981;
        }
        .address-snippet {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.72rem;
          color: #94a3b8;
        }
        @media (max-width: 640px) {
          .card-mid-section {
            grid-template-columns: auto 1fr;
          }
          .card-qr-box {
            display: none;
          }
          .num-digits {
            font-size: 0.95rem;
          }
        }
      `}</style>
    </div>
  );
};
