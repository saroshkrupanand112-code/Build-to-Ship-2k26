/**
 * FieldSense AI - Curated Demo Scenarios
 * Scenario 1: Industrial Machine Belt Misalignment (Cross-modal reinforcement)
 * Scenario 2: Thermal Sensor Conflict (Cross-modal contradiction detection)
 */

export const DEMO_SCENARIOS = {
  vibration: {
    id: 'demo-vibration-01',
    title: 'Conveyor Drive System - Abnormal Vibration Incident',
    description: 'The machine has started vibrating unusually since yesterday afternoon following shift change.',
    presetKey: 'vibration',
    evidenceMetadata: [
      {
        id: 'ev-vibr-txt',
        modality: 'text',
        originalName: 'technician_shift_log.txt',
        mimeType: 'text/plain',
        size: 1420,
        previewUrl: null,
        description: 'Technician reports abnormal radial vibration beginning yesterday at 14:30.'
      },
      {
        id: 'ev-vibr-img',
        modality: 'image',
        originalName: 'drive_pulley_sheave.jpg',
        mimeType: 'image/jpeg',
        size: 348200,
        previewUrl: '/demo-assets/drive_pulley_sheave.svg',
        description: 'Close-up of secondary drive pulley showing ~4mm axial belt offset.'
      },
      {
        id: 'ev-vibr-aud',
        modality: 'audio',
        originalName: 'motor_housing_acoustics.mp3',
        mimeType: 'audio/mp3',
        size: 512000,
        previewUrl: '/demo-assets/motor_vibration.wav',
        description: 'Acoustic recording capturing 28 Hz periodic knocking and harmonic flutter.'
      },
      {
        id: 'ev-vibr-vid',
        modality: 'video',
        originalName: 'belt_rotation_cycle.mp4',
        mimeType: 'video/mp4',
        size: 1845000,
        previewUrl: '/demo-assets/belt_movement.webm',
        description: 'High-speed capture showing lateral belt wobble during motor cycling.'
      },
      {
        id: 'ev-vibr-doc',
        modality: 'document',
        originalName: 'OEM_Conveyor_Manual_Sec4.pdf',
        mimeType: 'application/pdf',
        size: 642000,
        previewUrl: '/demo-assets/OEM_Conveyor_Manual_Sec4.pdf',
        description: 'Equipment manual section 4.3: Belt Tension, Pulley Alignment & Harmonic Vibration.'
      }
    ],
    aiResult: {
      summary: 'Cross-modal correlation reveals a high-probability mechanical belt misalignment on the secondary drive pulley. Visual evidence of axial offset correlates directly with acoustic 28 Hz harmonic flutter and dynamic wobble captured on video. OEM specifications confirm this symptom profile.',
      primaryIssue: {
        title: 'Secondary Drive Belt Axial Misalignment & Sheave Eccentricity',
        description: 'The drive belt has drifted approximately 3.8mm beyond tolerance on the driven sheave, inducing harmonic vibration that resonates through the motor chassis under load.'
      },
      confidence: {
        score: 87,
        label: 'High',
        explanation: 'Confidence is supported by mutual reinforcement across 4 independent physical modalities (Image, Audio, Video, and OEM Document) without conflicting data.'
      },
      evidence: [
        {
          id: 'ev-vibr-img',
          modality: 'image',
          observation: 'Visual inspection shows a visible 4mm lateral displacement on the outer rim of the primary driven sheave.',
          type: 'supporting',
          impact: 'high',
          reason: 'Direct physical evidence of physical belt track departure.'
        },
        {
          id: 'ev-vibr-aud',
          modality: 'audio',
          observation: 'Spectral resonance shows repetitive rhythmic pulse at approximately 28 Hz with high-order harmonics.',
          type: 'supporting',
          impact: 'high',
          reason: 'Acoustic frequency matches rotational belt pitch velocity under misalignment flutter.'
        },
        {
          id: 'ev-vibr-vid',
          modality: 'video',
          observation: 'High-speed frame capture reveals periodic transverse oscillation during rotational cycles.',
          type: 'supporting',
          impact: 'high',
          reason: 'Dynamic proof that vibration originates at the belt-pulley contact interface rather than an internal bearing race.'
        },
        {
          id: 'ev-vibr-doc',
          modality: 'document',
          observation: 'Section 4.3 notes that angular/parallel misalignment exceeding 2mm generates 1x/2x rotational frequency vibration.',
          type: 'supporting',
          impact: 'high',
          reason: 'Validates that observed visual offset exceeds the 2mm OEM operational tolerance.'
        },
        {
          id: 'ev-vibr-txt',
          modality: 'text',
          observation: 'Technician logged abrupt vibration onset yesterday at 14:30 following routine shift change.',
          type: 'neutral',
          impact: 'medium',
          reason: 'Provides chronological context and confirms incident is sudden rather than gradual wear.'
        }
      ],
      crossModalReasoning: [
        {
          evidenceIds: ['ev-vibr-img', 'ev-vibr-vid'],
          reasoning: 'Static image confirms static belt offset of ~4mm, while video confirms this translates into active sinusoidal whipping under operational velocity.'
        },
        {
          evidenceIds: ['ev-vibr-aud', 'ev-vibr-doc'],
          reasoning: 'The 28 Hz acoustic resonance matches the exact harmonic frequency predicted by OEM manual Section 4.3 for sheave misalignment at 1750 RPM.'
        },
        {
          evidenceIds: ['ev-vibr-img', 'ev-vibr-aud', 'ev-vibr-vid', 'ev-vibr-doc'],
          reasoning: 'All four sensory and reference modalities converge on belt track deflection rather than rotor unbalance or bearing fatigue.'
        }
      ],
      contradictions: [],
      missingEvidence: [
        {
          description: 'Direct measurement of tension gauge reading (deflection force in Newtons).',
          importance: 'medium'
        },
        {
          description: 'Thermal imaging of bearing housings to confirm whether friction has induced secondary heat buildup.',
          importance: 'low'
        }
      ],
      nextBestQuestion: {
        question: 'Please provide a side-view video or laser alignment measurement of the driven pulley while the machine is operating under normal load.',
        reason: 'This observation will definitively isolate whether the misalignment stems from motor base soft-foot loosening or internal bearing race wear.'
      },
      recommendations: [
        {
          action: 'Execute Lockout/Tagout (LOTO) and inspect drive pulley alignment using a straightedge or precision laser tool.',
          priority: 'high',
          reason: 'Visual and video data confirm offset exceeds OEM 2mm tolerance threshold.'
        },
        {
          action: 'Verify belt tension using a sonic or mechanical deflection tension meter against Section 4.3 specs.',
          priority: 'high',
          reason: 'Audio resonance indicates improper belt tension exacerbating the harmonic vibration.'
        },
        {
          action: 'Inspect sheave grooves for uneven wear or metal burrs before retensioning.',
          priority: 'medium',
          reason: 'Video lateral drift could have caused friction wear on the inner pulley lip.'
        }
      ],
      safetyNote: 'MANDATORY SAFETY: De-energize equipment and attach OSHA-compliant LOTO lock before removing belt safety guard or applying physical tension gauges.',
      report: `# FIELDSENSE AI INVESTIGATION REPORT
**Investigation ID:** FS-INV-2026-9041
**Date:** March 2026
**Status:** Completed - High Confidence
**Incident:** Conveyor Drive System - Abnormal Vibration Incident

---

### Executive Summary
A multimodal cross-evidence investigation was conducted on the reported abnormal vibration of the main drive conveyor. Evidence from 4 independent modalities (Static Imaging, Acoustic Telemetry, High-Speed Video, and OEM Technical Manual) was synthesized. The findings strongly indicate an axial belt misalignment on the driven sheave exceeding OEM limits.

### Evidence Correlation Matrix
- **Image Evidence [ev-vibr-img]:** 4mm axial belt offset visible on drive pulley rim. (Supports - High Impact)
- **Audio Telemetry [ev-vibr-aud]:** 28 Hz harmonic resonance detected. (Supports - High Impact)
- **Video Capture [ev-vibr-vid]:** Dynamic transverse oscillation during rotation. (Supports - High Impact)
- **OEM Documentation [ev-vibr-doc]:** Spec manual verifies tolerance is 2.0mm max. (Supports - High Impact)
- **Technician Note [ev-vibr-txt]:** Sudden onset at 14:30 yesterday. (Context - Medium Impact)

### Contradiction Analysis
**Status:** No contradictions detected. All sensory modalities reinforce the identical mechanical hypothesis.

### Cross-Modal Fusion
The physical offset visible in the photograph directly matches the dynamic wobble captured in video frames and generates the 28 Hz acoustic resonance documented in the manufacturer specifications.

### Target Diagnostic Inquiry
> **Next Best Question:** "Please provide a side-view video or laser alignment measurement of the driven pulley while the machine is operating under normal load."
> **Diagnostic Value:** Differentiates structural motor mount deflection from internal bearing race clearance.

### Recommended Actions
1. **[HIGH]** Implement LOTO procedure and realign driven sheave to <1.5mm tolerance.
2. **[HIGH]** Check belt tension with deflection meter (target: 35-42 N).
3. **[MEDIUM]** Inspect pulley groove surfaces for burrs or asymmetrical groove wear.

---
*Notice: AI-assisted investigation report. Requires licensed field technician verification before physical intervention.*`
    }
  },

  overheating: {
    id: 'demo-overheat-02',
    title: 'Hydraulic Power Unit - Thermal Anomaly Investigation',
    description: 'The machine is overheating, according to urgent floor supervisor dispatch.',
    presetKey: 'overheating',
    evidenceMetadata: [
      {
        id: 'ev-heat-txt',
        modality: 'text',
        originalName: 'shift_dispatch_ticket.txt',
        mimeType: 'text/plain',
        size: 980,
        previewUrl: null,
        description: 'Urgent dispatch ticket stating "Machine hydraulic pack is dangerously overheating."'
      },
      {
        id: 'ev-heat-img',
        modality: 'image',
        originalName: 'digital_gauge_readout.jpg',
        mimeType: 'image/jpeg',
        size: 289000,
        previewUrl: '/demo-assets/digital_gauge_readout.svg',
        description: 'Control panel LCD display showing temperature reading of 41.8°C.'
      },
      {
        id: 'ev-heat-doc',
        modality: 'document',
        originalName: 'Hydraulic_Unit_Datasheet_Rev3.pdf',
        mimeType: 'application/pdf',
        size: 512000,
        previewUrl: '/demo-assets/Hydraulic_Unit_Datasheet_Rev3.pdf',
        description: 'OEM datasheet specifying normal operating temperature between 30°C and 75°C.'
      }
    ],
    aiResult: {
      summary: 'EVIDENCE CONFLICT DETECTED: The reported symptom of "dangerous overheating" directly contradicts empirical sensor evidence shown on the control panel (41.8°C) and OEM manual specifications defining 30°C–75°C as normal baseline.',
      primaryIssue: {
        title: 'Reported Overheating vs. Verified 41.8°C Sensor Readout Discrepancy',
        description: 'Subjective field report claims equipment overheating, but instrumented telemetry shows temperature is 33.2°C BELOW the OEM safety alarm threshold.'
      },
      confidence: {
        score: 42,
        label: 'Low',
        explanation: 'Confidence is constrained to 42% due to direct contradiction between human report text and physical sensor photographic evidence.'
      },
      evidence: [
        {
          id: 'ev-heat-txt',
          modality: 'text',
          observation: 'Technician report asserts "The machine is overheating."',
          type: 'contradicting',
          impact: 'high',
          reason: 'Asserts critical thermal failure condition without providing instrumented data.'
        },
        {
          id: 'ev-heat-img',
          modality: 'image',
          observation: 'Main digital instrument panel displays current temperature as 41.8°C with green status indicator.',
          type: 'supporting',
          impact: 'high',
          reason: 'Empirical sensor readout shows unit is within safe operating range.'
        },
        {
          id: 'ev-heat-doc',
          modality: 'document',
          observation: 'OEM Datasheet Section 2 states: Operating range 30°C–75°C. Warning threshold is 80°C; auto-shutdown trip is 85°C.',
          type: 'supporting',
          impact: 'high',
          reason: 'Confirms 41.8°C is optimal nominal operating temperature.'
        }
      ],
      crossModalReasoning: [
        {
          evidenceIds: ['ev-heat-img', 'ev-heat-doc'],
          reasoning: 'Image shows 41.8°C readout which is fully within the OEM-specified normal operating envelope (30°C to 75°C).'
        },
        {
          evidenceIds: ['ev-heat-txt', 'ev-heat-img', 'ev-heat-doc'],
          reasoning: 'Severe cross-modal divergence: text claims overheating, while instrument panel and OEM specs confirm ideal thermal parameters.'
        }
      ],
      contradictions: [
        {
          sources: ['text (Technician Dispatch)', 'image (Control Panel Gauge)', 'document (OEM Datasheet)'],
          description: 'Technician text claims unit is "overheating", whereas instrument panel photograph shows 41.8°C and manufacturer manual specifies 30°C–75°C as safe nominal operation.',
          severity: 'high'
        }
      ],
      missingEvidence: [
        {
          description: 'Secondary handheld infrared pyrometer or FLIR thermal imaging scan across pump body and manifold.',
          importance: 'high'
        },
        {
          description: 'Telemetry log verifying whether a transient thermal spike occurred earlier in the shift.',
          importance: 'medium'
        }
      ],
      nextBestQuestion: {
        question: 'Please measure the hydraulic fluid reservoir and manifold housing with a calibrated handheld infrared thermometer to confirm whether a localized hot spot exists.',
        reason: 'This distinguishes between a faulty onboard RTD temperature transducer and localized friction heating not captured by the central reservoir sensor.'
      },
      recommendations: [
        {
          action: 'Do NOT initiate emergency shutdown based solely on subjective report; verify with secondary thermal thermometer.',
          priority: 'high',
          reason: 'Instrumented telemetry contradicts the overheating claim; premature shutdown causes unnecessary production downtime.'
        },
        {
          action: 'Perform continuity and 4-20mA calibration test on primary RTD temperature probe.',
          priority: 'medium',
          reason: 'Rule out transducer drift or telemetry wire degradation.'
        },
        {
          action: 'Inspect oil cooler heat exchanger fan and air intake filter for partial obstructions.',
          priority: 'low',
          reason: 'Precautionary check to ensure heat dissipation capacity is maintained.'
        }
      ],
      safetyNote: 'CAUTION: Do not open pressurized hydraulic lines or touch reservoir barehanded. Verify temperature with non-contact infrared instrument first.',
      report: `# FIELDSENSE AI INVESTIGATION REPORT
**Investigation ID:** FS-INV-2026-9042
**Date:** March 2026
**Status:** Completed - Discrepancy Flagged
**Incident:** Hydraulic Power Unit - Thermal Anomaly Investigation

---

### Executive Summary
**CRITICAL EVIDENCE CONTRADICTION DETECTED:** An investigation was launched following a report that the hydraulic unit was overheating. However, cross-modal cross-checking against photographic and documentation evidence revealed a direct contradiction. Photographic evidence of the digital control gauge demonstrates normal temperature (41.8°C), and OEM specifications establish that 41.8°C is well within the normal operating band (30°C–75°C).

### Cross-Modal Contradiction Breakdown
- **Source A (Text):** Claims equipment is overheating.
- **Source B (Image):** Digital gauge indicates 41.8°C with green status indicator.
- **Source C (Document):** Factory manual establishes normal operating baseline as 30°C–75°C (warning trip at 80°C).
- **Synthesis:** The available evidence does NOT support the overheating hypothesis.

### Confidence Rating: 42% (Low)
Confidence is penalized due to diametrically opposing observations between the text report and physical instrumentation.

### Target Diagnostic Inquiry
> **Next Best Question:** "Please measure the hydraulic fluid reservoir and manifold housing with a calibrated handheld infrared thermometer to confirm whether a localized hot spot exists."
> **Diagnostic Value:** Determines whether a localized heat block is bypassing the main reservoir sensor, or if the initial report was erroneous.

### Recommended Actions
1. **[HIGH]** Do not perform emergency halt; cross-verify surface temperatures with handheld infrared pyrometer.
2. **[MEDIUM]** Calibrate central RTD temperature transducer.
3. **[LOW]** Check cooling radiator fins for airborne debris.

---
*Notice: AI-assisted investigation report. Requires licensed field technician verification before physical intervention.*`
    }
  }
};
