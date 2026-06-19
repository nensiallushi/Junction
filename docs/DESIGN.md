# DESIGN.md — Mediscan: X-ray Diagnosis AI Platform
**Design by Dominika Kiszkiel for Autentika**
**Project:** AI-Powered X-ray Image-to-Text Analysis (Proof of Concept)

---

## 1. Design Philosophy & Vision

This design sits at the intersection of **clinical precision and consumer approachability**. The core challenge was presenting deeply technical and potentially frightening medical information — AI-generated X-ray diagnoses — in a way that is readable, trustworthy, and calm without being sterile or cold.

The philosophy is built on three pillars:

- **Clarity over decoration.** Every element earns its place by aiding comprehension. There are no gratuitous decorative elements; even the ambient background glow serves a functional role in directing focus.
- **Medical gravity without clinical anxiety.** The dark theme is deliberate — it mirrors the literal environment of medical imaging (radiology lightboxes, PACS viewers, darkroom traditions) while also evoking a premium, trustworthy product rather than a harsh hospital terminal.
- **Progressive disclosure.** Information is layered: Conclusions → Suggested Appointments → Detailed Diagnosis. The user is never overwhelmed. The three-section hierarchy ensures the most critical takeaways appear first, with expandable detail below.

---

## 2. Color System

### 2.1 Background Dual-Layer System

The design uses **two distinct background layers** that work in concert to create depth and visual warmth without brightness.

**Outer background (stage/canvas layer):**
- Deep cobalt-to-midnight blue: approximately `#070E1F` to `#0B1535`
- This is not flat — it features a **soft radial ambient glow** in medium-electric blue (`#1A3A8F` / `#1E4DB7` at very low opacity, ~15-25%) emanating from the center-left and center-right edges of the screen
- These glows act as "floating light bubbles" — large, blurred elliptical gradients that add atmospheric depth and prevent the background from feeling like a void
- The glow is most visible on the left and right flanks of the outer canvas around the device frame

**Inner application background (app surface layer):**
- Slightly lighter but still very dark navy: approximately `#0D1529` to `#111D38`
- This layer represents the actual application window surface
- It is rendered inside a rounded-corner device frame (≈ `border-radius: 16px` on the outer shell)

The **two-background system** creates a sense of a real product sitting in a presentation space — like a device floating in a dark studio — and gives the design dimension even in a flat 2D shot.

### 2.2 Card & Surface Colors

| Surface Level | Approximate Color | Usage |
|---|---|---|
| Page background | `#0D1529` | App-level canvas |
| Card default | `#151E30` – `#1A2540` | Content cards (Conclusions, Appointments, Detailed Diagnosis) |
| Card hover/active | `#1C2845` | Row hover state in Detailed Diagnosis |
| Nav bar | `#111827` with blur | Top navigation strip |
| Nav active tab | `#1E2A40` / medium-dark | Active tab pill |
| Bottom action bar | Semi-transparent dark with backdrop-blur | Print/Download sticky bar |

### 2.3 Accent Color — Primary Blue

- **Brand/primary accent:** `#3B4EE8` to `#4B5EF8` — a vivid indigo-blue
- Used for: primary CTA buttons ("Add file", "Schedule an appointment"), the active nav tab pill background (subtle), logo mark fill, and icon tints
- This blue is the only fully saturated hue in the interface. Everything else is desaturated — making this accent pop with high contrast
- Button surfaces use a slightly more saturated, lighter version of this blue (`#4A5CF7`) with subtle inner variation suggesting a soft gradient or gentle surface sheen

### 2.4 Severity Color System (Medical Semantic Palette)

This is the most important and purposeful color system in the design. Each severity level maps to a distinct hue and iconographic shape, creating a redundant encoding system (color + shape + icon) that ensures accessibility even for colorblind users:

