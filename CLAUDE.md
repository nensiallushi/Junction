# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Docs-First Rule (Read Before Coding)

Treat `docs/` as the **canonical source of truth** for design language, coding conventions, and package usage. These docs are **not optional reference** — follow them religiously. If code and docs disagree, follow the docs unless the user explicitly asks otherwise. Never invent a color, spacing value, radius, component API, or convention that the docs already define.

Read the relevant doc(s) **before** writing or changing code:

| When you are… | Read first (and obey) |
|---|---|
| Building or touching **any UI** — colors, spacing, type, layout, motion, components | **`docs/DESIGN.md`** — the design bible. Distilled in [Design System](#design-system--docsdesignmd-follow-religiously) below. |
| Orienting in the docs | `docs/index.md` — docs navigation hub |
| Writing TS/JS, React components, or Next.js code | `docs/agents/AGENTS-style.md`, `AGENTS-components.md`, `AGENTS-nextjs.md`, `AGENTS-packages.md` |
| Wanting a fast rule recap before a PR | `docs/agents/AGENTS-checklist.md` |
| Using a `@zenncore/*` component, util, or package | `docs/web/index.md`, `docs/shared/index.md`, `docs/mobile/index.md` (per-component pages live alongside) |

---

## Design System — `docs/DESIGN.md` (Follow Religiously)

**Every screen, component, and style change must conform to `docs/DESIGN.md`.** It is the single source of truth for the visual language. When it specifies a token, use that token. When in doubt, open `docs/DESIGN.md` and the section that covers what you're building. The rules below are a distillation — the full file wins on any conflict.

### Design principles (never violate)
- **Clarity over decoration** — every element earns its place by aiding comprehension. No gratuitous decoration.
- **Gravity without anxiety** — deliberate dark theme; premium and trustworthy, never a harsh clinical terminal.
- **Progressive disclosure** — layer information: verdict → action → evidence. Most critical takeaway first, detail expandable below.
- **Weight over size** — establish hierarchy with font weight (SemiBold vs Regular), not large size jumps.
- **Redundant severity encoding** — severity is always color **+ shape + icon** (diamond/triangle/circle), never color alone — this is an accessibility requirement.

### Tokens (map these to semantic Tailwind tokens — never hard-code hex in components)
```css
/* Backgrounds — dual-layer dark */
--bg-outer:          #08111F;  /* outer stage/canvas, with ambient blue glow */
--bg-app:            #0D1629;  /* app surface */
--bg-card:           #151E30;  /* content cards */
--bg-card-hover:     #1C2845;  /* row hover/active */
--bg-nav:            rgba(12, 18, 32, 0.75); /* nav + bottom bar use backdrop-blur */
/* Accent — the only fully saturated hue; everything else desaturated */
--accent-primary:    #3B4EE8;
--accent-primary-lt: #4B5EF8;
/* Severity (color + shape + icon, always together) */
--severity-critical: #E53935;  /* red, diamond/shield */
--severity-moderate: #F59E0B;  /* amber, triangle */
--severity-normal:   #22C55E;  /* green, circle/check */
/* Text */
--text-primary:      #E8EAF0;
--text-secondary:    #8A95B0;
--text-link:         #E07B50;  /* warm orange-rust, underlined — for significant/linked terms */
--text-warning:      #F59E0B;
--text-caption:      #5A6580;
--glow-blue:         rgba(26, 58, 143, 0.25);
/* Radius — multi-tier */
--radius-device: 16px; --radius-card: 12px; --radius-row: 10px; --radius-icon: 10px;
--radius-pill: 999px;  /* ALL buttons are pills */
/* Type */
--font-family: 'Inter', 'DM Sans', system-ui, sans-serif;
--font-weight-regular: 400; --font-weight-medium: 500; --font-weight-semibold: 600;
/* Effects */
--blur-nav: blur(14px); --blur-bar: blur(12px); --shadow-card: 0 2px 12px rgba(0,0,0,0.35);
```

### Hard rules
- **All buttons are pills** (`--radius-pill`). Cards `12px`, rows/icons `10px`, device frame `16px`.
- **Accent blue is the only saturated color.** Primary CTAs only; don't sprinkle it.
- **Dark, dual-layer backgrounds** with a soft radial blue ambient glow behind the app chrome — never flat black, never bright.
- **Single geometric sans** (Inter family). Generous line height (~1.5–1.6×) on body/medical text.
- **Nav and bottom action bar** are semi-transparent with `backdrop-blur` (glassmorphism), consistent at top and bottom.
- **Motion is subtle and purposeful** — overlay cross-fade ~200ms ease-in / ~150ms ease-out; staggered fade-up card entrance (~300ms, 100ms stagger). Use the `Motion` library (already in the stack).

These map onto the existing **"Styling — semantic Tailwind tokens only"** rule: express every DESIGN.md token through `text-primary`, `bg-card`, `bg-background`, `rounded-*`, etc. — never raw hex or `text-gray-500` in a component.


---

## Commands

All commands use **Bun** as the package manager. Run from the monorepo root unless noted.

```bash
# Development
bun run dev           # Start all apps (Turborepo)
bun run dev:web       # Start only the Next.js web app

# Build & type checking
bun run build         # Build all packages
bun run build:web     # Build only web app
bun run typecheck     # tsc --noEmit across all packages

# Linting (Biome)
bun run lint          # biome check --write (root)
cd apps/web && bun run lint  # biome check --write --unsafe (web only)

# Database (run from apps/web/)
bun run db:generate   # Generate Drizzle migration files
bun run db:migrate    # Apply pending migrations
bun run db:push       # Push schema directly (dev only)
bun run db:studio     # Open Drizzle Studio UI
bun run db:reset      # Reset database (scripts/reset.ts)
```

There are no automated tests in this codebase currently.

---

## Monorepo Structure

```
/
├── apps/web/                 # Main Next.js 16 application
│   ├── src/
│   │   ├── app/              # Next.js App Router pages
│   │   ├── components/       # Shared app-level components
│   │   ├── server/           # All server-side code (actions, DB, utils)
│   │   └── lib/              # Client-side utilities (auth client, mocks, animations)
│   └── drizzle/              # Generated migration files
└── packages/
    ├── web/                  # @zenncore/web — UI component library + Tailwind config
    ├── shared/
    │   ├── utils/            # @zenncore/utils — cn, resultify, Result type, hooks
    │   ├── inferred-form/    # @zenncore/inferred-form — schema-driven form builder
    │   ├── data-table/       # @zenncore/data-table — TanStack Table wrapper
    │   ├── icons/            # @zenncore/icons
    │   ├── phone/            # @zenncore/phone — phone input utilities
    │   └── config/           # @zenncore/config — shared TS/Tailwind/tsdown configs
    └── mobile/               # @zenncore/mobile (placeholder)
```

---

## Server Architecture (`apps/web/src/server/`)

### Three-layer structure:

**1. Database** (`server/database/`)
- Drizzle ORM + PostgreSQL via `postgres.js`
- Schema in `schema.ts`: `user`, `session`, `account`, `verification`, `store`, `store_account` (Shopify OAuth tokens per store), `product`, `competitor`, `scan`, `simulation`, `ucpProfile`, `agentVisit`, `agentTrafficDaily`, `listingOptimization` (listing rewrites + win-rate lift tracking), `subscription` (Stripe billing state), `agentApiKey` (hashed agent API keys), `blogPost`
- Relations defined alongside schema for typed joins
- Config in `apps/web/drizzle.config.ts`

**2. Utilities** (`server/utils/`)
- **Context system**: `withContext()` → base wrapper (auth API, Sentry, storage); `withAuthentication()` → adds `session`; `withAuthorization()` → adds role checks
- **Repository pattern**: `repository(schema.table)` returns typed `get`, `create`, `update`, `destroy`, `find`, `paginate`, `exists`, `count`
- **Error classes**: `DatabaseError`, `NotFoundError`, `RequestError`, `TimeoutError`, `ParseError`, `UnauthenticatedError`, `UnauthorizedError`, `InvalidCredentialsError`
- **HTTP**: `request(url, options, { timeout })` → `Result<Response, Error>`; `parse<T>(response)` → `Result<T, Error>`

**3. Server actions** (`server/app/`)
- `authentication.ts` — signIn, signUp, signOut, verifyEmail, resetPassword, getCurrentUser
- `store.ts`, `product.ts`, `competitor.ts`, `scan.ts`, `simulation.ts` — CRUD via repository
- `storage.ts` — UploadThing storage integration
- `tracking.ts` — AI agent visit tracking
- `user.ts`, `session.ts` — user/session management
- `integration/shopify.ts` — OAuth token exchange + product sync via Shopify Admin API
- `integration/woocommerce.ts` — credential validation + paginated product fetch
- `integration/feed.ts` — XML/JSON auto-detection + Google Shopping format parsing
- `intelligence/simulate.ts` — AI simulation engine (GPT-4, Claude, Gemini, Perplexity perspectives)

---

## App Router Structure (`apps/web/src/app/`)

```
app/
├── (auth)/                       # Route group — sign-in, sign-up, onboarding
│   ├── sign-in/
│   ├── sign-up/
│   └── onboarding/               # connect → products → competitors → scan
├── (main)/                       # Route group — landing page + protected pages
│   ├── page.tsx                  # Landing page
│   ├── _components/              # Landing page components
│   ├── privacy-policy/
│   └── dashboard/                # Protected pages (PPR + streaming)
│       ├── products/             # Product list + detail views
│       ├── competitors/
│       ├── reports/
│       ├── optimize/
│       ├── ucp/                  # Universal Commerce Protocol
│       └── settings/
├── (provider)/                   # Route group — API routes
│   └── api/
│       ├── auth/[...all]/        # Better Auth route handler
│       ├── integrations/         # Shopify OAuth install + callback
│       ├── cron/                 # Scheduled job endpoints
│       └── tracking/             # Agent visit tracking endpoints
├── layout.tsx
├── globals.css
├── manifest.ts
├── robots.ts
└── sitemap.ts
```

Client components live in `_components/` subdirectories next to their page.

### PPR and Streaming (dashboard and app screens)

Every `page.tsx` must be a **server component** that exports real HTML — not a thin wrapper around a single client component. Use **Partial Prerendering (PPR)** and streaming:

- **Static shell** — Render in `page.tsx`: layout, page title, description, headings. This is the initial HTML.
- **Data** — Fetch in **async server components** (same file or `_components/`). Wrap each in `<Suspense fallback={<Skeleton />}>` with a skeleton that matches the content shape.
- **Streaming** — The server sends the shell first, then streams in resolved async components so users see content as it loads.

Onboarding/auth screens may be client-heavy by design; all other screens (dashboard, settings, lists, details) follow this pattern. See AGENTS.md §21b and §23f.

---

## Key Patterns

### Error handling — `resultify` in actions, `unwrapResult` in server components
```ts
// In server actions / utilities — use resultify + manual checks
import { resultify } from "@zenncore/utils";
const result = await resultify(() => fetch(url));
if (!result.success) return { success: false, error: result.error };
return { success: true, data: result.data };

// In server components (inside Suspense) — use unwrapResult, throws on error
import { unwrapResult } from "@zenncore/utils";
import { Environment } from "@/server/utils/environment";
const products = await unwrapResult(Products.skimForCurrentUser(Environment.SERVER));
```

### Server module imports — namespace pattern
```ts
// Server components: full namespace (functions + types)
import * as Products from "@/server/app/product";

// Client components: type-only namespace (no server code bundled)
import type * as Products from "@/server/app/product";
```

### Forms — use `InferredForm` + `field()`
All forms are defined via Zod schema + `field()` descriptors. No inline `<input>` or manual react-hook-form registration.

### Styling — semantic Tailwind tokens only
Use `text-primary`, `bg-background`, `border-accent-foreground`, etc. Never raw colors like `text-gray-500` or `bg-white`. Every color, radius, weight, and motion value must trace back to **`docs/DESIGN.md`** (see [Design System](#design-system--docsdesignmd-follow-religiously)). When a needed token isn't defined, add it to the theme to match DESIGN.md rather than hard-coding hex in a component.

### Components — Namespace pattern
```tsx
const Feature = {
  Root: ({ children }) => <div>{children}</div>,
  Title: ({ children }) => <h2>{children}</h2>,
};
```

### Conditionals — `switch (true)` over long `if/else if` chains
### Derived values — IIFE for scoped intermediate logic
### Variables — `const` only, no `let`; no abbreviated names (`context` not `ctx`, `error` not `err`)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16, React 19, React Compiler |
| Database | PostgreSQL, Drizzle ORM 1.0 beta |
| Auth | Better Auth 1.5 (email/password + Drizzle adapter) |
| AI | Vercel AI SDK 6.0 + Azure AI |
| Email | Resend + React Email |
| Storage | UploadThing |
| Styling | Tailwind CSS 4 |
| Animations | Motion (Framer Motion fork) |
| Charts | Recharts |
| URL State | nuqs |
| Monitoring | Sentry + PostHog |
| Linting | Biome (no ESLint/Prettier) |
| Build | Turborepo + Bun |

---