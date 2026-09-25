import React, { useState } from 'react';
import { MapPin, Navigation, Loader2, ArrowRight } from 'lucide-react';
import { Modal } from '../common/Modal';

interface LocationCaptureModalProps {
  isOpen: boolean;
  patientName: string;
  onLocationCaptured: (location: { latitude: number; longitude: number }) => void;
  onSkip: () => void;
}

export const LocationCaptureModal: React.FC<LocationCaptureModalProps> = ({
  isOpen,
  patientName,
  onLocationCaptured,
  onSkip,
}) => {
  const [isDetecting, setIsDetecting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [manualLat, setManualLat] = useState('');
  const [manualLng, setManualLng] = useState('');

  const handleUseCurrentLocation = () => {
    setErrorMsg('');
    if (!navigator.geolocation) {
      setErrorMsg('Location access is not supported on this device. Please enter coordinates manually below.');
      return;
    }
    setIsDetecting(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsDetecting(false);
        onLocationCaptured({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      () => {
        setIsDetecting(false);
        setErrorMsg('Location permission was denied. You can enter coordinates manually below, or skip for now.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const lat = parseFloat(manualLat);
    const lng = parseFloat(manualLng);
    if (Number.isNaN(lat) || Number.isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      setErrorMsg('Please enter a valid latitude (-90 to 90) and longitude (-180 to 180).');
      return;
    }
    onLocationCaptured({ latitude: lat, longitude: lng });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onSkip}
      title={`Welcome, ${patientName.split(' ')[0]}`}
      subtitle="Share your location so we can find the nearest government hospitals for you"
      maxWidth="480px"
    >
      <div className="location-capture-body">
        <button
          type="button"
          className="btn btn-primary location-detect-btn"
          onClick={handleUseCurrentLocation}
          disabled={isDetecting}
        >
          {isDetecting ? <Loader2 size={18} className="spin" /> : <Navigation size={18} />}
          {isDetecting ? 'Detecting your location…' : 'Use my current location'}
        </button>

        <div className="location-divider"><span>or enter manually</span></div>

        <form onSubmit={handleManualSubmit} className="location-manual-form">
          <div className="location-manual-row">
            <input
              type="number"
              step="any"
              placeholder="Latitude (e.g. 28.6139)"
              value={manualLat}
              onChange={(e) => setManualLat(e.target.value)}
            />
            <input
              type="number"
              step="any"
              placeholder="Longitude (e.g. 77.2090)"
              value={manualLng}
              onChange={(e) => setManualLng(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-secondary location-manual-submit">
            <MapPin size={16} /> Continue with these coordinates
          </button>
        </form>

        {errorMsg && <p className="location-error">{errorMsg}</p>}

        <button type="button" className="location-skip-link" onClick={onSkip}>
          Skip for now <ArrowRight size={14} />
        </button>
      </div>

      <style>{`
        .location-capture-body {
          display: flex;
          flex-direction: column;
          gap: 0.9rem;
        }
        .location-detect-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }
        .spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .location-divider {
          display: flex;
          align-items: center;
          text-align: center;
          color: var(--text-muted);
          font-size: 0.78rem;
          gap: 0.6rem;
        }
        .location-divider::before,
        .location-divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: var(--border-subtle);
        }
        .location-manual-form {
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
        }
        .location-manual-row {
          display: flex;
          gap: 0.6rem;
        }
        .location-manual-row input {
          flex: 1;
          padding: 0.6rem 0.75rem;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-subtle);
          font-size: 0.85rem;
        }
        .location-manual-submit {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
        }
        .location-error {
          color: #B91C1C;
          font-size: 0.8rem;
          text-align: center;
        }
        .location-skip-link {
          margin: 0 auto;
          display: flex;
          align-items: center;
          gap: 0.3rem;
          color: var(--text-muted);
          font-size: 0.82rem;
          text-decoration: underline;
        }
      `}</style>
    </Modal>
  );
};
