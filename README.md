<h1 align="center">
  <a href="https://github.com/Waleee7/ThrowingTracker">
    <img src="https://readme-typing-svg.demolab.com?font=Inter&weight=700&size=36&duration=2000&pause=9999&color=F97316&center=true&vCenter=true&repeat=false&width=500&height=50&lines=ThrowingTracker+v2.0" alt="ThrowingTracker v2.0" />
  </a>
</h1>

<p align="center">
  <strong>A structured training log and analytics platform for competitive track &amp; field throwers</strong><br/>
  Session tracking, progress visualization, competition management, and landing zone analysis — all running locally in the browser.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-15-black?logo=next.js&logoColor=white" alt="Next.js 15"/>
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black" alt="React 19"/>
  <img src="https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind CSS"/>
  <img src="https://img.shields.io/badge/Storage-Local--First-22C55E?logo=lock&logoColor=white" alt="Local-First"/>
  <img src="https://img.shields.io/badge/PWA-Installable-8B5CF6" alt="PWA Ready"/>
  <img src="https://img.shields.io/badge/License-MIT-green" alt="MIT License"/>
  <img src="https://komarev.com/ghpvc/?username=Waleee7-ThrowingTracker&label=Views&color=888888&style=flat" alt="Views"/>
</p>

<h2>Why This Exists</h2>
<p>
Throwing events generate structured, repetitive data — distances, attempt sequences, session RPE, landing zones, competition results. Every practice and every meet produces numbers that should compound into insight over a season. In practice, they don't.
</p>
<p>
Most throwers track marks in the Notes app, a spreadsheet they abandon after two weeks, or not at all. Coaches collect data on paper heat sheets that never get digitized. Competition day means scribbling six attempts in the margins. By the time anyone asks "how has your shot put progressed since October?", the answer is a guess.
</p>
<p>
ThrowingTracker was built to solve these specific problems.
</p>

<h3>The Problems We Solve</h3>
<ul>
  <li><strong>Fragmented Training Data:</strong> All sessions, marks, RPE, notes, and media are consolidated into one interface. Every throw is searchable and organized chronologically by event type.</li>
  <li><strong>No Progress Visibility:</strong> Line charts, bar charts, and RPE overlays reveal trends and plateaus that would otherwise remain hidden.</li>
  <li><strong>Competition Day Is Manual:</strong> Meet Day Mode tracks six attempts, fouls, and live bests with a minimal, distraction-free interface and animated PB celebration alerts.</li>
  <li><strong>Landing Zone Patterns Are Invisible:</strong> Canvas-based sector diagram plots multi-session scatter to reveal directional tendencies.</li>
  <li><strong>Video Review Requires Expensive Software:</strong> Slow-motion playback, frame-stepping, and drawing annotations included — all stored locally in IndexedDB.</li>
  <li><strong>Data Is Locked In or Lost:</strong> Export to JSON or CSV anytime. No accounts, no subscriptions, no cloud lock-in.</li>
  <li><strong>Fully Local Architecture:</strong> Runs entirely in the browser. PWA-ready and offline-capable.</li>
</ul>

<h2>⚡ Quick Start (Step-by-Step)</h2>

<ol>
  <li>
    <strong>Clone the repository</strong><br/>
    <pre>git clone https://github.com/Waleee7/ThrowingTracker.git</pre>
  </li>

  <li>
    <strong>Navigate into the project directory</strong><br/>
    <pre>cd ThrowingTracker</pre>
  </li>

  <li>
    <strong>Install dependencies</strong><br/>
    <pre>npm install</pre>
  </li>

  <li>
    <strong>Start the development server</strong><br/>
    <pre>npm run dev</pre>
  </li>

  <li>
    <strong>Open the app in your browser</strong><br/>
    Visit: <a href="http://localhost:3000">http://localhost:3000</a><br/>
    Complete the short onboarding flow to set your name and events.
  </li>
</ol>

<p>
Install on your phone: open in Safari or Chrome → tap "Add to Home Screen" → runs offline in full-screen mode.  
Deploy: connect to Vercel or build with <code>npm run build</code> and deploy /out to any static host.
</p>

<h2>Features</h2>
<table>
<tr>
  <td align="center"><strong>Dashboard</strong><br/>Stats grid, PB cards, streak counter, compact achievement badges.</td>
  <td align="center"><strong>Session Logging</strong><br/>Event selection, individual throws, RPE, notes, media attachments.</td>
  <td align="center"><strong>Meet Day Mode</strong><br/>Six attempts, mark/foul entry, live best, animated PB alerts.</td>
  <td align="center"><strong>Progress Charts</strong><br/>Line charts, weekly volume bars, RPE overlays.</td>
