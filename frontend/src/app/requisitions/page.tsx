"use client";

import { useEffect, useState } from "react";
import { listRequisitions, type Requisition } from "@/lib/api";
import { dummyRequisitions } from "@/lib/dummy-data";
import { StatusBadge } from "@/components/StatusBadge";
import { SkeletonRows } from "@/components/SkeletonRows";
import { SlideOver } from "@/components/SlideOver";

const dateFormatter = new Intl.DateTimeFormat("en-US", { day: "2-digit", month: "short", year: "numeric" });

export default function RequisitionsPage() {
  const [requisitions, setRequisitions] = useState<Requisition[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    position_title: "",
    department_id: "Warehouse",
    quantity: "1",
    salary_range: "",
    justification: "",
  });

  useEffect(() => {
    listRequisitions()
      .then((data) => setRequisitions(data.length ? data : dummyRequisitions))
      .catch(() => {
        setRequisitions(dummyRequisitions);
        setUsingFallback(true);
      })
      .finally(() => setLoading(false));
  }, []);

  function handleSubmit(e: React.FormEvent, status: "Draft" | "Pending Approval") {
    e.preventDefault();
    if (!form.position_title) return;
    setRequisitions((prev) => [
      {
        id: `req-draft-${Date.now()}`,
        position_title: form.position_title,
        department_id: form.department_id,
        quantity: Number(form.quantity) || 1,
        status,
        salary_range: form.salary_range || undefined,
        created_by: "Nabil",
        created_at: new Date().toISOString(),
      },
      ...prev,
    ]);
    setForm({ position_title: "", department_id: "Warehouse", quantity: "1", salary_range: "", justification: "" });
    setOpen(false);
  }

  return (
    <div>
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.08em] text-text-muted">Screen 2 · Job Requisitions</div>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-text-primary lg:text-[40px] lg:leading-[48px]">Job Requisitions</h1>
          <p className="mt-1 text-sm text-text-secondary">FR-03 · Job Requisition &amp; Approval Workflow</p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-control bg-accent px-5 text-sm font-semibold text-primary transition hover:bg-accent-hover active:scale-[0.98]"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-4">
            <path d="M12 5v14M5 12h14" strokeLinecap="round" />
          </svg>
          Create Requisition
        </button>
      </div>

      {usingFallback && (
        <p className="mb-4 rounded-control bg-warning-soft px-3 py-2 text-xs text-warning">
          API not reachable — showing sample data. Start the backend to see live requisitions.
        </p>
      )}

      <div className="mb-4 flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-4-4" />
          </svg>
          <input
            type="search"
            placeholder="Search requisition..."
            className="h-10 w-full rounded-control border border-border bg-surface-alt pl-9 pr-3 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-accent/30"
          />
        </div>
        <select className="h-10 rounded-control border border-border bg-surface px-3 text-sm text-text-secondary focus:border-primary focus:outline-none focus:ring-2 focus:ring-accent/30">
          <option>All Status</option>
          <option>Approved</option>
          <option>Pending Approval</option>
          <option>Draft</option>
        </select>
        <select className="h-10 rounded-control border border-border bg-surface px-3 text-sm text-text-secondary focus:border-primary focus:outline-none focus:ring-2 focus:ring-accent/30">
          <option>Department</option>
          <option>Warehouse</option>
          <option>HRGA</option>
          <option>Marketing</option>
          <option>Operations</option>
        </select>
        <select className="h-10 rounded-control border border-border bg-surface px-3 text-sm text-text-secondary focus:border-primary focus:outline-none focus:ring-2 focus:ring-accent/30">
          <option>Sort By</option>
          <option>Newest</option>
          <option>Oldest</option>
        </select>
      </div>

      <div className="overflow-x-auto rounded-card border border-border bg-surface shadow-card">
        <table className="w-full min-w-[900px] text-left">
          <thead>
            <tr className="h-11 bg-surface-alt text-[11px] font-semibold text-text-secondary">
              <th className="px-4 font-semibold">Position</th>
              <th className="px-4 font-semibold">Department</th>
              <th className="px-4 font-semibold">Qty</th>
              <th className="px-4 font-semibold">Salary Range</th>
              <th className="px-4 font-semibold">Created By</th>
              <th className="px-4 font-semibold">Status</th>
              <th className="px-4 font-semibold">Created</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {loading && <SkeletonRows columns={7} />}
            {!loading &&
              requisitions.map((r) => (
                <tr key={r.id} className="h-[52px] border-t border-border transition hover:bg-surface-alt/60">
                  <td className="px-4 font-medium">{r.position_title}</td>
                  <td className="px-4 text-text-secondary">{r.department_id}</td>
                  <td className="px-4 tabular-nums">{r.quantity}</td>
                  <td className="px-4 tabular-nums">{r.salary_range ?? "—"}</td>
                  <td className="px-4 text-text-secondary">{r.created_by ?? "—"}</td>
                  <td className="px-4">
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="px-4 tabular-nums text-text-secondary">{dateFormatter.format(new Date(r.created_at))}</td>
                </tr>
              ))}
            {!loading && requisitions.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-text-muted">
                  No requisitions yet. Create the first one to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <SlideOver
        open={open}
        onClose={() => setOpen(false)}
        title="New Requisition"
        description="Routes through Department Head → HR Manager approval."
      >
        <form className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-text-secondary">Position</label>
            <input
              value={form.position_title}
              onChange={(e) => setForm({ ...form, position_title: e.target.value })}
              placeholder="e.g. Warehouse Supervisor"
              className="h-10 w-full rounded-control border border-border bg-surface-alt px-3 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-accent/30"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-text-secondary">Department</label>
            <select
              value={form.department_id}
              onChange={(e) => setForm({ ...form, department_id: e.target.value })}
              className="h-10 w-full rounded-control border border-border bg-surface-alt px-3 text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-accent/30"
            >
              <option>Warehouse</option>
              <option>HRGA</option>
              <option>Marketing</option>
              <option>Operations</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-text-secondary">Quantity</label>
            <input
              type="number"
              min={1}
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              className="h-10 w-full rounded-control border border-border bg-surface-alt px-3 text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-accent/30"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-text-secondary">Salary Range</label>
            <input
              value={form.salary_range}
              onChange={(e) => setForm({ ...form, salary_range: e.target.value })}
              placeholder="e.g. Rp8M–Rp10M"
              className="h-10 w-full rounded-control border border-border bg-surface-alt px-3 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-accent/30"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-text-secondary">Justification</label>
            <textarea
              rows={3}
              value={form.justification}
              onChange={(e) => setForm({ ...form, justification: e.target.value })}
              placeholder="Why is this role needed?"
              className="w-full resize-none rounded-control border border-border bg-surface-alt px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-accent/30"
            />
          </div>
          <div>
            <div className="mb-1.5 text-xs font-semibold text-text-secondary">Approval Steps</div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 rounded-control border border-border px-3 py-2 text-xs">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">1</span>
                Department Head
              </div>
              <div className="flex items-center gap-2 rounded-control border border-border px-3 py-2 text-xs">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">2</span>
                HR Manager
              </div>
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={(e) => handleSubmit(e, "Draft")}
              className="h-11 flex-1 rounded-control border border-border bg-surface text-sm font-semibold text-text-primary transition hover:bg-surface-alt active:scale-[0.98]"
            >
              Save Draft
            </button>
            <button
              type="button"
              onClick={(e) => handleSubmit(e, "Pending Approval")}
              className="h-11 flex-1 rounded-control bg-accent text-sm font-semibold text-primary transition hover:bg-accent-hover active:scale-[0.98]"
            >
              Submit for Approval
            </button>
          </div>
        </form>
      </SlideOver>
    </div>
  );
}
