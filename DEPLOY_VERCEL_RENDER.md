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
3. Connect your GitHub account and select this repository
4. Render reads `render.yaml` at the repo root and shows:
   - **civicai-db** — PostgreSQL database
   - **civicai-api** — Python web service
5. When prompted, enter these **secret environment variables**:

   | Variable | Example value |
   |----------|----------------|
   | `CORS_ORIGINS` | `https://your-app.vercel.app` *(update after Vercel deploy)* |
   | `TAVILY_API_KEY` | Your Tavily key |
   | `PINECONE_API_KEY` | *(leave blank if unused)* |

6. Click **Apply** and wait for both resources to deploy (5–10 minutes first time).

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
| Build Command | `pip install -r requirements-prod.txt` |
| Pre-Deploy Command | `alembic upgrade head` |
| Start Command | `uvicorn app.main:app --host 0.0.0.0 --port $PORT` |

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
