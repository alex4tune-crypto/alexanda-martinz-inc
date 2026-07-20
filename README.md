# Alexanda Martinz Inc.

An online **cloud-based industrial park** running a multi-service, multi-agent
autonomous corporate hierarchy with integrated real-time services, parallel
portals, and **Holas Defender Ultimate v3.0**.

## Architecture

```
alexanda-martinz-inc/
├── backend-agents/    # FastAPI + CrewAI multi-agent backend
├── frontend-portal/   # React SPA (parallel portals)
└── supabase/          # PostgreSQL schema + realtime migrations
```

| Layer | Stack |
|-------|-------|
| Frontend | React 18 + Vite + Tailwind + Supabase Realtime + Recharts |
| Backend | FastAPI + CrewAI agents + Google Gemini + APScheduler |
| Database | Supabase Postgres (users, agent_system_state, departmental_tasks, holas_security_logs, inventors_hub) |

## Agents (CrewAI hierarchy — all comms filter through the CEO)

1. **Alexanda Martinz** — CEO AI (manual / autonomous modes)
2. **COO** — translates CEO strategy into departmental work
3. **Grok** — VP Marketing
4. **Qwen** — Lead Engineer & Web Store Maintainer
5. **Holas Defender Ultimate v3.0** — Sovereign Security AI

## Quick start

### 1. Database (Supabase)
```bash
cd supabase
supabase init            # config already present
supabase migration up    # or link a cloud project: supabase db push
```

### 2. Backend
```bash
cd backend-agents
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env     # fill SUPABASE_URL, keys, GEMINI_API_KEY
uvicorn main:app --reload --port 8000
```

### 3. Frontend
```bash
cd frontend-portal
npm install
cp .env.example .env     # fill VITE_SUPABASE_URL/ANON_KEY
npm run dev              # http://localhost:5173
```

## Portals

Gate → dynamic routing by user category → Insights Hub, Marketplace,
Software Wholesale, Blog Hub, Inventors Hub, Holas Defender v3.0, CEO Console.

## Friday Report

`tools/scheduler.py` fires every **Friday 17:00 UTC**, aggregates completed
departmental tasks + Holas logs, prompts the CEO agent for an executive summary,
and emails it via Resend to `alexandamartinz4@gmail.com`.

## Notes

- Without `GEMINI_API_KEY` the agents fall back to rule-based offline responses.
- Local Supabase requires Docker; otherwise point `.env` at a cloud project.
