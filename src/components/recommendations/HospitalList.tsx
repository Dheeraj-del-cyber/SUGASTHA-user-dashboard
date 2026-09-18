import React, { useState } from 'react';
import {
  MapPin,
  Car,
  Clock,
  UserCheck,
  CheckCircle,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { Hospital, Doctor, TriageResult } from '../../types';
import { hospitalQueueService } from '../../services/hospitalQueueService';

interface HospitalListProps {
  triage: TriageResult;
  onSelectHospitalAndDoctor: (hospital: Hospital, doctor: Doctor) => void;
}

export const HospitalList: React.FC<HospitalListProps> = ({
  triage,
  onSelectHospitalAndDoctor,
}) => {
  const hospitals = hospitalQueueService.getRecommendedHospitals(triage);

  // Selected hospital and doctor states
  const [selectedHospId, setSelectedHospId] = useState<string>(hospitals[0]?.id || '');
  const [selectedDocIdByHosp, setSelectedDocIdByHosp] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    hospitals.forEach((h) => {
      const bestDoc = hospitalQueueService.getBestMatchingDoctor(h, triage);
      initial[h.id] = bestDoc.id;
    });
    return initial;
  });

  const handleDoctorChange = (hospId: string, docId: string) => {
    setSelectedDocIdByHosp({
      ...selectedDocIdByHosp,
      [hospId]: docId,
    });
  };

  const currentHospital = hospitals.find((h) => h.id === selectedHospId) || hospitals[0];
  const currentDocId = selectedDocIdByHosp[currentHospital.id] || currentHospital.doctors[0].id;
  const currentDoctor = currentHospital.doctors.find((d) => d.id === currentDocId) || currentHospital.doctors[0];

  const handleProceed = () => {
    onSelectHospitalAndDoctor(currentHospital, currentDoctor);
  };

  return (
    <div className="hospital-rec-container animate-fade-in">
      {/* Header Banner */}
      <div className="rec-header">
        <div>
          <h2 className="rec-title">Choose a hospital</h2>
        </div>

        {/* 3-Tier Queue Info Card */}
        <div className="queue-tip-card">
          <ShieldCheck size={18} className="text-teal flex-shrink-0" />
          <div className="queue-tip-text">
            <strong>If this hospital is full,</strong> we will try the next one.
          </div>
        </div>
      </div>

      {/* Hospital Cards Feed */}
      <div className="hospitals-list-feed">
        {hospitals.map((hosp, index) => {
          const isSelectedHosp = hosp.id === selectedHospId;
          const activeDocId = selectedDocIdByHosp[hosp.id] || hosp.doctors[0].id;
          const activeDoc = hosp.doctors.find((d) => d.id === activeDocId) || hosp.doctors[0];

          return (
            <div
              key={hosp.id}
              onClick={() => setSelectedHospId(hosp.id)}
              className={`card hospital-card card-interactive ${
                isSelectedHosp ? 'selected-hospital-card' : ''
              }`}
            >
              {/* Card Top: Name, Distance & Accreditation */}
              <div className="hosp-card-header">
                <div className="hosp-main-info">
                  <div className="rank-indicator">{index === 0 ? '★' : index + 1}</div>
                  <div>
                    <div className="hosp-name-row">
                      <h3 className="hosp-name">{hosp.name}</h3>
                      {index === 0 && <span className="nabh-badge">Best match for you</span>}
                    </div>
                    <div className="hosp-address">
                      <MapPin size={13} className="text-muted" />
                      <span>{hosp.address}</span>
                    </div>
                  </div>
                </div>

                {/* Selection Radio Indicator */}
                <div className={`selection-radio ${isSelectedHosp ? 'checked' : ''}`}>
                  {isSelectedHosp && <div className="radio-inner"></div>}
                </div>
              </div>

              {/* Travel & Wait Strip */}
              <div className="travel-fare-strip">
                <div className="strip-item">
                  <MapPin size={14} className="text-teal" />
                  <span className="strip-val">{hosp.distanceKm} km</span>
                  <span className="strip-sub">Away</span>
                </div>

                <div className="strip-item">
                  <Clock size={14} className="text-amber" />
                  <span className="strip-val">~{hosp.estimatedTravelTimeMinutes} mins</span>
                  <span className="strip-sub">Travel</span>
                </div>

                <div className="strip-item fare-item">
                  <Car size={14} className="text-emerald" />
                  <div className="fare-col">
                    <span className="strip-val">₹{hosp.fareEstimates.autoFare} - ₹{hosp.fareEstimates.cabFare}</span>
                    <span className="strip-sub">Auto - cab</span>
                  </div>
                </div>

                <div className="strip-item desk-item">
                  <span className={`status-dot ${hosp.emergencyQueueStatus === 'NORMAL' ? 'dot-green' : 'dot-yellow'}`}></span>
                  <span className="strip-val">{hosp.emergencyQueueStatus === 'NORMAL' ? 'Not crowded' : 'A little busy'}</span>
                  <span className="strip-sub">Now</span>
                </div>
              </div>

              {/* Doctor Selection Section */}
              <div className="doctor-select-section">
                <div className="doc-section-title">
                  <UserCheck size={15} className="text-teal" />
                  <span>Doctors</span>
                </div>

                <div className="doctors-chips-grid" aria-label={`Doctors at ${hosp.name}`}>
                  {hosp.doctors.map((doc) => {
                    const isDocSelected = doc.id === activeDocId;
                    return (
                      <div
                        key={doc.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedHospId(hosp.id);
                          handleDoctorChange(hosp.id, doc.id);
                        }}
                        className={`doc-chip ${isDocSelected ? 'active-doc-chip' : ''}`}
                      >
                        <div className="doc-chip-top">
                          <strong className="doc-name">{doc.name}</strong>
                        </div>
                        <span className="doc-spec text-teal">{doc.specialization}</span>
                        <div className="doc-slot-row">
                          <span className="doc-slot">Next: {doc.availableSlotToday}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Selected Highlight Footer */}
              {isSelectedHosp && (
                <div className="selected-confirmation-pill">
                  <CheckCircle size={15} className="text-emerald" />
                  <span>
                    Selected: <strong>{activeDoc.name}</strong>
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Sticky Bottom Action Drawer */}
      <div className="selection-cta-drawer">
        <div className="selected-summary-col">
          <div className="selected-entity-title">
            <strong>{currentHospital.name}</strong>
          </div>
        </div>

        <button
          onClick={handleProceed}
          className="btn btn-primary btn-lg book-request-btn"
        >
          <span>Book Visit</span>
          <ArrowRight size={18} />
        </button>
      </div>

      <style>{`
        .hospital-rec-container {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .rec-header {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .rec-badge-row {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          margin-bottom: 0.5rem;
          flex-wrap: wrap;
        }
        .spec-match-pill {
          display: flex;
          align-items: center;
          gap: 4px;
          background: rgba(14, 165, 233, 0.12);
          border: 1px solid rgba(14, 165, 233, 0.35);
          color: #38bdf8;
          font-size: 0.75rem;
          padding: 3px 10px;
          border-radius: var(--radius-full);
          font-weight: 500;
        }
        .rec-title {
          font-size: 1.4rem;
        }
        .rec-subtitle {
          font-size: 0.88rem;
          color: var(--text-secondary);
        }
        .queue-tip-card {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          background: var(--pastel-light-blue);
          border: 1px solid var(--pastel-sky-blue);
          border-radius: var(--radius-sm);
          padding: 0.85rem 1.1rem;
        }
        .queue-tip-text {
          font-size: 0.82rem;
          color: var(--text-secondary);
          line-height: 1.45;
        }
        .queue-tip-text strong {
          color: var(--brand-primary);
        }
        .hospitals-list-feed {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        .hospital-card {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          cursor: pointer;
          border: 1px solid #17202A;
          position: relative;
          padding: 1rem;
        }
        .selected-hospital-card {
          border-color: #17202A;
          background: var(--pastel-light-blue);
          box-shadow: var(--shadow-soft);
        }
        .hosp-card-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
        }
        .hosp-main-info {
          display: flex;
          align-items: flex-start;
          gap: 0.85rem;
        }
        .rank-indicator {
          width: 32px;
          height: 32px;
          border-radius: var(--radius-xs);
          background: var(--bg-surface-3);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.85rem;
          color: var(--brand-accent);
          flex-shrink: 0;
        }
        .hosp-name-row {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          flex-wrap: wrap;
        }
        .hosp-name {
          font-size: 1.15rem;
          font-weight: 700;
          color: var(--dark-navy-text);
        }
        .nabh-badge {
          font-size: 0.65rem;
          font-weight: 800;
          background: var(--pastel-green-bg);
          color: var(--pastel-green-accent);
          border: 1px solid #B7DEC2;
          padding: 1px 6px;
          border-radius: var(--radius-xs);
        }
        .hosp-address {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 0.8rem;
          color: var(--text-muted);
          margin-top: 3px;
        }
        .selection-radio {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          border: 2px solid var(--border-subtle);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .selection-radio.checked {
          border-color: var(--brand-primary);
        }
        .radio-inner {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: var(--brand-primary);
        }
        .travel-fare-strip {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0.75rem;
          background: var(--bg-surface-3);
          padding: 0.6rem 0.8rem;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-light);
        }
        .strip-item {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .fare-col {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .strip-val {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--dark-navy-text);
        }
        .strip-sub {
          font-size: 0.7rem;
          color: var(--text-muted);
        }
        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          display: inline-block;
          margin-bottom: 2px;
        }
        .dot-green {
          background: #10b981;
          box-shadow: 0 0 6px #10b981;
        }
        .dot-yellow {
          background: #f59e0b;
          box-shadow: 0 0 6px #f59e0b;
        }
        .doctor-select-section {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }
        .doc-section-title {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-secondary);
        }
        .doctors-chips-grid {
          display: flex;
          gap: 0.65rem;
          overflow-x: auto;
          padding: 0.1rem 0.1rem 0.3rem;
          scroll-snap-type: x proximity;
          scrollbar-width: thin;
        }
        .doc-chip {
          flex: 0 0 220px;
          background: var(--bg-surface-3);
          border: 1px solid #000000;
          padding: 0.6rem;
          border-radius: var(--radius-sm);
          display: flex;
          flex-direction: column;
          gap: 3px;
          min-height: 92px;
          scroll-snap-align: start;
          transition: all var(--transition-fast);
        }
        .doc-chip:hover {
          border-color: #000000;
        }
        .doc-chip.active-doc-chip {
          background: var(--pastel-light-blue);
          border-color: #000000;
        }
        .doc-chip-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .doc-name {
          font-size: 0.85rem;
          color: var(--dark-navy-text);
        }
        .doc-spec {
          font-size: 0.75rem;
        }
        .doc-slot-row {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          font-size: 0.7rem;
          color: var(--text-muted);
          margin-top: 2px;
        }
        .doc-slot {
          color: var(--pastel-green-accent);
          font-weight: 500;
        }
        .selected-confirmation-pill {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: var(--pastel-green-bg);
          border: 1px solid #B7DEC2;
          padding: 0.4rem 0.7rem;
          border-radius: var(--radius-sm);
          font-size: 0.8rem;
          color: var(--dark-navy-text);
          min-width: 0;
        }
        .selected-confirmation-pill span {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .selection-cta-drawer {
          position: sticky;
          bottom: 1rem;
          background: rgba(255, 255, 255, 0.96);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid var(--border-light);
          border-radius: var(--radius-sm);
          padding: 0.65rem 0.85rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          box-shadow: var(--shadow-md);
          z-index: 50;
        }
        .selected-summary-col {
          display: flex;
          flex-direction: column;
          min-width: 0;
        }
        .selected-entity-title {
          font-size: 0.9rem;
          color: var(--dark-navy-text);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .selected-entity-title strong {
          color: var(--brand-primary);
        }
        .book-request-btn {
          padding: 0.55rem 1rem;
          font-size: 0.85rem;
          flex-shrink: 0;
        }
        @media (max-width: 768px) {
          .hospital-rec-container {
            gap: 1rem;
          }
          .hospital-card {
            padding: 1rem;
            gap: 0.85rem;
          }
          .hosp-name {
            font-size: 1.05rem;
          }
          .hosp-address {
            max-width: 250px;
            line-height: 1.3;
          }
          .travel-fare-strip {
            display: flex;
            align-items: center;
            gap: 0.35rem;
            padding: 0.5rem 0.55rem;
            overflow: hidden;
          }
          .travel-fare-strip .strip-item {
            flex: 1 1 0;
            min-width: 0;
            flex-direction: row;
            align-items: center;
            gap: 3px;
            overflow: hidden;
          }
          .travel-fare-strip .desk-item {
            display: none;
          }
          .travel-fare-strip .strip-item > svg {
            width: 12px;
            height: 12px;
            flex-shrink: 0;
          }
          .travel-fare-strip .strip-val {
            min-width: 0;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            font-size: 0.68rem;
          }
          .travel-fare-strip .strip-sub {
            display: none;
          }
          .travel-fare-strip .fare-col {
            min-width: 0;
            flex-direction: row;
          }
          .selection-cta-drawer {
            gap: 0.65rem;
            bottom: calc(var(--bottom-nav-height) + 1.25rem);
          }
          .book-request-btn {
            width: auto;
          }
          .doc-chip {
            flex-basis: 220px;
          }
        }
      `}</style>
    </div>
  );
};
