import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { getFirestore, getFirestoreStatus } from '../config/firestore.js';

const COLLECTION = 'users';

// =================== In-Memory User Store (fallback) ===================
const inMemoryUsers = new Map();

export const UserRepo = {
  async create(data) {
    const status = getFirestoreStatus();
    const db = getFirestore();

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(data.password, salt);

    if (status.connected && db) {
      try {
        // Check email uniqueness
        const existing = await db.collection(COLLECTION)
          .where('email', '==', data.email.toLowerCase())
          .limit(1)
          .get();

        if (!existing.empty) {
          const err = new Error('Email already registered');
          err.code = 11000;
          throw err;
        }

        const id = uuidv4();
        const now = new Date().toISOString();
        const record = {
          name: data.name,
          email: data.email.toLowerCase(),
          password: hashed,
          role: data.role || 'technician',
          organization: data.organization || 'FieldSense',
          createdAt: now,
          updatedAt: now
        };

        await db.collection(COLLECTION).doc(id).set(record);

        return {
          _id: id,
          id: id,
          ...record,
          comparePassword: async (candidate) => bcrypt.compare(candidate, hashed)
        };
      } catch (err) {
        if (err.code === 11000) throw err;
        console.warn('[UserRepo] Firestore write error, falling back:', err.message);
      }
    }

    // In-memory fallback
    for (const u of inMemoryUsers.values()) {
      if (u.email === data.email.toLowerCase()) {
        const err = new Error('Email already registered');
        err.code = 11000;
        throw err;
      }
    }
    const id = uuidv4();
    const now = new Date();
    const record = {
      _id: id, id,
      name: data.name,
      email: data.email.toLowerCase(),
      password: hashed,
      role: data.role || 'technician',
      organization: data.organization || 'FieldSense',
      createdAt: now, updatedAt: now,
      comparePassword: async (candidate) => bcrypt.compare(candidate, hashed)
    };
    inMemoryUsers.set(id, record);
    return record;
  },

  async findByEmail(email) {
    const status = getFirestoreStatus();
    const db = getFirestore();

    if (status.connected && db) {
      try {
        const snapshot = await db.collection(COLLECTION)
          .where('email', '==', email.toLowerCase())
          .limit(1)
          .get();

        if (!snapshot.empty) {
          const doc = snapshot.docs[0];
          const data = doc.data();
          return {
            _id: doc.id,
            id: doc.id,
            ...data,
            comparePassword: async (candidate) => bcrypt.compare(candidate, data.password)
          };
        }
        return null;
      } catch (err) {
        console.warn('[UserRepo] Firestore findByEmail error:', err.message);
      }
    }

    // In-memory fallback
    for (const u of inMemoryUsers.values()) {
      if (u.email === email.toLowerCase()) return u;
    }
    return null;
  },

  async findById(id) {
    const status = getFirestoreStatus();
    const db = getFirestore();

    if (status.connected && db) {
      try {
        const doc = await db.collection(COLLECTION).doc(id).get();
        if (doc.exists) {
          const data = doc.data();
          // Exclude password from the returned object
          const { password, ...safe } = data;
          return { _id: doc.id, id: doc.id, ...safe };
        }
        return null;
      } catch (err) {
        console.warn('[UserRepo] Firestore findById error:', err.message);
      }
    }

    // In-memory fallback
    const u = inMemoryUsers.get(id);
    if (u) {
      const { password, comparePassword, ...safe } = u;
      return safe;
    }
    return null;
  }
};

export default UserRepo;
