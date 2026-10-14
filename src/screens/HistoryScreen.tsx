import { useState, useEffect } from 'react';
import { Trash2, Clock, ArrowLeft, Image as ImageIcon, AlertTriangle } from 'lucide-react';
import type { ScanResult } from '@/types';
import { getScanHistory, clearScanHistory, deleteScan } from '@/services/scanHistory';

interface HistoryScreenProps {
  onSelectScan: (result: ScanResult) => void;
  onBack: () => void;
  refreshKey: number;
}

export function HistoryScreen({ onSelectScan, onBack, refreshKey }: HistoryScreenProps) {
  const [history, setHistory] = useState<ScanResult[]>(() => getScanHistory());
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    setHistory(getScanHistory());
  }, [refreshKey]);

  const handleClear = () => {
    clearScanHistory();
    setHistory([]);
    setShowConfirm(false);
  };

  const handleDelete = (id: string) => {
    const updated = deleteScan(id);
    setHistory(updated);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-cyan-50/20 to-white">
      <div className="max-w-md mx-auto px-4 pt-6 pb-28">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors"
            >
              <ArrowLeft size={18} className="text-slate-600" />
            </button>
            <h2 className="text-xl font-bold text-slate-800">Scan History</h2>
          </div>
          {history.length > 0 && (
            <button
              onClick={() => setShowConfirm(true)}
              className="text-sm font-medium text-red-500 hover:text-red-600"
            >
              Clear All
            </button>
          )}
        </div>

        {showConfirm && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center justify-between">
            <span className="text-sm text-red-700 font-medium">Delete all scans?</span>
            <div className="flex gap-2">
              <button
                onClick={() => setShowConfirm(false)}
                className="text-sm font-medium text-slate-600 px-3 py-1.5 rounded-lg hover:bg-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleClear}
                className="text-sm font-bold text-white bg-red-500 px-3 py-1.5 rounded-lg hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        )}

        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center pt-24 text-center">
            <div className="w-20 h-20 rounded-3xl bg-slate-100 flex items-center justify-center mb-4">
              <ImageIcon size={36} className="text-slate-400" />
            </div>
            <h3 className="font-bold text-slate-700 text-base mb-1">No scans yet</h3>
            <p className="text-sm text-slate-500 max-w-[240px]">
              Your fish identification history will appear here. Start by scanning your first fish!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((scan) => (
              <div
                key={scan.id}
                className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm group"
              >
                <div className="flex items-stretch">
                  <button
                    onClick={() => onSelectScan(scan)}
                    className="flex items-stretch flex-1 text-left"
                  >
                    <div className="w-20 h-20 shrink-0 overflow-hidden bg-slate-900">
                      <img
                        src={scan.imageData}
                        alt="Scan"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 p-3 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        <h3 className="font-bold text-slate-800 text-sm truncate">
                          {scan.primaryMatch.filipinoName}
                        </h3>
                        {scan.isUncertain && (
                          <AlertTriangle size={13} className="text-amber-500 shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-teal-600 font-medium">
                        {scan.primaryMatch.commonName}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            scan.confidence >= 75
                              ? 'bg-emerald-50 text-emerald-600'
                              : 'bg-amber-50 text-amber-600'
                          }`}
                        >
                          {scan.confidence}% {scan.analysisMethod === 'huggingface-model' ? 'model score' : 'match score'}
                        </span>
                        <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                          <Clock size={10} />
                          {new Date(scan.timestamp).toLocaleDateString('en-PH', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>
                  </button>
                  <button
                    onClick={() => handleDelete(scan.id)}
                    className="w-10 flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50/50 transition-colors border-l border-slate-100"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
