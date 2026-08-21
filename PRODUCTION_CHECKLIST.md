# Production connection checklist (fix "pending" / "temporarily unavailable")

## 1. Render backend (critical)

Render Dashboard → **civicai-api** → **Environment** — set:

| Variable | Required value |
|----------|----------------|
| `DATABASE_URL` | `sqlite:///./data/civic_ai.db` |
| `ENVIRONMENT` | `production` |
| `LLM_PROVIDER` | `fallback` |
| `CORS_ORIGINS` | `https://oosc-civicai-project.vercel.app` |
| `TAVILY_API_KEY` | Your Tavily key (optional but recommended) |

**Remove or override** any old Postgres `DATABASE_URL` linked to `civicai-db` — that was causing the server to hang on startup.

Click **Save Changes**, then **Manual Deploy** → Deploy latest commit.

Test (first request may take ~60s on free tier cold start):

```
https://civicai-api.onrender.com/health
```

Expected: `{"status":"ok","app":"CivicAI"}` in under 5 seconds after deploy is live.

---

## 2. Vercel frontend

The frontend now proxies API calls through Vercel (`/api/v1/...` → Render). **You do not need `NEXT_PUBLIC_API_URL` on Vercel** unless you want to override the default.

After pushing the latest code, **Redeploy** on Vercel (Deployments → Redeploy).

Optional env var:

| Variable | Value |
|----------|--------|
| `BACKEND_URL` | `https://civicai-api.onrender.com` |

---

## 3. Verify in browser

1. Open https://oosc-civicai-project.vercel.app
2. Press **F12** → **Network**
3. Click **Get Help**
4. Request should go to **`/api/v1/cases`** on `oosc-civicai-project.vercel.app` (same origin)

If you still see `localhost:8000`, hard-refresh (Ctrl+Shift+R) after Vercel redeploy.

If request stays **pending** for 90+ seconds, check **Render → Logs** for deploy errors.

---

## 4. Free tier notes

- Render sleeps after ~15 min idle — first request may take **30–90 seconds**
- SQLite on Render resets if the service is redeployed (fine for demos)
