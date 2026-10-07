import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists
const uploadsDir = path.resolve(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const docsDir = path.resolve(__dirname, '../../uploads/documents');
if (!fs.existsSync(docsDir)) fs.mkdirSync(docsDir, { recursive: true });

// ===================== INVESTIGATION UPLOAD (images/audio/video/docs) =====================
const investigationStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const safe = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    cb(null, `${Date.now()}-${safe}`);
  }
});

const investigationFileFilter = (req, file, cb) => {
  const allowed = [
    'image/jpeg', 'image/png', 'image/webp', 'image/gif',
    'audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/webm', 'audio/ogg',
    'video/mp4', 'video/webm', 'video/quicktime',
    'application/pdf', 'text/plain',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported file type: ${file.mimetype}`), false);
  }
};

export const investigationUpload = multer({
  storage: investigationStorage,
  fileFilter: investigationFileFilter,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB
}).fields([
  { name: 'image', maxCount: 3 },
  { name: 'audio', maxCount: 2 },
  { name: 'video', maxCount: 2 },
  { name: 'document', maxCount: 5 }
]);

// ===================== DOCUMENT-ONLY UPLOAD (for RAG indexing) =====================
const documentStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, docsDir),
  filename: (req, file, cb) => {
    const safe = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    cb(null, `${Date.now()}-${safe}`);
  }
});

const documentFileFilter = (req, file, cb) => {
  const allowed = ['application/pdf', 'text/plain',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Only PDF, TXT, and DOCX files are supported for document indexing.`), false);
  }
};

export const documentUpload = multer({
  storage: documentStorage,
  fileFilter: documentFileFilter,
  limits: { fileSize: 20 * 1024 * 1024 } // 20MB
}).single('document');
