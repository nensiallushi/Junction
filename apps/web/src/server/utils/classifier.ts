/**
 * Specialist classifier reads via the local Hugging Face imaging service
 * (`services/imaging`). Routes a few modality + body-part combinations to a
 * pretrained `image-classification` model trained on the matching public
 * dataset, and maps its REAL predictions onto the same `FindingDraft[]` shape
 * the rest of `analyze()` produces:
 *
 *   - Brain MRI  → MRI_BRAIN_MODEL  (e.g. a brain-tumor MRI classifier)
 *   - Breast US  → US_BREAST_MODEL  (e.g. a BUSI benign/malignant classifier)
 *   - Chest CT   → CT_CHEST_MODEL   (e.g. a chest-CT abnormality classifier)
 *
 * Each model id is configurable per env. When the service URL or a model's env
 * var is unset — or the body part doesn't match — the reader returns null and
 * `analyze()` falls back to the modality-specialized vision read.
 *
 * The contour is an anatomical approximation (the model classifies, it doesn't
 * localize); `modelRef` records the exact weights. ASSISTIVE only — never a
 * validated diagnosis.
 */

import type { Modality, Severity } from "@/lib/medical";
import type { Geometry } from "@/server/database/schema";
import type { AnalysisResult, FindingDraft } from "./analysis";
import { score } from "./risk";

const SERVICE_URL = process.env["IMAGING_SERVICE_URL"];
const MRI_BRAIN_MODEL = process.env["MRI_BRAIN_MODEL"];
const US_BREAST_MODEL = process.env["US_BREAST_MODEL"];
const CT_CHEST_MODEL = process.env["CT_CHEST_MODEL"];
const TIMEOUT_MS = 30_000;
const MIN_SCORE = 0.15;
const MAX_FINDINGS = 4;

type Prediction = { label: string; score: number };

const clamp01 = (value: number): number => Math.min(1, Math.max(0, value));
const percent = (value: number): number => Math.round(clamp01(value) * 100);

// The model classifies the whole image — draw a generic central region rather
// than fake a precise contour the model never produced.
const box = (): Geometry => ({
  kind: "contour",
  points: [
    [0.15, 0.15],
    [0.85, 0.15],
    [0.85, 0.85],
    [0.15, 0.85],
  ],
  normalized: true,
});

// "no tumor" / "normal" / "negative" → the image read as clear, regardless of
// how the specific model spells its negative class.
const isNormal = (label: string): boolean => {
  const value = label.toLowerCase().trim();
  return (
    value.includes("notumor") ||
    value.includes("no tumor") ||
    value.includes("no_tumor") ||
    ["normal", "negative", "healthy", "clear", "none", "no"].includes(value)
  );
};

// Map a model's raw class to Albanian + severity. Drops a trailing "tumor(s)"
// so "glioma_tumor" and "glioma" both match. Unknown labels pass through as a
// moderate finding (label shown verbatim).
const labelKey = (label: string): string => {
  const normalized = label.toLowerCase().trim().replace(/\s+/g, "_");
  const stripped = normalized.replace(/_*tumou?rs?$/, "");
  return stripped === "" ? normalized : stripped;
};

const KNOWN: Record<string, { label: string; severity: Severity }> = {
  glioma: { label: "Gliomë", severity: "critical" },
  meningioma: { label: "Meningiomë", severity: "moderate" },
  pituitary: { label: "Tumor i hipofizës", severity: "moderate" },
  malignant: { label: "Lezion malinj", severity: "critical" },
  benign: { label: "Lezion beninj", severity: "moderate" },
  cancer: { label: "Lezion malinj", severity: "critical" },
  nodule: { label: "Nodul", severity: "moderate" },
  pneumonia: { label: "Pneumoni", severity: "critical" },
  // Binary detectors (e.g. brain-tumor "yes"/"no") — "no" is read as clear via
  // isNormal; "yes" / "tumor" / "positive" flag a finding without a type.
  yes: { label: "Gjetje pozitive (tumor i mundshëm)", severity: "moderate" },
  tumor: { label: "Tumor i mundshëm", severity: "moderate" },
  positive: { label: "Gjetje pozitive", severity: "moderate" },
};

