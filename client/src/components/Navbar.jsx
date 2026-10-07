import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Activity, 
  Layers, 
  History, 
  Settings, 
  ShieldCheck, 
  Sparkles, 
  AlertTriangle,
  PlayCircle,
  User,
  LogOut,
  LogIn,
  BookOpen
} from 'lucide-react';
import { getHealthApi } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ onLoadDemo }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [health, setHealth] = useState(null);
  const { user, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    getHealthApi()
      .then(res => setHealth(res))
      .catch(() => setHealth({ status: 'offline' }));
  }, []);

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-surface-750/70 bg-surface-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo & Tagline */}
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-brand-400 to-brand-700 shadow-lg shadow-brand-500/20 group-hover:shadow-brand-500/40 transition-all">
                <Layers className="w-5 h-5 text-white" />
                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold tracking-wider text-white">FIELDSENSE</span>
                  <span className="px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-widest bg-brand-500/20 text-brand-300 border border-brand-500/40 rounded">AI</span>
                </div>
                <p className="text-[11px] text-slate-400 hidden sm:block tracking-tight font-mono">
                  See it. Hear it. Understand it. Cross-check it.
                </p>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <Link 
              to="/investigate" 
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                location.pathname === '/investigate' 
                  ? 'bg-brand-500/15 text-brand-300 border border-brand-500/30' 
                  : 'text-slate-300 hover:text-white hover:bg-surface-800'
              }`}
            >
              <Activity className="w-4 h-4 text-brand-400" />
              Workbench
            </Link>

            <Link 
              to="/history" 
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                location.pathname === '/history' 
                  ? 'bg-brand-500/15 text-brand-300 border border-brand-500/30' 
                  : 'text-slate-300 hover:text-white hover:bg-surface-800'
              }`}
            >
              <History className="w-4 h-4 text-slate-400" />
              History
            </Link>

            <Link 
              to="/settings" 
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                location.pathname === '/settings' 
                  ? 'bg-brand-500/15 text-brand-300 border border-brand-500/30' 
                  : 'text-slate-300 hover:text-white hover:bg-surface-800'
              }`}
            >
              <Settings className="w-4 h-4 text-slate-400" />
              Diagnostics
            </Link>
          </nav>

          {/* Quick Demos & Health Badge & User */}
          <div className="flex items-center gap-3">
            {onLoadDemo && (
              <div className="hidden lg:flex items-center gap-2 border-r border-surface-750 pr-3">
                <button
                  onClick={() => onLoadDemo('vibration')}
                  className="px-2.5 py-1 text-xs font-medium rounded-md bg-surface-800 hover:bg-brand-950/60 text-slate-300 hover:text-brand-300 border border-surface-700 hover:border-brand-500/40 transition-all flex items-center gap-1.5"
                  title="Scenario 1: Cross-modal corroboration"
                >
                  <PlayCircle className="w-3.5 h-3.5 text-brand-400" />
                  Demo: Belt
                </button>
                <button
                  onClick={() => onLoadDemo('overheating')}
                  className="px-2.5 py-1 text-xs font-medium rounded-md bg-amber-950/30 hover:bg-amber-950/60 text-amber-300 border border-amber-800/40 hover:border-amber-500/40 transition-all flex items-center gap-1.5"
                  title="Scenario 2: Cross-modal contradiction detection"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  Demo: Thermal
                </button>
              </div>
            )}

            {/* System Status Pill */}
            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-surface-900 border border-surface-750 text-xs">
              <span className={`w-2 h-2 rounded-full ${health?.status === 'healthy' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span className="text-slate-300 font-mono text-[11px]">
                {health?.ai?.configured ? 'Gemini 1.5' : 'v2 Hybrid ML'}
              </span>
            </div>

            {/* Auth Button or User Badge */}
            {isAuthenticated && user ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-850 border border-surface-700 text-xs text-slate-200">
                  <User className="w-3.5 h-3.5 text-brand-400" />
                  <span className="font-semibold text-white max-w-[90px] truncate">{user.name}</span>
                </div>
                <button
                  onClick={logout}
                  title="Sign out"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-surface-800 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-surface-800 hover:bg-surface-750 text-slate-200 border border-surface-700 hover:border-brand-500/40 flex items-center gap-1.5 transition-all"
              >
                <LogIn className="w-3.5 h-3.5 text-brand-400" />
                <span>Sign In</span>
              </Link>
            )}

            <Link
              to="/investigate"
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-400 hover:to-brand-500 text-white shadow-md shadow-brand-600/30 transition-all hidden sm:inline-flex"
            >
              Investigate
            </Link>
          </div>

        </div>
      </div>
    </header>
  );
}
