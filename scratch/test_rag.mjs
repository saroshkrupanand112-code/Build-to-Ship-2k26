import fs from 'fs';

const BASE = 'http://127.0.0.1:5000/api';

const manualText = `
OEM Conveyor Drive System Technical Specification & SOP Manual (Doc Ref: OEM-CV-2024-SOP)
Section 4.1: Vibration Tolerance and Sheave Alignment
- Allowable angular misalignment on V-belt drive sheaves shall not exceed 0.25 degrees (approx 1.5mm per 300mm span).
- Total radial offset exceeding 3.0 mm will generate severe harmonic knock between 25 Hz and 32 Hz.
- When radial vibration knocks exceed 4.5 mm/s RMS, belt flutter and premature core degradation will occur within 48 operating hours.

Section 5.3: Thermal Operating Limits
- Motor stator continuous thermal limit: 85 degrees Celsius.
- Bearing outer race temperature limit: 75 degrees Celsius.
- If RTD channel indicates >90 C but infrared spot pyrometer reads <60 C, immediately inspect for RTD terminal corrosion, lead wire resistance drift, or cold junction offset. Normal PT100 sensor resistance at 25 C is 109.7 ohms; resistance above 135 ohms indicates circuit degradation.
`;

const formData = new FormData();
formData.append('document', new Blob([manualText], { type: 'text/plain' }), 'OEM_Conveyor_Manual_SOP.txt');

console.log('Uploading manual to RAG...');
const uploadRes = await fetch(BASE + '/documents/upload', {
  method: 'POST',
  body: formData
}).then(r => r.json());

console.log('Upload Result:', uploadRes);

// Query RAG
const ragRes = await fetch(BASE + '/rag/search', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ query: 'sheave misalignment harmonic knock tolerance' })
}).then(r => r.json());

console.log('RAG Query Result:', {
  success: ragRes.success,
  resultCount: ragRes.resultCount,
  topSource: ragRes.sources?.[0]?.documentName,
  relevance: ragRes.sources?.[0]?.relevanceScore + '%',
  snippet: ragRes.sources?.[0]?.text?.trim()
});
