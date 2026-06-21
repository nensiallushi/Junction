/**
 * In-memory seeded store — stands in for Postgres while no database is wired.
 * The repository (`server/utils/repository.ts`) reads and mutates these
 * collections; swapping in Drizzle later replaces the repository internals only,
 * not a single server/app model or page.
 *
 * Seeded with realistic clinical data: one public + one private hospital, a
 * handful of clinicians, patients, and studies spanning every status / risk band.
 * A few studies carry full `finding` geometry (normalized 0–1 contours) so the
 * signature viewer has overlays to sync.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import type {
  Analysis,
  ChannelMessage,
  Consult,
  Credential,
  DirectMessage,
  Doctor,
  Finding,
  Image,
  Message,
  Organization,
  Patient,
  Prescription,
  Report,
  RiskScoreHistory,
  Study,
} from "./schema";

const days = (count: number) =>
  new Date(Date.now() - count * 86_400_000).toISOString();
const hours = (count: number) =>
  new Date(Date.now() - count * 3_600_000).toISOString();

// Demo identities the auth context resolves to (no real Better Auth yet).
// The demo session is a hospital_admin so every screen — including the admin-only
// doctor management — is reachable end-to-end; the org-scoping wall stays real.
export const DEMO_ORGANIZATION_ID = "org_helsinki";
export const DEMO_USER_ID = "doc_okafor";

const organizations: Organization[] = [
  {
    id: "org_helsinki",
    name: "QSUT “Nënë Tereza”",
    slug: "qsut-nene-tereza",
    type: "public",
  },
  {
    id: "org_tampere",
    name: "Spitali Universitar i Traumës",
    slug: "spitali-universitar-traumes",
    type: "public",
  },
  {
    id: "org_geraldine",
    name: "Spitali Universitar Obstetrik-Gjinekologjik “Mbretëresha Geraldinë”",
    slug: "su-mbreteresha-geraldine",
    type: "public",
  },
  {
    id: "org_gliozheni",
    name: "Spitali Universitar Obstetrik-Gjinekologjik “Koço Gliozheni”",
    slug: "su-koco-gliozheni",
    type: "public",
  },
  {
    id: "org_ndroqi",
    name: "Spitali Universitar “Shefqet Ndroqi”",
    slug: "su-shefqet-ndroqi",
    type: "public",
  },
  {
    id: "org_pharmacy",
    name: "Farmacia Qendrore",
    slug: "farmacia-qendrore",
    type: "pharmacy",
  },
];

const doctors: Doctor[] = [
  {
    id: "doc_lindgren",
    name: "Dr. Elira Hoxha",
    email: "e.hoxha@spitalint.al",
    role: "radiologist",
    organizationId: "org_helsinki",
    status: "active",
    specialty: "Radiologji torakale",
    avatarUrl: null,
  },
  {
    id: "doc_okafor",
    name: "Dr. Daniel Okafor",
    email: "d.okafor@spitalint.al",
    role: "hospital_admin",
    organizationId: "org_helsinki",
    status: "active",
    specialty: "Radiologji, kryetar reparti",
    avatarUrl: null,
  },
  {
    id: "doc_virtanen",
    name: "Dr. Besnik Shala",
    email: "b.shala@spitalint.al",
    role: "doctor",
    organizationId: "org_helsinki",
    status: "active",
    specialty: "Pulmologji",
    avatarUrl: null,
  },
  {
    id: "doc_haka",
    name: "Dr. Gentian Berisha",
    email: "g.berisha@spitalint.al",
    role: "doctor",
    organizationId: "org_helsinki",
    status: "invited",
    specialty: "Kardiologji",
    avatarUrl: null,
  },
  {
    id: "doc_salo",
    name: "Dr. Teuta Gashi",
    email: "t.gashi@spitalint.al",
    role: "doctor",
    organizationId: "org_helsinki",
    status: "disabled",
    specialty: "Mjekësi interne",
    avatarUrl: null,
  },
  {
    id: "doc_kola",
    name: "Dr. Ardit Kola",
    email: "a.kola@spitalint.al",
    role: "doctor",
    organizationId: "org_helsinki",
    status: "active",
    specialty: "Ortopedi",
    avatarUrl: null,
  },
  {
    id: "doc_dervishi",
    name: "Dr. Suela Dervishi",
    email: "s.dervishi@spitalint.al",
    role: "doctor",
    organizationId: "org_helsinki",
    status: "active",
    specialty: "Neurologji",
    avatarUrl: null,
  },
  {
    id: "doc_pharma",
    name: "Farm. Drita Krasniqi",
    email: "d.krasniqi@farmacia.al",
    role: "pharmacist",
    organizationId: "org_pharmacy",
    status: "active",
    specialty: "Farmaci",
    avatarUrl: null,
  },
];

/**
 * Demo passwords (plaintext — mock only; real auth hashes these). Keyed by
 * doctor id. Only active clinicians can sign in.
 */
