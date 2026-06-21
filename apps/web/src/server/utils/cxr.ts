/**
 * Real chest-X-ray read via the local TorchXRayVision service (`services/cxr`).
 *
 * `analyzeWithCxr(study)` POSTs the uploaded image to the model service, then
 * maps its REAL per-pathology probabilities onto the same `FindingDraft[]` the
 * stub produces — so `Analysis.ingest`, the viewer and the worklist are
 * unchanged. The pathology PROBABILITY is the model's actual output; the
 * contour is an anatomical approximation (localization v1 — precise heatmaps
 * are a later upgrade).
 *
 * Returns `null` (→ caller falls back to the template read) when:
 *   - `CXR_SERVICE_URL` is unset,
 *   - the study isn't a real uploaded image (data URL) chest X-ray, or
 *   - the service errors / times out.
 *
 * This is an ASSISTIVE read, never a validated diagnosis — `modelRef` records
 * the exact weights so it's always traceable.
 */

import type { Modality, Severity } from "@/lib/medical";
import type { Geometry } from "@/server/database/schema";
import type { AnalysisResult, FindingDraft } from "./analysis";
import { score } from "./risk";

const SERVICE_URL = process.env["CXR_SERVICE_URL"];
const THRESHOLD = (() => {
  const parsed = Number(process.env["CXR_THRESHOLD"]);
  // TorchXRayVision probabilities run low even for real findings — 0.3 surfaces
  // major signs (incl. rib fractures) without drowning in noise. Override with
  // CXR_THRESHOLD if you want it stricter/looser.
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0.3;
})();
const TIMEOUT_MS = 25_000;
const MODEL_REF = "torchxrayvision/densenet121-res224-all";
const MAX_FINDINGS = 5;

const contour = (points: [number, number][]): Geometry => ({
  kind: "contour",
  points,
  normalized: true,
});

// Reusable anatomical regions on a frontal chest X-ray (normalized 0–1, y down).
const GEOMETRY = {
  lungRightLower: contour([
    [0.2, 0.55],
    [0.33, 0.5],
    [0.43, 0.58],
    [0.41, 0.75],
    [0.26, 0.8],
    [0.18, 0.68],
  ]),
  lungBilateral: contour([
    [0.2, 0.42],
    [0.8, 0.42],
    [0.8, 0.78],
    [0.2, 0.78],
  ]),
  lungUpper: contour([
    [0.22, 0.3],
    [0.78, 0.3],
    [0.78, 0.46],
    [0.22, 0.46],
  ]),
  costophrenic: contour([
    [0.18, 0.7],
    [0.42, 0.7],
    [0.42, 0.82],
    [0.18, 0.82],
  ]),
  apex: contour([
    [0.6, 0.28],
    [0.8, 0.28],
    [0.8, 0.45],
    [0.6, 0.45],
  ]),
  focal: contour([
    [0.3, 0.34],
    [0.37, 0.32],
    [0.39, 0.4],
    [0.31, 0.42],
  ]),
  heart: contour([
    [0.42, 0.52],
    [0.6, 0.52],
    [0.62, 0.72],
    [0.44, 0.74],
  ]),
  mediastinum: contour([
    [0.43, 0.32],
    [0.57, 0.32],
    [0.58, 0.56],
    [0.42, 0.56],
  ]),
  ribs: contour([
    [0.2, 0.4],
    [0.32, 0.38],
    [0.34, 0.5],
    [0.22, 0.52],
  ]),
} satisfies Record<string, Geometry>;

type PathologyConfig = {
  label: string;
  region: string;
  severity: Severity;
  geometry: Geometry;
};

// TorchXRayVision pathology → Albanian finding. `region` matches the keys in
// `lib/medical` SPECIALTY_BY_REGION so suggested specialists derive correctly.
const PATHOLOGY: Record<string, PathologyConfig> = {
  Pneumonia: {
    label: "Pneumoni",
    region: "Fushat pulmonare",
    severity: "critical",
    geometry: GEOMETRY.lungRightLower,
  },
  Consolidation: {
    label: "Konsolidim",
    region: "Fushat pulmonare",
    severity: "critical",
    geometry: GEOMETRY.lungRightLower,
  },
  Effusion: {
    label: "Efuzion pleural",
    region: "Fushat pulmonare",
    severity: "critical",
    geometry: GEOMETRY.costophrenic,
  },
  Pneumothorax: {
    label: "Pneumotoraks",
    region: "Fushat pulmonare",
    severity: "critical",
    geometry: GEOMETRY.apex,
  },
  Edema: {
    label: "Edemë pulmonare",
    region: "Fushat pulmonare",
    severity: "critical",
    geometry: GEOMETRY.lungBilateral,
  },
  Mass: {
    label: "Masë",
    region: "Fushat pulmonare",
    severity: "critical",
    geometry: GEOMETRY.focal,
  },
  Nodule: {
    label: "Nodul pulmonar",
    region: "Fushat pulmonare",
    severity: "moderate",
    geometry: GEOMETRY.focal,
  },
  Atelectasis: {
    label: "Atelektazë",
    region: "Fushat pulmonare",
    severity: "moderate",
    geometry: GEOMETRY.lungRightLower,
  },
  Infiltration: {
    label: "Infiltrim",
    region: "Fushat pulmonare",
    severity: "moderate",
    geometry: GEOMETRY.lungBilateral,
  },
  "Lung Opacity": {
    label: "Errësim pulmonar",
    region: "Fushat pulmonare",
    severity: "moderate",
    geometry: GEOMETRY.lungBilateral,
  },
  "Lung Lesion": {
    label: "Lezion pulmonar",
    region: "Fushat pulmonare",
    severity: "moderate",
    geometry: GEOMETRY.focal,
  },
  Emphysema: {
    label: "Emfizemë",
    region: "Fushat pulmonare",
    severity: "moderate",
    geometry: GEOMETRY.lungUpper,
  },
  Fibrosis: {
    label: "Fibrozë",
    region: "Fushat pulmonare",
    severity: "moderate",
    geometry: GEOMETRY.lungBilateral,
  },
  Pleural_Thickening: {
    label: "Trashje pleurale",
    region: "Fushat pulmonare",
    severity: "moderate",
    geometry: GEOMETRY.costophrenic,
  },
  Cardiomegaly: {
    label: "Kardiomegali",
    region: "Zemra dhe mediastinumi",
    severity: "moderate",
    geometry: GEOMETRY.heart,
  },
  "Enlarged Cardiomediastinum": {
    label: "Zgjerim i mediastinumit",
    region: "Zemra dhe mediastinumi",
    severity: "moderate",
    geometry: GEOMETRY.mediastinum,
  },
  Fracture: {
    label: "Frakturë",
    region: "Kockat",
    severity: "moderate",
    geometry: GEOMETRY.ribs,
  },
  Hernia: {
    label: "Hernie",
    region: "Indet e buta",
    severity: "moderate",
    geometry: GEOMETRY.lungBilateral,
  },
};

