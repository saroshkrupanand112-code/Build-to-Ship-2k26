import { classifyFaultEvidence, formatMLEvidenceEntry } from '../services/mlService.js';

/**
 * POST /api/ml/predict
 * Run fault classification on provided text.
 */
export const predictFault = async (req, res, next) => {
  try {
    const { observationText, ragContext } = req.body;

    if (!observationText || observationText.trim().length < 5) {
      return res.status(400).json({ success: false, error: 'observationText must be at least 5 characters.' });
    }

    const mlResult = await classifyFaultEvidence(observationText, ragContext || '');
    const evidenceEntry = formatMLEvidenceEntry(mlResult, observationText);

    return res.status(200).json({
      success: true,
      prediction: {
        faultCategory: mlResult.faultCategory,
        severity: mlResult.severity,
        confidence: mlResult.confidence,
        evidenceType: mlResult.evidenceType,
        source: mlResult.source,
        modelId: mlResult.modelId,
        isPrototype: mlResult.source === 'heuristic-prototype',
        topLabels: mlResult.topLabels || []
      },
      evidenceEntry
    });
  } catch (err) {
    next(err);
  }
};
