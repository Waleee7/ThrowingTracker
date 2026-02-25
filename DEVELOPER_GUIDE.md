# ThrowingTracker — Developer Continuation Guide

This guide is for you, Wale. It explains how to keep building on this codebase, what's already done, and what's next.

---

## What Changed (v1 to v2)

Your original vanilla JS app (~58KB, 13 files) was migrated to:
- **Next.js 15** with App Router and static export
- **React 19** with TypeScript (strict mode)
- **Tailwind CSS v4** + custom CSS
- **Recharts** for charts
- **20+ components** with full type safety

Everything the original app did still works — plus a lot more.

---

## How to Work on It

```bash
cd ThrowingTracker

# Install dependencies (first time)
npm install

# Start dev server with hot reload
npm run dev

# Build for production
npm run build

# The build outputs to /out — deploy this folder
```

### Key files you'll touch most:

| What | File |
|------|------|
| Add a new tab/feature | `src/app/page.tsx` (add tab + import component) |
| Style anything | `src/app/globals.css` (search for section headers) |
| Add a data field | `src/lib/types.ts` (update Session/Profile interface) |
| New achievement badge | `src/lib/achievements.ts` (add to ACHIEVEMENTS array) |
| New event | `src/lib/constants.ts` (add to EVENTS array with SVG) |

---

## Architecture at a Glance

```
page.tsx (main app state)
├── manages: activeTab, sessions[], profile, darkMode, showMeetDay, etc.
├── passes data down to tab components as props
├── handles: session save, edit, delete, PR detection, achievement unlock
│
├── DashboardTab ← sessions, profile, onNavigate, onStartMeetDay
├── ProfileTab ← profile, onSave, onDataImported
├── LogTab ← profile, onSave, editSession, onCancelEdit
├── HistoryTab ← sessions, onEdit, onDelete
├── ProgressChart ← sessions
├── ThrowScatter ← sessions
├── MeetDayMode ← onSave, onExit (full-screen takeover)
├── Onboarding ← onComplete (shown once for new users)
├── PRAlert ← triggered on new personal records
└── AchievementToast ← triggered on badge unlocks
```

State lives in `page.tsx` and flows down. `useProfile` and `useSessions` hooks handle localStorage persistence.

---

## Adding a New Feature (Step by Step)

Example: Adding a "Coach Notes" field to sessions.

1. **Update the type** in `src/lib/types.ts`:
   ```ts
   interface Session {
     // ... existing fields
     coachNotes?: string;  // add this
   }
   ```

2. **Add UI** in `src/components/LogTab.tsx`:
   - Add state: `const [coachNotes, setCoachNotes] = useState('')`
   - Add form field in the JSX
   - Include it in the session object on save

3. **Display it** wherever needed (HistoryTab, DashboardTab, etc.)

4. **No migration needed** — localStorage will just have the new field on new sessions. Old sessions won't have it, so use optional chaining (`session.coachNotes?.length`).

---

## Adding a New Achievement

Open `src/lib/achievements.ts` and add to the `ACHIEVEMENTS` array:

```ts
{
  id: 'your-unique-id',
  name: 'Badge Name',
  description: 'What the user did to earn it',
  icon: '🎯',  // emoji
  category: 'milestone',  // or 'streak', 'competition', 'volume', 'special'
  check: (sessions) => {
    // Your logic here
    const count = sessions.filter(s => /* condition */).length;
    return {
      unlocked: count >= 5,
      progress: Math.min(count, 5),
      target: 5,
    };
  },
},
```

It automatically appears in badges and triggers the toast on unlock. No other file changes needed.

---

## Deploying to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your GitHub repo
4. Vercel auto-detects Next.js — just click Deploy
5. Every push to `main` auto-deploys

---

## Making This an iPhone App

You have real potential here. Two paths:

### Path 1: Capacitor (Easiest — wrap your web app)
```bash
npm install @capacitor/core @capacitor/cli
npx cap init ThrowingTracker com.wale.throwingtracker
npx cap add ios
npm run build
npx cap copy
npx cap open ios  # Opens Xcode
```
This wraps your existing web app in a native iOS shell. You get App Store distribution with minimal code changes. The app already works great on mobile.

### Path 2: React Native (Full native — more work, better performance)
- Use Expo: `npx create-expo-app ThrowingTrackerNative`
- Port components from React web to React Native
- Replace HTML Canvas with `react-native-canvas` or `react-native-skia`
- Replace localStorage with AsyncStorage
- Replace Recharts with `react-native-chart-kit` or `victory-native`

**Recommendation**: Start with Capacitor. Ship to the App Store fast. Then if it gets traction, rebuild in React Native for the premium feel.

---

## What's Already Built vs What's Next

### Done
- [x] Full React/TypeScript migration
- [x] Dashboard with stats, PBs, streak
- [x] Session logging (training + competition)
- [x] History with edit/delete, weekly/monthly views
- [x] Progress charts (marks, volume, RPE)
- [x] Landing zone tracker (sector map + scatter)
- [x] Video analysis (slow-mo, annotations)
- [x] Meet Day Mode
- [x] 16 achievement badges
- [x] Onboarding flow
- [x] Dark mode
- [x] Data export/import (JSON + CSV)
- [x] PWA manifest + icons
- [x] Custom SVG icons

### Ideas for Next
- [ ] **Push notifications** — remind to train after X days (Notification API)
- [ ] **Season planning** — set goals per event, track progress toward them
- [ ] **Training plan templates** — pre-built weekly plans
- [ ] **Social sharing** — share PB cards as images (html2canvas)
- [ ] **Supabase backend** — cloud sync, user accounts, leaderboard
- [ ] **Coach view** — share read-only dashboard link with coach
- [ ] **Apple Watch integration** (if going native)
- [ ] **AI training insights** — pattern detection from session data

---

## Tips

- **TypeScript errors**: Run `npx tsc --noEmit` to check types without building
- **CSS is organized by section**: Search for `============` headers in globals.css
- **All components are `'use client'`**: This is a fully client-side app
- **localStorage has ~5MB limit**: Large video files go to IndexedDB via `media-storage.ts`
- **The app works offline**: Once loaded, no network needed

---

Keep building. You've got a solid foundation here.
