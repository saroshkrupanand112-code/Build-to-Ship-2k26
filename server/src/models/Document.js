import mongoosePkg from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { getDBStatus } from '../config/db.js';

const { Schema, model } = mongoosePkg;

// A DocumentChunk is a segment of an ingested document with embeddings
const DocumentChunkSchema = new Schema({
  documentId: { type: String, required: true, index: true },
  documentName: { type: String, required: true },
  chunkId: { type: String, default: () => uuidv4() },
  chunkIndex: { type: Number, required: true },
  text: { type: String, required: true },
  pageNumber: { type: Number, default: 1 },
  section: { type: String, default: '' },
  sourceType: { type: String, default: 'pdf' },
  uploadedAt: { type: Date, default: Date.now },
  // Simple float array embedding (we store as numbers)
  embedding: [{ type: Number }]
}, { timestamps: true });

// The parent Document record
const DocumentRecordSchema = new Schema({
  documentId: { type: String, default: () => uuidv4(), unique: true },
  originalName: { type: String, required: true },
  mimeType: { type: String },
  sizeBytes: { type: Number },
  status: {
    type: String,
    enum: ['UPLOADED', 'PROCESSING', 'INDEXING', 'READY', 'FAILED'],
    default: 'UPLOADED'
  },
  chunkCount: { type: Number, default: 0 },
  pageCount: { type: Number, default: 0 },
  uploadedBy: { type: String },
  filePath: { type: String }
}, { timestamps: true });

let ChunkModel, DocModel;
try {
  ChunkModel = model('DocumentChunk', DocumentChunkSchema);
  DocModel = model('DocumentRecord', DocumentRecordSchema);
} catch (e) {
  try {
    ChunkModel = mongoosePkg.model('DocumentChunk');
    DocModel = mongoosePkg.model('DocumentRecord');
  } catch (e2) {}
}

// =================== In-Memory stores ===================
const inMemoryDocs = new Map();
const inMemoryChunks = new Map(); // docId -> chunks[]

export const DocumentRepo = {
  async createDocument(data) {
    const status = getDBStatus();
    if (status.connected && DocModel) {
      try {
        const doc = new DocModel(data);
        return (await doc.save()).toObject();
      } catch (err) { console.warn('[DocRepo] DB error:', err.message); }
    }
    const id = data.documentId || uuidv4();
    const record = { ...data, documentId: id, _id: id, createdAt: new Date(), updatedAt: new Date() };
    inMemoryDocs.set(id, record);
    return record;
  },

  async updateDocumentStatus(documentId, status, extra = {}) {
    const dbStatus = getDBStatus();
    if (dbStatus.connected && DocModel) {
      try {
        return await DocModel.findOneAndUpdate({ documentId }, { status, ...extra }, { new: true }).lean();
      } catch (err) {}
    }
    const existing = inMemoryDocs.get(documentId);
    if (existing) {
      const updated = { ...existing, status, ...extra, updatedAt: new Date() };
      inMemoryDocs.set(documentId, updated);
      return updated;
    }
  },

  async findAllDocuments() {
    const status = getDBStatus();
    if (status.connected && DocModel) {
      try { return await DocModel.find().sort({ createdAt: -1 }).lean(); } catch (err) {}
    }
    return Array.from(inMemoryDocs.values()).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  async storeChunks(documentId, chunks) {
    const status = getDBStatus();
    if (status.connected && ChunkModel) {
      try {
        await ChunkModel.deleteMany({ documentId });
        const docs = chunks.map(c => new ChunkModel({ ...c, documentId }));
        await ChunkModel.insertMany(docs);
        return;
      } catch (err) { console.warn('[DocRepo] Chunk insert error:', err.message); }
    }
    inMemoryChunks.set(documentId, chunks.map(c => ({ ...c, documentId })));
  },

  async getAllChunksByDocId(documentId) {
    const status = getDBStatus();
    if (status.connected && ChunkModel) {
      try { return await ChunkModel.find({ documentId }).lean(); } catch (err) {}
    }
    return inMemoryChunks.get(documentId) || [];
  },

  async getAllChunks() {
    const status = getDBStatus();
    if (status.connected && ChunkModel) {
      try { return await ChunkModel.find().lean(); } catch (err) {}
    }
    const all = [];
    for (const chunks of inMemoryChunks.values()) all.push(...chunks);
    return all;
  }
};

export { ChunkModel, DocModel };
