# Deploy CivicAI on Render + Vercel

This guide deploys:

| Part | Platform | URL example |
|------|----------|-------------|
| Backend + PostgreSQL | **Render** (Blueprint) | `https://civicai-api.onrender.com` |
| Frontend | **Vercel** | `https://civicai.vercel.app` |

---

## Prerequisites

- GitHub account with this repo pushed
- [Render](https://render.com) account
- [Vercel](https://vercel.com) account
- (Recommended) [Tavily](https://tavily.com) API key for live web search

---

## Part 1 — Backend on Render (one-click Blueprint)

### Step 1: Push to GitHub

```powershell
cd C:\Users\laksh\OneDrive\Desktop\OOSC
git push origin master
```

Ensure `backend/.env` and `frontend/.env.local` are **not** committed.

### Step 2: Create Blueprint on Render

1. Open **[Render Dashboard → Blueprints](https://dashboard.render.com/blueprints)**
2. Click **New Blueprint Instance**
3. Connect GitHub and select **`OOSC_CIVICAI_Project`** (or your repo name)
4. Render shows a **preview of `render.yaml`** — this is normal. You should see:
   - `civicai-db` (PostgreSQL, free, Singapore)
   - `civicai-api` (Python web service, free, Singapore)
5. Click **Continue** / **Next**. Render asks for **secret environment variables**. Enter:

   | Variable | What to enter |
   |----------|----------------|
   | `CORS_ORIGINS` | Your Vercel URL, e.g. `https://your-app.vercel.app` *(no trailing slash)* |
   | `TAVILY_API_KEY` | Your Tavily API key from `backend/.env` |
   | `PINECONE_API_KEY` | Leave **empty** if you don't use Pinecone |

   > If Vercel isn't deployed yet, use a placeholder like `http://localhost:3000` for now, then update `CORS_ORIGINS` in Render → civicai-api → Environment after Vercel goes live.

6. Click **Apply** / **Create Blueprint** and wait 5–10 minutes.

**If Blueprint shows "A Blueprint file was found, but there was an issue":**

- Do **not** use `pythonVersion` in `render.yaml` (invalid field). Use `PYTHON_VERSION` env var or `backend/runtime.txt` instead.
- Ensure the file is named exactly `render.yaml` at the repo root.
- Remove special characters from comments if validation still fails.

**If Blueprint fails after Apply:**

| Error | Fix |
|-------|-----|
| "Only one free Postgres database allowed" | Delete an old free DB in Render, or upgrade an existing one |
| Build failed on `pip install` | Check Render build logs; ensure **Root Directory** is `backend` |
| `pre-deploy command is not supported for free tier` | Free tier cannot use `preDeployCommand`; migrations run in `startCommand` instead |
| Service live but frontend can't connect | Set `CORS_ORIGINS` to exact Vercel HTTPS URL and redeploy |

**After deploy**, your API URL will look like:

```
https://civicai-api.onrender.com
```

Use that as `NEXT_PUBLIC_API_URL` on Vercel.

### Step 3: Verify backend

Open:

```
https://civicai-api.onrender.com/api/v1/health
```

Expected response:

```json
{"status":"ok","app":"CivicAI","database":"ok", ...}
```

API docs: `https://civicai-api.onrender.com/docs`

> **Free tier note:** Render sleeps after ~15 minutes of inactivity. The first request after sleep may take 30–60 seconds.

---

## Part 2 — Frontend on Vercel

### Step 1: Import project

1. Open **[Vercel Dashboard](https://vercel.com/new)**
2. **Import** your GitHub repository
3. Configure:

   | Setting | Value |
   |---------|--------|
   | **Root Directory** | `frontend` |
   | **Framework Preset** | Next.js |

### Step 2: Environment variable

Add before deploying:

| Key | Value |
|-----|--------|
| `NEXT_PUBLIC_API_URL` | `https://civicai-api.onrender.com` |

Use your **actual Render service URL** (no trailing slash).

### Step 3: Deploy

Click **Deploy**. When finished, copy your Vercel URL, e.g. `https://civicai.vercel.app`.

---

## Part 3 — Connect frontend and backend (CORS)

1. Render → **civicai-api** → **Environment**
2. Update `CORS_ORIGINS`:

   ```
   https://civicai.vercel.app
   ```

   For multiple origins (custom domain + Vercel):

   ```
   https://civicai.vercel.app,https://www.yourdomain.com
   ```

3. Save — Render redeploys automatically.

---

## Part 4 — End-to-end test

1. Open your Vercel URL
2. Start a case (e.g. municipal grievance sample)
3. Open browser **DevTools → Console** — no CORS errors
4. Fill applicant details → generate document → download `.txt`

---

## Updating after code changes

| Change | Action |
|--------|--------|
| Backend code | Push to GitHub → Render auto-deploys |
| Frontend code | Push to GitHub → Vercel auto-deploys |
| `NEXT_PUBLIC_API_URL` changed | Redeploy Vercel (env vars are baked in at build) |
| `CORS_ORIGINS` changed | Save on Render → auto redeploy |

---

## Manual Render setup (without Blueprint)

If you prefer not to use the Blueprint:

| Setting | Value |
|---------|--------|
| Root Directory | `backend` |
| Build Command | `pip install --upgrade pip && pip install -r requirements-prod.txt` |
| Start Command | `alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port $PORT` |

Link a PostgreSQL database and set the same env vars as in `render.yaml`.

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| CORS error in browser | Set `CORS_ORIGINS` to exact Vercel URL (`https://...`) |
| `Network error` on frontend | Check `NEXT_PUBLIC_API_URL` on Vercel; redeploy |
| Render build fails | Confirm Root Directory is `backend` |
| Database connection error | Ensure Postgres is linked; `DATABASE_URL` set via Blueprint |
| Slow first request | Render free tier cold start — normal for demos |
| Migrations not applied | Check Render deploy logs for `alembic upgrade head` |

---

## Optional — Custom domains

**Vercel:** Project → Settings → Domains

**Render:** civicai-api → Settings → Custom Domains → e.g. `api.yourdomain.com`

Then update:

- Vercel: `NEXT_PUBLIC_API_URL=https://api.yourdomain.com`
- Render: `CORS_ORIGINS=https://yourdomain.com`

Redeploy both services.

---

## Files reference

| File | Purpose |
|------|---------|
| `render.yaml` | Render Blueprint (DB + API) |
| `backend/requirements-prod.txt` | Production Python deps incl. PostgreSQL driver |
| `frontend/.env.example` | Local frontend env template |
| `backend/.env.example` | Local backend env template |
