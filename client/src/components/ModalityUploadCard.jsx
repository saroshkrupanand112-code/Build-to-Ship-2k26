import React, { useRef, useState } from 'react';
import { 
  Camera, 
  Volume2, 
  Video, 
  FileText, 
  Upload, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  FileCode,
  Music,
  Eye
} from 'lucide-react';

export default function ModalityUploadCard({
  modality, // 'image' | 'audio' | 'video' | 'document'
  title,
  accept,
  file,
  onFileSelect,
  onRemove,
  status = 'READY', // 'READY' | 'PROCESSING' | 'ANALYZED' | 'FAILED'
  error = null
}) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const getIcon = () => {
    switch (modality) {
      case 'image': return Camera;
      case 'audio': return Volume2;
      case 'video': return Video;
      case 'document': return FileText;
      default: return Upload;
    }
  };

  const Icon = getIcon();

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getStatusBadge = () => {
    switch (status) {
      case 'ANALYZED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-700/60">
            <CheckCircle2 className="w-3 h-3" />
            ANALYZED
          </span>
        );
      case 'PROCESSING':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-700/60 animate-pulse">
            <Clock className="w-3 h-3 animate-spin" />
            PROCESSING
          </span>
        );
      case 'FAILED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-950 text-rose-400 border border-rose-700/60">
            <AlertCircle className="w-3 h-3" />
            FAILED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-surface-800 text-slate-400 border border-surface-700">
            READY
          </span>
        );
    }
  };

  return (
    <div className={`p-4 rounded-xl border transition-all glass-panel ${
      isDragging 
        ? 'border-brand-400 bg-brand-950/20 ring-2 ring-brand-400/30' 
        : file 
          ? 'border-surface-700 bg-surface-900/90' 
          : 'border-surface-750/70 bg-surface-900/40 hover:border-surface-700'
    }`}>
      
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-surface-800 border border-surface-700 text-brand-400">
            <Icon className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wide font-mono">
              {title}
            </h4>
          </div>
        </div>
        <div>
          {getStatusBadge()}
        </div>
      </div>

      {/* Upload Box or Preview */}
      {!file ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-surface-750 hover:border-brand-400/60 rounded-lg p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-all bg-surface-950/30 hover:bg-surface-850/50 group"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept={accept}
            className="hidden"
          />
          <Upload className="w-6 h-6 text-slate-500 group-hover:text-brand-400 group-hover:-translate-y-0.5 transition-all mb-2" />
          <p className="text-xs font-medium text-slate-300 group-hover:text-white">
            Click to upload or drag &amp; drop
          </p>
          <p className="text-[11px] text-slate-500 mt-1 font-mono">
            {accept ? accept.split(',').join(' ') : 'Any supported file'} (Max 50MB)
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          
          {/* File specific media previews */}
          {modality === 'image' && file.preview && (
            <div className="relative rounded-lg overflow-hidden border border-surface-700 bg-black/40 h-36 flex items-center justify-center group">
              <img 
                src={file.preview} 
                alt="Evidence Preview" 
                className="w-full h-full object-contain" 
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <a 
                  href={file.preview} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="px-2.5 py-1 rounded bg-surface-900/90 text-xs text-white border border-surface-700 flex items-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" /> View Full
                </a>
              </div>
            </div>
          )}

          {modality === 'audio' && (
            <div className="p-2.5 rounded-lg bg-surface-850 border border-surface-700 space-y-2">
              <div className="flex items-center gap-2 text-xs text-brand-300 font-mono">
                <Music className="w-3.5 h-3.5 text-cyan-400" />
                <span>Audio Evidence Waveform Ready</span>
              </div>
              {file.preview && (
                <audio controls className="w-full h-8" src={file.preview}>
                  Your browser does not support audio playback.
                </audio>
              )}
            </div>
          )}

          {modality === 'video' && file.preview && (
            <div className="relative rounded-lg overflow-hidden border border-surface-700 bg-black h-36 flex items-center justify-center">
              <video 
                controls 
                className="w-full h-full object-contain"
                src={file.preview}
              />
            </div>
          )}

          {modality === 'document' && (
            <div className="p-3 rounded-lg bg-surface-850 border border-surface-700 flex items-center gap-3">
              <FileCode className="w-8 h-8 text-brand-400 flex-shrink-0" />
              <div className="overflow-hidden flex-1">
                <p className="text-xs font-semibold text-slate-200 truncate">
                  {file.name}
                </p>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                  Reference Documentation / OEM Specs
                </p>
              </div>
            </div>
          )}

          {/* File details bar & remove button */}
          <div className="flex items-center justify-between p-2 rounded-lg bg-surface-950/60 border border-surface-800 text-xs">
            <div className="flex items-center gap-2 overflow-hidden pr-2">
              <span className="font-medium text-slate-300 truncate text-[11px] font-mono">
                {file.name}
              </span>
              <span className="text-[10px] text-slate-500 font-mono flex-shrink-0">
                ({formatFileSize(file.size)})
              </span>
            </div>
            <button
              onClick={onRemove}
              className="p-1 rounded hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 transition-colors flex-shrink-0"
              title="Remove file"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

        </div>
      )}

      {error && (
        <p className="text-[11px] text-rose-400 mt-2 font-mono flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          {error}
        </p>
      )}

    </div>
  );
}
