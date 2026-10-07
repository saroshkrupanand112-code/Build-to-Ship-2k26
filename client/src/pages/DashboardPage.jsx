import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Sparkles, 
  PlayCircle, 
  RotateCcw, 
  Send, 
  FileText, 
  Bookmark, 
  AlertTriangle, 
  CheckCircle2, 
  Layers, 
  HelpCircle,
  FileSearch,
  ShieldCheck,
  Check
} from 'lucide-react';
import ModalityUploadCard from '../components/ModalityUploadCard';
import LoadingPipeline from '../components/LoadingPipeline';
import ConfidenceMeter from '../components/ConfidenceMeter';
import EvidenceMatrix from '../components/EvidenceMatrix';
import CrossModalFusion from '../components/CrossModalFusion';
import ContradictionPanel from '../components/ContradictionPanel';
import NextBestQuestion from '../components/NextBestQuestion';
import RecommendationCard from '../components/RecommendationCard';
import InvestigationReportModal from '../components/InvestigationReportModal';
import RAGKnowledgePanel from '../components/RAGKnowledgePanel';
import AIArchitecturePanel from '../components/AIArchitecturePanel';
import { analyzeIncidentApi, saveInvestigationApi, getDemoPresetApi } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function DashboardPage({ initialDemoKey = null }) {
  const { user } = useAuth();

  // Input states
  const [problemDescription, setProblemDescription] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [audioFile, setAudioFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [docFile, setDocFile] = useState(null);

  // Active scenario identifier
  const [activePresetKey, setActivePresetKey] = useState(null);

  // Execution states
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // Report Modal & Save states
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load demo if triggered from parent / nav
  useEffect(() => {
    if (initialDemoKey) {
      loadDemo(initialDemoKey);
    }
  }, [initialDemoKey]);

  // Load Demo Presets
  const loadDemo = async (presetKey) => {
    try {
      setErrorMessage(null);
      setIsSaved(false);
      const res = await getDemoPresetApi(presetKey);
      if (res && res.data) {
        const demo = res.data;
        setProblemDescription(demo.description);
        setActivePresetKey(presetKey);

        // Populate simulated media previews for realistic interactive experience
        if (presetKey === 'vibration') {
          setImageFile({
            name: 'drive_pulley_sheave.jpg',
            size: 348200,
            preview: '/demo-assets/drive_pulley_sheave.svg',
            status: 'READY'
          });
          setAudioFile({
            name: 'motor_housing_acoustics.mp3',
            size: 512000,
            preview: '/demo-assets/motor_vibration.wav',
            status: 'READY'
          });
          setVideoFile({
            name: 'belt_rotation_cycle.mp4',
            size: 1845000,
            preview: null,
            status: 'READY'
          });
          setDocFile({
            name: 'OEM_Conveyor_Manual_Sec4.pdf',
            size: 642000,
            preview: null,
            status: 'READY'
          });
        } else if (presetKey === 'overheating') {
          setImageFile({
            name: 'digital_gauge_readout.jpg',
            size: 289000,
            preview: '/demo-assets/digital_gauge_readout.svg',
            status: 'READY'
          });
          setDocFile({
            name: 'Hydraulic_Unit_Datasheet_Rev3.pdf',
            size: 512000,
            preview: null,
            status: 'READY'
          });
          setAudioFile(null);
          setVideoFile(null);
        }

        // Set result directly or allow user to click Analyze
        setAnalysisResult(demo.aiResult);
      }
    } catch (err) {
      console.error('Failed to load demo:', err);
      setErrorMessage('Failed to load demo preset from backend.');
    }
  };

  // Reset all workbench fields
  const handleReset = () => {
    setProblemDescription('');
    setImageFile(null);
    setAudioFile(null);
    setVideoFile(null);
    setDocFile(null);
    setActivePresetKey(null);
    setAnalysisResult(null);
    setErrorMessage(null);
    setIsSaved(false);
  };

  // Run Multimodal AI Analysis
  const handleAnalyze = async () => {
    if (!problemDescription.trim() && !activePresetKey) {
      setErrorMessage('Please describe the problem or load one of the demo scenarios.');
      return;
    }

    setErrorMessage(null);
    setIsAnalyzing(true);
    setIsSaved(false);

    try {
      const formData = new FormData();
      formData.append('problemDescription', problemDescription);
      if (activePresetKey) {
        formData.append('presetKey', activePresetKey);
      }

      // Append uploaded physical files if present
      if (imageFile?.raw) formData.append('image', imageFile.raw);
      if (audioFile?.raw) formData.append('audio', audioFile.raw);
      if (videoFile?.raw) formData.append('video', videoFile.raw);
      if (docFile?.raw) formData.append('document', docFile.raw);

      // Minimum animation time for multi-stage loading experience
      const [response] = await Promise.all([
        analyzeIncidentApi(formData),
        new Promise(resolve => setTimeout(resolve, 3200))
      ]);

      if (response.success && response.data) {
        setAnalysisResult(response.data);
      } else {
        setErrorMessage(response.error || 'Unable to complete multimodal investigation.');
      }
    } catch (err) {
      console.error('Analysis error:', err);
      // Fallback graceful recovery
      if (activePresetKey) {
        const demo = await getDemoPresetApi(activePresetKey);
        setAnalysisResult(demo.data.aiResult);
      } else {
        setErrorMessage(err.response?.data?.error || err.message || 'Analysis failed. Please check network/backend status.');
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Save investigation to database
  const handleSaveInvestigation = async () => {
    if (!analysisResult) return;

    setIsSaving(true);
    try {
      await saveInvestigationApi({
        title: analysisResult.primaryIssue?.title || problemDescription.slice(0, 50) || 'Field Investigation',
        description: problemDescription || 'Operational anomaly report',
        scenario: activePresetKey || 'custom',
        aiResult: analysisResult,
        evidenceMetadata: [
          ...(imageFile ? [{ modality: 'image', originalName: imageFile.name, size: imageFile.size }] : []),
          ...(audioFile ? [{ modality: 'audio', originalName: audioFile.name, size: audioFile.size }] : []),
          ...(videoFile ? [{ modality: 'video', originalName: videoFile.name, size: videoFile.size }] : []),
          ...(docFile ? [{ modality: 'document', originalName: docFile.name, size: docFile.size }] : [])
        ]
      });

      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 4000);
    } catch (err) {
      console.error('Save error:', err);
      setErrorMessage('Could not save investigation to history.');
    } finally {
      setIsSaving(false);
    }
  };

  // File selection handlers
  const handleImageSelect = (file) => {
    setImageFile({
      raw: file,
      name: file.name,
      size: file.size,
      preview: URL.createObjectURL(file),
      status: 'READY'
    });
  };

  const handleAudioSelect = (file) => {
    setAudioFile({
      raw: file,
      name: file.name,
      size: file.size,
      preview: URL.createObjectURL(file),
      status: 'READY'
    });
  };

  const handleVideoSelect = (file) => {
    setVideoFile({
      raw: file,
      name: file.name,
      size: file.size,
      preview: URL.createObjectURL(file),
      status: 'READY'
    });
  };

  const handleDocSelect = (file) => {
    setDocFile({
      raw: file,
      name: file.name,
      size: file.size,
      preview: null,
      status: 'READY'
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-800 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide flex items-center gap-2">
            <span>NEW INVESTIGATION</span>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-brand-500/20 text-brand-300 border border-brand-500/40">
              WORKBENCH
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-2 flex-wrap">
            {user?.name && (
              <span className="px-2 py-0.5 rounded bg-surface-800 border border-brand-500/30 text-brand-300 font-mono font-bold text-[11px]">
                Welcome, {user.name}!
              </span>
            )}
            <span>Combine multiple sources of evidence to investigate an incident. Modalities cross-check each other.</span>
          </p>
        </div>

        {/* Quick Demo Launchers */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => loadDemo('vibration')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all flex items-center gap-1.5 ${
              activePresetKey === 'vibration'
                ? 'bg-brand-500 text-white border-brand-400 shadow-md shadow-brand-500/20'
                : 'bg-surface-850 hover:bg-surface-800 text-slate-300 border-surface-700 hover:border-brand-500/40'
            }`}
          >
            <PlayCircle className="w-3.5 h-3.5 text-cyan-400" />
            <span>Load Demo: Belt Vibration</span>
          </button>

          <button
            onClick={() => loadDemo('overheating')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all flex items-center gap-1.5 ${
              activePresetKey === 'overheating'
                ? 'bg-amber-600 text-white border-amber-500 shadow-md shadow-amber-600/20'
                : 'bg-amber-950/20 hover:bg-amber-950/40 text-amber-300 border-amber-800/50 hover:border-amber-600/60'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>Load Demo: Thermal Conflict</span>
          </button>

          <button
            onClick={handleReset}
            className="p-1.5 rounded-lg bg-surface-850 hover:bg-surface-800 text-slate-400 hover:text-white border border-surface-700 transition-colors"
            title="Reset workbench"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Investigation Inputs Panel (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="p-5 rounded-2xl glass-panel border border-surface-750 bg-surface-900/80 shadow-xl space-y-5">
            
            <div className="flex items-center justify-between border-b border-surface-800 pb-3">
              <span className="text-xs font-bold font-mono uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <FileSearch className="w-4 h-4 text-brand-400" />
                INVESTIGATION INPUTS
              </span>
              <span className="text-[10px] font-mono text-slate-500">
                Independent Modality Feed
              </span>
            </div>

            {/* A. Problem Description Textarea */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-200 uppercase tracking-wide font-mono flex items-center justify-between">
                <span>Problem Description</span>
                <span className="text-[10px] font-normal text-slate-400">Shift Log / Field Report</span>
              </label>
              <textarea
                value={problemDescription}
                onChange={(e) => setProblemDescription(e.target.value)}
                placeholder="Describe what happened... e.g. The machine has started vibrating unusually since yesterday afternoon."
                rows={3}
                className="w-full p-3 rounded-xl bg-surface-950/70 border border-surface-700 focus:border-brand-400 focus:ring-1 focus:ring-brand-400/30 text-xs text-slate-100 placeholder-slate-500 resize-none transition-all font-sans leading-relaxed"
              />
            </div>

            {/* Multimodal Upload Cards (Image, Audio, Video, Document) */}
            <div className="space-y-3">
              {/* B. Image Upload */}
              <ModalityUploadCard
                modality="image"
                title="Image Evidence"
                accept=".png,.jpg,.jpeg,.webp"
                file={imageFile}
                onFileSelect={handleImageSelect}
                onRemove={() => setImageFile(null)}
                status={isAnalyzing ? 'PROCESSING' : analysisResult ? 'ANALYZED' : 'READY'}
              />

              {/* C. Audio Upload */}
              <ModalityUploadCard
                modality="audio"
                title="Audio Recording"
                accept=".mp3,.wav,.m4a,.webm"
                file={audioFile}
                onFileSelect={handleAudioSelect}
                onRemove={() => setAudioFile(null)}
                status={isAnalyzing ? 'PROCESSING' : analysisResult ? 'ANALYZED' : 'READY'}
              />

              {/* D. Video Upload */}
              <ModalityUploadCard
                modality="video"
                title="Video Telemetry"
                accept=".mp4,.webm,.mov"
                file={videoFile}
                onFileSelect={handleVideoSelect}
                onRemove={() => setVideoFile(null)}
                status={isAnalyzing ? 'PROCESSING' : analysisResult ? 'ANALYZED' : 'READY'}
              />

              {/* E. Document Upload */}
              <ModalityUploadCard
                modality="document"
                title="Technical Manual / OEM PDF"
                accept=".pdf,.txt,.docx"
                file={docFile}
                onFileSelect={handleDocSelect}
                onRemove={() => setDocFile(null)}
                status={isAnalyzing ? 'PROCESSING' : analysisResult ? 'ANALYZED' : 'READY'}
              />
            </div>

            {/* Error banner if any */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/70 text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Primary Action Button: Analyze Incident */}
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className={`w-full py-3.5 px-4 rounded-xl text-sm font-bold uppercase tracking-wider font-mono flex items-center justify-center gap-2.5 transition-all shadow-xl ${
                isAnalyzing
                  ? 'bg-surface-800 text-slate-500 cursor-not-allowed border border-surface-700'
                  : 'bg-gradient-to-r from-brand-500 via-cyan-400 to-brand-600 hover:from-brand-400 hover:to-brand-500 text-white shadow-brand-500/25 transform hover:-translate-y-0.5'
              }`}
            >
              {isAnalyzing ? (
                <>
                  <span className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                  <span>Synthesizing Multimodal Evidence...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-cyan-200" />
                  <span>Analyze Incident</span>
                </>
              )}
            </button>

          </div>
        </div>

        {/* RIGHT COLUMN: AI Investigation Results (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* State 1: Active Analysis Pipeline */}
          {isAnalyzing && (
            <LoadingPipeline isAnalyzing={isAnalyzing} />
          )}

          {/* State 2: No analysis yet (Empty / Instructional State) */}
          {!isAnalyzing && !analysisResult && (
            <div className="p-10 rounded-2xl glass-panel border border-surface-750 bg-surface-900/50 text-center space-y-5">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-brand-500/10 border border-brand-500/20 text-brand-400 flex items-center justify-center">
                <Layers className="w-8 h-8" />
              </div>

              <div className="space-y-2 max-w-md mx-auto">
                <h3 className="text-base font-bold text-white tracking-wide">
                  Awaiting Evidence Inputs
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Enter a problem description and attach images, audio clips, video records, or OEM manuals on the left.
                </p>
              </div>

              <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={() => loadDemo('vibration')}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-surface-800 hover:bg-surface-750 text-slate-200 border border-surface-700 hover:border-brand-500/40 flex items-center gap-2 transition-all"
                >
                  <PlayCircle className="w-4 h-4 text-cyan-400" />
                  <span>Load Demo 1 (Belt Vibration)</span>
                </button>
                <button
                  onClick={() => loadDemo('overheating')}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-950/30 hover:bg-amber-950/50 text-amber-300 border border-amber-800/40 hover:border-amber-600/40 flex items-center gap-2 transition-all"
                >
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span>Load Demo 2 (Thermal Conflict)</span>
                </button>
              </div>
            </div>
          )}

          {/* State 3: Analysis Results Generated */}
          {!isAnalyzing && analysisResult && (
            <div className="space-y-6 animate-fade-in">
              
              {/* Results Action Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-surface-900 border border-surface-750">
                <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Investigation Completed</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsReportOpen(true)}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-brand-500 hover:bg-brand-400 text-white shadow-md shadow-brand-500/20 flex items-center gap-1.5 transition-all"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Generate Report</span>
                  </button>

                  <button
                    onClick={handleSaveInvestigation}
                    disabled={isSaving || isSaved}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all flex items-center gap-1.5 ${
                      isSaved
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                        : 'bg-surface-800 hover:bg-surface-750 text-slate-200 border-surface-700 hover:border-brand-500/40'
                    }`}
                  >
                    {isSaved ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Bookmark className="w-3.5 h-3.5 text-slate-400" />}
                    <span>{isSaved ? 'Saved to History!' : 'Save Investigation'}</span>
                  </button>
                </div>
              </div>

              {/* Primary Issue & Executive Summary Banner */}
              <div className="p-6 rounded-2xl glass-panel border border-brand-500/30 bg-surface-900/90 shadow-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400 bg-cyan-950/60 px-2.5 py-0.5 rounded border border-cyan-800">
                    PRIMARY DIAGNOSTIC SYNTHESIS
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    {analysisResult.evidence?.length || 0} Evidence Sources Cross-Checked
                  </span>
                </div>

                <h2 className="text-lg sm:text-xl font-black text-white tracking-wide">
                  {analysisResult.primaryIssue?.title}
                </h2>
                <p className="text-xs text-slate-300 leading-relaxed font-medium">
                  {analysisResult.primaryIssue?.description}
                </p>

                <div className="pt-2 border-t border-surface-800 text-xs text-slate-400 leading-relaxed">
                  <strong className="text-slate-300 font-mono">Executive Summary: </strong>
                  {analysisResult.summary}
                </div>
              </div>

              {/* Hybrid AI Stack Architecture Panel */}
              <AIArchitecturePanel aiStack={analysisResult.aiStack} />

              {/* Confidence Meter Component */}
              <ConfidenceMeter 
                score={analysisResult.confidence?.score}
                label={analysisResult.confidence?.label}
                explanation={analysisResult.confidence?.explanation}
              />

              {/* Evidence Matrix Component */}
              <EvidenceMatrix evidence={analysisResult.evidence} />

              {/* Cross-Modal Reasoning / Evidence Fusion */}
              <CrossModalFusion 
                crossModalReasoning={analysisResult.crossModalReasoning}
                evidence={analysisResult.evidence}
              />

              {/* RAG Retrieved Knowledge Panel */}
              <RAGKnowledgePanel ragSources={analysisResult.ragSources} />

              {/* Contradiction Detection Component */}
              <ContradictionPanel contradictions={analysisResult.contradictions} />

              {/* Next Best Question Component */}
              <NextBestQuestion nextBestQuestion={analysisResult.nextBestQuestion} />

              {/* Recommendations & Safety Note */}
              <RecommendationCard 
                recommendations={analysisResult.recommendations}
                safetyNote={analysisResult.safetyNote}
              />

            </div>
          )}

        </div>

      </div>

      {/* Investigation Report Modal */}
      <InvestigationReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        reportData={analysisResult}
        investigationTitle={problemDescription}
      />

    </div>
  );
}
