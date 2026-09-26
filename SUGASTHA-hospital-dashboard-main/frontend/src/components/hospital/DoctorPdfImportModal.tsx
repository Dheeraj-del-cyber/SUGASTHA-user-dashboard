import React, { useState } from 'react';
import { X, UploadCloud, FileText, Check, AlertCircle, Loader2, Plus } from 'lucide-react';
import { extractDoctorsFromPdfFile, ExtractedDoctorRow } from '../../utils/doctorPdfExtract';

interface DoctorPdfImportModalProps {
  hospitalName: string;
  onClose: () => void;
  onAddRow: (row: ExtractedDoctorRow) => void;
}

export const DoctorPdfImportModal: React.FC<DoctorPdfImportModalProps> = ({ hospitalName, onClose, onAddRow }) => {
  const [fileName, setFileName] = useState('');
  const [rows, setRows] = useState<ExtractedDoctorRow[]>([]);
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [addedIndexes, setAddedIndexes] = useState<Set<number>>(new Set());

  const handleFile = async (file: File) => {
    setFileName(file.name);
    setStatus('loading');
    setErrorMsg('');
    setAddedIndexes(new Set());
    try {
      const extracted = await extractDoctorsFromPdfFile(file);
      if (extracted.length === 0) {
        setStatus('error');
        setErrorMsg(
          "Couldn't detect any doctor / timing rows in this PDF. Expected lines like " +
          '"Dr. Name - Specialty - 9:00 AM - 1:00 PM". Try a different file or add doctors manually.'
        );
        setRows([]);
        return;
      }
      setRows(extracted);
      setStatus('done');
    } catch (err: any) {
      setStatus('error');
      setErrorMsg(err?.message || 'Failed to read this PDF file.');
    }
  };

  const handleAddAll = () => {
    rows.forEach((row, i) => {
      if (!addedIndexes.has(i)) onAddRow(row);
    });
    setAddedIndexes(new Set(rows.map((_, i) => i)));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-[fadeIn_0.15s_ease-out]">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h4 className="font-black text-lg text-slate-900">Import Doctors from PDF</h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Upload a doctor schedule / roster PDF for <strong>{hospitalName}</strong>. If this hospital has
              multiple branches, upload each branch's sheet separately — extracted rows are reviewed before adding.
            </p>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {status !== 'done' && (
          <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-slate-200 hover:border-emerald-400 rounded-2xl py-10 cursor-pointer transition-colors bg-slate-50/60">
            <input
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
              }}
            />
            {status === 'loading' ? (
              <>
                <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
                <p className="text-xs font-semibold text-slate-600">Reading {fileName}…</p>
              </>
            ) : (
              <>
                <UploadCloud className="w-8 h-8 text-slate-400" />
                <p className="text-xs font-semibold text-slate-600">Click to choose a PDF file</p>
                <p className="text-[10px] text-slate-400">Doctor roster / OPD schedule sheets, up to a few MB</p>
              </>
            )}
          </label>
        )}

        {status === 'error' && (
          <div className="mt-4 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-2xl text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <p className="font-medium leading-relaxed">{errorMsg}</p>
          </div>
        )}

        {status === 'done' && (
          <div className="mt-2">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-xs text-slate-600 font-semibold">
                <FileText className="w-3.5 h-3.5 text-emerald-600" />
                {fileName} · {rows.length} row{rows.length !== 1 ? 's' : ''} detected
              </div>
              <button
                onClick={handleAddAll}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-lg flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" /> Add All to Roster
              </button>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {rows.map((row, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between gap-3 border border-slate-200 rounded-xl px-3.5 py-2.5 bg-white"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">{row.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">
                      {row.specialty || 'Specialty not detected'}
                      {row.opdTiming ? ` · ${row.opdTiming}` : ' · Timing not detected'}
                      {row.roomNo ? ` · ${row.roomNo}` : ''}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      onAddRow(row);
                      setAddedIndexes(prev => new Set(prev).add(i));
                    }}
                    disabled={addedIndexes.has(i)}
                    className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition ${
                      addedIndexes.has(i)
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default'
                        : 'bg-slate-900 hover:bg-slate-800 text-white'
                    }`}
                  >
                    {addedIndexes.has(i) ? (<><Check className="w-3.5 h-3.5" /> Added</>) : 'Add'}
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={() => { setStatus('idle'); setRows([]); setFileName(''); }}
              className="mt-4 text-[11px] font-semibold text-slate-500 hover:text-slate-800"
            >
              Upload a different file
            </button>
          </div>
        )}

        <div className="pt-4 mt-4 border-t border-slate-100 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100">
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
