<h1 align="center">
  <a href="https://github.com/Waleee7/ThrowingTracker">
    <img src="https://readme-typing-svg.demolab.com?font=Inter&weight=700&size=36&duration=2000&pause=9999&color=F97316&center=true&vCenter=true&repeat=false&width=500&height=50&lines=ThrowingTracker+v2.0" alt="ThrowingTracker v2.0" />
  </a>
</h1>

<p align="center">
  A structured training log and analytics platform for competitive track & field throwers — session tracking, progress visualization, competition management, and landing zone analysis, all running locally in the browser.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-15-black?logo=next.js&logoColor=white" alt="Next.js 15"/>
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black" alt="React 19"/>
  <img src="https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind CSS"/>
  <img src="https://img.shields.io/badge/Storage-Local--First-22C55E?logo=lock&logoColor=white" alt="Local-First"/>
  <img src="https://img.shields.io/badge/PWA-Installable-8B5CF6" alt="PWA Ready"/>
  <img src="https://img.shields.io/badge/License-MIT-green" alt="MIT License"/>
  <img src="https://img.shields.io/github/v/release/Waleee7/ThrowingTracker?label=Version&color=F97316" alt="Version"/>
  <img src="https://komarev.com/ghpvc/?username=Waleee7-ThrowingTracker&label=Views&color=888888&style=flat" alt="Views"/>
</p>

---

## Why This Exists

Throwing events generate structured, repetitive data — distances, attempt sequences, session RPE, landing zones, competition results. Every practice and every meet produces numbers that should compound into insight over a season. In practice, they don't.

Most throwers track marks in the Notes app, a spreadsheet they abandon after two weeks, or not at all. Coaches collect data on paper heat sheets that never get digitized. Competition day means scribbling six attempts in the margins. By the time anyone asks "how has your shot put progressed since October?", the answer is a guess.

These are the specific problems ThrowingTracker was built to solve:

- **Fragmented training data.** Sessions, marks, RPE, and notes scattered across apps, notebooks, and memory. ThrowingTracker stores every session in a single structured format with typed fields — event, individual throws, perceived effort, media, and free-form notes.

- **No progress visibility.** Without charts, athletes and coaches can't identify plateaus, volume trends, or the relationship between training load and performance. ThrowingTracker generates line charts (marks over time), bar charts (weekly volume), and composed RPE overlays automatically from session data.

- **Competition day is manual.** Six attempts, foul tracking, and current-best awareness shouldn't require mental math and a pen. Meet Day Mode is a dedicated interface — mark or foul each attempt, see your live best, get notified on a new personal best.

- **Landing zone patterns are invisible.** Consistency in throwing isn't just about distance — it's about direction. A thrower who consistently pulls left has a technical issue that raw distance data won't reveal. The sector map plots landing positions on a canvas diagram with multi-session scatter analysis so athletes and coaches can see directional patterns over time.

- **Video review requires expensive software.** Dartfish, Hudl, and Coach's Eye charge subscription fees for slow-motion playback and annotation. ThrowingTracker includes slow-mo (0.25x–1x), frame-by-frame stepping, and drawing overlay — enough for release point analysis and position checks without a separate tool.

- **Data is locked in or lost.** Training history should be portable. ThrowingTracker exports to JSON (full backup, re-importable) and CSV (Excel, Google Sheets, custom analysis). No accounts, no cloud lock-in, no data you can't take with you.

The entire application runs in the browser. All data persists in localStorage and IndexedDB. There is no server, no authentication, and no network dependency. It installs as a PWA on any phone and works offline at the field.

---

## Quick Start

