<h1 align="center"> <a href="https://github.com/Waleee7/ThrowingTracker"> <img src="https://readme-typing-svg.demolab.com?font=Inter&weight=700&size=36&duration=2000&pause=9999&color=F97316&center=true&vCenter=true&repeat=false&width=500&height=50&lines=ThrowingTracker+v2.0" alt="ThrowingTracker v2.0" /> </a> </h1><p align="center"> <strong>A structured training log and analytics platform for competitive track &amp; field throwers</strong> <br/> Session tracking, progress visualization, competition management, and landing zone analysis — all running locally in the browser. </p><p align="center"> <img src="https://img.shields.io/badge/Next.js-15-black?logo=next.js&logoColor=white" alt="Next.js 15"/> <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black" alt="React 19"/> <img src="https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white" alt="TypeScript"/> <img src="https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind CSS"/> <img src="https://img.shields.io/badge/Storage-Local--First-22C55E?logo=lock&logoColor=white" alt="Local-First"/> <img src="https://img.shields.io/badge/PWA-Installable-8B5CF6" alt="PWA Ready"/> <img src="https://img.shields.io/badge/License-MIT-green" alt="MIT License"/> <img src="https://komarev.com/ghpvc/?username=Waleee7-ThrowingTracker&label=Views&color=888888&style=flat" alt="Views"/> </p>
Why This Exists
Throwing events generate structured, repetitive data — distances, attempt sequences, session RPE, landing zones, competition results. Every practice and every meet produces numbers that should compound into insight over a season. In practice, they don't.

Most throwers track marks in the Notes app, a spreadsheet they abandon after two weeks, or not at all. Coaches collect data on paper heat sheets that never get digitized. Competition day means scribbling six attempts in the margins. By the time anyone asks "how has your shot put progressed since October?", the answer is a guess.

ThrowingTracker was built to solve these specific problems.

The Problems We Solve
Fragmented Training Data

Sessions, marks, RPE, and notes end up scattered across apps, notebooks, and memory. There's no single place where all the information from a training day lives together. ThrowingTracker stores every session in one structured format with typed fields — event, individual throws, perceived effort, media, and free-form notes — so nothing gets lost and everything is searchable. Every throw you've ever logged is accessible from one interface, organized chronologically and filterable by event type.

No Progress Visibility

Without charts, athletes and coaches can't identify plateaus, volume trends, or the relationship between training load and performance. A thrower might be improving every week and have no idea because the data is buried in disconnected entries. ThrowingTracker generates line charts showing marks over time, bar charts displaying weekly volume, and composed RPE overlays automatically from session data. Trends that would take hours to calculate manually are visible at a glance. You can see exactly when you plateaued, when you broke through, and what your training load looked like during each phase.

Competition Day Is Manual

Six attempts, foul tracking, and current-best awareness shouldn't require mental math and a pen while you're trying to compete. Meet Day Mode is a dedicated interface built specifically for the pressure of competition. Mark or foul each attempt with a single tap, watch your live best update in real-time, and receive an animated celebration alert when you hit a new personal best. The interface is intentionally minimal — no distractions, no extra features, just clean competition tracking that lets you focus on throwing.

Landing Zone Patterns Are Invisible

Consistency in throwing isn't just about distance — it's about direction. A thrower who consistently pulls left has a technical issue that raw distance data will never reveal. The sector map plots landing positions on a canvas diagram with multi-session scatter analysis so athletes and coaches can see directional patterns develop over time. You can identify whether your misses tend left, right, or centered, and correlate those patterns with technical adjustments you've logged in your notes.

Video Review Requires Expensive Software

Dartfish, Hudl, and Coach's Eye charge subscription fees for slow-motion playback and annotation. Most throwers just need to review a release point or check hip position at power — they don't need enterprise video software. ThrowingTracker includes slow-motion playback from 0.25x to 1x speed, frame-by-frame stepping for precise position analysis, and a drawing annotation overlay to mark release points, angles, or body positions. All videos are stored locally in IndexedDB with no upload limits, no compression, and no monthly fees.

Data Is Locked In or Lost

Training history should be portable and belong to the athlete. Too many apps trap your data behind proprietary formats or delete it when you cancel a subscription. ThrowingTracker exports to JSON for full backups that can be re-imported anytime, and CSV for spreadsheet analysis in Excel or Google Sheets. No accounts, no cloud lock-in, no data you can't take with you. If you switch tools or want to run custom analysis, your entire training history comes along in standard formats.

