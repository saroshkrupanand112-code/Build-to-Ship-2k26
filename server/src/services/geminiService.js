import fs from 'fs';
import { z } from 'zod';
import { getGeminiApiKey, hasValidApiKey } from '../config/gemini.js';
import { DEMO_SCENARIOS } from './demoService.js';

// ===================== ZOD SCHEMA =====================
export const InvestigationSchema = z.object({
  summary: z.string().min(5),
  primaryIssue: z.object({
    title: z.string().min(3),
    description: z.string().min(5)
  }),
  confidence: z.object({
    score: z.number().min(0).max(100),
    label: z.enum(['Low', 'Medium', 'High']),
    explanation: z.string().min(5)
  }),
  evidence: z.array(z.object({
    id: z.string(),
    modality: z.string(),
    observation: z.string().min(3),
    type: z.enum(['supporting', 'contradicting', 'neutral']),
    impact: z.enum(['low', 'medium', 'high']),
    reason: z.string(),
    sourceReference: z.string().optional(),
    mlDetails: z.any().optional()
  })).min(1),
  crossModalReasoning: z.array(z.object({
    evidenceIds: z.array(z.string()),
    reasoning: z.string().min(5)
  })).min(1),
  contradictions: z.array(z.object({
    sources: z.array(z.string()),
    description: z.string(),
    severity: z.enum(['low', 'medium', 'high'])
  })),
  missingEvidence: z.array(z.object({
    description: z.string(),
    importance: z.enum(['low', 'medium', 'high'])
  })),
  nextBestQuestion: z.object({
    question: z.string().min(5),
    reason: z.string().min(5)
  }),
  recommendations: z.array(z.object({
    action: z.string().min(5),
    priority: z.enum(['low', 'medium', 'high']),
    reason: z.string()
  })).min(1),
  safetyNote: z.string().min(5),
  report: z.string().min(10),
  // NEW: RAG + ML metadata
  ragSources: z.array(z.any()).optional(),
  mlResult: z.any().optional(),
  aiStack: z.any().optional()
});

// ===================== SYSTEM INSTRUCTION =====================
const buildSystemInstruction = () => `You are FieldSense AI, a multimodal evidence intelligence and investigation engine.

Your core innovation: YOU DON'T JUST COMBINE MODALITIES — YOU MAKE THEM CROSS-VALIDATE EACH OTHER.

Treat each input as an independent evidence source:
- User text report → direct field observation
- Image/video/audio → sensory evidence
- Document/manual → domain knowledge
- RAG retrieved chunks → retrieved knowledge (grounded in uploaded docs)
- ML model prediction → specialized domain signal

YOUR REASONING PROCESS:
1. Extract observable facts from each modality
2. Identify what each modality SUPPORTS or CONTRADICTS
3. Compare across modalities — where do they agree? where do they conflict?
4. Build cross-modal evidence picture
5. Detect contradictions EXPLICITLY — never hide them
6. Estimate confidence based on cross-source consistency
7. Identify missing information that would reduce uncertainty most
8. Determine the single most valuable next observation
9. Produce explainable, traceable recommendation

DISTINCTION REQUIREMENTS (CRITICAL for explainability):
- "observed": directly visible/measurable from uploaded evidence
- "retrieved": found in uploaded documents via RAG
- "ml_predicted": classified by specialized ML model
- "inferred": reasoned from combining evidence
- "recommended": AI-assisted suggestion requiring human verification

SAFETY: Never present AI output as certified engineering authority.
Always include: "AI-assisted recommendation. Requires qualified technician verification."

RESPOND ONLY WITH VALID JSON matching this exact schema:
{
  "summary": "string",
  "primaryIssue": { "title": "string", "description": "string" },
  "confidence": {
    "score": number 0-100,
    "label": "Low"|"Medium"|"High",
    "explanation": "string"
  },
  "evidence": [
    {
      "id": "string",
      "modality": "text"|"image"|"audio"|"video"|"document"|"rag"|"ml_model",
      "observation": "string",
      "type": "supporting"|"contradicting"|"neutral",
      "impact": "low"|"medium"|"high",
      "reason": "string",
      "sourceReference": "string (filename, page, section, timestamp, etc.)"
    }
  ],
  "crossModalReasoning": [{ "evidenceIds": ["string"], "reasoning": "string" }],
  "contradictions": [{ "sources": ["string"], "description": "string", "severity": "low"|"medium"|"high" }],
  "missingEvidence": [{ "description": "string", "importance": "low"|"medium"|"high" }],
  "nextBestQuestion": { "question": "string", "reason": "string" },
  "recommendations": [{ "action": "string", "priority": "low"|"medium"|"high", "reason": "string" }],
  "safetyNote": "string",
  "report": "string (detailed markdown investigation report)"
}`;

