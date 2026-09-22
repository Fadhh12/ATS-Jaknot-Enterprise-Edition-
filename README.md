# ATS Jaknot (Enterprise Edition)

Applicant Tracking System connecting workforce planning (MPP) to hiring. Sprint 1 scope: **FR-01** (Centralized Candidate Database & Automated Foldering) and **FR-03** (Job Requisition & Approval Workflow).

Full documentation (PRD, SRS, SDD, UI/UX, task breakdown): [docs/ATS-Jaknot-Master-Documentation.md](docs/ATS-Jaknot-Master-Documentation.md)

## Tech Stack
- **Backend:** FastAPI, SQLAlchemy, PostgreSQL, JWT auth
- **Frontend:** Next.js, TypeScript, TailwindCSS (Workday-inspired design system)

## Structure
```
backend/    FastAPI app (modules: auth, requisitions, candidates)
frontend/   Next.js dashboard
docs/       Master technical documentation
```

## Getting Started

### Backend
```bash
cd backend
python -m venv .venv && .venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --reload
```

### Frontend
```bash
cd frontend
npm install
copy .env.local.example .env.local
npm run dev
```

API runs on `http://localhost:8000`, frontend on `http://localhost:3000`.
