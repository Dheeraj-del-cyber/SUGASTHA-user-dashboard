import React from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, Clock, Video, MapPin, ExternalLink, CalendarX } from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';

export interface AppointmentData {
  id: string;
  doctorName: string;
  speciality: string;
  date: string;
  time: string;
  type: 'VIDEO' | 'HOSPITAL';
  facilityName: string;
  status: 'CONFIRMED' | 'QUEUED' | 'COMPLETED' | 'CANCELLED';
  meetUrl?: string;
  tokenNumber?: string;
}

interface AppointmentCardProps {
  appointment: AppointmentData;
  onView: (app: AppointmentData) => void;
  onReschedule?: (app: AppointmentData) => void;
  onCancel?: (app: AppointmentData) => void;
  onJoinVideo?: (app: AppointmentData) => void;
}

export const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  onView,
  onReschedule,
  onCancel,
  onJoinVideo,
}) => {
  const { t, i18n } = useTranslation();
  const languageCode = i18n.language.startsWith('hi') ? 'hi' : i18n.language.startsWith('kn') ? 'kn' : i18n.language.startsWith('mr') ? 'mr' : i18n.language.startsWith('ta') ? 'ta' : i18n.language.startsWith('te') ? 'te' : 'en';
  const doctorNameMap: Record<string, string> = {
    'Dr. Vivek Sharma': { en: 'Dr. Vivek Sharma', hi: 'डॉ. विवेक शर्मा', kn: 'ಡಾ. ವಿವೇಕ ಶರ್ಮಾ', mr: 'डॉ. विवेक शर्मा', ta: 'டாக்டர் விவேக் ஷர்மா', te: 'డా. వివేక్ శర్మ' }[languageCode],
    'Dr. Suniti Singhania': { en: 'Dr. Suniti Singhania', hi: 'डॉ. सुनिती सिंग्हानिया', kn: 'ಡಾ. ಸುನಿತಿ ಸಿಂಗ್‌ಹಾನಿಯಾ', mr: 'डॉ. सुनिती सिंगहनिया', ta: 'டாக்டர் சுனிதி சிங்ஹானியா', te: 'డా. సునితి సింగ్‌హానియా' }[languageCode],
    'Dr. Anupam Sachdev': { en: 'Dr. Anupam Sachdev', hi: 'डॉ. अनुपम सचदेव', kn: 'ಡಾ. ಅನೂಪಮ್ ಸಚ್ಡೆವ್', mr: 'डॉ. अनुपम साचदेव', ta: 'டாக்டர் ஆனுப்பம் சச்சதேவ்', te: 'డా. అనుపమ్ సచ్డేవ్' }[languageCode],
    'Dr. Rajeshwari Nair': { en: 'Dr. Rajeshwari Nair', hi: 'डॉ. राजेश्वरी नायर', kn: 'ಡಾ. ರಾಜೇಶ್ವರಿ ನಾಯರ್', mr: 'डॉ. राजेश्वरी नायर', ta: 'டாக்டர் ராஜேஷ்வரி நாயர்', te: 'డా. రాజేశ్వరి నాయర్' }[languageCode],
    'Dr. Shalini Taneja': { en: 'Dr. Shalini Taneja', hi: 'डॉ. शालिनी तनेजा', kn: 'ಡಾ. ಶಾಲಿನಿ ತನೆಜಾ', mr: 'डॉ. शालिनी तनेजा', ta: 'டாக்டர் ஷாலினி தானேஜா', te: 'డా. శాలిని తానెజా' }[languageCode],
  };
  const facilityNameMap: Record<string, string> = {
    'AIIMS New Delhi • OPD Desk 4': { en: 'AIIMS New Delhi • OPD Desk 4', hi: 'एम्स नई दिल्ली • ओपीडी डेस्क 4', kn: 'AIIMS ನ್ಯೂ ಡೆಲ್ಲಿ • OPD ಡೆಸ್ಕ್ 4', mr: 'एम्स नवी दिल्ली • OPD डेस्क 4', ta: 'AIIMS புதிய டெல்லி • OPD டெஸ்க் 4', te: 'AIIMS న్యూ ఢిల్లీ • OPD డెస్క్ 4' }[languageCode],
    'Max Super Speciality Hospital': { en: 'Max Super Speciality Hospital', hi: 'मैक्स सुपर स्पेशियलिटी अस्पताल', kn: 'ಮ್ಯಾಕ್ಸ್ ಸೂಪರ್ ಸ್ಪೆಷಾಲಿಟಿ ಹಾಸ್ಪಿಟಲ್', mr: 'मॅक्स सुपर स्पेशालिटी रुग्णालय', ta: 'மக்ஸ் சூப்பர் ஸ்பெஷாலிட்டி மருத்துவமனை', te: 'మ్యాక్స్ సూపర్ స్పెషాలిటీ ఆసుపత్రి' }[languageCode],
    'eSanjeevani Teleconsultation': { en: 'eSanjeevani Teleconsultation', hi: 'ई-संजीवीनी टेलीकंसल्ट', kn: 'eSanjeevani ಟೆಲೆಕಾನ್ಸಲ್ಟ್', mr: 'eSanjeevani टेलिकॉन्सल्ट', ta: 'eSanjeevani தொலைசேவை', te: 'eSanjeevani టెలికాన్సల్ట్' }[languageCode],
  };
  const displayDoctorName = doctorNameMap[appointment.doctorName] ?? appointment.doctorName;
  const displayFacility = facilityNameMap[appointment.facilityName] ?? appointment.facilityName;

  return (
    <div className="appointment-card">
      {/* Soft Pink Card Header Banner */}
      <div className="appointment-card-header">
        <div className="type-badge-group">
          {appointment.type === 'VIDEO' ? (
            <span className="type-chip video">
              <Video size={13} />
              <span>{t('appointments.videoCall')}</span>
            </span>
          ) : (
            <span className="type-chip hospital">
              <MapPin size={13} />
              <span>{t('appointments.hospitalVisit')}</span>
            </span>
          )}
          {appointment.tokenNumber && (
            <span className="token-chip">PIN #{appointment.tokenNumber}</span>
          )}
        </div>
        <StatusBadge status={appointment.status} size="sm" />
      </div>

      {/* Appointment Body */}
      <div className="appointment-card-body">
        <h4 className="doctor-title">{displayDoctorName}</h4>
        <p className="speciality-text">{appointment.speciality}</p>
        <p className="facility-text">{displayFacility}</p>

        <div className="date-time-box">
          <div className="dt-item">
            <Calendar size={14} className="dt-icon" />
            <span>{appointment.date}</span>
          </div>
          <div className="dt-item">
            <Clock size={14} className="dt-icon" />
            <span>{appointment.time}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons Footer */}
      <div className="appointment-card-actions">
        {appointment.type === 'VIDEO' && appointment.status === 'CONFIRMED' && (
          <button
            onClick={() => onJoinVideo?.(appointment)}
            className="btn btn-primary btn-sm join-btn"
          >
            <Video size={14} />
            <span>{t('appointments.joinCall')}</span>
          </button>
        )}

        <button
          onClick={() => onView(appointment)}
          className="btn btn-secondary btn-sm"
        >
          <ExternalLink size={13} />
          <span>{t('appointments.view')}</span>
        </button>

        {appointment.status !== 'CANCELLED' && appointment.status !== 'COMPLETED' && (
          <>
            {onReschedule && (
              <button
                onClick={() => onReschedule(appointment)}
                className="btn btn-outline btn-sm"
                title={t('appointments.reschedule')}
              >
                <span>{t('appointments.reschedule')}</span>
              </button>
            )}
            {onCancel && (
              <button
                onClick={() => onCancel(appointment)}
                className="btn btn-danger btn-sm"
                title="Cancel Appointment"
              >
                <CalendarX size={13} />
              </button>
            )}
          </>
        )}
      </div>

      <style>{`
        .appointment-card {
          width: 100%;
          background: var(--white);
          border: 1px solid #FBCFE8;
          border-radius: var(--radius-lg);
          overflow: hidden;
          box-shadow: var(--shadow-sm);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          height: 100%;
          transition: transform var(--transition-fast), box-shadow var(--transition-fast);
        }
        .appointment-card:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }
        .appointment-card-header {
          background: var(--pastel-soft-pink);
          padding: 0.75rem 1rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid #FCE1E8;
        }
        .type-badge-group {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .type-chip {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 0.72rem;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: var(--radius-full);
          text-transform: uppercase;
        }
        .type-chip.video {
          background: #DBEAFE;
          color: #1E40AF;
        }
        .type-chip.hospital {
          background: #FEF3C7;
          color: #92400E;
        }
        .token-chip {
          font-size: 0.7rem;
          font-weight: 700;
          color: var(--dark-navy-text);
          background: var(--white);
          padding: 2px 6px;
          border-radius: var(--radius-xs);
        }
        .appointment-card-body {
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
          flex: 1;
        }
        .doctor-title {
          font-size: 1.05rem;
          font-weight: 700;
          color: var(--dark-navy-text);
        }
        .speciality-text {
          font-size: 0.82rem;
          font-weight: 600;
          color: var(--brand-primary);
        }
        .facility-text {
          font-size: 0.78rem;
          color: var(--text-muted);
        }
        .date-time-box {
          margin-top: 0.5rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          background: var(--bg-surface-2);
          padding: 0.5rem 0.75rem;
          border-radius: var(--radius-sm);
        }
        .dt-item {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.78rem;
          font-weight: 600;
          color: var(--dark-navy-text);
        }
        .dt-icon {
          color: var(--brand-primary);
        }
        .appointment-card-actions {
          padding: 0.75rem 1rem;
          border-top: 1px solid var(--border-light);
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
          background: #FAFAFA;
        }
        .join-btn {
          background: #2E8B57;
          color: #FFFFFF;
        }
        .join-btn:hover {
          background: #1E7E48;
        }
      `}</style>
    </div>
  );
};
