# FIELDSENSE AI
### Multimodal Evidence Intelligence Engine

> **"See it. Hear it. Understand it. Cross-check it."**

Turn fragmented field evidence into explainable, evidence-backed operational decisions.  
Different modalities don't just add information — they **challenge, corroborate, and validate** each other.

---

## 🎯 Problem Statement

Field technicians investigate problems using fragmented, siloed data:
- Text description tickets
- Quick smartphone photos
- Audio clips from equipment
- Video recordings
- PDF manuals and scanned documents

**Existing AI tools analyze each in isolation.** This makes it impossible to detect contradictions, correlate findings across sources, or identify the single most useful next observation.

## 💡 Core Innovation

> **"We don't just combine modalities. We make modalities cross-check one another."**

FieldSense AI treats every uploaded piece of media as **independent evidence**:

| Status | Meaning |
|--------|---------|
| ✓ SUPPORTS | Corroborates the working hypothesis |
| ⚠ CONTRADICTS | Conflicts with other evidence sources |
| ○ NEUTRAL | Provides timeline/context only |
| ? MISSING | Identifies critical gaps in evidence |

## ✨ Key Features

1. **Multimodal AI Investigation** — Image + Audio + Video + Document + Text → unified reasoning
2. **Cross-Modal Evidence Fusion** — Independent sources corroborate each other
3. **Contradiction Detection** — Flags when a technician report clashes with sensor data
4. **Confidence Estimation** — Score based on cross-source agreement, not hallucination
5. **Next Best Question** — Identifies the single most valuable next observation
6. **Explainable Recommendations** — Every action is backed by traceable evidence
7. **Investigation Reports** — Downloadable Markdown audit trails
8. **1-Click Demo Scenarios** — Two pre-built industrial cases for instant evaluation

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                   FIELDSENSE AI                      │
├──────────────────────┬──────────────────────────────┤
│   React + Vite       │   Express.js + Node.js       │
│   (Port 5173)        │   (Port 5000)                │
│                      │                              │
│  Landing Page        │  POST /api/investigations/   │
│  Investigation       │       analyze                │
│    Workbench         │  POST /api/investigations    │
│  Evidence Matrix     │  GET  /api/investigations    │
│  Contradiction UI    │  GET  /api/investigations/:id│
│  Confidence Meter    │  DELETE /api/investigations/ │
│  Next Best Question  │       :id                    │
│  Report Modal        │  GET  /api/health            │
│  History Page        │  GET  /api/demos/:key        │
│  Settings Page       │  POST /api/config/key        │
│                      │                              │
│  Tailwind CSS        │  Multer (file uploads)       │
│  Lucide Icons        │  Zod (schema validation)     │
│  Axios               │  Firebase Admin SDK          │
│  React Router        │  Google GenAI SDK            │
│                      │  In-Memory Store Fallback    │
└──────────────────────┴──────────────────────────────┘
                           │
                    ┌──────┴──────┐
                    │ Google      │
                    │ Gemini API  │
                    │ (Optional)  │
                    └─────────────┘
                           │
                    ┌──────┴──────┐
                    │ Firebase    │
                    │ Cloud       │
                    │ Firestore   │
                    └─────────────┘
```

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite 6, Tailwind CSS 3, React Router 6, Axios, Lucide React |
| Backend | Node.js 24, Express 4, Multer, Zod, Morgan |
| AI Engine | Google Gemini 1.5 Flash via `@google/genai` SDK |
| Database | Firebase Cloud Firestore (auto-fallback to in-memory store) |
| Dev Tools | Concurrently (root runner) |

## 📁 Folder Structure

```
fieldsense-ai/
├── client/
│   ├── public/demo-assets/         # SVG + WAV demo evidence files
│   ├── src/
│   │   ├── api/client.js           # Axios API client
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── MultimodalFlowDiagram.jsx
│   │   │   ├── ModalityUploadCard.jsx
│   │   │   ├── LoadingPipeline.jsx
│   │   │   ├── ConfidenceMeter.jsx
│   │   │   ├── EvidenceMatrix.jsx
│   │   │   ├── CrossModalFusion.jsx
│   │   │   ├── ContradictionPanel.jsx
│   │   │   ├── NextBestQuestion.jsx
│   │   │   ├── RecommendationCard.jsx
│   │   │   └── InvestigationReportModal.jsx
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── HistoryPage.jsx
│   │   │   └── SettingsPage.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── vite.config.js
│   └── package.json
├── server/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js               # MongoDB connection + fallback
│   │   │   └── gemini.js           # API key management
│   │   ├── controllers/
│   │   │   └── investigationController.js
│   │   ├── middleware/
│   │   │   ├── uploadMiddleware.js  # Multer config
│   │   │   └── errorHandler.js
│   │   ├── models/
│   │   │   └── Investigation.js    # Mongoose + in-memory repo
│   │   ├── routes/
│   │   │   └── investigationRoutes.js
│   │   ├── services/
│   │   │   ├── geminiService.js    # Multimodal AI engine
│   │   │   └── demoService.js      # Curated demo scenarios
│   │   ├── app.js
│   │   └── server.js
│   ├── public/demo-assets/
│   └── package.json
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## ⚙️ Environment Variables

