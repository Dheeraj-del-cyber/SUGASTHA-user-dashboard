import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Search,
  ShieldCheck,
  AlertTriangle,
  Pill,
  Stethoscope,
  FlaskConical,
  ScanLine,
  Syringe,
  Building2,
  CalendarPlus,
  Plus,
  ChevronRight,
  ChevronDown,
  X,
  User,
  Clock,
  Hospital,
  FileImage,
  Paperclip,
  Inbox,
  Calendar,
  ClipboardList,
  Activity,
  HeartPulse,
  FileBarChart,
  Clock4,
} from 'lucide-react';
import { AbhaProfile, HealthRecord, ChronicCondition, Allergy } from '../../types';

interface HealthRecordsViewProps {
  profile?: AbhaProfile | null;
  records: HealthRecord[];
  conditions: ChronicCondition[];
  allergies: Allergy[];
  onStartTriage: () => void;
  onAddRecord?: (record: HealthRecord) => void;
}

type UiRecord = HealthRecord & {
  isAppointment?: boolean;
  displayCategory?: 'SCAN' | 'HOSPITAL_VISIT' | 'DOCUMENT';
};

function effCategory(r: UiRecord): string {
  return r.displayCategory ?? r.category;
}

// ─── Medical Alert (compact doctor-facing chips) ─────────────────────────────

type MedAlertItem = {
  record: UiRecord | null;
  label: string; // short, scannable chip text
  detail: string; // full clinical text for the chip tooltip
  severity: 'Severe' | 'Moderate' | 'Mild' | null;
  severe: boolean;
};

const ALLERGY_SEVERITY_LABEL: Record<Allergy['severity'], 'Severe' | 'Moderate' | 'Mild'> = {
  SEVERE: 'Severe',
  MODERATE: 'Moderate',
  MILD: 'Mild',
};

// ─── Record type metadata (icon tile + badge tone per category) ──────────────

const RECORD_TYPE_META: Record<
  string,
  { label: string; icon: React.ReactNode; tile: string; badge: 'pink' | 'violet' | 'green' | 'blue' | 'amber' | 'teal' | 'rose' | 'slate' }
> = {
  DIAGNOSIS: { label: 'Symptoms', icon: <Stethoscope size={14} />, tile: 'hrv-tile-violet', badge: 'violet' },
  PRESCRIPTION: { label: 'Medicine', icon: <Pill size={14} />, tile: 'hrv-tile-blue', badge: 'blue' },
  LAB_REPORT: { label: 'Test', icon: <FlaskConical size={14} />, tile: 'hrv-tile-amber', badge: 'amber' },
  IMMUNIZATION: { label: 'Vaccination', icon: <Syringe size={14} />, tile: 'hrv-tile-teal', badge: 'teal' },
  SCAN: { label: 'Scan', icon: <ScanLine size={14} />, tile: 'hrv-tile-green', badge: 'green' },
  HOSPITAL_VISIT: { label: 'Hospital Visit', icon: <Hospital size={14} />, tile: 'hrv-tile-rose', badge: 'rose' },
  DOCUMENT: { label: 'Document', icon: <FileImage size={14} />, tile: 'hrv-tile-slate', badge: 'slate' },
  SURGERY: { label: 'Procedure', icon: <ScanLine size={14} />, tile: 'hrv-tile-slate', badge: 'slate' },
};

// Status badge derived from record (Current / Noted / Recorded / Completed / Normal / Resolved...)
function deriveBadge(record: UiRecord): { label: string; tone: 'pink' | 'violet' | 'green' | 'blue' | 'amber' | 'slate' } {
  const flags = record.criticalFlags ?? [];
  if (flags.length > 0) return { label: 'Attention', tone: 'pink' };
  const cat = effCategory(record);
  if (cat === 'DIAGNOSIS') {
    const isNew = Date.now() - parseDate(record.date) < 30 * 86400000;
    return isNew ? { label: 'Current', tone: 'pink' } : { label: 'Noted', tone: 'violet' };
  }
  if (cat === 'PRESCRIPTION') {
    // Ongoing if it is the newest prescription
    return { label: 'Completed', tone: 'blue' };
  }
  if (cat === 'LAB_REPORT') {
    const abnormal = hasAbnormalLabs(extractLabParameters(record.details));
    return abnormal ? { label: 'Needs Review', tone: 'amber' } : { label: 'Normal', tone: 'green' };
  }
  if (cat === 'SCAN') return { label: 'Normal', tone: 'green' };
  if (cat === 'IMMUNIZATION') return { label: 'Completed', tone: 'green' };
  if (cat === 'HOSPITAL_VISIT') return { label: 'Resolved', tone: 'green' };
  if (record.isAppointment) return { label: 'Scheduled', tone: 'blue' };
  return { label: 'Recorded', tone: 'slate' };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function parseDate(dateStr: string): number {
  const ts = Date.parse(dateStr);
  return Number.isNaN(ts) ? 0 : ts;
}

function hasAbnormalLabs(parameters: { status: string }[]): boolean {
  return parameters.some((p) => p.status !== 'Normal');
}

function extractLabParameters(details: string): { name: string; value: string; reference: string; status: 'Normal' | 'High' | 'Low' | 'Borderline' }[] {
  const params: { name: string; value: string; reference: string; status: 'Normal' | 'High' | 'Low' | 'Borderline' }[] = [];
  const segmentRegex =
    /([A-Za-z][A-Za-z0-9 (%/-]{0,38}?\)?)\s*[:\u2013-]\s*([0-9]+(?:[.,][0-9]+)*\s*(?:%|Lakh\s*\/uL|\/uL|mg\/dL|g\/dL|mmHg|bpm))/gi;
  const refRegex = /\(([^)]+)\)/g;
  let match: RegExpExecArray | null;
  while ((match = segmentRegex.exec(details)) !== null) {
    const name = match[1].replace(/\)$/, '').trim().replace(/\s+/g, ' ');
    const value = match[2].trim();
    const tail = details.slice(match.index + match[0].length, match.index + match[0].length + 60);
    refRegex.lastIndex = 0;
    const refMatch = refRegex.exec(tail);
    const refText = refMatch ? refMatch[1] : '';
    const flag = refText.toLowerCase();
    let status: 'Normal' | 'High' | 'Low' | 'Borderline' = 'Normal';
    if (/high|elevated|suboptimal/.test(flag)) status = 'High';
    else if (/low/.test(flag)) status = 'Low';
    else if (/borderline/.test(flag)) status = 'Borderline';
    else {
      const numeric = parseFloat(value.replace(/,/g, ''));
      const nums = refText.match(/[\d.]+/g);
      if (!Number.isNaN(numeric) && nums && nums.length > 0) {
        const scale = /lakh/i.test(refText) || /lakh/i.test(value) ? 100000 : 1;
        if (nums.length >= 2) {
          const lo = parseFloat(nums[0]) * scale;
          const hi = parseFloat(nums[1]) * scale;
          if (numeric < lo) status = 'Low';
          else if (numeric > hi) status = 'High';
        } else {
          const single = parseFloat(nums[0]) * scale;
          if (flag.includes('<')) status = numeric > single ? 'High' : 'Normal';
          else if (flag.includes('>')) status = numeric < single ? 'Low' : 'Normal';
        }
      }
    }
    params.push({ name, value, reference: refText && /[\d<>]/.test(refText) ? refText : '—', status });
  }
  return params;
}

function formatDate(dateStr: string): string {
  const ts = Date.parse(dateStr);
  if (!Number.isNaN(ts)) {
    return new Date(ts).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  }
  return dateStr;
}

function timelineDate(dateStr: string): string {
  const ts = Date.parse(dateStr);
  if (Number.isNaN(ts)) return dateStr;
  const d = new Date(ts);
  return `${d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} ${d.getFullYear()}`;
}