export const CREDENTIALS: Record<string, string> = {
  doc_okafor: "daniel123",
  doc_lindgren: "elira123",
  doc_virtanen: "besnik123",
  doc_kola: "ardit123",
  doc_dervishi: "suela123",
  doc_pharma: "farma123",
};

const patients: Patient[] = [
  {
    id: "pat_01",
    organizationId: "org_helsinki",
    mrn: "SNT-204815",
    name: "Erion Meta",
    dateOfBirth: "1958-03-12",
    sex: "male",
  },
  {
    id: "pat_02",
    organizationId: "org_helsinki",
    mrn: "SNT-204816",
    name: "Anisa Leka",
    dateOfBirth: "1971-09-02",
    sex: "female",
  },
  {
    id: "pat_03",
    organizationId: "org_helsinki",
    mrn: "SNT-204817",
    name: "Florian Shehu",
    dateOfBirth: "1990-11-25",
    sex: "male",
  },
  {
    id: "pat_04",
    organizationId: "org_helsinki",
    mrn: "SNT-204818",
    name: "Klajdi Prenga",
    dateOfBirth: "1965-06-30",
    sex: "male",
  },
  {
    id: "pat_05",
    organizationId: "org_helsinki",
    mrn: "SNT-204819",
    name: "Eni Allushi",
    dateOfBirth: "1983-01-19",
    sex: "female",
  },
  {
    id: "pat_06",
    organizationId: "org_helsinki",
    mrn: "SNT-204820",
    name: "Kejda Cani",
    dateOfBirth: "1947-12-08",
    sex: "female",
  },
  {
    id: "pat_07",
    organizationId: "org_helsinki",
    mrn: "SNT-204821",
    name: "Enea Balla",
    dateOfBirth: "2001-04-14",
    sex: "male",
  },
  // patient at another public hospital — reachable via cross-facility lookup (#7).
  {
    id: "pat_ext_01",
    organizationId: "org_tampere",
    mrn: "SRD-880142",
    name: "Erion Meta",
    dateOfBirth: "1958-03-12",
    sex: "male",
  },
];

// ---------------------------------------------------------------------------
// Findings — normalized 0–1 contour geometry over the viewer's coordinate space.
// `displayOrder` drives the Detailed Diagnosis row order; `id` is the hover key.
// ---------------------------------------------------------------------------

const contour = (points: [number, number][]): Finding["geometry"] => ({
  kind: "contour",
  points,
  normalized: true,
});

