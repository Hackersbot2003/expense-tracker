# ExpenseFlow

A personal expense tracker mobile app with multi-account budgeting,
analytics, and a privacy-controlled social friends system.

**Stack:** React Native (Expo, TypeScript, Expo Router) · Node.js/Express ·
MongoDB Atlas (Mongoose) · JWT + bcrypt

## Structure

```
expense-tracker/
├── backend/    # Express + TypeScript API — all 7 backend phases complete
└── mobile/     # Expo Router app — all screens built and wired to the API
```

## Build phases — all complete

| Phase | Scope | Status |
|---|---|---|
| 1 | Folder structure + backend setup | ✅ |
| 2 | MongoDB models + authentication (JWT, bcrypt) | ✅ |
| 3 | Categories, accounts, transactions (CRUD) | ✅ |
| 4 | Filters, search, sorting, pagination | ✅ |
| 5 | Analytics (MongoDB aggregation pipelines) | ✅ |
| 6 | Budgets (overall + per-category, live progress) | ✅ |
| 7 | Friends + privacy-controlled read-only access | ✅ |
| 8 | React Native screens wired to every API | ✅ |
| 9 | UI/UX polish (dark theme, empty/loading/error states) | ✅ |

Currency: INR only for v1.

**Verification done in this build:**
- Backend: `tsc --noEmit` passes clean; a full app-import smoke test confirms
  every router → controller → model → service wires up with no runtime
  import errors.
- Mobile: `tsc --noEmit` passes clean across all 16 screens + components +
  services (verified against the real Expo/React Native type definitions,
  533 project files type-checked).
- Not verified here (no simulator/device in this sandbox): actual on-device
  rendering, navigation behavior, and a live MongoDB connection. Run it
  locally to confirm those — see `backend/README.md` and `mobile/README.md`.

## Getting started

1. `cd backend && npm install && cp .env.example .env` — add your MongoDB
   Atlas URI and a JWT secret, then `npm run dev`.
2. `cd mobile && npm install` — update `constants/config.ts` with your
   backend's LAN IP (not `localhost`, if testing on a physical device),
   then `npx expo start`.
3. Register a user in the app, add a couple of accounts/categories, then
   start adding transactions.

