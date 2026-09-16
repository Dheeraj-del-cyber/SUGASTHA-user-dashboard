import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Check, QrCode, ShieldCheck, Printer } from 'lucide-react';
import { ConsultationRequest } from '../../types';

interface QrCodeDisplayProps {
  consultation: ConsultationRequest;
  size?: number;
}

export const QrCodeDisplay: React.FC<QrCodeDisplayProps> = ({
  consultation,
  size = 180,
}) => {
  const [copiedToken, setCopiedToken] = useState(false);

  const handleCopyToken = () => {
    navigator.clipboard.writeText(consultation.consultationNumber);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="qr-pass-container animate-fade-in">
      <div className="pass-card">
        {/* Pass Header */}
        <div className="pass-top">
          <div className="pass-brand">
            <ShieldCheck size={18} className="text-teal" />
            <span>SUGASTHA HOSPITAL PASS</span>
          </div>
          <button onClick={handlePrint} className="btn-print" title="Print this pass">
            <Printer size={14} />
            <span>Print</span>
          </button>
        </div>

        {/* Show-at-hospital instruction */}
        <div className="pass-instruction">
          <strong>Show this QR code at the hospital desk.</strong>
        </div>

        {/* Five-Digit Check-in PIN */}
        <div className="token-number-hero">
          <span className="token-label">YOUR CHECK-IN PIN</span>
          <div className="token-number-box">
            <span className="token-hash">#</span>
            <strong className="token-digits">{consultation.consultationNumber}</strong>
            <button onClick={handleCopyToken} className="btn-copy-token" title="Copy check-in PIN">
              {copiedToken ? <Check size={14} className="text-green" /> : <Copy size={14} />}
            </button>
          </div>
          <span className="token-sub">You can also say this 5-digit number at the desk</span>
        </div>

        {/* Scannable QR Code */}
        <div className="qr-canvas-wrapper">
          <div className="qr-white-frame">
            <QRCodeSVG
              value={consultation.qrDataPayload}
              size={size}
              level="H"
              includeMargin={true}
              bgColor="#ffffff"
              fgColor="#080c16"
            />
          </div>
          <div className="qr-caption">
            <QrCode size={14} className="text-teal" />
            <span>Scan at the hospital entrance</span>
          </div>
        </div>

        {/* Hospital & Visit Details */}
        <div className="pass-details-grid">
          <div className="detail-item full-col">
            <span className="det-label">Hospital</span>
            <strong className="det-val">{consultation.selectedHospital.name}</strong>
          </div>

          <div className="detail-item full-col">
            <span className="det-label">Doctor</span>
            <strong className="det-val text-teal">
              {consultation.selectedDoctor.name} ({consultation.selectedDoctor.specialization})
            </strong>
          </div>

          <div className="detail-item">
            <span className="det-label">Date</span>
            <strong className="det-val">{new Date(consultation.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</strong>
          </div>

          <div className="detail-item">
            <span className="det-label">Time</span>
            <strong className="det-val">{consultation.appointmentSlot}</strong>
          </div>

          <div className="detail-item">
            <span className="det-label">Status</span>
            <span
              className={`badge ${
                consultation.status === 'CONFIRMED'
                  ? 'badge-green'
                  : consultation.status === 'PENDING'
                  ? 'badge-yellow'
                  : 'badge-info'
              }`}
            >
              {consultation.status === 'CONFIRMED'
                ? 'Visit confirmed'
                : consultation.status === 'PENDING'
                ? 'Waiting for hospital'
                : consultation.status === 'COMPLETED'
                ? 'Visit completed'
                : 'Visit updated'}
            </span>
          </div>
        </div>
      </div>

      <style>{`
        .qr-pass-container {
          display: flex;
          justify-content: center;
          width: 100%;
        }
        .pass-card {
          background: linear-gradient(135deg, #101a33 0%, #0c1426 100%);
          border: 1px solid rgba(14, 165, 233, 0.4);
          border-radius: var(--radius-lg);
          padding: 1.5rem;
          width: 100%;
          max-width: 440px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.25rem;
          box-shadow: 0 12px 36px rgba(0, 0, 0, 0.5), 0 0 25px rgba(14, 165, 233, 0.15);
        }
        .pass-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
          border-bottom: 1px solid var(--border-subtle);
          padding-bottom: 0.6rem;
        }
        .pass-brand {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.72rem;
          font-weight: 700;
          color: var(--brand-accent);
          letter-spacing: 0.05em;
        }
        .btn-print {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.72rem;
          color: var(--text-muted);
          background: rgba(255, 255, 255, 0.05);
          padding: 3px 8px;
          border-radius: var(--radius-xs);
          transition: all var(--transition-fast);
        }
        .btn-print:hover {
          color: #ffffff;
          background: rgba(255, 255, 255, 0.12);
        }
        .pass-instruction {
          width: 100%;
          text-align: center;
          font-size: 1rem;
          font-weight: 700;
          color: #ffffff;
          background: rgba(14, 165, 233, 0.12);
          border: 1px solid rgba(14, 165, 233, 0.35);
          padding: 0.6rem 0.75rem;
          border-radius: var(--radius-sm);
        }
        .token-number-hero {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.35rem;
          width: 100%;
          background: rgba(0, 0, 0, 0.3);
          padding: 1rem;
          border-radius: var(--radius-sm);
          border: 1px dashed rgba(14, 165, 233, 0.35);
        }
        .token-label {
          font-size: 0.68rem;
          font-weight: 700;
          color: #94a3b8;
          letter-spacing: 0.08em;
        }
        .token-number-box {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .token-hash {
          font-size: 1.5rem;
          color: var(--brand-accent);
          font-weight: 800;
        }
        .token-digits {
          font-family: var(--font-display);
          font-size: 2.2rem;
          font-weight: 900;
          letter-spacing: 0.15em;
          color: #ffffff;
        }
        .btn-copy-token {
          background: rgba(255, 255, 255, 0.08);
          padding: 6px;
          border-radius: var(--radius-xs);
          color: var(--text-muted);
        }
        .btn-copy-token:hover {
          color: #ffffff;
        }
        .token-sub {
          font-size: 0.72rem;
          color: var(--text-muted);
          text-align: center;
        }
        .qr-canvas-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.65rem;
        }
        .qr-white-frame {
          background: #ffffff;
          padding: 10px;
          border-radius: var(--radius-md);
          box-shadow: 0 4px 18px rgba(0, 0, 0, 0.3);
        }
        .qr-caption {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.72rem;
          color: var(--text-secondary);
        }
        .pass-details-grid {
          width: 100%;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.65rem;
          background: rgba(0, 0, 0, 0.25);
          padding: 0.85rem;
          border-radius: var(--radius-sm);
        }
        .detail-item {
          display: flex;
          flex-direction: column;
          gap: 2px;
          font-size: 0.8rem;
        }
        .full-col {
          grid-column: 1 / -1;
        }
        .det-label {
          font-size: 0.65rem;
          color: var(--text-muted);
          text-transform: uppercase;
        }
        .det-val {
          color: #ffffff;
        }
        .btn-icon-sub {
          color: var(--text-muted);
          padding: 2px;
        }
      `}</style>
    </div>
  );
};