Fully Local Architecture

The entire application runs in the browser. All data persists in localStorage and IndexedDB. There is no server, no authentication, and no network dependency. It installs as a PWA on any phone and works offline at the field — because that's where you actually need it. Your training data never leaves your device unless you explicitly export it.

⚡ Quick Start
Bash

# Step 1 — Clone the repository
git clone https://github.com/Waleee7/ThrowingTracker.git

# Step 2 — Navigate into the project directory
cd ThrowingTracker

# Step 3 — Install dependencies
npm install

# Step 4 — Start the development server
npm run dev

# Step 5 — Open http://localhost:3000 in your browser
# The onboarding flow takes 30 seconds — enter your name, select your events, start logging
Install on Phone

Open the app in mobile Safari or Chrome, then tap "Add to Home Screen." It runs full-screen and works offline — no app store required.

Deploy

Connect to Vercel for automatic deploys, or run npm run build and host the /out directory on any static host including Netlify, GitHub Pages, or Cloudflare Pages.

Features
<table> <tr> <td align="center" width="25%"><strong>Dashboard</strong><br/><br/>Stats grid with total sessions, throws, and streak. Personal best cards per event. Compact achievement badges.</td> <td align="center" width="25%"><strong>Session Logging</strong><br/><br/>Training and competition sessions with event selection, individual throws, RPE (1–10), notes, and media.</td> <td align="center" width="25%"><strong>Meet Day Mode</strong><br/><br/>Competition interface with 6 attempts, mark/foul entry, live best tracking, automatic PB detection.</td> <td align="center" width="25%"><strong>Progress Charts</strong><br/><br/>Line charts for marks over time, bar charts for weekly volume, composed RPE trend overlays.</td> </tr> <tr> <td align="center"><strong>Landing Zones</strong><br/><br/>HTML5 Canvas sector diagram for plotting throw positions with multi-session scatter analysis.</td> <td align="center"><strong>Video Analysis</strong><br/><br/>Slow-motion playback (0.25x–1x), frame stepping, drawing annotation overlay. Stored in IndexedDB.</td> <td align="center"><strong>Personal Bests</strong><br/><br/>Auto-calculated all-time and season PBs. Animated PR alert on new personal best.</td> <td align="center"><strong>Achievements</strong><br/><br/>16 badges across 5 categories. Toast notifications on unlock. Milestone, streak, competition, volume, special.</td> </tr> <tr> <td align="center"><strong>Data Export</strong><br/><br/>JSON export for full backup, CSV for spreadsheets, JSON import with merge or replace modes.</td> <td align="center"><strong>Dark Mode</strong><br/><br/>Full dark theme built from the ground up — not a CSS filter. Proper contrast throughout.</td> <td align="center"><strong>PWA</strong><br/><br/>Installable on phone with offline support. Manifest and optimized SVG icons included.</td> <td align="center"><strong>Onboarding</strong><br/><br/>3-step first-time user flow. Name, events, start. Under 30 seconds to first session.</td> </tr> </table>
🎯 Supported Events
Shot Put — Discus — Hammer — Weight Throw — Javelin

Multi-event athletes can track all five simultaneously. Each event maintains its own personal best history, progress charts, and landing zone patterns. The achievement system includes a dedicated badge recognizing multi-event commitment.

Achievement System
The achievement system includes 16 unlockable badges designed to reward consistency, volume, and competition performance. Badges are automatically awarded when conditions are met, with toast notifications appearing on unlock.

Milestone Badges track session counts including First Throw, 50 Sessions, and Century Club for reaching 100 sessions. These recognize the fundamental habit of showing up and logging your work.

Streak Badges reward consecutive training days with 7-Day, 14-Day, and 30-Day Iron Streak badges. The streak counter on the dashboard shows your current run and motivates daily consistency.

Competition Badges recognize meet participation and performance under pressure including First Meet, Meet Warrior for completing 5 meets, and PB in Competition for hitting a personal best when it counts.

Volume Badges celebrate total throws logged across all sessions with 500 Throws, 1K Club, and 5K Throws milestones. These acknowledge the cumulative work that produces improvement.

Special Badges include Multi-Event Athlete for tracking more than one event and Full Season Tracker for maintaining logs across an entire competitive season.

