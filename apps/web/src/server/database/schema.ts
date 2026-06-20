/**
 * Canonical persistence model for the AI Health Platform (docs/ROADMAP.md Part B).
 *
 * Expressed here as Zod schemas + inferred types — the single source of truth the
 * in-memory store (`store.ts`), the server/app models and the forms all build on.
 * Each schema maps 1:1 to its eventual Drizzle `pgTable`; swapping the in-memory
 * store for Drizzle + Postgres later is a repository-internal change only.
 *
 * Key trade-offs (decided, ROADMAP Part B):
 *  - risk lives on `study` (+ an append-only `riskScoreHistory`), not a 1:1 side
 *    table — the worklist sorts with no join (the hottest read path);
 *  - `finding.geometry` is normalized 0–1 jsonb (not PostGIS/bbox) because overlays
 *    are rendered, never spatially queried;
 *  - `patient.mrn` is unique per-org — cross-facility identity is a future matching
 *    problem, not a shared key.
 */

import { z } from "zod";
import {
  CONSULT_STATUS,
  DOCTOR_STATUS,
  MEDIA_TYPE,
  MODALITY,
  ORG_TYPE,
  REPORT_STATUS,
  RISK_BAND,
  ROLE,
  SEVERITY,
  SEX,
  STUDY_STATUS,
} from "@/lib/medical";

export const geometrySchema = z.object({
  kind: z.enum(["contour", "bbox"]),
  points: z.array(z.tuple([z.number(), z.number()])),
  normalized: z.literal(true),
});

/** Hospital — `type` drives cross-facility record sharing (#7). */
export const organizationSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  type: z.enum(ORG_TYPE),
});

/** Better Auth `user`, extended with clinical role + org binding. */
export const doctorSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  role: z.enum(ROLE),
  organizationId: z.string(),
  status: z.enum(DOCTOR_STATUS),
  specialty: z.string().nullable(),
  avatarUrl: z.string().nullable(),
});

export const patientSchema = z.object({
  id: z.string(),
  organizationId: z.string(),
  // the human "ID" — unique per organization.
  mrn: z.string(),
  name: z.string(),
  dateOfBirth: z.string(),
  sex: z.enum(SEX),
});

/** The "case" — the generalized single-X-ray screen. Carries risk columns. */
export const studySchema = z.object({
  id: z.string(),
  organizationId: z.string(),
  patientId: z.string(),
  uploaderId: z.string(),
  modality: z.enum(MODALITY),
  bodyPart: z.string(),
  status: z.enum(STUDY_STATUS),
  studyDate: z.string(),
  // PACS triple: study-UID here, series/SOP on `image` (nullable until DICOM ingest).
  studyInstanceUid: z.string().nullable(),
  riskValue: z.number().nullable(),
  riskBand: z.enum(RISK_BAND).nullable(),
  rankedAt: z.string().nullable(),
  // primary rendered media (UploadThing storageUrl today, DICOM frame later).
  imageUrl: z.string(),
  mediaType: z.enum(MEDIA_TYPE),
  fileName: z.string(),
});

export const imageSchema = z.object({
  id: z.string(),
  studyId: z.string(),
  seriesInstanceUid: z.string().nullable(),
  sopInstanceUid: z.string().nullable(),
  instanceNumber: z.number().nullable(),
  storageUrl: z.string(),
  storageKey: z.string().nullable(),
  width: z.number().nullable(),
  height: z.number().nullable(),
});

/** AI preliminary read (1:1 with study). Kept distinct from the doctor's report. */
export const analysisSchema = z.object({
  id: z.string(),
  studyId: z.string(),
  status: z.enum(["pending", "complete", "failed"]),
  modelRef: z.string(),
  // "Conclusions" bullet points.
  summary: z.array(z.string()),
  completedAt: z.string().nullable(),
  error: z.string().nullable(),
});

/** `finding.id` is the hover join key between the diagnosis row and the overlay. */
export const findingSchema = z.object({
  id: z.string(),
  analysisId: z.string(),
  studyId: z.string(),
  imageId: z.string().nullable(),
  region: z.string(),
  severity: z.enum(SEVERITY),
  // the linked medical term (rendered with the rust link treatment).
  label: z.string(),
  description: z.string(),
  confidence: z.number(),
  displayOrder: z.number(),
  geometry: geometrySchema,
});

/** Append-only audit of every (re-)ranking (#4). */
export const riskScoreHistorySchema = z.object({
  id: z.string(),
  studyId: z.string(),
  value: z.number(),
  band: z.enum(RISK_BAND),
  modelRef: z.string(),
  rankedAt: z.string(),
});

/** The doctor's finalized report — distinct from `analysis.summary` for liability. */
export const reportSchema = z.object({
  id: z.string(),
  studyId: z.string(),
  authorId: z.string(),
  status: z.enum(REPORT_STATUS),
  body: z.string(),
  finalizedAt: z.string().nullable(),
});

export const consultSchema = z.object({
  id: z.string(),
  studyId: z.string(),
  status: z.enum(CONSULT_STATUS),
  participantIds: z.array(z.string()),
});

export const messageSchema = z.object({
  id: z.string(),
  consultId: z.string(),
  authorId: z.string(),
  authorName: z.string(),
  body: z.string(),
  // a second opinion can cite a specific region.
  findingId: z.string().nullable(),
  createdAt: z.string(),
});

/** Hospital-wide team channel — general clinician communication (not per-study). */
export const channelMessageSchema = z.object({
  id: z.string(),
  organizationId: z.string(),
  authorId: z.string(),
  authorName: z.string(),
  body: z.string(),
  createdAt: z.string(),
});

/** Direct (1:1) message between two clinicians of the same organization. */
export const directMessageSchema = z.object({
  id: z.string(),
  organizationId: z.string(),
  fromId: z.string(),
  toId: z.string(),
  body: z.string(),
  createdAt: z.string(),
});

export type Geometry = z.infer<typeof geometrySchema>;
export type Organization = z.infer<typeof organizationSchema>;
export type Doctor = z.infer<typeof doctorSchema>;
export type Patient = z.infer<typeof patientSchema>;
export type Study = z.infer<typeof studySchema>;
export type Image = z.infer<typeof imageSchema>;
export type Analysis = z.infer<typeof analysisSchema>;
export type Finding = z.infer<typeof findingSchema>;
export type RiskScoreHistory = z.infer<typeof riskScoreHistorySchema>;
export type Report = z.infer<typeof reportSchema>;
export type Consult = z.infer<typeof consultSchema>;
export type Message = z.infer<typeof messageSchema>;
export type ChannelMessage = z.infer<typeof channelMessageSchema>;
export type DirectMessage = z.infer<typeof directMessageSchema>;