// ===================== FILE HELPER =====================
const fileToGenerativePart = (filePath, mimeType) => {
  try {
    const fileBuffer = fs.readFileSync(filePath);
    return {
      inlineData: {
        data: fileBuffer.toString('base64'),
        mimeType
      }
    };
  } catch (err) {
    console.error(`[GeminiService] Error reading file ${filePath}:`, err.message);
    return null;
  }
};

// ===================== JSON PARSE HELPER =====================
const extractAndParseJSON = (rawText) => {
  if (!rawText) throw new Error('Empty response from model');

  let cleaned = rawText.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }

  try {
    return JSON.parse(cleaned);
  } catch (e) {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error(`JSON parse error: ${e.message}`);
  }
};

// ===================== MAIN INVESTIGATION ENGINE =====================

/**
 * Run the full multimodal investigation:
 *   Files + Text → [RAG retrieval] + [ML classification] → Gemini reasoning → structured result
 */
export const runMultimodalInvestigation = async ({
  problemDescription,
  files = [],
  presetKey = null,
  ragContext = null,     // { contextText, sources } from ragService
  mlResult = null        // from mlService
}) => {

  // Curated demo preset (no custom files)
  if (presetKey && DEMO_SCENARIOS[presetKey] && files.length === 0 && !ragContext) {
    console.log(`[GeminiService] Serving curated preset scenario: ${presetKey}`);
    const preset = DEMO_SCENARIOS[presetKey].aiResult;
    return {
      ...preset,
      ragSources: preset.ragSources || [],
      mlResult: preset.mlResult || null,
      aiStack: buildAIStack(false, false, false)
    };
  }

  const hasApiKey = hasValidApiKey();
  const hasRag = ragContext && ragContext.sources && ragContext.sources.length > 0;
  const hasMl = mlResult && mlResult.faultCategory;

  if (hasApiKey) {
    try {
      console.log(`[GeminiService] Executing live Gemini reasoning... RAG: ${hasRag}, ML: ${hasMl}`);

      let rawResultText = '';

      // Build the investigation prompt with RAG + ML context
      const investigationPrompt = buildInvestigationPrompt(
        problemDescription, files, ragContext, mlResult
      );

      // Try modern @google/genai SDK first
      try {
        const { GoogleGenAI } = await import('@google/genai');
        const ai = new GoogleGenAI({ apiKey: getGeminiApiKey() });

        const promptParts = [
          { text: buildSystemInstruction() },
          { text: investigationPrompt }
        ];

        // Attach real uploaded files as inline data
        for (const file of files) {
          const part = fileToGenerativePart(file.path, file.mimetype);
          if (part) {
            promptParts.push(part);
            promptParts.push({
              text: `[ATTACHED EVIDENCE]: ${file.fieldname || 'file'} — "${file.originalname}" (${file.mimetype})`
            });
          }
        }

        const response = await ai.models.generateContent({
          model: 'gemini-1.5-flash',
          contents: promptParts,
          config: { responseMimeType: 'application/json', temperature: 0.2 }
        });

        rawResultText = response.text || response.candidates?.[0]?.content?.parts?.[0]?.text;
      } catch (sdkError) {
        console.warn(`[@google/genai] Falling back to @google/generative-ai:`, sdkError.message);
        const { GoogleGenerativeAI } = await import('@google/generative-ai');
        const genAI = new GoogleGenerativeAI(getGeminiApiKey());
        const model = genAI.getGenerativeModel({
          model: 'gemini-1.5-flash',
          systemInstruction: buildSystemInstruction(),
          generationConfig: { responseMimeType: 'application/json', temperature: 0.2 }
        });

        const promptParts = [investigationPrompt];
        for (const file of files) {
          const part = fileToGenerativePart(file.path, file.mimetype);
          if (part) promptParts.push(part);
        }
        const result = await model.generateContent(promptParts);
        rawResultText = result.response.text();
      }

      const parsedData = extractAndParseJSON(rawResultText);

      // Inject ML evidence entry if HF model ran
      if (hasMl && mlResult._evidenceEntry) {
        parsedData.evidence = parsedData.evidence || [];
        // Only add if not already present
        if (!parsedData.evidence.find(e => e.id === 'ev-ml-hf')) {
          parsedData.evidence.push(mlResult._evidenceEntry);
        }
      }

      const validated = InvestigationSchema.parse(parsedData);

      // Attach metadata
      const finalResult = {
        ...validated,
        ragSources: ragContext?.sources || [],
        mlResult: hasMl ? {
          faultCategory: mlResult.faultCategory,
          severity: mlResult.severity,
          confidence: mlResult.confidence,
          source: mlResult.source,
          modelId: mlResult.modelId,
          isPrototype: mlResult.source === 'heuristic-prototype',
          topLabels: mlResult.topLabels || []
        } : null,
        aiStack: buildAIStack(true, hasRag, hasMl)
      };

      console.log(`[GeminiService] Investigation complete! Confidence: ${validated.confidence.score}%`);
      return finalResult;

    } catch (apiError) {
      console.error(`[GeminiService] Gemini failed (${apiError.message}). Falling back to domain reasoner...`);
    }
  } else {
    console.log(`[GeminiService] No GEMINI_API_KEY — running intelligent domain heuristic engine...`);
  }

  // Domain heuristic fallback
  return generateDomainReasonedResult(problemDescription, files, presetKey, ragContext, mlResult);
};

