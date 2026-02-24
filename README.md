# ThrowingTracker v2.0

A professional training log and analytics platform for competitive track & field throwers. Track sessions, visualize progress with charts, earn achievement badges, run competitions in Meet Day Mode, and analyze throw landing zones — all from your browser.

![Next.js](https://img.shields.io/badge/Next.js_15-000000?style=for-the-badge&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React_19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

---

## Features

| Feature | Description |
|---------|-------------|
| **Dashboard** | Stats grid, personal best cards, streak counter, compact achievement badges |
| **Session Logging** | Training & competition sessions with RPE, throws, marks, media |
| **Meet Day Mode** | Full competition interface — 6 attempts, mark/foul buttons, live best tracking |
| **Progress Charts** | Line charts for marks over time, bar charts for weekly volume, RPE trends |
| **Landing Zone Tracker** | Canvas-based sector diagram to plot where throws land with scatter analysis |
| **Achievement Badges** | 16 badges across 5 categories (milestone, streak, competition, volume, special) |
| **Video Analysis** | Slow-mo playback (0.25x-1x), frame stepping, drawing annotations |
| **Personal Bests** | Auto-calculated all-time and season PBs with animated PR celebration alerts |
| **Data Export/Import** | JSON & CSV export, JSON import with merge/replace modes |
| **Dark Mode** | Full dark theme toggle |
| **PWA Ready** | Installable on phone, manifest + SVG icons |
| **Onboarding** | 3-step first-time user flow (name, events, start) |
| **5 Events** | Shot Put, Discus, Hammer, Weight Throw, Javelin |

---

## Quick Start

```bash
# Clone the repo
git clone https://github.com/Waleee7/ThrowingTracker.git
cd ThrowingTracker

# Install dependencies
npm install

# Run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Tech Stack

| Layer | Tool | Why |
|-------|------|-----|
| Framework | Next.js 15 (App Router) | React ecosystem, static export, Vercel deploy |
| Language | TypeScript (strict) | Type safety for all data |
| UI | React 19 | Component architecture |
| Styling | Tailwind CSS v4 + custom CSS | Fast iteration, complete design control |
| Charts | Recharts | React-native, lightweight |
| Canvas | HTML5 Canvas API | Sector map, video annotation |
| Video | HTML5 Video API | Slow-mo, frame stepping |
| Storage | localStorage + IndexedDB | Sessions in localStorage, media in IndexedDB |
| Deploy | Vercel (static export) | Zero config |

---

## Project Structure

```
src/
├── app/
│   ├── layout.tsx           # Root layout, PWA meta
│   ├── page.tsx             # Main app — tab routing, state, integrations
│   └── globals.css          # All styles (~2000 lines)
├── components/
│   ├── DashboardTab.tsx     # Stats, PBs, last session, badges
│   ├── ProfileTab.tsx       # Profile form + data export/import
│   ├── LogTab.tsx           # Session logging form
│   ├── HistoryTab.tsx       # Recent/weekly/monthly views
│   ├── ProgressChart.tsx    # Recharts line/bar/composed charts
│   ├── SectorMap.tsx        # Canvas throwing sector diagram
│   ├── ThrowScatter.tsx     # Multi-session scatter analysis
│   ├── VideoPlayer.tsx      # Slow-mo player + annotation overlay
│   ├── MeetDayMode.tsx      # Competition attempt tracker
│   ├── AchievementBadges.tsx # Full + compact badge views
│   ├── AchievementToast.tsx # Badge unlock notification
│   ├── Onboarding.tsx       # First-time user flow
│   ├── PRAlert.tsx          # PR celebration overlay
│   ├── Icons.tsx            # Custom SVG icon components
│   ├── TabButton.tsx        # Tab navigation button
│   └── FloatingElements.tsx # Background orbs
├── lib/
│   ├── types.ts             # All TypeScript interfaces
│   ├── constants.ts         # Events, RPE scale, colors
│   ├── storage.ts           # localStorage typed wrapper
│   ├── analytics.ts         # Streak & stats calculations
│   ├── personal-bests.ts    # PB detection & season tracking
│   ├── achievements.ts      # 16 badge definitions & checks
│   ├── export.ts            # JSON/CSV export & import
│   └── media-storage.ts     # IndexedDB for videos/images
└── hooks/
    ├── useProfile.ts        # Profile state + persistence
    └── useSessions.ts       # Session CRUD + persistence
```

---

## Deployment

### Vercel (Recommended)

Connect this repo to Vercel — it auto-detects Next.js and deploys.

### Any Static Host

```bash
npm run build   # Outputs to /out directory
```

Deploy the `/out` folder to Netlify, GitHub Pages, Cloudflare Pages, etc.

---

## Data Storage

All data lives in the browser — no server, no account needed:

| Store | Contents |
|-------|----------|
| `throwingProfile` (localStorage) | Name, height, weight, events, notes |
| `throwingSessions` (localStorage) | All training & competition sessions |
| `throwingDarkMode` (localStorage) | Dark mode preference |
| IndexedDB `media-store` | Videos and large image files |

Export your data regularly from Profile > Data Management.

---

## License

MIT License — free to use, modify, and distribute.

---

**Built for throwers. Log your work. Track your progress. Throw far.**
