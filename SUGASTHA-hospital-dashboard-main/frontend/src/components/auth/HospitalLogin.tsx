import React, { useState } from 'react';
import { useHealthcare } from '../../context/HealthcareContext';
import {
  Building2,
  Lock,
  User,
  AlertCircle,
  ShieldCheck,
  Activity,
  KeyRound,
  CheckCircle2,
  Eye,
  EyeOff
} from 'lucide-react';

export const HospitalLogin: React.FC = () => {
  const { login } = useHealthcare();
  const [hospitalId, setHospitalId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    setTimeout(() => {
      const success = login(hospitalId, password);
      if (!success) {
        setError('Invalid Hospital ID or Password. (Tip: Use the Demo Fill button below).');
        setIsLoading(false);
      }
    }, 600);
  };

  const handleQuickDemoFill = () => {
    setHospitalId('AIIMS-DL01');
    setPassword('aiims@2026');
    setError('');
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 relative font-sans">
      {/* Indian Tricolor Top Ribbon */}
      <div className="absolute top-0 left-0 right-0 h-1 flex">
        <div className="flex-1 bg-amber-500" />
        <div className="flex-1 bg-white" />
        <div className="flex-1 bg-emerald-600" />
      </div>

      <div className="max-w-md w-full relative z-10">
        {/* Portal Card */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200">
          {/* Header Banner */}
          <div className="bg-white p-8 text-center relative border-b border-slate-100">
            <div className="relative z-10 flex flex-col items-center">
              <div className="flex items-center gap-3 mb-4">
                <img
                  src="/logo.png"
                  alt="SUGASTHA Logo"
                  className="h-16 w-auto object-contain"
                />
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold mb-2">
                <Activity className="w-3.5 h-3.5 text-emerald-600" />
                Hospital Network Gateway
              </div>

              <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                SUGASTHA
                <span className="text-amber-600 font-bold text-base">सुगस्था</span>
              </h2>
              <p className="text-slate-500 text-xs mt-1 font-medium">
                Hospital Command Portal
              </p>
            </div>
          </div>

          {/* Form Area */}
          <div className="p-8">
            {error && (
              <div className="mb-6 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-2xl text-xs flex items-start gap-2.5 animate-[fadeIn_0.2s_ease-out]">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                <p className="font-medium leading-relaxed">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Hospital ID
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={hospitalId}
                    onChange={(e) => setHospitalId(e.target.value)}
                    className="block w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none"
                    placeholder="e.g. AIIMS-DL01"
                    required
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5">
                  Each hospital has its own unique ID and password issued by the network admin.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Security Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none"
                    placeholder="Enter password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Quick Demo Access Bar */}
              <button
                type="button"
                onClick={handleQuickDemoFill}
                className="w-full text-left py-2 px-3 rounded-xl bg-emerald-50/70 border border-emerald-200/80 text-emerald-800 text-xs hover:bg-emerald-100/70 transition flex items-center justify-between"
              >
                <span className="flex items-center gap-1.5 font-semibold">
                  <KeyRound className="w-3.5 h-3.5 text-emerald-600" />
                  Quick Fill Demo Credentials
                </span>
                <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded border border-emerald-300 text-emerald-900">
                  AIIMS-DL01 / aiims@2026
                </span>
              </button>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-emerald-600/25 transition-all flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Authorize & Access Dashboard</span>
                  </>
                )}
              </button>
            </form>

            {/* Compliance Standards Footer */}
            <div className="mt-8 pt-6 border-t border-slate-100 text-center">
              <div className="flex items-center justify-center gap-4 text-[10px] text-slate-500 font-medium mb-2">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" /> ABDM M1-M3
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" /> DISHA Compliant
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" /> 256-Bit SSL
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Official Ministry of Health & Family Welfare Hospital Command Gateway
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
