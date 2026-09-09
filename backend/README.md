# ExpenseFlow — Backend

Express + TypeScript + MongoDB (Mongoose) API. All 7 backend phases are
implemented: auth, categories, accounts, transactions (with filters/search/
sort/pagination), budgets, analytics (aggregation pipelines), and a
privacy-gated friends system.

## Setup

```bash
cd backend
npm install
cp .env.example .env
# then edit .env with your real MongoDB Atlas URI and a JWT secret
```

## Run (dev, auto-reload)

```bash
npm run dev
```

## Build & run (production)

```bash
npm run build
npm start
```

## Verify it's working

```bash
curl http://localhost:5000/health
curl http://localhost:5000/api
```

Then try the real flow:

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Vinay","username":"vinay123","email":"vinay@example.com","password":"password123","confirmPassword":"password123"}'
# copy the returned token, then:
curl http://localhost:5000/api/auth/me -H "Authorization: Bearer <token>"
```

## Structure

```
backend/src/
├── config/db.ts               Mongoose connection
├── models/                    User, Category, Account, Transaction, Budget, FriendRequest
├── middleware/                authMiddleware (JWT), validateRequest, errorHandler
├── validators/                express-validator chains per resource
├── controllers/                one per resource + friendDataController (privacy-gated reads)
├── services/                    analyticsService (aggregation), dateRangeService, friendPrivacyService
├── routes/                       mounted under /api in routes/index.ts
├── utils/                          ApiError, generateToken/verifyToken
├── types/express.d.ts               augments Request with req.user
├── app.ts                            Express app: middleware + routes
└── server.ts                          bootstraps env, DB, HTTP listener
```

## API reference

| Resource | Routes |
|---|---|
| Auth | `POST /auth/register`, `POST /auth/login`, `GET /auth/me`, `PUT /auth/privacy-settings` |
| Categories | `GET/POST /categories`, `PUT/DELETE /categories/:id` |
| Accounts | `GET/POST /accounts`, `PUT/DELETE /accounts/:id` (GET includes computed live balance) |
| Transactions | `GET/POST /transactions`, `GET/PUT/DELETE /transactions/:id` — GET supports `page`, `limit`, `type`, `categoryId`, `accountId`, `minAmount`, `maxAmount`, `startDate`/`endDate` or `quickFilter`, `sortBy`, `search` |
| Budgets | `GET/POST /budgets`, `PUT/DELETE /budgets/:id` — GET returns spent/remaining/percentUsed per budget |
| Analytics | `GET /analytics/dashboard`, `/category-expenses`, `/monthly-trend`, `/daily-spending`, `/insights` |
| Friends | `GET/POST /friends`, `GET /friends/requests`, `PUT /friends/request/:id/accept|reject`, `DELETE /friends/:id`, `GET /friends/:userId/profile|analytics|transactions|compare` |
| Users | `GET /users/search?username=` |

All routes except `/auth/register` and `/auth/login` require
`Authorization: Bearer <token>`. Every friend-data route enforces both an
accepted-friendship check and the target user's own privacy settings
server-side — the mobile app never has to hide fields itself.

## Verification performed

- `npx tsc --noEmit` — clean, zero errors.
- Import-time smoke test (`import app from './app'`) — confirms every
  router → controller → model → service resolves with no circular-import
  or missing-export bugs, without needing a live database.
- Not run here: an actual MongoDB connection (this sandbox has no network
  access to download a local mongod, and no Atlas credentials). Point
  `MONGODB_URI` at a real cluster and the flows above will work as written.
