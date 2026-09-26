import React, { useState, useEffect } from 'react';
import { useHealthcare } from '../../context/HealthcareContext';
import {
  Activity,
  Clock,
  ShieldCheck,
  LogOut,
  Volume2,
  VolumeX,
  Building2
} from 'lucide-react';

export const GovHeader: React.FC = () => {
  const {
    soundEnabled,
    setSoundEnabled,
    activeFallback,
    logout,
    hospitals,
    currentHospitalId,
    setCurrentHospitalId
  } = useHealthcare();

  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        }) + ' IST'
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs transition-all">
      {/* Indian Tricolor Ribbon */}
      <div className="h-1 w-full flex">
        <div className="flex-1 bg-amber-500" />
        <div className="flex-1 bg-white border-y border-slate-200/50" />
        <div className="flex-1 bg-emerald-600" />
      </div>

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
        {/* Logo & Platform Title */}
        <div className="flex items-center gap-3 min-w-0 flex-shrink-0">
          <div className="relative flex-shrink-0">
            <img
              src="/logo.png"
              alt="SUGASTHA Logo"
              className="h-10 w-auto object-contain"
            />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xl font-black tracking-tight text-slate-900 flex items-center gap-1.5 whitespace-nowrap">
                SUGASTHA
                <span className="text-amber-600 font-extrabold text-sm hidden md:inline">सुगस्था</span>
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap">
                <Activity className="w-2.5 h-2.5 mr-1 text-emerald-600 animate-pulse" />
                ABDM CONNECTED
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium hidden sm:block leading-tight truncate">
              National Unified Healthcare Platform · MoHFW, Govt of India
            </p>
          </div>
        </div>

        {/* Center: Live Hospital Facility Switcher */}
        <div className="hidden lg:flex items-center gap-2 bg-slate-50 border border-slate-200/90 rounded-xl px-3 py-1.5 hover:border-slate-300 transition-colors flex-shrink-0 max-w-[260px]">
          <Building2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <div className="flex flex-col text-left min-w-0">
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider leading-none">Active Command Facility</span>
            <select
              value={currentHospitalId}
              onChange={(e) => setCurrentHospitalId(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-800 outline-none cursor-pointer pr-1 py-0.5 w-full truncate"
              aria-label="Select Hospital"
            >
              {hospitals.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name} ({h.type})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Fallback Alert Banner (when active) */}
        {activeFallback && (
          <div className="w-full lg:w-auto order-last lg:order-none flex items-center gap-2 bg-rose-50 border border-rose-300 px-3 py-1.5 rounded-xl text-rose-800 text-xs font-semibold animate-pulse shadow-sm flex-shrink-0">
            <div className="w-2 h-2 rounded-full bg-rose-600 animate-ping flex-shrink-0" />
            <span className="truncate">Auto-Escalation: <strong>{activeFallback.secondsRemaining}s</strong></span>
          </div>
        )}

        {/* Right Action Bar */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 ml-auto">
          {/* Audio Alarm Toggle */}
          <button
            onClick={() => setSoundEnabled(prev => !prev)}
            title={soundEnabled ? 'Audio Alarms Active (Click to Mute)' : 'Audio Alarms Muted (Click to Enable)'}
            className={`p-2 rounded-xl border text-xs font-medium transition-all flex items-center gap-1.5 ${
              soundEnabled
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-600'
            }`}
          >
            {soundEnabled ? (
              <>
                <Volume2 className="w-4 h-4 text-emerald-600" />
                <span className="hidden xl:inline text-[11px] font-semibold">Sound ON</span>
              </>
            ) : (
              <>
                <VolumeX className="w-4 h-4" />
                <span className="hidden xl:inline text-[11px]">Muted</span>
              </>
            )}
          </button>

          {/* Clock */}
          <div className="hidden sm:flex items-center gap-1.5 text-slate-600 font-mono text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 shadow-2xs">
            <Clock className="w-3.5 h-3.5 text-sky-600" />
            <span>{currentTime}</span>
          </div>

          {/* User Profile Badge */}
          <div className="hidden md:flex items-center gap-2 bg-slate-900 text-white rounded-xl px-3 py-1.5 shadow-sm">
            <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs border border-emerald-500/30">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
            <div className="text-left">
              <div className="text-xs font-bold leading-tight">Hospital Admin</div>
              <div className="text-[10px] text-slate-400 leading-tight">CMO Desk</div>
            </div>
          </div>

          {/* Logout Quick Action Button */}
          <button
            onClick={logout}
            title="Secure Logout"
            className="flex items-center gap-1.5 p-2 px-3 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-colors shadow-2xs"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden xl:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};
