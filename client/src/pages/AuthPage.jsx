import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Zap, Shield, Brain, Database } from 'lucide-react';

export default function AuthPage() {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [form, setForm] = useState({ name: '', email: '', password: '', organization: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = mode === 'login'
        ? await login(form.email, form.password)
        : await register(form.name, form.email, form.password, form.organization);

      if (res.success) {
        navigate('/investigate');
      } else {
        setError(res.error || 'Authentication failed.');
      }
    } catch (err) {
      setError(err?.response?.data?.error || err.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: Brain, label: 'Gemini Multimodal AI', desc: 'Cross-modal evidence reasoning' },
    { icon: Database, label: 'RAG Pipeline', desc: 'Retrieval from your own documents' },
    { icon: Zap, label: 'HuggingFace ML', desc: 'Domain fault classification' },
    { icon: Shield, label: 'JWT Auth', desc: 'Secure investigation management' }
  ];

  return (
    <div className="min-h-screen bg-surface-950 flex">
      {/* Left Panel — Branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-gradient-to-br from-surface-900 via-surface-950 to-brand-950 border-r border-surface-800">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-400 to-cyan-400 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-black tracking-widest text-white font-mono">FIELDSENSE AI</span>
          </div>
          <p className="text-xs text-brand-300 font-mono tracking-wider">v2.0 — Multimodal Evidence Intelligence</p>
        </div>

        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-black text-white leading-tight">
              We don't just combine modalities.
            </h1>
            <h1 className="text-4xl font-black text-brand-400 leading-tight">
              We make them cross-validate each other.
            </h1>
          </div>
          <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
            Upload field evidence across text, image, audio, video, and documents.
            FieldSense AI cross-checks every source, detects contradictions, and tells you
            exactly what evidence you need next.
          </p>

          <div className="space-y-3">
            {features.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex items-start gap-3 p-3 rounded-xl bg-surface-900/50 border border-surface-800">
                <div className="w-8 h-8 rounded-lg bg-brand-500/20 border border-brand-500/30 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-brand-400" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">{label}</div>
                  <div className="text-[11px] text-slate-500">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-[11px] text-slate-600 font-mono">
          "See it. Hear it. Understand it. Cross-check it."
        </p>
      </div>

      {/* Right Panel — Form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm space-y-6">
          {/* Mobile logo */}
          <div className="lg:hidden text-center">
            <div className="inline-flex items-center gap-2 mb-1">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-400 to-cyan-400 flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="font-black tracking-widest text-white font-mono text-base">FIELDSENSE AI</span>
            </div>
          </div>

          {/* Tab toggle */}
          <div className="flex rounded-xl border border-surface-700 p-1 bg-surface-900">
            {['login', 'register'].map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(''); }}
                className={`flex-1 py-2 rounded-lg text-xs font-bold font-mono uppercase tracking-wider transition-all ${
                  mode === m
                    ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {m === 'login' ? 'Sign In' : 'Register'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Full Name</label>
                  <input
                    type="text" required
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="Jane Smith"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-900 border border-surface-700 focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30 text-sm text-white placeholder-slate-600 transition-all outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Organization</label>
                  <input
                    type="text"
                    value={form.organization}
                    onChange={e => setForm(f => ({ ...f, organization: e.target.value }))}
                    placeholder="Acme Industrial Co."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-900 border border-surface-700 focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30 text-sm text-white placeholder-slate-600 transition-all outline-none"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Email</label>
              <input
                type="email" required
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="you@company.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-900 border border-surface-700 focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30 text-sm text-white placeholder-slate-600 transition-all outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'} required
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="Min. 6 characters"
                  className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-surface-900 border border-surface-700 focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30 text-sm text-white placeholder-slate-600 transition-all outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-800/60 text-rose-300 text-xs">
                {error}
              </div>
            )}

            <button
              type="submit" disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-500 to-cyan-500 hover:from-brand-400 hover:to-cyan-400 text-white font-bold text-sm font-mono uppercase tracking-wider transition-all shadow-lg shadow-brand-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {mode === 'login' ? 'Signing In...' : 'Creating Account...'}
                </span>
              ) : (
                mode === 'login' ? 'Sign In to FieldSense' : 'Create Account'
              )}
            </button>
          </form>

          {/* Guest access note */}
          <div className="text-center">
            <p className="text-[11px] text-slate-600">
              Or{' '}
              <button
                onClick={() => window.location.href = '/investigate'}
                className="text-brand-400 hover:text-brand-300 underline transition-colors"
              >
                continue as guest
              </button>
              {' '}(investigations not saved to account)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
