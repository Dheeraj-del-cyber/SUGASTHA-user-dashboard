import React from 'react';
import { useTranslation } from 'react-i18next';
import { Star, Award, Clock, Languages, CalendarCheck } from 'lucide-react';
import { Doctor } from '../../types';

interface DoctorCardProps {
  doctor: Doctor;
  hospitalName?: string;
  onBook: (doctor: Doctor) => void;
}

export const DoctorCard: React.FC<DoctorCardProps> = ({
  doctor,
  hospitalName,
  onBook,
}) => {
  const { t, i18n } = useTranslation();
  const languageCode = i18n.language.startsWith('hi') ? 'hi' : i18n.language.startsWith('kn') ? 'kn' : i18n.language.startsWith('mr') ? 'mr' : i18n.language.startsWith('ta') ? 'ta' : i18n.language.startsWith('te') ? 'te' : 'en';
  const localeDoctorNameMap: Record<string, string> = {
    'Dr. Vivek Sharma': { en: 'Dr. Vivek Sharma', hi: 'डॉ. विवेक शर्मा', kn: 'ಡಾ. ವಿವೇಕ ಶರ್ಮಾ', mr: 'डॉ. विवेक शर्मा', ta: 'டாக்டர் விவேக் ஷர்மா', te: 'డా. వివేక్ శర్మ' }[languageCode],
    'Dr. Suniti Singhania': { en: 'Dr. Suniti Singhania', hi: 'डॉ. सुनिती सिंग्हानिया', kn: 'ಡಾ. ಸುನಿತಿ ಸಿಂಗ್‌ಹಾನಿಯಾ', mr: 'डॉ. सुनिती सिंगहनिया', ta: 'டாக்டர் சுனிதி சிங்ஹானியா', te: 'డా. సునితి సింగ్‌హానియా' }[languageCode],
    'Dr. Anupam Sachdev': { en: 'Dr. Anupam Sachdev', hi: 'डॉ. अनुपम सचदेव', kn: 'ಡಾ. ಅನೂಪಮ್ ಸಚ್ಚದೇವ್', mr: 'डॉ. अनुपम साचदेव', ta: 'டாக்டர் ஆனுப்பம் சச்சதேவ்', te: 'డా. అనుపమ్ సచ్దేవ్' }[languageCode],
    'Dr. Rajeshwari Nair': { en: 'Dr. Rajeshwari Nair', hi: 'डॉ. राजेश्वरी नायर', kn: 'ಡಾ. ರಾಜೇಶ್ವರಿ ನಾಯರ್', mr: 'डॉ. राजेश्वरी नायर', ta: 'டாக்டர் ராஜேஷ்வரி நாயர்', te: 'డా. రాజేశ్వరి నాయర్' }[languageCode],
    'Dr. Shalini Taneja': { en: 'Dr. Shalini Taneja', hi: 'डॉ. शालिनी तनेजा', kn: 'ಡಾ. ಶಾಲಿನಿ ತನೆಜಾ', mr: 'डॉ. शालिनी तनेजा', ta: 'டாக்டர் ஷாலினி தானேஜா', te: 'డా. శాలిని తానెజా' }[languageCode],
    'Dr. Ananya Rao': { en: 'Dr. Ananya Rao', hi: 'डॉ. अनन्या राव', kn: 'ಡಾ. ಅನನ್ಯ ರಾವ್', mr: 'डॉ. अनन्या राव', ta: 'டாக்டர் அனன்யா ராவ்', te: 'డా. అనన్య రావు' }[languageCode],
    'Dr. Arjun Nair': { en: 'Dr. Arjun Nair', hi: 'डॉ. अर्जुन नायर', kn: 'ಡಾ. ಅರ್ಜುನ್ ನಾಯರ್', mr: 'डॉ. अर्जुन नायर', ta: 'டாக்டர் அர்ஜுன் நாயர்', te: 'డా. అర్జున్ నాయర్' }[languageCode],
  };
  const localeHospitalMap: Record<string, string> = {
    'AIIMS New Delhi • OPD Desk 4': { en: 'AIIMS New Delhi • OPD Desk 4', hi: 'एम्स नई दिल्ली • ओपीडी डेस्क 4', kn: 'AIIMS ನ್ಯೂ ಡೆಲ್ಲಿ • OPD ಡೆಸ್ಕ್ 4', mr: 'एम्स नवी दिल्ली • OPD डेस्क 4', ta: 'AIIMS புதிய டெல்லி • OPD டெஸ்க் 4', te: 'AIIMS న్యూ ఢిల్లీ • OPD డెస్క్ 4' }[languageCode],
    'Max Super Speciality Hospital': { en: 'Max Super Speciality Hospital', hi: 'मैक्स सुपर स्पेशियलिटी अस्पताल', kn: 'ಮ್ಯಾಕ್ಸ್ ಸೂಪರ್ ಸ್ಪೆಷಾಲಿಟಿ ಹಾಸ್ಪಿಟಲ್', mr: 'मॅक्स सुपर स्पेशालिटी रुग्णालय', ta: 'மக்ஸ் சூப்பர் ஸ்பெஷாலிட்டி மருத்துவமனை', te: 'మ్యాక్స్ సూపర్ స్పెషాలిటీ ఆసుపత్రి' }[languageCode],
    'Indraprastha Apollo Hospital': { en: 'Indraprastha Apollo Hospital', hi: 'इंद्रप्रस्थ अपोलो अस्पताल', kn: 'ಇಂದ್ರಪ್ರಸ್ಥ ಅಪೋಲೋ ಆಸ್ಪತ್ರೆ', mr: 'इंद्रप्रस्थ अपोलो रुग्णालय', ta: 'இந்திரபிரஸ்தா அப்பல்லோ மருத்துவமனை', te: 'ఇంద్రప్రస్థ అపోలో ఆసుపత్రి' }[languageCode],
  };
  const displayName = localeDoctorNameMap[doctor.name] ?? doctor.name;
  const displaySpecialty = doctor.specialization;
  const displayHospital = hospitalName ? (localeHospitalMap[hospitalName] ?? hospitalName) : undefined;
  // Generate avatar initials or clean background avatar initials
  const initials = displayName
    .replace('Dr.', '')
    .trim()
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2);

  return (
    <div className="doctor-card">
      <div className="doctor-card-top">
        <div className="avatar-wrapper">
          <div className="avatar-circle">{initials}</div>
          <span className="verify-dot" title="Verified Doctor">✓</span>
        </div>

        <div className="doctor-basic-info">
          <div className="rating-badge">
            <Star size={12} fill="#F59E0B" color="#F59E0B" />
            <span>{doctor.rating}</span>
          </div>
          <h4 className="doctor-name">{displayName}</h4>
          <span className="doctor-spec">{displaySpecialty}</span>
          {displayHospital && <span className="doctor-hosp">{displayHospital}</span>}
        </div>
      </div>

      <div className="doctor-meta-grid">
        <div className="meta-chip">
          <Award size={13} className="meta-icon" />
          <span>{doctor.experienceYears} yrs exp</span>
        </div>
        <div className="meta-chip">
          <Clock size={13} className="meta-icon" />
          <span>{doctor.availableSlotToday}</span>
        </div>
        {doctor.languages && doctor.languages.length > 0 && (
          <div className="meta-chip full-width-chip">
            <Languages size={13} className="meta-icon" />
            <span>{doctor.languages.join(', ')}</span>
          </div>
        )}
      </div>

      <button
        onClick={() => onBook(doctor)}
        className="btn btn-primary btn-sm book-doc-btn"
      >
        <CalendarCheck size={14} />
        <span>{t('appointments.bookAppointment')}</span>
      </button>

      <style>{`
        .doctor-card {
          width: 100%;
          background: var(--white);
          border: 1px solid var(--border-light);
          border-radius: var(--radius-lg);
          padding: 1.1rem;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          gap: 0.85rem;
          box-shadow: var(--shadow-sm);
          height: 100%;
          transition: transform var(--transition-fast), box-shadow var(--transition-fast);
        }
        .doctor-card:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
          border-color: var(--pastel-sky-blue);
        }
        .doctor-card-top {
          display: flex;
          align-items: flex-start;
          gap: 0.85rem;
        }
        .avatar-wrapper {
          position: relative;
        }
        .avatar-circle {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          background: var(--pastel-sky-blue);
          color: var(--brand-primary);
          font-family: var(--font-display);
          font-size: 1.1rem;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid var(--pastel-light-blue);
        }
        .verify-dot {
          position: absolute;
          bottom: 0;
          right: 0;
          background: #2E8B57;
          color: #FFFFFF;
          font-size: 0.6rem;
          font-weight: 800;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid var(--white);
        }
        .doctor-basic-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
          flex: 1;
        }
        .rating-badge {
          display: inline-flex;
          align-items: center;
          gap: 3px;
          background: #FEF3C7;
          color: #B45309;
          padding: 2px 6px;
          border-radius: var(--radius-full);
          font-size: 0.72rem;
          font-weight: 700;
          width: fit-content;
        }
        .doctor-name {
          font-size: 1rem;
          font-weight: 700;
          color: var(--dark-navy-text);
          line-height: 1.2;
        }
        .doctor-spec {
          font-size: 0.78rem;
          font-weight: 600;
          color: var(--brand-primary);
        }
        .doctor-hosp {
          font-size: 0.72rem;
          color: var(--text-muted);
        }
        .doctor-meta-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 0.4rem;
        }
        .meta-chip {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: var(--pastel-light-blue);
          color: var(--dark-navy-text);
          padding: 4px 8px;
          border-radius: var(--radius-sm);
          font-size: 0.72rem;
          font-weight: 600;
        }
        .full-width-chip {
          width: 100%;
        }
        .meta-icon {
          color: var(--brand-primary);
        }
        .book-doc-btn {
          width: 100%;
          margin-top: 0.25rem;
        }
      `}</style>
    </div>
  );
};
