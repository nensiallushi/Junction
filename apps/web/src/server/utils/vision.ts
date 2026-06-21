/**
 * General vision read via Claude (claude-opus-4-8). Reads ANY X-ray — including
 * limb / bone fractures the chest-only TorchXRayVision model can't see — and
 * returns the same `FindingDraft[]` shape behind `analyze()`.
 *
 * Runs only when `ANTHROPIC_API_KEY` is set; otherwise returns `null` and the
 * caller falls back to the chest model / template. Forces a structured read via
 * a tool call. This is an ASSISTIVE read for a doctor, never a diagnosis.
 */

import Anthropic from "@anthropic-ai/sdk";
import type { Modality, Severity } from "@/lib/medical";
import type { Geometry } from "@/server/database/schema";
import type { AnalysisResult, FindingDraft } from "./analysis";
import { score } from "./risk";

const API_KEY = process.env["ANTHROPIC_API_KEY"];
const MODEL = "claude-opus-4-8";
const MAX_FINDINGS = 6;

const IMAGE_MIME = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
] as const;
type ImageMime = (typeof IMAGE_MIME)[number];
const isImageMime = (value: string): value is ImageMime =>
  (IMAGE_MIME as readonly string[]).includes(value);

const SEVERITIES = ["critical", "moderate", "normal"] as const;
const isSeverity = (value: unknown): value is Severity =>
  (SEVERITIES as readonly unknown[]).includes(value);

const clamp01 = (value: number): number => Math.min(1, Math.max(0, value));

const parseDataUrl = (url: string): { mime: string; data: string } | null => {
  const match = /^data:([^;]+);base64,(.+)$/s.exec(url);
  return match ? { mime: match[1] ?? "", data: match[2] ?? "" } : null;
};

type VisionFinding = {
  region?: string;
  label?: string;
  description?: string;
  severity?: string;
  confidence?: number;
  box?: { x: number; y: number; w: number; h: number };
};
type VisionRead = { summary?: string[]; findings?: VisionFinding[] };

const TOOL: Anthropic.Tool = {
  name: "report_findings",
  description: "Report the radiology findings from the image.",
  input_schema: {
    type: "object",
    additionalProperties: false,
    required: ["summary", "findings"],
    properties: {
      summary: { type: "array", items: { type: "string" } },
      findings: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: [
            "region",
            "label",
            "description",
            "severity",
            "confidence",
            "box",
          ],
          properties: {
            region: { type: "string" },
            label: { type: "string" },
            description: { type: "string" },
            severity: {
              type: "string",
              enum: ["critical", "moderate", "normal"],
            },
            confidence: { type: "number" },
            box: {
              type: "object",
              additionalProperties: false,
              required: ["x", "y", "w", "h"],
              properties: {
                x: { type: "number" },
                y: { type: "number" },
                w: { type: "number" },
                h: { type: "number" },
              },
            },
          },
        },
      },
    },
  },
};

// Per-modality guidance so the read targets the right findings + states limits.
const MODALITY_GUIDANCE: Record<Modality, string> = {
  xray: "This is a 2D X-ray / radiograph. Focus on: fractures, dislocations, joint effusions, consolidation / pneumonia, pleural effusion, pneumothorax, cardiomegaly, masses or nodules, bone lesions, and foreign bodies.",
  ct: "This is a SINGLE SLICE of a CT scan — the full 3D volume is not available, so your read is limited to what this one slice shows. Focus on: masses / lesions, haemorrhage, infarcts, fluid collections, organ enlargement, fractures, and free air. State clearly that only one slice is visible and a full read needs the whole series.",
  mri: "This is a SINGLE SLICE of an MRI — the full sequence is not available. Focus on: tumours / lesions, oedema, haemorrhage, demyelination, and structural / joint / disc abnormalities visible on this slice. Note that this is one slice and the read is limited.",
  ultrasound: `This is an ultrasound still image, which is highly view- and operator-dependent. Focus on: masses, cysts, fluid collections / effusions, gallstones, and organ size or echotexture changes. Be conservative — a still ultrasound is hard to read; prefer "normal" unless a finding is clearly visible.`,
  other:
    "This is a medical image of unspecified modality. Identify any clearly visible abnormality and be conservative.",
};