const findings: Finding[] = [
  // --- Signature study (study_01): chest X-ray, bilateral pneumonia ---
  {
    id: "find_lung",
    analysisId: "ana_01",
    studyId: "study_01",
    imageId: "img_01",
    region: "Fushat pulmonare",
    severity: "critical",
    label: "Pneumoni bilaterale",
    description:
      "Konsolidim i dendur në zonat e poshtme të të dyja fushave pulmonare, më i theksuar në të djathtë. Bronkograme ajrore të dukshme — në përputhje me pneumoni bilaterale.",
    confidence: 0.92,
    displayOrder: 1,
    geometry: contour([
      [0.18, 0.58],
      [0.3, 0.5],
      [0.42, 0.56],
      [0.43, 0.72],
      [0.32, 0.82],
      [0.19, 0.76],
    ]),
  },
  {
    id: "find_heart",
    analysisId: "ana_01",
    studyId: "study_01",
    imageId: "img_01",
    region: "Zemra dhe mediastinumi",
    severity: "moderate",
    label: "Kardiomegali",
    description:
      "Raport kardiotorakal mbi 0.55 me siluetë kardiake të zmadhuar. Pa rrezik të menjëhershëm për jetën — në përputhje me insuficiencë kardiake kronike; rekomandohet konsultë kardiologjike.",
    confidence: 0.74,
    displayOrder: 2,
    geometry: contour([
      [0.4, 0.5],
      [0.56, 0.5],
      [0.62, 0.62],
      [0.56, 0.74],
      [0.42, 0.73],
      [0.38, 0.6],
    ]),
  },
  {
    id: "find_trachea",
    analysisId: "ana_01",
    studyId: "study_01",
    imageId: "img_01",
    region: "Trakeja",
    severity: "moderate",
    label: "Zgjerim i mediastinumit",
    description:
      "Zgjerim i lehtë i mediastinumit me deviacion të lehtë trakeal. Rekomandohet imazheri kontrolli për të përjashtuar shkak vaskular.",
    confidence: 0.61,
    displayOrder: 3,
    geometry: contour([
      [0.47, 0.2],
      [0.53, 0.2],
      [0.54, 0.46],
      [0.46, 0.46],
    ]),
  },
  {
    id: "find_bones",
    analysisId: "ana_01",
    studyId: "study_01",
    imageId: "img_01",
    region: "Kockat",
    severity: "normal",
    label: "Pa anomali kockore",
    description:
      "Brinjët, klavikulat dhe shtylla kurrizore torakale të vizualizuara janë të paprekura. Nuk u zbulua frakturë, lezion litik apo sklerotik.",
    confidence: 0.97,
    displayOrder: 4,
    geometry: contour([
      [0.28, 0.16],
      [0.72, 0.16],
      [0.72, 0.3],
      [0.28, 0.3],
    ]),
  },

  // --- study_04: critical pneumothorax ---
  {
    id: "find_ptx",
    analysisId: "ana_04",
    studyId: "study_04",
    imageId: "img_04",
    region: "Fushat pulmonare",
    severity: "critical",
    label: "Pneumotoraks tensioni",
    description:
      "Pneumotoraks i madh në anën e majtë me zhvendosje të mediastinumit nga e djathta. Mungesë e shenjave pulmonare në zonën e sipërme të majtë — indikohet dekompresim urgjent.",
    confidence: 0.95,
    displayOrder: 1,
    geometry: contour([
      [0.58, 0.28],
      [0.82, 0.3],
      [0.84, 0.6],
      [0.66, 0.66],
      [0.58, 0.5],
    ]),
  },
  {
    id: "find_ptx_heart",
    analysisId: "ana_04",
    studyId: "study_04",
    imageId: "img_04",
    region: "Zemra dhe mediastinumi",
    severity: "moderate",
    label: "Zhvendosje e mediastinumit",
    description:
      "Konturi kardiomediastinal i zhvendosur drejt hemitoraksit të djathtë, dytësor ndaj pneumotoraksit.",
    confidence: 0.8,
    displayOrder: 2,
    geometry: contour([
      [0.5, 0.52],
      [0.64, 0.5],
      [0.66, 0.7],
      [0.52, 0.72],
    ]),
  },

  // --- study_06: moderate nodule ---
  {
    id: "find_nodule",
    analysisId: "ana_06",
    studyId: "study_06",
    imageId: "img_06",
    region: "Fushat pulmonare",
    severity: "moderate",
    label: "Nodul i vetëm pulmonar",
    description:
      "Një nodul 11 mm i mirëkufizuar në lobin e sipërm të djathtë. Pa rrezik të menjëhershëm — rekomandohet kontroll me CT në interval të shkurtër.",
    confidence: 0.69,
    displayOrder: 1,
    geometry: contour([
      [0.24, 0.34],
      [0.3, 0.32],
      [0.32, 0.4],
      [0.26, 0.42],
    ]),
  },
  {
    id: "find_nodule_bones",
    analysisId: "ana_06",
    studyId: "study_06",
    imageId: "img_06",
    region: "Kockat",
    severity: "normal",
    label: "Pa anomali kockore",
    description: "Nuk u zbulua anomali e brinjëve, klavikulës apo vertebrave.",
    confidence: 0.96,
    displayOrder: 2,
    geometry: contour([
      [0.3, 0.18],
      [0.7, 0.18],
      [0.7, 0.3],
      [0.3, 0.3],
    ]),
  },

  // --- study_09: clear chest ---
  {
    id: "find_clear",
    analysisId: "ana_09",
    studyId: "study_09",
    imageId: "img_09",
    region: "Fushat pulmonare",
    severity: "normal",
    label: "Fusha pulmonare të pastra",
    description:
      "Mushkëritë janë të zgjeruara mirë dhe të pastra. Pa konsolidim, efuzion apo pneumotoraks.",
    confidence: 0.98,
    displayOrder: 1,
    geometry: contour([
      [0.2, 0.4],
      [0.8, 0.4],
      [0.8, 0.78],
      [0.2, 0.78],
    ]),
  },
];

