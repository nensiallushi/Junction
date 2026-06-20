/**
 * Canonical medical domain literals, unions and pure helpers.
 *
 * Defined once here (client-safe — no server imports) and reused for:
 *  - the persistence model (`server/database/schema.ts` builds its Zod enums
 *    from these arrays),
 *  - form validators (`z.enum(MODALITY)` …),
 *  - the viewer + worklist severity encoding (color + shape + icon).
 *
 * Supersedes the inline types the original `diagnosis-data.ts` demo carried.
 * See docs/DESIGN.md §2.4 (severity palette) and docs/ROADMAP.md Part B.
 */

// `severity` maps 1:1 to the error / warning / success semantic tokens.
export const SEVERITY = ["critical", "moderate", "normal"] as const;
export type Severity = (typeof SEVERITY)[number];

export const MODALITY = ["xray", "ct", "mri", "ultrasound", "other"] as const;
export type Modality = (typeof MODALITY)[number];

// How an uploaded study renders in the viewer.
export const MEDIA_TYPE = ["image", "video", "pdf", "other"] as const;
export type MediaType = (typeof MEDIA_TYPE)[number];

export const mediaTypeFor = (mime: string): MediaType => {
  switch (true) {
    case mime.startsWith("image/"):
      return "image";
    case mime.startsWith("video/"):
      return "video";
    case mime === "application/pdf":
      return "pdf";
    default:
      return "other";
  }
};

export const STUDY_STATUS = [
  "queued",
  "analyzing",
  "analyzed",
  "reported",
  "archived",
] as const;
export type StudyStatus = (typeof STUDY_STATUS)[number];

// Risk ranking is 4-tier (finer than the 3-tier severity palette) but collapses
// onto the same color buckets for the chip — see `riskBandToken`.
export const RISK_BAND = ["critical", "high", "moderate", "low"] as const;
export type RiskBand = (typeof RISK_BAND)[number];

export const ROLE = ["hospital_admin", "radiologist", "doctor"] as const;
export type Role = (typeof ROLE)[number];

export const ORG_TYPE = ["public", "private"] as const;
export type OrgType = (typeof ORG_TYPE)[number];

export const REPORT_STATUS = ["draft", "finalized", "amended"] as const;
export type ReportStatus = (typeof REPORT_STATUS)[number];

export const CONSULT_STATUS = ["open", "resolved"] as const;
export type ConsultStatus = (typeof CONSULT_STATUS)[number];

export const SEX = ["male", "female", "other"] as const;
export type Sex = (typeof SEX)[number];

export const DOCTOR_STATUS = ["active", "invited", "disabled"] as const;
export type DoctorStatus = (typeof DOCTOR_STATUS)[number];

// ---------------------------------------------------------------------------
// Severity / risk → semantic token mapping
// ---------------------------------------------------------------------------

/** The semantic color token a severity resolves to (`text-error`, `bg-warning`…). */
export const severityToken = (
  severity: Severity,
): "error" | "warning" | "success" => {
  switch (severity) {
    case "critical":
      return "error";
    case "moderate":
      return "warning";
    case "normal":
      return "success";
  }
};

/** Collapse the 4-tier risk band onto the 3 severity color buckets. */
export const riskBandToken = (
  band: RiskBand,
): "error" | "warning" | "success" => {
  switch (band) {
    case "critical":
    case "high":
      return "error";
    case "moderate":
      return "warning";
    case "low":
      return "success";
  }
};

export const riskBandSeverity = (band: RiskBand): Severity => {
  switch (band) {
    case "critical":
    case "high":
      return "critical";
    case "moderate":
      return "moderate";
    case "low":
      return "normal";
  }
};

/** Sort key — higher = more urgent (worklist orders descending). */
export const severityRank = (severity: Severity): number =>
  SEVERITY.length - SEVERITY.indexOf(severity);

export const riskBandRank = (band: RiskBand): number =>
  RISK_BAND.length - RISK_BAND.indexOf(band);

// ---------------------------------------------------------------------------
// Display helpers
// ---------------------------------------------------------------------------

export const severityLabel = (severity: Severity): string =>
  ({ critical: "Kritik", moderate: "Mesatar", normal: "Normal" })[severity];

export const studyStatusLabel = (status: StudyStatus): string =>
  ({
    queued: "Në pritje",
    analyzing: "Po analizohet",
    analyzed: "Analizuar",
    reported: "Raportuar",
    archived: "Arkivuar",
  })[status];

export const modalityLabel = (modality: Modality): string =>
  ({
    xray: "Rreze X",
    ct: "CT",
    mri: "MRI",
    ultrasound: "Ultratinguj",
    other: "Tjetër",
  })[modality];

export const roleLabel = (role: Role): string =>
  ({
    hospital_admin: "Administrator spitali",
    radiologist: "Radiolog",
    doctor: "Mjek",
  })[role];

export const reportStatusLabel = (status: ReportStatus): string =>
  ({ draft: "Draft", finalized: "Finalizuar", amended: "Ndryshuar" })[status];

export const orgTypeLabel = (type: OrgType): string =>
  ({ public: "Spital publik", private: "Klinikë private" })[type];

export const sexLabel = (sex: Sex): string =>
  ({ male: "Mashkull", female: "Femër", other: "Tjetër" })[sex];

export const doctorStatusLabel = (status: DoctorStatus): string =>
  ({ active: "Aktiv", invited: "Ftuar", disabled: "Çaktivizuar" })[status];

export const formatDate = (iso: string): string =>
  new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

export const formatDateTime = (iso: string): string =>
  new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

export const age = (dateOfBirth: string): number => {
  const birth = new Date(dateOfBirth);
  const now = new Date();
  const years = now.getFullYear() - birth.getFullYear();
  const beforeBirthday =
    now.getMonth() < birth.getMonth() ||
    (now.getMonth() === birth.getMonth() && now.getDate() < birth.getDate());
  return beforeBirthday ? years - 1 : years;
};

export const initials = (name: string): string =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

// ---------------------------------------------------------------------------
// Suggested appointments — derived from findings (DESIGN.md §6.3 / §12.1).
// The persistence model has no appointment table; specialist suggestions are
// computed from the non-normal findings of a study.
// ---------------------------------------------------------------------------

export type Appointment = {
  specialty: string;
  status: string;
  reason: string;
  severity: Severity;
};

const SPECIALTY_BY_REGION: Record<string, string> = {
  "Fushat pulmonare": "Pulmolog",
  Trakeja: "Pulmolog",
  "Zemra dhe mediastinumi": "Kardiolog",
  Kockat: "Ortoped",
  "Indet e buta": "Mjek i përgjithshëm",
};

const APPOINTMENT_STATUS: Record<Severity, string> = {
  critical: "Kërkohet konsultë urgjente",
  moderate: "Pa rrezik të menjëhershëm — rekomandohet diagnostikë",
  normal: "",
};

export const specialtyForRegion = (region: string): string =>
  SPECIALTY_BY_REGION[region] ?? "Specialist";

export const deriveAppointments = (
  findings: { region: string; severity: Severity; label: string }[],
): Appointment[] => {
  const seen = new Set<string>();
  return [...findings]
    .filter((finding) => finding.severity !== "normal")
    .sort((a, b) => severityRank(b.severity) - severityRank(a.severity))
    .flatMap((finding) => {
      const specialty = specialtyForRegion(finding.region);
      if (seen.has(specialty)) return [];
      seen.add(specialty);
      return [
        {
          specialty,
          status: APPOINTMENT_STATUS[finding.severity],
          reason: finding.label,
          severity: finding.severity,
        },
      ];
    });
};
