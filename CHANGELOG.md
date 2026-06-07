# Changelog

## [3.1.0] — 2026-06-07 — Roadmap features: Technique Library, fast logging, glance card

Built the top of the research roadmap (`_overhaul/ROADMAP-FITNESS.md`).

### Added
- **Technique / Form Library (Phase 1)** — new `/technique` route + `TechniqueLibrary` component driven by `lib/technique.ts`: per-event key focus, phase-by-phase coaching cues (shot put has Glide + Rotational), and common-fault → fix pairs, anchored by each event's cinematic still. Linked from the Log tab (current event), the Dashboard, and the Coach tab. The defensible moat — no throws animation library exists to license.
- **Glanceable "Today" card** (`TodayCard`) — one Fraunces hero stat + a one-line status ("Last session avg · streak · readiness call") at the top of the dashboard. Answers "what's my status today?" in <10s.
- **Sub-3-second logging** — selecting an event in the Log tab now auto-fills implement weight, unit, and RPE from your last session of that event (editable, with a "↻ Pre-filled" note), plus a "View technique" deep link.
- Generated achievement **medal art** (5 categories) via nano-banana, baked to WebP.

### Changed
- Color vocabulary tightened to *meaning* (lime = PB/positive only) across the remaining surfaces; fixed lingering indigo/blue/pink leftovers in onboarding (Get Started, feature bullets, selected pills), History meet tags, Profile section labels, the Log "Standard weights" link, and Meet Day (Start Competition, live PR).

## [3.0.0] — 2026-06-07 — Broadcast Sports Editorial overhaul

A complete visual-system overhaul plus correctness fixes and generated cinematic imagery. Functionality is preserved; the look is rebuilt from the ground up.

### Added
- **Design-token system** — a Tailwind v4 `@theme` layer (ink palette + electric-lime accent, Fraunces / JetBrains Mono / Inter type scale, motion + radius + shadow tokens). One token set drives both registers.
- **Dark-first + paper registers** — dark "broadcast" is now the default; the existing toggle flips to a clean paper register. Both fully themed.
- **`HeroMedia` component** — still-first cinematic hero with ken-burns pan, dark scrim, and a video seam (drop `public/media/hero.mp4` later to promote to a looping clip; no code change needed).
- **Generated broadcast imagery** — cohesive AI-generated stills (dashboard hero, 5 per-event heroes, onboarding splash, empty-state, Season-Wrapped backdrop), baked to WebP (~580 KB total).
- **Chart theming** — `src/lib/theme.ts` (`getChartTheme` / `eventColor` / `heatStop`) reads CSS tokens at runtime, register-aware; PB/max points marked in lime, most-recent in white.
- **Accessibility** — skip-to-content link, `aria-current` + nav label, `aria-label` on icon-only controls, SectorMap canvas text fallback, pinch-zoom restored (dropped `maximumScale`), visible `:focus-visible` rings.
- Image optimizer enabled (AVIF/WebP) via `next/image`.

### Changed
- Replaced the cream "Pressbox/Steel" theme with the Broadcast Sports Editorial system across every surface (dashboard, log, history, progress, coach, profile, meet day, onboarding, season wrapped, PR alert, achievements, empty states).
- `EVENT_COLORS` re-keyed to per-event identity hues; PB signal unified to lime (was gold).
- Meet Day is now a dark "arena" surface in both registers (fixes prior white-on-cream invisibility).
- Removed dead glassmorphism/background layers and the unused 6.4 MB background asset.

### Fixed
- `fromDateKey` no longer emits `Invalid Date` / `NaN` on malformed or empty date keys (was blanking charts).
- Season-best boundary now compares dates all-local (was mixing UTC/local around the Aug 31 / Sep 1 cutover).
- Import validation now checks per-field types (numeric marks, sane throws/RPE) before writing, so a malformed backup can't corrupt storage.
- Added tests for all three (`dates.test.ts`, `export.test.ts`, season-boundary cases) — 77 tests passing.

### Notes
- The AI Coach route, model IDs, streaming/fallback contract, and prompt caching are unchanged.
- A research roadmap for future work (fitness-app patterns, API/platform strategy, per-event Technique/Form Library) lives in `_overhaul/ROADMAP-FITNESS.md`.

## [2.0.0]
- Prior release: training log, Meet Day Mode, progress charts, landing-zone sector map, video analysis, achievements, Season Wrapped, AI Coach, PWA.
