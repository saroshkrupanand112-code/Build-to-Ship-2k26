import React, { useState, useEffect } from 'react';
import { 
  History, 
  Search, 
  Trash2, 
  FileText, 
  AlertTriangle, 
  CheckCircle2, 
  Calendar, 
  ArrowRight,
  Layers,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { getInvestigationsApi, deleteInvestigationApi } from '../api/client';
import InvestigationReportModal from '../components/InvestigationReportModal';

export default function HistoryPage() {
  const [investigations, setInvestigations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await getInvestigationsApi();
      if (res && res.data) {
        setInvestigations(res.data);
      }
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDelete = async (id) => {
    try {
      await deleteInvestigationApi(id);
      setInvestigations(prev => prev.filter(item => (item.id || item._id) !== id));
      setDeleteConfirmId(null);
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const filtered = investigations.filter(item => {
    const q = searchQuery.toLowerCase();
    const titleMatch = (item.title || '').toLowerCase().includes(q);
    const descMatch = (item.description || '').toLowerCase().includes(q);
    return titleMatch || descMatch;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-800 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide flex items-center gap-2">
            <History className="w-6 h-6 text-brand-400" />
            <span>INVESTIGATION HISTORY</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Persisted multimodal investigation records and cross-modal audit trails
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search past investigations..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-surface-900 border border-surface-750 text-xs text-slate-200 placeholder-slate-500 focus:border-brand-400 focus:outline-none"
          />
        </div>
      </div>

      {/* History Items List */}
      {loading ? (
        <div className="p-12 text-center">
          <div className="w-8 h-8 border-2 border-brand-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-400 font-mono">Loading investigation repository...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 rounded-2xl glass-panel border border-surface-750 bg-surface-900/40 text-center space-y-3">
          <Layers className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-white">No Investigations Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {searchQuery 
              ? `No records matching "${searchQuery}".` 
              : 'Execute an incident analysis on the workbench and click "Save Investigation" to record it here.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => {
            const id = item.id || item._id;
            const ai = item.aiResult || {};
            const conf = ai.confidence || {};
            const contradictionsCount = (ai.contradictions || []).length;
            const evidenceCount = (ai.evidence || []).length || (item.evidenceMetadata || []).length;

            return (
              <div
                key={id}
                className="p-5 rounded-2xl glass-panel border border-surface-750/80 bg-surface-900/80 hover:border-brand-500/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group shadow-md"
              >
                {/* Details */}
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800">
                      ID: {id.slice(0, 8)}...
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-500" />
                      {new Date(item.createdAt || Date.now()).toLocaleDateString()}
                    </span>

                    {/* Confidence Pill */}
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                      conf.score >= 75 
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' 
                        : conf.score >= 50 
                          ? 'bg-amber-950 text-amber-400 border border-amber-800' 
                          : 'bg-rose-950 text-rose-400 border border-rose-800'
                    }`}>
                      {conf.score || 0}% {conf.label || 'Medium'} Confidence
                    </span>

                    {/* Contradiction Flag */}
                    {contradictionsCount > 0 && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-rose-950 text-rose-300 border border-rose-800 flex items-center gap-1 animate-pulse">
                        <AlertTriangle className="w-3 h-3" />
                        {contradictionsCount} Conflict Flagged
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-white group-hover:text-brand-300 transition-colors">
                    {item.title}
                  </h3>

                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>

                  <div className="text-[11px] font-mono text-slate-500">
                    {evidenceCount} Evidence Sources Analyzed
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0 self-end md:self-center">
                  <button
                    onClick={() => setSelectedReport(ai)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-surface-800 hover:bg-surface-700 text-slate-200 border border-surface-700 flex items-center gap-1.5 transition-all"
                  >
                    <FileText className="w-3.5 h-3.5 text-cyan-400" />
                    <span>View Audit Report</span>
                  </button>

                  {deleteConfirmId === id ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDelete(id)}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-rose-600 text-white"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(null)}
                        className="px-2 py-1.5 rounded-lg text-xs bg-surface-800 text-slate-400"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirmId(id)}
                      className="p-1.5 rounded-lg bg-surface-850 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 border border-surface-700 transition-colors"
                      title="Delete record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Report Modal */}
      {selectedReport && (
        <InvestigationReportModal
          isOpen={true}
          onClose={() => setSelectedReport(null)}
          reportData={selectedReport}
          investigationTitle="Archived Investigation"
        />
      )}

    </div>
  );
}
