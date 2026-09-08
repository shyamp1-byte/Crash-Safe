# CrashSafe

Offline-first iOS app for documenting car crashes, hit-and-runs, vandalism, and weather-damage incidents. Walks user step-by-step through scene capture, then generates a PDF report.

## Stack

- Expo SDK 56, React Native 0.85.3, React 19.2.3
- TypeScript
- WatermelonDB 0.28.0 (SQLite, `jsi: true`) — offline-first local storage
- Zustand — state (`incidentStore`, `authStore`)
- Supabase — auth + sync
- React Navigation (native-stack)
- expo-camera, expo-location, expo-print, expo-media-library

## Setup

Requires a native dev build (WatermelonDB needs JSI — won't run in Expo Go).

```bash
npm install
sudo xcode-select -s /Applications/Xcode.app   # if Xcode installed elsewhere
sudo gem install cocoapods
npx expo run:ios
```

## Structure

```
src/
  screens/
    Home.tsx, Splash/
    CrashFlow/       — 9 steps
    HitRunFlow/       — 8 steps
    VandalismFlow/    — 7 steps
    WeatherFlow/      — 6 steps
    IncidentHistory/  — list + detail
    Auth/             — Login, SignUp
    Profile/
    Report/
  db/                 — schema, migrations, WatermelonDB models (Incident, IncidentStep, Photo, UserProfile)
  store/              — incidentStore.ts, authStore.ts (Zustand)
  services/           — incidentService, location, pdfService (report generation), supabase, sync
  components/         — AddressAutocomplete, IncidentCard, PhotoCapture, StepChecklist, StepHeader
  navigation/         — RootNavigator + types
  constants/          — steps.ts, strings.ts, theme.ts
```

## Status

Done: four incident flows (Crash, HitRun, Vandalism, Weather), local DB, PDF report generation, Supabase sync, auth screens, profile w/ photo persistence.

Not built: lawyer feature, Android config/testing.

## Scripts

```bash
npm start       # expo start
npm run ios     # expo run:ios
npm run android # expo run:android
npm run web     # expo start --web
```
