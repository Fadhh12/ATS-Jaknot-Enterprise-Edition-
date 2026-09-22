# UI Redesign Notes — Enterprise Dashboard Pass

Two passes over the Sprint 1 frontend (`frontend/`). The first pass tightened the
existing Workday-inspired system in place. The second pass (this update) rebuilt the
frontend from scratch to match the approved Jaknot ATS design reference pixel-for-pixel
across all three screens.

## Pass 2 — full rebuild to match the approved reference

### Design tokens (`tailwind.config.ts`)
Replaced the `navy` / `accent-orange` / `cloud-blue` token set with the final palette:

| Token | Value | Role |
|---|---|---|
| `canvas` | `#E8F1F5` | Page background |
| `surface` / `surface-alt` | `#FFFFFF` / `#F4F7F9` | Cards, inputs |
| `border` | `#D9E2E8` | 1px hairlines |
| `text-primary` / `text-secondary` / `text-muted` | `#1C2B39` / `#64748B` / `#94A3B8` | Text hierarchy |
| `primary` (+`hover`) | `#1B365D` / `#152C4C` | Sidebar, primary buttons |
| `accent` (+`hover`/`soft`) | `#FF6B35` / `#E85A25` / `#FFF0EA` | CTAs, active states |
| `success` / `warning` / `error` / `info` (+`soft`) | — | Semantic status colors |
| `locked` | `#A7B0B8` | Disabled/roadmap items |

Radii: `sm` (8px), `control` (12px), `card` (16px), `pill` (9999px).
Shadows: `card` and `raised`. Base font switched from Plus Jakarta Sans to Inter.

Every component that referenced the old tokens (`Sidebar`, `Topbar`, `StatCard`,
`StatusBadge`, `SlideOver`, `JaknotLogo`, `not-found`) was updated to the new names.

### Sidebar (`components/Sidebar.tsx`)
Rebuilt as two self-contained pieces — a mobile top bar (logo + hamburger) and a desktop
`<aside>` — sharing one `SidebarContent`:
1. Logo (`JaknotMark` + `JaknotWordmark`) at the top.
2. Profile card with a role-switcher dropdown (HR Admin / Recruiter / Hiring Manager).
3. Search input.
4. The three Sprint 1 nav buttons (Overview, Job Requisitions, Candidate Database) —
   these never scroll; only the "Future Modules" (roadmap) list below them does,
   via `flex-1 min-h-0 overflow-y-auto` on that section alone.
5. Seven locked roadmap buttons, each focusable and clickable (not `disabled`), with a
   `title` tooltip explaining they unlock after Sprint 1.

Mobile navigation is a self-contained off-canvas drawer (`useState`, no external state
library) instead of relying on a separate layout-level toggle.

### Topbar (`components/Topbar.tsx`)
Static "Jaknot ATS / Enterprise Applicant Tracking System" branding (replaces the
"Good afternoon, Nabil" greeting bar). Notification bell and account avatar are now
real dropdowns — click to open, click-outside or another dropdown to close — with
sample notification content and a profile/settings/log-out menu.

### Data (`lib/dummy-data.ts`, `lib/api.ts`)
`dummyRequisitions` and `dummyCandidates` now hold the reference scenario exactly:
Warehouse Supervisor / Recruitment Admin / Graphic Designer / Store Crew requisitions,
and six candidates (Aisyah Putri, Rizky Pratama, Dina Sari, Fajar Adi, Nadia Wulan,
Raka Kurnia) including the FR-01 "Possible Duplicate" case. `Requisition` and
`Candidate` (`lib/api.ts`) gained optional display fields (`salary_range`,
`created_by`, `applicant_type`, `stage`, `phone`, `experience`, `cv_file`,
`possible_duplicate`) — additive only, so a real backend response without them still
satisfies the type. New exports (`candidateIntakeMonths`, `candidateComposition`,
`automatedFolders`, `sprintModules`) feed the new Overview widgets.

### Pages
- **Overview** (`app/page.tsx`) — rebuilt as the full 9-card grid: Requisition Status,
  Recent Requisitions, Candidate Intake, Total Candidates (donut), Candidate Database
  preview, Approval Requests (approve/reject now fades the row via local state),
  Automated Foldering, Recent Activity, Sprint 1 Modules.
- **Job Requisitions** (`app/requisitions/page.tsx`) — table gains Salary Range /
  Created By columns; the create-requisition `SlideOver` form now matches the
  reference fields (Position, Department, Quantity, Salary Range, Justification,
  Approval Steps) with working Save Draft / Submit for Approval.
- **Candidate Database** (`app/candidates/page.tsx`) — three-column FR-01 layout:
  an Automated Folders tree that filters the table by position + stage, the
  candidate table, and a detail panel that updates on row click/keyboard select.

All three pages keep the existing fetch-then-fallback pattern
(`listRequisitions()` / `searchCandidates()` against the FastAPI backend, falling back
to the dummy dataset when the API isn't reachable) — no backend contract changed.

## Pass 1 — token tightening (superseded by pass 2's palette, kept for history)
- Added tint variants and shadow presets to the original `navy`/`accent-orange` tokens.
- Sidebar: active-route highlighting, inline icons, "Roadmap" section, signed-in user
  card.
- `StatCard`: icon slot + trend pill.
- Bumped `next` to 14.2.35; committed `package-lock.json` / `next-env.d.ts`.
