import React from 'react';
import {
  Stethoscope,
  Activity,
  HeartPulse,
  History,
  FileText,
  Clock,
  ArrowRight,
  PhoneCall,
  Sparkles,
} from 'lucide-react';
import {
  AbhaProfile,
  HealthRecord,
  ChronicCondition,
  Allergy,
  ConsultationRequest,
} from '../../types';
import { AbhaCard } from '../profile/AbhaCard';
import { ActiveConsultationCard } from '../consultation/ActiveConsultationCard';

interface UserDashboardProps {
  profile: AbhaProfile;
  records: HealthRecord[];
  conditions: ChronicCondition[];
  allergies: Allergy[];
  activeConsultation: ConsultationRequest | null;
  onStartNewConsultation: () => void;
  onOpenTracker: () => void;
  onOpenRecords: () => void;
  onOpenHistory: () => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({
  profile,
  records,
  conditions,
  allergies,
  activeConsultation,
  onStartNewConsultation,
  onOpenTracker,
  onOpenRecords,
  onOpenHistory,
}) => {
  return (
    <div className="dashboard-grid-layout animate-fade-in">
      {/* Active Consultation Hero Card (If Consultation is In Progress) */}
      {activeConsultation && (
        <div className="full-width-col">
          <ActiveConsultationCard
            consultation={activeConsultation}
            onOpenTracker={onOpenTracker}
          />
        </div>
      )}

      {/* Hero Welcome Action Banner */}
      <div className="full-width-col">
        <div className="card hero-start-card">
          <div className="hero-content">
            <div className="hero-tag">
              <Sparkles size={14} className="text-amber" />
              <span>YOUR HEALTH PARTNER</span>
            </div>
            <h1 className="hero-title">How are you feeling today, {profile.fullName.split(' ')[0]}?</h1>
            <p className="hero-desc">
              Tell us what is troubling you. We will check your symptoms and help you get the right care.
            </p>
            <div className="hero-btn-row">
              <button onClick={onStartNewConsultation} className="btn btn-primary btn-lg start-triage-hero-btn">
                <Stethoscope size={20} />
                <span>Check My Symptoms</span>
                <ArrowRight size={18} />
              </button>
              <a href="tel:108" className="btn btn-secondary btn-lg emergency-tel-btn">
                <PhoneCall size={18} className="text-red" />
                <span>Emergency Ambulance (108)</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Two-Column Grid */}
      <div className="dashboard-col-left">
        {/* Digital ABHA Card */}
        <AbhaCard profile={profile} />

        {/* Health Summary Metric Cards */}
        <div className="card metrics-card">
          <div className="metrics-header">
            <Activity size={18} className="text-teal" />
            <h3 className="card-title">Your Health at a Glance</h3>
          </div>
          <div className="metrics-grid">
            <div className="metric-box">
              <span className="metric-num text-teal">{records.length}</span>
              <span className="metric-label">Health Records</span>
            </div>
            <div className="metric-box">
              <span className="metric-num text-amber">{conditions.length}</span>
              <span className="metric-label">Long-Term Conditions</span>
            </div>
            <div className="metric-box">
              <span className="metric-num text-red">{allergies.length}</span>
              <span className="metric-label">Allergies</span>
            </div>
          </div>

          {/* Quick List of Chronic Vulnerabilities */}
          {conditions.length > 0 && (
            <div className="conditions-summary-box">
              <span className="box-label">Your health conditions:</span>
              <div className="conditions-tags">
                {conditions.map((c) => (
                  <span key={c.id} className="badge badge-yellow">
                    {c.condition}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="dashboard-col-right">
        {/* Quick Navigation Cards */}
        <div className="quick-actions-grid">
          <div
            onClick={onStartNewConsultation}
            className="card action-nav-card card-interactive"
          >
            <div className="action-icon-circle icon-teal">
              <Stethoscope size={22} />
            </div>
            <div className="action-info">
              <h4>Check Your Symptoms</h4>
              <p>Tell us what is wrong. We will suggest the right care.</p>
            </div>
            <ArrowRight size={18} className="text-muted action-arrow" />
          </div>

          <div
            onClick={onOpenRecords}
            className="card action-nav-card card-interactive"
          >
            <div className="action-icon-circle icon-blue">
              <FileText size={22} />
            </div>
            <div className="action-info">
              <h4>Your Health Records</h4>
              <p>See your past prescriptions, reports, and history.</p>
            </div>
            <ArrowRight size={18} className="text-muted action-arrow" />
          </div>

          <div
            onClick={onOpenHistory}
            className="card action-nav-card card-interactive"
          >
            <div className="action-icon-circle icon-amber">
              <History size={22} />
            </div>
            <div className="action-info">
              <h4>Hospital Passes</h4>
              <p>Your past check-in PINs and QR passes.</p>
            </div>
            <ArrowRight size={18} className="text-muted action-arrow" />
          </div>

          {activeConsultation && (
            <div
              onClick={onOpenTracker}
              className="card action-nav-card card-interactive tracker-quick-nav"
            >
              <div className="action-icon-circle icon-emerald">
                <Clock size={22} />
              </div>
              <div className="action-info">
                <h4>My Visit Status</h4>
                <p>See what is happening with your visit.</p>
              </div>
              <ArrowRight size={18} className="text-muted action-arrow" />
            </div>
          )}
        </div>

        {/* Recent Past Health Record Snippet */}
        <div className="card recent-record-card">
          <div className="recent-record-header">
            <HeartPulse size={18} className="text-teal" />
            <h4 className="card-title">Latest Record</h4>
            <button onClick={onOpenRecords} className="btn-link-sm">
              View All ({records.length})
            </button>
          </div>

          {records.length > 0 ? (
            <div className="snippet-body">
              <span className="badge badge-info">{records[0].category.replace('_', ' ')}</span>
              <h5 className="snippet-title">{records[0].title}</h5>
              <p className="snippet-facility">{records[0].facilityName} • {records[0].date}</p>
              <p className="snippet-details">{records[0].details}</p>
            </div>
          ) : (
            <p className="text-muted text-sm">No records yet.</p>
          )}
        </div>
      </div>

      <style>{`
        .dashboard-grid-layout {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
          padding-bottom: 2rem;
        }
        .full-width-col {
          grid-column: 1 / -1;
        }
        .dashboard-col-left {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .dashboard-col-right {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .hero-start-card {
          background: linear-gradient(135deg, rgba(14, 165, 233, 0.15) 0%, rgba(6, 182, 212, 0.08) 50%, rgba(15, 23, 42, 0.95) 100%);
          border: 1px solid rgba(14, 165, 233, 0.35);
          padding: 2.25rem;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4), 0 0 30px rgba(14, 165, 233, 0.1);
        }
        .hero-content {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          max-width: 860px;
        }
        .hero-tag {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 0.72rem;
          font-weight: 700;
          color: var(--brand-accent);
          letter-spacing: 0.08em;
          background: rgba(14, 165, 233, 0.15);
          padding: 4px 10px;
          border-radius: var(--radius-full);
          width: fit-content;
        }
        .hero-title {
          font-size: 2rem;
          color: #ffffff;
          line-height: 1.2;
        }
        .hero-desc {
          font-size: 0.95rem;
          line-height: 1.55;
          color: var(--text-secondary);
        }
        .hero-btn-row {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
          margin-top: 0.5rem;
        }
        .start-triage-hero-btn {
          padding: 0.9rem 2rem;
          font-size: 1.05rem;
        }
        .emergency-tel-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          border-color: rgba(239, 68, 68, 0.4);
        }
        .metrics-card {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        .metrics-header {
          display: flex;
          align-items: center;
          gap: 0.6rem;
        }
        .card-title {
          font-size: 1.15rem;
          color: #ffffff;
        }
        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.75rem;
        }
        .metric-box {
          background: var(--bg-surface-2);
          border: 1px solid var(--border-subtle);
          padding: 0.85rem;
          border-radius: var(--radius-sm);
          text-align: center;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .metric-num {
          font-family: var(--font-display);
          font-size: 1.75rem;
          font-weight: 800;
        }
        .metric-label {
          font-size: 0.7rem;
          color: var(--text-muted);
          text-transform: uppercase;
        }
        .conditions-summary-box {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
          background: rgba(0, 0, 0, 0.2);
          padding: 0.75rem;
          border-radius: var(--radius-sm);
        }
        .box-label {
          font-size: 0.72rem;
          color: var(--text-muted);
          text-transform: uppercase;
        }
        .conditions-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.4rem;
        }
        .quick-actions-grid {
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
        }
        .action-nav-card {
          display: grid;
          grid-template-columns: auto 1fr auto;
          align-items: center;
          gap: 1rem;
          padding: 1.1rem 1.25rem;
          cursor: pointer;
        }
        .action-icon-circle {
          width: 44px;
          height: 44px;
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .icon-teal {
          background: rgba(14, 165, 233, 0.15);
          color: #38bdf8;
        }
        .icon-blue {
          background: rgba(37, 99, 235, 0.15);
          color: #60a5fa;
        }
        .icon-amber {
          background: rgba(245, 158, 11, 0.15);
          color: #fbbf24;
        }
        .icon-emerald {
          background: rgba(16, 185, 129, 0.15);
          color: #34d399;
        }
        .action-info h4 {
          font-size: 1rem;
          color: #ffffff;
        }
        .action-info p {
          font-size: 0.78rem;
          color: var(--text-secondary);
        }
        .tracker-quick-nav {
          border-color: rgba(16, 185, 129, 0.35);
          background: rgba(16, 185, 129, 0.06);
        }
        .recent-record-card {
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
        }
        .recent-record-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .btn-link-sm {
          font-size: 0.78rem;
          color: var(--brand-accent);
        }
        .btn-link-sm:hover {
          text-decoration: underline;
        }
        .snippet-body {
          background: var(--bg-surface-2);
          border: 1px solid var(--border-subtle);
          padding: 0.85rem;
          border-radius: var(--radius-sm);
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }
        .snippet-title {
          font-size: 0.95rem;
          color: #ffffff;
        }
        .snippet-facility {
          font-size: 0.75rem;
          color: var(--text-muted);
        }
        .snippet-details {
          font-size: 0.8rem;
          color: var(--text-secondary);
          line-height: 1.4;
        }
        @media (max-width: 960px) {
          .dashboard-grid-layout {
            grid-template-columns: 1fr;
          }
          .hero-title {
            font-size: 1.6rem;
          }
        }
      `}</style>
    </div>
  );
};
