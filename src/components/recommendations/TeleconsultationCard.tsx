import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Video, ExternalLink, Code2, CheckCircle2 } from 'lucide-react';
import { TriageResult, AbhaProfile } from '../../types';

interface TeleconsultationCardProps {
  triage: TriageResult;
  profile: AbhaProfile;
  onBookTeleconsultation: () => void;
  onSwitchToHospitalVisit: () => void;
}

export const TeleconsultationCard: React.FC<TeleconsultationCardProps> = ({
  triage,
  profile,
  onBookTeleconsultation,
  onSwitchToHospitalVisit,
}) => {
  const { t } = useTranslation();
  const [showApiInspect, setShowApiInspect] = useState(false);

  const apiPayload = {
    endpoint: 'POST https://esanjeevani.mohfw.gov.in/api/v2/patient/teleconsult-referral',
    headers: {
      Authorization: 'Bearer ABDM_GATEWAY_TOKEN_XXXXX',
      'Content-Type': 'application/json',
      'X-Origin-Platform': 'SUGASTHA-AI-TRIAGE',
    },
    body: {
      abhaNumber: profile.abhaNumber,
      abhaAddress: profile.abhaAddress,
      patientDemographics: {
        name: profile.fullName,
        gender: profile.gender,
        dob: profile.dateOfBirth,
        pincode: profile.address.pincode,
      },
      clinicalTriage: {
        tier: triage.level,
        urgency: triage.urgencyWindow,
        clinicalSummary: triage.summary,
        suggestedSpecialty: triage.suggestedSpecialties[0] || 'General Medicine',
      },
      callbackWebhook: 'https://api.sugastha.gov.in/v1/teleconsult/webhook',
    },
  };

  return (
    <div className="card teleconsult-card animate-fade-in">
      <div className="teleconsult-header">
        <div className="esanjeevani-badge-wrap">
          <div className="video-icon-circle">
            <Video size={28} className="text-emerald" />
          </div>
          <div className="header-meta">
            <div className="tag-row">
              <span className="gov-tele-tag">{t('dashboard.teleconsultation').toUpperCase()}</span>
            </div>
            <h2 className="tele-title">{t('dashboard.teleconsultation')}</h2>
          </div>
        </div>

        <p className="tele-desc">
          {t('recommendations.shortWaitText')}
        </p>
      </div>

      {/* Value Pillars */}
      <div className="tele-benefits-grid">
        <div className="benefit-item">
          <CheckCircle2 size={18} className="text-emerald" />
          <div>
            <strong>{t('recommendations.shortWait')}</strong>
            <p>{t('recommendations.shortWaitText')}</p>
          </div>
        </div>
        <div className="benefit-item">
          <CheckCircle2 size={18} className="text-emerald" />
          <div>
            <strong>{t('recommendations.free')}</strong>
            <p>{t('recommendations.freeText')}</p>
          </div>
        </div>
        <div className="benefit-item">
          <CheckCircle2 size={18} className="text-emerald" />
          <div>
            <strong>{t('recommendations.prescriptionSaved')}</strong>
            <p>{t('recommendations.prescriptionText')}</p>
          </div>
        </div>
      </div>

      {/* Developer-only API inspector (collapsed by default) */}
      <div className="api-ready-box">
        <button
          type="button"
          className="dev-toggle-btn"
          onClick={() => setShowApiInspect(!showApiInspect)}
        >
          <Code2 size={14} />
          <span>{showApiInspect ? t('recommendations.hideDetails') : t('recommendations.showDetails')}</span>
        </button>

        {showApiInspect && (
          <>
            <p className="api-ready-text">
              {t('recommendations.apiNotice')}
            </p>
            <pre className="api-code-block animate-fade-in">
              {JSON.stringify(apiPayload, null, 2)}
            </pre>
          </>
        )}
      </div>

      {/* Action CTA Strip */}
      <div className="tele-action-bar">
        <button
          onClick={onSwitchToHospitalVisit}
          className="btn btn-secondary btn-sm"
        >
          <span>{t('recommendations.preferHospital')}</span>
        </button>

        <button
          onClick={onBookTeleconsultation}
          className="btn btn-primary btn-lg connect-tele-btn"
        >
          <span>{t('recommendations.doctorCall')}</span>
          <ExternalLink size={18} />
        </button>
      </div>

      <style>{`
        .teleconsult-card {
          border: 1px solid rgba(16, 185, 129, 0.4);
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(15, 23, 42, 0.95) 100%);
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          padding: 2rem;
        }
        .teleconsult-header {
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
        }
        .esanjeevani-badge-wrap {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .video-icon-circle {
          width: 56px;
          height: 56px;
          border-radius: var(--radius-sm);
          background: rgba(16, 185, 129, 0.15);
          border: 1px solid rgba(16, 185, 129, 0.35);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .text-emerald {
          color: #10b981;
        }
        .header-meta {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        .tag-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        .gov-tele-tag {
          font-size: 0.68rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          color: #94a3b8;
        }
        .tele-title {
          font-size: 1.5rem;
          color: #ffffff;
        }
        .tele-desc {
          font-size: 0.92rem;
          color: var(--text-secondary);
          line-height: 1.5;
        }
        .tele-benefits-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
          background: rgba(0, 0, 0, 0.3);
          padding: 1.25rem;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-subtle);
        }
        .benefit-item {
          display: flex;
          align-items: flex-start;
          gap: 0.65rem;
          font-size: 0.82rem;
        }
        .benefit-item strong {
          display: block;
          color: #ffffff;
          margin-bottom: 2px;
        }
        .benefit-item p {
          color: var(--text-muted);
          font-size: 0.78rem;
          line-height: 1.35;
        }
        .api-ready-box {
          background: rgba(14, 165, 233, 0.06);
          border: 1px solid rgba(14, 165, 233, 0.2);
          border-radius: var(--radius-sm);
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .api-ready-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        .dev-toggle-btn {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.72rem;
          color: var(--text-muted);
          background: rgba(255, 255, 255, 0.04);
          border: 1px dashed var(--border-subtle);
          padding: 4px 8px;
          border-radius: var(--radius-xs);
          width: fit-content;
          transition: all var(--transition-fast);
        }
        .dev-toggle-btn:hover {
          color: var(--text-secondary);
        }
        .api-ready-text {
          font-size: 0.8rem;
          color: var(--text-muted);
        }
        .api-code-block {
          background: #020617;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: var(--radius-xs);
          padding: 0.75rem;
          font-size: 0.72rem;
          color: #38bdf8;
          overflow-x: auto;
          font-family: monospace;
          max-height: 200px;
        }
        .tele-action-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
          padding-top: 0.5rem;
        }
        .connect-tele-btn {
          padding: 0.85rem 2.25rem;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          box-shadow: 0 4px 18px rgba(16, 185, 129, 0.35);
        }
        .connect-tele-btn:hover {
          background: linear-gradient(135deg, #059669 0%, #047857 100%);
        }
        @media (max-width: 768px) {
          .tele-benefits-grid {
            grid-template-columns: 1fr;
          }
          .tele-action-bar {
            flex-direction: column-reverse;
          }
          .connect-tele-btn {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};
