import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
  timeout: 60000
});

// Attach JWT token to every request if available
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('fs_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-handle 401 — clear token and redirect
API.interceptors.response.use(
  res => res.data,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('fs_token');
      localStorage.removeItem('fs_user');
    }
    return Promise.reject(err);
  }
);

// ─── Auth ─────────────────────────────────────────────────────
export const registerApi = (data) => API.post('/auth/register', data);
export const loginApi = (data) => API.post('/auth/login', data);
export const getMeApi = () => API.get('/auth/me');

// ─── Investigations ───────────────────────────────────────────
export const analyzeIncidentApi = (formData) =>
  API.post('/investigations/analyze', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });

export const saveInvestigationApi = (data) => API.post('/investigations', data);
export const getAllInvestigationsApi = () => API.get('/investigations');
export const getInvestigationsApi = getAllInvestigationsApi;
export const getInvestigationByIdApi = (id) => API.get(`/investigations/${id}`);
export const deleteInvestigationApi = (id) => API.delete(`/investigations/${id}`);
export const getDemoPresetApi = (key) => API.get(`/demos/${key}`);

// ─── Documents / RAG ─────────────────────────────────────────
export const uploadDocumentApi = (formData) =>
  API.post('/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
export const listDocumentsApi = () => API.get('/documents');
export const getDocumentStatusApi = (docId) => API.get(`/documents/${docId}/status`);
export const ragSearchApi = (query, topK = 5) => API.post('/rag/search', { query, topK });

// ─── ML / HuggingFace ────────────────────────────────────────
export const mlPredictApi = (observationText, ragContext = '') =>
  API.post('/ml/predict', { observationText, ragContext });

// ─── Config ──────────────────────────────────────────────────
export const updateApiKeyApi = (apiKey) => API.post('/config/key', { apiKey });
export const getHealthApi = () => API.get('/health');
