# Deploying: Backend on Render, Frontend on Vercel

## Before deploying — two more fixes included in this zip

While preparing this I found the frontend's `api.ts` had `http://localhost:8000`
**hardcoded**, which would have silently broken everything the moment you
deployed the frontend anywhere but your own laptop. Fixed:

- `frontend/src/services/api.ts` now reads `VITE_API_BASE_URL` (falls back to
  `localhost:8000` for local dev, so nothing changes for you locally).
- `backend/app/db/database.py` now normalizes `postgres://` → `postgresql://`
  (Render's managed Postgres hands out the former; SQLAlchemy 2.x only
  accepts the latter) and adds SQLite's `check_same_thread=False` safely
  (only applied when the DB is actually SQLite).

---

## Part 1 — Backend on Render

**Use Render's managed Postgres, not SQLite, for the deployed backend.**
Render's free/standard web services have an *ephemeral* filesystem — every
deploy or restart wipes local files, including a SQLite `.db` file. Postgres
persists independently of your app's deploys.

1. **Create the database:** Render dashboard → New → PostgreSQL (free tier is fine
   to start). Once created, copy its **Internal Database URL**.
2. **Create the web service:** New → Web Service → connect this GitHub repo.
   - **Root Directory:** `backend`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
3. **Environment variables** (Render → your service → Environment):
   ```
   DATABASE_URL=<the Postgres Internal Database URL from step 1>
   JWT_SECRET_KEY=<generate a real random secret — don't reuse the repo's placeholder>
   JWT_ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   OTP_EXPIRY_MINUTES=5
   SESSION_45_DAYS=64800
   ```
   (CORS is currently wide open — `allow_origins=["*"]` in `main.py` — so no
   CORS env var is needed for this to work. See the security note at the bottom.)
4. **Deploy.** On first boot, `main.py`'s startup code creates all tables automatically — but it only adds the lat/lng columns and backfills known hospitals; it does **not** create your admin user, doctors, or hospital rows from scratch on an empty database. **Run the seed once** after the first successful deploy:
   - Render dashboard → your service → **Shell** tab → run: `python -m app.db.seed`
   - This is one-time only. It safely no-ops on records that already exist if you run it again.
5. **Verify:** open `https://<your-service>.onrender.com/health` — should return `{"status":"healthy","database":"ok"}`. Also check `https://<your-service>.onrender.com/docs` for the interactive API docs.

⚠️ Render's free-tier web services **spin down after inactivity** and take ~30–60 seconds to wake on the next request. That first request (e.g. the citizen app's booking, or the dashboard's poll) will be slow but should still succeed. Upgrade to a paid instance to avoid this in production.

---

## Part 2 — Hospital dashboard frontend on Vercel

1. Vercel dashboard → Add New → Project → import this repo.
2. **Root Directory:** `frontend`
3. Framework preset: Vite (should auto-detect from `package.json`).
4. **Environment variable:**
   ```
   VITE_API_BASE_URL=https://<your-render-service>.onrender.com/api/v1
   ```
5. Deploy. Vercel runs `npm run build` by default — note this repo's `build` script is `tsc && vite build`, and there's a pre-existing, unrelated `tsc` type error in `src/utils/doctorPdfExtract.ts` (confirmed present in your original zip, not something introduced here). **This will fail Vercel's build** until fixed. Two options:
   - Quick fix for deployment: in Vercel's project settings, override the **Build Command** to `npx vite build` (skips the `tsc` gate; Vite itself builds fine, as I verified).
   - Proper fix: add a `frontend/src/vite-env.d.ts` with `/// <reference types="vite/client" />` and adjust the `pdfjs-dist` worker import in `doctorPdfExtract.ts` to match your installed `pdfjs-dist` version's API. Happy to do this if you want the `tsc` gate kept.

---

## Part 3 — Point the citizen (user) app at the deployed backend too

If you also deploy the citizen (user-dashboard) app, give it the same Render URL via its own env var (see the earlier `user-dashboard-changes.zip` README):
```
VITE_HOSPITAL_API_BASE_URL=https://<your-render-service>.onrender.com/api/v1
```

---

## Security note before going further than a demo

`main.py` currently sets `allow_origins=["*"]` (any website can call this API) and `POST /appointments` has no authentication at all — anyone with the URL could create fake appointments. Fine for a prototype; before real deployment with real patient data you'd want to at least restrict CORS to your two known frontend domains and add an API key or proper auth to the write endpoints. Not something I changed here since it wasn't part of what was asked, but flagging it since deployment is the point where it starts to matter.
