import React, { useState } from 'react';
import {
  FileText,
  AlertTriangle,
  HeartPulse,
  Pill,
  Activity,
  Calendar,
  Building2,
  User,
  Paperclip,
} from 'lucide-react';
import { HealthRecord, ChronicCondition, Allergy } from '../../types';

interface HealthRecordsViewProps {
  records: HealthRecord[];
  conditions: ChronicCondition[];
  allergies: Allergy[];
  onStartTriage: () => void;
}

export const HealthRecordsView: React.FC<HealthRecordsViewProps> = ({
  records,
  conditions,
  allergies,
  onStartTriage,
}) => {
  const [filter, setFilter] = useState<'ALL' | 'DIAGNOSIS' | 'PRESCRIPTION' | 'LAB_REPORT' | 'SURGERY'>('ALL');

  const filteredRecords = filter === 'ALL' ? records : records.filter((r) => r.category === filter);

  return (
    <div className="health-records-wrapper animate-fade-in">
      {/* Top Banner: Chronic & Allergy Alerts */}
      <div className="summary-alert-grid">
        {/* Chronic Conditions */}
        <div className="card alert-summary-card">
          <div className="alert-card-header">
            <HeartPulse size={18} className="text-teal" />
            <h4 className="alert-card-title">Your health conditions</h4>
          </div>
          {conditions.length === 0 ? (
            <p className="empty-text">No health conditions.</p>
          ) : (
            <div className="conditions-list">
              {conditions.map((cond) => (
                <div key={cond.id} className="condition-chip">
                  <div className="condition-meta">
                    <strong>{cond.condition}</strong>
                    <span className="since-tag">Since {cond.diagnosedYear}</span>
                  </div>
                  {cond.severityNote && <span className="note-text">{cond.severityNote}</span>}
                  <div className="meds-row">
                    <Pill size={12} className="text-muted" />
                    <span>{cond.currentMedications.join(', ')}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Verified Allergies */}
        <div className="card alert-summary-card">
          <div className="alert-card-header">
            <AlertTriangle size={18} className="text-amber" />
            <h4 className="alert-card-title">Your allergies</h4>
          </div>
          {allergies.length === 0 ? (
            <p className="empty-text">No known allergies.</p>
          ) : (
            <div className="allergies-list">
              {allergies.map((alg) => (
                <div key={alg.id} className="allergy-chip">
                  <div className="row-between">
                    <strong className="text-red">{alg.allergen}</strong>
                    <span className={`badge ${alg.severity === 'SEVERE' ? 'badge-red' : 'badge-yellow'}`}>
                      {alg.severity}
                    </span>
                  </div>
                  <span className="reaction-text">Reaction: {alg.reaction}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Historical Records Timeline Header */}
      <div className="records-header-bar">
        <div>
          <h3 className="section-title">Your Health Records</h3>
          <p className="section-subtitle">
            Your past prescriptions, reports, and visits — saved in one place.
          </p>
        </div>
        <button onClick={onStartTriage} className="btn btn-primary btn-sm">
          <Activity size={16} />
          <span>Check Symptoms</span>
        </button>
      </div>

      {/* Category Filter Pills */}
      <div className="filter-pills-row">
        {(['ALL', 'DIAGNOSIS', 'PRESCRIPTION', 'LAB_REPORT', 'SURGERY'] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`filter-pill ${filter === cat ? 'active' : ''}`}
          >
            {cat.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Records List */}
      <div className="records-feed">
        {filteredRecords.length === 0 ? (
          <div className="card empty-records-card">
            <FileText size={32} className="text-muted" />
            <p>No records in this category.</p>
          </div>
        ) : (
          filteredRecords.map((record) => (
            <div key={record.id} className="card record-card">
              <div className="record-top-row">
                <span className="record-cat-badge">{record.category.replace('_', ' ')}</span>
                <span className="record-date">
                  <Calendar size={13} /> {record.date}
                </span>
              </div>

              <h4 className="record-title">{record.title}</h4>

              <div className="facility-meta">
                <span className="meta-item">
                  <Building2 size={13} className="text-muted" /> {record.facilityName}
                </span>
                <span className="meta-item">
                  <User size={13} className="text-muted" /> {record.doctorName}
                </span>
              </div>

              <p className="record-details">{record.details}</p>

              {record.criticalFlags && record.criticalFlags.length > 0 && (
                <div className="critical-flags-row">
                  {record.criticalFlags.map((flag, idx) => (
                    <span key={idx} className="flag-tag">
                      <AlertTriangle size={11} /> {flag}
                    </span>
                  ))}
                </div>
              )}

              {record.attachments && (
                <div className="attachments-row">
                  {record.attachments.map((att, idx) => (
                    <div key={idx} className="attachment-chip">
                      <Paperclip size={12} className="text-teal" />
                      <span>{att.name}</span>
                      <span className="text-muted">({att.size})</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <style>{`
        .health-records-wrapper {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .summary-alert-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.25rem;
        }
        .alert-summary-card {
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
        }
        .alert-card-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .alert-card-title {
          font-size: 1.05rem;
          font-weight: 700;
        }
        .empty-text {
          font-size: 0.82rem;
          color: var(--text-muted);
        }
        .conditions-list, .allergies-list {
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
        }
        .condition-chip, .allergy-chip {
          background: var(--bg-surface-2);
          border: 1px solid var(--border-subtle);
          padding: 0.75rem;
          border-radius: var(--radius-sm);
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }
        .condition-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.9rem;
        }
        .since-tag {
          font-size: 0.72rem;
          color: var(--brand-accent);
          background: rgba(14, 165, 233, 0.1);
          padding: 2px 6px;
          border-radius: var(--radius-xs);
        }
        .note-text {
          font-size: 0.78rem;
          color: #fbbf24;
        }
        .meds-row {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.75rem;
          color: var(--text-secondary);
        }
        .reaction-text {
          font-size: 0.78rem;
          color: var(--text-secondary);
        }
        .records-header-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 1rem;
        }
        .section-title {
          font-size: 1.35rem;
        }
        .section-subtitle {
          font-size: 0.82rem;
          color: var(--text-muted);
        }
        .filter-pills-row {
          display: flex;
          gap: 0.5rem;
          overflow-x: auto;
          padding-bottom: 4px;
        }
        .filter-pill {
          padding: 0.4rem 0.85rem;
          border-radius: var(--radius-full);
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-muted);
          background: var(--bg-surface-2);
          border: 1px solid var(--border-subtle);
          transition: all var(--transition-fast);
          white-space: nowrap;
        }
        .filter-pill.active {
          background: rgba(14, 165, 233, 0.15);
          border-color: var(--brand-primary);
          color: var(--brand-accent);
        }
        .records-feed {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .record-card {
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
          border-left: 3px solid var(--brand-primary);
        }
        .record-top-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .record-cat-badge {
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.04em;
          color: var(--brand-accent);
          background: rgba(14, 165, 233, 0.1);
          padding: 2px 8px;
          border-radius: var(--radius-xs);
        }
        .record-date {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.75rem;
          color: var(--text-muted);
        }
        .record-title {
          font-size: 1.1rem;
          color: #ffffff;
        }
        .facility-meta {
          display: flex;
          gap: 1rem;
          font-size: 0.8rem;
          color: var(--text-secondary);
          flex-wrap: wrap;
        }
        .meta-item {
          display: flex;
          align-items: center;
          gap: 5px;
        }
        .record-details {
          font-size: 0.88rem;
          line-height: 1.5;
          color: var(--text-secondary);
        }
        .critical-flags-row {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        .flag-tag {
          display: flex;
          align-items: center;
          gap: 4px;
          background: rgba(239, 68, 68, 0.12);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #f87171;
          font-size: 0.72rem;
          padding: 2px 8px;
          border-radius: var(--radius-full);
        }
        .attachments-row {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
          padding-top: 0.4rem;
          border-top: 1px solid var(--border-subtle);
        }
        .attachment-chip {
          display: flex;
          align-items: center;
          gap: 5px;
          background: var(--bg-surface-2);
          padding: 4px 10px;
          border-radius: var(--radius-xs);
          font-size: 0.72rem;
        }
        .empty-records-card {
          text-align: center;
          padding: 3rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
        }
        @media (max-width: 768px) {
          .summary-alert-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};
