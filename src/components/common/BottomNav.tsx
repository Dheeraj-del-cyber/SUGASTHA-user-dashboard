import React, { useState, useEffect, useRef } from 'react';
import { Home, FileText, User, Stethoscope, ShieldCheck } from 'lucide-react';

export type ActiveTab = 'dashboard' | 'appointments' | 'doctors' | 'records' | 'profile' | 'triage' | 'tracking';

interface BottomNavProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  hasActiveConsultation?: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onSelectTab,
  hasActiveConsultation,
}) => {
  const navRef = useRef<HTMLElement>(null);
  const [navWidth, setNavWidth] = useState<number>(() => (typeof window !== 'undefined' ? window.innerWidth : 390));

  useEffect(() => {
    const updateWidth = () => {
      if (navRef.current) {
        setNavWidth(navRef.current.offsetWidth);
      } else {
        setNavWidth(window.innerWidth);
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const handleCenterAction = () => {
    onSelectTab(hasActiveConsultation ? 'tracking' : 'appointments');
  };

  // Dimensions for pixel-perfect concentric cradle
  const W = navWidth || 390;
  const H = 78; // Nav bar height
  const cx = W / 2;
  const y0 = 16; // Baseline top edge of white bar

  // Concentric cradle notch hugging down around the circle button:
  // Button center: (cx, 16), diameter: 52px (radius 26px)
  // Notch cradle: radius 33px (7px uniform concentric gap all around)
  // Notch arc goes from (cx - 32, 23) down to (cx, 49) and up to (cx + 32, 23)
  // Fillet beziers transition smoothly from flat bar (cx ± 46, 16) into cradle arc
  const pathD = `
    M 0,${y0}
    L ${cx - 46},${y0}
    C ${cx - 39},${y0} ${cx - 35},19 ${cx - 32},23
    A 33,33 0 0,0 ${cx + 32},23
    C ${cx + 35},19 ${cx + 39},${y0} ${cx + 46},${y0}
    L ${W},${y0}
    L ${W},${H + 30}
    L 0,${H + 30}
    Z
  `;

  const strokeD = `
    M 0,${y0}
    L ${cx - 46},${y0}
    C ${cx - 39},${y0} ${cx - 35},19 ${cx - 32},23
    A 33,33 0 0,0 ${cx + 32},23
    C ${cx + 35},19 ${cx + 39},${y0} ${cx + 46},${y0}
    L ${W},${y0}
  `;

  return (
    <nav ref={navRef} className="bottom-nav-bar">
      {/* SVG Background with cradle notch */}
      <svg
        className="nav-notch-svg"
        width={W}
        height={H}
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <filter id="cradle-shadow" x="-5%" y="-30%" width="110%" height="150%">
            <feDropShadow dx="0" dy="-3" stdDeviation="4" floodColor="#0f172a" floodOpacity="0.06" />
          </filter>
        </defs>

        {/* Solid white navbar fill */}
        <path d={pathD} fill="#ffffff" filter="url(#cradle-shadow)" />

        {/* Hairline border along top edge and cradle contour */}
        <path d={strokeD} fill="none" stroke="rgba(226, 232, 240, 0.9)" strokeWidth="1" />
      </svg>

      {/* Nav Tab Items */}
      <button
        onClick={() => onSelectTab('dashboard')}
        className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
      >
        <div className="icon-box">
          <Home size={20} className="nav-icon" />
        </div>
        <span className="nav-label">Home</span>
      </button>

      <button
        onClick={() => onSelectTab('records')}
        className={`nav-item ${activeTab === 'records' ? 'active' : ''}`}
      >
        <div className="icon-box">
          <FileText size={20} className="nav-icon" />
        </div>
        <span className="nav-label">My Records</span>
      </button>

      {/* Center placeholder slot to maintain equal distribution between tabs */}
      <div className="nav-center-slot" aria-hidden="true" />

      {/* Center Doctor Floating Action Button concentric with the cradle curve */}
      <button
        onClick={handleCenterAction}
        className={`nav-center-btn ${activeTab === 'appointments' || activeTab === 'tracking' ? 'active' : ''}`}
        aria-label={hasActiveConsultation ? 'Active consultation' : 'Doctor consultation'}
      >
        <div className="doctor-inner-circle">
          <Stethoscope size={24} strokeWidth={2.4} color="#ffffff" />
        </div>
        {hasActiveConsultation && <span className="nav-ping"></span>}
      </button>

      <button
        onClick={() => onSelectTab('appointments')}
        className={`nav-item ${activeTab === 'appointments' || activeTab === 'tracking' ? 'active' : ''}`}
      >
        <div className="icon-box">
          <ShieldCheck size={20} className="nav-icon" />
        </div>
        <span className="nav-label">My Consents</span>
      </button>

      <button
        onClick={() => onSelectTab('profile')}
        className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
      >
        <div className="icon-box">
          <User size={20} className="nav-icon" />
        </div>
        <span className="nav-label">My Profile</span>
      </button>

      <style>{`
        .bottom-nav-bar {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          height: calc(76px + env(safe-area-inset-bottom, 0px));
          background: transparent;
          display: flex;
          align-items: flex-end;
          justify-content: space-around;
          z-index: 90;
          padding-bottom: calc(10px + env(safe-area-inset-bottom, 0px));
        }

        .nav-notch-svg {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 1;
        }

        .nav-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4px;
          color: #64748b;
          transition: all 0.2s ease;
          flex: 1;
          min-width: 0;
          white-space: nowrap;
          z-index: 2;
          background: none;
          border: none;
          outline: none;
          cursor: pointer;
          margin-top: 14px;
          padding: 2px 0;
        }

        .icon-box {
          display: grid;
          place-items: center;
          width: 28px;
          height: 24px;
          transform: translateY(5px);
          transition: transform 0.2s ease, color 0.2s ease;
        }

        .nav-icon {
          color: #64748b;
          transition: color 0.2s ease;
        }

        .nav-label {
          font-size: 0.67rem;
          font-weight: 500;
          color: #64748b;
          letter-spacing: -0.1px;
          transition: color 0.2s ease, font-weight 0.2s ease;
        }

        .nav-item.active .nav-icon {
          color: #0b3b78;
          stroke-width: 2.5;
        }

        .nav-item.active .nav-label {
          color: #0b3b78;
          font-weight: 700;
        }

        .nav-item:hover .nav-icon,
        .nav-item:hover .nav-label {
          color: #0284c7;
        }

        /* Center placeholder slot to maintain equal distribution */
        .nav-center-slot {
          flex: 0 0 68px;
          height: 100%;
          pointer-events: none;
        }

        /* Floating button: centered at top: -10px, height: 52px -> center is (cx, 16px) */
        .nav-center-btn {
          position: absolute;
          left: 50%;
          top: -4px;
          transform: translateX(-50%);
          display: grid;
          place-items: center;
          width: 52px;
          height: 52px;
          border-radius: 50%;
          background: #ffffff;
          padding: 3.5px;
          border: none;
          outline: none;
          cursor: pointer;
          z-index: 10;
          box-shadow:
            0 5px 16px rgba(2, 132, 199, 0.30),
            0 2px 6px rgba(15, 23, 42, 0.08);
          transition: transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.22s ease;
        }

        .doctor-inner-circle {
          display: grid;
          place-items: center;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
          box-shadow: inset 0 1px 2px rgba(255, 255, 255, 0.3);
        }

        .nav-center-btn:hover,
        .nav-center-btn.active {
          transform: translateX(-50%) translateY(-2px) scale(1.04);
          box-shadow:
            0 8px 22px rgba(2, 132, 199, 0.40),
            0 3px 8px rgba(15, 23, 42, 0.12);
        }

        .nav-ping {
          position: absolute;
          top: 3px;
          right: 3px;
          width: 9px;
          height: 9px;
          border-radius: 50%;
          background: #10b981;
          border: 2px solid #ffffff;
        }

        @media (min-width: 769px) {
          .bottom-nav-bar {
            display: none;
          }
        }
      `}</style>
    </nav>
  );
};
