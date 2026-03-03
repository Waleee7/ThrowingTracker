<h1 align="center"> <a href="https://github.com/Waleee7/ThrowingTracker"> <img src="https://readme-typing-svg.demolab.com?font=Inter&weight=700&size=36&duration=2000&pause=9999&color=F97316&center=true&vCenter=true&repeat=false&width=500&height=50&lines=ThrowingTracker+v2.0" alt="ThrowingTracker v2.0" /> </a> </h1><p align="center"> A structured training log and analytics platform for competitive track &amp; field throwers — session tracking, progress visualization, competition management, and landing zone analysis, all running locally in the browser. </p><p align="center"> <img src="https://img.shields.io/badge/Next.js-15-black?logo=next.js&logoColor=white" alt="Next.js 15"/> <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black" alt="React 19"/> <img src="https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white" alt="TypeScript"/> <img src="https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind CSS"/> <img src="https://img.shields.io/badge/Storage-Local--First-22C55E?logo=lock&logoColor=white" alt="Local-First"/> <img src="https://img.shields.io/badge/PWA-Installable-8B5CF6" alt="PWA Ready"/> <img src="https://img.shields.io/badge/License-MIT-green" alt="MIT License"/> <img src="https://komarev.com/ghpvc/?username=Waleee7-ThrowingTracker&label=Views&color=888888&style=flat" alt="Views"/> </p>
💡 Why This Exists
Throwing events generate structured, repetitive data — distances, attempt sequences, session RPE, landing zones, competition results. Every practice and every meet produces numbers that should compound into insight over a season. In practice, they don't.

Most throwers track marks in the Notes app, a spreadsheet they abandon after two weeks, or not at all. Coaches collect data on paper heat sheets that never get digitized. Competition day means scribbling six attempts in the margins. By the time anyone asks "how has your shot put progressed since October?", the answer is a guess.

The Problems
These are the specific problems ThrowingTracker was built to solve:

Fragmented Training Data
Sessions, marks, RPE, and notes end up scattered across apps, notebooks, and memory. There's no single place where all the information from a training day lives together. ThrowingTracker stores every session in one structured format with typed fields — event, individual throws, perceived effort, media, and free-form notes — so nothing gets lost and everything is searchable.

No Progress Visibility
Without charts, athletes and coaches can't identify plateaus, volume trends, or the relationship between training load and performance. A thrower might be throwing further in practice every week and have no idea because the data is buried. ThrowingTracker generates line charts (marks over time), bar charts (weekly volume), and composed RPE overlays automatically from session data so trends are visible at a glance.

Competition Day Is Manual
Six attempts, foul tracking, and current-best awareness shouldn't require mental math and a pen. Meet Day Mode is a dedicated interface built specifically for the pressure of competition — mark or foul each attempt, see your live best, and get notified immediately on a new personal best. No fumbling, no forgetting which attempt you're on.

Landing Zone Patterns Are Invisible
Consistency in throwing isn't just about distance — it's about direction. A thrower who consistently pulls left has a technical issue that raw distance data will never reveal. The sector map plots landing positions on a canvas diagram with multi-session scatter analysis so athletes and coaches can see directional patterns develop over time and tie them back to specific technical adjustments.

Video Review Requires Expensive Software
Dartfish, Hudl, and Coach's Eye charge subscription fees for slow-motion playback and annotation. Most throwers just need to review a release point or check hip position at power. ThrowingTracker includes slow-mo (0.25x–1x), frame-by-frame stepping, and a drawing overlay — enough for release point analysis and position checks without paying for a separate tool.

Data Is Locked In or Lost
Training history should be portable and belong to the athlete. ThrowingTracker exports to JSON (full backup, re-importable) and CSV (Excel, Google Sheets, custom analysis). No accounts, no cloud lock-in, no data you can't take with you. If you switch tools, your history comes along.

🔒 Fully Local
The entire application runs in the browser. All data persists in localStorage and IndexedDB. There is no server, no authentication, and no network dependency. It installs as a PWA on any phone and works offline at the field — because that's where you actually need it.

⚡ Quick Start
Step 1 — Clone the repository to your local machine:

Bash

git clone https://github.com/Waleee7/ThrowingTracker.git
Step 2 — Navigate into the project directory:

Bash

cd ThrowingTracker
Step 3 — Install all dependencies:

Bash

npm install
Step 4 — Start the development server:

Bash

npm run dev
Step 5 — Open http://localhost:3000 in your browser. The onboarding flow takes 30 seconds — enter your name, select your events, and start logging.

📱 Install on Phone
Open the app in mobile Safari or Chrome → tap "Add to Home Screen." It runs full-screen and works offline — no app store needed.

🚀 Deploy
Connect to Vercel for automatic deploys, or run npm run build and host the /out directory on any static host (Netlify, GitHub Pages, Cloudflare Pages).

🏋️ Features
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
🎯 Supported Events
Shot Put · Discus · Hammer · Weight Throw · Javelin

Multi-event athletes can track all five simultaneously. The achievement system recognizes multi-event commitment with a dedicated badge.

