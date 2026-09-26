import React from 'react';
import { useHealthcare } from '../../context/HealthcareContext';
import { ShieldCheck, Phone, HeartPulse, Building, ExternalLink } from 'lucide-react';

export const GovFooter: React.FC = () => {
  const { lang } = useHealthcare();

  return (
    <footer className="bg-slate-900 text-slate-400 text-xs mt-16 border-t border-slate-800">
      {/* 1. Helpline & Quick Support Bar */}
      <div className="bg-slate-950 border-b border-slate-800 py-3 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-6 flex-wrap">
            <div className="flex items-center gap-2 text-slate-200">
              <Phone className="w-4 h-4 text-emerald-400" />
              <span className="font-medium">{lang === 'hi' ? 'राष्ट्रीय स्वास्थ्य हेल्पलाइन:' : 'National Health Helpline:'}</span>
              <span className="font-bold text-amber-400">104 / 1800-11-0031</span>
            </div>
            <div className="flex items-center gap-2 text-slate-200">
              <HeartPulse className="w-4 h-4 text-rose-400" />
              <span className="font-medium">{lang === 'hi' ? 'आपातकालीन एम्बुलेंस:' : 'Emergency Ambulance:'}</span>
              <span className="font-bold text-amber-400">108 / 102</span>
            </div>
            <div className="flex items-center gap-2 text-slate-200">
              <Building className="w-4 h-4 text-sky-400" />
              <span className="font-medium">eSanjeevani Telemedicine:</span>
              <span className="font-bold text-amber-400">esanjeevani.mohfw.gov.in</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-emerald-400 font-semibold text-[11px]">
            <ShieldCheck className="w-4 h-4" />
            <span>ABDM Milestone 1, 2 & 3 Certified</span>
          </div>
        </div>
      </div>

      {/* 2. Main Gov Links & Disclaimers */}
      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-sky-800 text-amber-400 flex items-center justify-center font-bold text-xs">
              SS
            </div>
            <h4 className="text-white font-bold text-sm tracking-wide">SUGASTHA PORTAL</h4>
          </div>
          <p className="text-slate-400 text-xs leading-relaxed">
            {lang === 'hi'
              ? 'सुगस्था भारत सरकार के स्वास्थ्य और परिवार कल्याण मंत्रालय की एक एकीकृत डिजिटल स्वास्थ्य पहल है, जो डिजिटल और गैर-डिजिटल सभी नागरिकों को गुणवत्तापूर्ण स्वास्थ्य सेवा प्रदान करती है।'
              : 'SUGASTHA is an integrated digital health initiative by the Ministry of Health & Family Welfare, providing seamless triage, fallback hospital allocation, and ABHA longitudinal continuity of care.'}
          </p>
        </div>

        <div>
          <h4 className="text-white font-semibold text-xs mb-3 uppercase tracking-wider text-slate-300">
            {lang === 'hi' ? 'प्रमुख सेवाएं' : 'Key Services'}
          </h4>
          <ul className="space-y-2 text-xs">
            <li><a href="#patient" className="hover:text-amber-400 transition-colors">ABHA Digital Health Card</a></li>
            <li><a href="#hospital" className="hover:text-amber-400 transition-colors">OPD Queue & AEBAS Doctor Roster</a></li>
            <li><a href="#asha" className="hover:text-amber-400 transition-colors">ASHA PHC Assisted Referrals</a></li>
            <li><a href="#ivr" className="hover:text-amber-400 transition-colors">104 IVR Voice Fallback Engine</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold text-xs mb-3 uppercase tracking-wider text-slate-300">
            {lang === 'hi' ? 'सरकारी पोर्टल लिंक' : 'Government Portals'}
          </h4>
          <ul className="space-y-2 text-xs">
            <li className="flex items-center gap-1"><a href="https://abdm.gov.in" target="_blank" rel="noreferrer" className="hover:text-amber-400 transition-colors">ABDM - Ayushman Bharat</a> <ExternalLink className="w-3 h-3 text-slate-500" /></li>
            <li className="flex items-center gap-1"><a href="https://mohfw.gov.in" target="_blank" rel="noreferrer" className="hover:text-amber-400 transition-colors">MoHFW Official Portal</a> <ExternalLink className="w-3 h-3 text-slate-500" /></li>
            <li className="flex items-center gap-1"><a href="https://esanjeevani.in" target="_blank" rel="noreferrer" className="hover:text-amber-400 transition-colors">eSanjeevani National Teleconsultation</a> <ExternalLink className="w-3 h-3 text-slate-500" /></li>
            <li className="flex items-center gap-1"><a href="https://india.gov.in" target="_blank" rel="noreferrer" className="hover:text-amber-400 transition-colors">National Portal of India</a> <ExternalLink className="w-3 h-3 text-slate-500" /></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold text-xs mb-3 uppercase tracking-wider text-slate-300">
            {lang === 'hi' ? 'गोपनीयता एवं सुरक्षा' : 'Security & Standards'}
          </h4>
          <p className="text-slate-400 text-xs leading-relaxed">
            Designed in adherence to DISHA (Digital Information Security in Healthcare Act) and ABDM Consent Architecture standards.
          </p>
          <div className="mt-3 text-[11px] text-slate-500">
            Website Content Managed by Ministry of Health & Family Welfare, GoI.
          </div>
        </div>
      </div>

      {/* 3. Bottom Tricolor & Copyright */}
      <div className="border-t border-slate-800/80 py-4 px-4 text-center text-slate-500 text-[11px]">
        © 2026 SUGASTHA – Government of India. All Rights Reserved. Powered by National Health Authority & ABDM.
      </div>
      <div className="gov-tricolor-bar" />
    </footer>
  );
};
