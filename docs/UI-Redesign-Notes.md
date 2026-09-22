# UI Redesign Notes — Enterprise Dashboard Pass

Follow-up visual pass over the Sprint 1 frontend scaffold (`frontend/`), tightening the
Workday-inspired design system already defined in the master documentation and applying
it consistently across the Overview, Job Requisitions, and Candidate Database screens.

## What changed

### Design tokens (`tailwind.config.ts`, `globals.css`)
- Added tint variants: `navy-light`, `accent-orange-dark`, `brand-blue`, `brand-blue-light`.
- Added `pill` border radius and `card` / `card-hover` / `orange` box-shadow presets so
  every card, badge, and hover state pulls from the same shadow scale instead of one-off
  values per component.
- Switched the base font to Plus Jakarta Sans (`--font-jakarta`), loaded via
  `next/font/google` in `layout.tsx`.
- Added `.bg-grain`, a low-opacity SVG noise texture for flat panels, plus
  `scroll-behavior: smooth` and `tabular-nums` on body text for aligned numeric columns.

### Sidebar (`components/Sidebar.tsx`)
- Renders the `JaknotMark` + `JaknotWordmark` lockup at the top instead of plain text.
- Active route detection via `usePathname()` — the active link gets an orange left rail,
  tinted background, and an orange icon instead of a flat highlight.
- Nav items now carry inline SVG icons (dashboard, requisitions, candidates).
- "Coming soon" section renamed to "Roadmap" with a lock icon per locked item.
- Added a signed-in user card (avatar initials + name + role) pinned to the sidebar base.

### StatCard (`components/StatCard.tsx`)
- New `icon` prop (required) and optional `trend` prop (`{ value, direction }`) rendering
  an up/down/flat pill next to the stat value.
- Hover state lifts the card and swaps the icon tile from `cloud-blue` to `navy`.

### Layout (`app/layout.tsx`)
- Introduces the `Topbar` component above page content.
- Adds a keyboard-accessible "Skip to content" link for screen-reader / keyboard users.

### Pages (`app/page.tsx`, `app/requisitions/page.tsx`, `app/candidates/page.tsx`)
- Updated to the new `StatCard` API (icon + trend).
- Requisitions table: restyled filter row and status pills to the shared color tokens.
- Candidates screen: restyled automated-folder tree, candidate table, and the
  "Possible Duplicate" warning badge for FR-01.

### Dependencies
- Bumped `next` from `14.2.15` to `14.2.35` (patches known 14.2.x advisories).
- Committed `frontend/package-lock.json` and `frontend/next-env.d.ts` for reproducible
  installs and editor type support.

## Scope note

This pass only touches presentation (Tailwind classes, component props, static icons) —
no API contracts, routes, or backend behavior changed.
