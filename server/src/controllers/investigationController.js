import { runMultimodalInvestigation } from '../services/geminiService.js';
import { retrieveRelevantChunks, buildRagContext } from '../services/ragService.js';
import { classifyFaultEvidence, formatMLEvidenceEntry } from '../services/mlService.js';
import { DEMO_SCENARIOS } from '../services/demoService.js';
import { InvestigationRepo } from '../models/Investigation.js';
import { getFirestoreStatus } from '../config/firestore.js';
import { getAIStatus, setGeminiApiKey } from '../config/gemini.js';

/**
 * POST /api/investigations/analyze
 * Full pipeline: RAG retrieval → ML classification → Gemini reasoning → result
 */
export const analyzeIncident = async (req, res, next) => {
  try {
    const { problemDescription, presetKey, documentIds } = req.body;

    if (!problemDescription && !presetKey) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a problem description or select a demo preset.'
      });
    }

    // Collect uploaded files
    const uploadedFiles = [];
    if (req.files) {
      Object.keys(req.files).forEach(fieldName => {
        const fileList = req.files[fieldName];
        if (Array.isArray(fileList)) fileList.forEach(f => uploadedFiles.push(f));
      });
    }

    console.log(`[Controller] Analyzing — Modalities: ${uploadedFiles.length}, Preset: ${presetKey || 'none'}`);

    // ─── STEP 1: RAG Retrieval ────────────────────────────────────────────
    let ragContext = null;
    if (problemDescription && problemDescription.trim().length > 5) {
      try {
        const docIdFilter = documentIds ? JSON.parse(documentIds) : null;
        const chunks = await retrieveRelevantChunks(problemDescription, 5, docIdFilter);
        ragContext = buildRagContext(chunks);
        if (ragContext.sources.length > 0) {
          console.log(`[Controller] RAG retrieved ${ragContext.sources.length} relevant chunks`);
        } else {
          console.log(`[Controller] RAG: no indexed documents found — proceeding without retrieval`);
          ragContext = null;
        }
      } catch (ragErr) {
        console.warn('[Controller] RAG retrieval failed (non-fatal):', ragErr.message);
        ragContext = null;
      }
    }

    // ─── STEP 2: Specialized ML Classification ───────────────────────────
    let mlResult = null;
    if (problemDescription && problemDescription.trim().length > 5) {
      try {
        const ragText = ragContext?.contextText || '';
        mlResult = await classifyFaultEvidence(problemDescription, ragText);
        mlResult._evidenceEntry = formatMLEvidenceEntry(mlResult, problemDescription);
        console.log(`[Controller] ML classification: ${mlResult.faultCategory} (${Math.round(mlResult.confidence * 100)}%)`);
      } catch (mlErr) {
        console.warn('[Controller] ML classification failed (non-fatal):', mlErr.message);
        mlResult = null;
      }
    }

    // ─── STEP 3: Gemini Multimodal Reasoning ─────────────────────────────
    const aiResult = await runMultimodalInvestigation({
      problemDescription: problemDescription || 'Operational problem investigation',
      files: uploadedFiles,
      presetKey: presetKey || null,
      ragContext,
      mlResult
    });

    // Map file metadata
    const evidenceMetadata = uploadedFiles.map(file => ({
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      path: file.path,
      fieldname: file.fieldname
    }));

    return res.status(200).json({
      success: true,
      data: aiResult,
      metadata: {
        evidenceCount: evidenceMetadata.length,
        evidenceMetadata,
        presetKey: presetKey || null,
        ragChunksUsed: ragContext?.sources?.length || 0,
        mlClassification: mlResult ? mlResult.faultCategory : null,
        analyzedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('[Controller] analyzeIncident error:', error);
    next(error);
  }
};

/**
 * POST /api/investigations
 */
export const createInvestigation = async (req, res, next) => {
  try {
    const { title, description, aiResult, evidenceMetadata, scenario } = req.body;

    if (!title || !description || !aiResult) {
      return res.status(400).json({
        success: false,
        error: 'Title, description, and AI result are required.'
      });
    }

    const saved = await InvestigationRepo.create({
      title,
      description,
      scenario: scenario || 'custom',
      evidenceMetadata: evidenceMetadata || [],
      aiResult,
      confidenceScore: aiResult.confidence?.score || 0,
      confidenceLabel: aiResult.confidence?.label || 'Medium',
      contradictionsCount: (aiResult.contradictions || []).length,
      userId: req.userId || null
    });

    return res.status(201).json({ success: true, data: saved });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/investigations
 */
export const getAllInvestigations = async (req, res, next) => {
  try {
    const list = await InvestigationRepo.findAll();
    return res.status(200).json({ success: true, count: list.length, data: list });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/investigations/:id
 */
export const getInvestigationById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const item = await InvestigationRepo.findById(id);
    if (!item) {
      return res.status(404).json({ success: false, error: `Investigation "${id}" not found.` });
    }
    return res.status(200).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/investigations/:id
 */
export const deleteInvestigation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await InvestigationRepo.deleteById(id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: `Investigation "${id}" not found.` });
    }
    return res.status(200).json({ success: true, message: 'Deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/demos/:key
 */
export const getDemoPreset = (req, res) => {
  const { key } = req.params;
  const demo = DEMO_SCENARIOS[key];
  if (!demo) {
    return res.status(404).json({
      success: false,
      error: `Demo preset "${key}" not found. Available: vibration, overheating`
    });
  }
  return res.status(200).json({ success: true, data: demo });
};

/**
 * POST /api/config/key
 */
export const updateApiKey = (req, res) => {
  const { apiKey } = req.body;
  const valid = setGeminiApiKey(apiKey);
  return res.status(200).json({ success: true, configured: valid, aiStatus: getAIStatus() });
};

/**
 * GET /api/health
 */
export const getHealth = (req, res) => {
  const dbStatus = getFirestoreStatus();
  const aiStatus = getAIStatus();

  return res.status(200).json({
    status: 'healthy',
    name: 'FieldSense AI API',
    version: '2.0.0',
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
    database: {
      connected: dbStatus.connected,
      storageType: dbStatus.fallbackMode ? 'In-Memory Storage' : 'Cloud Firestore',
      driver: dbStatus.driver
    },
    ai: aiStatus,
    features: {
      rag: 'active',
      mlClassification: 'active',
      authentication: 'active',
      multimodalReasoning: aiStatus.configured ? 'live-gemini' : 'simulation'
    },
    savedInvestigations: InvestigationRepo.count()
  });
};