const analyses: Analysis[] = [
  {
    id: "ana_01",
    studyId: "study_01",
    status: "complete",
    modelRef: "stub-v0",
    summary: [
      "Pneumoni bilaterale me konsolidim të dendur në të dyja zonat e poshtme pulmonare, më i theksuar në të djathtë.",
      "Siluetë kardiake e zmadhuar në përputhje me insuficiencë kardiake kronike.",
      "Pa anomali kockore; skeleti i vizualizuar është i paprekur.",
    ],
    completedAt: days(1),
    error: null,
  },
  {
    id: "ana_04",
    studyId: "study_04",
    status: "complete",
    modelRef: "stub-v0",
    summary: [
      "Pneumotoraks tensioni i madh në anën e majtë me zhvendosje të mediastinumit — gjetje urgjente.",
      "Strukturat kardiomediastinale të zhvendosura drejt hemitoraksit të djathtë.",
    ],
    completedAt: hours(3),
    error: null,
  },
  {
    id: "ana_06",
    studyId: "study_06",
    status: "complete",
    modelRef: "stub-v0",
    summary: [
      "Nodul i vetëm pulmonar 11 mm në lobin e sipërm të djathtë.",
      "Rekomandohet kontroll me CT në interval të shkurtër; pa anomali tjetër akute.",
    ],
    completedAt: days(2),
    error: null,
  },
  {
    id: "ana_09",
    studyId: "study_09",
    status: "complete",
    modelRef: "stub-v0",
    summary: [
      "Fusha pulmonare të pastra e të zgjeruara mirë, pa proces akut kardiopulmonar.",
    ],
    completedAt: days(4),
    error: null,
  },
];

type StudySeed = {
  id: string;
  patientId: string;
  uploaderId: string;
  modality: Study["modality"];
  bodyPart: string;
  status: Study["status"];
  studyDate: string;
  risk: { value: number; band: Study["riskBand"] } | null;
};

const studySeeds: StudySeed[] = [
  {
    id: "study_01",
    patientId: "pat_01",
    uploaderId: "doc_lindgren",
    modality: "xray",
    bodyPart: "Toraks",
    status: "analyzed",
    studyDate: days(1),
    risk: { value: 88, band: "critical" },
  },
  {
    id: "study_04",
    patientId: "pat_04",
    uploaderId: "doc_lindgren",
    modality: "xray",
    bodyPart: "Toraks",
    status: "analyzed",
    studyDate: hours(3),
    risk: { value: 94, band: "critical" },
  },
  {
    id: "study_06",
    patientId: "pat_02",
    uploaderId: "doc_virtanen",
    modality: "xray",
    bodyPart: "Toraks",
    status: "reported",
    studyDate: days(2),
    risk: { value: 58, band: "moderate" },
  },
  {
    id: "study_09",
    patientId: "pat_03",
    uploaderId: "doc_lindgren",
    modality: "xray",
    bodyPart: "Toraks",
    status: "reported",
    studyDate: days(4),
    risk: { value: 12, band: "low" },
  },
  {
    id: "study_10",
    patientId: "pat_05",
    uploaderId: "doc_lindgren",
    modality: "xray",
    bodyPart: "Toraks",
    status: "analyzing",
    studyDate: hours(1),
    risk: null,
  },
  {
    id: "study_11",
    patientId: "pat_06",
    uploaderId: "doc_virtanen",
    modality: "ct",
    bodyPart: "Toraks",
    status: "queued",
    studyDate: hours(2),
    risk: null,
  },
  {
    id: "study_12",
    patientId: "pat_07",
    uploaderId: "doc_lindgren",
    modality: "xray",
    bodyPart: "Toraks",
    status: "analyzed",
    studyDate: days(3),
    risk: { value: 71, band: "high" },
  },
  {
    id: "study_13",
    patientId: "pat_06",
    uploaderId: "doc_lindgren",
    modality: "xray",
    bodyPart: "Toraks",
    status: "archived",
    studyDate: days(40),
    risk: { value: 22, band: "low" },
  },
];

