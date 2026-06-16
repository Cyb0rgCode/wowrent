# WowRent 🚗

A two-sided car rental marketplace for Tunisia. It connects **car suppliers**
— both private owners and rental agencies — with **clients** who want to rent
vehicles. Clients can search, book by the day, pay online in TND via
**Konnect**, review trips, and message owners. Suppliers list and manage their
fleet, handle bookings, and track earnings.

## Features

- **Accounts & auth** — email/password sign-up and login (JWT session cookie).
  One account can both rent and host.
- **Listings** — suppliers (individual or agency) create cars with photos,
  pricing, and specs. Public search with filters (location, type, gearbox,
  price, seats).
- **Booking** — date-range reservations with server-side availability checks
  (no double-booking) and a transparent price breakdown.
- **Payments** — Konnect (Tunisian gateway), amounts in TND. Platform takes a
  configurable commission. Falls back to a local mock when no API keys are set,
  so the flow stays runnable in development.
- **Reviews** — clients rate cars after a completed trip; ratings show on
  listings.
- **Messaging** — in-app conversations between clients and owners with unread
  badges (polling-based).

## Tech stack

Next.js 14 (App Router) · TypeScript · Prisma · PostgreSQL · Tailwind CSS ·
Zod · jose + bcrypt for auth · Konnect for payments.

## Deploy a live demo (Vercel)

GitHub Pages can't host WowRent — it only serves static files, and this app
needs a Node server, API routes, and a PostgreSQL database. **Vercel** runs it
natively. The build automatically applies migrations and loads demo data, so
the deployed site has cars to browse immediately.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FCyb0rgCode%2Fwowrent&env=AUTH_SECRET&envDescription=Secret%20used%20to%20sign%20session%20cookies&project-name=wowrent&repository-name=wowrent)

**Steps (~5 minutes):**

1. Click **Deploy** above and let Vercel clone the repo into your account.
2. In the new Vercel project, open **Storage → Create Database → Postgres**
   (Vercel Postgres / Neon). Connecting it automatically sets `DATABASE_URL`.
3. Under **Settings → Environment Variables**, add `AUTH_SECRET` — any long
   random string (e.g. run `openssl rand -base64 32`). If you didn't set it on
   the deploy screen, add it here.
4. Trigger a redeploy (**Deployments → ⋯ → Redeploy**). The build runs
   `prisma migrate deploy` and seeds demo data on first run.
5. Open the live URL and log in with a demo account below.

**Notes for the hosted demo:**

- **Payments** run in mock mode unless you add `KONNECT_API_KEY` and
  `KONNECT_WALLET_ID` (see [Payments](#payments-konnect)). In mock mode the
  booking is confirmed without a real charge — perfect for a demo.
- **Photos**: Vercel's filesystem is read-only, so use the **"paste an image
  URL"** option when listing a car (the seeded cars already use hosted image
  URLs). File uploads work when running locally.

## Getting started

### 1. Prerequisites

- Node.js 20+
- A PostgreSQL database

### 2. Configure environment

```bash
cp .env.example .env
```

Set `DATABASE_URL` and `AUTH_SECRET`. Konnect keys are optional in dev (see
[Payments](#payments-konnect)).

### 3. Install, migrate, seed

```bash
npm install
npm run db:migrate      # apply Prisma migrations
npm run db:seed         # load demo suppliers, cars, a booking + review
```

### 4. Run

```bash
npm run dev             # http://localhost:3000
```

### Demo accounts (from the seed)

| Role | Email | Password |
|------|-------|----------|
| Agency (supplier) | `agency@wowrent.tn` | `password123` |
| Owner (supplier)  | `owner@wowrent.tn`  | `password123` |
| Client            | `client@wowrent.tn` | `password123` |

## Payments (Konnect)

WowRent uses the [Konnect](https://konnect.network) gateway. Configure:

```env
KONNECT_API_URL="https://api.sandbox.konnect.network/api/v2"
KONNECT_API_KEY="<your sandbox api key>"
KONNECT_WALLET_ID="<your wallet id>"
PLATFORM_COMMISSION_RATE="0.10"   # 10% service fee
```

Flow: the server calls `POST /payments/init-payment` with the booking total in
**millimes** (1 TND = 1000 millimes), then redirects the client to Konnect's
hosted `payUrl`. On return, `/bookings/[id]/complete` and the
`/api/payments/webhook` endpoint both verify the payment via
`GET /payments/{paymentRef}` before marking the booking `CONFIRMED`
(idempotent).

**No keys?** When `KONNECT_API_KEY`/`KONNECT_WALLET_ID` are empty, payments run
in mock mode: the pay button redirects straight to the completion page and the
booking is confirmed, so you can exercise the whole flow locally.

## Project structure

```
app/                 # App Router pages + API routes
  api/               # auth, cars, bookings, payments, reviews, messages, upload
  cars/, dashboard/, trips/, messages/, bookings/
components/          # UI components (client + server)
lib/                 # prisma, auth/jwt, konnect, availability, validations
prisma/              # schema, migrations, seed
tests/               # unit tests (availability + pricing)
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build (runs `prisma generate`) |
| `npm run db:migrate` | Create/apply migrations |
| `npm run db:seed` | Seed demo data |
| `npm run db:reset` | Reset DB and re-seed |
| `npm test` | Run unit tests |
| `npm run lint` | Lint |

## Notes / roadmap

Image uploads are stored on the local filesystem (`public/uploads`) for the
MVP — swap for S3/object storage in production. Real-time messaging
(WebSockets/Pusher), Konnect payouts/settlement to suppliers, a map view, and
an admin moderation panel are planned follow-ups.