🛠️ Tech Stack
<table> <tr> <td align="center" width="25%"><strong>Framework</strong><br/><br/>Next.js 15 with App Router. Static export for deployment anywhere. Full Vercel integration.</td> <td align="center" width="25%"><strong>Language</strong><br/><br/>TypeScript in strict mode. Complete type safety across all data structures, analytics, and storage.</td> <td align="center" width="25%"><strong>UI</strong><br/><br/>React 19 with modern component architecture. Hooks for state management and side effects.</td> <td align="center" width="25%"><strong>Styling</strong><br/><br/>Tailwind CSS v4 with approximately 2000 lines of custom design system. Full dark mode support.</td> </tr> <tr> <td align="center"><strong>Charts</strong><br/><br/>Recharts for lightweight, composable React charting. Line, bar, and composed chart types.</td> <td align="center"><strong>Canvas</strong><br/><br/>HTML5 Canvas API for sector map rendering and video annotation overlay drawing.</td> <td align="center"><strong>Video</strong><br/><br/>HTML5 Video API with custom controls for slow-motion playback and frame-accurate stepping.</td> <td align="center"><strong>Storage</strong><br/><br/>localStorage for sessions and profile. IndexedDB for media files. Fully offline capable.</td> </tr> </table>
💾 Data Storage
All data lives in the browser with no server dependency.

throwingProfile stored in localStorage contains name, height, weight, selected events, and personal notes. This is the core identity data that persists across sessions.

throwingSessions stored in localStorage contains all training and competition session records including timestamps, event types, individual throw distances, RPE scores, notes, and media references.

throwingDarkMode stored in localStorage contains the theme preference which persists across browser sessions.

IndexedDB media-store contains videos and image files stored as binary data. This allows large media files to be stored locally without hitting localStorage size limits.

⚠️ Browser storage is not a backup. Export your data regularly from Profile → Data Management. Clearing browser data, switching browsers, or resetting your device will permanently delete all stored information.

Source Tree
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
What's Built
<table> <tr> <td align="center" width="25%"><strong>Session Logging</strong><br/><br/>Complete session recording with multiple throws, distance tracking, RPE scoring, notes, and media attachments. Timestamped and tagged by event.</td> <td align="center" width="25%"><strong>Dashboard</strong><br/><br/>Stats grid with total sessions, throws, and streak. Personal best cards per event with dates. Immediate visibility into training status.</td> <td align="center" width="25%"><strong>Meet Day Mode</strong><br/><br/>Six-attempt competition interface. Single-tap mark or foul entry. Live best updates. Animated PR celebration alerts.</td> <td align="center" width="25%"><strong>Progress Charts</strong><br/><br/>Line charts for trends, bar charts for volume, composed RPE overlays. Raw data transformed into actionable insights.</td> </tr> <tr> <td align="center"><strong>Landing Zones</strong><br/><br/>Canvas sector diagram with per-session plotting and multi-session scatter. Reveals directional tendencies distance alone cannot show.</td> <td align="center"><strong>Video Analysis</strong><br/><br/>Slow-motion 0.25x–1x, frame stepping, drawing overlay. All stored locally in IndexedDB with no limits or fees.</td> <td align="center"><strong>Personal Bests</strong><br/><br/>Automatic all-time and season PB tracking. Animated alerts on new records. Historical progression maintained.</td> <td align="center"><strong>Data Portability</strong><br/><br/>JSON export for backups, CSV for spreadsheets, JSON import with merge/replace. Your data is never locked in.</td> </tr> <tr> <td align="center"><strong>Achievement System</strong><br/><br/>16 badges across milestone, streak, competition, volume, and special categories. Toast notifications on unlock.</td> <td align="center"><strong>Dark Mode</strong><br/><br/>Complete dark theme with proper contrast. Every component designed for both contexts. Not a filter.</td> <td align="center"><strong>PWA Support</strong><br/><br/>Web manifest, service worker, offline caching. Install to home screen. Works without internet at the field.</td> <td align="center"><strong>Onboarding</strong><br/><br/>3-step flow collecting name and events. First session in under 30 seconds. No accounts or verification.</td> </tr> </table>
🤝 Contributing
Pull requests are welcome. If you're a thrower who codes or a developer who works with athletes, contributions are appreciated.

Areas where help is wanted — cloud sync implementation, additional events including para-athletics and Highland games, accessibility improvements, internationalization with imperial unit support, and test coverage.

License
MIT — see LICENSE.