const CLEAR: FindingDraft = {
  region: "Fushat pulmonare",
  severity: "normal",
  label: "Fusha pulmonare të pastra",
  description:
    "Modeli nuk dalloi gjetje patologjike mbi pragun e besueshmërisë. Fushat pulmonare duken të pastra.",
  confidence: 0.9,
  displayOrder: 1,
  geometry: GEOMETRY.lungBilateral,
};

const round2 = (value: number): number => Math.round(value * 100) / 100;
const percent = (value: number): number => Math.round(value * 100);

const summarize = (findings: FindingDraft[]): string[] => {
  const lead = findings[0];
  if (!lead || lead.severity === "normal") {
    return [
      "Fusha pulmonare të pastra — modeli nuk dalloi gjetje patologjike mbi pragun.",
      "Pa shenja akute kardiopulmonare. Lexim klinik për konfirmim.",
    ];
  }
  const rest = findings.slice(1);
  return [
    `${lead.label} — gjetja me prioritet (besueshmëria ${percent(lead.confidence)}%).`,
    ...rest.map(
      (finding) => `${finding.label} (${percent(finding.confidence)}%).`,
    ),
    "Renditja e rrezikut u përcaktua nga gjetja më e rëndë — konfirmo me lexim.",
  ];
};

const buildResult = (pathologies: Record<string, number>): AnalysisResult => {
  const abnormal = Object.entries(pathologies)
    .map(([name, probability]) => ({ config: PATHOLOGY[name], probability }))
    .filter(
      (entry): entry is { config: PathologyConfig; probability: number } =>
        entry.config !== undefined && entry.probability >= THRESHOLD,
    )
    .sort((a, b) => b.probability - a.probability)
    .slice(0, MAX_FINDINGS);

  const findings: FindingDraft[] =
    abnormal.length === 0
      ? [CLEAR]
      : abnormal.map((entry, index) => ({
          region: entry.config.region,
          severity: entry.config.severity,
          label: entry.config.label,
          description: `Sinjal i "${entry.config.label.toLowerCase()}" i dalluar nga modeli në ${entry.config.region.toLowerCase()} (besueshmëria ${percent(entry.probability)}%). Gjetje paraprake nga AI — kërkon konfirmim nga radiologu.`,
          confidence: round2(entry.probability),
          displayOrder: index + 1,
          geometry: entry.config.geometry,
        }));

  return {
    summary: summarize(findings),
    findings,
    risk: score(findings),
    modelRef: MODEL_REF,
  };
};

// TorchXRayVision is trained on CHEST radiographs only — don't run it on
// limb / spine / other X-rays (it would hallucinate chest pathologies there).
const CHEST = [
  "toraks",
  "kraharor",
  "gjoks",
  "mushk",
  "pulmon",
  "chest",
  "lung",
];
const isChest = (bodyPart?: string): boolean =>
  bodyPart !== undefined &&
  CHEST.some((keyword) => bodyPart.toLowerCase().includes(keyword));

export const analyzeWithCxr = async (study: {
  imageUrl?: string;
  modality?: Modality;
  bodyPart?: string;
}): Promise<AnalysisResult | null> => {
  if (!SERVICE_URL) return null;
  // Only real uploads (data URLs); the model is chest-X-ray-only.
  if (!study.imageUrl?.startsWith("data:")) return null;
  if (study.modality && study.modality !== "xray") return null;
  if (!isChest(study.bodyPart)) return null;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(`${SERVICE_URL}/analyze`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ image: study.imageUrl }),
      signal: controller.signal,
    });
    if (!response.ok) return null;
    const data = (await response.json()) as {
      pathologies?: Record<string, number>;
    };
    if (!data.pathologies) return null;
    return buildResult(data.pathologies);
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
};