const studies: Study[] = studySeeds.map((seed) => ({
  id: seed.id,
  organizationId: "org_helsinki",
  patientId: seed.patientId,
  uploaderId: seed.uploaderId,
  modality: seed.modality,
  bodyPart: seed.bodyPart,
  status: seed.status,
  studyDate: seed.studyDate,
  studyInstanceUid: `1.2.840.113619.2.${seed.id}`,
  riskValue: seed.risk?.value ?? null,
  riskBand: seed.risk?.band ?? null,
  rankedAt: seed.risk ? seed.studyDate : null,
  imageUrl: "/sample-xray.svg",
  mediaType: "image",
  fileName: "radiografi-toraks.png",
}));

const images: Image[] = studies.map((study) => ({
  id: `img_${study.id.replace("study_", "")}`,
  studyId: study.id,
  seriesInstanceUid: null,
  sopInstanceUid: null,
  instanceNumber: 1,
  storageUrl: "/sample-xray.svg",
  storageKey: null,
  width: 1000,
  height: 1200,
}));

const riskScoreHistory: RiskScoreHistory[] = studies
  .filter((study) => study.riskValue !== null && study.riskBand !== null)
  .map((study) => ({
    id: `risk_${study.id}`,
    studyId: study.id,
    // biome-ignore lint/style/noNonNullAssertion: filtered to non-null above
    value: study.riskValue!,
    // biome-ignore lint/style/noNonNullAssertion: filtered to non-null above
    band: study.riskBand!,
    modelRef: "stub-v0",
    rankedAt: study.rankedAt ?? study.studyDate,
  }));

const reports: Report[] = [
  {
    id: "rep_06",
    studyId: "study_06",
    authorId: "doc_virtanen",
    status: "finalized",
    body: "Nodul i vetëm 11 mm në lobin e sipërm të djathtë. Rekomandohet CT me dozë të ulët pas 3 muajsh sipas kritereve Fleischner. Pa anomali tjetër akute.",
    finalizedAt: days(2),
  },
  {
    id: "rep_09",
    studyId: "study_09",
    authorId: "doc_lindgren",
    status: "finalized",
    body: "Grafi normale e toraksit. Pa proces akut kardiopulmonar.",
    finalizedAt: days(4),
  },
];

const consults: Consult[] = [
  {
    id: "con_01",
    studyId: "study_01",
    status: "open",
    participantIds: ["doc_lindgren", "doc_virtanen"],
  },
];

const messages: Message[] = [
  {
    id: "msg_01",
    consultId: "con_01",
    authorId: "doc_lindgren",
    authorName: "Dr. Elira Hoxha",
    body: "Po e ndaj këtë grafi toraksi — AI e shënon pneumoninë bilaterale si kritike. Besnik, a mund të japësh mendimin për siluetën kardiake para se ta finalizoj?",
    findingId: null,
    createdAt: days(1),
  },
  {
    id: "msg_02",
    consultId: "con_01",
    authorId: "doc_virtanen",
    authorName: "Dr. Besnik Shala",
    body: "Dakord për konsolidimin. Kardiomegalia më duket kronike, jo akute — do filloja antibiotikët dhe do caktoja një eko si paciente ambulatore.",
    findingId: "find_heart",
    createdAt: hours(20),
  },
];

// Hospital-wide team channel — general clinician chatter, not tied to a study.
const channelMessages: ChannelMessage[] = [
  {
    id: "chan_01",
    organizationId: "org_helsinki",
    authorId: "doc_okafor",
    authorName: "Dr. Daniel Okafor",
    body: "Mirëmëngjes të gjithëve — ri-renditja e AI-së u krye gjatë natës, kështu që lista e punës është e freskët. Dy raste kritike në krye, ju lutem jepuni përparësi.",
    createdAt: hours(6),
  },
  {
    id: "chan_02",
    organizationId: "org_helsinki",
    authorId: "doc_lindgren",
    authorName: "Dr. Elira Hoxha",
    body: "Faleminderit Daniel. E mora rastin e pneumotoraksit — po e shkruaj raportin tani.",
    createdAt: hours(5),
  },
  {
    id: "chan_03",
    organizationId: "org_helsinki",
    authorId: "doc_virtanen",
    authorName: "Dr. Besnik Shala",
    body: "Mund t'i mbuloj rishikimet pulmonare në pritje këtë pasdite. Më shkruani për çdo konsultë që kërkon mendim për toraksin.",
    createdAt: hours(4),
  },
];

