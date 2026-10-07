import mongoosePkg from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { getDBStatus } from '../config/db.js';

const { Schema, model } = mongoosePkg;

const EvidenceMetadataSchema = new Schema({
  id: { type: String, default: () => uuidv4() },
  modality: { type: String, enum: ['text', 'image', 'audio', 'video', 'document'], required: true },
  originalName: { type: String },
  mimeType: { type: String },
  size: { type: Number },
  path: { type: String },
  previewUrl: { type: String }
}, { _id: false });

const InvestigationSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  scenario: { type: String, default: 'custom' },
  evidenceMetadata: [EvidenceMetadataSchema],
  aiResult: {
    summary: { type: String, required: true },
    primaryIssue: {
      title: { type: String, required: true },
      description: { type: String, required: true }
    },
    confidence: {
      score: { type: Number, required: true },
      label: { type: String, enum: ['Low', 'Medium', 'High'], required: true },
      explanation: { type: String, required: true }
    },
    evidence: [{
      id: { type: String },
      modality: { type: String },
      observation: { type: String },
      type: { type: String, enum: ['supporting', 'contradicting', 'neutral'] },
      impact: { type: String, enum: ['low', 'medium', 'high'] },
      reason: { type: String }
    }],
    crossModalReasoning: [{
      evidenceIds: [{ type: String }],
      reasoning: { type: String }
    }],
    contradictions: [{
      sources: [{ type: String }],
      description: { type: String },
      severity: { type: String, enum: ['low', 'medium', 'high'] }
    }],
    missingEvidence: [{
      description: { type: String },
      importance: { type: String, enum: ['low', 'medium', 'high'] }
    }],
    nextBestQuestion: {
      question: { type: String },
      reason: { type: String }
    },
    recommendations: [{
      action: { type: String },
      priority: { type: String, enum: ['low', 'medium', 'high'] },
      reason: { type: String }
    }],
    safetyNote: { type: String },
    report: { type: String }
  },
  confidenceScore: { type: Number },
  confidenceLabel: { type: String },
  contradictionsCount: { type: Number, default: 0 }
}, {
  timestamps: true
});

let MongooseModel;
try {
  MongooseModel = model('Investigation', InvestigationSchema);
} catch (e) {
  // If already compiled or mongoose not ready
}

// In-memory fallback repository for zero-dependency local runs
const inMemoryStore = new Map();

export const InvestigationRepo = {
  async create(data) {
    const status = getDBStatus();
    if (status.connected && MongooseModel) {
      try {
        const doc = new MongooseModel(data);
        return await doc.save();
      } catch (err) {
        console.warn('[Repo] Falling back to memory store on DB write error:', err.message);
      }
    }

    // In-memory store
    const id = uuidv4();
    const now = new Date();
    const record = {
      _id: id,
      id: id,
      ...data,
      createdAt: now,
      updatedAt: now
    };
    inMemoryStore.set(id, record);
    return record;
  },

  async findAll() {
    const status = getDBStatus();
    if (status.connected && MongooseModel) {
      try {
        return await MongooseModel.find().sort({ createdAt: -1 }).lean();
      } catch (err) {
        console.warn('[Repo] Falling back to memory store on DB find error:', err.message);
      }
    }

    return Array.from(inMemoryStore.values()).sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  },

  async findById(id) {
    const status = getDBStatus();
    if (status.connected && MongooseModel) {
      try {
        const item = await MongooseModel.findById(id).lean();
        if (item) return item;
      } catch (err) {
        // Continue to check in-memory
      }
    }

    return inMemoryStore.get(id) || null;
  },

  async deleteById(id) {
    const status = getDBStatus();
    if (status.connected && MongooseModel) {
      try {
        await MongooseModel.findByIdAndDelete(id);
      } catch (err) {
        // Continue to check in-memory
      }
    }

    const existed = inMemoryStore.has(id);
    inMemoryStore.delete(id);
    return existed;
  },

  count() {
    return inMemoryStore.size;
  }
};

export default MongooseModel;