function computeAge(dob?: string): number | null {
  if (!dob) return null;
  const birth = new Date(dob);
  if (Number.isNaN(birth.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age -= 1;
  return age;
}

// ─── Small components ────────────────────────────────────────────────────────

const EmptyState: React.FC<{ title: string; message: string }> = ({ title, message }) => (
  <div className="hrv-empty-state">
    <div className="hrv-empty-icon">
      <Inbox size={19} />
    </div>
    <h4>{title}</h4>
    <p>{message}</p>
  </div>
);

const Badge: React.FC<{ label: string; tone: string }> = ({ label, tone }) => (
  <span className={`hrv-badge hrv-badge-${tone}`}>{label}</span>
);

// ─── Main view ───────────────────────────────────────────────────────────────

export const HealthRecordsView: React.FC<HealthRecordsViewProps> = ({
  profile,
  records,
  conditions,
  allergies,
  onAddRecord,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [timelineFilter, setTimelineFilter] = useState<'ALL' | string>('ALL');
  const [detailRecord, setDetailRecord] = useState<UiRecord | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [localRecords, setLocalRecords] = useState<UiRecord[]>([]);
  const timelineRef = useRef<HTMLElement | null>(null);
  const [timelineFlash, setTimelineFlash] = useState(false);

  // Quick Actions / quick links / category cards all funnel here: set the
  // filter, then smoothly bring the Health Timeline into view so the change
  // is obvious even when you're at the bottom of the page on mobile.
  const goToTimeline = (filter: string) => {
    setTimelineFilter(filter);
    // Scroll first (rAF keeps it after the state update commit), then pulse
    // a highlight ring on the panel so the user sees WHERE the result is.
    requestAnimationFrame(() => {
      timelineRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setTimelineFlash(true);
      window.setTimeout(() => setTimelineFlash(false), 1100);
    });
  };

  const [formCategory, setFormCategory] = useState('DIAGNOSIS');
  const [formTitle, setFormTitle] = useState('');
  const [formDate, setFormDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [formFacility, setFormFacility] = useState('');
  const [formDoctor, setFormDoctor] = useState('');
  const [formDetails, setFormDetails] = useState('');

  const isOverlayOpen = detailRecord !== null || isAddOpen;

  // Lock page scroll while the detail drawer or add-record sheet is open, so
  // swiping inside the overlay never scrolls the dashboard behind it.
  useEffect(() => {
    if (!isOverlayOpen) return;
    const { overflow, position, top, width } = document.body.style;
    const scrollY = window.scrollY;
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
    return () => {
      document.body.style.overflow = overflow;
      document.body.style.position = position;
      document.body.style.top = top;
      document.body.style.width = width;
      window.scrollTo(0, scrollY);
    };
  }, [isOverlayOpen]);

  // Close overlays with the Android/iOS back gesture or the Escape key.
  useEffect(() => {
    if (!isOverlayOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setDetailRecord(null);
        setIsAddOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOverlayOpen]);

  const allRecords = useMemo<UiRecord[]>(() => [...localRecords, ...records], [localRecords, records]);

  const patientName = profile?.fullName ?? '';
  const age = computeAge(profile?.dateOfBirth);

  // ── Category cards row (data-driven counts) ──
  const categoryCards = useMemo(() => {
    const countBy = (fn: (r: UiRecord) => boolean) => allRecords.filter(fn).length;
    return [
      { key: 'ALL', label: 'Health Events', icon: <Calendar size={17} />, tile: 'hrv-tile-violet', bg: 'hrv-cat-violet', count: allRecords.length },
      { key: 'PRESCRIPTION', label: 'Medicines & Supplements', icon: <Pill size={17} />, tile: 'hrv-tile-blue', bg: 'hrv-cat-blue', count: countBy((r) => effCategory(r) === 'PRESCRIPTION') },
      { key: 'LAB_REPORT', label: 'Tests & Reports', icon: <FlaskConical size={17} />, tile: 'hrv-tile-amber', bg: 'hrv-cat-amber', count: countBy((r) => effCategory(r) === 'LAB_REPORT') },
      { key: 'SCAN', label: 'Scans & Imaging', icon: <ScanLine size={17} />, tile: 'hrv-tile-green', bg: 'hrv-cat-green', count: countBy((r) => effCategory(r) === 'SCAN' || effCategory(r) === 'SURGERY') },
      { key: 'HOSPITAL_VISIT', label: 'Medical Visits', icon: <Hospital size={17} />, tile: 'hrv-tile-rose', bg: 'hrv-cat-rose', count: countBy((r) => effCategory(r) === 'HOSPITAL_VISIT' || r.isAppointment === true) },
      { key: 'IMMUNIZATION', label: 'Vaccinations', icon: <Syringe size={17} />, tile: 'hrv-tile-teal', bg: 'hrv-cat-teal', count: countBy((r) => effCategory(r) === 'IMMUNIZATION') },
      { key: 'DOCUMENT', label: 'Documents', icon: <FileImage size={17} />, tile: 'hrv-tile-slate', bg: 'hrv-cat-slate', count: countBy((r) => effCategory(r) === 'DOCUMENT') },
      { key: 'DIAGNOSIS', label: 'Consultations', icon: <Stethoscope size={17} />, tile: 'hrv-tile-violet', bg: 'hrv-cat-lav', count: countBy((r) => effCategory(r) === 'DIAGNOSIS' && !r.isAppointment) },
    ];
  }, [allRecords]);

  // ── Timeline filter options from categories present ──
  const filterOptions = useMemo(() => {
    const present = new Set(allRecords.map((r) => effCategory(r)));
    const opts: { key: string; label: string }[] = [{ key: 'ALL', label: 'All' }];
    RECORD_TYPE_META_ORDER.forEach((key) => {
      if (present.has(key)) opts.push({ key, label: RECORD_TYPE_META[key].label });
    });
    if (allRecords.some((r) => r.isAppointment)) opts.push({ key: 'APPOINTMENT', label: 'Appointments' });
    return opts;
  }, [allRecords]);

  // ── Filtered timeline ──
  const filteredRecords = useMemo(() => {
    let list = allRecords;
    if (timelineFilter === 'APPOINTMENT') {
      list = list.filter((r) => r.isAppointment);
    } else if (timelineFilter !== 'ALL') {
      list = list.filter((r) => effCategory(r) === timelineFilter);
    }
    const query = searchQuery.trim().toLowerCase();
    if (query) {
      list = list.filter((r) =>
        [r.title, r.details, r.doctorName, r.facilityName].join(' ').toLowerCase().includes(query)
      );
    }
    return [...list].sort((a, b) => parseDate(b.date) - parseDate(a.date));
  }, [allRecords, timelineFilter, searchQuery]);

  const lastUpdated = useMemo(() => {
    if (allRecords.length === 0) return null;
    const latest = allRecords.reduce(
      (acc, r) => (parseDate(r.date) > parseDate(acc.date) ? r : acc),
      allRecords[0]
    );
    return formatDate(latest.date);
  }, [allRecords]);

  // ── Health Overview minis (generic, data-driven) ──
  const overviewMinis = useMemo(() => {
    const abnormalLabs = allRecords.filter(
      (r) => effCategory(r) === 'LAB_REPORT' && hasAbnormalLabs(extractLabParameters(r.details))
    ).length;
    const activeMeds = conditions.reduce((acc, c) => acc + c.currentMedications.length, 0);
    const recentVisits = allRecords.filter(
      (r) => (effCategory(r) === 'HOSPITAL_VISIT' || effCategory(r) === 'DIAGNOSIS') &&
        Date.now() - parseDate(r.date) < 365 * 86400000
    ).length;
    return [
      { id: 'ov-alerts', icon: <HeartPulse size={16} />, label: 'Medical Alerts', value: activeAlertsCount(allRecords) > 0 ? `${activeAlertsCount(allRecords)} flagged` : 'Clear', cls: abnormalLabs > 0 || activeAlertsCount(allRecords) > 0 ? 'hrv-ov-rose' : 'hrv-ov-green', record: null },
      { id: 'ov-meds', icon: <Pill size={16} />, label: 'Active Medicines', value: activeMeds > 0 ? `${activeMeds} ongoing` : 'None', cls: 'hrv-ov-blue', record: null },
      { id: 'ov-labs', icon: <FlaskConical size={16} />, label: 'Recent Labs', value: abnormalLabs > 0 ? `${abnormalLabs} need review` : 'All normal', cls: abnormalLabs > 0 ? 'hrv-ov-amber' : 'hrv-ov-green', record: null },
      { id: 'ov-visits', icon: <Hospital size={16} />, label: 'Visits (1 yr)', value: String(recentVisits), cls: 'hrv-ov-lav', record: null },
    ];
  }, [allRecords, conditions]);

  // Compact Medical Alert chips: allergies first (most safety-critical),
  // then critical flags from records. `label` is the short chip text;
  // `detail` keeps the full clinical wording for the tooltip.
  const doctorAlertList = useMemo<MedAlertItem[]>(() => {
    const fromAllergies = allergies.map((a) => ({
      record: null,
      label: a.allergen,
      detail: `Allergy: ${a.allergen} — ${a.reaction} (${ALLERGY_SEVERITY_LABEL[a.severity]})`,
      severity: ALLERGY_SEVERITY_LABEL[a.severity],
      severe: a.severity === 'SEVERE',
    }));
    const fromRecords = allRecords.flatMap((r) =>
      (r.criticalFlags ?? []).map((flag) => ({
        record: r,
        label: flag,
        detail: flag,
        severity: null,
        severe: /allerg|severe|emergency|high priority/i.test(flag),
      }))
    );
    return [...fromAllergies, ...fromRecords];
  }, [allRecords, allergies]);

  const handleAddRecord = () => {
    if (!formTitle.trim()) return;
    const record: UiRecord = {
      id: `rec-local-${Date.now()}`,
      date: formDate || new Date().toISOString().slice(0, 10),
      category: formCategory === 'APPOINTMENT' ? 'DIAGNOSIS' : (formCategory as HealthRecord['category']),
      displayCategory:
        formCategory === 'SCAN'
          ? 'SCAN'
          : formCategory === 'HOSPITAL_VISIT'
          ? 'HOSPITAL_VISIT'
          : formCategory === 'DOCUMENT'
          ? 'DOCUMENT'
          : undefined,
      isAppointment: formCategory === 'APPOINTMENT',
      title: formTitle.trim(),
      facilityName: formFacility.trim() || 'Not specified',
      doctorName: formDoctor.trim() || 'Not specified',
      details: formDetails.trim() || 'No additional notes recorded.',
    };
    if (onAddRecord) onAddRecord(record);
    else setLocalRecords((prev) => [record, ...prev]);
    setIsAddOpen(false);
    setFormTitle('');
    setFormFacility('');
    setFormDoctor('');
    setFormDetails('');
    setTimelineFilter('ALL');
    setSearchQuery('');
  };

  return (
    <div className="hrv-root hrv-root-enter">
      {/* ── PAGE HEADER ──────────────────────────────────────────────── */}
      <div className="hrv-page-head">
        <div className="hrv-page-title-wrap">
          <div className="hrv-page-icon" aria-hidden="true">
            <ClipboardList size={22} />
          </div>
          <div>
            <h1 className="hrv-page-title">My Record</h1>
            <p className="hrv-page-sub">Your complete health journey, all in one place</p>
          </div>
        </div>
        <div className="hrv-page-actions">
          <div className="hrv-search-shell">
            <Search size={16} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search records..."
              aria-label="Search records"
            />
            {searchQuery && (
              <button type="button" className="hrv-clear-search" onClick={() => setSearchQuery('')} aria-label="Clear search">
                <X size={14} />
              </button>
            )}
          </div>
          <div className="hrv-safety-pill">
            <ShieldCheck size={15} />
            <span>
              Your health data
              <br />
              is safe with us
            </span>
          </div>
        </div>
      </div>

      {/* ── MEDICAL ALERT (compact single-row card, always visible) ────── */}
      <section
        className={`hrv-med-alert ${doctorAlertList.length === 0 ? 'hrv-med-alert-empty' : ''}`}
        aria-label="Medical alert"
      >
        <span className="hrv-med-alert-head">
          <AlertTriangle size={13} strokeWidth={2.4} />
          Medical Alert
        </span>
        {doctorAlertList.length > 0 ? (
          <div className="hrv-med-alert-chips no-scrollbar">
            {doctorAlertList.slice(0, 8).map((alert, i) => {
              const chipClass = `hrv-med-alert-chip ${alert.severe ? 'hrv-med-alert-chip-severe' : ''}`;
              const dotClass =
                alert.severity === 'Moderate'
                  ? 'hrv-dot-moderate'
                  : alert.severity === 'Mild'
                  ? 'hrv-dot-mild'
                  : 'hrv-dot-severe';
              const body = (
                <>
                  <span className={`hrv-med-alert-dot ${dotClass}`} aria-hidden="true" />
                  <span className="hrv-med-alert-chip-label">{alert.label}</span>
                  {alert.severity && (
                    <span className={`hrv-med-alert-chip-sev hrv-sev-${alert.severity.toLowerCase()}`}>
                      · {alert.severity}
                    </span>
                  )}
                </>
              );
              return alert.record ? (
                <button
                  key={i}
                  type="button"
                  className={chipClass}
                  onClick={() => {
                    if (alert.record) setDetailRecord(alert.record);
                  }}
                  title={alert.detail}
                >
                  {body}
                </button>
              ) : (
                <span key={i} className={chipClass} title={alert.detail}>
                  {body}
                </span>
              );
            })}
          </div>
        ) : (
          <span className="hrv-med-alert-clear">
            <ShieldCheck size={12} />
            No medical alerts recorded
          </span>
        )}
      </section>

      {/* ── CATEGORY CARDS ROW ───────────────────────────────────────── */}
      <div className="hrv-rail-wrap">
        <div className="hrv-cat-row no-scrollbar">
          {categoryCards.map((cat) => (
            <button
              key={cat.key}
              type="button"
              className={`hrv-cat-card ${cat.bg} ${timelineFilter === cat.key ? 'hrv-cat-selected' : ''}`}
              onClick={() => setTimelineFilter(timelineFilter === cat.key ? 'ALL' : cat.key)}
            >
              <span className={`hrv-cat-icon ${cat.tile}`}>{cat.icon}</span>
              <span className="hrv-cat-texts">
                <span className="hrv-cat-label">{cat.label}</span>
                <span className="hrv-cat-count">
                  {cat.count} record{cat.count === 1 ? '' : 's'}
                </span>
              </span>
              <ChevronRight size={15} className="hrv-cat-chev" />
            </button>
          ))}
        </div>
      </div>

      {/* ── MAIN GRID: TIMELINE + SIDEBAR ────────────────────────────── */}
      <div className="hrv-main-grid">
        {/* HEALTH TIMELINE */}
        <section
          ref={timelineRef}
          className={`hrv-card hrv-timeline-panel ${timelineFlash ? 'hrv-tl-flash' : ''}`}
          aria-label="Health timeline"
        >
          <div className="hrv-tl-head">
            <div className="hrv-tl-head-left">
              <span className="hrv-tl-head-icon">
                <Calendar size={16} />
              </span>
              <div>
                <h2>Health Timeline</h2>
                <p>Your past and current health events</p>
              </div>
            </div>
            <div className="hrv-tl-filter">
              <select
                value={timelineFilter}
                onChange={(e) => setTimelineFilter(e.target.value)}
                aria-label="Filter timeline by type"
              >
                {filterOptions.map((o) => (
                  <option key={o.key} value={o.key}>
                    {o.label}
                  </option>
                ))}
              </select>
              <ChevronDown size={14} />
            </div>
          </div>

          {filteredRecords.length === 0 ? (
            <EmptyState
              title={searchQuery || timelineFilter !== 'ALL' ? 'No matching events' : 'No records yet'}
              message={
                searchQuery || timelineFilter !== 'ALL'
                  ? 'Try a different search or filter to see your health events.'
                  : 'Your consultations, medicines, tests and visits will appear here once added.'
              }
            />
          ) : (
            <div className="hrv-timeline">
              {filteredRecords.map((record) => {
                const meta = RECORD_TYPE_META[effCategory(record)] ?? RECORD_TYPE_META.SURGERY;
                const badge = deriveBadge(record);
                const parts = record.details.split('. ').map((s) => s.trim()).filter(Boolean);
                const primaryLine = parts[0] ?? '';
                return (
                  <button
                    key={record.id}
                    type="button"
                    className="hrv-tl-item"
                    onClick={() => setDetailRecord(record)}
                    aria-label={`${record.title}, ${formatDate(record.date)}`}
                  >
                    <span className={`hrv-tl-dot ${meta.tile}`} aria-hidden="true">
                      {meta.icon}
                    </span>
                    <span className="hrv-tl-card">
                      <span className="hrv-tl-top">
                        <span className="hrv-tl-when">{timelineDate(record.date)}</span>
                        <span className="hrv-tl-badge">
                          <Badge label={badge.label} tone={badge.tone} />
                        </span>
                      </span>
                      <span className="hrv-tl-body">
                        <span className="hrv-tl-title">{record.title}</span>
                        <span className="hrv-tl-sub">
                          {primaryLine || meta.label}
                        </span>
                      </span>
                      <ChevronRight size={15} className="hrv-tl-chev" />
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* BOTTOM QUICK LINKS BAR */}
          <div className="hrv-quick-links no-scrollbar">
            {[
              { icon: <FileBarChart size={15} />, label: 'Reports', action: () => goToTimeline('LAB_REPORT') },
              { icon: <Pill size={15} />, label: 'Prescriptions', action: () => goToTimeline('PRESCRIPTION') },
              { icon: <CalendarPlus size={15} />, label: 'Appointments', action: () => goToTimeline('APPOINTMENT') },
              { icon: <Clock4 size={15} />, label: 'Medical History', action: () => goToTimeline('DIAGNOSIS') },
              { icon: <Building2 size={15} />, label: 'Hospital Visits', action: () => goToTimeline('HOSPITAL_VISIT') },
            ].map((link) => (
              <button key={link.label} type="button" className="hrv-quick-link" onClick={link.action}>
                {link.icon}
                <span>{link.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* SIDEBAR */}
        <aside className="hrv-sidebar">
          {/* HEALTH OVERVIEW */}
          <section className="hrv-card hrv-overview-card" aria-label="Health overview">
            <div className="hrv-ov-head">
              <span className="hrv-ov-head-icon">
                <Activity size={16} />
              </span>
              <div>
                <h3>Health Overview</h3>
                <p>A quick look at your current status</p>
              </div>
            </div>
            <div className="hrv-ov-grid">
              {overviewMinis.map((mini) => (
                <div key={mini.id} className={`hrv-ov-mini ${mini.cls}`}>
                  <span className="hrv-ov-mini-icon">{mini.icon}</span>
                  <span className="hrv-ov-mini-texts">
                    <span className="hrv-ov-mini-label">{mini.label}</span>
                    <span className="hrv-ov-mini-value">{mini.value}</span>
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* ADD RECORD BANNER */}
          <button type="button" className="hrv-add-banner" onClick={() => setIsAddOpen(true)}>
            <span className="hrv-add-banner-icon">
              <ClipboardList size={20} />
            </span>
            <span className="hrv-add-banner-text">
              Keep your records updated
              <br />
              for better care <span className="hrv-heart">♥</span>
            </span>
            <span className="hrv-add-banner-btn">
              <Plus size={14} /> Add Record
            </span>
          </button>

          {lastUpdated && (
            <p className="hrv-updated-note">
              <Clock size={11} /> {patientName}
              {age !== null ? `, ${age}` : ''} • Last updated {lastUpdated}
            </p>
          )}
        </aside>
      </div>

      {/* ── DETAIL DRAWER (portal: always anchored to the real viewport) ── */}
      {detailRecord && createPortal(
        <div className="hrv-drawer-backdrop" onClick={() => setDetailRecord(null)}>
          <aside
            className="hrv-drawer"
            role="dialog"
            aria-modal="true"
            aria-label={`Record details: ${detailRecord.title}`}
            onClick={(e) => e.stopPropagation()}
          >
            <header className="hrv-drawer-head">
              <div className="hrv-drawer-title-wrap">
                <span className="hrv-drawer-type">
                  {RECORD_TYPE_META[effCategory(detailRecord)]?.label ?? 'Record'}
                </span>
                <h3 className="hrv-drawer-title">{detailRecord.title}</h3>
                <p className="hrv-drawer-meta">
                  <User size={13} /> {detailRecord.doctorName}
                  <span className="hrv-meta-sep">•</span>
                  <Building2 size={13} /> {detailRecord.facilityName}
                  <span className="hrv-meta-sep">•</span>
                  <Clock size={13} /> {formatDate(detailRecord.date)}
                </p>
              </div>
              <button type="button" className="hrv-drawer-close" onClick={() => setDetailRecord(null)} aria-label="Close record details">
                <X size={17} />
              </button>
            </header>
            <div className="hrv-drawer-body">
              <div className="hrv-detail-block">
                <span className="hrv-detail-label">Notes</span>
                <p>{detailRecord.details}</p>
              </div>
              {effCategory(detailRecord) === 'LAB_REPORT' && (
                <div className="hrv-detail-block">
                  <span className="hrv-detail-label">Key Values</span>
                  <div className="hrv-table-scroll">
                    <table className="hrv-lab-table">
                      <thead>
                        <tr>
                          <th scope="col">Test</th>
                          <th scope="col">Result</th>
                          <th scope="col">Reference</th>
                          <th scope="col">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {extractLabParameters(detailRecord.details).map((p, i) => (
                          <tr key={i} className={p.status !== 'Normal' ? 'hrv-row-abnormal' : undefined}>
                            <td className="hrv-td-name">{p.name}</td>
                            <td className={`hrv-td-value ${p.status !== 'Normal' ? 'hrv-abnormal' : ''}`}>{p.value}</td>
                            <td className="hrv-td-ref">{p.reference || '—'}</td>
                            <td>
                              <span className={`hrv-badge hrv-badge-${p.status === 'Normal' ? 'green' : 'pink'}`}>
                                {p.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              {detailRecord.criticalFlags && detailRecord.criticalFlags.length > 0 && (
                <div className="hrv-detail-block">
                  <span className="hrv-detail-label">Medical Alerts</span>
                  <div className="hrv-flag-row">
                    {detailRecord.criticalFlags.map((flag, i) => (
                      <span key={i} className="hrv-flag-chip">
                        <AlertTriangle size={11} /> {flag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {detailRecord.attachments && detailRecord.attachments.length > 0 && (
                <div className="hrv-detail-block">
                  <span className="hrv-detail-label">Attachments</span>
                  <div className="hrv-attachments">
                    {detailRecord.attachments.map((att, i) => (
                      <span key={i} className="hrv-attachment">
                        <Paperclip size={12} /> {att.name} <em>({att.size})</em>
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <div className="hrv-entry-verified">
                <ShieldCheck size={12} />
                <span>Verified ABDM record (FHIR R4)</span>
              </div>
            </div>
          </aside>
        </div>,
        document.body
      )}

      {/* ── ADD RECORD MODAL (portal: always anchored to the real viewport) ── */}
      {isAddOpen && createPortal(
        <div className="hrv-drawer-backdrop" onClick={() => setIsAddOpen(false)}>
          <div className="hrv-add-modal" role="dialog" aria-modal="true" aria-label="Add a new record" onClick={(e) => e.stopPropagation()}>
            <div className="hrv-add-modal-head">
              <h3>
                <Plus size={16} /> Add New Record
              </h3>
              <button type="button" onClick={() => setIsAddOpen(false)} aria-label="Close">
                <X size={17} />
              </button>
            </div>
            <div className="hrv-add-modal-body">
              <span className="hrv-detail-label">Record Type</span>
              <div className="hrv-add-options">
                {[
                  { key: 'DIAGNOSIS', icon: <Stethoscope size={17} />, label: 'Symptoms / Consultation' },
                  { key: 'PRESCRIPTION', icon: <Pill size={17} />, label: 'Medicine' },
                  { key: 'IMMUNIZATION', icon: <Syringe size={17} />, label: 'Supplement / Vaccine' },
                  { key: 'LAB_REPORT', icon: <FlaskConical size={17} />, label: 'Test' },
                  { key: 'SCAN', icon: <ScanLine size={17} />, label: 'Scan' },
                  { key: 'HOSPITAL_VISIT', icon: <Hospital size={17} />, label: 'Hospital Visit' },
                  { key: 'DOCUMENT', icon: <FileImage size={17} />, label: 'Document' },
                  { key: 'APPOINTMENT', icon: <CalendarPlus size={17} />, label: 'Appointment' },
                ].map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    className={`hrv-add-option ${formCategory === opt.key ? 'hrv-opt-selected' : ''}`}
                    onClick={() => setFormCategory(opt.key)}
                  >
                    <span className="hrv-add-option-icon">{opt.icon}</span>
                    <span>{opt.label}</span>
                  </button>
                ))}
              </div>
              <div className="hrv-form-grid">
                <div className="hrv-form-field hrv-form-wide">
                  <label htmlFor="hrv-f-title">Title</label>
                  <input
                    id="hrv-f-title"
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. Blood test, specialist visit..."
                  />
                </div>
                <div className="hrv-form-field">
                  <label htmlFor="hrv-f-date">Date</label>
                  <input id="hrv-f-date" type="date" value={formDate} onChange={(e) => setFormDate(e.target.value)} />
                </div>
                <div className="hrv-form-field">
                  <label htmlFor="hrv-f-doctor">Doctor</label>
                  <input
                    id="hrv-f-doctor"
                    type="text"
                    value={formDoctor}
                    onChange={(e) => setFormDoctor(e.target.value)}
                    placeholder="Attending doctor"
                  />
                </div>
                <div className="hrv-form-field hrv-form-wide">
                  <label htmlFor="hrv-f-facility">Hospital / Facility</label>
                  <input
                    id="hrv-f-facility"
                    type="text"
                    value={formFacility}
                    onChange={(e) => setFormFacility(e.target.value)}
                    placeholder="Hospital, clinic or lab name"
                  />
                </div>
                <div className="hrv-form-field hrv-form-wide">
                  <label htmlFor="hrv-f-notes">Notes</label>
                  <textarea
                    id="hrv-f-notes"
                    value={formDetails}
                    onChange={(e) => setFormDetails(e.target.value)}
                    rows={3}
                    placeholder="Details, findings or instructions..."
                  />
                </div>
              </div>
            </div>
            <div className="hrv-add-modal-foot">
              <button type="button" className="hrv-btn-outline" onClick={() => setIsAddOpen(false)}>
                Cancel
              </button>
              <button type="button" className="hrv-add-save-btn" onClick={handleAddRecord} disabled={!formTitle.trim()}>
                <Plus size={14} /> Save Record
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      <style>{`
        /* ═══ Root ═══ */
        .hrv-root {
          display: flex;
          flex-direction: column;
          gap: 1.15rem;
          width: 100%;
          padding-bottom: 2.5rem;
          color: #1D2939;
        }
        /* Entrance animation that never leaves a transform behind — a
           persisted transform would make this div the containing block for
           position: fixed overlays and displace them off-screen. */
        .hrv-root-enter { animation: hrvRootIn 0.35s ease both; }
        @keyframes hrvRootIn {
          from { opacity: 0; visibility: hidden; }
          to { opacity: 1; visibility: visible; }
        }
        @media (prefers-reduced-motion: reduce) {
          .hrv-root-enter { animation: none; }
        }

        /* ═══ Page header ═══ */
        .hrv-page-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          flex-wrap: wrap;
        }
        .hrv-page-title-wrap { display: flex; align-items: center; gap: 0.9rem; }
        .hrv-page-icon {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          background: linear-gradient(135deg, #EEF2FF, #E0F2FE);
          color: #6366F1;
          display: grid;
          place-items: center;
          box-shadow: inset 0 0 0 1px rgba(99, 102, 241, 0.14);
        }
        .hrv-page-title {
          font-family: var(--font-display);
          font-size: 1.7rem;
          font-weight: 800;
          color: #1E1B4B;
          letter-spacing: -0.02em;
          line-height: 1.1;
        }
        .hrv-page-sub { font-size: 0.88rem; color: #64748B; margin-top: 2px; }
        .hrv-page-actions { display: flex; align-items: center; gap: 0.7rem; flex-wrap: wrap; }
        .hrv-search-shell {
          display: flex;
          align-items: center;
          gap: 0.55rem;
          background: #fff;
          border: 1px solid #E7EAF3;
          border-radius: 999px;
          padding: 0.55rem 1rem;
          min-width: 230px;
          color: #94A3B8;
          box-shadow: 0 1px 2px rgba(16, 24, 40, 0.04);
          transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
        }
        .hrv-search-shell:focus-within { border-color: #A5B4FC; box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.12); }
        .hrv-search-shell input {
          border: none;
          outline: none;
          background: transparent;
          flex: 1;
          font-size: 0.87rem;
          color: #1D2939;
          padding: 0;
          min-width: 0;
        }
        .hrv-search-shell input:focus { box-shadow: none; }
        .hrv-clear-search {
          display: grid;
          place-items: center;
          width: 24px;
          height: 24px;
          border: none;
          border-radius: 50%;
          background: transparent;
          color: #94A3B8;
          cursor: pointer;
          flex-shrink: 0;
        }
        .hrv-clear-search:hover { background: #F2F4F7; color: #475467; }
        .hrv-safety-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #ECFDF5;
          border: 1px solid #BBF7D0;
          color: #047857;
          font-size: 0.7rem;
          font-weight: 700;
          line-height: 1.25;
          padding: 0.5rem 0.9rem;
          border-radius: 999px;
          white-space: nowrap;
        }
        .hrv-safety-pill svg { flex-shrink: 0; }

        /* ═══ Medical Alert — compact single-row card ═══ */
        .hrv-med-alert {
          display: flex;
          align-items: center;
          gap: 0.7rem;
          min-width: 0;
          background: #fff;
          border: 1px solid #EEF0F6;
          border-radius: 12px;
          padding: 0.45rem 0.7rem;
          box-shadow: 0 1px 2px rgba(16, 24, 40, 0.04);
        }
        .hrv-med-alert-head {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          flex-shrink: 0;
          font-size: 0.78rem;
          font-weight: 800;
          color: #B42318;
          white-space: nowrap;
        }
        .hrv-med-alert-head svg { color: #E11D48; }
        .hrv-med-alert-empty .hrv-med-alert-head { color: #667085; }
        .hrv-med-alert-empty .hrv-med-alert-head svg { color: #98A2B3; }
        /* Chips live in their own internal scroll rail, so many alerts never
           grow the card taller or wider — one compact row everywhere. */
        .hrv-med-alert-chips {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          flex: 1 1 auto;
          min-width: 0;
          overflow-x: auto;
          padding: 2px;
          overscroll-behavior-x: contain;
          -webkit-overflow-scrolling: touch;
        }
        .hrv-med-alert-chip {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          flex-shrink: 0;
          max-width: 250px;
          background: #fff;
          border: 1px solid #F2DCDC;
          border-radius: 999px;
          padding: 3px 10px;
          font-size: 0.72rem;
          font-weight: 700;
          color: #344054;
          white-space: nowrap;
          font-family: inherit;
        }
        .hrv-med-alert-chip-label { overflow: hidden; text-overflow: ellipsis; }
        .hrv-med-alert-chip-sev { font-weight: 800; }
        .hrv-sev-severe { color: #B42318; }
        .hrv-sev-moderate { color: #B45309; }
        .hrv-sev-mild { color: #64748B; }
        .hrv-med-alert-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .hrv-dot-severe { background: #E11D48; }
        .hrv-dot-moderate { background: #F59E0B; }
        .hrv-dot-mild { background: #94A3B8; }
        .hrv-med-alert-chip-severe { background: #FEF5F5; border-color: #F4CACA; }
        button.hrv-med-alert-chip {
          cursor: pointer;
          transition: background var(--transition-fast), border-color var(--transition-fast);
        }
        button.hrv-med-alert-chip:hover { background: #FDF0F0; border-color: #EFC0C0; }
        button.hrv-med-alert-chip:focus-visible { outline: 2px solid #F43F5E; outline-offset: 2px; }
        .hrv-med-alert-clear {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          min-width: 0;
          font-size: 0.74rem;
          font-weight: 600;
          color: #059669;
          white-space: nowrap;
        }
        .hrv-med-alert-clear svg { color: #10B981; flex-shrink: 0; }

        /* ═══ Category cards row ═══ */
        .hrv-cat-row {
          display: flex;
          gap: 0.75rem;
          overflow-x: auto;
          padding-bottom: 4px;
        }
        .hrv-cat-card {
          flex: 1 0 190px;
          display: flex;
          align-items: center;
          gap: 0.7rem;
          border-radius: 16px;
          padding: 0.85rem 0.9rem;
          border: 1px solid transparent;
          text-align: left;
          font-family: inherit;
          cursor: pointer;
          transition: transform var(--transition-fast), box-shadow var(--transition-fast), border-color var(--transition-fast);
        }
        .hrv-cat-card:hover { transform: translateY(-2px); box-shadow: 0 10px 22px -12px rgba(30, 27, 75, 0.25); }
        .hrv-cat-card:focus-visible { outline: 2px solid #6366F1; outline-offset: 2px; }
        .hrv-cat-selected { border-color: #6366F1; box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15); }
        .hrv-cat-icon {
          width: 42px;
          height: 42px;
          border-radius: 12px;
          display: grid;
          place-items: center;
          flex-shrink: 0;
          color: #fff;
        }
        .hrv-cat-texts { display: flex; flex-direction: column; min-width: 0; }
        .hrv-cat-label {
          font-size: 0.8rem;
          font-weight: 800;
          color: #1E293B;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .hrv-cat-count { font-size: 0.72rem; color: #64748B; font-weight: 600; }
        .hrv-cat-chev { color: #94A3B8; flex-shrink: 0; margin-left: auto; }
        .hrv-cat-violet { background: #F3F1FD; }
        .hrv-cat-blue { background: #EBF5FF; }
        .hrv-cat-amber { background: #FFF6E9; }
        .hrv-cat-green { background: #EDFBF3; }
        .hrv-cat-rose { background: #FDF0F4; }
        .hrv-cat-teal { background: #EBFAF7; }
        .hrv-cat-slate { background: #F4F6FA; }
        .hrv-cat-lav { background: #F5F3FF; }

        /* ═══ Tiles (icon colors) ═══ */
        .hrv-tile-violet { background: linear-gradient(135deg, #8B5CF6, #6366F1); box-shadow: 0 4px 10px -3px rgba(99, 102, 241, 0.5); }
        .hrv-tile-blue { background: linear-gradient(135deg, #38BDF8, #3B82F6); box-shadow: 0 4px 10px -3px rgba(59, 130, 246, 0.5); }
        .hrv-tile-amber { background: linear-gradient(135deg, #FBBF24, #F59E0B); box-shadow: 0 4px 10px -3px rgba(245, 158, 11, 0.5); }
        .hrv-tile-green { background: linear-gradient(135deg, #34D399, #10B981); box-shadow: 0 4px 10px -3px rgba(16, 185, 129, 0.5); }
        .hrv-tile-rose { background: linear-gradient(135deg, #FB7185, #F43F5E); box-shadow: 0 4px 10px -3px rgba(244, 63, 94, 0.5); }
        .hrv-tile-teal { background: linear-gradient(135deg, #2DD4BF, #14B8A6); box-shadow: 0 4px 10px -3px rgba(20, 184, 166, 0.5); }
        .hrv-tile-slate { background: linear-gradient(135deg, #94A3B8, #64748B); box-shadow: 0 4px 10px -3px rgba(71, 85, 105, 0.4); }

        /* ═══ Main grid ═══ */
        .hrv-main-grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 320px;
          gap: 1.15rem;
          align-items: start;
        }
        /* Grid items must be allowed to shrink below their content's
           min-content width — otherwise a single nowrap string forces the
           whole column ~700px wide on phones and text gets clipped. */
        .hrv-main-grid > * { min-width: 0; }
        .hrv-card {
          background: #fff;
          border: 1px solid #E7EAF3;
          border-radius: 18px;
          box-shadow: 0 1px 2px rgba(16, 24, 40, 0.04), 0 12px 28px -22px rgba(30, 27, 75, 0.3);
        }

        /* ═══ Timeline panel ═══ */
        .hrv-timeline-panel {
          padding: 1.15rem 1.3rem 0.9rem;
          /* Smooth-scroll landings stop below the fixed app header */
          scroll-margin-top: 72px;
        }
        /* Arrival flash: a soft indigo ring pulses once when a Quick Action
           or quick link jumps you to the timeline, so the filter change is
           unmistakable even if you were scrolled to the page bottom. */
        .hrv-timeline-panel.hrv-tl-flash { animation: hrvTlFlash 1.1s ease-out; }
        @keyframes hrvTlFlash {
          0% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.5); }
          70% { box-shadow: 0 0 0 12px rgba(99, 102, 241, 0); }
          100% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .hrv-timeline-panel.hrv-tl-flash { animation: none; }
        }
        .hrv-tl-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.75rem;
          flex-wrap: wrap;
          margin-bottom: 1rem;
        }
        .hrv-tl-head-left { display: flex; align-items: center; gap: 0.7rem; }
        .hrv-tl-head-icon {
          width: 38px;
          height: 38px;
          border-radius: 11px;
          background: #EEF2FF;
          color: #6366F1;
          display: grid;
          place-items: center;
        }
        .hrv-tl-head h2 { font-size: 1.15rem; font-weight: 800; color: #1E1B4B; font-family: var(--font-display); }
        .hrv-tl-head p { font-size: 0.76rem; color: #64748B; }
        .hrv-tl-filter { position: relative; display: inline-flex; align-items: center; }
        .hrv-tl-filter select {
          appearance: none;
          border: 1px solid #E7EAF3;
          border-radius: 999px;
          padding: 0.45rem 2rem 0.45rem 0.95rem;
          font-size: 0.8rem;
          font-weight: 700;
          color: #334155;
          background: #fff;
          cursor: pointer;
        }
        .hrv-tl-filter select:focus { outline: none; border-color: #A5B4FC; }
        .hrv-tl-filter svg { position: absolute; right: 0.75rem; pointer-events: none; color: #64748B; }

        /* Timeline: a continuous gradient rail line runs behind the dots,
           with the card content beside each dot. The line fades out at the
           bottom so it ends elegantly at the last entry. */
        .hrv-timeline {
          position: relative;
          --hrv-rail: 19px;
          display: flex;
          flex-direction: column;
        }
        .hrv-timeline::before {
          content: '';
          position: absolute;
          top: 10px;
          bottom: 6px;
          left: calc(var(--hrv-rail) - 1px);
          width: 2px;
          border-radius: 2px;
          background: linear-gradient(180deg, #818CF8 0%, #C7D2FE 45%, #BAE6FD 78%, rgba(186, 230, 253, 0) 100%);
        }
        .hrv-tl-item {
          position: relative;
          display: grid;
          grid-template-columns: 38px minmax(0, 1fr);
          align-items: start;
          gap: 0.8rem;
          width: 100%;
          background: none;
          border: none;
          padding: 0;
          text-align: left;
          font-family: inherit;
          cursor: pointer;
        }
        .hrv-tl-item + .hrv-tl-item { margin-top: 0.65rem; }
        .hrv-tl-dot {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          color: #fff;
          z-index: 1;
          box-shadow: 0 0 0 4px #fff, 0 6px 14px -6px rgba(30, 27, 75, 0.4);
          transition: transform var(--transition-fast);
        }
        .hrv-tl-item:hover .hrv-tl-dot { transform: scale(1.07); }
        .hrv-tl-card {
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
          min-width: 0;
          background: #F8FAFF;
          border: 1px solid #EDF1FA;
          border-radius: 14px;
          padding: 0.65rem 2.1rem 0.65rem 0.9rem;
          transition: border-color var(--transition-fast), box-shadow var(--transition-fast), transform var(--transition-fast), background var(--transition-fast);
        }
        .hrv-tl-item:hover .hrv-tl-card {
          background: #fff;
          border-color: #DDE4F8;
          box-shadow: 0 8px 18px -10px rgba(30, 27, 75, 0.22);
          transform: translateY(-1px);
        }
        .hrv-tl-item:focus-visible { outline: none; }
        .hrv-tl-item:focus-visible .hrv-tl-card { outline: 2px solid #6366F1; outline-offset: 2px; }
        .hrv-tl-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.6rem;
          flex-wrap: wrap;
        }
        .hrv-tl-when { font-size: 0.72rem; font-weight: 800; color: #64748B; line-height: 1.3; }
        .hrv-tl-badge { margin-left: auto; }
        .hrv-tl-chev {
          position: absolute;
          right: 0.7rem;
          top: 50%;
          transform: translateY(-50%);
          color: #94A3B8;
        }
        .hrv-tl-body { display: flex; flex-direction: column; min-width: 0; }
        .hrv-tl-title {
          font-size: 0.92rem;
          font-weight: 800;
          color: #1E293B;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          line-height: 1.35;
        }
        .hrv-tl-sub {
          font-size: 0.76rem;
          color: #64748B;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .hrv-tl-chev { color: #94A3B8; }

        /* Badges */
        .hrv-badge {
          font-size: 0.66rem;
          font-weight: 800;
          padding: 3px 11px;
          border-radius: 999px;
          white-space: nowrap;
        }
        .hrv-badge-pink { background: #FCE7F3; color: #BE185D; }
        .hrv-badge-violet { background: #EDE9FE; color: #6D28D9; }
        .hrv-badge-green { background: #D1FAE5; color: #047857; }
        .hrv-badge-blue { background: #DBEAFE; color: #1D4ED8; }
        .hrv-badge-amber { background: #FEF3C7; color: #B45309; }
        .hrv-badge-teal { background: #CCFBF1; color: #0F766E; }
        .hrv-badge-rose { background: #FFE4E6; color: #BE123C; }
        .hrv-badge-slate { background: #E2E8F0; color: #475569; }

        /* ═══ Quick links bar ═══ */
        .hrv-quick-links {
          display: flex;
          gap: 0.4rem;
          border-top: 1px solid #EDF1FA;
          margin-top: 1rem;
          padding: 0.7rem 0.2rem 0.2rem;
          overflow-x: auto;
        }
        .hrv-quick-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 0.76rem;
          font-weight: 700;
          color: #475569;
          padding: 0.45rem 0.8rem;
          border-radius: 10px;
          white-space: nowrap;
          transition: all var(--transition-fast);
        }
        .hrv-quick-link:hover { background: #EEF2FF; color: #4F46E5; }
        .hrv-quick-link svg { color: #818CF8; }

        /* ═══ Sidebar ═══ */
        .hrv-sidebar { display: flex; flex-direction: column; gap: 1.15rem; min-width: 0; }
        .hrv-sidebar > * { min-width: 0; }
        .hrv-overview-card { padding: 1.05rem 1.15rem; }
        .hrv-ov-head { display: flex; align-items: center; gap: 0.7rem; margin-bottom: 0.9rem; }
        .hrv-ov-head-icon {
          width: 38px;
          height: 38px;
          border-radius: 11px;
          background: #FEE2E2;
          color: #DC2626;
          display: grid;
          place-items: center;
          flex-shrink: 0;
        }
        .hrv-ov-head h3 { font-size: 1rem; font-weight: 800; color: #1E1B4B; font-family: var(--font-display); }
        .hrv-ov-head p { font-size: 0.72rem; color: #64748B; }

        .hrv-ov-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 0.65rem;
        }
        .hrv-ov-mini {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          min-width: 0;
          border-radius: 13px;
          padding: 0.65rem 0.7rem;
          border: 1px solid transparent;
        }
        .hrv-ov-mini-icon { flex-shrink: 0; display: inline-flex; }
        .hrv-ov-mini-texts { display: flex; flex-direction: column; min-width: 0; }
        .hrv-ov-mini-label { font-size: 0.74rem; font-weight: 800; color: #1E293B; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .hrv-ov-mini-value { font-size: 0.72rem; color: #64748B; font-weight: 600; }
        .hrv-ov-rose { background: #FDF0F4; }
        .hrv-ov-rose .hrv-ov-mini-icon { color: #E11D48; }
        .hrv-ov-green { background: #EDFBF3; }
        .hrv-ov-green .hrv-ov-mini-icon { color: #059669; }
        .hrv-ov-blue { background: #EBF5FF; }
        .hrv-ov-blue .hrv-ov-mini-icon { color: #2563EB; }
        .hrv-ov-amber { background: #FFF6E9; }
        .hrv-ov-amber .hrv-ov-mini-icon { color: #D97706; }
        .hrv-ov-lav { background: #F5F3FF; }
        .hrv-ov-lav .hrv-ov-mini-icon { color: #7C3AED; }

        /* ═══ Add record banner ═══ */
        .hrv-add-banner {
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 0.55rem;
          width: 100%;
          border: none;
          border-radius: 18px;
          padding: 1.05rem 1.1rem;
          text-align: left;
          font-family: inherit;
          cursor: pointer;
          background: linear-gradient(135deg, #EEF2FF 0%, #E0F2FE 55%, #EDE9FE 100%);
          box-shadow: 0 10px 24px -14px rgba(99, 102, 241, 0.45);
          transition: transform var(--transition-fast), box-shadow var(--transition-fast);
        }
        .hrv-add-banner:hover { transform: translateY(-2px); box-shadow: 0 14px 28px -14px rgba(99, 102, 241, 0.55); }
        .hrv-add-banner-icon {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          background: #fff;
          color: #6366F1;
          display: grid;
          place-items: center;
          box-shadow: 0 4px 10px -3px rgba(99, 102, 241, 0.35);
        }
        .hrv-add-banner-text {
          font-size: 0.86rem;
          font-weight: 800;
          color: #312E81;
          line-height: 1.35;
        }
        .hrv-heart { color: #F43F5E; }
        .hrv-add-banner-btn {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: linear-gradient(135deg, #6366F1, #8B5CF6);
          color: #fff;
          font-size: 0.74rem;
          font-weight: 800;
          padding: 0.4rem 0.85rem;
          border-radius: 999px;
          box-shadow: 0 4px 10px -3px rgba(99, 102, 241, 0.5);
        }
        .hrv-updated-note {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 0.7rem;
          color: #94A3B8;
          padding: 0 0.2rem;
        }

        /* ═══ Empty state ═══ */
        .hrv-empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 0.3rem;
          padding: 2.2rem 1rem;
          border: 1px dashed #D5DBF0;
          border-radius: 14px;
          background: #FCFCFF;
        }
        .hrv-empty-icon {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          background: #EEF2FF;
          color: #6366F1;
          margin-bottom: 0.2rem;
        }
        .hrv-empty-state h4 { font-size: 0.92rem; font-weight: 700; color: #1E293B; }
        .hrv-empty-state p { font-size: 0.8rem; color: #64748B; max-width: 420px; line-height: 1.5; }

        /* ═══ Drawer ═══ */
        .hrv-drawer-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(30, 27, 75, 0.4);
          backdrop-filter: blur(2px);
          z-index: 1000;
          display: flex;
          justify-content: flex-end;
          animation: hrvFadeIn 0.2s ease both;
        }
        @keyframes hrvFadeIn { from { opacity: 0; } to { opacity: 1; } }
        .hrv-drawer {
          width: min(520px, 100%);
          height: 100%;
          background: #fff;
          box-shadow: -16px 0 40px rgba(30, 27, 75, 0.2);
          display: flex;
          flex-direction: column;
          min-width: 0;
          animation: hrvSlideIn 0.25s ease both;
        }
        @keyframes hrvSlideIn {
          from { transform: translateX(40px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          .hrv-drawer, .hrv-drawer-backdrop { animation: none; }
        }
        .hrv-drawer-head {
          padding: 1.1rem 1.3rem;
          border-bottom: 1px solid #EAECF0;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 0.75rem;
          background: linear-gradient(180deg, #FBFBFF, #fff);
        }
        .hrv-drawer-type {
          display: inline-block;
          font-size: 0.64rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.07em;
          color: #6D28D9;
          background: #F3F1FD;
          border-radius: 999px;
          padding: 2px 9px;
          margin-bottom: 6px;
        }
        .hrv-drawer-title { font-size: 1.08rem; font-weight: 800; color: #1E1B4B; line-height: 1.3; }
        .hrv-drawer-meta {
          display: flex;
          align-items: center;
          gap: 5px;
          flex-wrap: wrap;
          font-size: 0.78rem;
          color: #5D6B7E;
          margin-top: 5px;
        }
        .hrv-drawer-meta svg { color: #98A2B3; }
        .hrv-meta-sep { color: #D0D5DD; }
        .hrv-drawer-close {
          display: grid;
          place-items: center;
          width: 32px;
          height: 32px;
          border-radius: 9px;
          color: #667085;
          flex-shrink: 0;
        }
        .hrv-drawer-close:hover { background: #F2F4F7; color: #101828; }
        .hrv-drawer-body {
          flex: 1;
          min-height: 0;
          overflow-y: auto;
          padding: 1.1rem 1.3rem 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.1rem;
        }
        /* Long content must never force sideways page overflow: blocks wrap,
           and anything inherently wide (lab tables) scrolls inside its box. */
        .hrv-drawer-body > * { max-width: 100%; min-width: 0; }
        .hrv-detail-block { max-width: 100%; min-width: 0; }
        .hrv-detail-block p {
          max-width: 100%;
          overflow-wrap: break-word;
          word-break: break-word;
          white-space: pre-wrap;
        }
        .hrv-detail-label { max-width: 100%; }
        .hrv-flag-chip {
          max-width: 100%;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .hrv-attachment {
          max-width: 100%;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .hrv-detail-block { display: flex; flex-direction: column; gap: 0.45rem; }
        .hrv-detail-label {
          font-size: 0.66rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.07em;
          color: #8494A7;
        }
        .hrv-detail-block p { font-size: 0.86rem; color: #344054; line-height: 1.6; }
        .hrv-flag-chip {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 0.7rem;
          font-weight: 700;
          color: #B42318;
          background: #FEF3F2;
          border: 1px solid #FECDCA;
          padding: 2px 8px;
          border-radius: 999px;
        }
        .hrv-flag-row { display: flex; flex-wrap: wrap; gap: 0.35rem; }
        .hrv-attachments { display: flex; flex-direction: column; gap: 4px; }
        .hrv-attachment {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 0.78rem;
          color: #344054;
          font-weight: 600;
        }
        .hrv-attachment em { font-style: normal; color: #8494A7; font-weight: 500; font-size: 0.7rem; }
        .hrv-entry-verified {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 0.72rem;
          font-weight: 600;
          color: #667085;
          border-top: 1px dashed #EAECF0;
          padding-top: 0.8rem;
        }
        .hrv-entry-verified svg { color: #10B981; }

        /* ═══ Lab table ═══ */
        .hrv-table-scroll { overflow-x: auto; border: 1px solid #EAECF0; border-radius: 10px; }
        .hrv-lab-table { width: 100%; border-collapse: collapse; font-size: 0.8rem; min-width: 420px; }
        .hrv-lab-table th {
          text-align: left;
          font-size: 0.64rem;
          text-transform: uppercase;
          letter-spacing: 0.07em;
          color: #5D6B7E;
          background: #F8FAFC;
          padding: 0.5rem 0.75rem;
          border-bottom: 1px solid #EAECF0;
          font-weight: 800;
          white-space: nowrap;
        }
        .hrv-lab-table td { padding: 0.55rem 0.75rem; border-bottom: 1px solid #F2F4F7; color: #344054; }
        .hrv-lab-table tr:last-child td { border-bottom: none; }
        .hrv-td-name { font-weight: 600; color: #101828; }
        .hrv-td-value { font-weight: 700; font-variant-numeric: tabular-nums; }
        .hrv-abnormal { color: #B42318; }
        .hrv-td-ref { color: #8494A7; font-variant-numeric: tabular-nums; }
        .hrv-row-abnormal td { background: #FFFBFA; }

        /* ═══ Add record modal ═══ */
        .hrv-add-modal {
          margin: auto;
          width: min(560px, calc(100% - 2rem));
          max-height: calc(100dvh - 1.5rem);
          background: #fff;
          border-radius: 18px;
          box-shadow: 0 24px 60px rgba(30, 27, 75, 0.25);
          display: flex;
          flex-direction: column;
          min-width: 0;
          overflow: hidden auto;
          animation: hrvRiseIn 0.25s ease both;
        }
        @keyframes hrvRiseIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .hrv-add-modal-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 1.25rem;
          border-bottom: 1px solid #EAECF0;
          background: linear-gradient(180deg, #FBFBFF, #fff);
        }
        .hrv-add-modal-head h3 {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          font-size: 1rem;
          font-weight: 800;
          color: #1E1B4B;
        }
        .hrv-add-modal-head button {
          display: grid;
          place-items: center;
          width: 32px;
          height: 32px;
          border-radius: 9px;
          color: #667085;
        }
        .hrv-add-modal-head button:hover { background: #F2F4F7; color: #101828; }
        .hrv-add-modal-body {
          flex: 1 1 auto;
          min-height: 0;
          padding: 1.1rem 1.25rem;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 0.7rem;
        }
        .hrv-add-options { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.5rem; }
        .hrv-add-option {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          padding: 0.7rem 0.4rem;
          border-radius: 12px;
          border: 1.5px solid #EAECF0;
          background: #FCFCFD;
          font-size: 0.66rem;
          font-weight: 700;
          color: #475467;
          text-align: center;
          font-family: inherit;
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        .hrv-add-option:hover { border-color: #C7D2FE; color: #4F46E5; background: #FAFAFF; }
        .hrv-add-option-icon {
          width: 34px;
          height: 34px;
          border-radius: 10px;
          display: grid;
          place-items: center;
          background: #EEF2FF;
          color: #4F46E5;
        }
        .hrv-add-option:nth-child(2) .hrv-add-option-icon { background: #DBEAFE; color: #1D4ED8; }
        .hrv-add-option:nth-child(3) .hrv-add-option-icon { background: #CCFBF1; color: #0F766E; }
        .hrv-add-option:nth-child(4) .hrv-add-option-icon { background: #FEF3C7; color: #B45309; }
        .hrv-add-option:nth-child(5) .hrv-add-option-icon { background: #D1FAE5; color: #047857; }
        .hrv-add-option:nth-child(6) .hrv-add-option-icon { background: #FFE4E6; color: #BE123C; }
        .hrv-add-option:nth-child(7) .hrv-add-option-icon { background: #E2E8F0; color: #475569; }
        .hrv-add-option:nth-child(8) .hrv-add-option-icon { background: #EDE9FE; color: #6D28D9; }
        .hrv-opt-selected {
          border-color: #6366F1 !important;
          background: #EEF2FF !important;
          color: #4338CA !important;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
        }
        .hrv-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.7rem; }
        .hrv-form-field { display: flex; flex-direction: column; gap: 0.3rem; }
        .hrv-form-wide { grid-column: 1 / -1; }
        .hrv-form-field label {
          font-size: 0.66rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: #8494A7;
        }
        .hrv-form-field input,
        .hrv-form-field textarea {
          border: 1px solid #E7EAF3;
          border-radius: 9px;
          padding: 0.55rem 0.7rem;
          font-size: 0.85rem;
          color: #1D2939;
          background: #fff;
          font-family: inherit;
          resize: vertical;
        }
        .hrv-form-field input:focus,
        .hrv-form-field textarea:focus {
          outline: none;
          border-color: #A5B4FC;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.12);
        }
        .hrv-add-modal-foot {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          flex-shrink: 0;
          gap: 0.6rem;
          padding: 0.9rem 1.25rem;
          border-top: 1px solid #EAECF0;
          background: #FCFCFF;
        }
        .hrv-btn-outline {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          border: 1px solid #E2E8F0;
          color: #475569;
          background: #fff;
          padding: 0.5rem 1rem;
          border-radius: 9px;
          font-size: 0.82rem;
          font-weight: 700;
          font-family: inherit;
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        .hrv-btn-outline:hover { background: #F8FAFC; }
        .hrv-add-save-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 0.5rem 1.1rem;
          border-radius: 9px;
          border: none;
          background: linear-gradient(135deg, #6366F1, #8B5CF6);
          color: #fff;
          font-size: 0.82rem;
          font-weight: 800;
          font-family: inherit;
          cursor: pointer;
          box-shadow: 0 4px 12px -4px rgba(99, 102, 241, 0.55);
        }
        .hrv-add-save-btn:disabled { opacity: 0.45; cursor: not-allowed; box-shadow: none; }

        /* ═══ Shared: no-scrollbar helper ═══ */
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .no-scrollbar::-webkit-scrollbar { display: none; }

        /* ═══ Horizontal scroll rails (desktop + mobile) ═══ */
        .hrv-rail-wrap {
          position: relative;
          min-width: 0;
        }
        .hrv-rail-wrap .hrv-cat-row,
        .hrv-rail-wrap .hrv-quick-links {
          scroll-snap-type: x proximity;
          overscroll-behavior-x: contain;
          -webkit-overflow-scrolling: touch;
        }
        .hrv-cat-row { scroll-padding-left: 2px; }
        .hrv-cat-card { scroll-snap-align: start; }
        .hrv-quick-link { scroll-snap-align: start; }

        /* Edge fade hints: subtle on desktop, stronger on touch screens */
        .hrv-rail-wrap::before,
        .hrv-rail-wrap::after {
          content: '';
          position: absolute;
          top: 0;
          bottom: 4px;
          width: 28px;
          z-index: 1;
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.25s ease;
        }
        .hrv-rail-wrap::before {
          left: -14px;
          background: linear-gradient(90deg, var(--bg-app, #F7F9FC), transparent);
        }
        .hrv-rail-wrap::after {
          right: -14px;
          background: linear-gradient(270deg, var(--bg-app, #F7F9FC), transparent);
        }
        @media (hover: none) and (pointer: coarse) {
          .hrv-rail-wrap::before,
          .hrv-rail-wrap::after {
            width: 44px;
            opacity: 1;
          }
        }

        /* ═══ Responsive ═══ */
        @media (max-width: 1100px) {
          .hrv-main-grid { grid-template-columns: 1fr; }
          .hrv-sidebar { display: grid; grid-template-columns: 1fr 1fr; align-items: start; }
        }
        @media (max-width: 768px) {
          .hrv-root { gap: 0.9rem; }

          /* Page header stacks, search spans full width */
          .hrv-page-head { flex-direction: column; align-items: stretch; gap: 0.85rem; }
          .hrv-page-icon { width: 40px; height: 40px; border-radius: 12px; }
          .hrv-page-title { font-size: 1.45rem; }
          .hrv-page-sub { font-size: 0.84rem; }
          .hrv-page-actions { width: 100%; }
          .hrv-search-shell { flex: 1; min-width: 0; padding: 0.6rem 0.9rem; }
          /* 16px input avoids the iOS auto-zoom on focus */
          .hrv-search-shell input { font-size: 16px; }
          .hrv-clear-search {
            display: grid;
            place-items: center;
            width: 28px;
            height: 28px;
            border-radius: 50%;
            color: #94A3B8;
            flex-shrink: 0;
          }
          .hrv-safety-pill { display: none; }

          /* Medical Alert stays a slim single row; chips scroll inside */
          .hrv-med-alert { gap: 0.55rem; padding: 0.45rem 0.6rem; }
          .hrv-med-alert-chip { max-width: 200px; }

          /* Category cards: comfortable fixed-width swipe rail */
          .hrv-cat-row {
            margin: 0 -1rem;
            padding: 0.25rem 1rem 0.45rem;
            gap: 0.65rem;
          }
          .hrv-cat-card { flex: 0 0 216px; }
          .hrv-cat-icon { width: 40px; height: 40px; }
          .hrv-cat-label { font-size: 0.85rem; }
          .hrv-cat-count { font-size: 0.74rem; }

          /* Timeline: slim rail on the left, full-width cards — nothing
             overlaps and long summaries clamp to two lines instead of
             being cut off at the screen edge. */
          .hrv-timeline-panel { padding: 1rem 0.9rem 0.75rem; }
          .hrv-tl-head { margin-bottom: 0.85rem; }
          .hrv-tl-head h2 { font-size: 1.05rem; }
          .hrv-tl-filter select { font-size: 16px; }
          .hrv-timeline { --hrv-rail: 17px; }
          .hrv-tl-item { grid-template-columns: 34px minmax(0, 1fr); gap: 0.7rem; }
          .hrv-tl-dot { width: 34px; height: 34px; box-shadow: 0 0 0 3px #fff, 0 5px 12px -6px rgba(30, 27, 75, 0.4); }
          .hrv-tl-card { padding: 0.75rem 1.7rem 0.75rem 0.85rem; }
          .hrv-tl-when { font-size: 0.68rem; }
          .hrv-tl-sub {
            white-space: normal;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
          .hrv-tl-chev { right: 0.55rem; }

          /* Quick links: edge-to-edge swipeable pill rail */
          .hrv-quick-links {
            margin: 1rem -0.9rem 0;
            padding: 0.7rem 0.9rem 0.25rem;
            gap: 0.35rem;
          }
          .hrv-quick-link { font-size: 0.8rem; padding: 0.5rem 0.75rem; }

          /* Sidebar reflows below the timeline */
          .hrv-sidebar { grid-template-columns: 1fr; gap: 0.9rem; }
          .hrv-ov-head-icon { width: 34px; height: 34px; }
          .hrv-ov-head h3 { font-size: 0.95rem; }
          .hrv-ov-head p { font-size: 0.7rem; }

          /* Drawer becomes a full-height bottom sheet that ALWAYS fits the
             viewport: dvh accounts for mobile browser chrome, and the body
             is the only scrolling region (header stays pinned). */
          .hrv-drawer-backdrop { align-items: flex-end; justify-content: center; }
          .hrv-drawer {
            width: 100%;
            height: 100dvh;
            max-height: 100dvh;
            border-radius: 22px 22px 0 0;
            animation: hrvSheetUp 0.3s cubic-bezier(0.22, 1, 0.36, 1) both;
          }
          .hrv-drawer-head {
            position: sticky;
            top: 0;
            z-index: 2;
            flex-shrink: 0;
            padding: 1rem 1.05rem 0.85rem;
          }
          .hrv-drawer-head::after {
            content: '';
            position: absolute;
            left: 0;
            right: 0;
            bottom: -7px;
            height: 7px;
            background: linear-gradient(180deg, rgba(16, 24, 40, 0.07), transparent);
            pointer-events: none;
          }
          .hrv-drawer-body { padding: 1rem 1.05rem calc(1.4rem + env(safe-area-inset-bottom, 0px)); }
          .hrv-drawer-close { width: 38px; height: 38px; }
          /* The sheet scrolls vertically only; anything oversized (lab table)
             scrolls horizontally inside its own box, never the page. */
          .hrv-drawer,
          .hrv-drawer-body { overflow-x: hidden; }
          .hrv-table-scroll {
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: thin;
          }
          .hrv-lab-table { min-width: 430px; }

          /* Add-record sheet: form scrolls in the middle, Save button is
             always pinned and visible at the bottom of the screen. */
          .hrv-add-modal {
            margin: 0;
            width: 100%;
            max-height: 100dvh;
            border-radius: 22px 22px 0 0;
            animation: hrvSheetUp 0.3s cubic-bezier(0.22, 1, 0.36, 1) both;
          }
          .hrv-add-modal-head { position: sticky; top: 0; z-index: 2; padding: 1rem 1.05rem 0.85rem; }
          .hrv-add-modal-head h3 { font-size: 0.95rem; }
          .hrv-add-modal-body { padding: 1rem 1.05rem; }
          .hrv-add-options { grid-template-columns: repeat(2, 1fr); }
          .hrv-add-option { flex-direction: row; justify-content: flex-start; padding: 0.6rem 0.7rem; font-size: 0.74rem; }
          .hrv-add-option span:last-child { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
          .hrv-form-grid { grid-template-columns: 1fr; }
          .hrv-form-field input,
          .hrv-form-field textarea { font-size: 16px; }
          .hrv-add-modal-foot {
            position: sticky;
            bottom: 0;
            z-index: 2;
            padding: 0.85rem 1.05rem calc(0.85rem + env(safe-area-inset-bottom, 0px));
          }
        }

        /* Small phones in portrait (≤ 360px): tighten spacing, keep text whole */
        @media (max-width: 360px) {
          .hrv-page-title { font-size: 1.3rem; }
          .hrv-cat-card { flex-basis: 200px; }
          .hrv-timeline { --hrv-rail: 16px; }
          .hrv-tl-item { grid-template-columns: 32px minmax(0, 1fr); }
          .hrv-tl-dot { width: 32px; height: 32px; }
          .hrv-tl-title { font-size: 0.88rem; }
          .hrv-tl-card { padding: 0.7rem 1.6rem 0.7rem 0.75rem; }
        }

        /* Landscape phones: drawer slides from the side, add-record dialog
           stays centered and fully visible within the short viewport. */
        @media (max-width: 916px) and (orientation: landscape) {
          .hrv-drawer-backdrop { align-items: stretch; justify-content: flex-end; }
          .hrv-drawer {
            height: 100%;
            max-height: none;
            border-radius: 18px 0 0 18px;
            animation: hrvSlideIn 0.25s ease both;
          }
          .hrv-add-modal {
            margin: auto;
            width: min(520px, calc(100% - 2rem));
            max-height: calc(100dvh - 1.5rem);
            border-radius: 18px;
            animation: hrvRiseIn 0.25s ease both;
          }
        }

        @keyframes hrvSheetUp {
          from { transform: translateY(60px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          .hrv-drawer,
          .hrv-drawer-backdrop,
          .hrv-add-modal { animation: none !important; }
          .hrv-rail-wrap::before,
          .hrv-rail-wrap::after { transition: none; }
        }
      `}</style>
    </div>
  );
};

// Order used to build the timeline filter dropdown
const RECORD_TYPE_META_ORDER = [
  'DIAGNOSIS',
  'PRESCRIPTION',
  'LAB_REPORT',
  'SCAN',
  'HOSPITAL_VISIT',
  'IMMUNIZATION',
  'DOCUMENT',
];

function activeAlertsCount(records: UiRecord[]): number {
  return records.filter((r) => (r.criticalFlags ?? []).length > 0).length;
}
