# Production connection checklist (fix "temporarily unavailable")

## 1. Render backend env vars

Render Dashboard → **civicai-api** → **Environment**:

| Variable | Required value |
|----------|----------------|
| `CORS_ORIGINS` | `https://oosc-civicai-project.vercel.app` |
| `TAVILY_API_KEY` | Your Tavily key |
| `ENVIRONMENT` | `production` |
| `DATABASE_URL` | Auto-linked from `civicai-db` |

Click **Save Changes** → wait for redeploy.

Test (may take ~60s on first request — free tier cold start):

```
https://civicai-api.onrender.com/api/v1/health
```

Expected JSON: `"status":"ok"`, `"database":"ok"`

---

## 2. Vercel frontend env vars

Vercel Dashboard → **oosc-civicai-project** → **Settings** → **Environment Variables**:

| Variable | Required value |
|----------|----------------|
| `NEXT_PUBLIC_API_URL` | `https://civicai-api.onrender.com` |

**Important:** No trailing slash. Must redeploy Vercel after adding/changing this variable.

---

## 3. Verify in browser

1. Open https://oosc-civicai-project.vercel.app
2. Press **F12** → **Network** tab
3. Click **Get Help**
4. You should see a request to `https://civicai-api.onrender.com/api/v1/cases`

If the request goes to `localhost:8000`, Vercel env var is missing — fix step 2 and redeploy.

If the request fails with CORS error, fix `CORS_ORIGINS` on Render (step 1).

---

## 4. Free tier notes

- Render sleeps after 15 min idle — first click may take **30–60 seconds**
- Free Postgres expires after **30 days** — upgrade for long-term demos
