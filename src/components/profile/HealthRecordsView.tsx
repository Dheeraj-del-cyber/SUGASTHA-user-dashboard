import React, { useState } from 'react';
import {
  ShieldCheck,
  Heart,
  Thermometer,
  Weight,
  Activity,
  Droplet,
  AlertTriangle,
  Pill,
  FileText,
  Building2,
  User as UserIcon,
  Paperclip,
  ChevronDown,
  ChevronUp,
  Stethoscope,
  Clock,
  Eye,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  FlaskConical,
} from 'lucide-react';
import { AbhaProfile, HealthRecord, ChronicCondition, Allergy } from '../../types';
import { StatusBadge } from '../common/StatusBadge';

interface HealthRecordsViewProps {
  profile?: AbhaProfile | null;
  records: HealthRecord[];
  conditions: ChronicCondition[];
  allergies: Allergy[];
  onStartTriage: () => void;
}

export const HealthRecordsView: React.FC<HealthRecordsViewProps> = ({
  profile,
  records,
  conditions,
  allergies,
  onStartTriage,
}) => {
  // Category filter state for timeline view
  const [activeCategory, setActiveCategory] = useState<
    'ALL' | 'DIAGNOSIS' | 'PRESCRIPTION' | 'LAB_REPORT' | 'SURGERY'
  >('ALL');

  // Expanded card tracking states
  const [expandedRecordIds, setExpandedRecordIds] = useState<Record<string, boolean>>({});
  const [expandedConditionIds, setExpandedConditionIds] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'TIMELINE' | 'MEDS' | 'REPORTS' | 'DOCS'>('OVERVIEW');

  const toggleExpandRecord = (id: string) => {
    setExpandedRecordIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleExpandCondition = (id: string) => {
    setExpandedConditionIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Filter records
  const filteredRecords =
    activeCategory === 'ALL'
      ? records
      : records.filter((r) => r.category === activeCategory);

  // Derived patient details
  const patientName = profile?.fullName || 'Rajesh Kumar Verma';
  const abhaNumber = profile?.abhaNumber || '91-4523-8901-2345';
  const abhaAddress = profile?.abhaAddress || 'rajesh.verma@abdm';
  const bloodGroup = profile?.bloodGroup || 'B+';
  const lastVisitDate = records.length > 0 ? records[0].date : '20 Jun 2026';

  // Derived Prescriptions List from conditions & records
  const prescriptions = [
    {
      id: 'med-1',
      name: 'Metformin 500mg',
      dosage: '1 tablet',
      frequency: 'Twice daily (BID)',
      duration: 'Ongoing',
      purpose: 'Type 2 Diabetes Control',
      status: 'Active',
      prescribedBy: 'Dr. Anandita Roy',
    },
    {
      id: 'med-2',
      name: 'Telmisartan 40mg',
      dosage: '1 tablet',
      frequency: 'Once daily morning (OD)',
      duration: 'Ongoing',
      purpose: 'Hypertension Management',
      status: 'Active',
      prescribedBy: 'Dr. Vikram Malhotra',
    },
    {
      id: 'med-3',
      name: 'Glimepiride 1mg',
      dosage: '1 tablet',
      frequency: 'Once daily morning (OD)',
      duration: 'Ongoing',
      purpose: 'Blood Sugar Regulation',
      status: 'Active',
      prescribedBy: 'Dr. Anandita Roy',
    },
  ];

  // Derived Vitals Data
  const vitalsData = [
    {
      id: 'vital-bp',
      label: 'Blood Pressure',
      value: '138/88',
      unit: 'mmHg',
      status: 'Managed',
      variant: 'MODERATE',
      icon: <Heart size={20} color="#DC2626" />,
      bg: '#FCE1E8',
    },
    {
      id: 'vital-pulse',
      label: 'Heart Rate',
      value: '72',
      unit: 'bpm',
      status: 'Normal',
      variant: 'CONFIRMED',
      icon: <Activity size={20} color="#0EA5E9" />,
      bg: '#DDF4FF',
    },
    {
      id: 'vital-temp',
      label: 'Temperature',
      value: '98.6',
      unit: '°F',
      status: 'Normal',
      variant: 'CONFIRMED',
      icon: <Thermometer size={20} color="#D97706" />,
      bg: '#FFF3C7',
    },
    {
      id: 'vital-weight',
      label: 'Body Weight',
      value: '68',
      unit: 'kg',
      status: 'BMI 23.4',
      variant: 'CONFIRMED',
      icon: <Weight size={20} color="#2E8B57" />,
      bg: '#E8F5E9',
    },
    {
      id: 'vital-spo2',
      label: 'Oxygen SpO2',
      value: '98',
      unit: '%',
      status: 'Normal',
      variant: 'CONFIRMED',
      icon: <Activity size={20} color="#0284C7" />,
      bg: '#BFE9F8',
    },
    {
      id: 'vital-fbs',
      label: 'Blood Glucose (FBS)',
      value: '168',
      unit: 'mg/dL',
      status: 'Needs Attention',
      variant: 'MODERATE',
      icon: <Droplet size={20} color="#B45309" />,
      bg: '#FFF8DD',
    },
  ];

  // Derived Test Reports with structured parameters
  const testReports = [
    {
      id: 'report-102',
      title: 'Comprehensive Metabolic Panel & Lipid Profile',
      date: '12 May 2026',
      facility: 'Dr. Lal PathLabs, Connaught Place',
      doctor: 'Dr. S. K. Gupta (Pathologist)',
      status: 'Needs Attention',
      variant: 'YELLOW',
      parameters: [
        { name: 'Fasting Blood Sugar', value: '168 mg/dL', ref: '70 - 99 mg/dL', flag: 'HIGH' },
        { name: 'HbA1c Glycated Hemoglobin', value: '8.1 %', ref: '< 5.7 %', flag: 'HIGH' },
        { name: 'LDL Cholesterol', value: '142 mg/dL', ref: '< 100 mg/dL', flag: 'ELEVATED' },
        { name: 'Serum Creatinine', value: '1.0 mg/dL', ref: '0.7 - 1.2 mg/dL', flag: 'NORMAL' },
      ],
      attachmentName: 'Lipid_Panel_Report_May2026.pdf',
      attachmentSize: '1.4 MB',
    },
    {
      id: 'report-201',
      title: 'Routine CBC Blood Test & Hemogram',
      date: '15 Jan 2026',
      facility: 'Apollo Diagnostics, Hauz Khas',
      doctor: 'Dr. Reena Joseph (Pathologist)',
      status: 'Normal',
      variant: 'GREEN',
      parameters: [
        { name: 'Hemoglobin', value: '12.8 g/dL', ref: '12.0 - 15.0 g/dL', flag: 'NORMAL' },
        { name: 'Total Leukocyte Count (TLC)', value: '6,400 /uL', ref: '4,000 - 10,000', flag: 'NORMAL' },
        { name: 'Platelets Count', value: '2.4 Lakh /uL', ref: '1.5 - 4.5 Lakh', flag: 'NORMAL' },
      ],
      attachmentName: 'CBC_Report_Jan2026.pdf',
      attachmentSize: '850 KB',
    },
  ];

  // Documents List
  const documentFiles = [
    {
      id: 'doc-1',
      name: 'Lipid_Panel_Report_May2026.pdf',
      type: 'Lab Report',
      date: '12 May 2026',
      size: '1.4 MB',
      category: 'LAB_REPORT',
    },
    {
      id: 'doc-2',
      name: 'AIIMS_Cardio_Prescription_Jun2026.pdf',
      type: 'Prescription',
      date: '20 Jun 2026',
      size: '920 KB',
      category: 'PRESCRIPTION',
    },
    {
      id: 'doc-3',
      name: 'Cholecystectomy_Discharge_Summary.pdf',
      type: 'Discharge Summary',
      date: '15 Aug 2023',
      size: '2.1 MB',
      category: 'SURGERY',
    },
    {
      id: 'doc-4',
      name: 'Resting_ECG_Trace_Jun2026.pdf',
      type: 'ECG Trace',
      date: '20 Jun 2026',
      size: '1.1 MB',
      category: 'DIAGNOSIS',
    },
  ];

  return (
    <div className="health-records-container animate-fade-in">
      {/* HEADER SECTION BAR */}
      <div className="records-top-header">
        <div>
          <div className="top-title-row">
            <h2 className="records-main-title">My Health Records & ABHA Vault</h2>
            <span className="abdm-verified-badge">
              <ShieldCheck size={14} /> ABDM Synced
            </span>
          </div>
          <p className="records-sub-text">
            Unified digital medical summary • Instant scan for patients & attending clinical staff
          </p>
        </div>

        <button onClick={onStartTriage} className="btn btn-primary btn-sm check-symp-btn">
          <Stethoscope size={16} />
          <span>Check My Symptoms</span>
        </button>
      </div>

      {/* 1. HEALTH SUMMARY DASHBOARD (Compact Patient Cards Grid) */}
      <div className="health-summary-dashboard">
        <div className="summary-patient-card">
          <div className="patient-avatar-box">
            {patientName.substring(0, 1)}
          </div>
          <div className="patient-details-col">
            <div className="patient-name-row">
              <h3 className="patient-name-text">{patientName}</h3>
              <span className="blood-type-badge">🩸 {bloodGroup}</span>
            </div>
            <div className="patient-meta-row">
              <span>ABHA ID: <strong>{abhaNumber}</strong></span>
              <span className="dot-sep">•</span>
              <span>{abhaAddress}</span>
            </div>
          </div>
        </div>

        <div className="summary-stats-grid">
          <div className="stat-card blue-tint">
            <span className="stat-label">Last Consultation</span>
            <strong className="stat-value">{lastVisitDate}</strong>
            <span className="stat-sub">AIIMS New Delhi</span>
          </div>

          <div className="stat-card green-tint">
            <span className="stat-label">Chronic Conditions</span>
            <strong className="stat-value">{conditions.length} Active</strong>
            <span className="stat-sub">Diabetes & Hypertension</span>
          </div>

          <div className="stat-card pink-tint">
            <span className="stat-label">Drug Allergies</span>
            <strong className="stat-value text-red">{allergies.length} Verified</strong>
            <span className="stat-sub">Penicillin & Sulfa</span>
          </div>

          <div className="stat-card yellow-tint">
            <span className="stat-label">Active Medications</span>
            <strong className="stat-value text-amber">{prescriptions.length} Meds</strong>
            <span className="stat-sub">Daily Prescriptions</span>
          </div>
        </div>
      </div>

      {/* VIEW SUB-NAVIGATION TABS */}
      <div className="records-sub-nav">
        <button
          onClick={() => setActiveTab('OVERVIEW')}
          className={`records-tab-btn ${activeTab === 'OVERVIEW' ? 'active' : ''}`}
        >
          Overview & Vitals
        </button>
        <button
          onClick={() => setActiveTab('TIMELINE')}
          className={`records-tab-btn ${activeTab === 'TIMELINE' ? 'active' : ''}`}
        >
          Consultation Timeline ({records.length})
        </button>
        <button
          onClick={() => setActiveTab('MEDS')}
          className={`records-tab-btn ${activeTab === 'MEDS' ? 'active' : ''}`}
        >
          Medications ({prescriptions.length})
        </button>
        <button
          onClick={() => setActiveTab('REPORTS')}
          className={`records-tab-btn ${activeTab === 'REPORTS' ? 'active' : ''}`}
        >
          Test Reports ({testReports.length})
        </button>
        <button
          onClick={() => setActiveTab('DOCS')}
          className={`records-tab-btn ${activeTab === 'DOCS' ? 'active' : ''}`}
        >
          Documents Vault ({documentFiles.length})
        </button>
      </div>

      {/* SECTION CONTENT BASED ON ACTIVE TAB OR OVERVIEW */}

      {/* 6. VITALS SUMMARY GRID & 7. ALLERGIES (Visible on OVERVIEW tab) */}
      {(activeTab === 'OVERVIEW' || activeTab === 'TIMELINE') && (
        <div className="overview-vitals-section">
          <div className="section-title-line">
            <Activity size={18} className="text-teal" />
            <h3>6. Current Clinical Vitals</h3>
            <span className="update-tag">Recorded at last visit</span>
          </div>

          <div className="vitals-grid">
            {vitalsData.map((v) => (
              <div key={v.id} className="vital-card" style={{ backgroundColor: v.bg }}>
                <div className="vital-card-top">
                  <div className="vital-icon-box">{v.icon}</div>
                  <StatusBadge status={v.variant} label={v.status} size="sm" />
                </div>
                <div className="vital-card-body">
                  <span className="vital-label">{v.label}</span>
                  <div className="vital-value-row">
                    <span className="vital-num">{v.value}</span>
                    <span className="vital-unit">{v.unit}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. ALLERGIES & IMPORTANT WARNINGS */}
      {(activeTab === 'OVERVIEW' || activeTab === 'MEDS') && (
        <div className="allergies-warning-container">
          <div className="warning-card-header">
            <AlertTriangle size={20} className="text-red" />
            <div>
              <h3 className="warning-title">7. Allergies & Critical Medical Flags</h3>
              <p className="warning-subtitle">Safety alerts for prescribing physicians & pharmacists</p>
            </div>
          </div>

          <div className="allergies-grid">
            {/* Allergies list */}
            {allergies.map((alg) => (
              <div key={alg.id} className="allergy-item-card">
                <div className="allergy-top-line">
                  <strong className="allergen-name">{alg.allergen}</strong>
                  <span className={`severity-badge ${alg.severity.toLowerCase()}`}>
                    {alg.severity}
                  </span>
                </div>
                <p className="reaction-desc"><strong>Reaction:</strong> {alg.reaction}</p>
              </div>
            ))}

            {/* Critical Clinical Flags */}
            <div className="critical-warning-box">
              <span className="box-tag">⚠️ Critical Flags from ABHA History</span>
              <ul className="critical-flags-list">
                <li>Elevated cardiovascular risk profile (Sinus tachycardia + metabolic risk)</li>
                <li>Suboptimal glycemic control (HbA1c 8.1% requiring dose monitoring)</li>
                <li>Post-laparoscopic cholecystectomy (Aug 2023)</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* 2. MEDICAL HISTORY (Chronic & Past Conditions) */}
      {(activeTab === 'OVERVIEW' || activeTab === 'TIMELINE') && (
        <div className="medical-history-section">
          <div className="section-title-line">
            <Heart size={18} className="text-teal" />
            <h3>2. Medical History & Chronic Conditions</h3>
          </div>

          <div className="history-cards-grid">
            {conditions.map((cond) => {
              const isExpanded = !!expandedConditionIds[cond.id];
              return (
                <div key={cond.id} className="condition-history-card">
                  <div className="cond-card-header">
                    <div className="cond-title-group">
                      <Stethoscope size={18} className="text-teal" />
                      <div>
                        <h4 className="cond-name">{cond.condition}</h4>
                        <span className="diagnosed-date">📅 Diagnosed: {cond.diagnosedYear}</span>
                      </div>
                    </div>
                    <StatusBadge status={cond.status} size="sm" />
                  </div>

                  <div className="cond-card-body">
                    <div className="cond-detail-chip">
                      <Pill size={14} className="text-muted" />
                      <span><strong>Medications:</strong> {cond.currentMedications.join(', ')}</span>
                    </div>

                    {cond.severityNote && (
                      <div className="severity-note-bar">
                        📌 {cond.severityNote}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => toggleExpandCondition(cond.id)}
                    className="expand-card-btn"
                  >
                    <span>{isExpanded ? 'Hide Details' : 'View Details'}</span>
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>

                  {isExpanded && (
                    <div className="cond-expanded-content animate-fade-in">
                      <p className="expanded-desc">
                        Registered under ABDM Chronic Care Management program. Patient is receiving regular OPD follow-up and monitoring at government specialty centers.
                      </p>
                      <div className="expanded-meta-grid">
                        <div>
                          <span className="meta-lbl">Monitoring Protocol</span>
                          <strong>Quarterly OPD & HbA1c</strong>
                        </div>
                        <div>
                          <span className="meta-lbl">Care Coordinator</span>
                          <strong>AIIMS Diabetes Clinic</strong>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. PRESCRIPTIONS / MEDICATIONS SECTION */}
      {(activeTab === 'OVERVIEW' || activeTab === 'MEDS') && (
        <div className="medications-section">
          <div className="section-title-line">
            <Pill size={18} className="text-teal" />
            <h3>4. Prescriptions & Active Medications</h3>
          </div>

          <div className="meds-cards-grid">
            {prescriptions.map((med) => (
              <div key={med.id} className="med-card">
                <div className="med-card-top">
                  <div className="med-name-icon">
                    <div className="pill-icon-circle">💊</div>
                    <div>
                      <h4 className="med-title">{med.name}</h4>
                      <span className="med-purpose">{med.purpose}</span>
                    </div>
                  </div>
                  <StatusBadge status={med.status} size="sm" />
                </div>

                <div className="med-structured-grid">
                  <div className="struct-item">
                    <span className="struct-lbl">Dosage</span>
                    <strong className="struct-val">{med.dosage}</strong>
                  </div>
                  <div className="struct-item">
                    <span className="struct-lbl">Frequency</span>
                    <strong className="struct-val">{med.frequency}</strong>
                  </div>
                  <div className="struct-item">
                    <span className="struct-lbl">Duration</span>
                    <strong className="struct-val">{med.duration}</strong>
                  </div>
                </div>

                <div className="med-card-footer">
                  <span className="doctor-prescribed">Prescribed by {med.prescribedBy}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. TEST REPORTS SECTION */}
      {(activeTab === 'OVERVIEW' || activeTab === 'REPORTS') && (
        <div className="reports-section">
          <div className="section-title-line">
            <FlaskConical size={18} className="text-teal" />
            <h3>5. Test Reports & Diagnostic Investigations</h3>
          </div>

          <div className="reports-list-cards">
            {testReports.map((report) => {
              const isExpanded = !!expandedRecordIds[report.id];
              return (
                <div key={report.id} className="report-card">
                  <div className="report-card-header">
                    <div className="report-title-group">
                      <div className="test-icon-box">🧪</div>
                      <div>
                        <h4 className="report-title">{report.title}</h4>
                        <div className="report-meta-line">
                          <span>📅 {report.date}</span>
                          <span className="dot-sep">•</span>
                          <span>{report.facility}</span>
                        </div>
                      </div>
                    </div>
                    <StatusBadge status={report.variant} label={report.status} size="md" />
                  </div>

                  {/* Structured Parameters Mini-Table */}
                  <div className="report-parameters-table">
                    <div className="param-header-row">
                      <span>Test Parameter</span>
                      <span>Measured Result</span>
                      <span>Biological Reference</span>
                      <span>Status</span>
                    </div>
                    {report.parameters.map((param, idx) => (
                      <div key={idx} className="param-data-row">
                        <span className="param-name">{param.name}</span>
                        <strong className={`param-val ${param.flag !== 'NORMAL' ? 'val-flagged' : ''}`}>
                          {param.value}
                        </strong>
                        <span className="param-ref">{param.ref}</span>
                        <span className={`param-flag-badge ${param.flag.toLowerCase()}`}>
                          {param.flag}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="report-card-actions">
                    <button
                      onClick={() => toggleExpandRecord(report.id)}
                      className="btn btn-secondary btn-sm"
                    >
                      <Eye size={14} />
                      <span>{isExpanded ? 'Collapse Report' : 'View Full Details'}</span>
                    </button>

                    {report.attachmentName && (
                      <div className="report-attachment-chip">
                        <Paperclip size={13} className="text-teal" />
                        <span>{report.attachmentName}</span>
                        <span className="att-size">({report.attachmentSize})</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. CONSULTATION HISTORY (Timeline View) */}
      {(activeTab === 'OVERVIEW' || activeTab === 'TIMELINE') && (
        <div className="consultation-timeline-section">
          <div className="section-title-line">
            <Clock size={18} className="text-teal" />
            <h3>3. Consultation History & Visit Records</h3>

            {/* Category Filter Pills inside Timeline */}
            <div className="filter-pills-row">
              {(['ALL', 'DIAGNOSIS', 'PRESCRIPTION', 'LAB_REPORT', 'SURGERY'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`filter-pill ${activeCategory === cat ? 'active' : ''}`}
                >
                  {cat.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          <div className="timeline-container">
            {filteredRecords.map((record) => {
              const isExpanded = !!expandedRecordIds[record.id];
              return (
                <div key={record.id} className="timeline-item">
                  <div className="timeline-marker">
                    <div className="marker-dot"></div>
                    <div className="marker-line"></div>
                  </div>

                  <div className="timeline-card">
                    <div className="timeline-card-header">
                      <div className="tl-left">
                        <span className="record-cat-tag">{record.category.replace('_', ' ')}</span>
                        <span className="tl-date">📅 {record.date}</span>
                      </div>
                      <StatusBadge status="COMPLETED" size="sm" />
                    </div>

                    <h4 className="tl-title">{record.title}</h4>

                    <div className="tl-meta-grid">
                      <div className="tl-meta-item">
                        <UserIcon size={13} className="meta-icon" />
                        <span>{record.doctorName}</span>
                      </div>
                      <div className="tl-meta-item">
                        <Building2 size={13} className="meta-icon" />
                        <span>{record.facilityName}</span>
                      </div>
                    </div>

                    {/* Summary snippet */}
                    <p className="tl-snippet-text">{record.details}</p>

                    {record.criticalFlags && record.criticalFlags.length > 0 && (
                      <div className="tl-flags-row">
                        {record.criticalFlags.map((flag, idx) => (
                          <span key={idx} className="tl-flag-pill">
                            <AlertCircle size={12} /> {flag}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="tl-card-actions">
                      <button
                        onClick={() => toggleExpandRecord(record.id)}
                        className="btn btn-secondary btn-sm"
                      >
                        <FileText size={13} />
                        <span>{isExpanded ? 'Hide Full Record' : 'View Record'}</span>
                      </button>

                      {record.attachments && (
                        <div className="attachment-group">
                          {record.attachments.map((att, idx) => (
                            <span key={idx} className="att-pill">
                              <Paperclip size={12} /> {att.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {isExpanded && (
                      <div className="tl-expanded-details animate-fade-in">
                        <div className="expanded-box">
                          <h5>Detailed Clinical Impression & Advice</h5>
                          <p>{record.details}</p>
                          <div className="fhir-bundle-sync">
                            <CheckCircle2 size={14} className="text-green" />
                            <span>Verified FHIR R4 Bundle synced with ABDM Health Repository</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 8. DOCUMENTS VAULT */}
      {(activeTab === 'OVERVIEW' || activeTab === 'DOCS') && (
        <div className="documents-vault-section">
          <div className="section-title-line">
            <FileCheck size={18} className="text-teal" />
            <h3>8. Digital Health Documents & Attachments</h3>
          </div>

          <div className="documents-grid">
            {documentFiles.map((doc) => (
              <div key={doc.id} className="doc-vault-card">
                <div className="doc-icon-wrapper">📄</div>
                <div className="doc-info-col">
                  <h4 className="doc-file-name">{doc.name}</h4>
                  <div className="doc-meta-row">
                    <span className="doc-type-badge">{doc.type}</span>
                    <span className="dot-sep">•</span>
                    <span>{doc.date}</span>
                    <span className="dot-sep">•</span>
                    <span>{doc.size}</span>
                  </div>
                </div>
                <button
                  onClick={() => alert(`Opening document: ${doc.name}`)}
                  className="btn btn-outline btn-sm doc-view-btn"
                >
                  View
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`
        .health-records-container {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          padding-bottom: 2.5rem;
          width: 100%;
        }
        .records-top-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 1rem;
          background: var(--white);
          border: 1px solid var(--border-light);
          border-radius: var(--radius-lg);
          padding: 1.25rem 1.5rem;
          box-shadow: var(--shadow-sm);
        }
        .top-title-row {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .records-main-title {
          font-size: 1.4rem;
          font-weight: 800;
          color: var(--dark-navy-text);
        }
        .abdm-verified-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: #E8F5E9;
          color: #2E8B57;
          border: 1px solid #A5D6A7;
          font-size: 0.72rem;
          font-weight: 700;
          padding: 3px 10px;
          border-radius: var(--radius-full);
        }
        .records-sub-text {
          font-size: 0.85rem;
          color: var(--text-muted);
          margin-top: 2px;
        }

        /* 1. HEALTH SUMMARY DASHBOARD */
        .health-summary-dashboard {
          display: grid;
          grid-template-columns: 1fr 2fr;
          gap: 1.25rem;
        }
        .summary-patient-card {
          background: var(--pastel-light-blue);
          border: 1px solid var(--pastel-sky-blue);
          border-radius: var(--radius-lg);
          padding: 1.25rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          box-shadow: var(--shadow-sm);
        }
        .patient-avatar-box {
          width: 54px;
          height: 54px;
          border-radius: 50%;
          background: var(--brand-primary);
          color: var(--white);
          font-family: var(--font-display);
          font-weight: 800;
          font-size: 1.4rem;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 4px 12px rgba(2, 132, 199, 0.2);
        }
        .patient-details-col {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .patient-name-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .patient-name-text {
          font-size: 1.2rem;
          font-weight: 800;
          color: var(--dark-navy-text);
        }
        .blood-type-badge {
          background: var(--white);
          color: #DC2626;
          font-size: 0.72rem;
          font-weight: 800;
          padding: 2px 8px;
          border-radius: var(--radius-full);
          border: 1px solid #FCA5A5;
        }
        .patient-meta-row {
          font-size: 0.8rem;
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .dot-sep {
          color: var(--text-muted);
        }

        .summary-stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0.85rem;
        }
        .stat-card {
          border-radius: var(--radius-md);
          padding: 0.85rem 1rem;
          display: flex;
          flex-direction: column;
          gap: 2px;
          border: 1px solid var(--border-light);
          background: var(--white);
          box-shadow: var(--shadow-sm);
        }
        .stat-card.blue-tint { background: var(--pastel-light-blue); border-color: var(--pastel-sky-blue); }
        .stat-card.green-tint { background: #E8F5E9; border-color: #A5D6A7; }
        .stat-card.pink-tint { background: var(--pastel-soft-pink); border-color: #FCA5A5; }
        .stat-card.yellow-tint { background: var(--pastel-cream-yellow); border-color: #FDE68A; }

        .stat-label {
          font-size: 0.7rem;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
        }
        .stat-value {
          font-family: var(--font-display);
          font-size: 1.15rem;
          font-weight: 800;
          color: var(--dark-navy-text);
        }
        .stat-sub {
          font-size: 0.72rem;
          color: var(--text-secondary);
        }

        /* SUB NAV TABS */
        .records-sub-nav {
          display: flex;
          gap: 0.5rem;
          border-bottom: 1.5px solid var(--border-light);
          padding-bottom: 0.5rem;
          overflow-x: auto;
        }
        .records-tab-btn {
          padding: 0.5rem 1rem;
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-muted);
          border-radius: var(--radius-full);
          transition: all var(--transition-fast);
          white-space: nowrap;
        }
        .records-tab-btn:hover {
          color: var(--dark-navy-text);
          background: var(--pastel-light-blue);
        }
        .records-tab-btn.active {
          color: var(--brand-primary);
          background: var(--pastel-light-blue);
          border: 1px solid var(--pastel-sky-blue);
        }

        .filter-pills-row {
          display: flex;
          gap: 0.35rem;
          margin-left: auto;
        }
        .filter-pill {
          padding: 0.25rem 0.65rem;
          border-radius: var(--radius-full);
          font-size: 0.7rem;
          font-weight: 700;
          color: var(--text-muted);
          background: var(--bg-app);
          border: 1px solid var(--border-light);
          white-space: nowrap;
        }
        .filter-pill.active {
          background: var(--pastel-light-blue);
          border-color: var(--pastel-sky-blue);
          color: var(--brand-primary);
        }

        /* SECTION TITLE LINE */
        .section-title-line {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1rem;
          flex-wrap: wrap;
        }
        .section-title-line h3 {
          font-size: 1.2rem;
          font-weight: 700;
          color: var(--dark-navy-text);
        }
        .update-tag {
          font-size: 0.72rem;
          color: var(--text-muted);
          background: var(--white);
          padding: 2px 8px;
          border-radius: var(--radius-full);
          border: 1px solid var(--border-light);
        }

        /* 6. VITALS GRID */
        .overview-vitals-section {
          display: flex;
          flex-direction: column;
        }
        .vitals-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
          gap: 0.85rem;
        }
        .vital-card {
          border-radius: var(--radius-lg);
          border: 1px solid rgba(23, 32, 42, 0.08);
          padding: 1rem;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          gap: 0.75rem;
          box-shadow: var(--shadow-sm);
        }
        .vital-card-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .vital-icon-box {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: var(--white);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 6px rgba(0,0,0,0.05);
        }
        .vital-card-body {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .vital-label {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-muted);
        }
        .vital-value-row {
          display: flex;
          align-items: baseline;
          gap: 4px;
        }
        .vital-num {
          font-family: var(--font-display);
          font-size: 1.5rem;
          font-weight: 800;
          color: var(--dark-navy-text);
        }
        .vital-unit {
          font-size: 0.78rem;
          color: var(--text-muted);
        }

        /* 7. ALLERGIES & WARNINGS */
        .allergies-warning-container {
          background: var(--pastel-soft-pink);
          border: 1.5px solid #FCA5A5;
          border-radius: var(--radius-lg);
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          box-shadow: var(--shadow-sm);
        }
        .warning-card-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .warning-title {
          font-size: 1.15rem;
          font-weight: 800;
          color: #991B1B;
        }
        .warning-subtitle {
          font-size: 0.78rem;
          color: #B91C1C;
        }
        .allergies-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 0.85rem;
        }
        .allergy-item-card {
          background: var(--white);
          border: 1px solid #FCA5A5;
          border-radius: var(--radius-md);
          padding: 0.85rem;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .allergy-top-line {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .allergen-name {
          font-size: 0.95rem;
          color: #991B1B;
        }
        .severity-badge {
          font-size: 0.68rem;
          font-weight: 800;
          padding: 2px 8px;
          border-radius: var(--radius-full);
          text-transform: uppercase;
        }
        .severity-badge.severe { background: #FEE2E2; color: #DC2626; border: 1px solid #FCA5A5; }
        .severity-badge.moderate { background: #FEF3C7; color: #B45309; border: 1px solid #FDE68A; }
        .reaction-desc {
          font-size: 0.8rem;
          color: var(--dark-navy-text);
        }
        .critical-warning-box {
          background: var(--white);
          border: 1px solid #FCA5A5;
          border-radius: var(--radius-md);
          padding: 0.85rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .box-tag {
          font-size: 0.75rem;
          font-weight: 800;
          color: #DC2626;
        }
        .critical-flags-list {
          padding-left: 1.2rem;
          font-size: 0.8rem;
          color: var(--dark-navy-text);
          line-height: 1.4;
        }

        /* 2. MEDICAL HISTORY CARDS */
        .medical-history-section {
          display: flex;
          flex-direction: column;
        }
        .history-cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 1rem;
        }
        .condition-history-card {
          background: var(--white);
          border: 1px solid var(--border-light);
          border-radius: var(--radius-lg);
          padding: 1.1rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          box-shadow: var(--shadow-sm);
          transition: transform var(--transition-fast);
        }
        .condition-history-card:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }
        .cond-card-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 0.5rem;
        }
        .cond-title-group {
          display: flex;
          align-items: flex-start;
          gap: 0.6rem;
        }
        .cond-name {
          font-size: 1.05rem;
          font-weight: 700;
          color: var(--dark-navy-text);
        }
        .diagnosed-date {
          font-size: 0.75rem;
          color: var(--text-muted);
        }
        .cond-card-body {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }
        .cond-detail-chip {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.8rem;
          color: var(--dark-navy-text);
          background: var(--bg-app);
          padding: 0.4rem 0.65rem;
          border-radius: var(--radius-xs);
        }
        .severity-note-bar {
          background: var(--pastel-cream-yellow);
          border: 1px solid #FDE68A;
          color: #B45309;
          font-size: 0.78rem;
          font-weight: 600;
          padding: 0.4rem 0.65rem;
          border-radius: var(--radius-xs);
        }
        .expand-card-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          font-size: 0.78rem;
          font-weight: 700;
          color: var(--brand-primary);
          background: var(--pastel-light-blue);
          padding: 0.35rem;
          border-radius: var(--radius-xs);
          transition: background var(--transition-fast);
        }
        .expand-card-btn:hover {
          background: var(--pastel-sky-blue);
        }
        .cond-expanded-content {
          background: var(--pastel-light-blue);
          border: 1px solid var(--pastel-sky-blue);
          border-radius: var(--radius-sm);
          padding: 0.85rem;
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
        }
        .expanded-desc {
          font-size: 0.8rem;
          color: var(--text-secondary);
          line-height: 1.4;
        }
        .expanded-meta-grid {
          display: flex;
          gap: 1.5rem;
          font-size: 0.75rem;
          border-top: 1px solid rgba(14,165,233,0.2);
          padding-top: 0.4rem;
        }
        .meta-lbl {
          display: block;
          color: var(--text-muted);
          font-size: 0.68rem;
        }

        /* 4. MEDICATIONS CARDS */
        .medications-section {
          display: flex;
          flex-direction: column;
        }
        .meds-cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1rem;
        }
        .med-card {
          background: var(--white);
          border: 1px solid var(--border-light);
          border-radius: var(--radius-lg);
          padding: 1.1rem;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          gap: 0.85rem;
          box-shadow: var(--shadow-sm);
        }
        .med-card-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
        }
        .med-name-icon {
          display: flex;
          align-items: center;
          gap: 0.65rem;
        }
        .pill-icon-circle {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: var(--pastel-cream-yellow);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
        }
        .med-title {
          font-size: 1.05rem;
          font-weight: 800;
          color: var(--dark-navy-text);
        }
        .med-purpose {
          font-size: 0.75rem;
          color: var(--brand-primary);
          font-weight: 600;
        }
        .med-structured-grid {
          background: var(--bg-app);
          padding: 0.65rem 0.75rem;
          border-radius: var(--radius-sm);
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.5rem;
        }
        .struct-item {
          display: flex;
          flex-direction: column;
        }
        .struct-lbl {
          font-size: 0.68rem;
          color: var(--text-muted);
          text-transform: uppercase;
        }
        .struct-val {
          font-size: 0.78rem;
          color: var(--dark-navy-text);
        }
        .med-card-footer {
          border-top: 1px solid var(--border-light);
          padding-top: 0.5rem;
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        /* 5. TEST REPORTS SECTION */
        .reports-section {
          display: flex;
          flex-direction: column;
        }
        .reports-list-cards {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .report-card {
          background: var(--white);
          border: 1px solid var(--border-light);
          border-radius: var(--radius-lg);
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          box-shadow: var(--shadow-sm);
        }
        .report-card-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 0.75rem;
        }
        .report-title-group {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
        }
        .test-icon-box {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: var(--pastel-sky-blue);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.3rem;
          flex-shrink: 0;
        }
        .report-title {
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--dark-navy-text);
        }
        .report-meta-line {
          font-size: 0.78rem;
          color: var(--text-muted);
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .report-parameters-table {
          background: var(--bg-app);
          border: 1px solid var(--border-light);
          border-radius: var(--radius-md);
          overflow: hidden;
        }
        .param-header-row {
          display: grid;
          grid-template-columns: 2fr 1.5fr 1.5fr 1fr;
          padding: 0.5rem 0.85rem;
          background: var(--pastel-light-blue);
          font-size: 0.72rem;
          font-weight: 700;
          color: var(--brand-primary);
          text-transform: uppercase;
        }
        .param-data-row {
          display: grid;
          grid-template-columns: 2fr 1.5fr 1.5fr 1fr;
          padding: 0.6rem 0.85rem;
          border-top: 1px solid var(--border-light);
          font-size: 0.82rem;
          align-items: center;
        }
        .param-name {
          color: var(--dark-navy-text);
          font-weight: 600;
        }
        .val-flagged {
          color: #DC2626;
        }
        .param-ref {
          color: var(--text-muted);
          font-size: 0.78rem;
        }
        .param-flag-badge {
          font-size: 0.68rem;
          font-weight: 800;
          padding: 2px 6px;
          border-radius: var(--radius-full);
          width: fit-content;
        }
        .param-flag-badge.high, .param-flag-badge.elevated {
          background: #FEE2E2;
          color: #DC2626;
        }
        .param-flag-badge.normal {
          background: #E8F5E9;
          color: #2E8B57;
        }
        .report-card-actions {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 0.75rem;
        }
        .report-attachment-chip {
          display: flex;
          align-items: center;
          gap: 6px;
          background: var(--pastel-light-blue);
          padding: 0.35rem 0.75rem;
          border-radius: var(--radius-sm);
          font-size: 0.78rem;
          font-weight: 600;
          color: var(--dark-navy-text);
        }
        .att-size {
          color: var(--text-muted);
        }

        /* 3. TIMELINE SECTION */
        .consultation-timeline-section {
          display: flex;
          flex-direction: column;
        }
        .timeline-container {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          position: relative;
        }
        .timeline-item {
          display: flex;
          gap: 1rem;
        }
        .timeline-marker {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 24px;
        }
        .marker-dot {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: var(--brand-primary);
          border: 3px solid var(--white);
          box-shadow: 0 0 0 2px var(--brand-accent);
          flex-shrink: 0;
          margin-top: 4px;
        }
        .marker-line {
          width: 2px;
          flex: 1;
          background: #CBD5E1;
          margin-top: 4px;
        }
        .timeline-card {
          flex: 1;
          background: var(--white);
          border: 1px solid var(--border-light);
          border-radius: var(--radius-lg);
          padding: 1.1rem;
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
          box-shadow: var(--shadow-sm);
        }
        .timeline-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .tl-left {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .record-cat-tag {
          background: var(--pastel-light-blue);
          color: var(--brand-primary);
          font-size: 0.7rem;
          font-weight: 800;
          padding: 2px 8px;
          border-radius: var(--radius-full);
          text-transform: uppercase;
        }
        .tl-date {
          font-size: 0.78rem;
          color: var(--text-muted);
          font-weight: 600;
        }
        .tl-title {
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--dark-navy-text);
        }
        .tl-meta-grid {
          display: flex;
          gap: 1.25rem;
          font-size: 0.8rem;
          color: var(--text-secondary);
        }
        .tl-meta-item {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .meta-icon {
          color: var(--brand-primary);
        }
        .tl-snippet-text {
          font-size: 0.85rem;
          color: var(--text-secondary);
          line-height: 1.45;
        }
        .tl-flags-row {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        .tl-flag-pill {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: #FEE2E2;
          color: #DC2626;
          font-size: 0.72rem;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: var(--radius-full);
        }
        .tl-card-actions {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 0.5rem;
          border-top: 1px solid var(--border-light);
          padding-top: 0.6rem;
        }
        .attachment-group {
          display: flex;
          gap: 0.4rem;
        }
        .att-pill {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: var(--bg-app);
          padding: 3px 8px;
          border-radius: var(--radius-xs);
          font-size: 0.72rem;
          color: var(--text-muted);
        }
        .tl-expanded-details {
          margin-top: 0.5rem;
        }
        .expanded-box {
          background: var(--pastel-light-blue);
          border: 1px solid var(--pastel-sky-blue);
          border-radius: var(--radius-md);
          padding: 0.85rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .expanded-box h5 {
          font-size: 0.85rem;
          color: var(--brand-primary);
        }
        .expanded-box p {
          font-size: 0.82rem;
          color: var(--dark-navy-text);
          line-height: 1.5;
        }
        .fhir-bundle-sync {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.72rem;
          font-weight: 700;
          color: #2E8B57;
          border-top: 1px solid rgba(14,165,233,0.2);
          padding-top: 0.4rem;
        }

        /* 8. DOCUMENTS VAULT */
        .documents-vault-section {
          display: flex;
          flex-direction: column;
        }
        .documents-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1rem;
        }
        .doc-vault-card {
          background: var(--white);
          border: 1px solid var(--border-light);
          border-radius: var(--radius-lg);
          padding: 1rem;
          display: flex;
          align-items: center;
          gap: 0.85rem;
          box-shadow: var(--shadow-sm);
          transition: transform var(--transition-fast);
        }
        .doc-vault-card:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }
        .doc-icon-wrapper {
          width: 44px;
          height: 44px;
          border-radius: var(--radius-md);
          background: var(--pastel-light-blue);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.4rem;
          flex-shrink: 0;
        }
        .doc-info-col {
          display: flex;
          flex-direction: column;
          gap: 2px;
          flex: 1;
        }
        .doc-file-name {
          font-size: 0.88rem;
          font-weight: 700;
          color: var(--dark-navy-text);
          word-break: break-word;
        }
        .doc-meta-row {
          font-size: 0.72rem;
          color: var(--text-muted);
          display: flex;
          align-items: center;
          gap: 4px;
          flex-wrap: wrap;
        }
        .doc-type-badge {
          background: var(--pastel-cream-yellow);
          color: #B45309;
          font-weight: 700;
          padding: 1px 6px;
          border-radius: var(--radius-xs);
        }
        .doc-view-btn {
          padding: 0.35rem 0.75rem;
        }

        /* MOBILE RESPONSIVE ADAPTATIONS */
        @media (max-width: 960px) {
          .health-summary-dashboard {
            grid-template-columns: 1fr;
          }
          .summary-stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 640px) {
          .param-header-row, .param-data-row {
            grid-template-columns: 1.5fr 1fr 1fr;
          }
          .param-header-row span:nth-child(3), .param-data-row span:nth-child(3) {
            display: none;
          }
          .records-main-title {
            font-size: 1.2rem;
          }
          .summary-stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .check-symp-btn {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};
