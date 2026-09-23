"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { StatusBadge } from "@/components/StatusBadge";
import { approveRequisition, listRequisitions, searchCandidates, type Candidate, type Requisition } from "@/lib/api";
import { groupByPositionStage } from "@/lib/folders";
import {
  candidateIntakeMonths,
  dummyCandidates,
  dummyRequisitions,
  recentActivity,
  sprintModules,
} from "@/lib/dummy-data";

const dateFormatter = new Intl.DateTimeFormat("en-US", { day: "2-digit", month: "short", year: "numeric" });

function initialsOf(text: string) {
  return text
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

const toneDot: Record<string, string> = {
  accent: "bg-accent",
  success: "bg-success",
  info: "bg-info",
  primary: "bg-primary",
};

const compositionDot = ["bg-primary", "bg-accent", "bg-success"];
const donutStroke = ["#1B365D", "#FF6B35", "#16A34A"];

export default function OverviewPage() {
  const [requisitions, setRequisitions] = useState<Requisition[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);

  useEffect(() => {
    Promise.allSettled([listRequisitions(), searchCandidates()])
      .then(([reqResult, candResult]) => {
        setRequisitions(reqResult.status === "fulfilled" && reqResult.value.length ? reqResult.value : dummyRequisitions);
        setCandidates(candResult.status === "fulfilled" && candResult.value.length ? candResult.value : dummyCandidates);
      })
      .finally(() => setLoading(false));
  }, []);

  const maxIntake = Math.max(...candidateIntakeMonths.map((m) => m.value));
  const latestIntake = candidateIntakeMonths[candidateIntakeMonths.length - 1];

  const statusCounts = useMemo(() => {
    const counts = { Approved: 0, "Pending Approval": 0, Draft: 0 };
    for (const r of requisitions) {
      if (r.status in counts) counts[r.status as keyof typeof counts]++;
    }
    return counts;
  }, [requisitions]);
  const totalOpen = requisitions.length;

  const pendingApprovals = useMemo(() => requisitions.filter((r) => r.status === "Pending Approval").slice(0, 4), [requisitions]);

  const composition = useMemo(() => {
    const total = candidates.length || 1;
    const fullTime = candidates.filter((c) => c.applicant_type === "Full-time").length;
    const daily = candidates.filter((c) => c.applicant_type === "Daily Worker").length;
    const other = candidates.length - fullTime - daily;
    return [
      { label: "Full-time", pct: Math.round((fullTime / total) * 100) },
      { label: "Daily Worker", pct: Math.round((daily / total) * 100) },
      { label: "Other", pct: Math.round((other / total) * 100) },
    ];
  }, [candidates]);

  const donutSegments = useMemo(() => {
    const circumference = 2 * Math.PI * 56;
    let offset = 0;
    return composition.map((c, i) => {
      const length = (c.pct / 100) * circumference;
      const seg = { dasharray: `${length} ${circumference - length}`, dashoffset: -offset, stroke: donutStroke[i] };
      offset += length;
      return seg;
    });
  }, [composition]);

  const automatedFolders = useMemo(() => groupByPositionStage(candidates).slice(0, 2), [candidates]);

  async function handleDecision(id: string, decision: "Approved" | "Rejected") {
    setActingId(id);
    try {
      const updated = await approveRequisition(id, decision);
      setRequisitions((prev) => prev.map((r) => (r.id === id ? updated : r)));
    } catch {
      // Fallback/demo rows have no backend id to act on — ignore silently.
    } finally {
      setActingId(null);
    }
  }

  return (
    <div>
      <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <h1 className="text-2xl font-bold tracking-tight text-text-primary lg:text-3xl">Overview</h1>
        <Link
          href="/requisitions"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-control bg-accent px-5 text-sm font-semibold text-primary transition hover:bg-accent-hover active:scale-[0.98]"
        >
          Create Requisition
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-4">
            <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* Requisition Status */}
        <article className="rounded-card border border-border bg-surface p-5 shadow-card transition hover:-translate-y-0.5 hover:shadow-raised lg:col-span-4">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-sm font-semibold">Requisition Status</h2>
              <p className="mt-1 text-xs text-text-secondary">Current vacancy workflow</p>
            </div>
            <Link
              href="/requisitions"
              aria-label="Open requisition status in Job Requisitions"
              className="flex size-9 items-center justify-center rounded-control bg-accent-soft text-accent transition hover:bg-accent/20"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-4">
                <path d="m7 17 10-10M8 7h9v9" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>

          <div className="mt-5 flex items-end gap-2">
            <span className="text-3xl font-bold tabular-nums">{totalOpen}</span>
            <span className="mb-1 text-xs text-text-secondary">Open Requisitions</span>
          </div>

          <div className="mt-5 space-y-3">
            {[
              { label: "Approved", value: statusCounts.Approved, bar: "bg-primary" },
              { label: "Pending", value: statusCounts["Pending Approval"], bar: "bg-warning" },
              { label: "Draft", value: statusCounts.Draft, bar: "bg-text-muted" },
            ].map((row) => (
              <div key={row.label}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="text-text-secondary">{row.label}</span>
                  <span className="font-semibold tabular-nums">{row.value}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-pill bg-surface-alt">
                  <div
                    className={`h-full rounded-pill ${row.bar}`}
                    style={{ width: `${totalOpen ? (row.value / totalOpen) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </article>

        {/* Recent Requisitions */}
        <article className="rounded-card border border-border bg-surface p-5 shadow-card transition hover:-translate-y-0.5 hover:shadow-raised lg:col-span-4">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-sm font-semibold">Recent Requisitions</h2>
              <p className="mt-1 text-xs text-text-secondary">Latest job requests</p>
            </div>
            <Link
              href="/requisitions"
              aria-label="View all requisitions"
              className="flex size-9 items-center justify-center rounded-control bg-accent text-primary transition hover:bg-accent-hover"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-4">
                <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>

          <div className="mt-4 space-y-3">
            {requisitions.slice(0, 4).map((r) => (
              <div key={r.id} className="flex items-center gap-3">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                  {initialsOf(r.position_title)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold">{r.position_title}</div>
                  <div className="text-[11px] text-text-secondary">
                    {r.department_id} · Qty {r.quantity}
                  </div>
                </div>
                <StatusBadge status={r.status} />
              </div>
            ))}
            {!loading && requisitions.length === 0 && <p className="text-xs text-text-muted">No requisitions yet.</p>}
          </div>
        </article>

        {/* Candidate Intake */}
        <article className="rounded-card border border-border bg-surface p-5 shadow-card transition hover:-translate-y-0.5 hover:shadow-raised lg:col-span-4">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-sm font-semibold">Candidate Intake</h2>
              <p className="mt-1 text-xs text-text-secondary">New candidates this month</p>
            </div>
            <select className="h-9 rounded-control border border-border bg-surface-alt px-2 text-xs text-text-secondary focus:border-primary focus:outline-none focus:ring-2 focus:ring-accent/30">
              <option>Monthly</option>
            </select>
          </div>

          <div className="mt-4">
            <div className="text-3xl font-bold tabular-nums">{latestIntake.value}</div>
            <div className="mt-1 text-xs text-success">+18% vs. previous month</div>
          </div>

          <div className="mt-5 flex h-24 items-end gap-3 border-b border-border px-1">
            {candidateIntakeMonths.map((m) => {
              const isLatest = m.label === latestIntake.label;
              return (
                <div key={m.label} className="flex flex-1 flex-col items-center gap-1">
                  <div
                    className={`w-full rounded-t-sm ${isLatest ? "bg-accent" : "bg-primary/30"}`}
                    style={{ height: `${(m.value / maxIntake) * 86}px` }}
                  />
                  <span className={`text-[10px] ${isLatest ? "font-semibold text-text-primary" : "text-text-muted"}`}>{m.label}</span>
                </div>
              );
            })}
          </div>
        </article>

        {/* Total Candidates */}
        <article className="rounded-card border border-border bg-surface p-5 shadow-card transition hover:-translate-y-0.5 hover:shadow-raised lg:col-span-4">
          <div>
            <h2 className="text-sm font-semibold">Total Candidates</h2>
            <p className="mt-1 text-xs text-text-secondary">Centralized candidate database</p>
          </div>

          <div className="relative mx-auto mt-5 size-44">
            <svg viewBox="0 0 160 160" className="size-full -rotate-90" aria-label="Candidate composition chart" role="img">
              <circle cx="80" cy="80" r="56" fill="none" stroke="#F4F7F9" strokeWidth="18" />
              {donutSegments.map((seg, i) => (
                <circle
                  key={i}
                  cx="80"
                  cy="80"
                  r="56"
                  fill="none"
                  stroke={seg.stroke}
                  strokeWidth="18"
                  strokeLinecap="round"
                  strokeDasharray={seg.dasharray}
                  strokeDashoffset={seg.dashoffset}
                />
              ))}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold tabular-nums">{candidates.length}</span>
              <span className="text-xs text-text-secondary">Candidates</span>
            </div>
          </div>

          <div className="mt-4 space-y-2 border-t border-border pt-4 text-xs">
            {composition.map((c, i) => (
              <div key={c.label} className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className={`size-2 rounded-full ${compositionDot[i]}`} />
                  {c.label}
                </span>
                <span className="font-semibold tabular-nums">{c.pct}%</span>
              </div>
            ))}
          </div>
        </article>

        {/* Candidate Database */}
        <article className="rounded-card border border-border bg-surface p-5 shadow-card transition hover:-translate-y-0.5 hover:shadow-raised lg:col-span-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-sm font-semibold">Candidate Database</h2>
              <p className="mt-1 text-xs text-text-secondary">Centralized candidate records</p>
            </div>
            <Link href="/candidates" className="text-xs font-semibold text-primary underline-offset-2 hover:underline">
              View all
            </Link>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[540px] text-left">
              <thead>
                <tr className="h-11 bg-surface-alt text-[11px] font-semibold text-text-secondary">
                  <th className="px-3 font-semibold">Candidate</th>
                  <th className="px-3 font-semibold">Type</th>
                  <th className="px-3 font-semibold">Applied</th>
                  <th className="px-3 font-semibold">Stage</th>
                </tr>
              </thead>
              <tbody className="text-xs">
                {candidates.slice(0, 5).map((c) => (
                  <tr key={c.id} className="h-[52px] border-t border-border">
                    <td className="px-3">
                      <div className="flex items-center gap-2">
                        <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary">
                          {initialsOf(c.full_name)}
                        </div>
                        <div>
                          <div className="font-medium">{c.full_name}</div>
                          <div className="text-[10px] text-text-muted">{c.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3">{c.applicant_type}</td>
                    <td className="px-3 tabular-nums">{dateFormatter.format(new Date(c.applied_at))}</td>
                    <td className="px-3">
                      <StatusBadge status={c.stage ?? ""} />
                    </td>
                  </tr>
                ))}
                {!loading && candidates.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-3 py-6 text-center text-text-muted">
                      No candidates yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </article>

        {/* Approval Requests */}
        <article className="rounded-card border border-border bg-surface p-5 shadow-card transition hover:-translate-y-0.5 hover:shadow-raised lg:col-span-3">
          <div>
            <h2 className="text-sm font-semibold">Approval Requests</h2>
            <p className="mt-1 text-xs text-text-secondary">Awaiting your decision</p>
          </div>

          <div className="mt-4 space-y-3">
            {pendingApprovals.map((item) => (
              <div key={item.id} className="flex items-center gap-2 rounded-control border border-border p-2 transition">
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold leading-tight">{item.position_title}</div>
                  <div className="text-[11px] leading-tight text-text-secondary">
                    {item.department_id} · Qty {item.quantity}
                  </div>
                </div>
                <button
                  type="button"
                  disabled={actingId === item.id}
                  aria-label={`Reject ${item.position_title} requisition`}
                  onClick={() => handleDecision(item.id, "Rejected")}
                  className="flex size-10 shrink-0 items-center justify-center rounded-control border border-error/30 bg-white text-error transition hover:bg-error/10 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-4">
                    <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
                  </svg>
                </button>
                <button
                  type="button"
                  disabled={actingId === item.id}
                  aria-label={`Approve ${item.position_title} requisition`}
                  onClick={() => handleDecision(item.id, "Approved")}
                  className="flex size-10 shrink-0 items-center justify-center rounded-control border border-success/30 bg-white text-success transition hover:bg-success/10 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-4">
                    <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            ))}
            {!loading && pendingApprovals.length === 0 && <p className="text-xs text-text-muted">Nothing pending approval.</p>}
          </div>
        </article>

        {/* Automated Foldering */}
        <article className="rounded-card border border-border bg-surface p-5 shadow-card transition hover:-translate-y-0.5 hover:shadow-raised lg:col-span-4">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-sm font-semibold">Automated Foldering</h2>
              <p className="mt-1 text-xs text-text-secondary">Auto-sorted by position and stage</p>
            </div>
            <span className="rounded-pill bg-success-soft px-2.5 py-1 text-[10px] font-medium text-success">Active</span>
          </div>

          <div className="mt-4 space-y-1 text-xs">
            {automatedFolders.map((group) => (
              <div key={group.position}>
                <div className="mt-2 flex items-center gap-2 font-semibold text-text-primary first:mt-0">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-4 text-primary">
                    <path d="M3 7h6l2 2h10v10H3z" />
                  </svg>
                  {group.position}
                </div>
                {group.stages.map((s) => (
                  <div key={s.stage} className="ml-6 flex items-center gap-2 text-text-secondary">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-3.5 text-text-muted">
                      <path d="M9 6h11v11H9z" />
                    </svg>
                    {s.stage}
                  </div>
                ))}
              </div>
            ))}
            {!loading && automatedFolders.length === 0 && <p className="text-text-muted">No folders yet.</p>}
          </div>
        </article>

        {/* Recent Activity */}
        <article className="rounded-card border border-border bg-surface p-5 shadow-card transition hover:-translate-y-0.5 hover:shadow-raised lg:col-span-5">
          <h2 className="text-sm font-semibold">Recent Activity</h2>
          <ol className="mt-4 space-y-4">
            {recentActivity.map((item, i) => (
              <li key={i} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <span className={`size-2.5 rounded-full ${toneDot[item.tone]}`} />
                  {i < recentActivity.length - 1 && <span className="mt-1 w-px flex-1 bg-border" />}
                </div>
                <div className="pb-1">
                  <div className="text-xs font-semibold">{item.title}</div>
                  <div className="text-[11px] text-text-secondary">
                    {item.detail} · {item.time}
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </article>

        {/* Sprint 1 Modules */}
        <article className="rounded-card border border-border bg-surface p-5 shadow-card transition hover:-translate-y-0.5 hover:shadow-raised lg:col-span-3">
          <h2 className="text-sm font-semibold">Sprint 1 Modules</h2>
          <p className="mt-1 text-xs text-text-secondary">Active scope for this release</p>

          <div className="mt-4 space-y-2">
            {sprintModules.map((m) => (
              <div
                key={m.label}
                title={m.active ? undefined : `${m.label} — coming after Sprint 1`}
                className={`flex items-center gap-2 rounded-control px-3 py-2.5 text-xs ${
                  m.active ? "bg-accent-soft font-semibold text-accent-hover" : "bg-surface-alt text-locked opacity-60"
                }`}
              >
                {m.code && <span className="rounded-pill bg-white/60 px-1.5 py-0.5 text-[10px] font-bold">{m.code}</span>}
                {m.label}
              </div>
            ))}
          </div>
        </article>
      </div>
    </div>
  );
}
