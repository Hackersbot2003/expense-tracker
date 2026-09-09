# ExpenseFlow — Mobile

Expo Router + TypeScript React Native app. All screens are built and wired
to the backend API.

## Setup

```bash
cd mobile
npm install
```

Edit `constants/config.ts` and point `API_BASE_URL` at your running backend.
Use your machine's LAN IP (e.g. `http://192.168.1.5:5000/api`), not
`localhost`, if you're testing on a physical device — `localhost` on the
phone refers to the phone itself, not your dev machine. `localhost` is fine
for the iOS Simulator; for Android emulators use `http://10.0.2.2:5000/api`.

## Run

```bash
npx expo start
```

Scan the QR code with Expo Go (Android) or the Camera app (iOS), or press
`a` / `i` for an emulator/simulator.

## Structure

```
mobile/
├── app/
│   ├── _layout.tsx              Root: auth-state redirect guard
│   ├── (auth)/                    login.tsx, register.tsx
│   ├── (tabs)/                     _layout.tsx (bottom nav), index (Home),
│   │                                 transactions, analytics, more, add (placeholder)
│   ├── add-transaction.tsx           Modal
│   └── more/                          friends, budgets, categories, accounts,
│                                        profile (privacy settings), friend-profile (read-only)
├── components/                          AppButton, AppInput, SummaryCard, TransactionCard,
│                                          BudgetProgress, EmptyState, LoadingState, ErrorState,
│                                          ChartCard, FriendCard
├── services/                              one file per backend resource (axios + JWT interceptor)
├── context/AuthContext.tsx                  session bootstrap from stored JWT
├── types/index.ts                            shared TS interfaces matching the backend models
└── constants/                                  theme tokens, default categories, API base URL
```

## What's implemented

- Full auth flow (register/login/logout), JWT persisted in AsyncStorage,
  auto-attached to every request, auto-redirect between (auth) and (tabs).
- Home dashboard: total balance, income/expense cards, overall budget
  progress, latest 5 transactions, pull-to-refresh.
- Add Transaction modal: type toggle, dynamic category list (filtered by
  type), account picker, note.
- Transactions: search, type filter, all 6 quick date filters, all 6 sort
  options, from the actual backend query params (not client-side filtering).
- Analytics: income/expense/savings/avg-daily cards, doughnut (category),
  bar (income vs expense), two line charts (monthly trend, daily spending),
  and computed insights.
- Budgets: overall + per-category, live spent/remaining/% from the backend.
- Categories & Accounts: create/delete, accounts show computed live balance.
- Friends: username search, send/accept/reject requests, friend list,
  remove friend, and a fully **read-only** friend profile screen that only
  renders whatever fields the backend actually returned (which is already
  filtered by that friend's privacy settings — nothing is hidden
  client-side that the API would otherwise send).
- Profile & Privacy: toggles for all 7 privacy flags, saved individually as
  you flip them.

## Verification performed

- `npx tsc --noEmit` — clean, zero errors, checked against the real Expo
  SDK 51 / React Native 0.74 type definitions (533 project files compiled).
- Not run here: on-device rendering, navigation, or a live API call — this
  sandbox has no simulator/device and no network path to Expo's dev
  tooling beyond npm installs. Run `npx expo start` locally against the
  running backend to exercise it end-to-end.
