# Tech Tatva OS

A production-shaped club operations platform built with Next.js 15, TypeScript, MongoDB, NextAuth, Cloudinary, and a premium graphite/violet interface.

## Included

- Public website: home, about, events, event detail, teams hierarchy, gallery, and contact
- Admin command center with analytics, live operations, attendance, tasks, and AI insight surfaces
- Indexed Mongoose schemas for users, roles, teams, sub-teams, events, registrations, attendance, tasks, notifications, announcements, gallery assets, sponsors, achievements, club information, audit logs, and contact messages
- JWT session authentication with Google OAuth and credentials support
- Protected `/admin` routes and permission defaults for all eight roles
- Event creation, event registration, cancellation, global search, QR-token-ready registrations
- University-style PDF and XLSX attendance exports
- Cloudinary signed upload helper, validation, and basic rate limiting

## Local Setup

1. Install Node.js 20 or newer and run:

   ```bash
   npm install
   cp .env.example .env.local
   npm run dev
   ```

2. Open `http://localhost:3000`.

3. Add environment values in `.env.local`. The app UI runs without a database, but APIs and authentication require MongoDB.

## MongoDB Atlas

1. Create an Atlas project and an M10+ cluster for production.
2. Add a database user, allow the Vercel deployment IP range or use Atlas network access configuration appropriate for serverless deployments.
3. Copy the connection URI into `MONGODB_URI`.
4. Seed the configurable RBAC roles after installing dependencies:

   ```bash
   npx tsx scripts/seed.ts
   ```

Collections are created lazily by Mongoose. Review and run index creation during deployment against a staging database before promoting production traffic.

## Authentication

Generate `AUTH_SECRET` with:

```bash
openssl rand -base64 32
```

Create a Google OAuth app, then set `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET`. Add `/api/auth/callback/google` to the authorized callback URL.

## Cloudinary

Create a Cloudinary project and set `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET`. Use `getUploadSignature()` in `lib/cloudinary.ts` from authorized upload routes. Store the returned `secure_url` and `public_id` on gallery or event records.

## Attendance Exports

Authorized users can download university-format attendance sheets:

```text
GET /api/attendance/export?event=<event-id>&format=pdf
GET /api/attendance/export?event=<event-id>&format=xlsx
```

Attendance records are tied to event registrations and preserve method, marker, and timestamp for auditability.

## Deploy To Vercel

1. Push the repository to GitHub.
2. Import it in Vercel as a Next.js project.
3. Add every value from `.env.example` under Project Settings > Environment Variables.
4. Deploy and add the production OAuth callback URL.
5. Run smoke checks against `/`, `/events`, `/admin`, and `/api/health`.

## Expansion Points

The model layer is intentionally modular for certificate generation, alumni records, recruitment, elections, merchandise, sponsorship CRM, mobile API consumers, and external calendar synchronization.
