/**
 * RAG Service - Retrieval Augmented Generation Pipeline
 *
 * Architecture:
 *   PDF → Text Extraction → Chunking → Embedding → Vector Store → Similarity Search → Context
 *
 * Local development fallback: TF-IDF cosine similarity (no cloud dependency).
 * Production: Swap in MongoDB Atlas Vector Search when available.
 */

import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { DocumentRepo } from '../models/Document.js';
import { getGeminiApiKey, hasValidApiKey } from '../config/gemini.js';

// ===================== PDF TEXT EXTRACTION =====================

/**
 * Extract text from PDF using pdf-parse.
 * Returns { text, pages, pageTexts }
 */
export const extractTextFromPDF = async (filePath) => {
  try {
    const pdfParse = (await import('pdf-parse')).default;
    const buffer = fs.readFileSync(filePath);
    const data = await pdfParse(buffer);
    return {
      text: data.text,
      pages: data.numpages,
      pageTexts: buildPageTexts(data.text, data.numpages)
    };
  } catch (err) {
    console.error('[RAG] PDF parse error:', err.message);
    // Fallback: read as plain text
    const raw = fs.readFileSync(filePath, 'utf8');
    return { text: raw, pages: 1, pageTexts: [raw] };
  }
};

/**
 * Split full text into approximate per-page segments.
 */
function buildPageTexts(fullText, numPages) {
  if (numPages <= 1) return [fullText];
  const approxPageSize = Math.ceil(fullText.length / numPages);
  const pages = [];
  for (let i = 0; i < numPages; i++) {
    pages.push(fullText.slice(i * approxPageSize, (i + 1) * approxPageSize));
  }
  return pages;
}

// ===================== CHUNKING =====================

/**
 * Split a page's text into overlapping chunks.
 * Each chunk is ~400 chars with 80-char overlap.
 */
export const chunkText = (text, pageNumber = 1, documentId, documentName) => {
  const CHUNK_SIZE = 400;
  const OVERLAP = 80;
  const chunks = [];

  const cleaned = text.replace(/\s+/g, ' ').trim();
  if (cleaned.length < 30) return [];

  let start = 0;
  let chunkIndex = 0;

  while (start < cleaned.length) {
    const end = Math.min(start + CHUNK_SIZE, cleaned.length);
    const chunkText = cleaned.slice(start, end).trim();

    if (chunkText.length > 20) {
      // Try to detect section heading (heuristic: short line ending in colon or all caps)
      const firstLine = chunkText.split('\n')[0]?.trim() || '';
      const section = firstLine.length < 60 && (firstLine.endsWith(':') || firstLine === firstLine.toUpperCase())
        ? firstLine
        : '';

      chunks.push({
        chunkId: `${documentId}-p${pageNumber}-c${chunkIndex}`,
        chunkIndex: chunkIndex++,
        documentId,
        documentName,
        pageNumber,
        section,
        text: chunkText,
        sourceType: 'pdf',
        uploadedAt: new Date()
      });
    }

    start += CHUNK_SIZE - OVERLAP;
  }

  return chunks;
};

// ===================== EMBEDDING =====================

/**
 * Generate a text embedding.
 * Priority: Gemini Embedding API → TF-IDF local fallback
 *
 * We return a float array representing the semantic vector.
 */
export const generateEmbedding = async (text) => {
  if (hasValidApiKey()) {
    try {
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(getGeminiApiKey());
      const model = genAI.getGenerativeModel({ model: 'text-embedding-004' });
      const result = await model.embedContent(text);
      return result.embedding.values;
    } catch (err) {
      console.warn('[RAG] Gemini embedding failed, using TF-IDF fallback:', err.message);
    }
  }

  // Local TF-IDF style embedding (keyword frequency vector over fixed vocab)
  return buildTFIDFVector(text);
};

// Fixed industrial vocabulary for TF-IDF embedding (200 dimensions)
const INDUSTRIAL_VOCAB = [
  'vibration','vibrate','oscillat','frequenc','harmonic','resonan','amplitude',
  'belt','pulley','sheave','misalign','alignment','offset','tension','slack',
  'bearing','shaft','gear','coupling','sprocket','chain','motor','drive',
  'temperature','heat','thermal','overheat','cooling','fan','radiator',
  'pressure','hydraulic','pneumatic','valve','pump','seal','leak',
  'current','voltage','power','electric','winding','insulation','short',
  'noise','sound','acoustic','rattle','squeal','grind','hum','buzz',
  'inspection','maintenance','service','repair','replace','calibrat',
  'normal','abnormal','fault','defect','damage','wear','fail','error',
  'manual','specification','standard','procedure','protocol','guideline',
  'measurement','sensor','meter','gauge','reading','value','limit',
  'safety','warning','caution','danger','loto','lockout','tagout',
  'torque','speed','rpm','load','force','stress','strain',
  'lubrication','grease','oil','fluid','contamination','debris',
  'inspection','visual','image','audio','video','document','evidence',
  'corroborate','support','contradict','conflict','agree','disagree',
  'high','low','medium','critical','urgent','immediate','schedule',
  'conveyor','pump','compressor','turbine','engine','machine','equipment',
  'operational','production','downtime','uptime','efficiency','performance',
  'diagnosis','root','cause','analysis','investigation','finding','conclusion'
];

function buildTFIDFVector(text) {
  const lowerText = text.toLowerCase();
  const words = lowerText.split(/\W+/);
  const wordCount = words.length || 1;
  const vector = new Array(INDUSTRIAL_VOCAB.length).fill(0);

  INDUSTRIAL_VOCAB.forEach((term, idx) => {
    const regex = new RegExp(term, 'gi');
    const matches = (lowerText.match(regex) || []).length;
    vector[idx] = matches / wordCount;
  });

  // Normalize
  const magnitude = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0)) || 1;
  return vector.map(v => v / magnitude);
}

