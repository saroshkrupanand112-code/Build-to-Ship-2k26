import { v4 as uuidv4 } from 'uuid';
import { getFirestore, getFirestoreStatus } from '../config/firestore.js';

const COLLECTION = 'investigations';

// In-memory fallback repository for zero-dependency local runs
const inMemoryStore = new Map();

export const InvestigationRepo = {
  async create(data) {
    const status = getFirestoreStatus();
    const db = getFirestore();

    if (status.connected && db) {
      try {
        const id = uuidv4();
        const now = new Date().toISOString();
        const record = {
          ...data,
          createdAt: now,
          updatedAt: now
        };
        await db.collection(COLLECTION).doc(id).set(record);
        return { _id: id, id: id, ...record };
      } catch (err) {
        console.warn('[InvestigationRepo] Firestore write error, falling back:', err.message);
      }
    }

    // In-memory fallback
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
    const status = getFirestoreStatus();
    const db = getFirestore();

    if (status.connected && db) {
      try {
        const snapshot = await db.collection(COLLECTION)
          .orderBy('createdAt', 'desc')
          .get();

        return snapshot.docs.map(doc => ({
          _id: doc.id,
          id: doc.id,
          ...doc.data()
        }));
      } catch (err) {
        console.warn('[InvestigationRepo] Firestore findAll error, falling back:', err.message);
      }
    }

    return Array.from(inMemoryStore.values()).sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  },

  async findById(id) {
    const status = getFirestoreStatus();
    const db = getFirestore();

    if (status.connected && db) {
      try {
        const doc = await db.collection(COLLECTION).doc(id).get();
        if (doc.exists) {
          return { _id: doc.id, id: doc.id, ...doc.data() };
        }
        // Not found in Firestore — fall through to memory
      } catch (err) {
        // Continue to check in-memory
      }
    }

    return inMemoryStore.get(id) || null;
  },

  async deleteById(id) {
    const status = getFirestoreStatus();
    const db = getFirestore();
    let firestoreDeleted = false;

    if (status.connected && db) {
      try {
        const doc = await db.collection(COLLECTION).doc(id).get();
        if (doc.exists) {
          await db.collection(COLLECTION).doc(id).delete();
          firestoreDeleted = true;
        }
      } catch (err) {
        // Continue to check in-memory
      }
    }

    const memoryExisted = inMemoryStore.has(id);
    inMemoryStore.delete(id);
    return firestoreDeleted || memoryExisted;
  },

  count() {
    return inMemoryStore.size;
  }
};

export default InvestigationRepo;