| Level | Color | Icon Shape | Example Use |
|---|---|---|---|
| Critical / Urgent | `#E53935` red-coral | Filled diamond / shield | Pulmonologist - urgent |
| Moderate / Monitor | `#F59E0B` amber-orange | Triangle / warning | Cardiologist, Trachea |
| Clear / Normal | `#22C55E` emerald green | Circle / checkmark | Bones - no abnormality |

- These colors appear as badge icons at the end of each Detailed Diagnosis row
- The same colors are used as small dot/badge overlays on the specialist icon thumbnails in the Suggested Appointments section
- **Orange text** (`#F59E0B`) is specifically used for the "Reason:" sub-label in appointment cards to visually tie the reason to the severity badge without adding another UI element
- The severity colors carry through to the X-ray image overlays (see Section 9)

### 2.5 Text Colors

| Role | Color | Usage |
|---|---|---|
| Primary text | `#E8EAF0` – near white | Headings, body content |
| Secondary/muted text | `#8A95B0` – blue-grey | Sub-labels, hints, counts |
| Hyperlinks / medical terms | `#E07B50` – muted orange-rust | Underlined medical terms (bilateral pneumonia, chronic heart failure) |
| Warning reason text | `#F59E0B` amber | Reason labels in appointment cards |
| Caption/hint text | `#5A6580` | "Hover over the image..." micro-copy |

The link/medical-term color (`#E07B50`) is a particularly thoughtful choice — it's orange-warm rather than a typical blue hyperlink, which keeps the text readable on dark backgrounds while also subtly coding the linked terms as "areas of clinical significance" rather than generic navigation links.

---

## 3. Typography

### 3.1 Typeface

The design uses a **single geometric sans-serif typeface** throughout, consistent with modern medical/tech product design. Based on the letterforms visible — particularly the round 'o', open apertures, and slightly humanist numerals — the font appears to be **Inter** or a very close relative (possibly Manrope or DM Sans).

The single-family approach creates visual harmony and avoids typographic noise in a content-dense UI.

### 3.2 Type Scale & Weight Usage

| Context | Weight | Approx Size | Notes |
|---|---|---|---|
| Page title ("X-ray diagnosis") | SemiBold (600) | ~22–24px | High contrast, leading label |
| Card section headings | SemiBold (600) | ~16–18px | "Chest X-ray - Conclusions", "Suggested appointments" |
| Specialist name ("Pulmonologist") | SemiBold (600) | ~15px | Prominent, visually anchors the card row |
| Body / diagnosis text | Regular (400) | ~13–14px | Bullet point diagnosis content |
| Sub-labels ("Urgent medical...") | Regular (400) | ~12px | Muted, secondary role |
| Reason labels ("Reason: Pneumonia") | Regular (400) | ~11–12px | Smallest, amber-colored |
| Nav items | Medium (500) | ~13px | Compact, readable |
| Button labels | Medium (500–600) | ~13–14px | Centered, with icon |
| Caption text | Regular (400) | ~11px | "Hover over image..." |

**Weight is the primary differentiator**, not size. The design relies on semibold vs. regular weight contrast rather than large size differences to establish hierarchy — this is more elegant in dense, information-heavy UIs and creates a quieter, more readable rhythm.

### 3.3 Line Height & Spacing

Comfortable, generous line height (~1.5–1.6×) is used throughout the body content in diagnosis cards, giving the medical text room to breathe. This is a deliberate UX choice — dense medical text with tight leading would feel overwhelming and clinical; open leading makes it feel like a report you can actually read.

---

## 4. Border Radius System

The design uses a **multi-tier rounded corner system** that creates a coherent visual language across components:

| Component | Border Radius | Rationale |
|---|---|---|
| Outer device/app window | ~`16px` | Soft, premium — it's a "stage" frame |
| Content cards (main sections) | ~`12px` | Friendly, approachable — not sterile |
| Appointment row items | ~`10px` | Slightly tighter, still soft |
| "Schedule an appointment" button | ~`24–28px` (pill) | Maximum roundness — CTA prominence |
| "Add file" button | ~`24px` (pill) | Same pill language as CTAs |
| "Print diagnosis" / "Download" buttons | ~`20px` (pill) | Consistent pill system |
| Nav active tab pill | ~`16–18px` | Pill, matches button system |
| Specialist icon thumbnails | ~`10px` | Slightly rounded square |
| X-ray image viewer | ~`10–12px` | Matches card radius for consistency |
| Upload drop zone | ~`12px` | Dashed border, matches card radius |
| Severity badge icons | `50%` (circle/shield) | Fully round icons |

