import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { ConsultationRequest } from '../../types';

interface QrCodeDisplayProps {
  consultation: ConsultationRequest;
  size?: number;
}

export const QrCodeDisplay: React.FC<QrCodeDisplayProps> = ({
  consultation,
  size = 180,
}) => {
  return (
    <div className="qr-pass-container animate-fade-in">
      <div className="pass-card">
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
        </div>

        <div className="token-number-hero">
          <span className="token-label">CHECK-IN PIN</span>
          <div className="token-number-box">
            <strong className="token-digits">{consultation.consultationNumber}</strong>
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
          background: var(--white);
          border: 2px solid #000000;
          border-radius: var(--radius-sm);
          padding: 1rem;
          width: 100%;
          max-width: 440px;
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          box-shadow: var(--shadow-md);
        }
        .token-number-hero {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
          width: 150px;
          background: var(--pastel-light-blue);
          padding: 0.7rem;
          border-radius: var(--radius-sm);
          border: 1px solid #17202A;
        }
        .token-label {
          font-size: 0.68rem;
          font-weight: 700;
          color: var(--text-muted);
          letter-spacing: 0.08em;
        }
        .token-number-box {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
        }
        .token-digits {
          font-family: var(--font-display);
          font-size: 2.2rem;
          font-weight: 900;
          letter-spacing: 0.15em;
          color: var(--dark-navy-text);
        }
        .qr-canvas-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          flex-shrink: 0;
        }
        .qr-white-frame {
          background: #ffffff;
          padding: 6px;
          border-radius: var(--radius-md);
          box-shadow: 0 4px 18px rgba(0, 0, 0, 0.3);
        }
        @media (max-width: 480px) {
          .pass-card {
            gap: 0.55rem;
            padding: 0.65rem;
          }
          .qr-white-frame {
            padding: 4px;
          }
          .token-number-hero {
            width: 125px;
            padding: 0.5rem 0.35rem;
          }
          .token-digits {
            font-size: 1.55rem;
            letter-spacing: 0.08em;
          }
        }
      `}</style>
    </div>
  );
};
