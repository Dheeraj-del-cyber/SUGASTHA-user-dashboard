import React, { useState } from 'react';
import { Search, ShieldAlert, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Modal } from '../common/Modal';
import { abhaService } from '../../services/abhaService';

interface AbhaRecoverModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRecovered: (abhaNumber: string) => void;
  onBackToLogin: () => void;
}

export const AbhaRecoverModal: React.FC<AbhaRecoverModalProps> = ({
  isOpen,
  onClose,
  onSelectRecovered,
  onBackToLogin,
}) => {
  const [mobileOrAadhaar, setMobileOrAadhaar] = useState('9876543210');
  const [loading, setLoading] = useState(false);
  const [recoveredData, setRecoveredData] = useState<{
    abhaNumber: string;
    abhaAddress: string;
    maskedMobile: string;
  } | null>(null);

  const handleRecover = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await abhaService.recoverAbhaId(mobileOrAadhaar);
      setRecoveredData(data);
      setLoading(false);
    } catch {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Find your ABHA number"
      subtitle="We can find it using your mobile number or Aadhaar"
      maxWidth="460px"
    >
      <div className="recover-container">
        {!recoveredData ? (
          <form onSubmit={handleRecover} className="form-col animate-fade-in">
            <div className="info-box">
              <ShieldAlert size={18} className="text-amber" />
              <span>
                Enter the mobile number linked to your Aadhaar. We will find your ABHA number for you.
              </span>
            </div>

            <div className="form-group">
              <label className="form-label">Your mobile number or Aadhaar number</label>
              <input
                type="text"
                className="form-input"
                placeholder="10-digit mobile or 12-digit Aadhaar"
                value={mobileOrAadhaar}
                onChange={(e) => setMobileOrAadhaar(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary btn-lg w-full" disabled={loading}>
              {loading ? 'Looking for your ABHA number...' : 'Find My ABHA Number'}
              <Search size={18} />
            </button>
          </form>
        ) : (
          <div className="recovered-result animate-fade-in">
            <div className="icon-circle">
              <CheckCircle2 size={40} className="text-emerald" />
            </div>
            <h4 className="recovered-title">We found your ABHA number!</h4>
            <p className="recovered-desc">
              It is linked to {recoveredData.maskedMobile}.
            </p>

            <div className="card details-card">
              <div className="field-row">
                <span className="text-muted">ABHA Number:</span>
                <strong className="text-teal font-mono">{recoveredData.abhaNumber}</strong>
              </div>
              <div className="field-row">
                <span className="text-muted">ABHA Address:</span>
                <strong className="text-primary">{recoveredData.abhaAddress}</strong>
              </div>
            </div>

            <button
              onClick={() => {
                onSelectRecovered(recoveredData.abhaNumber);
                onClose();
              }}
              className="btn btn-primary btn-lg w-full"
            >
              Sign in with this number
              <ArrowRight size={18} />
            </button>
          </div>
        )}

        <div className="back-row">            <button type="button" className="btn-back" onClick={onBackToLogin}>
              Back to login
            </button>
        </div>
      </div>

      <style>{`
        .recover-container {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
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
          background: rgba(245, 158, 11, 0.08);
          border: 1px solid rgba(245, 158, 11, 0.25);
          padding: 0.75rem;
          border-radius: var(--radius-sm);
          font-size: 0.8rem;
          color: var(--text-secondary);
        }
        .text-amber {
          color: #f59e0b;
        }
        .text-emerald {
          color: #10b981;
        }
        .recovered-result {
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.85rem;
        }
        .icon-circle {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: rgba(16, 185, 129, 0.12);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .recovered-title {
          font-size: 1.25rem;
          font-weight: 700;
        }
        .recovered-desc {
          font-size: 0.82rem;
          color: var(--text-secondary);
        }
        .details-card {
          width: 100%;
          text-align: left;
          background: var(--bg-surface-2);
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
        }
        .field-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.85rem;
        }
        .font-mono {
          font-family: monospace;
          letter-spacing: 0.05em;
        }
        .back-row {
          text-align: center;
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
