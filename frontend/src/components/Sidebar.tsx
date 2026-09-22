"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { JaknotMark, JaknotWordmark } from "@/components/JaknotLogo";

const activeLinks: { href: string; label: string; icon: ReactNode }[] = [
  {
    href: "/",
    label: "Dashboard",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" className="h-[18px] w-[18px]">
        <path d="M3 10.5 10 4l7 6.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M5 9v6.5a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    href: "/requisitions",
    label: "Job Requisitions",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" className="h-[18px] w-[18px]">
        <rect x="4" y="3.5" width="12" height="14" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
        <path d="M7 8h6M7 11h6M7 14h3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: "/candidates",
    label: "Candidate Database",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" className="h-[18px] w-[18px]">
        <circle cx="10" cy="7" r="3" stroke="currentColor" strokeWidth="1.6" />
        <path d="M4 16.5c0-2.8 2.7-5 6-5s6 2.2 6 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    ),
  },
];

const lockedLinks = [
  "Workforce Planning",
  "Sourcing",
  "Interview Scheduling",
  "Offer & Preboarding",
  "Reports & Analytics",
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-64 shrink-0 flex-col bg-navy text-white">
      <div className="flex items-center gap-2.5 px-6 py-5">
        <JaknotMark size={30} bare />
        <div>
          <JaknotWordmark size="text-base" />
          <p className="text-[11px] leading-tight text-white/45">ATS · Enterprise Edition</p>
        </div>
      </div>

      <nav className="flex-1 px-3 pt-3">
        <p className="px-3 pb-2 text-[11px] font-medium uppercase tracking-wider text-white/35">
          Sprint 1
        </p>
        <div className="space-y-0.5">
          {activeLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                className={`group relative flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors duration-150 ${
                  isActive
                    ? "bg-white/10 text-white"
                    : "text-white/70 hover:bg-white/5 hover:text-white"
                }`}
              >
                {isActive && (
                  <span className="absolute -left-3 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r bg-accent-orange" />
                )}
                <span className={isActive ? "text-accent-orange" : "text-white/50 group-hover:text-white/80"}>
                  {link.icon}
                </span>
                {link.label}
              </Link>
            );
          })}
        </div>

        <div className="mt-6 border-t border-white/10 pt-4">
          <p className="px-3 pb-2 text-[11px] font-medium uppercase tracking-wider text-white/35">
            Roadmap
          </p>
          {lockedLinks.map((label) => (
            <div
              key={label}
              className="flex cursor-not-allowed items-center justify-between rounded-md px-3 py-2 text-sm text-white/30"
            >
              <span>{label}</span>
              <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5">
                <rect x="3.5" y="7" width="9" height="6" rx="1.2" stroke="currentColor" strokeWidth="1.4" />
                <path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
            </div>
          ))}
        </div>
      </nav>

      <div className="flex items-center gap-2.5 border-t border-white/10 px-5 py-4">
        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-[9px] bg-accent-orange/90 text-xs font-semibold">
          NR
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-white">Nabil Rahman</p>
          <p className="truncate text-[11px] text-white/45">HRIS & Product Dev Intern</p>
        </div>
      </div>
    </aside>
  );
}
