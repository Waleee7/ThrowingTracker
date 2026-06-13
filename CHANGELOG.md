# Changelog

## [3.4.0] — 2026-06-13 — Fable 5 turn-up: full tokenization + resilience pass

### Changed
- **Design system fully tokenized** — the last ~225 hardcoded color literals in `globals.css` (the leftover steel-era indigo `#2f5575`/`#26506f`/`#3a648a`, rust `#b5482f`, and dark-register navies `rgba(20,20,35)`/`rgba(30,30,50)`/`#0f1117`) were swapped to CSS custom properties (`--accent`, `--accent-soft`, `--accent-ink`, `--danger`, `--info`, and the ink scale). Buttons, inputs, gradients, readiness tiers, coach surfaces, onboarding, and badges all now read the house tokens, so the white/orange theme is a single source of truth and a future re-skin is a token edit, not a find-and-replace.
- **New semantic tokens** — `--danger` (fouls/destructive, brightened for ink bg, drops to `#B5482F` on paper), `--info` (the "ok" readiness tier — kept off-orange so it can never collide with the warn state, which previously rendered identical orange), `--accent-soft`/`--accent-ink` for gradients, and `--focus-ring`. `rgba()` overlays became `color-mix(in srgb, …)` so opacity tints track the token.
- **`body`/`.app` base colors** now read `--bg`/`--text` instead of hardcoded `#fff`/`#000`, fixing the light/dark register seam at the root.

### Added
- **Storage-failure alerting** — a failed `localStorage` write (quota exceeded / private mode) now dispatches a `tt:storage-error` event and surfaces a persistent `StorageAlert` banner. Previously a dropped write looked saved until the next reload, then silently vanished — the worst failure mode for a training log.
- **Chart error boundaries** — `ProgressChart`, `ThrowScatter`, and `PRTimeline` are each wrapped in `ChartErrorBoundary`. A single malformed session record now degrades to a quiet "couldn't draw this — your data is safe" fallback with a retry, instead of white-screening the Progress page.
- **Blanket reduced-motion guard** — a catch-all `@media (prefers-reduced-motion: reduce)` rule neutralizes the 20+ animations that individual queries didn't enumerate (voice pulse, count-ups, sweeps, etc.).

### Notes
- All 107 tests pass; production build clean. Visually verified in both light and dark registers (dashboard, progress charts, coach).

## [3.3.0] — 2026-06-12 — Stadium Walkout finale + Film Room (POLISH-PLAN.md wave 3)

### Added
- **Film Room** — the Technique tab is now a hub: **Library | Film Room**. Athletes load their *own* video (stored locally in IndexedDB), scrub it frame-by-frame with slow-mo (0.25/0.5/1x), and draw on the film — freehand, straight lines, and an angle tool that measures degrees. Touch + mouse (pointer events). **Voice-over film sessions:** hit record, talk through the tape while you play/pause/slow/seek it — the transport timeline is captured alongside the mic audio, and **Replay** drives the video off your narration clock exactly the way you reviewed it (`lib/film.ts` · `videoPosAt`, unit-tested). Annotated frames export to the share sheet. Sport-agnostic by design — any athlete, any sport. Deep link: `/technique?mode=film`.
- **Stadium Walkout onboarding finale** — setup now ends with a full-screen moment: spotlight sweep, your name rising starting-lineup style, the tier **stamping down in lime** with a shake + haptic + confetti burst, reasons typing in, and a share-card button. Respects `prefers-reduced-motion`.

### Notes
- The orphaned `VideoPlayer` analysis engine (built in v2.0, never wired into any surface) provided the frame-step/annotation patterns; the Film Room supersedes it as the user-facing film tool.
- Film Room media never leaves the device (IndexedDB blobs + localStorage records; wiped by Log Out & Reset).

## [3.2.0] — 2026-06-11 — Feel layer: share cards, stakes, recap, smart streak (POLISH-PLAN.md wave 2)

### Added
- **Share cards** — PR alerts, PB cards, and the weekly recap render a branded 1080×1920 story image (`lib/share-card.ts`, dep-free canvas) and hand it to the native share sheet (`navigator.share` with files), falling back to a PNG download on desktop.
- **Goals & meets** — new Profile → "Goals & Meets" editor (upcoming meets with dates, per-event goal marks entered in your display unit). The dashboard gains a stakes card: next-meet countdown ("in 23 days", hot state ≤3 days) + per-event goal progress bars (lime when hit). New `lib/goals.ts`, `Meet`/`GoalMark` types, storage-backed.
- **Weekly Recap** — a "Your Week" overlay the first time you open the app each week: best mark, sessions/throws/RPE, deltas vs the prior week, PR-week badge, and a rule-based coach line (`lib/recap.ts`). On/Off toggle in Profile → Preferences (default on).
- **PR Timeline** — Progress tab now shows the athlete's milestone rail: every time the all-time best moved, with +deltas and event filter chips (`PRTimeline.tsx`).
- **Count-up stats** — Today-card hero mark and readiness score animate scoreboard-style (`useCountUp`, respects reduced motion).
- **Technique Phase-2 video seam** — `TechniquePhase.video`: drop a muted looping clip at `/public/media/technique/<event>/<phase>.mp4`, set the path, and the library renders it above the cues.

### Changed
- **Smart streak** — `calculateStreak` now counts training days and a single rest day no longer breaks the chain (2+ consecutive idle days do). The app's own readiness score tells athletes to rest; the streak stops punishing them for listening.
- PR alert: house-palette confetti (was steel-era colors), 5s auto-dismiss, Share button (sharing cancels the dismiss timer).
- Haptics consolidated behind `lib/haptics.ts`; share actions buzz lightly.

### Tests
- New suites: `analytics.test.ts` (smart streak), `goals.test.ts`, `recap.test.ts`.

## [3.1.1] — 2026-06-10 — Fix-first polish pass (see POLISH-PLAN.md)

### Fixed
- **Technique Library is now in the primary nav** (was only reachable via dashboard/log buttons); nav reordered most-used-first, Profile last.
- **Chart PB color** — the v3.1 lime→orange token remap had silently turned PB dots, the Best Mark line, and the SectorMap heat ramp orange-on-orange. `theme.ts` now reads `--color-pb` (lime `#C8FF00` on dark; new darker `#65A30D` on paper so PB marks survive a white background).
- **Loading screen** no longer shows the retired Steel-gradient theme — token-driven in both registers.
- **PWA identity** — `manifest.json` was two brand generations old (indigo `#667eea`, SVG-only icons that iOS ignores). Rebranded + real PNG set (192/512 any + maskable, apple-touch-icon) generated by dep-free `scripts/generate-icons.mjs`. App logo, favicon.svg, icon-192.svg rebranded to house orange.
- **`theme-color` tracks dark mode** — meta is created pre-paint by the layout inline script and synced on toggle (was a static white status bar over the dark register).
- **Onboarding units** — new ft+in / meters pills on the PR step (smart default from body-stat units); PR entry accepts `41' 6` style input via `parseDistanceToMeters`; the choice persists as `profile.distanceUnit` (imperial users no longer start in meters).

### Changed
- Fonts self-hosted via `next/font` (Anton, Inter, JetBrains Mono) — removes the render-blocking Google Fonts request; dropped **Fraunces**, which was downloaded on every visit but used nowhere.

### Removed
- Dead 6.3 MB `public/background.jpg.png`.

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
