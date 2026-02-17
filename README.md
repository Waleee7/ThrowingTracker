# 🏋️ ThrowingTracker

A clean, lightweight training log built for competitive track & field throwers. Log sessions, track RPE, monitor streaks, and review performance summaries — all from your browser with zero setup.

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

## 🌐 Live Demo

**[ThrowingTracker](https://waleee7.github.io/ThrowingTracker/)**

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 📊 **Dashboard** | At-a-glance view of streaks, weekly throws, and average RPE |
| 📝 **Session Logging** | Log training or competition sessions with full details |
| 👤 **Athlete Profile** | Store name, height, weight, sex, and preferred events |
| 📈 **History & Stats** | View recent sessions, weekly summaries, and monthly breakdowns |
| 🔥 **Streak Tracking** | Consecutive training day counter to keep you accountable |
| 🎯 **5 Throwing Events** | Shot Put, Discus, Hammer, Weight Throw, and Javelin |
| 📎 **Media Upload** | Attach photos and videos to your training sessions |
| 🏆 **Competition Mode** | Log meet name, placement, and mark competition sessions with ⭐ |
| 💾 **Local Storage** | All data saved in your browser — no account needed |
| 📱 **Mobile Friendly** | Responsive design that works on any device |
| 🚀 **Zero Dependencies** | No frameworks, no build tools — just open and use |

---

## 🏁 Quick Start

No terminal. No installs. No build step.

\```bash
# Clone the repo
git clone https://github.com/waleee7/ThrowingTracker.git

# Open the app
# Just double-click index.html in your browser
\```

That's it. It works offline too.

---

## 🎯 Supported Events

| Event | Icon |
|-------|------|
| Shot Put | 🏋️ |
| Discus | 🥏 |
| Hammer | 🔨 |
| Weight Throw | ⚖️ |
| Javelin | 🎯 |

---

## 📋 Session Logging

Each session captures:

| Field | Description |
|-------|-------------|
| **Date** | When the session took place |
| **Event** | Which throwing event |
| **Session Type** | Training or Competition |
| **RPE (1-10)** | Rate of perceived exertion |
| **Throws** | Total number of throws |
| **Implement Weight** | Weight in kg or lbs |
| **Best Mark** | Longest throw in meters |
| **Average Mark** | Average throw in meters |
| **Notes** | Technical cues, how it felt, etc. |
| **Media** | Photos or videos from the session |
| **Meet Name** | Competition name (competition mode) |
| **Placement** | Finishing position (competition mode) |

---

## 📊 Stats & Analytics

ThrowingTracker calculates and displays:

- **Day Streak** — consecutive days with a logged session
- **Weekly Summary** — session count, total throws, average RPE, breakdown by event
- **Monthly Summary** — same metrics over a 30-day window
- **Per-Event Breakdown** — best mark, average mark, and session count for each event

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Structure** | HTML5 |
| **Styling** | CSS3 with custom properties |
| **Logic** | Vanilla JavaScript (ES5+) |
| **Animations** | CSS keyframe animations |
| **State** | In-memory JS objects |
| **Persistence** | Browser LocalStorage |
| **Icons** | Inline SVG graphics |
| **Build Tools** | None — zero build step |

No frameworks. No transpilers. No package managers. Pure web fundamentals.

---

## 🗂️ Project Structure

\```
ThrowingTracker/
├── index.html                        # Entry point that loads all scripts
├── css/
│   └── styles.css                    # All app styles, layout, and animations
├── js/
│   ├── main.js                       # Initializes the app on page load
│   ├── app.js                        # Core state management and tab routing
│   └── components/
│       ├── DashboardTab.js           # Renders dashboard stats and last session
│       ├── FloatingElements.js       # Animated background orbs for visual flair
│       ├── HistoryTab.js             # Displays session history and stat summaries
│       ├── LogTab.js                 # Session logging form with validation
│       ├── ProfileTab.js             # Athlete profile form and event selection
│       └── TabButton.js              # Reusable tab navigation button component
└── utils/
    ├── analytics.js                  # Calculates streaks, weekly, and monthly stats
    ├── constants.js                  # Event definitions, RPE scale, and units
    └── storage.js                    # LocalStorage read and write wrapper
\```

---

## 💾 Data Storage

All data lives in your browser's LocalStorage under two keys:

| Key | Contents |
|-----|----------|
| `throwingProfile` | Athlete profile — name, height, weight, sex, events, notes |
| `throwingSessions` | Array of all logged training and competition sessions |

- Data persists across browser sessions automatically
- No account creation or login required
- Clearing browser data resets the app to a fresh state
- No data is ever sent to any server

---

## 🎨 Design Philosophy

ThrowingTracker was built with one principle: **get out of the athlete's way**.

- **No Signup Walls** — open the app and start logging immediately
- **Offline First** — everything runs client-side, no internet required after first load
- **Minimal Taps** — the log form is designed to be completed in under 30 seconds
- **Glanceable Dashboard** — streak, weekly count, throws, and RPE visible instantly
- **Progressive Detail** — simple on the surface, detailed breakdowns when you dig in

The UI uses a purple gradient theme with glassmorphism-inspired panels, floating background orbs, and smooth CSS transitions — keeping the experience polished without any heavy animation libraries.

---

## 🧩 Challenges & Solutions

Building a full-featured app with zero dependencies presented some interesting problems:

**Component Architecture Without a Framework**

- **Problem:** Organizing UI code without React, Vue, or any component library
- **Solution:** Built a lightweight component pattern where each tab is a JS object with `render()` and `attachEvents()` methods, mimicking component lifecycles with plain DOM manipulation

**State Management Without Redux or Context**

- **Problem:** Keeping dashboard, history, and profile in sync without reactive state
- **Solution:** Centralized all state in a single `ThrowingTracker.state` object with explicit re-renders on tab switches, keeping data flow predictable and debuggable

**Form Validation Without Libraries**

- **Problem:** The log form has interdependent fields (average can't exceed best mark) and required field checks
- **Solution:** Custom validation with inline error display, field-level error clearing on input change, and a clean error/success flow

**Streak Calculation Accuracy**

- **Problem:** Counting consecutive training days while handling edge cases like logging late at night or skipping today
- **Solution:** Date normalization with a one-day grace period — if you haven't logged today yet, the streak checks from yesterday backward

---

### Any Static Host

This is a pure static site. Deploy anywhere that serves HTML:

| Platform | Method |
|----------|--------|
| **Netlify** | Drag and drop the project folder |
| **Cloudflare Pages** | Connect your GitHub repo |
| **Render** | Static site from repo |
| **Self-hosted** | Serve files from any web server |

No build commands. No environment variables. No server-side runtime needed.

---

## 🤝 Contributing

Contributions welcome! Here are some ideas:

- 📊 Add charts and data visualizations
- 📤 Build data export/import (CSV or JSON)
- 🏅 Add personal records tracking per event
- 🔔 Add training reminders or notifications
- 🎨 Add theme customization options
- 🐛 Fix bugs or improve accessibility

---

## 📄 License

MIT License — free to use for personal or commercial projects.

---

**Built for throwers, by a thrower. Log your work. Track your progress. Throw far. 🏋️**
```