The **pill-radius for all buttons** is one of the design's most distinctive decisions. It creates visual softness in a domain (medical information) where the user may feel vulnerable, and distinguishes actionable elements from passive content containers at a glance.

---

## 5. Navigation Bar

### 5.1 Structure

The nav bar spans the full width of the application window and has this structure, left to right:
┌────────────────────────────────────────┐   ← border-radius: ~12px
│  Section Heading (SemiBold)            │   ← ~18px, white, padding ~20px
│                                        │
│  [Content rows or bullet points]       │   ← padding ~16–20px
│                                        │
└────────────────────────────────────────┘
- Background: `#151E30` approximately — dark but distinct from page background
- No border or outline in default state (the slight color delta from the page bg provides contrast)
- Box shadow: very subtle, `0 2px 12px rgba(0,0,0,0.3)` or similar — adds lift without being visible as a dramatic shadow
- Cards stack vertically with `~16px` gap between them

### 6.2 Conclusions Card

The top card on the right panel. Contains:
- Heading: "Chest X-ray - Conclusions"
- Three bullet points of diagnostic findings
- **Medical term hyperlinks** in the orange-rust link color with underline — these are the hover targets that trigger X-ray overlays
- Body text is regular weight on a slightly larger size than the appointment/detail cards, giving it the "most important" position

### 6.3 Suggested Appointments Card

Contains rows, one per specialist. Each row:
- Left: square icon thumbnail (~`40×40px`, `border-radius: ~10px`, mid-blue background `#1C2E50`) with a medical specialty icon (lungs for Pulmonologist, heart for Cardiologist) in blue accent color
- Overlaid on the icon thumbnail: a small severity badge (red diamond or orange triangle, ~`16px`) in the top-right corner of the thumbnail — this badge is a key severity signal
- Center: `[Specialist Name SemiBold] / [Status text Regular muted] / [Reason: X amber text]`
- Right: "Schedule an appointment" pill button in primary blue with a calendar icon prefix

The two appointment rows have a subtle separator between them — either a thin `1px` line in `rgba(255,255,255,0.06)` or simply spacing.

### 6.4 Detailed Diagnosis Card

The most complex card. Contains collapsible/expandable anatomical sections. Each row:
- Section number + name: `"1. Lung Fields"` in SemiBold white
- Trailing severity badge icon (right-aligned): red diamond for critical, orange triangle for moderate, green circle for normal
- Bullet point sub-items below (Regular, muted white)
- Medical term links in the orange-rust color with underline

**Hover/Active state:** When the user hovers over a row (or it is selected), a subtle **left blue accent border** (`~3px` wide, in the primary blue `#3B4EE8`) appears on the left edge of the row, and the row background shifts slightly lighter (`#1C2845`) — visually connecting the text section to the corresponding X-ray overlay. This is the primary interactive feedback mechanism.

---

## 7. X-ray Image Panel (Left Column)

### 7.1 Layout

The left panel holds the X-ray scan at approximately **40–45% of the content width**, filling the full available height of the content area. The right panel (cards) takes the remaining **55–60%**.

This split prioritizes the diagnostic text — the actual information the patient needs — while keeping the X-ray large enough to be medically meaningful and visually engaging.

### 7.2 Image Treatment

- Full grayscale radiograph rendered at full size with no filters other than normal brightness
- The X-ray fills the container without visible letterboxing — it's displayed as a `cover` fill
- `border-radius: ~10–12px` matches the card radius, keeping it visually consistent with the card system

### 7.3 Lesion Overlay System

