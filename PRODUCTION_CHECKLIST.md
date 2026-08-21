# Production checklist

CivicAI now runs the **API on Vercel** (Next.js route handlers). Render is optional for local/dev only.

## Deploy

1. Push to `main` — Vercel auto-deploys the frontend **and** API.
2. Open https://oosc-civicai-project.vercel.app
3. Hard refresh (**Ctrl+Shift+R**)
4. Click **Get Help** — Network tab should show requests to **`/api/v1/cases`** on the same Vercel domain (no preflight to Render).

## Optional: local FastAPI backend

```bash
cd backend && uvicorn app.main:app --reload --port 8000
cd frontend && npm run dev
```

Set `NEXT_PUBLIC_API_URL=http://localhost:8000` in `frontend/.env.local`.

## Notes

- Case data on Vercel is stored in server memory (resets on cold starts). Past cases in the browser sidebar may not reload after long idle periods — start a new case if needed.
- Remove `NEXT_PUBLIC_API_URL=https://civicai-api.onrender.com` from Vercel env if set — it is no longer needed.
