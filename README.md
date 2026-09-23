# EduMed

Full-stack rebuild of the EduMed medical dashboard for general practitioners — patient
management, an interactive 2D body model for clinical annotations, a live BMI calculator,
and an appointment schedule.

## Stack

- **Frontend:** React + Vite + Tailwind CSS, `react-router-dom`, `recharts`
- **Backend:** Node.js serverless functions under `/api` (Vercel Functions)
- **Database:** PostgreSQL (Neon), raw SQL via `@neondatabase/serverless`
- **Auth:** JWT, single doctor account

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Create the database schema** — run `db/schema.sql` against your Neon database
   (e.g. via the Neon SQL editor, or `psql "$DATABASE_URL" -f db/schema.sql`).

3. **Configure environment variables** — copy `.env.example` to `.env` and fill in:
   - `DATABASE_URL` — your Neon connection string
   - `JWT_SECRET` — any long random string
   - `SEED_DOCTOR_EMAIL` / `SEED_DOCTOR_PASSWORD` / `SEED_DOCTOR_NAME` — login credentials
     for the seeded doctor account

4. **Seed the database** (creates the doctor login + mock patients/annotations/visits/appointments)
   ```bash
   npm run seed
   ```

5. **Run locally** (serves the Vite frontend + `/api` serverless functions together)
   ```bash
   npm run dev
   ```
   Log in with the `SEED_DOCTOR_EMAIL` / `SEED_DOCTOR_PASSWORD` from your `.env`.

## Deploying

Push to a Git repo and import it in Vercel. Set the same environment variables
(`DATABASE_URL`, `JWT_SECRET`) in the Vercel project settings, then run
`npm run seed` once (locally, pointed at the production `DATABASE_URL`) to seed
the live database.

## Project structure

```
api/                  Vercel serverless functions (Express-style handlers)
  auth/                login, session check
  patients/            list/search/create, get/update by id
  annotations/          create/list, update/delete by id
  visits/               visit history entries
  appointments/         schedule
  dashboard/            aggregate stats for the dashboard
db/
  schema.sql           PostgreSQL schema
  seed.js              seeds doctor user + mock data
src/
  pages/               Dashboard, PatientDirectory, PatientDetail, Schedule, Login
  components/          BodyModel, BmiCalculator, modals, layout
  context/             AuthContext (JWT session)
  lib/                 API client, static reference data (body systems, regions)
```
