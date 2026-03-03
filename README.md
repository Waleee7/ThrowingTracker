<div align="center">

<img src="https://readme-typing-svg.demolab.com?font=Inter&weight=700&size=36&duration=1&pause=999999&color=7C3AED&center=true&vCenter=true&width=600&height=60&lines=ThrowingTracker+v2.0" alt="ThrowingTracker v2.0"/>

**A structured training log and analytics platform for competitive track and field throwers.**

<br/>

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-06B6D4?style=flat-square&logo=tailwindcss)
![PWA](https://img.shields.io/badge/PWA-Ready-5A0FC8?style=flat-square)
![Local First](https://img.shields.io/badge/Local--First-No%20Server-10B981?style=flat-square)
![License: MIT](https://img.shields.io/badge/License-MIT-green?style=flat-square)

</div>

---

## Why This Exists

Throwing athletes train year-round and compete across multiple seasons, but most of them
track their progress in a notes app, a spreadsheet cobbled together mid-season, or nothing
at all. Coaches work off memory and handwritten marks. When it comes time to evaluate a
training block, peak a thrower for conference championships, or identify a technical
pattern across 200 throws, the data simply isn't there.

The existing tools don't fit. Generic fitness apps aren't built around attempts, fouls,
sector landings, or RPE-correlated distance output. Spreadsheets don't detect flash patterns
in landing zones or fire a PR alert mid-competition. Notebooks don't export a CSV for
the coaching staff.

ThrowingTracker exists because throwing athletes deserve the same data infrastructure
that team sport athletes have had for years — structured, searchable, and built around
how this sport actually works.

The philosophy is simple: log the session, see the data, make better decisions.

---

## See It In Action
Athlete opens ThrowingTracker after Thursday's discus session.

Dashboard shows:
├─ Season PB: 54.3m (set 3 weeks ago)
├─ Current streak: 9 consecutive training days
├─ Weekly volume: 47 throws across 4 sessions
├─ RPE trend: averaging 7.2 this block
└─ Badge unlocked: "Iron Streak" — 10 days consistent

Coach asks: "Where are your throws landing when you PR?"

Athlete opens Sector Map → overlays last 6 sessions →
cluster appears 60–65% sector depth, slightly left of center.
That's a coaching cue that didn't exist before.

Competition day. Meet Day Mode is open before warm-ups.

├─ Attempt 1: 51.8m ✓
├─ Attempt 2: FOUL ✗
├─ Attempt 3: 53.1m ✓ ← live best updates
├─ Attempt 4: 52.7m ✓
├─ Attempt 5: 54.9m ✓ ← season PR — celebration fires
└─ Attempt 6: FOUL ✗

Session auto-saves. Dashboard updates. PR recorded.
No manual entry after the fact.

text


---

## What This Solves

| Problem | Status Quo | ThrowingTracker |
|---|---|---|
| No structured throw history | Notes app, memory, paper | Session log with marks, RPE, timestamps, media |
| Can't identify progress trends | "I think I'm improving" | Line charts across any date range |
| No landing zone data | Coach watches, estimates | Canvas sector map with per-throw scatter plotting |
| Competition tracking is manual | Paper scorecard, mental math | Meet Day Mode — 6 attempts, fouls, live best |
| Video buried in camera roll | Manual scrub, no context | Slow-mo player with frame stepping and annotations |
| Data doesn't survive device changes | Start over | JSON and CSV export with merge or replace import |

---

## Quick Start

```bash
git clone https://github.com/Waleee7/ThrowingTracker.git
cd ThrowingTracker
npm install
npm run dev
Open http://localhost:3000

No account. No API key. No environment variables. Data lives entirely in the browser.

Features
Session Logging — Log training and competition sessions with event selection,
individual throw marks, RPE (1–10), session type, and media attachments. Every session
is typed and persisted to localStorage immediately.

Progress Charts — Three Recharts-powered views: marks over time (line), weekly
throw volume (bar), and RPE trends (composed). Built to surface patterns across
training blocks, not just individual sessions.

Landing Zone Tracker — A canvas-rendered 34.92° regulation throwing sector where
athletes plot individual throw landings. Multi-session overlay reveals drift, consistency,
and sector preference that no other tool in this category surfaces.

Meet Day Mode — A dedicated competition interface with 6 attempt slots, single-tap
mark and foul entry, automatic live-best tracking, and mid-competition PR detection.
Designed to be used with one hand, under pressure, at the ring.

Video Analysis — Slow-motion playback from 0.25x to 1x, frame-by-frame stepping,
and freehand annotation overlay directly on the video frame. Stored in IndexedDB —
no upload, no third-party service, no recurring cost.

Achievement System — 16 badges across 5 categories (Milestone, Streak, Competition,
Volume, Special) built around throwing-specific thresholds, not generic fitness goals.
Toast notifications on unlock. Animated PR overlay on personal best.

Data Portability — JSON and CSV export at any time. JSON import with merge or
replace modes. No lock-in.

Tech Stack
Layer	Tool	Decision
Framework	Next.js 15 (App Router)	Static export — deploys anywhere, no server required
Language	TypeScript (strict)	All sessions, throws, badges, and profiles fully typed
Styling	Tailwind CSS v4 + custom CSS	Utility-first with custom layers for canvas and animation
Charts	Recharts	React-native, composable, no D3 configuration overhead
Sector Map	HTML5 Canvas API	Sector geometry and scatter plotting require direct canvas control
Video	HTML5 Video API	Frame-accurate seeking for slow-mo playback and annotation
Session Storage	localStorage (typed wrapper)	Zero-infrastructure persistence for all structured data
Media Storage	IndexedDB	Binary storage for video and image files attached to sessions
Deployment	Vercel	Automatic Next.js detection, deploys on every push to main
Architecture
text

src/
├── app/
│   ├── layout.tsx              # Root layout — PWA meta, dark mode
│   ├── page.tsx                # App shell — tab routing, global state
│   └── globals.css             # Design system (~2000 lines)
├── components/
│   ├── DashboardTab.tsx        # Stats grid, PB cards, streak, badges
│   ├── LogTab.tsx              # Session form — event, marks, RPE, media
│   ├── HistoryTab.tsx          # Session list — recent / weekly / monthly
│   ├── ProgressChart.tsx       # Recharts line / bar / composed views
│   ├── SectorMap.tsx           # Canvas sector diagram + scatter plotting
│   ├── ThrowScatter.tsx        # Multi-session scatter overlay
│   ├── VideoPlayer.tsx         # Slow-mo, frame step, annotation layer
│   ├── MeetDayMode.tsx         # 6 attempts, foul/mark, live best, PR
│   ├── AchievementBadges.tsx   # Badge gallery + compact dashboard chips
│   ├── AchievementToast.tsx    # Badge unlock toast
│   └── PRAlert.tsx             # PR celebration overlay
├── lib/
│   ├── types.ts                # Session, Throw, Badge, Profile interfaces
│   ├── analytics.ts            # Streak, volume, RPE calculation engine
│   ├── personal-bests.ts       # All-time and season PB detection
│   ├── achievements.ts         # 16 badge definitions and unlock logic
│   └── export.ts               # JSON/CSV export, import with merge/replace
└── hooks/
    ├── useProfile.ts           # Profile state and persistence
    └── useSessions.ts          # Session CRUD + localStorage sync
Data Storage
All data lives in the browser. No server, no account, no data sent anywhere.

Store	Key	Contents
localStorage	throwingProfile	Name, height, weight, events, preferences
localStorage	throwingSessions	All sessions, throws, marks, RPE, metadata
localStorage	throwingDarkMode	Theme preference
IndexedDB	media-store	Video and image files attached to sessions
Back up regularly: Profile → Data Management → Export JSON

Deployment
Vercel (recommended) — connect the repo, zero configuration required.
Deploys automatically on push to main.

Any static host — npm run build outputs to /out.
Compatible with Netlify, GitHub Pages, and Cloudflare Pages.

PWA — ships with a full manifest and SVG icons.
Installs as a native-like app on iOS and Android. Works offline after first load.

Roadmap
 Session logging — marks, RPE, media, session type
 Progress charts — marks over time, weekly volume, RPE trends
 Canvas sector map with per-throw scatter and multi-session overlay
 Meet Day Mode — 6 attempts, live best, foul tracking, auto-save
 16 achievement badges with toast notifications and PR overlay
 Video slow-mo player with frame stepping and annotation layer
 Personal best detection — all-time and season
 JSON and CSV export with merge and replace import
 Dark mode and PWA install support
 Coach share — export session report as PDF or shareable link
 Wind reading field for legal and illegal mark distinction
 Head-to-head competition history between athletes
 Training block planner with periodization output
Contributing
Issues and pull requests are open. If you coach or compete in the throws and have
a feature request grounded in how the sport actually works, open an issue.

Bash

git checkout -b feature/your-feature-name
git commit -m "feat: describe what you added"
git push origin feature/your-feature-name
# open a pull request against main
License
MIT — free to use, modify, and distribute. See LICENSE for full terms.