Over the X-ray image, the AI draws **color-coded contour outlines** to mark regions of detected pathology:

- **Red dashed outline** (`#E53935` / urgent-red): Used for the most critical regions (e.g., lung consolidation zones). The dashing style (dash-gap pattern) makes the outline feel like a hand-drawn annotation rather than a hard mask, which is more readable on the complex grayscale X-ray.
- **Orange/amber dashed outline** (`#F59E0B`): Used for moderate-severity regions (e.g., cardiac silhouette enlargement, mediastinal widening)
- The outlines are path-drawn following anatomical shapes — not rectangular bounding boxes. This biological fidelity makes the system feel precise and trustworthy

### 7.4 Hover Interaction (X-ray ↔ Text Sync)

This is the signature interaction of the product:

1. User hovers over a row in the Detailed Diagnosis section (e.g., "2. Heart and Mediastinum")
2. The corresponding anatomical region on the X-ray is highlighted with a **solid filled overlay** in the severity color at ~40–50% opacity (so the X-ray remains visible underneath)
   - For the Heart/Mediastinum hover example: a large amber-yellow (`#F59E0B` at ~45% opacity) filled shape covers the heart silhouette area
   - For the Lung Fields hover: the red overlay fills the lung regions
3. Simultaneously, the hovered text row receives its left-border accent and lighter background
4. This creates a **bi-directional linked highlighting system** — the text explains what you see; the image shows where it is

This interaction is the core UX innovation and justifies every other design decision. The entire color system, card structure, and layout exists to make this one interaction powerful.

### 7.5 Image Controls

Two small circular icon buttons are positioned at the bottom-right corner of the X-ray panel (floating over the image):
- Zoom-in (magnifier + plus)
- Zoom-out (magnifier + minus)
- These are `~28–32px` circles with a semi-transparent dark background and a subtle border — minimal and unobtrusive

### 7.6 Caption / Hint Text

Below the X-ray: `"Hover over the image or description to read the diagnosis."` — in small (~11px) muted grey. This is the **only explicit instruction in the entire UI**, placed exactly where the user's eye rests after viewing the image. It is understated but essential — a gentle affordance nudge.

---

## 8. Upload State (Empty State Screen)

When no file has been uploaded yet, the content area shows an **empty state / drop zone**:

- A large dashed-border rectangle with `border-radius: ~12px`, matching the card system
- Dashed border in the primary blue accent color (`#3B4EE8`) at reduced opacity — this draws the eye and signals interactivity
- The dashed pattern itself suggests "open / waiting / droppable"
- Centered text: `"Add an X-ray file"` (SemiBold white) with sub-text `"Allowed formats: DICOM, PDF, PNG, JPEG."` (muted grey)
- A pill CTA button: `"+ Add file"` in primary blue — the only solid element, ensuring the eye lands on it as the primary action
- Below the drop zone, a small text link: `"Learn more about x-rays."` — provides a gentle educational escape hatch for users who are uncertain

This empty state communicates expected input, accepted formats, and the action to take — no more, no less. The large empty dashed area also implicitly supports **drag-and-drop** even before the user reads the instructions.

---

## 9. Floating Bubbles & Ambient Glow Elements

### 9.1 Background Floating Bubbles

The **outer canvas background** (the "presentation frame" around the app window) contains two to four soft, large radial gradient blobs — approximately:

- **Left bubble:** A deep cobalt-to-transparent radial blob positioned at approximately center-left of the outer frame, bleeding off-screen to the left. Approximate color: `#1A3A8F` at ~20–30% opacity, fading to transparent over a large radius (~300–400px equivalent)
- **Right bubble:** A similar blob on the right side, slightly warmer in hue (possibly `#1E3B8F` with a touch more violet), fading symmetrically

These bubbles:
- Prevent the background from being flat black
- Create the impression of a light source or ambient environmental lighting
- Give the "floating device" presentation its cinematic depth
- Their asymmetry (slight tonal differences left vs. right) prevents the background from feeling static or template-generated

### 9.2 Why This Works

