import { v4 as uuidv4 } from 'uuid';
import { getFirestore, getFirestoreStatus } from '../config/firestore.js';

const DOCS_COLLECTION = 'documents';
const CHUNKS_COLLECTION = 'documentChunks';

// =================== In-Memory stores (fallback) ===================
const inMemoryDocs = new Map();
const inMemoryChunks = new Map(); // docId -> chunks[]

export const DocumentRepo = {
  async createDocument(data) {
    const status = getFirestoreStatus();
    const db = getFirestore();

    if (status.connected && db) {
      try {
        const id = data.documentId || uuidv4();
        const now = new Date().toISOString();
        const record = {
          ...data,
          documentId: id,
          createdAt: now,
          updatedAt: now
        };
        await db.collection(DOCS_COLLECTION).doc(id).set(record);
        return { _id: id, ...record };
      } catch (err) {
        console.warn('[DocRepo] Firestore error:', err.message);
      }
    }

    // In-memory fallback
    const id = data.documentId || uuidv4();
    const record = { ...data, documentId: id, _id: id, createdAt: new Date(), updatedAt: new Date() };
    inMemoryDocs.set(id, record);
    return record;
  },

  async updateDocumentStatus(documentId, status, extra = {}) {
    const dbStatus = getFirestoreStatus();
    const db = getFirestore();

    if (dbStatus.connected && db) {
      try {
        const docRef = db.collection(DOCS_COLLECTION).doc(documentId);
        const existing = await docRef.get();
        if (existing.exists) {
          const updateData = { status, ...extra, updatedAt: new Date().toISOString() };
          await docRef.update(updateData);
          return { ...existing.data(), ...updateData };
        }
      } catch (err) {
        console.warn('[DocRepo] Firestore update error:', err.message);
      }
    }

    // In-memory fallback
    const existing = inMemoryDocs.get(documentId);
    if (existing) {
      const updated = { ...existing, status, ...extra, updatedAt: new Date() };
      inMemoryDocs.set(documentId, updated);
      return updated;
    }
  },

  async findAllDocuments() {
    const status = getFirestoreStatus();
    const db = getFirestore();

    if (status.connected && db) {
      try {
        const snapshot = await db.collection(DOCS_COLLECTION)
          .orderBy('createdAt', 'desc')
          .get();
        return snapshot.docs.map(doc => ({ _id: doc.id, ...doc.data() }));
      } catch (err) {
        console.warn('[DocRepo] Firestore findAll error:', err.message);
      }
    }

    return Array.from(inMemoryDocs.values()).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  async storeChunks(documentId, chunks) {
    const status = getFirestoreStatus();
    const db = getFirestore();

    if (status.connected && db) {
      try {
        // Delete existing chunks for this document
        const existing = await db.collection(CHUNKS_COLLECTION)
          .where('documentId', '==', documentId)
          .get();

        const batch = db.batch();
        existing.docs.forEach(doc => batch.delete(doc.ref));

        // Add new chunks
        for (const c of chunks) {
          const chunkId = c.chunkId || uuidv4();
          const chunkRef = db.collection(CHUNKS_COLLECTION).doc(chunkId);
          batch.set(chunkRef, {
            ...c,
            documentId,
            chunkId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
        }

        await batch.commit();
        return;
      } catch (err) {
        console.warn('[DocRepo] Firestore chunk store error:', err.message);
      }
    }

    // In-memory fallback
    inMemoryChunks.set(documentId, chunks.map(c => ({ ...c, documentId })));
  },

  async getAllChunksByDocId(documentId) {
    const status = getFirestoreStatus();
    const db = getFirestore();

    if (status.connected && db) {
      try {
        const snapshot = await db.collection(CHUNKS_COLLECTION)
          .where('documentId', '==', documentId)
          .get();
        return snapshot.docs.map(doc => ({ _id: doc.id, ...doc.data() }));
      } catch (err) {
        console.warn('[DocRepo] Firestore chunk read error:', err.message);
      }
    }

    return inMemoryChunks.get(documentId) || [];
  },

  async getAllChunks() {
    const status = getFirestoreStatus();
    const db = getFirestore();

    if (status.connected && db) {
      try {
        const snapshot = await db.collection(CHUNKS_COLLECTION).get();
        return snapshot.docs.map(doc => ({ _id: doc.id, ...doc.data() }));
      } catch (err) {
        console.warn('[DocRepo] Firestore all chunks error:', err.message);
      }
    }

    const all = [];
    for (const chunks of inMemoryChunks.values()) all.push(...chunks);
    return all;
  }
};

export default DocumentRepo;
export { DocumentRepo as DocModel, DocumentRepo as ChunkModel };
