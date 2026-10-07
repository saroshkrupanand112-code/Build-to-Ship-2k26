import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Activity, 
  PlusCircle, 
  History, 
  Settings, 
  HelpCircle, 
  ShieldAlert, 
  Sparkles,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Info,
  Sliders
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ onNewInvestigation, onLoadDemo, historyCount = 0 }) {
  const location = useLocation();
  const { user } = useAuth();

  return (
    <aside className="w-64 flex-shrink-0 hidden lg:flex flex-col justify-between p-4 glass-panel border-r border-surface-750/70 bg-surface-950/70 min-h-[calc(100vh-4rem)] sticky top-16">
      
      {/* Navigation Groups */}
      <div className="space-y-6">
        
        {/* User Profile Card */}
        {user && (
          <div className="p-3 rounded-xl bg-surface-900/90 border border-brand-500/30 flex items-center gap-2.5 shadow-md">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-400 to-cyan-400 flex items-center justify-center text-white font-black text-xs shadow-sm flex-shrink-0">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[10px] text-brand-300 font-mono font-medium leading-none">Hello,</div>
              <div className="text-xs font-bold text-white truncate mt-0.5">{user.name}</div>
            </div>
          </div>
        )}
        
        {/* Main Actions */}
        <div>
          <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2 font-mono">
            Investigation Engine
          </p>
          <div className="space-y-1">
            <button
              onClick={onNewInvestigation}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold bg-brand-500/20 text-brand-300 border border-brand-500/40 hover:bg-brand-500/30 transition-all text-left group"
            >
              <span className="flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-brand-400 group-hover:rotate-90 transition-transform" />
                New Investigation
              </span>
              <span className="text-[10px] bg-brand-950 px-1.5 py-0.5 rounded text-brand-400 font-mono">NEW</span>
            </button>

            <Link
              to="/investigate"
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                location.pathname === '/investigate'
                  ? 'bg-surface-800 text-white font-semibold border border-surface-700'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-surface-850'
              }`}
            >
              <Activity className="w-4 h-4 text-brand-400" />
              Investigation Workbench
            </Link>

            <Link
              to="/history"
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                location.pathname === '/history'
                  ? 'bg-surface-800 text-white font-semibold border border-surface-700'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-surface-850'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <History className="w-4 h-4 text-slate-400" />
                Investigation History
              </span>
              {historyCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-surface-700 text-slate-200 font-mono">
                  {historyCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Demo Presets (1-Click Evaluation) */}
        <div>
          <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2 font-mono flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-brand-400" />
            Hackathon Scenarios
          </p>
          <div className="space-y-1.5">
            <button
              onClick={() => onLoadDemo && onLoadDemo('vibration')}
              className="w-full text-left p-2.5 rounded-lg border border-surface-750 bg-surface-900/60 hover:border-brand-500/50 hover:bg-surface-850 transition-all group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-200 group-hover:text-brand-300">
                  Demo 1: Belt Vibration
                </span>
                <span className="text-[10px] px-1 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono">
                  CORROBORATION
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                4 independent modalities cross-validate mechanical sheave misalignment.
              </p>
            </button>

            <button
              onClick={() => onLoadDemo && onLoadDemo('overheating')}
              className="w-full text-left p-2.5 rounded-lg border border-amber-900/50 bg-amber-950/10 hover:border-amber-500/60 hover:bg-amber-950/20 transition-all group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-amber-200 group-hover:text-amber-300">
                  Demo 2: Thermal Conflict
                </span>
                <span className="text-[10px] px-1 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 font-mono">
                  CONTRADICTION
                </span>
              </div>
              <p className="text-[11px] text-amber-400/80 mt-1 line-clamp-2">
                Reported "overheating" clashes directly with 41.8°C gauge photo & OEM datasheet.
              </p>
            </button>
          </div>
        </div>

        {/* System Settings & Diagnostics */}
        <div>
          <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2 font-mono">
            System & Diagnostics
          </p>
          <div className="space-y-1">
            <Link
              to="/settings"
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                location.pathname === '/settings'
                  ? 'bg-surface-800 text-white font-semibold border border-surface-700'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-surface-850'
              }`}
            >
              <Sliders className="w-4 h-4 text-slate-400" />
              API & DB Diagnostics
            </Link>
          </div>
        </div>

      </div>

      {/* WHY FIELDSENSE? Core Differentiator Callout Box */}
      <div className="mt-6 p-3.5 rounded-xl bg-gradient-to-b from-surface-900 to-surface-950 border border-brand-500/25 shadow-lg shadow-black/40">
        <div className="flex items-center gap-2 mb-2">
          <Layers className="w-4 h-4 text-brand-400" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-brand-300 font-mono">
            WHY FIELDSENSE?
          </span>
        </div>
        <p className="text-[11px] text-slate-300 leading-relaxed mb-2.5">
          "Traditional AI summarizes files in isolation. FieldSense makes modalities <strong>cross-check</strong> each other."
        </p>
        <div className="space-y-1 text-[10px] font-mono border-t border-surface-750 pt-2 text-slate-400">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <CheckCircle2 className="w-3 h-3" />
            <span>✓ Supports hypothesis</span>
          </div>
          <div className="flex items-center gap-1.5 text-amber-400">
            <AlertTriangle className="w-3 h-3" />
            <span>⚠ Contradicts claims</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400">
            <Info className="w-3 h-3" />
            <span>○ Provides context</span>
          </div>
          <div className="flex items-center gap-1.5 text-cyan-400">
            <HelpCircle className="w-3 h-3" />
            <span>? Identifies missing data</span>
          </div>
        </div>
      </div>

    </aside>
  );
}
