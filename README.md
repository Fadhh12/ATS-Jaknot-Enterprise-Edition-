# ATS Jaknot (Enterprise Edition)

Applicant Tracking System connecting workforce planning (MPP) to hiring. Delivered modules: **FR-01** (Centralized Candidate Database & Automated Foldering), **FR-02** (Workforce Planning & Vacancy Reconciliation), **FR-03** (Job Requisition & Approval Workflow) and **FR-05** (Screening & Scorecard).

Full documentation (PRD, SRS, SDD, UI/UX, task breakdown): [docs/ATS-Jaknot-Master-Documentation.md](docs/ATS-Jaknot-Master-Documentation.md)

Frontend visual redesign notes: [docs/UI-Redesign-Notes.md](docs/UI-Redesign-Notes.md)

## Tech Stack
- **Backend:** FastAPI, SQLAlchemy, PostgreSQL, JWT auth
- **Frontend:** Next.js, TypeScript, TailwindCSS (Workday-inspired design system)

## Structure
```
backend/    FastAPI app (modules: auth, requisitions, candidates, workforce, screening)
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