The floating bubble technique is a staple of premium dark-mode SaaS/product presentations because it simulates studio photography lighting on a product — giving the "product shot" feel. In a Dribbble context this also makes the shot more visually arresting as a thumbnail. In an actual deployed app, similar glow effects could be implemented as pseudo-elements or SVG gradients positioned behind the app chrome.

---

## 10. Bottom Action Bar

A **sticky footer bar** sits at the very bottom of the application window, below all scrollable content:

- Semi-transparent dark surface with `backdrop-filter: blur` — same glassmorphism approach as the nav bar, maintaining visual consistency at both extremes of the vertical layout
- Contains two pill buttons aligned to the right:
  - `🖨 Print diagnosis` — secondary/ghost-style pill (dark surface, lighter outline or simply transparent with text)
  - `⬇ Download diagnosis` — primary-style pill in the brand blue

This persistent bar ensures the user can always access the two utility actions without scrolling. The print/download actions are de-prioritized visually relative to the "Schedule an appointment" CTA (those are more urgent), but always accessible.

---

## 11. Severity Badge Icons

One of the most refined details in the design. Each anatomical section in the Detailed Diagnosis list ends with a severity badge:

| Badge | Visual | Semantic meaning |
|---|---|---|
| Red diamond/shield | Filled red octagonal/diamond shape | Critical — immediate attention required |
| Orange triangle | Filled amber warning triangle | Moderate — monitor / diagnostics needed |
| Green circle/checkmark | Filled green circle with checkmark | Normal — no abnormality detected |

- Size: approximately `~20–24px` diameter/width
- They sit in a small circular or rounded container at the right edge of the diagnosis row
- The shape redundancy (diamond ≠ triangle ≠ circle) ensures that color-blind users can still distinguish severity levels

These same badge shapes appear as overlays on the specialist icon thumbnails in the Suggested Appointments card, creating **visual coherence across both the summary and detail sections** — the red badge on the Pulmonologist icon matches the red badge on the Lung Fields row below.

---

## 12. UX Choices & Information Architecture

### 12.1 Three-Section Hierarchy

The right panel is structured in deliberate reading order:

1. **Conclusions** — What does this mean? (the verdict)
2. **Suggested Appointments** — What should I do? (the action)
3. **Detailed Diagnosis** — Why? (the evidence)

This is a patient-centered IA rather than a clinical one. A radiologist's report leads with findings; this design leads with interpretation. The most anxious user wants to know "is this serious?" before they want to understand the mechanism.

### 12.2 Language Choices

- Section titles use plain English: "Chest X-ray - Conclusions", "Suggested appointments", "Detailed diagnosis" — not "Report", "Referrals", or "Radiology Findings"
- Medical terms are preserved but **hyperlinked** (orange-rust underline) to signal they are clickable for more information — this respects the user's intelligence while offering an exit ramp for unfamiliar terminology
- Severity descriptions use calibrated language: "Urgent medical consultation required" vs. "No immediate life threat. Diagnostics recommended" — both honest, neither alarming nor falsely reassuring
- Specialist reason labels ("Reason: Pneumonia") are brief and specific — not "based on the findings above", just the plain reason word

### 12.3 Bi-directional Hover Interaction

The X-ray ↔ text hover synchronization is the core UX differentiator. Design decisions supporting it:
- The layout is **always split-panel** — X-ray left, text right — so the spatial relationship is constant
- Color coding is consistent: the same amber used in the text badge for Heart/Mediastinum is the same amber used for the fill overlay on the X-ray
- The hover target in the text panel is the **entire row**, not just the title — a large, comfortable hit area
- The hint copy (`"Hover over the image or description to read the diagnosis"`) tells users the interaction works in both directions

### 12.4 Drag and Drop Upload UX

The upload drop zone uses **visual invitation without instruction overload**:
- The dashed blue border is the primary affordance signal (matches internet convention for drop zones)
- The format list (`DICOM, PDF, PNG, JPEG`) immediately addresses the medical-context question "what format is my file?"
- DICOM is listed first — the professional medical format — signaling this is a real clinical tool, not a consumer photo app

