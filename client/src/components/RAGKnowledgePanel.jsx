import React, { useState } from 'react';
import { BookOpen, ChevronDown, ChevronUp, FileText, Hash, Star, ExternalLink } from 'lucide-react';

const relevanceColor = (score) => {
  if (score >= 80) return 'text-emerald-400 bg-emerald-950/40 border-emerald-800/50';
  if (score >= 60) return 'text-amber-400 bg-amber-950/40 border-amber-800/50';
  return 'text-slate-400 bg-slate-900/40 border-slate-700/50';
};

const relevanceLabel = (score) => {
  if (score >= 80) return 'High';
  if (score >= 60) return 'Medium';
  return 'Low';
};

function SourceCard({ source, index }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-xl border border-surface-750 bg-surface-900/60 overflow-hidden transition-all">
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full p-3.5 text-left flex items-start gap-3 hover:bg-surface-800/40 transition-colors"
      >
        {/* Rank badge */}
        <div className="w-6 h-6 rounded-md bg-brand-500/20 border border-brand-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
          <span className="text-[10px] font-black text-brand-400">{index + 1}</span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className="text-xs font-bold text-white truncate">{source.documentName}</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${relevanceColor(source.relevanceScore)}`}>
              {relevanceLabel(source.relevanceScore)} relevance
            </span>
          </div>

          <div className="flex items-center gap-3 mt-1 text-[10px] text-slate-500 font-mono">
            <span className="flex items-center gap-1">
              <Hash className="w-3 h-3" />
              Page {source.pageNumber}
            </span>
            {source.section && (
              <span className="flex items-center gap-1 truncate">
                <FileText className="w-3 h-3" />
                {source.section}
              </span>
            )}
            <span className="ml-auto text-slate-600">{source.relevanceScore}% match</span>
          </div>
        </div>

        <div className="flex-shrink-0 text-slate-600">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-surface-800">
          <div className="mt-3 p-3 rounded-lg bg-surface-950/60 border border-surface-800">
            <p className="text-[11px] text-slate-300 leading-relaxed font-mono whitespace-pre-wrap">
              {source.text}
            </p>
          </div>
          <div className="mt-2 flex items-center gap-1 text-[10px] text-slate-600 font-mono">
            <ExternalLink className="w-3 h-3" />
            <span>Source: {source.documentName} — Page {source.pageNumber}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function RAGKnowledgePanel({ ragSources = [], ragStatus = null }) {
  const [collapsed, setCollapsed] = useState(false);

  const hasData = ragSources && ragSources.length > 0;

  if (!hasData && !ragStatus) return null;

  return (
    <div className="rounded-2xl border border-emerald-800/40 bg-surface-900/80 shadow-lg overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setCollapsed(c => !c)}
        className="w-full p-4 flex items-center justify-between hover:bg-surface-800/30 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-left">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-white font-mono uppercase tracking-wider">
                RETRIEVED KNOWLEDGE
              </span>
              <span className="text-[10px] bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 px-1.5 py-0.5 rounded font-mono">
                RAG
              </span>
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">
              {hasData
                ? `${ragSources.length} section${ragSources.length > 1 ? 's' : ''} retrieved from indexed documents`
                : 'No documents indexed — upload manuals to enable retrieval'}
            </p>
          </div>
        </div>
        {collapsed ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronUp className="w-4 h-4 text-slate-500" />}
      </button>

      {!collapsed && (
        <div className="px-4 pb-4 space-y-2.5 border-t border-surface-800/50">
          {!hasData && (
            <div className="mt-3 p-4 rounded-xl bg-surface-950/50 border border-surface-800 text-center">
              <BookOpen className="w-6 h-6 text-slate-600 mx-auto mb-2" />
              <p className="text-xs text-slate-500">
                Upload technical manuals or PDFs to enable knowledge retrieval.
              </p>
              <p className="text-[10px] text-slate-600 mt-1">
                Retrieved knowledge will appear here with source citations.
              </p>
            </div>
          )}

          {hasData && ragSources.map((source, i) => (
            <SourceCard key={source.chunkId || i} source={source} index={i} />
          ))}

          {hasData && (
            <div className="mt-1 pt-2 border-t border-surface-800/50 flex items-center gap-1.5 text-[10px] text-slate-600 font-mono">
              <Star className="w-3 h-3 text-emerald-600" />
              <span>Sources cited from uploaded documents — not AI-generated knowledge</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
