# CivicAI

**CivicAI** is an AI civic empowerment platform that helps Indian citizens understand rights, navigate government processes, and take action — grounded in official sources.

## Features (Agents)

| Agent | What it does |
|-------|----------------|
| **RTI Drafting** | Turns plain-language questions into formatted RTI applications |
| **Rights Navigator** | Explains tenant, consumer, and workplace dispute options |
| **Scheme Eligibility Reader** | Answers government scheme eligibility in plain language |
| **Conversational Form-Filler** | Interviews you and pre-fills official forms |
| **Bureaucracy Translator** | Explains government/legal jargon simply |
| **Municipal Grievance** | Guides unresolved civic complaints with action plans |

Every response follows: **retrieve → verify → reason → cite → act**.

---

## Tech stack

- **Frontend:** Next.js 15, React, TypeScript, Tailwind CSS
- **Backend:** FastAPI, SQLAlchemy, LangGraph
- **AI:** Ollama (optional), Tavily search, Pinecone (optional), curated knowledge base
- **Database:** SQLite (local) / PostgreSQL (production)

---

## Prerequisites

- **Python 3.12+** (not 3.14)
- **Node.js 20+**
- (Optional) [Ollama](https://ollama.com) + `qwen2.5:7b`
- (Optional) [Tavily](https://tavily.com) and [Pinecone](https://pinecone.io) API keys

---

## Local development

### 1. Clone and configure

```powershell
cd C:\Users\laksh\OneDrive\Desktop\OOSC
```

**Backend** — copy env and add keys:

```powershell
cd backend
copy .env.example .env
# Edit .env — add TAVILY_API_KEY, PINECONE_API_KEY (optional)
py -3.12 -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

**Frontend:**

```powershell
cd ..\frontend
copy .env.example .env.local
npm install
```

### 2. Start servers (two terminals)

**Option A — helper scripts:**

```powershell
# Terminal 1
.\scripts\start-backend.ps1

# Terminal 2
.\scripts\start-frontend.ps1
```

**Option B — manual:**

```powershell
# Terminal 1 — Backend
cd backend
.\.venv\Scripts\Activate.ps1
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000

# Terminal 2 — Frontend
cd frontend
npm run dev
```

### 3. Open the app

- **Website:** http://localhost:3000
- **API docs:** http://localhost:8000/docs
- **Health:** http://localhost:8000/api/v1/health

### 4. Run tests

```powershell
cd backend
.\.venv\Scripts\Activate.ps1
python -m pytest -q
```

Expected: **17 passed** (workflows, chat history, past cases).

Sample queries: see [SAMPLE_TESTCASES.md](./SAMPLE_TESTCASES.md).

---

## My past cases

On the home screen, **My past cases** lists cases you opened in this browser (stored in `localStorage`). Click any row to reopen the full conversation and drafts.

- Case IDs are saved locally under `civicai_case_history` (max 30).
- The API loads summaries via `GET /api/v1/cases?ids=...` — only IDs you send are returned.
- Use **Start new case** in the workspace to return home without deleting history.

---

## Viewing the database

All case data is stored in the backend database.

### SQLite (default local setup)

After starting the backend once, the file is created at:

```
backend/civic_ai.db
```

**Option 1 — DB Browser for SQLite (recommended GUI)**

1. Install [DB Browser for SQLite](https://sqlitebrowser.org/)
2. Open `backend/civic_ai.db`
3. Browse tables: `cases`, `messages`, `generated_documents`, `users`, `feedback`

**Option 2 — SQLite CLI**

```powershell
cd backend
sqlite3 civic_ai.db
.tables
SELECT id, domain, status, initial_query, created_at FROM cases ORDER BY updated_at DESC LIMIT 10;
SELECT role, content, created_at FROM messages WHERE case_id = 'YOUR-CASE-UUID';
.quit
```

**Option 3 — API (no extra tools)**

- Case detail: `GET http://localhost:8000/api/v1/cases/{case_id}`
- Messages only: `GET http://localhost:8000/api/v1/cases/{case_id}/messages`
- Interactive docs: http://localhost:8000/docs

**Option 4 — Docker / PostgreSQL**

If `DATABASE_URL` points to Postgres (see `docker-compose.yml`), connect with pgAdmin, DBeaver, or `psql` using the same URL.

---

## Production deployment

### Environment variables

**Backend (`backend/.env`):**

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL URL in production |
| `CORS_ORIGINS` | Yes | Your frontend URL(s), comma-separated |
| `TAVILY_API_KEY` | Recommended | Live official web search |
| `PINECONE_API_KEY` | Optional | Vector search |
| `OLLAMA_BASE_URL` | Optional | Local/cloud LLM endpoint |
| `ENVIRONMENT` | Yes | Set to `production` |

**Frontend (`frontend/.env.local` or build args):**

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Public backend URL (e.g. `https://api.yourdomain.com`) |

### Docker Compose

```powershell
# Set keys in backend/.env or shell environment
$env:TAVILY_API_KEY="your_key"
$env:PINECONE_API_KEY="your_key"
docker compose up --build -d
```

Services:
- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- Postgres: localhost:5432

### Build frontend for production

```powershell
cd frontend
npm run build
npm run start
```

### Build check (CI)

```powershell
cd backend && python -m pytest -q
cd ../frontend && npm run build
```

---

## API overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/health` | Service health |
| POST | `/api/v1/cases` | Start a new case |
| GET | `/api/v1/cases?ids=id1,id2` | List summaries for past cases (browser history) |
| GET | `/api/v1/cases/{id}` | Get case + chat history |
| GET | `/api/v1/cases/{id}/messages` | Chat message history |
| POST | `/api/v1/chat/{id}/message` | Send follow-up message |
| POST | `/api/v1/drafts/rti` | Generate RTI draft |
| POST | `/api/v1/drafts/grievance` | Generate complaint draft |
| POST | `/api/v1/drafts/form` | Generate pre-filled form |

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `WinError 10013` on port 8000 | Port in use — run `netstat -ano \| findstr :8000` then `Stop-Process -Id PID -Force` |
| `Activate.ps1` not found | Use `.\Activate.ps1` (with `.\`) in PowerShell |
| `pydantic-core` build fails | Use Python **3.12**, not 3.14 |
| Frontend can't reach API | Check `NEXT_PUBLIC_API_URL` matches backend URL |
| Chat history empty | Ensure backend is running; refresh after messages send |
| Ollama offline | App uses fallback + curated knowledge automatically |

---

## Project structure

```
OOSC/
├── backend/          # FastAPI + LangGraph + agents
│   ├── app/
│   ├── tests/
│   └── requirements.txt
├── frontend/         # Next.js citizen UI
│   └── src/
├── scripts/          # start-backend.ps1, start-frontend.ps1
├── docker-compose.yml
├── SAMPLE_TESTCASES.md
└── README.md
```

---

## Security notes

- **Never commit secrets:** `backend/.env`, `frontend/.env.local`, and `*.db` are listed in `.gitignore`
- Copy from `.env.example` / `.env.example` locally only
- Drafts use placeholders — never invent fees, addresses, or complaint numbers
- Retrieved web content is treated as data, not instructions
- CORS is restricted to configured origins

---

## License

Hackathon / educational use. Verify all legal drafts with official sources before filing.