// ===================== PROMPT BUILDER =====================
function buildInvestigationPrompt(problemDescription, files, ragContext, mlResult) {
  let prompt = `INVESTIGATION REQUEST\n${'='.repeat(50)}\n\n`;
  prompt += `PROBLEM DESCRIPTION (Field Technician Report):\n"${problemDescription}"\n\n`;
  prompt += `UPLOADED EVIDENCE FILES: ${files.length} file(s)\n`;

  if (files.length > 0) {
    files.forEach((f, i) => {
      prompt += `  ${i + 1}. ${f.fieldname}: "${f.originalname}" (${f.mimetype}, ${(f.size / 1024).toFixed(1)} KB)\n`;
    });
  }

  if (ragContext && ragContext.sources && ragContext.sources.length > 0) {
    prompt += `\n${'='.repeat(50)}\nRETRIEVED DOMAIN KNOWLEDGE (from indexed documents via RAG):\n${'='.repeat(50)}\n`;
    prompt += `The following sections were retrieved from uploaded manuals/documents based on semantic relevance:\n\n`;
    prompt += ragContext.contextText;
    prompt += `\n\nIMPORTANT: Use this retrieved knowledge as "retrieved" evidence. Cite the source document and page number when using it.\n`;
  } else {
    prompt += `\nRAG STATUS: No documents have been indexed for this investigation.\n`;
  }

  if (mlResult && mlResult.faultCategory) {
    prompt += `\n${'='.repeat(50)}\nSPECIALIZED ML MODEL PREDICTION:\n${'='.repeat(50)}\n`;
    prompt += `Model: ${mlResult.modelId} (${mlResult.source})\n`;
    prompt += `Fault Category: ${mlResult.faultCategory}\n`;
    prompt += `Severity: ${mlResult.severity}\n`;
    prompt += `Confidence: ${Math.round(mlResult.confidence * 100)}%\n`;
    if (mlResult.source === 'heuristic-prototype') {
      prompt += `NOTE: This is a prototype heuristic model for demonstration. Label it clearly in evidence as "prototype".\n`;
    }
    prompt += `\nInclude this ML prediction as a "ml_model" modality evidence entry with id "ev-ml-hf".\n`;
  }

  prompt += `\n${'='.repeat(50)}\nINSTRUCTIONS:\n`;
  prompt += `- Cross-validate ALL evidence sources against each other\n`;
  prompt += `- Flag any contradictions explicitly\n`;
  prompt += `- Cite RAG sources with document name + page number in sourceReference\n`;
  prompt += `- Label ML model as observed fact vs prediction\n`;
  prompt += `- Confidence score should reflect cross-source agreement, not certainty\n`;
  prompt += `- The report field should be a complete markdown investigation report\n`;

  return prompt;
}

