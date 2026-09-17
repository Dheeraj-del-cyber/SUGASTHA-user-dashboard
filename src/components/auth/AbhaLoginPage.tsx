import React, { useState } from 'react';
import { ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';
import logoImage from '../../../images/logo.png';
import loginHeroImage from '../../../images/login.png';
import { abhaService } from '../../services/abhaService';
import { AbhaProfile, HealthRecord, ChronicCondition, Allergy } from '../../types';

interface AbhaLoginPageProps {
  onSuccess: (data: {
    profile: AbhaProfile;
    records: HealthRecord[];
    conditions: ChronicCondition[];
    allergies: Allergy[];
  }) => void;
  onOpenRegister: () => void;
  onOpenRecover: () => void;
}

export const AbhaLoginPage: React.FC<AbhaLoginPageProps> = ({
  onSuccess,
  onOpenRecover,
}) => {
  const [identifier, setIdentifier] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [shakeError, setShakeError] = useState(false);

  const triggerShake = () => {
    setShakeError(true);
    setTimeout(() => setShakeError(false), 500);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const trimmed = identifier.trim();
    if (!trimmed) {
      setErrorMsg('Please enter your ABHA ID to continue.');
      triggerShake();
      return;
    }

    const digitsOnly = trimmed.replace(/[-\s]/g, '');
    if (digitsOnly.length < 5) {
      setErrorMsg('Please enter a valid ABHA ID (e.g. 91-4523-8901-2345).');
      triggerShake();
      return;
    }

    setLoading(true);
    try {
      const session = await abhaService.login(trimmed, 'OTP', '000000');
      setLoading(false);
      onSuccess(session);
    } catch {
      setLoading(false);
      setErrorMsg('Login failed. Please check your ABHA ID and try again.');
      triggerShake();
    }
  };

  return (
    <div className="swasthya-auth-page">
      <div className="desktop-login" aria-label="Desktop SUGASTHA login">
        <div className="desktop-shell">
          <section className="desktop-visual-panel" aria-label="SUGASTHA overview">
            <div className="desktop-brand-row">
              <div className="desktop-brand-mark">
                <img src={logoImage} alt="SUGASTHA logo" />
              </div>
              <div className="desktop-brand-copy">
                <span className="desktop-brand-name">SUGASTHA</span>
                <span className="desktop-brand-tag">Your Healthcare, Connected</span>
              </div>
            </div>

            <div className="desktop-copy">
              <div className="desktop-pill">CONNECTED CARE NETWORK</div>
              <h1>
                Connecting You to
                <span>Better Healthcare</span>
              </h1>
              <p>
                Digital-first care designed to connect patients, doctors, facilities and health records into one trusted experience.
              </p>
            </div>

            <div className="desktop-illustration" aria-hidden="true">
              <div className="desktop-login-hero" style={{ backgroundImage: `url(${loginHeroImage})` }} />
            </div>
          </section>

          <aside className="desktop-auth-panel">
            <div className="desktop-auth-card-shell">
              <div className="desktop-auth-brand-row">
                <div className="desktop-auth-brand-mark">
                  <img src={logoImage} alt="SUGASTHA logo" />
                </div>
                <div className="desktop-auth-brand-copy">
                  <span className="desktop-auth-brand-name">SUGASTHA</span>
                  <span className="desktop-auth-brand-tag">SECURE ACCESS</span>
                </div>
              </div>

              <div className={`desktop-auth-card ${shakeError ? 'shake' : ''}`}>
                <div className="desktop-auth-header">
                  <div>
                    <span className="desktop-auth-kicker">WELCOME BACK</span>
                    <h2>Your healthcare journey starts here</h2>
                  </div>
                  <div className="desktop-protected-pill">
                    <ShieldCheck size={14} />
                    <span>Protected</span>
                  </div>
                </div>

                <form onSubmit={handleLogin} className="desktop-login-form" autoComplete="off">
                  <label htmlFor="abha-id-desktop" className="desktop-login-label">ABHA ID</label>
                  <div className="desktop-input-shell">
                    <ShieldCheck size={18} className="desktop-input-icon" />
                    <input
                      id="abha-id-desktop"
                      type="text"
                      className="desktop-login-input"
                      placeholder="Enter your ABHA ID"
                      value={identifier}
                      onChange={(e) => {
                        setIdentifier(e.target.value);
                        if (errorMsg) setErrorMsg('');
                      }}
                      disabled={loading}
                      autoFocus
                      aria-label="ABHA ID"
                    />
                  </div>

                  {errorMsg && (
                    <div className="desktop-login-error" role="alert">
                      {errorMsg}
                    </div>
                  )}

                  <button type="button" className="desktop-help-link" onClick={onOpenRecover} disabled={loading}>
                    Don't remember your ABHA ID?
                  </button>

                  <button type="submit" className="desktop-submit-btn" disabled={loading} aria-disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 size={18} className="desktop-spin" />
                        <span>Logging in...</span>
                      </>
                    ) : (
                      <>
                        <span>Login</span>
                        <ArrowRight size={18} />
                      </>
                    )}
                  </button>
                </form>

                <div className="desktop-privacy-note">
                  <ShieldCheck size={15} />
                  <span>Your health information is protected and handled securely.</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <div className="mobile-login" aria-label="Mobile SUGASTHA login">
        <div className="mobile-shell">
          <header className="mobile-brand-row">
            <div className="mobile-brand-mark">
              <img src={logoImage} alt="SUGASTHA logo" />
            </div>
            <div className="mobile-brand-copy">
              <span className="mobile-brand-name">SUGASTHA</span>
              <span className="mobile-brand-tag">Your Healthcare, Connected</span>
            </div>
          </header>

          <div className="mobile-illustration" aria-hidden="true">
            <div className="mobile-login-hero" style={{ backgroundImage: `url(${loginHeroImage})` }} />
          </div>

          <div className="mobile-header-copy">
            <h1>
              Connecting You to
              <span>Better Healthcare</span>
            </h1>
            <p>Digital-first care connecting patients, doctors, facilities and records in one secure experience.</p>
          </div>

          <div className={`mobile-auth-card ${shakeError ? 'shake' : ''}`}>
            <div className="mobile-auth-header">
              <span>WELCOME BACK</span>
              <h2>Access your healthcare journey securely</h2>
            </div>

            <form onSubmit={handleLogin} className="mobile-login-form" autoComplete="off">
              <label htmlFor="abha-id-mobile" className="mobile-login-label">ABHA ID</label>
              <div className="mobile-input-shell">
                <ShieldCheck size={18} className="mobile-input-icon" />
                <input
                  id="abha-id-mobile"
                  type="text"
                  className="mobile-login-input"
                  placeholder="Enter your ABHA ID"
                  value={identifier}
                  onChange={(e) => {
                    setIdentifier(e.target.value);
                    if (errorMsg) setErrorMsg('');
                  }}
                  disabled={loading}
                  autoFocus
                  aria-label="ABHA ID"
                />
              </div>

              {errorMsg && (
                <div className="mobile-login-error" role="alert">
                  {errorMsg}
                </div>
              )}

              <button type="button" className="mobile-help-link" onClick={onOpenRecover} disabled={loading}>
                Don't remember your ABHA ID?
              </button>

              <button type="submit" className="mobile-submit-btn" disabled={loading} aria-disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 size={18} className="mobile-spin" />
                    <span>Logging in...</span>
                  </>
                ) : (
                  <>
                    <span>Login</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            <div className="mobile-privacy-note">
              <ShieldCheck size={15} />
              <span>Secure health information</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        * { box-sizing: border-box; }

        .swasthya-auth-page {
          min-height: 100vh;
          min-height: 100svh;
          background:
            radial-gradient(circle at top left, rgba(126, 224, 255, 0.22), transparent 28%),
            linear-gradient(180deg, #dff5fd 0%, #eaf9ff 30%, #edf8fb 100%);
          padding: 18px;
          font-family: Inter, 'Segoe UI', sans-serif;
        }

        .desktop-login {
          display: none;
        }

        .mobile-login {
          display: block;
        }

        @media (min-width: 768px) {
          .desktop-login {
            display: block;
          }

          .mobile-login {
            display: none;
          }
        }

        .desktop-shell {
          width: min(1280px, 100%);
          min-height: calc(100vh - 36px);
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1.35fr 0.78fr;
          gap: 28px;
          align-items: center;
        }

        .desktop-visual-panel {
          background: rgba(255,255,255,0.36);
          border: 1px solid rgba(148,170,190,0.18);
          border-radius: 34px;
          min-height: 760px;
          padding: 24px 30px 18px;
          box-shadow: 0 26px 56px rgba(17, 69, 96, 0.08);
          position: relative;
          overflow: hidden;
        }

        .desktop-brand-row {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .desktop-brand-mark,
        .desktop-auth-brand-mark,
        .mobile-brand-mark {
          width: 56px;
          height: 56px;
          display: grid;
          place-items: center;
          border-radius: 18px;
          background: rgba(255,255,255,0.9);
          border: 1px solid rgba(148, 170, 190, 0.18);
          box-shadow: 0 16px 28px rgba(18, 63, 88, 0.08);
        }

        .desktop-brand-mark img,
        .desktop-auth-brand-mark img,
        .mobile-brand-mark img {
          width: 42px;
          height: 42px;
          object-fit: contain;
        }

        .desktop-brand-copy,
        .desktop-auth-brand-copy,
        .mobile-brand-copy {
          display: flex;
          flex-direction: column;
        }

        .desktop-brand-name,
        .desktop-auth-brand-name,
        .mobile-brand-name {
          font-size: 0.9rem;
          font-weight: 900;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #102941;
        }

        .desktop-brand-tag,
        .desktop-auth-brand-tag,
        .mobile-brand-tag {
          font-size: 0.7rem;
          letter-spacing: 0.04em;
          color: #4d6d7d;
        }

        .desktop-copy {
          margin-top: 22px;
        }

        .desktop-pill {
          display: inline-flex;
          align-items: center;
          padding: 10px 16px;
          border-radius: 999px;
          background: rgba(255,255,255,0.75);
          border: 1px solid rgba(148,170,190,0.18);
          color: #0d5f75;
          font-size: 0.7rem;
          font-weight: 800;
          letter-spacing: 0.12em;
        }

        .desktop-copy h1 {
          margin-top: 18px;
          max-width: 560px;
          font-size: clamp(3rem, 4.4vw, 5.2rem);
          line-height: 0.9;
          letter-spacing: -0.08em;
          font-weight: 900;
          color: #0a2238;
        }

        .desktop-copy h1 span {
          display: block;
          color: #0d7a6d;
        }

        .desktop-copy p {
          margin-top: 18px;
          max-width: 520px;
          font-size: 1.04rem;
          line-height: 1.7;
          color: #46677d;
        }

        .desktop-illustration {
          margin-top: 16px;
        }

        .desktop-login-hero,
        .mobile-login-hero {
          width: 100%;
          height: 100%;
          min-height: 280px;
          border-radius: 28px;
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          box-shadow: 0 24px 30px rgba(15, 83, 103, 0.14);
          border: 1px solid rgba(255,255,255,0.2);
        }

        .desktop-login-hero {
          min-height: 450px;
          border-radius: 30px;
        }

        .medtech-illustration {
          width: 100%;
          height: auto;
          display: block;
          filter: drop-shadow(0 24px 30px rgba(15, 83, 103, 0.1));
        }

        .desktop-auth-panel {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .desktop-auth-card-shell {
          width: min(100%, 450px);
        }

        .desktop-auth-brand-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 18px;
        }

        .desktop-auth-brand-mark {
          width: 52px;
          height: 52px;
          border-radius: 16px;
        }

        .desktop-auth-brand-mark img {
          width: 38px;
          height: 38px;
        }

        .desktop-auth-brand-tag {
          font-size: 0.66rem;
          letter-spacing: 0.12em;
          color: #4d6d7d;
        }

        .desktop-auth-card {
          position: relative;
          background: rgba(255,255,255,0.75);
          border: 1px solid rgba(148,170,190,0.16);
          border-radius: 28px;
          padding: 26px 22px 22px;
          box-shadow: 0 22px 60px rgba(10, 49, 64, 0.09);
          overflow: hidden;
        }

        .desktop-auth-card::before {
          content: '';
          position: absolute;
          right: -70px;
          bottom: -110px;
          width: 220px;
          height: 220px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(78, 202, 191, 0.15), transparent 70%);
        }

        .desktop-auth-header {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 20px;
        }

        .desktop-auth-kicker {
          display: block;
          margin-bottom: 8px;
          color: #0d7a6d;
          font-size: 0.72rem;
          letter-spacing: 0.12em;
          font-weight: 800;
        }

        .desktop-auth-header h2 {
          max-width: 12ch;
          font-size: clamp(1.8rem, 2.2vw, 2.7rem);
          line-height: 1.06;
          letter-spacing: -0.06em;
          color: #102941;
        }

        .desktop-protected-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 10px;
          border-radius: 999px;
          background: rgba(15, 185, 129, 0.09);
          border: 1px solid rgba(15, 185, 129, 0.15);
          color: #0d6d63;
          font-size: 0.64rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .desktop-login-form {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
        }

        .desktop-login-label {
          font-size: 0.72rem;
          color: #456173;
          font-weight: 800;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          margin-bottom: 8px;
        }

        .desktop-input-shell {
          position: relative;
          display: flex;
          align-items: center;
        }

        .desktop-input-icon {
          position: absolute;
          left: 16px;
          color: #0d7a6d;
        }

        .desktop-login-input {
          width: 100%;
          border: 1px solid rgba(148,170,190,0.25);
          border-radius: 16px;
          background: rgba(246,250,252,0.9);
          padding: 16px 18px 16px 46px;
          color: #102941;
          font-size: 1rem;
        }

        .desktop-login-input::placeholder {
          color: #7d93a1;
        }

        .desktop-login-input:focus {
          outline: none;
          border-color: rgba(13,122,109,0.55);
          box-shadow: 0 0 0 6px rgba(13,122,109,0.08);
        }

        .desktop-login-error {
          margin-top: 12px;
          padding: 10px 12px;
          border-radius: 12px;
          background: rgba(240, 96, 96, 0.08);
          border: 1px solid rgba(196, 62, 62, 0.18);
          color: #b42318;
          font-size: 0.8rem;
        }

        .desktop-help-link {
          align-self: flex-start;
          margin-top: 14px;
          border: none;
          background: transparent;
          color: #0d7a6d;
          font-weight: 700;
          font-size: 0.84rem;
          text-decoration: underline;
          text-decoration-color: rgba(13,122,109,0.38);
          text-underline-offset: 2px;
          text-decoration-thickness: 1.5px;
        }

        .desktop-submit-btn {
          margin-top: 16px;
          width: 100%;
          border: none;
          border-radius: 16px;
          padding: 16px 18px;
          background: linear-gradient(135deg, #0d4f73 0%, #0d7ca8 48%, #0d7a6d 100%);
          color: white;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          font-size: 1.02rem;
          font-weight: 800;
          box-shadow: 0 18px 30px rgba(12,79,115,0.22);
        }

        .desktop-spin,
        .mobile-spin {
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .desktop-privacy-note,
        .mobile-privacy-note {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          color: #516d7d;
          font-size: 0.76rem;
          text-align: center;
        }

        .desktop-privacy-note {
          margin-top: 22px;
        }

        .desktop-auth-card.shake,
        .mobile-auth-card.shake {
          animation: shakeCard 0.42s ease;
        }

        @keyframes shakeCard {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-6px); }
          40% { transform: translateX(6px); }
          60% { transform: translateX(-5px); }
          80% { transform: translateX(5px); }
        }

        .mobile-shell {
          width: min(100%, 440px);
          margin: 0 auto;
          padding: 10px 8px 32px;
        }

        .mobile-brand-row {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 14px;
        }

        .mobile-brand-mark {
          width: 46px;
          height: 46px;
          border-radius: 14px;
        }

        .mobile-brand-mark img {
          width: 34px;
          height: 34px;
        }

        .mobile-brand-name {
          font-size: 0.76rem;
          letter-spacing: 0.08em;
        }

        .mobile-brand-tag {
          font-size: 0.62rem;
        }

        .mobile-illustration {
          background: rgba(255,255,255,0.3);
          border: 1px solid rgba(148,170,190,0.16);
          border-radius: 24px;
          box-shadow: 0 18px 40px rgba(23, 64, 85, 0.08);
          overflow: hidden;
        }

        .mobile-login-hero {
          min-height: 220px;
          border-radius: 22px;
        }

        .mobile-header-copy {
          margin-top: 18px;
        }

        .mobile-header-copy h1 {
          font-size: clamp(2.2rem, 10vw, 3.5rem);
          line-height: 0.94;
          letter-spacing: -0.07em;
          color: #0d2139;
          margin: 0;
        }

        .mobile-header-copy h1 span {
          display: block;
          color: #0d7a6d;
        }

        .mobile-header-copy p {
          margin-top: 12px;
          color: #4d6f82;
          line-height: 1.6;
          font-size: 0.94rem;
        }

        .mobile-auth-card {
          margin-top: 18px;
          background: rgba(255,255,255,0.72);
          border: 1px solid rgba(148,170,190,0.16);
          border-radius: 26px;
          padding: 18px 16px 16px;
          box-shadow: 0 18px 36px rgba(18, 62, 82, 0.08);
        }

        .mobile-auth-header span {
          display: block;
          margin-bottom: 8px;
          color: #0d7a6d;
          font-size: 0.68rem;
          letter-spacing: 0.12em;
          font-weight: 800;
        }

        .mobile-auth-header h2 {
          font-size: 1.6rem;
          line-height: 1.08;
          letter-spacing: -0.05em;
          color: #102941;
          margin: 0;
        }

        .mobile-login-form {
          margin-top: 18px;
          display: flex;
          flex-direction: column;
        }

        .mobile-login-label {
          margin-bottom: 8px;
          font-size: 0.68rem;
          letter-spacing: 0.12em;
          font-weight: 800;
          text-transform: uppercase;
          color: #4d6d7d;
        }

        .mobile-input-shell {
          position: relative;
          display: flex;
          align-items: center;
        }

        .mobile-input-icon {
          position: absolute;
          left: 14px;
          color: #0d7a6d;
        }

        .mobile-login-input {
          width: 100%;
          border: 1px solid rgba(148,170,190,0.2);
          border-radius: 14px;
          background: rgba(245,249,252,0.9);
          padding: 15px 16px 15px 42px;
          font-size: 0.96rem;
          color: #102941;
        }

        .mobile-login-input::placeholder {
          color: #7b94a2;
        }

        .mobile-login-input:focus {
          outline: none;
          border-color: rgba(13,122,109,0.5);
          box-shadow: 0 0 0 5px rgba(13,122,109,0.08);
        }

        .mobile-login-error {
          margin-top: 12px;
          padding: 10px 12px;
          border-radius: 12px;
          background: rgba(240, 96, 96, 0.08);
          border: 1px solid rgba(196,62,62,0.18);
          color: #b42318;
          font-size: 0.8rem;
        }

        .mobile-help-link {
          align-self: flex-start;
          margin-top: 14px;
          border: none;
          background: transparent;
          color: #0d7a6d;
          font-size: 0.8rem;
          font-weight: 700;
          text-decoration: underline;
          text-decoration-color: rgba(13,122,109,0.38);
          text-underline-offset: 2px;
          text-decoration-thickness: 1.5px;
        }

        .mobile-submit-btn {
          margin-top: 18px;
          width: 100%;
          border: none;
          border-radius: 14px;
          padding: 15px 18px;
          background: linear-gradient(135deg, #0d4f73 0%, #0e7ea5 48%, #0d7a6d 100%);
          color: white;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          font-size: 1rem;
          font-weight: 800;
          box-shadow: 0 16px 24px rgba(12,79,115,0.22);
        }

        .mobile-privacy-note {
          margin-top: 18px;
          font-size: 0.74rem;
          color: #4d6d7d;
        }

        @media (min-width: 768px) {
          .swasthya-auth-page {
            padding: 26px;
          }
        }
      `}</style>
    </div>
  );
};
