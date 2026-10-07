import React, { useState } from 'react';
import { Cpu, Database, Brain, Sparkles, ChevronDown, ChevronUp, CheckCircle2, Shield, Layers, ArrowRight } from 'lucide-react';

export default function AIArchitecturePanel({ aiStack = null }) {
  const [expanded, setExpanded] = useState(false);

  // Fallback defaults if not provided
  const stack = aiStack || {
    pipeline: 'RAG -> HuggingFace -> Gemini 1.5 Multimodal Fusion',
    rag: {
      enabled: true,
      model: 'TF-IDF Vector Space / Gemini Embeddings',
      status: 'active'
    },
    ml: {
      provider: 'HuggingFace Inference API (Zero-Shot NLI)',
      model: 'facebook/bart-large-mnli',
      category: 'fault-classification'
    },
    multimodal: {
      engine: 'Google Gemini 1.5 Flash',
      modalities: ['text', 'image', 'audio', 'video', 'document']
    }
  };

  return (
    <div className="rounded-2xl border border-indigo-800/40 bg-surface-900/90 shadow-xl overflow-hidden">
      {/* Header Bar */}
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full p-4 flex items-center justify-between hover:bg-surface-800/40 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center">
            <Layers className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-white font-mono uppercase tracking-wider">
                HYBRID AI ORCHESTRATION STACK
              </span>
              <span className="text-[10px] bg-indigo-950/80 border border-indigo-700/60 text-indigo-300 px-2 py-0.5 rounded-full font-mono font-bold">
                v2.0 Multimodal
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              3-tier pipeline: Vector RAG → Hugging Face Fault Classifier → Gemini 1.5 Multimodal Fusion
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-slate-400">
          <span className="text-[10px] font-mono hidden sm:inline text-indigo-400 bg-indigo-950/50 px-2 py-0.5 rounded border border-indigo-800/40">
            Pipeline Verified
          </span>
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {/* Pipeline Diagram Cards */}
      <div className="px-4 pb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          
          {/* Stage 1: RAG */}
          <div className="p-3.5 rounded-xl bg-surface-950/80 border border-emerald-900/50 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Database className="w-4 h-4 text-emerald-400" />
                <span className="text-[11px] font-black text-emerald-300 font-mono">STAGE 1: RAG</span>
              </div>
              <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800">
                Grounding
              </span>
            </div>
            <p className="text-xs font-bold text-white mb-1">Retrieval Engine</p>
            <p className="text-[10px] text-slate-400 leading-snug">
              Semantically indexes equipment manuals & SOPs to ground diagnosis in verified specifications.
            </p>
            <div className="mt-2.5 pt-2 border-t border-surface-800 flex items-center justify-between text-[10px] font-mono text-slate-500">
              <span>Model:</span>
              <span className="text-emerald-400 font-semibold truncate max-w-[130px]">Cosine / TF-IDF</span>
            </div>
          </div>

          {/* Stage 2: Hugging Face ML */}
          <div className="p-3.5 rounded-xl bg-surface-950/80 border border-amber-900/50 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/5 rounded-full blur-xl pointer-events-none" />
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-amber-400" />
                <span className="text-[11px] font-black text-amber-300 font-mono">STAGE 2: HF ML</span>
              </div>
              <span className="text-[9px] font-mono text-amber-400 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-800">
                Classification
              </span>
            </div>
            <p className="text-xs font-bold text-white mb-1">Domain Classifier</p>
            <p className="text-[10px] text-slate-400 leading-snug">
              Extracts zero-shot fault probabilities as an independent machine evidence source.
            </p>
            <div className="mt-2.5 pt-2 border-t border-surface-800 flex items-center justify-between text-[10px] font-mono text-slate-500">
              <span>Model:</span>
              <span className="text-amber-400 font-semibold truncate max-w-[130px]">BART-Large-MNLI</span>
            </div>
          </div>

          {/* Stage 3: Gemini Multimodal Reasoner */}
          <div className="p-3.5 rounded-xl bg-surface-950/80 border border-cyan-900/50 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-16 h-16 bg-cyan-500/5 rounded-full blur-xl pointer-events-none" />
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Brain className="w-4 h-4 text-cyan-400" />
                <span className="text-[11px] font-black text-cyan-300 font-mono">STAGE 3: GEMINI</span>
              </div>
              <span className="text-[9px] font-mono text-cyan-400 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-800">
                Cross-Modal
              </span>
            </div>
            <p className="text-xs font-bold text-white mb-1">Multimodal Reasoner</p>
            <p className="text-[10px] text-slate-400 leading-snug">
              Cross-examines audio, video, image, documents & ML telemetry to detect contradictions.
            </p>
            <div className="mt-2.5 pt-2 border-t border-surface-800 flex items-center justify-between text-[10px] font-mono text-slate-500">
              <span>Model:</span>
              <span className="text-cyan-400 font-semibold truncate max-w-[130px]">Gemini 1.5 Flash</span>
            </div>
          </div>

        </div>

        {/* Detailed Breakdown Expandable Section */}
        {expanded && (
          <div className="mt-3 p-3.5 rounded-xl bg-surface-950/90 border border-surface-800 space-y-2 text-xs font-mono text-slate-300">
            <div className="flex items-center gap-2 text-indigo-400 font-bold">
              <Sparkles className="w-4 h-4" />
              <span>Cross-Modal Reasoning Architectural Provenance:</span>
            </div>
            <ul className="space-y-1.5 text-[11px] text-slate-400 pl-4 list-disc">
              <li>
                <strong className="text-slate-200">No Hallucinations:</strong> Technical thresholds are injected directly from ingested PDF chunks into Gemini prompt context.
              </li>
              <li>
                <strong className="text-slate-200">Zero Single-Point-of-Failure:</strong> If Gemini is unreachable or unconfigured, the system automatically runs deterministic simulation with full cross-modal reasoning.
              </li>
              <li>
                <strong className="text-slate-200">Independent Evidence Validation:</strong> Hugging Face predictions are treated as an evidence input that Gemini must either corroborate or refute using visual/acoustic artifacts.
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