🏅 Achievement Categories
<table> <tr> <td align="center"><strong>🏁 Milestone</strong><br/><br/>First Throw<br/>50 Sessions<br/>Century Club (100)<br/>+ 1 more</td> <td align="center"><strong>🔥 Streak</strong><br/><br/>7-Day Streak<br/>14-Day Streak<br/>30-Day Iron Streak</td> <td align="center"><strong>🏟️ Competition</strong><br/><br/>First Meet<br/>Meet Warrior (5)<br/>PB in Competition</td> <td align="center"><strong>📊 Volume</strong><br/><br/>500 Throws<br/>1K Club<br/>5K Throws<br/>+ 1 more</td> </tr> <tr> <td colspan="4" align="center"><strong>⭐ Special</strong> — Multi-Event Athlete · Full Season Tracker</td> </tr> </table>
🛠️ Tech Stack
<table> <tr> <td align="center"><strong>⚙️ Framework</strong><br/><br/>Next.js 15<br/>(App Router)<br/>Static export &amp; Vercel</td> <td align="center"><strong>🟦 Language</strong><br/><br/>TypeScript<br/>(strict mode)<br/>Full type safety</td> <td align="center"><strong>⚛️ UI</strong><br/><br/>React 19<br/>Component<br/>architecture</td> <td align="center"><strong>🎨 Styling</strong><br/><br/>Tailwind CSS v4<br/>~2000 lines<br/>custom design system</td> </tr> <tr> <td align="center"><strong>📈 Charts</strong><br/><br/>Recharts<br/>Composable<br/>React charting</td> <td align="center"><strong>🖼️ Canvas</strong><br/><br/>HTML5 Canvas API<br/>Sector maps &amp;<br/>video annotations</td> <td align="center"><strong>🎥 Video</strong><br/><br/>HTML5 Video API<br/>Slow-mo &amp; frame<br/>stepping</td> <td align="center"><strong>💾 Storage</strong><br/><br/>localStorage<br/>+ IndexedDB<br/>Fully offline</td> </tr> </table>
💾 Data Storage
All data lives in the browser. No server, no account, no network dependency.

Store	Contents
throwingProfile (localStorage)	Name, height, weight, selected events, notes
throwingSessions (localStorage)	All training and competition session records
throwingDarkMode (localStorage)	Theme preference
IndexedDB media-store	Videos and image files
⚠️ Browser storage is not a backup. Export your data regularly from Profile → Data Management. Clearing browser data, switching browsers, or resetting your device will delete everything.

📁 Project Structure
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
✅ What's Built
This is everything currently implemented and working in ThrowingTracker v2.0:

📝 Session Logging
Complete training and competition session recording with support for multiple throws per session, individual distance tracking, RPE scoring on a 1–10 scale, free-form notes for technical cues or observations, and media attachments for video review. Each session is timestamped and tagged by event type.

📊 Dashboard & Analytics
A comprehensive home screen featuring a stats grid with total sessions, total throws, and current streak. Personal best cards display your top mark for each event with the date achieved. The streak counter tracks consecutive training days to keep you accountable.

🏟️ Meet Day Mode
A dedicated competition interface designed for the six-attempt format used in track & field meets. Enter each attempt as a mark or foul, watch your live best update in real-time, and receive an animated celebration alert when you hit a new personal best. No distractions, just clean competition tracking.

📈 Progress Charts
Recharts-powered visualizations including line charts showing marks over time for trend analysis, bar charts displaying weekly throw volume for load monitoring, and composed charts overlaying RPE trends against performance to identify the sweet spot between effort and output.

🎯 Landing Zone Tracker
An HTML5 Canvas sector diagram where you can plot exactly where each throw landed within the sector. Per-session plotting shows your consistency within a single practice, while multi-session scatter analysis reveals directional tendencies over weeks or months — invaluable for identifying technical patterns.

🎥 Video Analysis
Built-in video playback with slow-motion controls ranging from 0.25x to 1x speed, frame-by-frame stepping for precise position analysis, and a drawing annotation overlay to mark release points, angles, or body positions. All videos are stored locally in IndexedDB — no cloud uploads required.

🏆 Personal Best Detection
Automatic tracking of all-time and current-season personal bests. When you log a throw that exceeds your previous best, an animated PR alert celebrates the achievement. Historical PB progression is maintained so you can see how your top marks have evolved.

🏅 Achievement System
16 unlockable badges across 5 categories that reward consistency, volume, and competition performance. Milestone badges track session counts, streak badges reward consecutive training days, competition badges recognize meet participation and PRs under pressure, volume badges celebrate total throws logged, and special badges acknowledge multi-event athletes and full-season commitment. Toast notifications appear when you unlock a new badge.

💾 Data Export & Import
Full data portability with JSON export for complete backups that can be re-imported, CSV export for spreadsheet analysis in Excel or Google Sheets, and JSON import supporting both merge (add to existing data) and replace (overwrite) modes. Your data belongs to you.

🌙 Dark Mode
A complete dark theme built from scratch using a custom design system — not a CSS filter or inversion. Every component, chart, and interface element has been designed for both light and dark contexts with proper contrast ratios.

📱 PWA Support
Full Progressive Web App implementation with a web manifest, service worker for offline caching, and optimized SVG icons. Install directly to your phone's home screen from Safari or Chrome and use it exactly like a native app — no app store required, works without internet at the field.

👋 Onboarding Flow
A streamlined 3-step first-time user experience that collects your name, lets you select which events you compete in, and gets you logging your first session in under 30 seconds. No account creation, no email verification, no friction.

🤝 Contributing
PRs welcome. If you're a thrower who codes or a developer who works with athletes, contributions are appreciated.

Areas where help is wanted: cloud sync implementation · additional events (para-athletics, Highland games) · accessibility improvements · internationalization (imperial unit support) · test coverage

📄 License
MIT — see LICENSE.






