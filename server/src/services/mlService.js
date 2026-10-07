/**
 * FieldSense AI - Specialized Fault Classification Service
 *
 * Role in Architecture:
 *   This service provides domain-specific fault classification as ONE evidence source.
 *   It does NOT replace Gemini. Its output is fed INTO the evidence fusion layer.
 *
 * Implementation:
 *   - PRIMARY: Hugging Face Inference API (zero-shot-classification with a suitable model)
 *   - FALLBACK: Deterministic industrial heuristic classifier (clearly labeled as such)
 *
 * The HF model used: facebook/bart-large-mnli (zero-shot classification)
 *   - Suitable for domain adaptation without fine-tuning
 *   - Can classify text into user-defined fault categories
 *   - Realistic for a hackathon: shows HF integration while being practical
 *
 * For actual fine-tuning: see /ml/ directory which contains the fine-tuning pipeline
 * using distilbert-base-uncased with PEFT/LoRA adapters.
 */

const FAULT_CATEGORIES = [
  'belt_misalignment',
  'bearing_failure',
  'thermal_overload',
  'electrical_fault',
  'mechanical_looseness',
  'lubrication_issue',
  'normal_operation',
  'unknown_anomaly'
];

const SEVERITY_LEVELS = ['critical', 'high', 'medium', 'low'];

const EVIDENCE_TYPES = ['supporting', 'contradicting', 'neutral'];

/**
 * Run Hugging Face zero-shot fault classification.
 * Falls back to heuristic classifier if HF API is unavailable.
 */
export const classifyFaultEvidence = async (observationText, ragContext = '') => {
  const combinedText = [observationText, ragContext].filter(Boolean).join('\n').slice(0, 1000);

  // Try HF Inference API
  const hfApiKey = process.env.HF_API_KEY || '';
  if (hfApiKey && hfApiKey.length > 10) {
    try {
      const result = await callHuggingFaceAPI(combinedText, hfApiKey);
      if (result) {
        console.log(`[HF] Zero-shot classification: ${result.faultCategory} (${Math.round(result.confidence * 100)}%)`);
        return { ...result, source: 'huggingface-zero-shot', modelId: 'facebook/bart-large-mnli' };
      }
    } catch (err) {
      console.warn('[HF] API call failed, using heuristic classifier:', err.message);
    }
  } else {
    console.log('[HF] No HF_API_KEY found — using domain heuristic classifier (labeled as prototype)');
  }

  // Deterministic heuristic fallback
  const result = heuristicClassifier(combinedText);
  return { ...result, source: 'heuristic-prototype', modelId: 'local-rule-based' };
};

/**
 * Call Hugging Face Inference API (zero-shot-classification endpoint)
 */
async function callHuggingFaceAPI(text, apiKey) {
  const API_URL = 'https://api-inference.huggingface.co/models/facebook/bart-large-mnli';

  const candidateLabels = [
    'belt or pulley misalignment',
    'bearing wear or failure',
    'thermal overload or overheating',
    'electrical fault or wiring issue',
    'mechanical looseness or vibration',
    'lubrication or oil issue',
    'normal operation',
    'unknown anomaly'
  ];

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      inputs: text,
      parameters: { candidate_labels: candidateLabels, multi_label: false }
    }),
    signal: AbortSignal.timeout(8000)
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`HF API error ${response.status}: ${err.slice(0, 200)}`);
  }

  const data = await response.json();

  // Map HF label back to our category
  const topLabel = data.labels?.[0] || '';
  const topScore = data.scores?.[0] || 0;

  const categoryMap = {
    'belt or pulley misalignment': 'belt_misalignment',
    'bearing wear or failure': 'bearing_failure',
    'thermal overload or overheating': 'thermal_overload',
    'electrical fault or wiring issue': 'electrical_fault',
    'mechanical looseness or vibration': 'mechanical_looseness',
    'lubrication or oil issue': 'lubrication_issue',
    'normal operation': 'normal_operation',
    'unknown anomaly': 'unknown_anomaly'
  };

  const faultCategory = categoryMap[topLabel] || 'unknown_anomaly';
  const severity = topScore > 0.7 ? 'high' : topScore > 0.4 ? 'medium' : 'low';

  return {
    faultCategory,
    severity,
    confidence: topScore,
    evidenceType: faultCategory === 'normal_operation' ? 'neutral' : 'supporting',
    topLabels: data.labels?.slice(0, 3).map((label, i) => ({
      label: categoryMap[label] || label,
      score: data.scores[i]
    })) || [],
    rawLabel: topLabel
  };
}