// Private 1:1 conversations between two clinicians.
const directMessages: DirectMessage[] = [
  {
    id: "dm_01",
    organizationId: "org_helsinki",
    fromId: "doc_okafor",
    toId: "doc_lindgren",
    body: "Elira, a mund ta finalizosh raportin e pneumotoraksit para orës 14:00?",
    createdAt: hours(3),
  },
  {
    id: "dm_02",
    organizationId: "org_helsinki",
    fromId: "doc_lindgren",
    toId: "doc_okafor",
    body: "Po, po e mbyll tani. Të dërgoj njoftim sapo të jetë gati.",
    createdAt: hours(2),
  },
  {
    id: "dm_03",
    organizationId: "org_helsinki",
    fromId: "doc_virtanen",
    toId: "doc_okafor",
    body: "Daniel, kam një rast me nodul pulmonar që dua ta diskutoj me ty.",
    createdAt: hours(1),
  },
];

/**
 * The mutable in-memory database. Repository methods read and mutate these
 * arrays in place (a `push`/`splice` on a `const` collection is fine — the
 * binding never changes). One Drizzle table will replace each collection.
 */
const prescriptions: Prescription[] = [
  {
    id: "rx_01",
    organizationId: "org_helsinki",
    patientId: "pat_01",
    patientName: "Erion Meta",
    doctorId: "doc_virtanen",
    doctorName: "Dr. Besnik Shala",
    studyId: null,
    medication: "Antibiotik",
    note: "Kurë 7-ditore për infeksion respirator.",
    createdAt: hours(20),
    dispensed: true,
  },
  {
    id: "rx_02",
    organizationId: "org_helsinki",
    patientId: "pat_05",
    patientName: "Eni Allushi",
    doctorId: "doc_lindgren",
    doctorName: "Dr. Elira Hoxha",
    studyId: null,
    medication: "Kortikosteroid",
    note: "Frymëmarrje me inhalator, sipas nevojës.",
    createdAt: hours(6),
    dispensed: false,
  },
];

// Credentials live in the store (not a static map) so registered accounts
// persist and can sign in after a restart. Seeded from CREDENTIALS above.
const credentials: Credential[] = Object.entries(CREDENTIALS).map(
  ([id, password]) => ({ id, password }),
);

export const db = {
  organizations,
  doctors,
  patients,
  credentials,
  studies,
  images,
  analyses,
  findings,
  riskScoreHistory,
  reports,
  consults,
  messages,
  channelMessages,
  directMessages,
  prescriptions,
} as const;

export type Database = typeof db;

// ── File-backed persistence (dev) ───────────────────────────────────────────
// The seed data above is the default. On load we overlay the last saved
// snapshot (adds, edits, deletes, finalized reports), and every mutation
// re-saves — so state survives a server restart. Stored under `.next/cache`
// (git-ignored, outside the file watcher, kept across restarts). Override the
// path with MEDISCAN_DATA_FILE. A real Postgres swap removes this seam entirely.
const SNAPSHOT =
  process.env["MEDISCAN_DATA_FILE"] ??
  join(process.cwd(), ".next", "cache", "mediscan-store.json");

// Bump whenever the seed shape changes — a mismatched snapshot is ignored and
// the new seed data takes over (so new accounts/columns appear after an update).
const SCHEMA_VERSION = 3;

type Snapshot = { __version?: number } & Partial<
  Record<keyof typeof db, { id: string }[]>
>;

const hydrate = (): void => {
  try {
    if (!existsSync(SNAPSHOT)) return;
    const snapshot = JSON.parse(readFileSync(SNAPSHOT, "utf8")) as Snapshot;
    if (snapshot.__version !== SCHEMA_VERSION) return; // stale schema → re-seed
    for (const key of Object.keys(db) as (keyof typeof db)[]) {
      const rows = snapshot[key];
      if (!Array.isArray(rows)) continue;
      const collection = db[key] as unknown as { id: string }[];
      collection.splice(0, collection.length, ...rows);
    }
  } catch {
    // Corrupt / stale snapshot — fall back to the seed data.
  }
};

/** Persist the whole mutable store. Called by the repository after every write. */
export const persist = (): void => {
  try {
    mkdirSync(dirname(SNAPSHOT), { recursive: true });
    writeFileSync(
      SNAPSHOT,
      JSON.stringify({ __version: SCHEMA_VERSION, ...db }),
      "utf8",
    );
  } catch {
    // Best-effort — never fail a request because the snapshot couldn't be written.
  }
};

hydrate();