// ===================== VECTOR SIMILARITY =====================

/**
 * Cosine similarity between two embedding vectors.
 */
const cosineSimilarity = (vecA, vecB) => {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  let dot = 0, magA = 0, magB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dot += vecA[i] * vecB[i];
    magA += vecA[i] * vecA[i];
    magB += vecB[i] * vecB[i];
  }
  const denom = Math.sqrt(magA) * Math.sqrt(magB);
  return denom === 0 ? 0 : dot / denom;
};

// ===================== MAIN RAG PIPELINE =====================

/**
 * Ingest a document: extract → chunk → embed → store
 */
export const ingestDocument = async (documentId, documentName, filePath, mimeType) => {
  console.log(`[RAG] Starting ingestion: ${documentName}`);

  await DocumentRepo.updateDocumentStatus(documentId, 'PROCESSING');

  try {
    let fullText = '';
    let pageTexts = [];
    let pageCount = 1;

    if (mimeType === 'application/pdf' || filePath.endsWith('.pdf')) {
      const extracted = await extractTextFromPDF(filePath);
      fullText = extracted.text;
      pageTexts = extracted.pageTexts;
      pageCount = extracted.pages;
    } else {
      // Plain text or other
      fullText = fs.readFileSync(filePath, 'utf8');
      pageTexts = [fullText];
    }

    await DocumentRepo.updateDocumentStatus(documentId, 'INDEXING', { pageCount });

    // Chunk each page
    const allChunks = [];
    pageTexts.forEach((pageText, idx) => {
      const pageChunks = chunkText(pageText, idx + 1, documentId, documentName);
      allChunks.push(...pageChunks);
    });

    if (allChunks.length === 0) {
      // Fallback: chunk entire text as one page
      const fallbackChunks = chunkText(fullText, 1, documentId, documentName);
      allChunks.push(...fallbackChunks);
    }

    console.log(`[RAG] Generated ${allChunks.length} chunks from ${pageCount} pages`);

    // Generate embeddings for each chunk (batch with small delay)
    const chunksWithEmbeddings = [];
    for (let i = 0; i < allChunks.length; i++) {
      const chunk = allChunks[i];
      try {
        const embedding = await generateEmbedding(chunk.text);
        chunksWithEmbeddings.push({ ...chunk, embedding });
      } catch (err) {
        chunksWithEmbeddings.push({ ...chunk, embedding: buildTFIDFVector(chunk.text) });
      }
      // Rate limit: small pause every 5 chunks if using API
      if (i % 5 === 4) await new Promise(r => setTimeout(r, 100));
    }

    // Store chunks
    await DocumentRepo.storeChunks(documentId, chunksWithEmbeddings);

    await DocumentRepo.updateDocumentStatus(documentId, 'READY', {
      chunkCount: chunksWithEmbeddings.length,
      pageCount
    });

    console.log(`[RAG] Document indexed successfully: ${documentName} → ${chunksWithEmbeddings.length} chunks`);
    return { success: true, chunkCount: chunksWithEmbeddings.length, pageCount };

  } catch (err) {
    console.error('[RAG] Ingestion failed:', err.message);
    await DocumentRepo.updateDocumentStatus(documentId, 'FAILED');
    throw err;
  }
};

/**
 * Retrieve top-K most relevant chunks for a query.
 */
export const retrieveRelevantChunks = async (query, topK = 5, documentIds = null) => {
  try {
    const queryEmbedding = await generateEmbedding(query);

    // Get all chunks (optionally filtered by document)
    let allChunks;
    if (documentIds && documentIds.length > 0) {
      allChunks = [];
      for (const docId of documentIds) {
        const chunks = await DocumentRepo.getAllChunksByDocId(docId);
        allChunks.push(...chunks);
      }
    } else {
      allChunks = await DocumentRepo.getAllChunks();
    }

    if (allChunks.length === 0) {
      return [];
    }

    // Score each chunk
    const scored = allChunks
      .filter(c => c.embedding && c.embedding.length > 0)
      .map(chunk => ({
        ...chunk,
        similarity: cosineSimilarity(queryEmbedding, chunk.embedding)
      }))
      .filter(c => c.similarity > 0.05)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK);

    console.log(`[RAG] Retrieved ${scored.length} relevant chunks for query: "${query.slice(0, 60)}..."`);
    return scored;
  } catch (err) {
    console.error('[RAG] Retrieval error:', err.message);
    return [];
  }
};

/**
 * Build formatted RAG context string from retrieved chunks.
 * Returns both a text context for the LLM and structured source refs for UI.
 */
export const buildRagContext = (chunks) => {
  if (!chunks || chunks.length === 0) {
    return {
      contextText: 'No relevant knowledge retrieved from indexed documents.',
      sources: []
    };
  }

  const sources = chunks.map((chunk, i) => ({
    rank: i + 1,
    documentName: chunk.documentName,
    documentId: chunk.documentId,
    pageNumber: chunk.pageNumber,
    section: chunk.section || 'General',
    text: chunk.text,
    relevanceScore: Math.round((chunk.similarity || 0) * 100),
    chunkId: chunk.chunkId
  }));

  const contextText = sources.map(s =>
    `--- SOURCE ${s.rank}: "${s.documentName}" | Page ${s.pageNumber}${s.section ? ` | Section: ${s.section}` : ''} ---\n${s.text}`
  ).join('\n\n');

  return { contextText, sources };
};