/**
 * Industrial heuristic fault classifier.
 * Labeled clearly as PROTOTYPE / DEMONSTRATION for transparency.
 */
function heuristicClassifier(text) {
  const t = text.toLowerCase();

  const patterns = [
    {
      keywords: ['vibrat', 'belt', 'misalign', 'pulley', 'sheave', 'offset', 'wobble'],
      category: 'belt_misalignment', severity: 'high', evidenceType: 'supporting'
    },
    {
      keywords: ['bearing', 'race', 'ball', 'roller', 'seized', 'spall'],
      category: 'bearing_failure', severity: 'high', evidenceType: 'supporting'
    },
    {
      keywords: ['overheat', 'hot', 'temperature', 'thermal', 'burn', 'smoke'],
      category: 'thermal_overload', severity: 'high', evidenceType: 'supporting'
    },
    {
      keywords: ['current', 'voltage', 'electric', 'short', 'winding', 'insulation', 'spark'],
      category: 'electrical_fault', severity: 'critical', evidenceType: 'supporting'
    },
    {
      keywords: ['loose', 'rattle', 'shake', 'bolt', 'fastener', 'mount'],
      category: 'mechanical_looseness', severity: 'medium', evidenceType: 'supporting'
    },
    {
      keywords: ['lubricat', 'grease', 'oil', 'dry', 'friction', 'squeal'],
      category: 'lubrication_issue', severity: 'medium', evidenceType: 'supporting'
    },
    {
      keywords: ['normal', 'nominal', 'within', 'acceptable', 'green', 'ok'],
      category: 'normal_operation', severity: 'low', evidenceType: 'neutral'
    }
  ];

  let bestMatch = null;
  let bestScore = 0;

  for (const pattern of patterns) {
    const hits = pattern.keywords.filter(kw => t.includes(kw)).length;
    const score = hits / pattern.keywords.length;
    if (score > bestScore) {
      bestScore = score;
      bestMatch = { ...pattern, confidence: Math.min(0.55 + score * 0.3, 0.85) };
    }
  }

  if (!bestMatch || bestScore < 0.1) {
    return {
      faultCategory: 'unknown_anomaly',
      severity: 'medium',
      evidenceType: 'neutral',
      confidence: 0.35,
      topLabels: [],
      rawLabel: 'unknown_anomaly'
    };
  }

  return {
    faultCategory: bestMatch.category,
    severity: bestMatch.severity,
    evidenceType: bestMatch.evidenceType,
    confidence: bestMatch.confidence,
    topLabels: [],
    rawLabel: bestMatch.category
  };
}

/**
 * Format the HF/heuristic result as an evidence entry for the fusion layer.
 */
export const formatMLEvidenceEntry = (mlResult, observationText) => {
  const categoryLabels = {
    belt_misalignment: 'Belt/Pulley Misalignment Pattern',
    bearing_failure: 'Bearing Wear/Failure Pattern',
    thermal_overload: 'Thermal Overload Pattern',
    electrical_fault: 'Electrical Fault Pattern',
    mechanical_looseness: 'Mechanical Looseness Pattern',
    lubrication_issue: 'Lubrication Deficiency Pattern',
    normal_operation: 'Normal Operating Pattern',
    unknown_anomaly: 'Unclassified Anomaly Pattern'
  };

  const isPrototype = mlResult.source === 'heuristic-prototype';

  return {
    id: 'ev-ml-hf',
    modality: 'ml_model',
    source: isPrototype ? 'Heuristic Prototype (Demo)' : 'Hugging Face: facebook/bart-large-mnli',
    observation: `[${isPrototype ? 'PROTOTYPE' : 'HF MODEL'}] Fault classification: ${categoryLabels[mlResult.faultCategory] || mlResult.faultCategory} | Severity: ${mlResult.severity} | Confidence: ${Math.round(mlResult.confidence * 100)}%`,
    type: mlResult.evidenceType,
    impact: mlResult.severity === 'critical' ? 'high' : mlResult.severity === 'high' ? 'high' : 'medium',
    reason: `Specialized classifier analyzed observation patterns and matched strongest signal to "${mlResult.faultCategory}" category.`,
    mlDetails: {
      faultCategory: mlResult.faultCategory,
      severity: mlResult.severity,
      confidence: mlResult.confidence,
      modelId: mlResult.modelId,
      source: mlResult.source,
      isPrototype,
      topLabels: mlResult.topLabels || []
    }
  };
};
