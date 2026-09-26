# Hospital Dashboard — Changed Files

Copy each file below into the matching path in `SUGASTHA-hospital-dashboard-main/`,
overwriting the existing file, then restart both the backend and frontend:

```
cd backend && uvicorn app.main:app --reload
cd frontend && npm run dev
```

No manual migration needed — the app now self-migrates on startup (see below).

| File | What changed |
|---|---|
| `backend/app/models/hospital.py` | Added `latitude`, `longitude` columns to the `Hospital` table. |
| `backend/app/schemas/hospital.py` | Added `latitude`, `longitude` to the hospital schema so they're returned by the API. |
| `backend/app/db/seed.py` | Seeds real coordinates for the 3 government hospitals (AIIMS, Safdarjung, RML) and backfills coordinates on hospitals that already exist in your DB from before this change. |
| `backend/app/api/v1/hospitals.py` | **New endpoint:** `GET /api/v1/hospitals/nearby-govt?lat=&lng=&limit=4` — filters to government-type hospitals (by keyword match on `hospital_type`, e.g. "Govt", "AIIMS", "District Hospital", "PHC", "CHC") and ranks them by live haversine distance from the given coordinates. This is what the citizen (user) app calls right after login. |
| `backend/app/main.py` | On every startup, safely adds the `latitude`/`longitude` columns via `ALTER TABLE` if they're missing, and backfills the 3 known hospitals' coordinates — so this works immediately even on your existing `sugastha.db` without re-running the seed script. |
| `frontend/src/services/apiAdapters.ts` | **New — fixes a real bug.** See "Critical fix" below. |
| `frontend/src/services/api.ts` | Now runs every hospital/doctor/appointment response through the new adapters before returning them. |
| `frontend/src/context/HealthcareContext.tsx` | The one-time backend sync on startup is now a 15-second poll, so a request booked from the citizen app shows up without hospital staff reloading the page. |
| `frontend/src/services/api.ts` (updated again) | No longer hardcodes `http://localhost:8000` — now reads `VITE_API_BASE_URL` so it can actually be deployed (see `DEPLOYMENT.md`). |
| `backend/app/db/database.py` | Normalizes `postgres://` → `postgresql://` connection strings (Render's Postgres format) and safely adds SQLite's thread-safety flag only when the DB is SQLite. |

**See `DEPLOYMENT.md` in this zip for step-by-step Render + Vercel deployment instructions.**

## ⚠️ Critical fix: your dashboard couldn't actually read its own backend

While testing whether a citizen booking would really show up and be acceptable in the hospital dashboard, I found a pre-existing bug, unrelated to anything I built for the connection itself: your FastAPI backend returns fields in `snake_case` (`hospital_id`, `patient_name`, `icu_beds_available`...), but `frontend/src/types/index.ts` defines `Hospital`, `Doctor`, and `Appointment` entirely in `camelCase` (`hospitalId`, `patientName`, `icuBedsAvailable`...). The "sync with live backend" code in `HealthcareContext.tsx` fetched real data but never translated the field names, so:

- `hospitalAppointments = appointments.filter(a => a.hospitalId === activeHospital.id)` would **always fail** for any appointment that came from the backend (its field is `hospital_id`, so `a.hospitalId` is `undefined`) — meaning a real citizen booking would never appear in "Pending Review", even though it was correctly saved in the database.
- Same issue for bed counts, doctor queue lengths, etc. pulled from the backend.

`apiAdapters.ts` fixes this by translating every backend response into the exact camelCase shape your UI already expects, applied once in `api.ts`. I verified this against the real schemas on both sides (backend `schemas/*.py` vs frontend `types/index.ts`) field-by-field.

I also confirmed this bug — and the fix — has nothing to do with a "hospital not accepting" or the connection being broken; the data was being saved correctly the whole time, it just wasn't rendering.

## Note on live updates

The backend sync now polls every 15 seconds instead of running once. So a request from the citizen app will appear in the hospital dashboard within ~15 seconds automatically — no manual refresh needed.

## Tested

I ran this exact code against a real, pre-existing `sugastha.db` (the one with your 3 seeded hospitals and no lat/lng columns) and confirmed:

- The server starts cleanly and the migration runs silently (columns added, coordinates backfilled).
- `GET /api/v1/hospitals/nearby-govt?lat=28.6304&lng=77.2177&limit=4` returns all 3 government hospitals correctly sorted by live distance from that point (RML 1.6 km → Safdarjung 6.8 km → AIIMS 7.1 km).
- `POST /api/v1/appointments` accepts the exact payload shape the user-app's new `hospitalDashboardService.ts` sends (matches your existing `AppointmentCreate` schema — no changes needed on that endpoint).
- Frontend: `npx vite build` succeeds with the adapter changes in place. (Note: `npm run build`'s `tsc` step currently fails on an unrelated, **pre-existing** error in `src/utils/doctorPdfExtract.ts` about a `pdfjs-dist` worker import — I confirmed this exists in your original zip too, before any of my changes. It doesn't affect `npm run dev` or the actual bundle output, just the strict `tsc` gate in the `build` script.)

## Note on "government" filtering

The filter is a simple keyword match on the existing `hospital_type` text field (`govt`, `government`, `aiims`, `district hospital`, `civil hospital`, `phc`, `chc`, `municipal`, `esic`, etc.), so it works with your existing seed data with zero changes. If you later onboard private hospitals, just make sure their `hospital_type` doesn't accidentally contain one of those words.
