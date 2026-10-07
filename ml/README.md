# FieldSense AI — Machine Learning Pipeline

## Overview
FieldSense AI pairs Google Gemini 1.5 Flash multimodal reasoning with a specialized domain classifier trained on industrial equipment fault telemetry.

This ML classifier acts as an **independent evidence modality**. Instead of relying purely on large generative models, FieldSense AI feeds the classifier's predicted probability distribution into Gemini's cross-modal fusion engine. Gemini then cross-checks the classifier's hypothesis against physical evidence (audio waveforms, visual inspection photos, high-speed videos, and SOP manual thresholds).

---

## Architecture

```
[Incident Report & Sensor Telemetry]
              │
              ├──► [Stage 1: Document RAG Engine] ───► Retrieved SOP Thresholds
              │
              ├──► [Stage 2: Domain Fault Classifier] ──► Top Fault Probabilities
              │    (DistilBERT / BART-Large-MNLI)
              │
              ▼
    [Stage 3: Gemini 1.5 Flash Multimodal Fusion]
         • Corroborates or refutes ML hypothesis
         • Flags sensor vs physical contradictions
         • Recommends next best test & action
```

---

## Dataset Schema (`dataset.json`)

Each sample represents a recorded industrial anomaly with multimodal observations:

| Field | Type | Description |
|---|---|---|
| `observation` | String | Description of physical symptom |
| `modality` | String | Source modality (e.g. `acoustic_vibration`, `thermal_contradiction`) |
| `fault_class` | String | Target category (e.g. `belt_misalignment`, `sensor_calibration_drift`) |
| `telemetry` | Object | Numerical sensor readings (frequency, amplitude, temperature) |

---

## Running the Training Script

```bash
# 1. Install dependencies
pip install torch transformers datasets

# 2. Run fine-tuning
python train_fault_classifier.py --epochs 5 --batch-size 4 --output-dir ./artifacts
```

When PyTorch or GPU resources are not present locally, the script automatically exports a deployment-ready manifest (`model_manifest.json`) compatible with Hugging Face Inference API (`facebook/bart-large-mnli`).
