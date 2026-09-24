import React, { useState } from 'react';
import { ShieldCheck, KeyRound, Smartphone, ArrowRight, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Modal } from '../common/Modal';
import { abhaService } from '../../services/abhaService';
import { AbhaProfile, HealthRecord, ChronicCondition, Allergy } from '../../types';

interface AbhaLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data: {
    profile: AbhaProfile;
    records: HealthRecord[];
    conditions: ChronicCondition[];
    allergies: Allergy[];
  }) => void;
  onOpenRegister: () => void;
  onOpenRecover: () => void;
}

export const AbhaLoginModal: React.FC<AbhaLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onOpenRegister,
  onOpenRecover,
}) => {
  const { t } = useTranslation();
  const [identifier, setIdentifier] = useState('91-4523-8901-2345');
  const [authMode, setAuthMode] = useState<'OTP' | 'PASSWORD'>('OTP');
  const [otpValue, setOtpValue] = useState('482910');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSendOtp = () => {
    if (!identifier.trim()) {
      setErrorMsg(t('auth.login.errorEmpty'));
      return;
    }
    setErrorMsg('');
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setOtpSent(true);
    }, 600);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    try {
      const session = await abhaService.login(identifier, authMode, otpValue);
      setLoading(false);
      onSuccess(session);
      onClose();
    } catch {
      setLoading(false);
      setErrorMsg(t('auth.login.errorFailed'));
    }
  };

  const handleQuickDemoFill = (id: string) => {
    setIdentifier(id);
    setOtpSent(false);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('auth.loginModal.title')}
      subtitle={t('auth.loginModal.subtitle')}
      maxWidth="480px"
    >
      <form onSubmit={handleLoginSubmit} className="abha-login-form">
        {/* Quick Demo Pre-fills (demo helper) */}
        <div className="demo-accounts-pill">
          <div className="demo-pill-header">
            <Sparkles size={14} className="text-amber" />
            <span>{t('auth.loginModal.demoTitle')}</span>
          </div>
          <div className="demo-btns-row">
            <button
              type="button"
              className="btn-demo-tag"
              onClick={() => handleQuickDemoFill('91-4523-8901-2345')}
            >
              Rajesh
            </button>
            <button
              type="button"
              className="btn-demo-tag"
              onClick={() => handleQuickDemoFill('91-7890-1234-5678')}
            >
              Ananya
            </button>
          </div>
        </div>

        {/* Input Identifier */}
        <div className="form-group">
          <label className="form-label">
            {t('auth.loginModal.enterAbha')}
          </label>
          <div className="input-with-icon">
            <ShieldCheck size={18} className="input-icon" />
            <input
              type="text"
              className="form-input"
              placeholder={t('auth.loginModal.abhaPlaceholder')}
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Auth Method Toggle */}
        <div className="auth-method-selector">
          <button
            type="button"
            className={`auth-btn ${authMode === 'OTP' ? 'active' : ''}`}
            onClick={() => setAuthMode('OTP')}
          >
            <Smartphone size={16} />
            <span>{t('auth.loginModal.otpMethod')}</span>
          </button>
          <button
            type="button"
            className={`auth-btn ${authMode === 'PASSWORD' ? 'active' : ''}`}
            onClick={() => setAuthMode('PASSWORD')}
          >
            <KeyRound size={16} />
            <span>{t('auth.loginModal.passwordMethod')}</span>
          </button>
        </div>

        {/* OTP / Password Step */}
        {authMode === 'OTP' ? (
          <div className="form-group">
            {!otpSent ? (
              <button
                type="button"
                className="btn btn-secondary w-full"
                onClick={handleSendOtp}
                disabled={loading}
              >
                {loading ? t('auth.loginModal.sendingCode') : t('auth.loginModal.sendCode')}
              </button>
            ) : (
              <div className="otp-container animate-fade-in">
                <label className="form-label">{t('auth.loginModal.otpLabel')}</label>
                <input
                  type="text"
                  maxLength={6}
                  className="form-input text-center otp-input"
                  value={otpValue}
                  onChange={(e) => setOtpValue(e.target.value)}
                  placeholder="• • • • • •"
                  required
                />
                <span className="otp-hint text-teal">
                  {t('auth.loginModal.otpHint')}
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="form-group">
            <label className="form-label">{t('auth.loginModal.passwordLabel')}</label>
            <input
              type="password"
              className="form-input"
              defaultValue="DemoPass@2026"
              required
            />
          </div>
        )}

        {errorMsg && <div className="error-alert">{errorMsg}</div>}

        {/* Submit */}
        <button
          type="submit"
          className="btn btn-primary btn-lg w-full"
          disabled={loading || (authMode === 'OTP' && !otpSent)}
        >
          {loading ? t('auth.loginModal.verifying') : t('auth.loginModal.verifyContinue')}
          <ArrowRight size={18} />
        </button>

        {/* Auxiliary Links */}
        <div className="auth-aux-links">
          <button
            type="button"
            className="aux-link"
            onClick={() => {
              onClose();
              onOpenRegister();
            }}
          >
            {t('auth.loginModal.registerPrompt')} <strong>{t('auth.loginModal.registerAction')}</strong>
          </button>
          <span className="aux-divider">•</span>
          <button
            type="button"
            className="aux-link"
            onClick={() => {
              onClose();
              onOpenRecover();
            }}
          >
            {t('auth.loginModal.recoverPrompt')} <strong>{t('auth.loginModal.recoverAction')}</strong>
          </button>
        </div>
      </form>

      <style>{`
        .abha-login-form {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        .demo-accounts-pill {
          background: rgba(14, 165, 233, 0.08);
          border: 1px dashed rgba(14, 165, 233, 0.35);
          border-radius: var(--radius-sm);
          padding: 0.75rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .demo-pill-header {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.78rem;
          font-weight: 600;
          color: var(--brand-accent);
        }
        .demo-btns-row {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        .btn-demo-tag {
          font-size: 0.75rem;
          background: var(--bg-surface-2);
          border: 1px solid var(--border-subtle);
          padding: 0.3rem 0.65rem;
          border-radius: var(--radius-xs);
          color: var(--text-primary);
          transition: all var(--transition-fast);
        }
        .btn-demo-tag:hover {
          border-color: var(--brand-accent);
          background: var(--bg-surface-3);
        }
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }
        .form-label {
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--text-secondary);
        }
        .input-with-icon {
          position: relative;
          display: flex;
          align-items: center;
        }
        .input-icon {
          position: absolute;
          left: 12px;
          color: var(--brand-accent);
          pointer-events: none;
        }
        .form-input {
          width: 100%;
          padding-left: 2.5rem;
          background: var(--bg-surface-2);
          border: 1px solid var(--border-subtle);
        }
        .auth-method-selector {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.5rem;
        }
        .auth-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.6rem;
          font-size: 0.8rem;
          font-weight: 500;
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-sm);
          color: var(--text-muted);
          background: var(--bg-surface-2);
          transition: all var(--transition-fast);
        }
        .auth-btn.active {
          border-color: var(--brand-primary);
          background: rgba(14, 165, 233, 0.12);
          color: var(--brand-accent);
          font-weight: 600;
        }
        .otp-container {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }
        .otp-input {
          letter-spacing: 0.4em;
          font-size: 1.25rem;
          font-weight: 700;
          padding-left: 14px;
        }
        .otp-hint {
          font-size: 0.75rem;
        }
        .w-full {
          width: 100%;
        }
        .error-alert {
          background: rgba(239, 68, 68, 0.15);
          border: 1px solid rgba(239, 68, 68, 0.35);
          color: #f87171;
          padding: 0.6rem;
          border-radius: var(--radius-sm);
          font-size: 0.82rem;
        }
        .auth-aux-links {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          font-size: 0.8rem;
          color: var(--text-muted);
          margin-top: 0.5rem;
          flex-wrap: wrap;
        }
        .aux-link {
          color: var(--text-muted);
          transition: color var(--transition-fast);
        }
        .aux-link strong {
          color: var(--brand-accent);
        }
        .aux-link:hover {
          color: var(--text-primary);
        }
        .aux-divider {
          color: var(--border-subtle);
        }
      `}</style>
    </Modal>
  );
};