---

## 13. Presentation Frame — Device Mockup

Each screen state is presented inside a **dark rounded device/browser frame**:
- Outer rounded rectangle: approximately `border-radius: 16px`, with a very dark near-black border (`#0A0E18`)
- Inner app surface: starts immediately inside the border, with its own dark background
- The device frame appears to have a subtle inner shadow or edge shading that gives it the appearance of depth — as if you're looking at a real monitor

This presentation choice (device frame + ambient glow background) is standard for Dribbble portfolio shots but it's executed here with the floating bubble technique making it feel considered rather than template-applied.

---

## 14. Animations & Interactions (Inferred from Design Intent)

While this is a static Dribbble presentation, the design clearly implies these animated behaviors:

| Interaction | Expected Animation |
|---|---|
| Hover over diagnosis row | Cross-fade X-ray overlay in (~200ms ease-in), left border accent slides in from left |
| Hover exit | Overlay fades out (~150ms ease-out), row returns to default |
| File drag-over drop zone | Dashed border brightens/pulses, background lightens slightly |
| File upload progress | Progress bar or spinner centered in the drop zone (implied by "Uploading file" state seen in frames) |
| Schedule appointment click | Button shows loading state (ripple or spinner), then confirmation |
| Card expansion (Detailed Diagnosis rows) | Smooth height expand via CSS transition for sub-bullet reveal |
| Page load (diagnosis result) | Cards appear sequentially — Conclusions first, then Appointments, then Detailed — staggered fade-up entrance animation (~300ms each, 100ms stagger) |

---

## 15. Component Inventory Summary

| Component | Variant Count | Key Properties |
|---|---|---|
| Navigation bar | 1 | Blur, pill active tab, right-side utility icons |
| Content card | 3 types | Conclusions, Appointments, Detailed Diagnosis |
| Appointment row | 2 states | Default, with severity badges |
| Severity badge | 3 levels | Red diamond, orange triangle, green circle |
| CTA button (pill) | 2 visual weights | Primary blue, secondary dark |
| X-ray viewer | 2 states | Base view, hover-overlay state |
| Diagnosis row | 3 states | Default, hover-active, with severity badge |
| Upload drop zone | 2 states | Empty/waiting, uploading |
| Icon thumbnail | 1 | Rounded square, specialty icon + badge overlay |
| Bottom action bar | 1 | Blur, print + download buttons |
| Background glow bubbles | 2–4 | Ambient radial gradients |

---

## 16. Design Tokens (Summary)

```css
/* Colors */
--bg-outer:          #08111F;
--bg-app:            #0D1629;
--bg-card:           #151E30;
--bg-card-hover:     #1C2845;
--bg-nav:            rgba(12, 18, 32, 0.75);
--accent-primary:    #3B4EE8;
--accent-primary-lt: #4B5EF8;
--severity-critical: #E53935;
--severity-moderate: #F59E0B;
--severity-normal:   #22C55E;
--text-primary:      #E8EAF0;
--text-secondary:    #8A95B0;
--text-link:         #E07B50;
--text-warning:      #F59E0B;
--text-caption:      #5A6580;
--glow-blue:         rgba(26, 58, 143, 0.25);

/* Border Radius */
--radius-device:  16px;
--radius-card:    12px;
--radius-row:     10px;
--radius-pill:    999px;
--radius-icon:    10px;

/* Typography */
--font-family:    'Inter', 'DM Sans', system-ui, sans-serif;
--font-weight-regular:   400;
--font-weight-medium:    500;
--font-weight-semibold:  600;

/* Effects */
--blur-nav:       blur(14px);
--blur-bar:       blur(12px);
--shadow-card:    0 2px 12px rgba(0,0,0,0.35);
```

---

*DESIGN.md generated from visual analysis of the Mediscan X-ray Diagnosis Dribbble shot by Dominika Kiszkiel for Autentika.*