<div align="center">
  <img src="assets/header.svg" width="800" alt="ThrowingTracker v2.0"/>
</div>

<br/>

<div align="center">

[![Typing SVG](https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=18&duration=2800&pause=900&color=7C3AED&center=true&vCenter=true&width=560&lines=Track+every+session.+Analyze+every+throw.;54.9m.+Season+PR.+Meet+Day+Mode.;Know+your+numbers+before+competition+day.;Built+for+Shot+Put%2C+Discus%2C+Hammer%2C+Javelin.)](https://git.io/typing-svg)

</div>

<br/>

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-06B6D4?style=flat-square&logo=tailwindcss)
![PWA](https://img.shields.io/badge/PWA-Ready-5A0FC8?style=flat-square)
![License: MIT](https://img.shields.io/badge/License-MIT-green?style=flat-square)

</div>

---

## Why This Exists

Most throwing athletes log sessions in a notes app, a spiral notebook, or not at all.
When competition season starts, they're guessing — guessing which implement felt best in
February, guessing what RPE correlated with their peak marks, guessing why their discus
keeps drifting left.

ThrowingTracker was built to eliminate the guessing. Purpose-built for Shot Put, Discus,
Hammer, Weight Throw, and Javelin athletes — not a generic fitness tracker with throwing
bolted on.

Log a session after practice. See your trend line move. Know exactly where you stand
going into Saturday's meet.

---

## See It In Action
You switch to Meet Day Mode before warm-ups.

├─ Attempt 1: 51.8m ✓
├─ Attempt 2: FOUL ✗
├─ Attempt 3: 53.1m ✓ ← Live best updates automatically
├─ Attempt 4: 52.7m ✓
├─ Attempt 5: 54.9m ✓ ← New season PR — celebration fires
└─ Attempt 6: FOUL ✗

Session saved. Dashboard updates. PR recorded.

text


---

## What Problems This Solves

| The Problem | What Throwers Do Now | What ThrowingTracker Does |
|---|---|---|
| No throw history | Notes app, memory, paper | Structured session log — marks, RPE, media |
| Can't see progress | "I think I've been improving?" | Line charts with mark progression over any time window |
| Don't know landing patterns | Coach watches, guesses | Canvas sector map — plot every throw, see the cluster |
| Competition tracking is chaos | Paper scorecard, mental math | Meet Day Mode — 6 attempts, live best, foul tracking |
| No consistency motivation | Streaks break silently | 16 badges, animated PR alerts, streak counter |
| Video buried in camera roll | Scrub manually, lose context | Slow-mo player with frame stepping and annotations |
| Data locked in the app | Start over on new device | JSON and CSV export with merge or replace import |

---

## Core Features

**🎯 Session Logging** — Event, session type, individual throw marks, RPE (1–10),
and media. Everything stored locally, no account needed.

**📊 Progress Charts** — Marks over time, weekly throw volume, and RPE trends.
Built with Recharts. See plateaus and breakthroughs clearly.

**🗺️ Landing Zone Tracker** — Canvas-rendered 34.92° regulation sector diagram.
Plot every throw, overlay multiple sessions, see where your marks actually cluster.
If your discus drifts right consistently, you'll see it in three sessions.

**🏆 Meet Day Mode** — 6 attempt slots, mark or foul buttons, live competition
best tracking, and automatic PR detection. When the meet ends, the session saves.

**🎬 Video Analysis** — Slow-mo playback (0.25x–1x), frame-by-frame stepping,
and drawing annotations directly on frame. Stored in IndexedDB — no upload, no fee.

**📤 Data Export** — JSON and CSV export. JSON import with merge or replace modes.
Your data belongs to you.

---

## Achievement Badges

<div align="center">
  <img src="assets/badges/iron-streak.svg" width="72" alt="Iron Streak"/>
  &nbsp;&nbsp;
  <img src="assets/badges/first-pr.svg" width="72" alt="First PR"/>
  &nbsp;&nbsp;
  <img src="assets/badges/century-throws.svg" width="72" alt="Century Throws"/>
  &nbsp;&nbsp;
  <img src="assets/badges/meet-day-hero.svg" width="72" alt="Meet Day Hero"/>
</div>

<br/>

16 badges across 5 categories — Milestone, Streak, Competition, Volume, and Special.
All built around throwing-specific goals, not generic fitness checkboxes.
Toast notifications fire on unlock. PR celebration overlay triggers mid-session.

---

## Quick Start

```bash
git clone https://github.com/Waleee7/ThrowingTracker.git
cd ThrowingTracker
npm install
npm run dev
Open http://localhost:3000 — onboarding walks you through
setup in 3 steps. No account. No API key. No configuration.

Tech Stack
Layer	Tool	Why
Framework	Next.js 15 (App Router)	Static export — deploy anywhere for free
Language	TypeScript (strict)	Every session and badge fully typed
Styling	Tailwind CSS v4 + custom CSS	Utility-first, custom for canvas and animations
Charts	Recharts	React-native, no D3 configuration needed
Sector Map	HTML5 Canvas API	Sector geometry requires direct canvas control
Video	HTML5 Video API	Frame-accurate seeking for slow-mo and annotations
Storage	localStorage + IndexedDB	Sessions in localStorage, media in IndexedDB
Deployment	Vercel	npm run build → /out → deploy anywhere
Architecture
text

src/
├── app/
│   ├── layout.tsx              # Root layout — PWA meta, dark mode
│   ├── page.tsx                # App shell — tab routing, global state
│   └── globals.css             # Design system (~2000 lines)
├── components/
│   ├── DashboardTab.tsx        # Stats grid, PB cards, streak, badges
│   ├── LogTab.tsx              # Session form — event, throws, RPE, media
│   ├── HistoryTab.tsx          # Session list — recent / weekly / monthly
│   ├── ProgressChart.tsx       # Marks, volume, RPE charts
│   ├── SectorMap.tsx           # Canvas sector diagram + scatter plotting
│   ├── ThrowScatter.tsx        # Multi-session scatter overlay
│   ├── VideoPlayer.tsx         # Slow-mo, frame step, annotation layer
│   ├── MeetDayMode.tsx         # 6 attempts, foul/mark, live best
│   ├── AchievementBadges.tsx   # Badge gallery + dashboard chips
│   ├── AchievementToast.tsx    # Badge unlock notification
│   └── PRAlert.tsx             # PR celebration overlay
├── lib/
│   ├── types.ts                # Session, Throw, Badge, Profile interfaces
│   ├── analytics.ts            # Streak, volume, RPE calculations
│   ├── personal-bests.ts       # All-time and season PB detection
│   ├── achievements.ts         # 16 badge definitions and unlock checks
│   └── export.ts               # JSON/CSV export, import with merge/replace
└── hooks/
    ├── useProfile.ts           # Profile state and persistence
    └── useSessions.ts          # Session CRUD + localStorage sync
Deployment
Vercel — connect the repo, it auto-detects Next.js and deploys on every push.

Any static host — npm run build outputs to /out.
Drop it on Netlify, GitHub Pages, or Cloudflare Pages.

PWA — installs like a native app on iOS and Android. Works fully offline once cached.

Data Storage
No server. No account. Nothing leaves your device.

Store	Contents
localStorage	Sessions, profile, preferences
IndexedDB	Videos and image files
Back up regularly — Profile → Data Management → Export JSON

Roadmap
 Session logging — marks, RPE, media
 Progress charts — marks, volume, RPE
 Canvas sector map with scatter analysis
 Meet Day Mode — 6 attempts, live best, fouls
 16 achievement badges with toast notifications
 Video slow-mo player with annotations
 Personal best detection — all-time and season
 JSON and CSV export with import modes
 Dark mode + PWA install
 Coach share — session report as PDF or shareable link
 Wind reading field for legal/illegal mark tracking
 Head-to-head competition history
 Training block planner with auto periodization
Contributing
Athlete feedback drives the roadmap. If you throw and have a feature request,
open an issue and describe the problem.

Bash

git checkout -b feature/your-feature-name
# make changes
git commit -m "feat: describe what you added"
git push origin feature/your-feature-name
# open a pull request
License
MIT — free to use, modify, and distribute.

<div align="center"> <img src="https://capsule-render.vercel.app/api?type=waving&color=4F46E5,7C3AED,DB2777&height=80&section=footer" width="100%"/> </div><div align="center"> <sub>Built for throwers. By someone who knows what it's like to have no idea where that last throw went.</sub> </div> ```
