/**
 * AI analysis stub seam (ROADMAP Part C).
 *
 * `analyze(study)` returns a DESIGN-style read — conclusions + findings with
 * normalized 0–1 contour geometry + a risk score. The `analysis` model never
 * imports a provider directly: it calls this, then persists. A real Azure AI
 * SDK + DICOM ingest swaps in behind the same signature later.
 *
 * Coordinates MUST stay normalized 0–1 — zoom / responsive panels desync the
 * overlay from the image otherwise (ROADMAP "Risks", point 2).
 */

import type { Severity } from "@/lib/medical";
import type { Geometry, RiskScoreHistory } from "@/server/database/schema";
import { score } from "./risk";

export type FindingDraft = {
  region: string;
  severity: Severity;
  label: string;
  description: string;
  confidence: number;
  displayOrder: number;
  geometry: Geometry;
};

export type AnalysisResult = {
  summary: string[];
  findings: FindingDraft[];
  risk: { value: number; band: RiskScoreHistory["band"] };
  modelRef: string;
};

const contour = (points: [number, number][]): Geometry => ({
  kind: "contour",
  points,
  normalized: true,
});

const TEMPLATES: { summary: string[]; findings: FindingDraft[] }[] = [
  {
    summary: [
      "Konsolidim njollor në zonën e poshtme të djathtë pulmonare — sugjeron pneumoni.",
      "Siluetë kardiake brenda kufijve normalë.",
      "Nuk u zbulua anomali kockore.",
    ],
    findings: [
      {
        region: "Fushat pulmonare",
        severity: "critical",
        label: "Konsolidim i lobit të poshtëm të djathtë",
        description:
          "Opacifikim i hapësirës ajrore në zonën e poshtme të djathtë me bronkograme ajrore — në përputhje me pneumoni.",
        confidence: 0.88,
        displayOrder: 1,
        geometry: contour([
          [0.2, 0.56],
          [0.32, 0.5],
          [0.42, 0.58],
          [0.4, 0.74],
          [0.26, 0.8],
          [0.19, 0.68],
        ]),
      },
      {
        region: "Zemra dhe mediastinumi",
        severity: "normal",
        label: "Siluetë kardiake normale",
        description:
          "Raport kardiotorakal brenda kufijve normalë. Pa zgjerim të mediastinumit.",
        confidence: 0.83,
        displayOrder: 2,
        geometry: contour([
          [0.42, 0.52],
          [0.58, 0.52],
          [0.6, 0.7],
          [0.44, 0.72],
        ]),
      },
      {
        region: "Kockat",
        severity: "normal",
        label: "Pa anomali kockore",
        description:
          "Brinjët, klavikulat dhe shtylla kurrizore torakale të paprekura.",
        confidence: 0.95,
        displayOrder: 3,
        geometry: contour([
          [0.3, 0.18],
          [0.7, 0.18],
          [0.7, 0.3],
          [0.3, 0.3],
        ]),
      },
    ],
  },
  {
    summary: [
      "Nodul i vetëm i mirëkufizuar në lobin e sipërm të djathtë.",
      "Pa konsolidim, efuzion apo pneumotoraks.",
      "Rekomandohet kontroll me CT në interval të shkurtër.",
    ],
    findings: [
      {
        region: "Fushat pulmonare",
        severity: "moderate",
        label: "Nodul i vetëm pulmonar",
        description:
          "Një nodul i mirëkufizuar në lobin e sipërm të djathtë. Pa rrezik të menjëhershëm — këshillohet kontroll me CT në interval të shkurtër.",
        confidence: 0.66,
        displayOrder: 1,
        geometry: contour([
          [0.26, 0.34],
          [0.32, 0.32],
          [0.34, 0.4],
          [0.28, 0.42],
        ]),
      },
      {
        region: "Kockat",
        severity: "normal",
        label: "Pa anomali kockore",
        description:
          "Nuk u zbulua anomali e brinjëve, klavikulës apo vertebrave.",
        confidence: 0.96,
        displayOrder: 2,
        geometry: contour([
          [0.3, 0.18],
          [0.7, 0.18],
          [0.7, 0.3],
          [0.3, 0.3],
        ]),
      },
    ],
  },
  {
    summary: [
      "Fusha pulmonare të pastra e të zgjeruara mirë.",
      "Pa proces akut kardiopulmonar.",
    ],
    findings: [
      {
        region: "Fushat pulmonare",
        severity: "normal",
        label: "Fusha pulmonare të pastra",
        description:
          "Mushkëritë janë të pastra dhe të zgjeruara mirë. Pa konsolidim, efuzion apo pneumotoraks.",
        confidence: 0.97,
        displayOrder: 1,
        geometry: contour([
          [0.2, 0.4],
          [0.8, 0.4],
          [0.8, 0.78],
          [0.2, 0.78],
        ]),
      },
    ],
  },
];

const pick = (seed: string): (typeof TEMPLATES)[number] => {
  const sum = [...seed].reduce(
    (accumulator, character) => accumulator + character.charCodeAt(0),
    0,
  );
  // modulo guarantees a valid index — assert past noUncheckedIndexedAccess
  return TEMPLATES[sum % TEMPLATES.length] as (typeof TEMPLATES)[number];
};

export const analyze = async (study: {
  id: string;
}): Promise<AnalysisResult> => {
  const template = pick(study.id);
  return {
    summary: template.summary,
    findings: template.findings,
    risk: score(template.findings),
    modelRef: "stub-v0",
  };
};
