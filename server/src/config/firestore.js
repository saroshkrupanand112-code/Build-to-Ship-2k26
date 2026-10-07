import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore as getAdminFirestore, FieldValue } from 'firebase-admin/firestore';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let db = null;
let firestoreConnected = false;

/**
 * Initialize Firebase Admin SDK and Firestore.
 * Tries (in order):
 *   1. FIREBASE_SERVICE_ACCOUNT_KEY env var (JSON string)
 *   2. FIREBASE_SERVICE_ACCOUNT_PATH env var (path to .json file)
 *   3. Default path: server/serviceAccountKey.json
 */
export const initFirestore = async () => {
  try {
    let credential;

    // Option 1: JSON string in env var (for production / Render / Railway)
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
      credential = cert(serviceAccount);
      console.log('[Firestore] Using credentials from FIREBASE_SERVICE_ACCOUNT_KEY env var');
    }
    // Option 2: File path in env var
    else if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
      const absPath = path.resolve(process.env.FIREBASE_SERVICE_ACCOUNT_PATH);
      const serviceAccount = JSON.parse(fs.readFileSync(absPath, 'utf8'));
      credential = cert(serviceAccount);
      console.log(`[Firestore] Using credentials from file: ${absPath}`);
    }
    // Option 3: Default locations
    else {
      const candidatePaths = [
        path.resolve(__dirname, '../../serviceAccountKey.json'),
        path.resolve(process.cwd(), 'serviceAccountKey.json'),
        path.resolve(process.cwd(), 'server/serviceAccountKey.json')
      ];
      const foundPath = candidatePaths.find(p => fs.existsSync(p));
      if (foundPath) {
        const serviceAccount = JSON.parse(fs.readFileSync(foundPath, 'utf8'));
        credential = cert(serviceAccount);
        console.log(`[Firestore] Using credentials from path: ${foundPath}`);
      } else {
        throw new Error('No Firebase service account credentials found. Set FIREBASE_SERVICE_ACCOUNT_KEY, FIREBASE_SERVICE_ACCOUNT_PATH, or place serviceAccountKey.json in server/');
      }
    }

    // Initialize the app (only once)
    if (!getApps().length) {
      initializeApp({ credential });
    }

    db = getAdminFirestore();

    // Test connection with a simple write & read
    await db.collection('_health').doc('ping').set({
      lastPing: FieldValue.serverTimestamp()
    });

    firestoreConnected = true;
    console.log('[Firestore] Connected successfully to Cloud Firestore');
    return db;
  } catch (error) {
    firestoreConnected = false;
    console.error('[Firestore] Connection failed:', error.message);
    console.log('[Firestore] Falling back to in-memory storage');
    return null;
  }
};

/**
 * Get Firestore database instance.
 */
export const getFirestore = () => db;

/**
 * Get Firestore connection status (replaces getDBStatus for health checks).
 */
export const getFirestoreStatus = () => ({
  connected: firestoreConnected,
  fallbackMode: !firestoreConnected,
  driver: firestoreConnected ? 'cloud-firestore' : 'in-memory-storage'
});