Create `server/.env` (already provided with defaults):

```env
PORT=5000
GEMINI_API_KEY=           # Optional — app works without it via smart simulation
MONGODB_URI=mongodb://localhost:27017/fieldsense_ai  # Optional — auto-fallback to in-memory
CLIENT_URL=http://localhost:5173
```

## 🚀 Installation & Running

### Quick Start (recommended)

```bash
# 1. Install all dependencies (root + server + client)
npm run install:all

# 2. Start both frontend and backend concurrently
npm run dev
```

### Manual Start

```bash
# Terminal 1: Start backend (port 5000)
cd server
npm install
npm run dev

# Terminal 2: Start frontend (port 5173)
cd client
npm install
npm run dev
```

### Access

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000/api/health

## 🧪 Demo Instructions

### 30-Second Judge Demo

1. Open http://localhost:5173
2. Click **"Try 1-Click Demo"** or **"Start Investigation"**
3. Click **"Load Demo: Belt Vibration"** → Results appear instantly showing 87% confidence with 4 corroborating modalities
4. Click **"Load Demo: Thermal Conflict"** → Shows **⚠ Evidence Conflict Detected** with 42% confidence
5. Click **"Generate Report"** → View and download the full investigation audit trail
6. Navigate to **History** → See saved investigations

### Demo Scenario 1: Belt Vibration (Cross-Modal Corroboration)
- **Text:** Technician reports vibration since yesterday
- **Image:** Belt offset visible on drive pulley (~3.8mm)
- **Audio:** 28 Hz harmonic resonance detected
- **Video:** Lateral belt wobble during rotation
- **Document:** OEM manual says >2mm offset causes vibration
- **Result:** 87% High Confidence — all 4 sensory modalities converge

### Demo Scenario 2: Thermal Conflict (Contradiction Detection)
- **Text:** "The machine is overheating"
- **Image:** Control panel shows 41.8°C with green status indicator
- **Document:** OEM datasheet defines normal range as 30°C–75°C
- **Result:** ⚠ **CONTRADICTION FLAGGED** — 42% Low Confidence

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | System status, DB/AI diagnostics |
| `POST` | `/api/investigations/analyze` | Run multimodal AI analysis (multipart form) |
| `POST` | `/api/investigations` | Save investigation to persistence |
| `GET` | `/api/investigations` | List all saved investigations |
| `GET` | `/api/investigations/:id` | Get investigation by ID |
| `DELETE` | `/api/investigations/:id` | Delete investigation |
| `GET` | `/api/demos/:key` | Get demo preset (`vibration` or `overheating`) |
| `POST` | `/api/config/key` | Update Gemini API key at runtime |

## 🔑 Gemini API Setup (Optional)

1. Visit https://aistudio.google.com/
2. Create a free API key
3. Add to `server/.env`: `GEMINI_API_KEY=AIzaSy...`
4. Or use the **Settings/Diagnostics** page in the UI to enter it at runtime

**Without an API key**, the app runs a high-fidelity domain reasoning engine that produces realistic structured results for demos and evaluation.

## 🗄️ MongoDB Setup (Optional)

If MongoDB is running locally on port 27017, the app automatically connects.  
If MongoDB is unavailable, it **seamlessly falls back** to an in-memory store — zero configuration needed.

## 🔒 Security

- Gemini API key is **never exposed to the frontend**
- All AI calls happen exclusively on the Express backend
- File uploads are validated by MIME type + extension
- Multer enforces 50MB file size limits
- `.env` is excluded from git via `.gitignore`

## 🔮 Future Improvements

- [ ] Multi-investigation comparison ("diff two incidents")
- [ ] Real-time streaming analysis with SSE
- [ ] Persistent file storage (S3 / GCS)
- [ ] Team collaboration & shared investigations
- [ ] Custom domain prompt templates
- [ ] Mobile-native investigation capture app
- [ ] Integration with CMMS/EAM systems
- [ ] Temporal evidence correlation (timestamps)

---

**Built for hackathon evaluation. Designed to win.**

*FIELDSENSE AI — "See it. Hear it. Understand it. Cross-check it."*
