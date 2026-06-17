# Mood Chart → Mental Wellness Platform (Production-Ready) — TODO

## Phase 1 — Auth + User-scoped foundation (Backend + Frontend)
- [ ] Add Backend `User` model + DB fields (join date, email, name, password hash, avatar)
- [ ] Add Backend auth security utilities (hashing + JWT helpers)
- [ ] Add Backend auth endpoints:
  - [ ] `POST /auth/signup`
  - [ ] `POST /auth/login`
  - [ ] `POST /auth/logout`
  - [ ] `POST /auth/forgot-password`
  - [ ] `POST /auth/reset-password`
  - [ ] `GET /auth/me`
- [ ] Update Backend `/moods/*` endpoints to be user-scoped and require auth
  - [ ] Add `user_id` to Mood model
  - [ ] Replace global streak/analytics with user-filtered queries
- [ ] Add Frontend auth routing + gating
  - [ ] Install/enable `react-router-dom`
  - [ ] Create `AuthProvider` + `useAuth`
  - [ ] Update `frontend/src/api.js` to include bearer token on protected calls
- [ ] Update existing UI to preserve design identity
  - [ ] Ensure Navbar/Hero/Banner/History/Analytics remain visually unchanged

## Phase 2 — Motivational Landing Page + Auth Screens (Design-native)
- [ ] Add `Landing.jsx` (daily quote + hero + preview stats)
- [ ] Add `Login.jsx`, `Signup.jsx`, `ForgotPassword.jsx`
- [ ] Add password visibility toggle + form validation + remember me
- [ ] Add smooth page transitions using existing keyframes/tokens

## Phase 3 — AI Mood Tracking (Deterministic production-safe first)
- [ ] Implement weekly/monthly insights, balance score, consistency score
- [ ] Implement trend predictions and personalized suggestions
- [ ] Add AI insight cards UI components

## Phase 4 — Interactive Calendar View
- [ ] Add monthly calendar page with color-coded mood intensities
- [ ] Add hover tooltip with mood, notes, AI insights
- [ ] Add monthly summary + legend

## Phase 5 — Points, Rewards & Gamification
- [ ] Implement points/XP/levels + achievements/badges UI
- [ ] Award points on entry, streak, weekly consistency, milestones, AI suggestions used

## Phase 6 — Mood Personalization
- [ ] Custom moods CRUD UI + backend persistence
- [ ] Merge default + user moods into mood scale responses

## Phase 7 — Enhanced Dashboard + Profile + Settings
- [ ] Dashboard overview cards + widgets
- [ ] Profile page + settings:
  - [ ] dark/light toggle (CSS variable overrides while preserving theme look)
  - [ ] notification preferences
  - [ ] privacy settings
  - [ ] export data
  - [ ] delete account

## Phase 8 — Notifications + Data Viz + UX Polish
- [ ] Motivational reminder preferences + reminder logic
- [ ] Add charts (SVG-based if no chart library present)
- [ ] Add loading skeletons, empty states, tooltips, toast notifications, better navigation, accessibility
