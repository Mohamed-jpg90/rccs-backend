# RCCS Admin Backend

Backend for the Russian Cultural Center Management System — Admin Module.
Stack: **Node.js + Express + MongoDB (Mongoose)**.

## Folder structure

```
rccs-backend/
├── server.js                 # Entry point: loads env, connects DB, starts server
├── package.json
├── .env.example               # Copy to .env and fill in values
├── src/
│   ├── app.js                 # Express app: middleware, routes, error handling
│   ├── config/
│   │   ├── db.js              # MongoDB connection module
│   │   └── constants.js       # Shared enums (roles, statuses, priorities)
│   ├── models/                # Mongoose schemas (one per entity)
│   │   ├── User.js
│   │   ├── Club.js
│   │   ├── Event.js
│   │   ├── Attendance.js
│   │   ├── Badge.js
│   │   ├── UserBadge.js
│   │   ├── Announcement.js
│   │   ├── Notification.js
│   │   └── index.js           # Barrel export of all models
│   ├── controllers/           # Route handlers (to be built)
│   ├── routes/                # Express routers (to be built)
│   ├── middlewares/           # Auth, RBAC, error handling, upload (to be built)
│   ├── utils/                 # Helpers (JWT signing, etc.) (to be built)
│   └── validators/            # Request validation schemas (to be built)
└── uploads/                    # Local storage for uploaded images
```

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy environment variables:
   ```bash
   cp .env.example .env
   ```
   Then set `MONGO_URI` and `JWT_SECRET`.
3. Run in development:
   ```bash
   npm run dev
   ```
4. Check it's alive:
   ```bash
   curl http://localhost:5000/api/health
   ```

## Entities implemented (models only, step 1)

User, Club, Event, Attendance, Badge, UserBadge, Announcement, Notification —
matching the fields defined in the system spec, with Mongoose validation,
references between collections (`ObjectId` + `ref`), and shared enums pulled
from `src/config/constants.js` so Role/Status values stay consistent everywhere.

## Next steps

- Build `middlewares/auth.js` (JWT verification) and `middlewares/rbac.js` (role checks).
- Build controllers + routes per resource (auth, users, clubs, events, attendance, badges, announcements, notifications, dashboard).
- Wire routes into `src/app.js`.
- Add `multer` upload middleware for club/event/badge images.
