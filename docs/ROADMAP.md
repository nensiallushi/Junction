# Roadmap: Incorporate the AI Health Platform features into the Mediscan design system

> Source feature spec: [`docs/context/features.docx`](./context/features.docx). Design bible: [`DESIGN.md`](./DESIGN.md).
> This is the canonical implementation plan — keep it in sync as phases ship.

## Context

`docs/context/features.docx` specifies an **AI Health Platform** for *doctors and hospitals* — a B2B clinical
imaging tool with 8 feature areas: (1) auth & role-based access (hospitals administer doctor accounts),
(2) medical image upload + AI analysis linked to a specific patient, (3) AI diagnostic assistance,
(4) risk score + priority ranking, (5) a doctor dashboard, (6) PACS-based archiving, (7) centralized
cross-facility patient records, (8) multi-doctor collaboration.

Today the repo is essentially a **design-system showcase**. `docs/DESIGN.md` describes a *consumer single-X-ray
tool* ("Mediscan"); the tokens are wired in `apps/web/src/app/globals.css`; and a handful of demo components
exist (`app-shell.tsx`, `xray-viewer.tsx`, `diagnosis-view.tsx`, `severity.tsx`, `medical-icons.tsx`,
`diagnosis-data.ts`). There is **no server layer, no database, no auth** yet. `CLAUDE.md`'s architecture
section still documents a stale **e-commerce** schema (store/product/competitor/scan/simulation/ucpProfile).

**Decisions made with the user:**
1. **Evolve** the consumer Mediscan into a **clinical B2B platform** — keep its visual language (dark dual-layer
   theme, severity = color+shape+icon, split-panel viewer with bi-directional hover sync, pill buttons, glass
   nav/bottom bar, ambient glow) but grow the information architecture to multi-patient / multi-doctor.
2. **Full-stack phased roadmap** (design → schema → server → auth/RBAC → routes → AI).
3. **Stub AI + PACS now behind clean interfaces**; swap real DICOM/PACS + AI providers in later.
4. **Extend `DESIGN.md`** with the new B2B patterns/tokens **and rewrite `CLAUDE.md`** from the e-commerce
   domain to the medical domain.

**Intended outcome:** a coherent, docs-first roadmap where every feature maps to a screen expressed in the
existing design language, backed by a medical data model and the repo's mandatory server/component conventions.

---

## Guiding constraints (from `docs/agents/*.md`, non-negotiable)

- **Server layers:** `server/database/` (Drizzle) → `server/utils/` (context wrappers + `repository()` + errors)
  → `server/app/*.ts` (one model owns its table; namespace-imported `import * as Study from "@/server/app/study"`).
- **Errors:** `resultify()` in actions, `unwrapResult(...(Environment.SERVER))` in server components.
- **PPR + streaming:** every `page.tsx` is a server component static shell; data in async server components inside
  `<Suspense fallback={<Skeleton/>}>`.
- **Forms:** `InferredForm` + `field()` (Zod-driven) — never raw `<input>`/react-hook-form.
- **Tables:** `DataTableProvider` + `DataTable`. **Buttons:** variants only, no `className` overrides.
- **Style:** semantic tokens only (no raw hex/`text-gray-*`), `const`-only, single-word names, domain-named args
  (`{ patient }` not `{ patientId }`), spacing in multiples of 2, icons `size-4`.

---

## Part A — Design language reconciliation (mostly additive to `DESIGN.md`)

The existing 3-section IA (Conclusions → Appointments → Detailed Diagnosis) **stays** as the single-study viewer.
What's new is the *shell around it*: a multi-patient platform. Map each feature to the design language:

