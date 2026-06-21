// One-off: clear the stale (lung-template) analyses on MRI studies so the viewer
// re-reads them with the live per-modality logic (brain model). Run while the
// dev server is STOPPED (the store is in-memory; it persists on shutdown and
// hydrates this file on boot).
import { readFileSync, writeFileSync } from "node:fs";

const PATH = ".next/cache/mediscan-store.json";
const snap = JSON.parse(readFileSync(PATH, "utf8"));

const mriIds = new Set(
  (snap.studies ?? [])
    .filter((s) => s.modality === "mri")
    .map((s) => s.id),
);

const before = {
  analyses: (snap.analyses ?? []).length,
  findings: (snap.findings ?? []).length,
  history: (snap.riskScoreHistory ?? []).length,
};

snap.analyses = (snap.analyses ?? []).filter((a) => !mriIds.has(a.studyId));
snap.findings = (snap.findings ?? []).filter((f) => !mriIds.has(f.studyId));
snap.riskScoreHistory = (snap.riskScoreHistory ?? []).filter(
  (h) => !mriIds.has(h.studyId),
);
snap.studies = (snap.studies ?? []).map((s) =>
  mriIds.has(s.id)
    ? { ...s, rankedAt: null, riskValue: null, riskBand: null }
    : s,
);

writeFileSync(PATH, JSON.stringify(snap));

console.log("reset MRI studies:", [...mriIds]);
console.log("analyses", before.analyses, "->", snap.analyses.length);
console.log("findings", before.findings, "->", snap.findings.length);
console.log("history", before.history, "->", snap.riskScoreHistory.length);
