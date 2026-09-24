import React, { useState } from 'react';
import { ShieldPlus, CheckCircle2, UserCheck, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Modal } from '../common/Modal';
import { abhaService } from '../../services/abhaService';
import { AbhaProfile } from '../../types';

interface AbhaRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (profile: AbhaProfile) => void;
  onBackToLogin: () => void;
}

export const AbhaRegisterModal: React.FC<AbhaRegisterModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onBackToLogin,
}) => {
  const { t } = useTranslation();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [aadhaar, setAadhaar] = useState('5421 8902 4312');
  const [mobile, setMobile] = useState('+91 98711 00223');
  const [fullName, setFullName] = useState('Deepak Singhania');
  const [dob, setDob] = useState('1990-08-15');
  const [gender, setGender] = useState<'MALE' | 'FEMALE' | 'OTHER'>('MALE');
  const [addressPref, setAddressPref] = useState('deepak.singhania');
  const [otp, setOtp] = useState('739201');
  const [loading, setLoading] = useState(false);
  const [createdProfile, setCreatedProfile] = useState<AbhaProfile | null>(null);

  const handleStep1VerifyAadhaar = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep(2);
    }, 800);
  };

  const handleStep2VerifyOtpAndCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const profile = await abhaService.registerNewAbha({
        aadhaarNumber: aadhaar,
        mobileNumber: mobile,
        fullName,
        dateOfBirth: dob,
        gender,
        preferredAbhaAddress: addressPref,
      });
      setCreatedProfile(profile);
      setLoading(false);
      setStep(3);
    } catch {
      setLoading(false);
    }
  };

  const handleFinish = () => {
    if (createdProfile) {
      onSuccess(createdProfile);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('auth.register.title')}
      subtitle={t('auth.register.subtitle')}
      maxWidth="500px"
    >
      <div className="register-container">
        {/* Step Indicator */}
        <div className="steps-progress">
          <div className={`step-dot ${step >= 1 ? 'active' : ''}`}>1. Aadhaar</div>
          <div className="step-line"></div>
          <div className={`step-dot ${step >= 2 ? 'active' : ''}`}>2. Enter code & details</div>
          <div className="step-line"></div>
          <div className={`step-dot ${step >= 3 ? 'active' : ''}`}>3. Done</div>
        </div>

        {/* Step 1: Aadhaar Details */}
        {step === 1 && (
          <form onSubmit={handleStep1VerifyAadhaar} className="form-col animate-fade-in">
            <div className="info-box">
              <ShieldPlus size={18} className="text-teal" />
              <span>
                We will create your 14-digit ABHA health number using your Aadhaar. It is free and safe.
              </span>
            </div>

            <div className="form-group">
              <label className="form-label">Enter your 12-digit Aadhaar number</label>
              <input
                type="text"
                className="form-input"
                placeholder="XXXX XXXX XXXX"
                value={aadhaar}
                onChange={(e) => setAadhaar(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Enter your mobile number</label>
              <input
                type="text"
                className="form-input"
                placeholder="+91 XXXXX XXXXX"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                required
              />
            </div>

            <div className="terms-row">
              <input type="checkbox" id="consent" defaultChecked required />
              <label htmlFor="consent" className="terms-label">
                I agree to use my Aadhaar details to create my ABHA health number.
              </label>
            </div>

            <button type="submit" className="btn btn-primary btn-lg w-full" disabled={loading}>
              {loading ? 'Sending code...' : 'Send code to my phone'}
              <ArrowRight size={18} />
            </button>
          </form>
        )}

        {/* Step 2: OTP & Preferred Address */}
        {step === 2 && (
          <form onSubmit={handleStep2VerifyOtpAndCreate} className="form-col animate-fade-in">
            <div className="form-group">
              <label className="form-label">Enter the 6-digit code (OTP)</label>
              <input
                type="text"
                maxLength={6}
                className="form-input text-center font-bold"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="• • • • • •"
                required
              />
              <span className="text-xs text-teal">Demo code is already filled</span>
            </div>

            <div className="form-group">
              <label className="form-label">Your full name</label>
              <input
                type="text"
                className="form-input"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Date of Birth</label>
                <input
                  type="date"
                  className="form-input"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Gender</label>
                <select
                  className="form-input"
                  value={gender}
                  onChange={(e) => setGender(e.target.value as any)}
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Choose your ABHA username</label>
              <div className="input-affix-group">
                <input
                  type="text"
                  className="form-input"
                  value={addressPref}
                  onChange={(e) => setAddressPref(e.target.value)}
                  placeholder="username"
                  required
                />
                <span className="input-suffix">@abdm</span>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-lg w-full" disabled={loading}>
              {loading ? 'Creating your ABHA number...' : 'Verify & Continue'}
              <UserCheck size={18} />
            </button>
          </form>
        )}

        {/* Step 3: Success Confirmation */}
        {step === 3 && createdProfile && (
          <div className="success-container animate-fade-in">
            <div className="success-icon-badge">
              <CheckCircle2 size={44} className="text-emerald" />
            </div>
            <h4 className="success-title">Your ABHA number is ready!</h4>
            <p className="success-desc">
              Your free health account is active. You can now use SUGASTHA.
            </p>

            <div className="card new-card-preview">
              <div className="row-between">
                <span className="text-muted">ABHA Number:</span>
                <strong className="text-teal font-mono">{createdProfile.abhaNumber}</strong>
              </div>
              <div className="row-between">
                <span className="text-muted">ABHA Address:</span>
                <strong>{createdProfile.abhaAddress}</strong>
              </div>
              <div className="row-between">
                <span className="text-muted">Holder Name:</span>
                <span>{createdProfile.fullName}</span>
              </div>
            </div>

            <button onClick={handleFinish} className="btn btn-primary btn-lg w-full">
              Start
              <ArrowRight size={18} />
            </button>
          </div>
        )}

        {step < 3 && (
          <div className="back-row">
            <button type="button" className="btn-back" onClick={onBackToLogin}>
              {t('auth.register.back')}
            </button>
          </div>
        )}
      </div>

      <style>{`
        .register-container {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        .steps-progress {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid var(--border-subtle);
        }
        .step-dot {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-muted);
        }
        .step-dot.active {
          color: var(--brand-accent);
        }
        .step-line {
          flex: 1;
          height: 2px;
          background: var(--border-subtle);
          margin: 0 0.5rem;
        }
        .form-col {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .info-box {
          display: flex;
          align-items: flex-start;
          gap: 0.5rem;
          background: rgba(14, 165, 233, 0.08);
          border: 1px solid rgba(14, 165, 233, 0.25);
          padding: 0.75rem;
          border-radius: var(--radius-sm);
          font-size: 0.8rem;
          color: var(--text-secondary);
        }
        .terms-row {
          display: flex;
          align-items: flex-start;
          gap: 0.5rem;
          font-size: 0.75rem;
          color: var(--text-muted);
          margin: 0.25rem 0;
        }
        .terms-label {
          line-height: 1.4;
          cursor: pointer;
        }
        .grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.75rem;
        }
        .input-affix-group {
          display: flex;
          align-items: center;
        }
        .input-affix-group input {
          border-top-right-radius: 0;
          border-bottom-right-radius: 0;
          flex: 1;
        }
        .input-suffix {
          background: var(--bg-surface-3);
          border: 1px solid var(--border-subtle);
          border-left: none;
          padding: 10px 12px;
          font-size: 0.9rem;
          color: var(--brand-accent);
          font-weight: 600;
          border-top-right-radius: var(--radius-sm);
          border-bottom-right-radius: var(--radius-sm);
        }
        .success-container {
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.85rem;
        }
        .success-icon-badge {
          width: 68px;
          height: 68px;
          border-radius: 50%;
          background: rgba(16, 185, 129, 0.15);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .text-emerald {
          color: #10b981;
        }
        .success-title {
          font-size: 1.35rem;
          font-weight: 700;
        }
        .success-desc {
          font-size: 0.85rem;
          color: var(--text-secondary);
          max-width: 380px;
        }
        .new-card-preview {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
          font-size: 0.85rem;
          text-align: left;
          background: var(--bg-surface-2);
        }
        .row-between {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .font-mono {
          font-family: monospace;
          letter-spacing: 0.05em;
        }
        .back-row {
          text-align: center;
          margin-top: 0.5rem;
        }
        .btn-back {
          font-size: 0.82rem;
          color: var(--text-muted);
        }
        .btn-back:hover {
          color: var(--text-primary);
        }
      `}</style>
    </Modal>
  );
};