```bash
git clone https://github.com/Waleee7/ThrowingTracker.git
cd ThrowingTracker
npm install
npm run dev
Open http://localhost:3000. The onboarding flow takes 30 seconds — name, events, start logging.

Install on phone: Open in mobile Safari or Chrome → "Add to Home Screen." Runs full-screen, works offline.

Deploy: Connect to Vercel for automatic deploys, or run npm run build and host the /out directory on any static host (Netlify, GitHub Pages, Cloudflare Pages).

Features
Feature	Description
Dashboard	Stats grid, personal best cards per event, active training streak, compact achievement badges
Session Logging	Training and competition sessions with event selection, individual throws, RPE (1–10), notes, and media attachments
Meet Day Mode	Competition interface — 6 attempts, mark/foul entry, live best tracking, automatic PB detection with celebration alert
Progress Charts	Recharts-powered line charts (marks over time), bar charts (weekly volume), composed RPE trend overlays
Landing Zone Tracker	HTML5 Canvas sector diagram for plotting throw landing positions with per-session and multi-session scatter analysis
Video Analysis	Slow-motion playback (0.25x–1x), frame-by-frame stepping, drawing annotation overlay. Stored locally in IndexedDB
Personal Bests	Auto-calculated all-time and current-season PBs. Animated PR alert on new personal best
Achievement System	16 badges across 5 categories — milestone, streak, competition, volume, special. Toast notifications on unlock
Data Export/Import	JSON export (full backup), CSV export (spreadsheet-compatible), JSON import with merge or replace modes
Dark Mode	Full dark theme built from the ground up — not a CSS filter
PWA	Installable on phone with offline support. Manifest and SVG icons included
Onboarding	3-step first-time user flow — name, events, start
Supported Events
Shot Put · Discus · Hammer · Weight Throw · Javelin

Multi-event athletes can track all five simultaneously. The achievement system recognizes multi-event commitment.

Achievement Categories
Category	Count	Examples
Milestone	4	First Throw, 50 Sessions, Century Club (100)
Streak	3	7-Day, 14-Day, 30-Day Iron Streak
Competition	3	First Meet, Meet Warrior (5 meets), PB in Competition
Volume	4	500 Throws, 1K Club, 5K Throws
Special	2	Multi-Event Athlete, Full Season Tracker
Tech Stack
Layer	Tool	Purpose
Framework	Next.js 15 (App Router)	Static export, React ecosystem, Vercel integration
Language	TypeScript (strict)	Type safety across all data, analytics, and storage
UI	React 19	Component architecture
Styling	Tailwind CSS v4 + custom CSS	Design system (~2000 lines), dark mode support
Charts	Recharts	Lightweight, composable React charting
Canvas	HTML5 Canvas API	Sector map rendering, video annotation overlay
Video	HTML5 Video API	Slow-motion playback, frame-accurate stepping
Storage	localStorage + IndexedDB	Sessions and profile in localStorage, media in IndexedDB
Deploy	Vercel (static export)	Zero-config automatic deployment
Data Storage
All data lives in the browser. No server, no account, no network dependency.

Store	Contents
throwingProfile (localStorage)	Name, height, weight, selected events, notes
throwingSessions (localStorage)	All training and competition session records
throwingDarkMode (localStorage)	Theme preference
IndexedDB media-store	Videos and image files
Browser storage is not a backup. Export your data regularly from Profile → Data Management. Clearing browser data, switching browsers, or resetting your device will delete everything.

Project Structure
<details> <summary>Expand full structure</summary>
text

src/
├── app/
│   ├── layout.tsx              # Root layout, PWA meta tags, font loading
│   ├── page.tsx                # Main app — tab routing, global state, feature integration
│   └── globals.css             # Complete design system (~2000 lines)
├── components/
│   ├── DashboardTab.tsx        # Stats grid, PB cards, streak, compact badges
│   ├── LogTab.tsx              # Session logging — event, throws, RPE, notes, media
│   ├── HistoryTab.tsx          # Recent/weekly/monthly session views
│   ├── ProfileTab.tsx          # Profile form + data export/import controls
│   ├── MeetDayMode.tsx         # Competition interface — 6 attempts, fouls, live best
│   ├── ProgressChart.tsx       # Recharts line/bar/composed charts
│   ├── SectorMap.tsx           # Canvas sector diagram — per-session landing plots
│   ├── ThrowScatter.tsx        # Multi-session scatter overlay analysis
│   ├── VideoPlayer.tsx         # Slow-mo player + frame stepping + annotation canvas
│   ├── AchievementBadges.tsx   # Full gallery + compact dashboard view
│   ├── AchievementToast.tsx    # Badge unlock notification popup
│   ├── PRAlert.tsx             # Personal best celebration overlay
│   ├── Onboarding.tsx          # 3-step first-time user flow
│   ├── Icons.tsx               # Custom SVG icon components
│   ├── TabButton.tsx           # Tab navigation
│   └── FloatingElements.tsx    # Ambient background orbs
├── lib/
│   ├── types.ts                # All TypeScript interfaces
│   ├── constants.ts            # Events, RPE scale, color palettes
│   ├── storage.ts              # Typed localStorage wrapper with fallbacks
│   ├── analytics.ts            # Streak calculation, volume stats, trend analysis
│   ├── personal-bests.ts       # PB detection, season tracking, PR comparison
│   ├── achievements.ts         # 16 badge definitions, unlock condition checks
│   ├── export.ts               # JSON/CSV serialization, import with merge/replace
│   └── media-storage.ts        # IndexedDB wrapper for video/image binary storage
└── hooks/
    ├── useProfile.ts           # Profile state management + localStorage persistence
    └── useSessions.ts          # Session CRUD operations + persistence
</details>
Roadmap
 Core session logging with throws, RPE, notes, media
 Dashboard with stats grid, PB cards, streak counter
 Meet Day Mode — 6-attempt competition interface
 Progress charts — line, bar, composed RPE overlays
 Landing zone sector diagram with scatter analysis
 16 achievement badges across 5 categories
 Video analysis — slow-mo, frame stepping, drawing annotations
 Personal best detection with animated PR alerts
 JSON/CSV export and JSON import with merge/replace
 Dark mode, PWA support, onboarding flow
 Cloud sync (optional, opt-in)
 Coach view — read-only access to athlete data
 Training plan templates (periodization, peaking)
 Weather and conditions logging (wind, temperature, surface)
 Season vs. season comparative analytics
 Exportable meet recap cards
Contributing
PRs welcome. If you're a thrower who codes or a developer who works with athletes, contributions are appreciated.

Areas where help is wanted: cloud sync implementation · additional events (para-athletics, Highland games) · accessibility improvements · internationalization (imperial unit support) · test coverage

License
MIT — see LICENSE.