const toFinding = (
  prediction: Prediction,
  region: string,
  index: number,
): FindingDraft => {
  const known = KNOWN[labelKey(prediction.label)];
  const label = known?.label ?? prediction.label;
  return {
    region,
    severity: known?.severity ?? "moderate",
    label,
    description: `Klasifikim nga modeli i specializuar: "${label}" (besueshmëria ${percent(prediction.score)}%). Gjetje paraprake nga AI — kërkon konfirmim nga radiologu.`,
    confidence: clamp01(prediction.score),
    displayOrder: index + 1,
    geometry: box(),
  };
};

const clearResult = (
  region: string,
  modelRef: string,
  clearLabel: string,
  confidence: number,
): AnalysisResult => {
  const clear: FindingDraft = {
    region,
    severity: "normal",
    label: clearLabel,
    description:
      "Modeli i specializuar nuk dalloi patologji të qartë mbi pragun. Konfirmo klinikisht.",
    confidence: clamp01(confidence),
    displayOrder: 1,
    geometry: box(),
  };
  return {
    summary: [
      `${clearLabel}.`,
      "Lexim asistues nga modeli — konfirmo klinikisht.",
    ],
    findings: [clear],
    risk: score([clear]),
    modelRef,
  };
};

const buildResult = (
  predictions: Prediction[],
  region: string,
  modelRef: string,
  clearLabel: string,
): AnalysisResult => {
  const top = predictions[0];
  const abnormal = predictions
    .filter(
      (prediction) =>
        !isNormal(prediction.label) && prediction.score >= MIN_SCORE,
    )
    .slice(0, MAX_FINDINGS);
  const [first] = abnormal;

  if (!first || (top && isNormal(top.label))) {
    return clearResult(region, modelRef, clearLabel, top?.score ?? 0.9);
  }

  const findings = abnormal.map((prediction, index) =>
    toFinding(prediction, region, index),
  );
  const lead = toFinding(first, region, 0);
  return {
    summary: [
      `${lead.label} — gjetja me prioritet (besueshmëria ${percent(first.score)}%).`,
      "Gjetje nga modeli i specializuar — konfirmo me lexim.",
    ],
    findings,
    risk: score(findings),
    modelRef,
  };
};

type Target = { model: string; region: string; clear: string };

const matches = (bodyPart: string | undefined, keywords: string[]): boolean =>
  bodyPart !== undefined &&
  keywords.some((keyword) => bodyPart.toLowerCase().includes(keyword));

// Each model is narrow (one body part), so only route when the body part fits.
const BRAIN = ["brain", "tru", "kok", "kafk", "cerebr"];
const BREAST = ["breast", "gji", "mamar"];
const CHEST = [
  "toraks",
  "kraharor",
  "gjoks",
  "mushk",
  "pulmon",
  "chest",
  "lung",
];

const route = (study: {
  modality?: Modality;
  bodyPart?: string;
}): Target | null => {
  switch (true) {
    case study.modality === "mri" &&
      matches(study.bodyPart, BRAIN) &&
      MRI_BRAIN_MODEL !== undefined:
      return {
        model: MRI_BRAIN_MODEL,
        region: "Truri",
        clear: "Tru pa tumor të dukshëm",
      };
    case study.modality === "ultrasound" &&
      matches(study.bodyPart, BREAST) &&
      US_BREAST_MODEL !== undefined:
      return {
        model: US_BREAST_MODEL,
        region: "Gjiri",
        clear: "Pa lezion të dukshëm",
      };
    case study.modality === "ct" &&
      matches(study.bodyPart, CHEST) &&
      CT_CHEST_MODEL !== undefined:
      return {
        model: CT_CHEST_MODEL,
        region: "Toraksi",
        clear: "Pa gjetje të dukshme",
      };
    default:
      return null;
  }
};

const classify = async (
  image: string,
  model: string,
): Promise<Prediction[] | null> => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(`${SERVICE_URL}/classify`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ image, model, top_k: 5 }),
      signal: controller.signal,
    });
    if (!response.ok) return null;
    const data = (await response.json()) as { predictions?: Prediction[] };
    return data.predictions ?? null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
};

export const analyzeWithClassifier = async (study: {
  imageUrl?: string;
  modality?: Modality;
  bodyPart?: string;
}): Promise<AnalysisResult | null> => {
  if (!SERVICE_URL) return null;
  if (!study.imageUrl?.startsWith("data:")) return null;
  const target = route(study);
  if (!target) return null;
  const predictions = await classify(study.imageUrl, target.model);
  if (!predictions || predictions.length === 0) return null;
  return buildResult(
    predictions,
    target.region,
    `hf/${target.model}`,
    target.clear,
  );
};
