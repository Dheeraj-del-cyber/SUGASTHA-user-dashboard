import React from 'react';
import { PhoneCall, AlertTriangle, Navigation } from 'lucide-react';
import { Hospital } from '../../types';

interface EmergencyCardProps {
  onCallAmbulance: () => void;
  nearestHospital?: Hospital;
  onNavigateEmergency?: (hosp: Hospital) => void;
}

export const EmergencyCard: React.FC<EmergencyCardProps> = ({
  onCallAmbulance,
  nearestHospital,
  onNavigateEmergency,
}) => {
  return (
    <div className="emergency-card-container">
      <div className="emergency-header-row">
        <div className="emergency-icon-pill">
          <AlertTriangle size={20} />
        </div>
        <div>
          <h3 className="emergency-title">Emergency Medical Help (24/7)</h3>
          <p className="emergency-subtitle">Immediate emergency response and trauma care assistance</p>
        </div>
      </div>

      <div className="emergency-action-grid">
        <div className="emergency-box call-box">
          <div className="box-top">
            <span className="box-badge">National Helpline</span>
            <span className="box-phone">108</span>
          </div>
          <h4 className="box-title">Call Emergency Ambulance</h4>
          <p className="box-desc">Free government ambulance dispatch system with live GPS tracking.</p>
          <a
            href="tel:108"
            onClick={onCallAmbulance}
            className="btn btn-danger btn-md call-btn"
          >
            <PhoneCall size={16} />
            <span>Call 108 Immediately</span>
          </a>
        </div>

        {nearestHospital && (
          <div className="emergency-box hospital-box">
            <div className="box-top">
              <span className="box-badge distance">Nearest ER • {nearestHospital.distanceKm} km</span>
              <span className="er-status">ER Queue: {nearestHospital.emergencyQueueStatus}</span>
            </div>
            <h4 className="box-title">{nearestHospital.name}</h4>
            <p className="box-desc">{nearestHospital.address}</p>
            <button
              onClick={() => {
                if (onNavigateEmergency) onNavigateEmergency(nearestHospital);
                else window.open(`https://maps.google.com/?q=${encodeURIComponent(nearestHospital.name + ' ' + nearestHospital.address)}`, '_blank');
              }}
              className="btn btn-secondary btn-md er-nav-btn"
            >
              <Navigation size={16} />
              <span>Get ER Directions</span>
            </button>
          </div>
        )}
      </div>

      <style>{`
        .emergency-card-container {
          width: 100%;
          background: var(--pastel-soft-pink);
          border: 1.5px solid #FCA5A5;
          border-radius: var(--radius-lg);
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.1rem;
          box-shadow: var(--shadow-sm);
        }
        .emergency-header-row {
          display: flex;
          align-items: center;
          gap: 0.85rem;
        }
        .emergency-icon-pill {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: #DC2626;
          color: #FFFFFF;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(220, 38, 38, 0.25);
          flex-shrink: 0;
        }
        .emergency-title {
          font-size: 1.25rem;
          font-weight: 800;
          color: #991B1B;
        }
        .emergency-subtitle {
          font-size: 0.82rem;
          color: #B91C1C;
        }
        .emergency-action-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1rem;
        }
        .emergency-box {
          background: var(--white);
          border: 1px solid #FCA5A5;
          border-radius: var(--radius-md);
          padding: 1.1rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          justify-content: space-between;
        }
        .box-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .box-badge {
          background: #FEE2E2;
          color: #991B1B;
          font-size: 0.7rem;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: var(--radius-full);
          text-transform: uppercase;
        }
        .box-phone {
          font-family: var(--font-display);
          font-size: 1.2rem;
          font-weight: 900;
          color: #DC2626;
        }
        .box-title {
          font-size: 1rem;
          font-weight: 700;
          color: var(--dark-navy-text);
        }
        .box-desc {
          font-size: 0.78rem;
          color: var(--text-muted);
          line-height: 1.4;
        }
        .call-btn {
          width: 100%;
          margin-top: 0.25rem;
        }
        .er-status {
          font-size: 0.72rem;
          font-weight: 700;
          color: #991B1B;
        }
        .er-nav-btn {
          width: 100%;
          background: #FEF2F2;
          color: #991B1B;
          border-color: #FCA5A5;
          margin-top: 0.25rem;
        }
        .er-nav-btn:hover {
          background: #FEE2E2;
        }
      `}</style>
    </div>
  );
};