</tr>
<tr>
  <td align="center"><strong>Landing Zones</strong><br/>Canvas sector map with multi-session scatter analysis.</td>
  <td align="center"><strong>Video Analysis</strong><br/>Slow-mo 0.25x–1x, frame stepping, annotation overlay.</td>
  <td align="center"><strong>Personal Bests</strong><br/>Auto-calculated all-time & season PBs, animated alerts.</td>
  <td align="center"><strong>Achievements</strong><br/>16 badges across milestone, streak, competition, volume, special.</td>
</tr>
<tr>
  <td align="center"><strong>Data Export</strong><br/>JSON for backup, CSV for spreadsheets, JSON import merge/replace.</td>
  <td align="center"><strong>Dark Mode</strong><br/>Full dark theme with proper contrast throughout.</td>
  <td align="center"><strong>PWA</strong><br/>Offline-ready, installable on phone, optimized manifest & SVGs.</td>
  <td align="center"><strong>Onboarding</strong><br/>3-step first-time flow — under 30 seconds to first session.</td>
</tr>
</table>

<h2>🎯 Supported Events</h2>
<p>Shot Put — Discus — Hammer — Weight Throw — Javelin</p>
<p>Multi-event athletes can track all events with separate PBs, progress charts, landing patterns, and achievement recognition.</p>

<h2>🏆 Achievement System</h2>
<p>16 unlockable badges: Milestone, Streak, Competition, Volume, Special. Toast notifications appear on unlock. Examples:</p>
<ul>
  <li>Milestone: First Throw, 50 Sessions, Century Club</li>
  <li>Streak: 7-Day, 14-Day, 30-Day Iron Streak</li>
  <li>Competition: First Meet, Meet Warrior, PB in Competition</li>
  <li>Volume: 500 Throws, 1K Club, 5K Throws</li>
  <li>Special: Multi-Event Athlete, Full Season Tracker</li>
</ul>

<h2>🛠️ Tech Stack</h2>
<table>
<tr>
  <td align="center"><strong>Framework</strong><br/>Next.js 15 with App Router, static export, Vercel integration.</td>
  <td align="center"><strong>Language</strong><br/>TypeScript strict mode, type safety across data & analytics.</td>
  <td align="center"><strong>UI</strong><br/>React 19, component architecture, hooks for state management.</td>
  <td align="center"><strong>Styling</strong><br/>Tailwind CSS v4, ~2000 lines, dark mode ready.</td>
</tr>
<tr>
  <td align="center"><strong>Charts</strong><br/>Recharts — line, bar, composed charts.</td>
  <td align="center"><strong>Canvas</strong><br/>HTML5 sector map & video annotation overlay.</td>
  <td align="center"><strong>Video</strong><br/>HTML5 Video API, slow-mo, frame stepping.</td>
  <td align="center"><strong>Storage</strong><br/>localStorage + IndexedDB, fully offline-capable.</td>
</tr>
</table>

<h2>💾 Data Storage</h2>
<ul>
  <li><strong>throwingProfile</strong>: name, height, weight, events, notes (localStorage)</li>
  <li><strong>throwingSessions</strong>: all session & competition logs (localStorage)</li>
  <li><strong>throwingDarkMode</strong>: theme preference (localStorage)</li>
  <li><strong>IndexedDB media-store</strong>: videos/images as binary data</li>
</ul>
<p>Export regularly. Clearing browser data will permanently delete all stored info.</p>

<h2>📂 Source Tree</h2>
<pre>
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── DashboardTab.tsx
│   ├── LogTab.tsx
│   ├── HistoryTab.tsx
│   ├── ProfileTab.tsx
│   ├── MeetDayMode.tsx
│   ├── ProgressChart.tsx
│   ├── SectorMap.tsx
│   ├── ThrowScatter.tsx
│   ├── VideoPlayer.tsx
│   ├── AchievementBadges.tsx
│   ├── AchievementToast.tsx
│   ├── PRAlert.tsx
│   ├── Onboarding.tsx
│   ├── Icons.tsx
│   ├── TabButton.tsx
│   └── FloatingElements.tsx
├── lib/
│   ├── types.ts
│   ├── constants.ts
│   ├── storage.ts
│   ├── analytics.ts
│   ├── personal-bests.ts
│   ├── achievements.ts
│   ├── export.ts
│   └── media-storage.ts
└── hooks/
    ├── useProfile.ts
    └── useSessions.ts
</pre>

<h2>🤝 Contributing</h2>
<p>
Pull requests welcome! Contributions from throwers who code, developers working with athletes, or open-source enthusiasts are appreciated. Areas include cloud sync, additional events, accessibility, internationalization, and test coverage.
</p>

<h2>📄 License</h2>
<p>MIT — see LICENSE</p>
