"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth";

function initialsOf(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

const notifications = [
  { title: "New candidate applied", detail: "Aisyah Putri · Warehouse Supervisor", time: "10 minutes ago", tone: "bg-accent" },
  { title: "Requisition approved", detail: "Recruitment Admin · HRGA", time: "24 minutes ago", tone: "bg-success" },
  { title: "Approval needed", detail: "Warehouse Supervisor · Rizky", time: "1 hour ago", tone: "bg-warning" },
];

export function Topbar() {
  const { user, logout } = useAuth();
  const [notifOpen, setNotifOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) setAccountOpen(false);
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return (
    <header className="sticky top-0 z-40 hidden h-16 items-center justify-between border-b border-border bg-surface px-6 lg:flex">
      <div>
        <div className="text-sm font-bold text-text-primary">Jaknot ATS</div>
        <div className="text-xs text-text-secondary">Enterprise Applicant Tracking System</div>
      </div>

      <div className="flex items-center gap-3">
        <div ref={notifRef} className="relative">
          <button
            type="button"
            aria-label="Notifications"
            aria-haspopup="true"
            aria-expanded={notifOpen}
            onClick={() => setNotifOpen((v) => !v)}
            className="relative size-10 rounded-control border border-border bg-surface transition hover:bg-surface-alt focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent active:scale-[0.98]"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto size-5">
              <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-error text-[9px] font-bold text-white">
              {notifications.length}
            </span>
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-card border border-border bg-surface shadow-raised">
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <span className="text-sm font-semibold">Notifications</span>
                <span className="rounded-pill bg-accent-soft px-2 py-0.5 text-[10px] font-semibold text-accent-hover">
                  {notifications.length} new
                </span>
              </div>
              <ul className="max-h-72 overflow-y-auto">
                {notifications.map((n, i) => (
                  <li key={i} className="flex gap-3 border-b border-border px-4 py-3 last:border-b-0">
                    <span className={`mt-1 size-2 shrink-0 rounded-full ${n.tone}`} />
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-text-primary">{n.title}</div>
                      <div className="text-[11px] text-text-secondary">{n.detail}</div>
                      <div className="mt-0.5 text-[10px] text-text-muted">{n.time}</div>
                    </div>
                  </li>
                ))}
              </ul>
              <a href="/requisitions" className="block border-t border-border px-4 py-2.5 text-center text-xs font-semibold text-primary transition hover:bg-surface-alt">
                View all requisitions
              </a>
            </div>
          )}
        </div>

        <div ref={accountRef} className="relative border-l border-border pl-3">
          <button
            type="button"
            aria-haspopup="true"
            aria-expanded={accountOpen}
            onClick={() => setAccountOpen((v) => !v)}
            className="flex items-center gap-3 rounded-control transition hover:bg-surface-alt focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent active:scale-[0.98]"
          >
            <div className="flex size-9 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
              {user ? initialsOf(user.name) : ""}
            </div>
            <div className="hidden text-left xl:block">
              <div className="text-sm font-semibold">{user?.name}</div>
              <div className="text-xs capitalize text-text-secondary">{user?.role.replace("_", " ")}</div>
            </div>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="hidden size-4 shrink-0 text-text-muted xl:block">
              <path d="m7 10 5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {accountOpen && (
            <div className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-card border border-border bg-surface shadow-raised">
              <div className="flex items-center gap-3 border-b border-border px-4 py-3">
                <div className="flex size-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                  {user ? initialsOf(user.name) : ""}
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold">{user?.name}</div>
                  <div className="truncate text-xs text-text-secondary">{user?.email}</div>
                </div>
              </div>
              <div className="py-1">
                <button type="button" className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-text-primary transition hover:bg-surface-alt">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-4 text-text-muted">
                    <circle cx="12" cy="8" r="4" />
                    <path d="M4 20a8 8 0 0 1 16 0" />
                  </svg>
                  View Profile
                </button>
                <button type="button" className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-text-primary transition hover:bg-surface-alt">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-4 text-text-muted">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19 12a7 7 0 0 0-.1-1.2l2-1.6-2-3.4-2.3.9a7 7 0 0 0-2-1.2L14 3h-4l-.6 2.5a7 7 0 0 0-2 1.2l-2.3-.9-2 3.4 2 1.6a7 7 0 0 0 0 2.4l-2 1.6 2 3.4 2.3-.9a7 7 0 0 0 2 1.2L10 21h4l.6-2.5a7 7 0 0 0 2-1.2l2.3.9 2-3.4-2-1.6c.1-.4.1-.8.1-1.2Z" />
                  </svg>
                  Account Settings
                </button>
              </div>
              <div className="border-t border-border py-1">
                <button
                  type="button"
                  onClick={logout}
                  className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm font-medium text-error transition hover:bg-error/10"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-4">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M16 17l5-5-5-5M21 12H9" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Log Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