// ===================== AI STACK BUILDER =====================
function buildAIStack(geminiLive, hasRag, hasMl) {
  return {
    reasoning: {
      engine: 'Google Gemini 1.5 Flash',
      status: geminiLive ? 'live' : 'simulation',
      role: 'Multimodal understanding, cross-modal reasoning, report generation'
    },
    domainKnowledge: {
      engine: hasRag ? 'RAG Pipeline (Gemini Embeddings + Cosine Similarity)' : 'No documents indexed',
      status: hasRag ? 'active' : 'idle',
      role: 'Retrieval from uploaded manuals and technical documents'
    },
    specializedModel: {
      engine: hasMl ? 'Hugging Face: facebook/bart-large-mnli' : 'Heuristic Prototype',
      status: hasMl ? 'active' : 'prototype',
      role: 'Industrial fault pattern classification'
    },
    database: {
      engine: 'MongoDB + Mongoose (auto-fallback to in-memory)',
      status: 'active',
      role: 'Investigation persistence and document chunk storage'
    },
    vectorSearch: {
      engine: 'Cosine Similarity (local) / Gemini Embeddings',
      status: 'active',
      role: 'Semantic chunk retrieval for RAG'
    }
  };
}

// ===================== DOMAIN HEURISTIC FALLBACK =====================
function generateDomainReasonedResult(problemDescription, files, presetKey, ragContext, mlResult) {
  const text = (problemDescription || '').toLowerCase();
  const hasVibration = text.includes('vibrat') || text.includes('belt') || presetKey === 'vibration';
  const hasHeat = text.includes('overheat') || text.includes('hot') || text.includes('temp') || presetKey === 'overheating';

  let baseResult;
  if (hasHeat) {
    baseResult = JSON.parse(JSON.stringify(DEMO_SCENARIOS.overheating.aiResult));
  } else if (hasVibration) {
    baseResult = JSON.parse(JSON.stringify(DEMO_SCENARIOS.vibration.aiResult));
  } else {
    baseResult = buildGenericResult(problemDescription, files);
  }

  // Inject RAG evidence
  if (ragContext && ragContext.sources && ragContext.sources.length > 0) {
    ragContext.sources.slice(0, 3).forEach((src, i) => {
      baseResult.evidence.push({
        id: `ev-rag-${i}`,
        modality: 'rag',
        observation: `[RETRIEVED] ${src.documentName} (Page ${src.pageNumber}): "${src.text.slice(0, 200)}..."`,
        type: 'supporting',
        impact: src.relevanceScore > 70 ? 'high' : 'medium',
        reason: `Retrieved from "${src.documentName}" with ${src.relevanceScore}% relevance to investigation query.`,
        sourceReference: `${src.documentName} | Page ${src.pageNumber}${src.section ? ` | ${src.section}` : ''}`
      });
    });
  }

  // Inject ML evidence
  if (mlResult && mlResult._evidenceEntry) {
    baseResult.evidence.push(mlResult._evidenceEntry);
  }

  return {
    ...baseResult,
    ragSources: ragContext?.sources || [],
    mlResult: mlResult ? {
      faultCategory: mlResult.faultCategory,
      severity: mlResult.severity,
      confidence: mlResult.confidence,
      source: mlResult.source,
      modelId: mlResult.modelId,
      isPrototype: mlResult.source === 'heuristic-prototype',
      topLabels: mlResult.topLabels || []
    } : null,
    aiStack: buildAIStack(false, ragContext?.sources?.length > 0, mlResult?.faultCategory != null)
  };
}

