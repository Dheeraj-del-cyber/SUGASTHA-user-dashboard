import React, { useState } from 'react';
import { ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';
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
      <div className="desktop-login" aria-label="Desktop SWASTHYASETU login">
        <div className="desktop-shell">
          <section className="desktop-visual-panel" aria-label="SWASTHYASETU overview">
            <div className="desktop-brand-row">
              <div className="desktop-brand-mark">
                <img src="/images/logo.png" alt="SWASTHYASETU logo" />
              </div>
              <div className="desktop-brand-copy">
                <span className="desktop-brand-name">SWASTHYASETU</span>
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
              <svg viewBox="0 0 760 500" className="medtech-illustration" role="img" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="deskSky" x1="0" x2="1">
                    <stop offset="0%" stopColor="#EAF8FF" />
                    <stop offset="100%" stopColor="#F5FBFF" />
                  </linearGradient>
                  <linearGradient id="deskWave" x1="0" x2="1">
                    <stop offset="0%" stopColor="#2CB9C8" />
                    <stop offset="100%" stopColor="#0D7AC7" />
                  </linearGradient>
                </defs>

                <rect width="760" height="500" rx="32" fill="url(#deskSky)" />
                <path d="M0 330 C110 290, 180 286, 260 305 C346 325, 430 356, 520 340 C608 323, 685 301, 760 318 L760 500 L0 500 Z" fill="#EAFBF4" />
                <path d="M0 395 C120 362, 220 352, 308 380 C400 410, 500 402, 596 372 C670 349, 714 355, 760 365 L760 500 L0 500 Z" fill="#E5F7F3" />

                <g opacity="0.8" stroke="#98dfe9" strokeWidth="2" fill="none" strokeDasharray="5 10">
                  <path d="M70 120 L220 120" />
                  <path d="M510 124 L670 124" />
                  <path d="M100 230 L210 230" />
                  <path d="M580 210 L700 210" />
                </g>

                <g transform="translate(84,120)">
                  <rect x="0" y="120" width="118" height="84" rx="20" fill="#fff" stroke="#dfeef5" />
                  <rect x="14" y="16" width="90" height="64" rx="18" fill="#e6f8ff" />
                  <rect x="28" y="38" width="26" height="26" rx="8" fill="#d2f4ec" />
                  <rect x="62" y="38" width="26" height="26" rx="8" fill="#d2f4ec" />
                  <rect x="21" y="156" width="78" height="18" rx="8" fill="#d9f4f3" />
                  <path d="M80 140 V34" stroke="#0a6e72" strokeWidth="3" strokeLinecap="round" />
                  <path d="M81 35 H122" stroke="#0a6e72" strokeWidth="3" strokeLinecap="round" />
                </g>

                <g transform="translate(270,120)">
                  <path d="M0 260 C50 214, 118 168, 182 177 S297 225, 360 182" stroke="url(#deskWave)" strokeWidth="8" fill="none" strokeLinecap="round" />
                  <circle cx="32" cy="258" r="10" fill="#19afbd" />
                  <circle cx="146" cy="176" r="10" fill="#1cb39d" />
                  <circle cx="271" cy="225" r="11" fill="#5ac5dd" />
                  <circle cx="358" cy="182" r="11" fill="#21a8b5" />
                  <path d="M32 258 L146 176 L271 225 L358 182" stroke="#78d2e7" strokeWidth="3" fill="none" strokeDasharray="7 10" opacity="0.8" />

                  <g transform="translate(120,118)">
                    <circle cx="0" cy="70" r="62" fill="#fff" stroke="#e4edf8" />
                    <circle cx="0" cy="70" r="32" fill="#def9f5" />
                    <path d="M-16 70 C-8 52, 0 52, 8 70 S16 88, 20 70" stroke="#153b50" strokeWidth="5" fill="none" strokeLinecap="round" />
                    <path d="M-18 90 C-8 103, 10 103, 18 90" stroke="#153b50" strokeWidth="5" fill="none" strokeLinecap="round" />
                    <path d="M0 26 L0 142" stroke="#153b50" strokeWidth="7" strokeLinecap="round" />
                    <path d="M0 26 L42 42" stroke="#153b50" strokeWidth="7" strokeLinecap="round" />
                    <path d="M0 80 L36 112" stroke="#153b50" strokeWidth="7" strokeLinecap="round" />
                    <path d="M0 74 L-34 56" stroke="#153b50" strokeWidth="7" strokeLinecap="round" />
                  </g>

                  <g transform="translate(292,152)">
                    <circle cx="0" cy="54" r="54" fill="#fff" stroke="#e4edf8" />
                    <circle cx="0" cy="54" r="27" fill="#f7e9ec" />
                    <path d="M-18 56 C-8 42, 8 42, 18 56 S30 68, 18 68" stroke="#153b50" strokeWidth="5" fill="none" strokeLinecap="round" />
                    <path d="M-18 76 C-7 85, 9 85, 18 76" stroke="#153b50" strokeWidth="5" fill="none" strokeLinecap="round" />
                    <path d="M0 4 L0 104" stroke="#153b50" strokeWidth="6" strokeLinecap="round" />
                    <path d="M0 4 L30 18" stroke="#153b50" strokeWidth="6" strokeLinecap="round" />
                    <path d="M0 44 L30 70" stroke="#153b50" strokeWidth="6" strokeLinecap="round" />
                    <path d="M0 68 L-28 94" stroke="#153b50" strokeWidth="6" strokeLinecap="round" />
                  </g>
                </g>

                <g transform="translate(560,190)">
                  <rect x="0" y="0" width="150" height="120" rx="22" fill="rgba(255,255,255,0.9)" stroke="#def3f8" />
                  <path d="M20 36 H53 M20 56 H53 M20 76 H44" stroke="#0a6e72" strokeWidth="5" strokeLinecap="round" />
                  <circle cx="103" cy="32" r="18" fill="#dffaf4" />
                  <path d="M103 19 L103 44 M90 31 L116 31" stroke="#0d7a6d" strokeWidth="4" strokeLinecap="round" />
                  <path d="M74 84 C88 66, 112 64, 129 84" stroke="#1ba5bb" strokeWidth="5" fill="none" strokeLinecap="round" />
                  <circle cx="74" cy="84" r="6" fill="#1ba5bb" />
                  <circle cx="129" cy="84" r="6" fill="#1ba5bb" />
                </g>

                <g transform="translate(610,116)">
                  <path d="M40 18 L80 48 L40 80 L0 48 Z" fill="#dffaf4" opacity="0.9" />
                  <path d="M40 22 V72" stroke="#0d7a6d" strokeWidth="4" strokeLinecap="round" />
                  <path d="M12 48 H68" stroke="#0d7a6d" strokeWidth="4" strokeLinecap="round" />
                </g>

                <g opacity="0.8">
                  <circle cx="96" cy="410" r="8" fill="#7CD9E8" />
                  <circle cx="154" cy="382" r="6" fill="#8AE0C7" />
                  <circle cx="638" cy="390" r="8" fill="#7CD9E8" />
                  <circle cx="690" cy="426" r="6" fill="#8AE0C7" />
                </g>
              </svg>
            </div>
          </section>

          <aside className="desktop-auth-panel">
            <div className="desktop-auth-card-shell">
              <div className="desktop-auth-brand-row">
                <div className="desktop-auth-brand-mark">
                  <img src="/images/logo.png" alt="SWASTHYASETU logo" />
                </div>
                <div className="desktop-auth-brand-copy">
                  <span className="desktop-auth-brand-name">SWASTHYASETU</span>
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

      <div className="mobile-login" aria-label="Mobile SWASTHYASETU login">
        <div className="mobile-shell">
          <header className="mobile-brand-row">
            <div className="mobile-brand-mark">
              <img src="/images/logo.png" alt="SWASTHYASETU logo" />
            </div>
            <div className="mobile-brand-copy">
              <span className="mobile-brand-name">SWASTHYASETU</span>
              <span className="mobile-brand-tag">Your Healthcare, Connected</span>
            </div>
          </header>

          <div className="mobile-illustration" aria-hidden="true">
            <svg viewBox="0 0 420 240" className="mobile-medtech-art" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="mobBg" x1="0" x2="1">
                  <stop offset="0%" stopColor="#EAF8FF" />
                  <stop offset="100%" stopColor="#F3FBFA" />
                </linearGradient>
              </defs>
              <rect width="420" height="240" rx="28" fill="url(#mobBg)" />
              <path d="M0 168 C84 150, 146 145, 210 164 C276 181, 330 186, 420 158 L420 240 L0 240 Z" fill="#E9F9F5" />
              <g opacity="0.7" stroke="#93dfe6" strokeWidth="2" fill="none" strokeDasharray="6 8">
                <path d="M34 50 L120 50" />
                <path d="M310 54 L384 54" />
                <path d="M54 190 L150 190" />
              </g>

              <g transform="translate(32,54)">
                <circle cx="58" cy="42" r="30" fill="#eaf9ff" />
                <circle cx="58" cy="42" r="16" fill="#dff8f2" />
                <path d="M48 42 C52 33, 64 33, 68 42" stroke="#153b50" strokeWidth="4" fill="none" strokeLinecap="round" />
                <path d="M47 55 C53 61, 63 61, 69 55" stroke="#153b50" strokeWidth="4" fill="none" strokeLinecap="round" />
                <path d="M58 12 L58 85" stroke="#153b50" strokeWidth="4" strokeLinecap="round" />
                <path d="M58 12 L82 22" stroke="#153b50" strokeWidth="4" strokeLinecap="round" />
                <path d="M58 54 L90 74" stroke="#153b50" strokeWidth="4" strokeLinecap="round" />
                <path d="M58 47 L30 31" stroke="#153b50" strokeWidth="4" strokeLinecap="round" />
              </g>

              <g transform="translate(160,44)">
                <path d="M0 104 C44 72, 110 52, 164 67 C210 79, 242 104, 270 92" stroke="url(#mobBg)" strokeWidth="6" fill="none" strokeLinecap="round" opacity="0.8" />
                <circle cx="12" cy="101" r="7" fill="#1ba9bb" />
                <circle cx="106" cy="65" r="8" fill="#1bb39e" />
                <circle cx="202" cy="83" r="8" fill="#5ec5dc" />
                <circle cx="270" cy="92" r="8" fill="#1ca3b8" />
                <path d="M12 101 L106 65 L202 83 L270 92" stroke="#7cd7e8" strokeWidth="2.5" fill="none" strokeDasharray="6 8" opacity="0.8" />
              </g>

              <g transform="translate(270,98)">
                <rect x="0" y="0" width="96" height="74" rx="16" fill="#fff" stroke="#dfeef5" />
                <path d="M18 26 H44 M18 42 H44 M18 58 H38" stroke="#0d6d74" strokeWidth="4" strokeLinecap="round" />
                <circle cx="64" cy="22" r="12" fill="#def9f2" />
                <path d="M64 11 L64 33 M53 22 L75 22" stroke="#0d7a6d" strokeWidth="3" strokeLinecap="round" />
                <path d="M46 58 C58 45, 73 45, 82 58" stroke="#1da5b6" strokeWidth="4" fill="none" strokeLinecap="round" />
                <circle cx="46" cy="58" r="4" fill="#1da5b6" />
                <circle cx="82" cy="58" r="4" fill="#1da5b6" />
              </g>

              <g transform="translate(100,136)">
                <rect x="0" y="0" width="80" height="42" rx="12" fill="#fff" stroke="#dfeef5" />
                <rect x="16" y="10" width="48" height="18" rx="8" fill="#eaf7ff" />
                <path d="M32 10 L32 28 M18 19 L46 19" stroke="#0d7a6d" strokeWidth="3" strokeLinecap="round" />
              </g>
            </svg>
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

        .mobile-medtech-art {
          width: 100%;
          height: auto;
          display: block;
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
