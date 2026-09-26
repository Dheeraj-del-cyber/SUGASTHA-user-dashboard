import React, { useState, useEffect } from 'react';
import { useHealthcare } from '../../context/HealthcareContext';
import {
  Video,
  Mic,
  MicOff,
  VideoOff,
  PhoneOff,
  MessageSquare,
  ShieldCheck,
  FileText,
  User,
  CheckCircle2,
  Clock,
  Send,
  Download
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ESanjeevaniModalProps {
  isOpen: boolean;
  onClose: () => void;
  symptoms: string[];
}

export const ESanjeevaniModal: React.FC<ESanjeevaniModalProps> = ({ isOpen, onClose, symptoms }) => {
  const { currentUser, lang, submitDoctorConsultation, appointments } = useHealthcare();

  const [callStatus, setCallStatus] = useState<'CONNECTING' | 'CONNECTED' | 'COMPLETED'>('CONNECTING');
  const [micActive, setMicActive] = useState(true);
  const [videoActive, setVideoActive] = useState(true);
  const [messages, setMessages] = useState<{ sender: 'doc' | 'user'; text: string; time: string }[]>([
    {
      sender: 'doc',
      text: `Namaste ${currentUser.name}. I am Dr. Ananya Sengupta from eSanjeevani National Teleconsultation. I see your reported symptoms: ${symptoms.join(', ')}. How are you feeling today?`,
      time: 'Just now'
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [timerSeconds, setTimerSeconds] = useState(0);

  // Connecting effect
  useEffect(() => {
    if (!isOpen) return;
    setCallStatus('CONNECTING');
    setTimerSeconds(0);

    const timer = setTimeout(() => {
      setCallStatus('CONNECTED');
    }, 2200);

    return () => clearTimeout(timer);
  }, [isOpen]);

  // Duration timer
  useEffect(() => {
    if (callStatus !== 'CONNECTED') return;
    const interval = setInterval(() => {
      setTimerSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [callStatus]);

  if (!isOpen) return null;

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const newMsg = { sender: 'user' as const, text: chatInput, time: 'Just now' };
    setMessages(prev => [...prev, newMsg]);
    setChatInput('');

    // Doctor auto response
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          sender: 'doc',
          text: 'Thank you for explaining. Based on your symptoms and ABHA diabetic history, I am issuing your official e-Prescription with rest instructions. Stay hydrated and monitor your temperature.',
          time: 'Just now'
        }
      ]);
    }, 1400);
  };

  const handleEndAndGenerateRx = () => {
    setCallStatus('COMPLETED');
    try {
      confetti({ particleCount: 50, spread: 60 });
    } catch {
      // Confetti optional
    }

    // Auto-commit eSanjeevani consultation to ABHA
    const targetApt = appointments[0];
    if (targetApt) {
      submitDoctorConsultation(targetApt.id, {
        consultationDate: new Date().toISOString().split('T')[0],
        doctorId: 'doc-esanjeevani-01',
        doctorName: 'Dr. Ananya Sengupta, MD (eSanjeevani Telemedicine)',
        hospitalName: 'eSanjeevani National Teleconsultation Hub (MoHFW)',
        department: 'General & Preventive Medicine',
        chiefComplaints: symptoms.join(', '),
        clinicalObservations: 'Patient oriented, tele-evaluated. Vital parameters stable. Advised home symptomatic treatment.',
        diagnosis: 'Acute Upper Respiratory Tract Infection with Mild Viral Pyrexia',
        icd10Code: 'J06.9 / R50.9',
        medications: [
          { name: 'Tab Paracetamol 650mg', dosage: '650mg', timing: '1-0-1 (After Food)', durationDays: 3, instructions: 'For fever control' },
          { name: 'Tab Levocetirizine 5mg', dosage: '5mg', timing: '0-0-1 (Bedtime)', durationDays: 5, instructions: 'For nasal congestion & cough' },
          { name: 'Steam Inhalation', dosage: 'Twice daily', timing: 'Morning & Night', durationDays: 4, instructions: 'Warm saline gargle' }
        ],
        labTestsOrdered: ['Complete Blood Count (CBC) if fever persists > 48h'],
        advice: 'Adequate hydration, warm fluids, avoid cold beverages. If SpO2 < 94% visit nearest hospital OPD immediately.',
        followUpDays: 4,
        abhaSynced: true,
        abhaTransactionId: `ABDM-ESANJEEVANI-${Date.now().toString(16).toUpperCase()}`
      });
    }
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 md:p-6 animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-5xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-slate-950 px-6 py-3 border-b border-slate-800 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center font-bold text-xs text-white">
              <Video className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm tracking-wide">eSanjeevani National Telemedicine Hub</h3>
                <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] px-2 py-0.5 rounded font-semibold">
                  SECURE & ENCRYPTED
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Patient: <span className="text-white font-medium">{currentUser.name}</span> (ABHA: {currentUser.abhaId})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {callStatus === 'CONNECTED' && (
              <div className="flex items-center gap-1.5 bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs px-2.5 py-1 rounded-full font-mono">
                <div className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                <span>REC {formatTimer(timerSeconds)}</span>
              </div>
            )}
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white text-xs bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg transition"
            >
              Exit
            </button>
          </div>
        </div>

        {/* Modal Body */}
        {callStatus === 'CONNECTING' ? (
          <div className="p-12 text-center text-white flex flex-col items-center justify-center my-auto">
            <div className="w-16 h-16 rounded-full bg-sky-500/20 border-2 border-sky-400 flex items-center justify-center animate-spin mb-4">
              <Video className="w-8 h-8 text-sky-400" />
            </div>
            <h3 className="text-lg font-bold mb-1">Connecting to Available Government Medical Officer...</h3>
            <p className="text-xs text-slate-400 max-w-md">
              Verifying ABHA ID consent and initializing peer-to-peer encrypted telemedicine channel via eSanjeevani.
            </p>
          </div>
        ) : callStatus === 'CONNECTED' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 flex-1 overflow-hidden">
            {/* Video Streams (Left 2 cols) */}
            <div className="lg:col-span-2 p-4 bg-slate-950 flex flex-col justify-between relative min-h-[360px]">
              {/* Main Doctor Screen */}
              <div className="relative w-full flex-1 rounded-xl bg-slate-900 border border-slate-800 overflow-hidden flex items-center justify-center">
                <div className="text-center p-6">
                  <div className="w-24 h-24 rounded-full bg-emerald-900/40 border-2 border-emerald-500/50 mx-auto flex items-center justify-center mb-3 text-emerald-300 font-bold text-2xl">
                    Dr. AS
                  </div>
                  <h4 className="text-white font-bold text-base">Dr. Ananya Sengupta, MD</h4>
                  <p className="text-xs text-emerald-400">eSanjeevani Govt Tele-Consultant • On-Duty</p>
                  <p className="text-xs text-slate-400 mt-2">Active Video Stream (HD 1080p WebRTC)</p>
                </div>

                {/* Patient PiP Video */}
                <div className="absolute bottom-4 right-4 w-32 h-24 bg-slate-800 border-2 border-slate-600 rounded-lg overflow-hidden flex flex-col items-center justify-center shadow-lg">
                  {videoActive ? (
                    <div className="text-center">
                      <User className="w-6 h-6 text-sky-400 mx-auto mb-1" />
                      <span className="text-[10px] text-slate-200">You ({currentUser.name.split(' ')[0]})</span>
                    </div>
                  ) : (
                    <span className="text-[10px] text-slate-400">Camera Off</span>
                  )}
                </div>
              </div>

              {/* Call Control Strip */}
              <div className="mt-4 flex items-center justify-center gap-4 bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                <button
                  onClick={() => setMicActive(!micActive)}
                  className={`p-3 rounded-full transition ${
                    micActive ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-rose-600 text-white'
                  }`}
                  title={micActive ? 'Mute Mic' : 'Unmute Mic'}
                >
                  {micActive ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                </button>

                <button
                  onClick={() => setVideoActive(!videoActive)}
                  className={`p-3 rounded-full transition ${
                    videoActive ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-rose-600 text-white'
                  }`}
                  title={videoActive ? 'Turn Video Off' : 'Turn Video On'}
                >
                  {videoActive ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                </button>

                <button
                  onClick={handleEndAndGenerateRx}
                  className="px-5 py-3 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-2 transition shadow-lg shadow-rose-900/30"
                >
                  <PhoneOff className="w-4 h-4" />
                  <span>End Call & Issue e-Prescription</span>
                </button>
              </div>
            </div>

            {/* Chat & Clinical Notes (Right 1 col) */}
            <div className="p-4 bg-slate-900 border-t lg:border-t-0 lg:border-l border-slate-800 flex flex-col justify-between h-full">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-800 text-slate-300 text-xs font-bold">
                <MessageSquare className="w-4 h-4 text-sky-400" />
                <span>eSanjeevani Real-Time Clinical Chat</span>
              </div>

              {/* Messages scroll */}
              <div className="flex-1 overflow-y-auto space-y-3 py-3 pr-1 text-xs">
                {messages.map((m, idx) => (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-lg max-w-[85%] ${
                      m.sender === 'doc'
                        ? 'bg-emerald-950/60 border border-emerald-800/50 text-emerald-200 mr-auto'
                        : 'bg-sky-900/60 border border-sky-700/50 text-sky-100 ml-auto'
                    }`}
                  >
                    <div className="font-semibold text-[10px] opacity-75 mb-0.5">
                      {m.sender === 'doc' ? 'Dr. Ananya Sengupta' : currentUser.name}
                    </div>
                    <p className="leading-relaxed">{m.text}</p>
                  </div>
                ))}
              </div>

              {/* Input Form */}
              <form onSubmit={handleSendMessage} className="flex gap-2 pt-3 border-t border-slate-800">
                <input
                  type="text"
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  placeholder="Type a message or describe symptom..."
                  className="flex-1 bg-slate-950 border border-slate-700 text-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-sky-500"
                />
                <button
                  type="submit"
                  className="bg-sky-600 hover:bg-sky-500 text-white p-2 rounded-lg transition"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        ) : (
          /* Call Completed & e-Prescription Screen */
          <div className="p-8 text-white flex-1 overflow-y-auto">
            <div className="max-w-2xl mx-auto bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-white">Teleconsultation Completed</h3>
                    <p className="text-xs text-emerald-400 font-medium">
                      e-Prescription Digitally Signed & Synced to ABHA Health Locker
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-mono text-slate-400 bg-slate-900 px-2.5 py-1 rounded">
                  Doc ID: #ESAN-2026-992
                </span>
              </div>

              {/* Prescription Details Card */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 mb-5 space-y-3 text-xs">
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Diagnosis:</span>
                  <span className="font-semibold text-white">Acute Upper Respiratory Tract Infection (J06.9)</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-1.5 font-semibold">Prescribed Medicines:</span>
                  <ul className="space-y-1.5 pl-3 list-disc text-slate-200">
                    <li>Tab Paracetamol 650mg — 1-0-1 (After Food) for 3 days</li>
                    <li>Tab Levocetirizine 5mg — 0-0-1 (Bedtime) for 5 days</li>
                    <li>Warm Saline Gargle — 2 times daily</li>
                  </ul>
                </div>
                <div className="border-t border-slate-800 pt-2 flex items-center justify-between text-[11px] text-emerald-400">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> ABDM Cryptographic Signature Verified
                  </span>
                  <span>Follow-up: 4 days</span>
                </div>
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold"
                >
                  Close Window
                </button>
                <button
                  onClick={() => {
                    alert('Official Government e-Prescription PDF downloaded successfully!');
                    onClose();
                  }}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-2 shadow-md"
                >
                  <Download className="w-4 h-4" />
                  <span>Download OPD e-Slip (PDF)</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