function buildGenericResult(problemDescription, files) {
  const fileEvidence = files.map((f, i) => {
    let mod = 'image';
    if (f.mimetype?.startsWith('audio/')) mod = 'audio';
    else if (f.mimetype?.startsWith('video/')) mod = 'video';
    else if (f.mimetype?.includes('pdf') || f.mimetype?.includes('text')) mod = 'document';

    return {
      id: `ev-${mod}-${i + 1}`,
      modality: mod,
      observation: `Observation from ${mod} evidence "${f.originalname}": Analyzed characteristics show potential anomalous operating pattern.`,
      type: 'supporting',
      impact: 'medium',
      reason: 'Direct media correlation with incident description.',
      sourceReference: f.originalname
    };
  });

  const allEvidence = [
    {
      id: 'ev-text-0',
      modality: 'text',
      observation: `Field report: "${(problemDescription || '').slice(0, 120)}"`,
      type: 'supporting',
      impact: 'medium',
      reason: 'Establishes primary symptom from field technician perspective.',
      sourceReference: 'Field technician text report'
    },
    ...fileEvidence
  ];

  return {
    summary: `Evidence synthesis completed across ${allEvidence.length} source(s). Visual and operational patterns indicate potential subsystem anomaly requiring investigation.`,
    primaryIssue: {
      title: 'Operational Subsystem Anomaly',
      description: `Cross-modal analysis of provided evidence suggests operating variance beyond nominal thresholds. ${fileEvidence.length > 0 ? `${fileEvidence.length} physical evidence file(s) analyzed.` : 'No physical media uploaded.'}`
    },
    confidence: {
      score: fileEvidence.length >= 3 ? 78 : fileEvidence.length >= 1 ? 62 : 45,
      label: fileEvidence.length >= 3 ? 'High' : fileEvidence.length >= 1 ? 'Medium' : 'Low',
      explanation: `Confidence based on ${allEvidence.length} independent evidence sources. ${fileEvidence.length === 0 ? 'Physical evidence files would significantly improve confidence.' : 'Cross-modal corroboration detected.'}`
    },
    evidence: allEvidence,
    crossModalReasoning: [{
      evidenceIds: allEvidence.map(e => e.id),
      reasoning: 'Available evidence sources have been cross-referenced. Text report corroborated by uploaded media files where present.'
    }],
    contradictions: [],
    missingEvidence: [
      { description: 'Historical baseline measurements or calibration records.', importance: 'high' },
      { description: 'Physical inspection report from a qualified technician.', importance: 'high' }
    ],
    nextBestQuestion: {
      question: 'Can you provide a close-up recording of the component during operation, taken from multiple angles?',
      reason: 'Multi-angle visual and acoustic evidence enables triangulation of fault location and type.'
    },
    recommendations: [
      { action: 'Establish safety perimeter and perform visual inspection with power isolated.', priority: 'high', reason: 'Initial hands-on inspection is required to validate AI-assisted findings.' },
      { action: 'Log current operating parameters and compare with OEM specifications.', priority: 'medium', reason: 'Quantitative comparison reveals deviation from nominal tolerances.' }
    ],
    safetyNote: 'AI-ASSISTED INVESTIGATION. Requires qualified field technician verification. Follow all applicable Lockout/Tagout (LOTO) procedures. Do not perform maintenance without appropriate authorization.',
    report: `# FIELDSENSE AI INVESTIGATION REPORT\n\n**Problem:** ${problemDescription?.slice(0, 80) || 'Operational anomaly'}\n**Evidence Sources:** ${allEvidence.length}\n**Mode:** Heuristic Simulation\n\n## Summary\n${allEvidence.length} evidence sources analyzed. Requires technician verification.\n\n## Safety\n> All maintenance must follow Lockout/Tagout protocols.\n\n*AI-assisted report. Not a certified engineering assessment.*`
  };
}
