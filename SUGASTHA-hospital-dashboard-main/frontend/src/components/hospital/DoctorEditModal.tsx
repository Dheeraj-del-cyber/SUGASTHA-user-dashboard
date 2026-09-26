import React, { useState } from 'react';
import { X, Trash2, Save } from 'lucide-react';
import { Doctor } from '../../types';

interface DoctorEditModalProps {
  doctor: Doctor;
  onClose: () => void;
  onSave: (doctorId: string, updates: Partial<Doctor>) => void;
  onDelete: (doctorId: string) => void;
}

export const DoctorEditModal: React.FC<DoctorEditModalProps> = ({ doctor, onClose, onSave, onDelete }) => {
  const [form, setForm] = useState<Doctor>({ ...doctor });
  const [confirmDelete, setConfirmDelete] = useState(false);

  const field = (key: keyof Doctor, value: any) => setForm(prev => ({ ...prev, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(doctor.id, form);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-[fadeIn_0.15s_ease-out]">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h4 className="font-black text-lg text-slate-900">Edit Doctor Details</h4>
            <p className="text-xs text-slate-500 mt-0.5">Update roster information, specialty & OPD timings</p>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Full Name</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => field('name', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 outline-none"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Specialty</label>
              <input
                type="text"
                required
                value={form.specialty}
                onChange={(e) => field('specialty', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 outline-none"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Qualification</label>
              <input
                type="text"
                value={form.qualification}
                onChange={(e) => field('qualification', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Experience (yrs)</label>
              <input
                type="number"
                min={0}
                value={form.experienceYears}
                onChange={(e) => field('experienceYears', Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Room No</label>
              <input
                type="text"
                value={form.roomNo}
                onChange={(e) => field('roomNo', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 outline-none"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">OPD Timing / Availability</label>
              <input
                type="text"
                value={form.opdTiming}
                onChange={(e) => field('opdTiming', e.target.value)}
                placeholder="e.g. Mon-Sat, 9:00 AM - 1:00 PM"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 outline-none"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Available Days</label>
              <div className="flex flex-wrap gap-1.5">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => {
                  const active = form.availableDays?.includes(day);
                  return (
                    <button
                      type="button"
                      key={day}
                      onClick={() =>
                        field(
                          'availableDays',
                          active
                            ? form.availableDays.filter(d => d !== day)
                            : [...(form.availableDays || []), day]
                        )
                      }
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all ${
                        active
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">AEBAS Status</label>
              <select
                value={form.aebasStatus}
                onChange={(e) => field('aebasStatus', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 outline-none"
              >
                <option value="ON_DUTY">ON_DUTY</option>
                <option value="IN_OPD">IN_OPD</option>
                <option value="IN_SURGERY">IN_SURGERY</option>
                <option value="ON_LEAVE">ON_LEAVE</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Max Daily Slots</label>
              <input
                type="number"
                min={1}
                value={form.maxDailySlots}
                onChange={(e) => field('maxDailySlots', Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Phone</label>
              <input
                type="text"
                value={form.phone || ''}
                onChange={(e) => field('phone', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Email</label>
              <input
                type="email"
                value={form.email || ''}
                onChange={(e) => field('email', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 outline-none"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Consultation Fee (₹, 0 for Govt)</label>
              <input
                type="number"
                min={0}
                value={form.consultationFee}
                onChange={(e) => field('consultationFee', Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 outline-none"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
            {confirmDelete ? (
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-rose-600 font-semibold">Remove doctor permanently?</span>
                <button
                  type="button"
                  onClick={() => { onDelete(doctor.id); onClose(); }}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold rounded-lg"
                >
                  Confirm Remove
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="px-3 py-1.5 text-[11px] font-bold text-slate-500 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-bold transition"
              >
                <Trash2 className="w-3.5 h-3.5" /> Remove Doctor
              </button>
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" /> Save Changes
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
