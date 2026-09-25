import React, { useEffect, useState } from 'react';
import { Building2, MapPin, Loader2, Siren, BedDouble, RefreshCw } from 'lucide-react';
import { Hospital } from '../../types';
import {
  hospitalDashboardService,
  GovtHospitalRecommendation,
  UserGeoLocation,
} from '../../services/hospitalDashboardService';

interface NearestGovtHospitalsProps {
  userLocation: UserGeoLocation | null;
  onRequestLocation: () => void;
  onBookAtHospital: (hospital: Hospital) => void;
}

export const NearestGovtHospitals: React.FC<NearestGovtHospitalsProps> = ({
  userLocation,
  onRequestLocation,
  onBookAtHospital,
}) => {
  const [hospitals, setHospitals] = useState<GovtHospitalRecommendation[]>([]);
  const [status, setStatus] = useState<'idle' | 'loading' | 'loaded' | 'unreachable'>('idle');

  useEffect(() => {
    if (!userLocation) return;
    let cancelled = false;
    setStatus('loading');
    hospitalDashboardService.getNearbyGovtHospitals(userLocation, 4).then((result) => {
      if (cancelled) return;
      if (result.length === 0) {
        setStatus('unreachable');
      } else {
        setHospitals(result);
        setStatus('loaded');
      }
    });
    return () => {
      cancelled = true;
    };
  }, [userLocation]);

  if (!userLocation) {
    return (
      <div className="govt-hosp-card govt-hosp-empty">
        <div className="govt-hosp-empty-icon"><MapPin size={22} /></div>
        <div>
          <h3>Find the nearest government hospitals</h3>
          <p>Share your location to see the 4 closest government hospitals connected to the SUGASTHA network, with live bed and queue status.</p>
        </div>
        <button className="btn btn-primary" onClick={onRequestLocation}>
          Share my location
        </button>
        <style>{cardStyles}</style>
      </div>
    );
  }

  return (
    <div className="govt-hosp-card">
      <div className="govt-hosp-header">
        <div className="govt-hosp-title">
          <Building2 size={19} />
          <h3>Nearest Government Hospitals</h3>
        </div>
        <button className="govt-hosp-refresh" onClick={onRequestLocation} title="Update location">
          <RefreshCw size={14} /> Update location
        </button>
      </div>

      {status === 'loading' && (
        <div className="govt-hosp-status">
          <Loader2 size={18} className="spin" /> Finding hospitals near you…
        </div>
      )}

      {status === 'unreachable' && (
        <div className="govt-hosp-status govt-hosp-status-warn">
          Couldn't reach the hospital network right now. Please try again shortly, or use "Start New AI Triage" to search all nearby hospitals instead.
        </div>
      )}

      {status === 'loaded' && (
        <div className="govt-hosp-list">
          {hospitals.map((h) => (
            <div key={h.id} className="govt-hosp-item">
              <div className="govt-hosp-item-main">
                <div className="govt-hosp-item-top">
                  <span className="govt-hosp-name">{h.name}</span>
                  <span className="govt-hosp-distance">{h.distance_km} km away</span>
                </div>
                <p className="govt-hosp-address">{h.address}</p>
                <div className="govt-hosp-badges">
                  <span className="govt-hosp-badge">
                    <BedDouble size={12} /> {h.icu_beds_available} ICU beds free
                  </span>
                  {h.emergency_available && (
                    <span className="govt-hosp-badge govt-hosp-badge-emergency">
                      <Siren size={12} /> Emergency 24x7
                    </span>
                  )}
                  <span className="govt-hosp-badge">★ {h.rating.toFixed(1)}</span>
                </div>
              </div>
              <button
                className="btn btn-secondary govt-hosp-book-btn"
                onClick={() => onBookAtHospital(hospitalDashboardService.toLocalHospital(h))}
              >
                Get consultation token
              </button>
            </div>
          ))}
        </div>
      )}

      <style>{cardStyles}</style>
    </div>
  );
};

const cardStyles = `
  .govt-hosp-card {
    background: var(--bg-surface-1);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-lg);
    padding: 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  .govt-hosp-empty {
    align-items: flex-start;
  }
  .govt-hosp-empty-icon {
    width: 42px;
    height: 42px;
    border-radius: 999px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--pastel-light-blue);
    color: var(--brand-primary);
  }
  .govt-hosp-empty h3 {
    font-size: 1rem;
    font-weight: 700;
    margin-bottom: 0.25rem;
  }
  .govt-hosp-empty p {
    font-size: 0.85rem;
    color: var(--text-muted);
    margin-bottom: 0.5rem;
  }
  .govt-hosp-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  .govt-hosp-title {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  .govt-hosp-title h3 {
    font-size: 1rem;
    font-weight: 700;
  }
  .govt-hosp-refresh {
    display: flex;
    align-items: center;
    gap: 0.3rem;
    font-size: 0.78rem;
    color: var(--text-muted);
  }
  .govt-hosp-status {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.85rem;
    color: var(--text-muted);
  }
  .govt-hosp-status-warn {
    color: #92400E;
  }
  .spin {
    animation: spin 1s linear infinite;
  }
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  .govt-hosp-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
  .govt-hosp-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.85rem;
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-md);
    flex-wrap: wrap;
  }
  .govt-hosp-item-main {
    flex: 1;
    min-width: 200px;
  }
  .govt-hosp-item-top {
    display: flex;
    justify-content: space-between;
    gap: 0.5rem;
    align-items: baseline;
  }
  .govt-hosp-name {
    font-weight: 700;
    font-size: 0.9rem;
  }
  .govt-hosp-distance {
    font-size: 0.78rem;
    color: var(--brand-primary);
    font-weight: 600;
    white-space: nowrap;
  }
  .govt-hosp-address {
    font-size: 0.78rem;
    color: var(--text-muted);
    margin: 0.2rem 0 0.4rem;
  }
  .govt-hosp-badges {
    display: flex;
    gap: 0.4rem;
    flex-wrap: wrap;
  }
  .govt-hosp-badge {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.72rem;
    background: var(--pastel-light-blue);
    padding: 0.2rem 0.5rem;
    border-radius: var(--radius-full);
    color: var(--text-primary);
  }
  .govt-hosp-badge-emergency {
    background: #FEE2E2;
    color: #B91C1C;
  }
  .govt-hosp-book-btn {
    white-space: nowrap;
  }
`;
