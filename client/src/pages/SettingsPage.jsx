import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Key, 
  Database, 
  Cpu, 
  CheckCircle2, 
  AlertCircle, 
  HardDrive, 
  Layers, 
  Check, 
  ExternalLink,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { getHealthApi, updateApiKeyApi } from '../api/client';

export default function SettingsPage() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [keySaved, setKeySaved] = useState(false);
  const [keyError, setKeyError] = useState(null);

  const fetchHealth = async () => {
    setLoading(true);
    try {
      const res = await getHealthApi();
      setHealth(res);
    } catch (err) {
      console.error('Failed to fetch health:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  const handleSaveKey = async (e) => {
    e.preventDefault();
    if (!apiKeyInput.trim()) {
      setKeyError('Please enter a valid Gemini API key.');
      return;
    }

    try {
      setKeyError(null);
      const res = await updateApiKeyApi(apiKeyInput.trim());
      if (res.success) {
        setKeySaved(true);
        setApiKeyInput('');
        fetchHealth();
        setTimeout(() => setKeySaved(false), 3000);
      }
    } catch (err) {
      setKeyError('Failed to update API key on backend.');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-surface-800 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide flex items-center gap-2">
            <Settings className="w-6 h-6 text-brand-400" />
            <span>SYSTEM &amp; AI DIAGNOSTICS</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time backend status, Google GenAI SDK configuration, and database storage telemetry
          </p>
        </div>

        <button
          onClick={fetchHealth}
          className="p-2 rounded-xl bg-surface-850 hover:bg-surface-800 border border-surface-700 text-slate-300 transition-colors"
          title="Refresh diagnostics"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Grid of Diagnostics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Card 1: Gemini AI Reasoning Engine */}
        <div className="p-6 rounded-2xl glass-panel border border-brand-500/30 bg-surface-900/80 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-surface-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-brand-500/15 text-brand-300 border border-brand-500/30">
                <Cpu className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white font-mono">
                  GOOGLE GEMINI AI ENGINE
                </h3>
                <p className="text-[11px] text-slate-400 font-mono">
                  Official Google GenAI SDK Backend
                </p>
              </div>
            </div>

            <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase ${
              health?.ai?.configured 
                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' 
                : 'bg-cyan-950 text-cyan-400 border border-cyan-800'
            }`}>
              {health?.ai?.mode || 'smart-simulation'}
            </span>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between p-2 rounded bg-surface-850 border border-surface-800">
              <span className="text-slate-400">Execution Target:</span>
              <span className="text-white font-bold">{health?.ai?.model || 'gemini-1.5-flash'}</span>
            </div>
            <div className="flex justify-between p-2 rounded bg-surface-850 border border-surface-800">
              <span className="text-slate-400">Current Key:</span>
              <span className="text-cyan-300">{health?.ai?.keyMasked || 'Not Configured'}</span>
            </div>
            <div className="flex justify-between p-2 rounded bg-surface-850 border border-surface-800">
              <span className="text-slate-400">Backend Isolation:</span>
              <span className="text-emerald-400">Protected (Zero Frontend Key Exposure)</span>
            </div>
          </div>

          {/* Key Update Form */}
          <form onSubmit={handleSaveKey} className="pt-2 space-y-2">
            <label className="text-[11px] font-bold text-slate-300 uppercase font-mono block">
              Configure or Update Gemini API Key:
            </label>
            <div className="flex gap-2">
              <input
                type="password"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder="AIzaSy..."
                className="flex-1 p-2 rounded-xl bg-surface-950 border border-surface-700 text-xs text-white placeholder-slate-600 focus:border-brand-400 focus:outline-none font-mono"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl text-xs font-bold bg-brand-500 hover:bg-brand-400 text-white shadow-md shadow-brand-500/20 transition-all flex items-center gap-1.5 font-mono"
              >
                {keySaved ? <Check className="w-3.5 h-3.5" /> : <Key className="w-3.5 h-3.5" />}
                <span>{keySaved ? 'Saved!' : 'Save Key'}</span>
              </button>
            </div>
            {keyError && (
              <p className="text-[11px] text-rose-400 font-mono">{keyError}</p>
            )}
            <p className="text-[10px] text-slate-500 font-mono">
              Get an API key at <a href="https://aistudio.google.com/" target="_blank" rel="noreferrer" className="text-brand-400 underline inline-flex items-center gap-0.5">aistudio.google.com <ExternalLink className="w-2.5 h-2.5" /></a>
            </p>
          </form>
        </div>

        {/* Card 2: Persistence & Database Store */}
        <div className="p-6 rounded-2xl glass-panel border border-surface-750 bg-surface-900/80 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-surface-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-surface-800 text-slate-300 border border-surface-700">
                <Database className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white font-mono">
                  DATABASE &amp; STORAGE
                </h3>
                <p className="text-[11px] text-slate-400 font-mono">
                  Cloud Firestore + In-Memory Fallback
                </p>
              </div>
            </div>

            <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase bg-emerald-950 text-emerald-400 border border-emerald-800">
              OPERATIONAL
            </span>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between p-2 rounded bg-surface-850 border border-surface-800">
              <span className="text-slate-400">Driver Mode:</span>
              <span className="text-white font-bold">{health?.database?.storageType || 'Cloud Firestore'}</span>
            </div>
            <div className="flex justify-between p-2 rounded bg-surface-850 border border-surface-800">
              <span className="text-slate-400">Firestore Connection:</span>
              <span className={health?.database?.connected ? 'text-emerald-400' : 'text-amber-400'}>
                {health?.database?.connected ? 'Connected to Cloud Firestore' : 'Fallback Active (Zero-Config)'}
              </span>
            </div>
            <div className="flex justify-between p-2 rounded bg-surface-850 border border-surface-800">
              <span className="text-slate-400">Persisted Records:</span>
              <span className="text-white font-bold">{health?.savedInvestigations || 0} Investigations</span>
            </div>
            <div className="flex justify-between p-2 rounded bg-surface-850 border border-surface-800">
              <span className="text-slate-400">Server Uptime:</span>
              <span className="text-cyan-300">{health?.uptime || 0} seconds</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-surface-950/80 border border-surface-800 text-[11px] text-slate-400 font-mono leading-relaxed">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 inline mr-1" />
            FieldSense AI uses a resilient repository: it automatically binds to Firebase Cloud Firestore when configured, or seamlessly activates an in-memory repository so the app runs with zero external friction.
          </div>
        </div>

      </div>

      {/* Upload Constraints & Specification Card */}
      <div className="p-6 rounded-2xl glass-panel border border-surface-750 bg-surface-900/60 shadow-xl space-y-4">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-2">
          <HardDrive className="w-4 h-4 text-brand-400" />
          FILE UPLOAD &amp; MODALITY SPECS
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
          <div className="p-3 rounded-xl bg-surface-850 border border-surface-800">
            <span className="text-slate-400 block text-[10px]">IMAGE FORMATS</span>
            <span className="text-cyan-300 font-bold">PNG, JPG, WEBP</span>
            <span className="text-[10px] text-slate-500 block mt-1">Up to 50MB</span>
          </div>

          <div className="p-3 rounded-xl bg-surface-850 border border-surface-800">
            <span className="text-slate-400 block text-[10px]">AUDIO FORMATS</span>
            <span className="text-indigo-300 font-bold">MP3, WAV, M4A, WEBM</span>
            <span className="text-[10px] text-slate-500 block mt-1">Up to 50MB</span>
          </div>

          <div className="p-3 rounded-xl bg-surface-850 border border-surface-800">
            <span className="text-slate-400 block text-[10px]">VIDEO FORMATS</span>
            <span className="text-purple-300 font-bold">MP4, WEBM, MOV</span>
            <span className="text-[10px] text-slate-500 block mt-1">Up to 50MB</span>
          </div>

          <div className="p-3 rounded-xl bg-surface-850 border border-surface-800">
            <span className="text-slate-400 block text-[10px]">DOCUMENTS</span>
            <span className="text-emerald-300 font-bold">PDF, TXT, DOCX</span>
            <span className="text-[10px] text-slate-500 block mt-1">OEM Manuals</span>
          </div>
        </div>
      </div>

    </div>
  );
}
