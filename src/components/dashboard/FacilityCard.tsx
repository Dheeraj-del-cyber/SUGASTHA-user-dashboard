import React from 'react';
import { MapPin, Navigation, ShieldCheck, Car } from 'lucide-react';
import { Hospital } from '../../types';
import { StatusBadge } from '../common/StatusBadge';

interface FacilityCardProps {
  hospital: Hospital;
  onViewDetails: (hospital: Hospital) => void;
  onGetDirections?: (hospital: Hospital) => void;
}

export const FacilityCard: React.FC<FacilityCardProps> = ({
  hospital,
  onViewDetails,
  onGetDirections,
}) => {
  const formatFacilityType = (type: string) => {
    switch (type) {
      case 'GOVERNMENT_TERTIARY':
        return 'Govt. Tertiary Institute';
      case 'DISTRICT_HOSPITAL':
        return 'Govt. District Hospital';
      case 'PRIVATE_SUPERSPECIALTY':
        return 'Private Super Specialty';
      case 'URBAN_HEALTH_CENTRE':
        return 'Primary Health Centre (PHC)';
      default:
        return type.replace(/_/g, ' ');
    }
  };

  return (
    <div className="facility-card">
      <div className="facility-card-header">
        <span className="facility-type-badge">{formatFacilityType(hospital.type)}</span>
        {hospital.nabhAccredited && (
          <span className="nabh-tag">
            <ShieldCheck size={12} /> NABH
          </span>
        )}
      </div>

      <div className="facility-card-body">
        <h4 className="facility-name">{hospital.name}</h4>
        <p className="facility-address">
          <MapPin size={13} className="inline-icon" />
          {hospital.address}
        </p>

        <div className="facility-status-row">
          <div className="status-item">
            <span className="status-label">Beds:</span>
            <StatusBadge status={hospital.bedAvailabilityStatus} size="sm" />
          </div>
          <div className="status-item">
            <span className="status-label">ER Queue:</span>
            <StatusBadge status={hospital.emergencyQueueStatus} size="sm" />
          </div>
        </div>

        <div className="facility-travel-bar">
          <div className="travel-info">
            <Navigation size={13} className="travel-icon" />
            <span>{hospital.distanceKm} km ({hospital.estimatedTravelTimeMinutes} mins)</span>
          </div>

          {hospital.fareEstimates?.autoFare && (
            <div className="fare-info">
              <Car size={13} className="fare-icon" />
              <span>Auto ~₹{hospital.fareEstimates.autoFare}</span>
            </div>
          )}
        </div>
      </div>

      <div className="facility-card-footer">
        <button
          onClick={() => onViewDetails(hospital)}
          className="btn btn-secondary btn-sm flex-1"
        >
          View & Book
        </button>

        <button
          onClick={() => {
            if (onGetDirections) onGetDirections(hospital);
            else window.open(`https://maps.google.com/?q=${encodeURIComponent(hospital.name + ' ' + hospital.address)}`, '_blank');
          }}
          className="btn btn-outline btn-sm directions-btn"
          title="Open Directions"
        >
          <Navigation size={14} />
          <span>Map</span>
        </button>
      </div>

      <style>{`
        .facility-card {
          width: 100%;
          background: var(--white);
          border: 1px solid var(--border-light);
          border-radius: var(--radius-lg);
          padding: 1rem;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          gap: 0.75rem;
          box-shadow: var(--shadow-sm);
          height: 100%;
          transition: transform var(--transition-fast), box-shadow var(--transition-fast);
        }
        .facility-card:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
          border-color: var(--pastel-sky-blue);
        }
        .facility-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.5rem;
        }
        .facility-type-badge {
          background: var(--pastel-light-blue);
          color: var(--brand-primary);
          font-size: 0.72rem;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: var(--radius-full);
          text-transform: uppercase;
        }
        .nabh-tag {
          display: inline-flex;
          align-items: center;
          gap: 3px;
          background: #E8F5E9;
          color: #2E8B57;
          font-size: 0.68rem;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: var(--radius-xs);
        }
        .facility-card-body {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
          flex: 1;
        }
        .facility-name {
          font-size: 1rem;
          font-weight: 700;
          color: var(--dark-navy-text);
          line-height: 1.25;
        }
        .facility-address {
          font-size: 0.78rem;
          color: var(--text-muted);
          display: flex;
          align-items: flex-start;
          gap: 4px;
        }
        .inline-icon {
          flex-shrink: 0;
          margin-top: 2px;
          color: var(--brand-primary);
        }
        .facility-status-row {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-top: 0.25rem;
        }
        .status-item {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .status-label {
          font-size: 0.7rem;
          color: var(--text-muted);
          font-weight: 600;
        }
        .facility-travel-bar {
          background: var(--pastel-light-blue);
          padding: 0.5rem 0.75rem;
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--dark-navy-text);
          margin-top: 0.35rem;
        }
        .travel-info, .fare-info {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .travel-icon, .fare-icon {
          color: var(--brand-primary);
        }
        .facility-card-footer {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .flex-1 {
          flex: 1;
        }
        .directions-btn {
          padding: 0.4rem 0.75rem;
        }
      `}</style>
    </div>
  );
};
