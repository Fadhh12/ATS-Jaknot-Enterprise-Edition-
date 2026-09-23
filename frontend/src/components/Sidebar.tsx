"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { JaknotMark, JaknotWordmark } from "@/components/JaknotLogo";
import { useAuth } from "@/lib/auth";

function initialsOf(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

const navLinks: { href: string; label: string; icon: ReactNode }[] = [
  {
    href: "/",
    label: "Overview",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-5 shrink-0">
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </svg>
    ),
  },
  {
    href: "/requisitions",
    label: "Job Requisitions",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-5 shrink-0">
        <path d="M4 6h16M4 12h10M4 18h14" strokeLinecap="round" />
        <circle cx="19" cy="12" r="2" />
      </svg>
    ),
  },
  {
    href: "/candidates",
    label: "Candidate Database",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-5 shrink-0">
        <circle cx="9" cy="8" r="3" />
        <path d="M3 20a6 6 0 0 1 12 0M15 7.5a3 3 0 1 1 3 3M17 14a4 4 0 0 1 4 4" strokeLinecap="round" />
      </svg>
    ),
  },
];

const lockedLinks = [
  "Workforce Planning",
  "Sourcing",
  "Candidate Pipeline",
  "Screening & Scorecard",
  "Interview Scheduling",
  "Offers & Preboarding",
  "Reports & Analytics",
];

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="ml-auto size-3.5 shrink-0">
      <rect x="5" y="10" width="14" height="10" rx="1.5" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [roleOpen, setRoleOpen] = useState(false);
  const roleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (roleRef.current && !roleRef.current.contains(e.target as Node)) setRoleOpen(false);
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return (
    <>
      <div className="flex items-center gap-2.5 px-1">
        <JaknotMark size={36} />
        <div>
          <JaknotWordmark size="text-lg" />
          <p className="text-[11px] leading-tight text-white/50">ATS · Applicant Tracking System</p>
        </div>
      </div>

      <div ref={roleRef} className="relative mt-4">
        <button
          type="button"
          aria-haspopup="true"
          aria-expanded={roleOpen}
          onClick={() => setRoleOpen((v) => !v)}
          className="flex w-full items-center gap-3 rounded-control border border-white/10 bg-white/10 p-3 text-left transition hover:bg-white/[0.15] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-bold text-primary">
            {user ? initialsOf(user.name) : ""}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold leading-tight">{user?.name}</div>
            <div className="truncate text-xs capitalize text-white/60">{user?.role.replace("_", " ")}</div>
          </div>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-4 shrink-0 text-white/60">
            <path d="m7 10 5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {roleOpen && (
          <div className="absolute inset-x-3 top-full z-50 mt-2 overflow-hidden rounded-control border border-border bg-surface py-1 text-text-primary shadow-raised">
            <div className="truncate px-3 py-2 text-xs text-text-secondary">{user?.email}</div>
            <button
              type="button"
              onClick={logout}
              className="flex w-full items-center gap-2 border-t border-border px-3 py-2 text-left text-sm font-medium text-error transition hover:bg-error/10"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-4">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M16 17l5-5-5-5M21 12H9" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Log Out
            </button>
          </div>
        )}
      </div>

      <div className="mt-4">
        <label htmlFor="sidebarSearch" className="sr-only">
          Search
        </label>
        <div className="relative">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/50">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-4-4" />
          </svg>
          <input
            id="sidebarSearch"
            type="search"
            placeholder="Search"
            className="h-10 w-full rounded-control border border-white/10 bg-white/10 pl-9 pr-3 text-sm text-white placeholder:text-white/40 focus:border-white/30 focus:outline-none focus:ring-2 focus:ring-accent/30"
          />
        </div>
      </div>

      <nav className="mt-5 space-y-1" aria-label="Primary navigation">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onNavigate}
              aria-current={isActive ? "page" : undefined}
              className={`flex min-h-11 items-center gap-3 rounded-control px-3 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent active:scale-[0.99] ${
                isActive ? "bg-surface font-semibold text-primary" : "text-white/75 hover:bg-white/10 hover:text-white"
              }`}
            >
              {link.icon}
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-6 min-h-0 flex-1 overflow-y-auto border-t border-white/10 pt-5">
        <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-white/40">Future Modules</div>
        <div className="space-y-1">
          {lockedLinks.map((label) => (
            <button
              key={label}
              type="button"
              title={`${label} — coming after Sprint 1`}
              className="flex min-h-10 w-full items-center gap-3 rounded-control px-3 text-left text-sm text-locked opacity-45 transition hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-5 shrink-0">
                <rect x="3" y="4" width="18" height="16" rx="2" />
              </svg>
              {label}
              <LockIcon />
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

export function Sidebar() {
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile top bar */}
      <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-border bg-surface px-4 lg:hidden">
        <div className="flex items-center gap-2.5">
          <JaknotMark size={32} />
          <div>
            <JaknotWordmark size="text-base" />
            <div className="truncate text-xs capitalize text-text-secondary">{user?.role.replace("_", " ") ?? "—"}</div>
          </div>
        </div>
        <button
          type="button"
          aria-label="Open navigation"
          onClick={() => setMobileOpen(true)}
          className="size-10 rounded-control border border-border bg-surface transition hover:bg-surface-alt focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent active:scale-[0.98]"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto size-5">
            <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
          </svg>
        </button>
      </header>

      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col overflow-hidden bg-primary p-4 text-white lg:flex">
        <SidebarContent />
      </aside>

      {/* Mobile off-canvas sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] flex lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} aria-hidden />
          <aside className="relative flex h-full w-60 flex-col overflow-hidden bg-primary p-4 text-white">
            <button
              type="button"
              aria-label="Close navigation"
              onClick={() => setMobileOpen(false)}
              className="self-end size-9 rounded-control text-white/70 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto size-5">
                <path d="m6 6 12 12M18 6 6 18" strokeLinecap="round" />
              </svg>
            </button>
            <SidebarContent onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}
    </>
  );
}