const systemFor = (modality: Modality): string =>
  `You are a radiology assistant helping a doctor triage medical images.
${MODALITY_GUIDANCE[modality]}
Report only the MAJOR, clearly visible findings — do not invent subtle or uncertain ones.
For each finding give: region (in Albanian), label (a short Albanian term, e.g. "Frakturë e radiusit"), description (one Albanian sentence), severity ("critical" for acute / urgent findings, "moderate" for non-urgent abnormalities, "normal" only for incidental), confidence (0-1), and a normalized bounding box (x,y = top-left, w,h = size; all 0-1 relative to the image).
Also give 2-4 short Albanian summary bullets. If the image looks clearly normal, return an empty findings array and a summary saying it looks clear.
This is an ASSISTIVE read for a doctor, NOT a diagnosis. Always answer by calling the report_findings tool.`;

const boxToGeometry = (box: VisionFinding["box"]): Geometry => {
  const safe = box ?? { x: 0.3, y: 0.3, w: 0.4, h: 0.4 };
  const x = clamp01(safe.x);
  const y = clamp01(safe.y);
  const x2 = clamp01(safe.x + safe.w);
  const y2 = clamp01(safe.y + safe.h);
  return {
    kind: "contour",
    points: [
      [x, y],
      [x2, y],
      [x2, y2],
      [x, y2],
    ],
    normalized: true,
  };
};

const CLEAR: FindingDraft = {
  region: "Përgjithshëm",
  severity: "normal",
  label: "Pa gjetje madhore",
  description: "AI nuk dalloi gjetje madhore në imazh. Konfirmo me lexim.",
  confidence: 0.9,
  displayOrder: 1,
  geometry: {
    kind: "contour",
    points: [
      [0.2, 0.2],
      [0.8, 0.2],
      [0.8, 0.8],
      [0.2, 0.8],
    ],
    normalized: true,
  },
};

export const analyzeWithVision = async (study: {
  imageUrl?: string;
  modality?: Modality;
  bodyPart?: string;
}): Promise<AnalysisResult | null> => {
  if (!API_KEY) return null;
  if (!study.imageUrl?.startsWith("data:")) return null;
  const decoded = parseDataUrl(study.imageUrl);
  if (!decoded) return null;
  const { mime, data } = decoded;
  if (!isImageMime(mime)) return null;

  const modality: Modality = study.modality ?? "other";

  try {
    const client = new Anthropic();
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 4096,
      tools: [TOOL],
      tool_choice: { type: "tool", name: "report_findings" },
      system: systemFor(modality),
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: { type: "base64", media_type: mime, data },
            },
            {
              type: "text",
              text: `Pjesa e trupit: ${study.bodyPart ?? "e panjohur"}. Modaliteti: ${modality}. Lexo imazhin dhe raporto gjetjet kryesore.`,
            },
          ],
        },
      ],
    });

    const toolUse = response.content.find((block) => block.type === "tool_use");
    if (!toolUse || toolUse.type !== "tool_use") return null;
    const read = toolUse.input as VisionRead;

    const ranked = (read.findings ?? [])
      .filter((finding) => typeof finding?.label === "string")
      .sort((a, b) => (b.confidence ?? 0) - (a.confidence ?? 0))
      .slice(0, MAX_FINDINGS);

    const findings: FindingDraft[] =
      ranked.length === 0
        ? [CLEAR]
        : ranked.map((finding, index) => ({
            region: finding.region || "Përgjithshëm",
            severity: isSeverity(finding.severity)
              ? finding.severity
              : "moderate",
            label: finding.label ?? "Gjetje",
            description: finding.description || (finding.label ?? "Gjetje"),
            confidence: clamp01(Number(finding.confidence) || 0.6),
            displayOrder: index + 1,
            geometry: boxToGeometry(finding.box),
          }));

    const summary =
      Array.isArray(read.summary) && read.summary.length > 0
        ? read.summary
        : ["Lexim me AI — gjetjet kryesore u shënuan mbi imazh."];

    return {
      summary,
      findings,
      risk: score(findings),
      modelRef: `claude-opus-4-8-vision/${modality}`,
    };
  } catch {
    return null;
  }
};
