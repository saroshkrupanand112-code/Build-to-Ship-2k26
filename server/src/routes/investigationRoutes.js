import { Router } from 'express';
import { register, login, getMe } from '../controllers/authController.js';
import {
  analyzeIncident, createInvestigation, getAllInvestigations,
  getInvestigationById, deleteInvestigation, getDemoPreset,
  updateApiKey, getHealth
} from '../controllers/investigationController.js';
import { uploadDocument, listDocuments, getDocumentStatus, ragSearch } from '../controllers/documentController.js';
import { predictFault } from '../controllers/mlController.js';
import { investigationUpload, documentUpload } from '../middleware/uploadMiddleware.js';
import { requireAuth, optionalAuth } from '../middleware/authMiddleware.js';

const router = Router();

// ─── Health ──────────────────────────────────────────────────
router.get('/health', getHealth);

// ─── Auth ────────────────────────────────────────────────────
router.post('/auth/register', register);
router.post('/auth/login', login);
router.get('/auth/me', requireAuth, getMe);

// ─── Config ──────────────────────────────────────────────────
router.post('/config/key', optionalAuth, updateApiKey);

// ─── Demos ───────────────────────────────────────────────────
router.get('/demos/:key', getDemoPreset);

// ─── Investigations (optionalAuth so both guest + JWT work) ──
router.post('/investigations/analyze', optionalAuth, investigationUpload, analyzeIncident);
router.post('/investigations', optionalAuth, createInvestigation);
router.get('/investigations', optionalAuth, getAllInvestigations);
router.get('/investigations/:id', optionalAuth, getInvestigationById);
router.delete('/investigations/:id', optionalAuth, deleteInvestigation);

// ─── Documents / RAG ─────────────────────────────────────────
router.post('/documents/upload', optionalAuth, documentUpload, uploadDocument);
router.get('/documents', optionalAuth, listDocuments);
router.get('/documents/:documentId/status', optionalAuth, getDocumentStatus);
router.post('/rag/search', optionalAuth, ragSearch);

// ─── ML / HuggingFace ────────────────────────────────────────
router.post('/ml/predict', optionalAuth, predictFault);

export default router;
