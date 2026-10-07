import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { DocumentRepo } from '../models/Document.js';
import { ingestDocument, retrieveRelevantChunks, buildRagContext } from '../services/ragService.js';

/**
 * POST /api/documents/upload
 * Upload and immediately begin indexing a document for RAG.
 */
export const uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No document file uploaded.' });
    }

    const documentId = uuidv4();
    const { originalname, mimetype, size, path: filePath } = req.file;

    // Create document record immediately
    const docRecord = await DocumentRepo.createDocument({
      documentId,
      originalName: originalname,
      mimeType: mimetype,
      sizeBytes: size,
      status: 'UPLOADED',
      filePath,
      uploadedBy: req.userId || 'anonymous'
    });

    // Start async ingestion (do not await — return 202 immediately)
    ingestDocument(documentId, originalname, filePath, mimetype)
      .catch(err => console.error(`[DocController] Background ingestion failed for ${documentId}:`, err.message));

    return res.status(202).json({
      success: true,
      message: 'Document uploaded and indexing started.',
      documentId,
      document: docRecord
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/documents
 * List all indexed documents.
 */
export const listDocuments = async (req, res, next) => {
  try {
    const docs = await DocumentRepo.findAllDocuments();
    return res.status(200).json({ success: true, count: docs.length, data: docs });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/documents/:documentId/status
 * Check indexing status of a specific document.
 */
export const getDocumentStatus = async (req, res, next) => {
  try {
    const { documentId } = req.params;
    const docs = await DocumentRepo.findAllDocuments();
    const doc = docs.find(d => d.documentId === documentId);

    if (!doc) {
      return res.status(404).json({ success: false, error: 'Document not found.' });
    }

    return res.status(200).json({ success: true, data: doc });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/rag/search
 * Semantic search across all indexed document chunks.
 */
export const ragSearch = async (req, res, next) => {
  try {
    const { query, topK = 5, documentIds } = req.body;

    if (!query || query.trim().length < 3) {
      return res.status(400).json({ success: false, error: 'Query must be at least 3 characters.' });
    }

    const chunks = await retrieveRelevantChunks(query, topK, documentIds || null);
    const { contextText, sources } = buildRagContext(chunks);

    return res.status(200).json({
      success: true,
      query,
      resultCount: sources.length,
      sources,
      contextText
    });
  } catch (err) {
    next(err);
  }
};