| Feature | Screen / pattern | DESIGN.md treatment |
|---|---|---|
| Doctor dashboard (#5) | Home with "Urgent cases", "Pending reviews", "Recent studies" | Cards (`rounded-card`), severity badges, staggered fade-up |
| Risk score + ranking (#4) | **Worklist / case queue** (DataTable) | New: risk gauge/`Meter`, `riskBand` severity chip per row, left-accent hover from §6.4 |
| Patient records (#7) | Patients list + `patients/[id]` history | Cards + DataTable; reuse severity encoding for prior-study chips |
| Upload + analysis (#2) | Upload form + dropzone | Reuse §8 empty-state dropzone (dashed blue) + `FileUpload` |
| Viewer / AI assist (#2,#3) | `studies/[id]` split-panel | **Existing** `xray-viewer.tsx` + `diagnosis-view.tsx`, generalized per study |
| Collaboration (#8) | Consult thread on a study | New: message thread that can cite a `finding.id` (reuses hover join key) |
| Auth + admin (#1) | `(auth)` group + `admin/doctors` | Pills, glass surfaces; admin tables via DataTable |

**New design patterns to document in `DESIGN.md`** (keep the visual language, fill IA gaps it never covered):
- **Worklist row** — risk value + `riskBand` chip (reuse critical/moderate/normal color+shape+icon), patient,
  modality, status; left blue accent on hover (extends §6.4).
- **Risk gauge** — small `Meter`/radial using the severity palette; band drives color.
- **Patient header** — name / MRN / DOB chip strip atop `patients/[id]` and the viewer.
- **Status pill** — study lifecycle (`queued`/`analyzing`/`analyzed`/`reported`…), desaturated chrome colors.
- **Consult thread** — message list; a message citing a finding gets the link-rust (`--color-link`) treatment.
- **Persistent left/side nav** — the current top-tab `NavBar` grows to a multi-section app nav (still glass).

**Token gaps to close in `apps/web/src/app/globals.css` `@theme`** (DESIGN.md §16 defines them; code hard-codes
them today). Add as semantic tokens and replace inline literals:
- `--radius-device: 16px` (replaces `rounded-[16px]` in `app-shell.tsx`), `--radius-pill: 999px`,
  `--radius-icon: 10px`.
- `--color-text-caption: #5a6580` (DESIGN.md §2.5, currently missing).
- Optional: `--shadow-card`, `--blur-nav`/`--blur-bar` tokens to replace inline `shadow-[…]`/`backdrop-blur-xl`.
- Fix the `Button className` overrides in `app-shell.tsx` (`BottomBar`) — use variants, per AGENTS-packages §22f.

---

## Part B — Data model (`apps/web/src/server/database/schema.ts`, new)

Define canonical domain literals once and reuse for both Drizzle enums and the viewer (supersede the inline
types in `diagnosis-data.ts`): `SEVERITY = ["critical","moderate","normal"]` (maps 1:1 to
`error`/`warning`/`success` tokens), `MODALITY = ["xray","ct","mri","ultrasound","other"]`.

**Tables (with relations alongside):**
- **Better Auth:** `user` (+ `role` enum `["hospital_admin","radiologist","doctor"]`, + `organizationId` FK),
  `session` (+ `activeOrganizationId`), `account`, `verification`.
- **`organization`** (hospital) — `name`, `slug`, `type` `["public","private"]` (drives cross-facility #7).
- **`patient`** — `organizationId`, `mrn` (**unique per-org**, the human "ID"), `name`, `dateOfBirth`, `sex`.
- **`study`** (the "case", = generalized single-X-ray screen) — `organizationId`, `patientId`, `uploaderId`,
  `modality`, `bodyPart`, `status` enum, `studyDate`, `studyInstanceUid`; **+ risk columns**
  `riskValue` (0–100), `riskBand` `["critical","high","moderate","low"]`, `rankedAt` (kept on `study` so the
  worklist sorts with no join — the hottest read path).
- **`image`** (instance) — `studyId`, `seriesInstanceUid`, `sopInstanceUid`, `instanceNumber`, `storageUrl`,
  `storageKey`, `width`, `height` (PACS triple: study-UID on `study`, series/SOP on `image`; keep nullable).
- **`analysis`** (AI preliminary) — `studyId` (1:1), `status`, `modelRef` (e.g. `"stub-v0"`), `summary`,
  `completedAt`, `error`.
- **`finding`** — `analysisId`, `studyId` (denormalized for cheap viewer reads), `imageId` (nullable, future
  multi-frame), `region`, `severity`, `label` (linked medical term), `description`, `confidence`,
  `displayOrder`, **`geometry` jsonb** `{kind:"contour"|"bbox", points:[[x,y]…], normalized:true}` —
  **normalized 0–1 coords** (survives zoom). `finding.id` is the **hover join key** between text row and overlay.
- **`riskScoreHistory`** — append-only audit (`studyId`, `value`, `band`, `modelRef`) for re-ranking (#4).
- **`report`** — `studyId` (1:1), `authorId`, `status` `["draft","finalized","amended"]`, `body`,
  `finalizedAt` (doctor's *finalized* report; kept **distinct** from `analysis.summary` for liability).
- **`consult`** + **`consultParticipant`** + **`message`** — collaboration (#8); `message.findingId` (nullable)
  lets a second opinion cite a specific region.

**Key trade-offs (decided):** risk lives on `study` (+ history table) not a 1:1 side table; `finding.geometry`
is normalized jsonb (not PostGIS/bbox) because overlays are rendered, never spatially queried; `patient.mrn`
is per-org unique (cross-facility identity is a future matching problem, not a shared key).

---

## Part C — Server architecture (`apps/web/src/server/`)

**Build `server/utils/` FIRST** (everything depends on it): `environment.ts`, `errors.ts`, `request.ts`,
`repository.ts` (`repository(schema.table)` → get/create/update/destroy/find/paginate/exists/count), and
`context.ts` with the three wrappers:
- `withContext` (base: auth/db/storage + `resultify` + Sentry),
- `withAuthentication` (injects `session = { user, organizationId, role }`),
- `withAuthorization(handler, { roles, scope })` — **the org-scoping wall**: every clinical query pins
  `eq(table.organizationId, session.organizationId)` from the session; the doctor never passes an org id, so a
  forged `patientId` returns empty. Cross-facility (#7) is a **separate** `Patient.findCrossFacility` path that
  unions only `organization.type === "public"` orgs and logs access.

**RBAC roles:** `hospital_admin` (registers/disables doctors, org-wide worklist), `radiologist` (full clinical +
finalize reports), `doctor` (read org patients, second opinions, finalize own reports). "Hospital registers
doctors" = Better Auth **admin + invitation**: `Doctor.invite` creates a `verification`-backed invite carrying
`organizationId`+`role`; on accept, the `user` is created pre-bound via `databaseHooks.user.create.before`.
Clinical self-signup is disabled; first `hospital_admin` per org is provisioned manually (gated).

**`server/app/` modules** (each `"use server"`, exports `Type`, namespace-imported):
`authentication.ts`, `organization.ts`, `doctor.ts` (invite/accept/list/setRole/disable),
`patient.ts` (get/create/paginate/search-by-name-or-MRN/findCrossFacility), `study.ts`
(get/create/paginate/**worklist**/setStatus/forPatient), `storage.ts` (UploadThing router + `register` to
persist `image` + create `study`), `analysis.ts` (enqueue/**ingest**/get — writes `analysis` + bulk `finding` +
calls the risk scorer), `report.ts` (draft/update/finalize/amend), `collaboration.ts` (open/invite/post/resolve).

**Stub seams:** `server/utils/analysis.ts` → `analyze(study): Promise<{summary, findings, risk}>` with a `mock`
impl now (returns DESIGN.md-style regions/severities/contours in normalized coords); `analysis.ts` never imports
a provider directly. `server/utils/risk.ts` → pure `score(findings): {value, band}`. Real Azure AI SDK + DICOM
ingest swap in behind these later. Storage is UploadThing now; the PACS UID columns make the DICOM upgrade
non-breaking.

---

## Part D — Route map (`apps/web/src/app/`)

```
(auth)/            sign-in, accept-invite/[token], reset-password        # client-heavy (allowed)
(main)/
  layout.tsx       glass nav + bottom bar + org/role guard
  dashboard/
    page.tsx                       SHELL: greeting + section frames
      _components/                 <Suspense>: UrgentCases, PendingReviews, RecentStudies (async)
    worklist/      page.tsx SHELL + filter bar (nuqs); _components WorklistTable (DataTable, ORDER BY riskValue)
    patients/      page.tsx SHELL + search; _components PatientsTable (Patient.paginate)
    patients/[patient]/  page.tsx SHELL patient header; _components PatientStudies, PatientHistory
    studies/[study]/   ★ split-panel viewer
       page.tsx        SHELL: study title, patient chip, status, bottom action bar (Print/Download/Finalize)
       _components/    xray-viewer.tsx (existing), diagnosis-view.tsx (existing),
                       viewer-data.tsx (async: Study.get + Analysis.get → both panels share findings[])
    studies/[study]/report/   server page + InferredForm report editor
    studies/[study]/consult/  collaboration thread (#8)
    upload/        _components/upload-form.tsx (UploadThing + patient autocomplete)
    admin/doctors/ hospital_admin only; DoctorsTable + invite-doctor-form
    admin/organization/, settings/
(provider)/api/    auth/[...all], uploadthing, analysis/webhook (→ Analysis.ingest), cron/rerank
```

**Viewer (signature screen):** shell renders title/patient chip/empty panel frames instantly; `viewer-data.tsx`
fetches `Study.get` + `Analysis.get` in one `Promise.all` and hands the **same `findings[]`** to both panels —
overlays and rows keyed by `finding.id`; hover sync is shared client state, no server round-trip. This reuses the
existing `xray-viewer.tsx` / `diagnosis-view.tsx` moved under `studies/[study]/_components/`.

---

## Part E — Documentation updates

- **`docs/DESIGN.md`** — add a section for the B2B IA patterns from Part A (worklist row, risk gauge, patient
  header, status pill, consult thread, persistent side nav). Add the missing tokens (radius-device/pill/icon,
  text-caption) to §16 so they're canonical.
- **`CLAUDE.md`** — rewrite the **Server Architecture** (schema table list), **App Router Structure**, and
  **Key Patterns** examples from the e-commerce domain to the medical domain (patient/study/analysis/finding/
  report/consult instead of store/product/competitor/scan/simulation). Keep the conventions text intact.
- **`docs/index.md`** — add a pointer to the feature spec if a derived `docs/context/features.md` is created from
  the `.docx` for in-repo readability.

---

## Phasing (each independently shippable)

- **Phase 0 — Foundation.** Add deps (drizzle-orm, postgres, better-auth, uploadthing, drizzle-kit, sentry).
  Build `server/utils/` (context/repository/errors) + `server/database/` connection + empty schema. Update tokens
  in `globals.css`. Ship: `db:studio` healthy, wrappers exercised, design tokens semantic.
- **Phase 1 — Auth + org/doctor mgmt (#1).** Better Auth tables + `organization`; `authentication.ts`,
  `organization.ts`, `doctor.ts`; `(auth)` + `admin/doctors`. Ship: admin invites doctor, doctor accepts → empty
  dashboard; RBAC scoping live.
- **Phase 2 — Patients + studies + upload (#2 partial, #6 partial).** `patient`/`study`/`image`; UploadThing;
  `patients`, `patients/[patient]`, `upload`. Ship: upload an image linked to a patient by name/MRN.
- **Phase 3 — Analysis stub + findings + viewer (#2, #3).** `analysis`/`finding` behind the Service interface;
  `/api/analysis/webhook`; generalized `studies/[study]` viewer. Ship: upload → mock findings + summary →
  contour overlays synced to diagnosis rows. *Demo-to-product moment.*
- **Phase 4 — Risk score + worklist (#4, #5).** risk columns + `riskScoreHistory` + `utils/risk.ts`; `dashboard`
  + `worklist`; `/api/cron/rerank`. Ship: analyzed studies get score+band; urgent cases surface first.
- **Phase 5 — Reports + collaboration (#3, #8).** `report` + `consult`/`message`; report editor + consult thread.
  Ship: doctor finalizes a report (distinct from AI summary), specialist gives a second opinion citing a finding.
- **Phase 6 — Cross-facility + RBAC polish (#7).** `Patient.findCrossFacility`, public-org directory, access
  logging, role-gated segments hardened. Ship: public-hospital doctor retrieves prior exams from another
  participating public hospital, logged.

---

## Critical files

- `apps/web/src/server/database/schema.ts` *(new)* — all tables/enums/relations (Part B).
- `apps/web/src/server/utils/context.ts`, `repository.ts`, `errors.ts`, `environment.ts` *(new)* — the org-scoping
  wall + repository pattern; build before any model.
- `apps/web/src/server/utils/analysis.ts`, `risk.ts` *(new)* — the AI/risk stub seams (Service interface).
- `apps/web/src/server/app/*.ts` *(new)* — `authentication`, `organization`, `doctor`, `patient`, `study`,
  `storage`, `analysis`, `report`, `collaboration`.
- `apps/web/src/app/(main)/dashboard/studies/[study]/page.tsx` + `_components/` *(new)* — split-panel viewer;
  moves/reuses existing `xray-viewer.tsx`, `diagnosis-view.tsx`, `severity.tsx`, `medical-icons.tsx`.
- `apps/web/src/app/(main)/dashboard/{worklist,patients,upload,admin/doctors}/` *(new)*.
- `apps/web/src/app/(auth)/`, `apps/web/src/app/(provider)/api/{auth,uploadthing,analysis,cron}/` *(new)*.
- `apps/web/src/app/globals.css` *(edit)* — add radius/caption/shadow/blur tokens; replace inline literals.
- `docs/DESIGN.md` *(edit)* — B2B IA patterns + token additions.
- `CLAUDE.md` *(edit)* — rewrite schema/router/patterns to the medical domain.

**Reuse (don't reinvent):** `@zenncore/utils` (`cn`, `resultify`, `unwrapResult`, `Result`, `useAsyncAction`),
`@zenncore/web` components (`Button`, `FileUpload`, `DataTable`, `InferredForm`, `Dialog`, `Sheet`, `Tabs`,
`Meter`, `Progress`, `Tooltip`, `Avatar`), `@zenncore/data-table`, `@zenncore/inferred-form`; existing
`severity.tsx`/`medical-icons.tsx` severity system and `diagnosis-data.ts` types (promote into the schema).

---

## Risks / where the stubs leak

1. **DICOM** — UploadThing won't parse `.dcm` (windowing, multi-frame, embedded UIDs). UIDs are fabricated now;
   keep `image.series/sopInstanceUid` + `finding.imageId` nullable so real ingest is non-breaking.
2. **Overlay coords** — must be **normalized 0–1** in both schema contract and mock generator, or zoom/responsive
   panels desync overlays from the image.
3. **Risk score is fabricated but clinically weighted** — record `modelRef:"stub-v0"` everywhere and keep the
   "assist, not replace" disclaimer UI-explicit.
4. **Cross-facility scoping** is the sharpest PHI edge — `findCrossFacility` stays a separate, audited path;
   never relax the default `WHERE organizationId = session.organizationId`.
5. **`hospital_admin` bootstrap** — first admin per org has no inviter; that path must be gated (account-takeover
   vector for a whole hospital otherwise).
6. **Re-rank race** — `Analysis.ingest` and `/api/cron/rerank` both write risk to `study`; make ingest idempotent
   and guard on `rankedAt`.

---

## Verification

- **Tokens/design:** `cd apps/web && bun run lint` + `bun run dev:web`; confirm the viewer and new shells render
  with semantic tokens (no raw hex), pills/cards/severity badges match `DESIGN.md`, glass nav/bottom bar intact.
- **DB:** from `apps/web`, `bun run db:push` then `bun run db:studio`; verify every table/enum/relation and the
  per-org `mrn` uniqueness.
- **Auth/RBAC:** create an org + `hospital_admin`, invite a `doctor`, accept; assert a doctor in org A gets an
  empty result for org B's `patientId` (org-scoping wall). Verify clinical self-signup is closed.
- **Upload → analysis → viewer (core loop):** upload an image linked to a patient, confirm the stub writes
  `analysis.summary` + `finding[]` (normalized geometry), and the `studies/[study]` viewer shows contour overlays
  that highlight in sync when hovering the matching diagnosis row (and vice-versa) — the DESIGN.md §7.4 signature.
- **Worklist:** seed studies with varied `riskBand`; confirm the dashboard/worklist orders critical-first and the
  cron `rerank` endpoint updates ranking.
- **Reports/collaboration:** finalize a report (distinct from the AI summary), open a consult, post a message
  citing a `finding.id`.
- **Types:** `bun run typecheck` across packages.
