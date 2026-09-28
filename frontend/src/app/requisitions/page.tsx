"use client";

import { useEffect, useMemo, useState } from "react";
import { ApiError, approveRequisition, createRequisition, listRequisitions, type Requisition } from "@/lib/api";
import { dummyRequisitions } from "@/lib/dummy-data";
import { StatusBadge } from "@/components/StatusBadge";
import { SkeletonRows } from "@/components/SkeletonRows";
import { SlideOver } from "@/components/SlideOver";

const dateFormatter = new Intl.DateTimeFormat("en-US", { day: "2-digit", month: "short", year: "numeric" });
const DEPARTMENTS = ["Warehouse", "HRGA", "Marketing", "Operations"];
const STATUSES = ["Draft", "Pending Approval", "Approved", "Rejected"];

const emptyForm = {
  position_title: "",
  department_id: "Warehouse",
  quantity: "1",
  budget_range: "",
  justification: "",
};

export default function RequisitionsPage() {
  const [requisitions, setRequisitions] = useState<Requisition[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [sort, setSort] = useState<"newest" | "oldest">("newest");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [actingId, setActingId] = useState<string | null>(null);

  function load() {
    setLoading(true);
    listRequisitions()
      .then((data) => {
        setRequisitions(data.length ? data : dummyRequisitions);
        setUsingFallback(data.length === 0);
      })
      .catch(() => {
        setRequisitions(dummyRequisitions);
        setUsingFallback(true);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    let list = requisitions;
    if (statusFilter) list = list.filter((r) => r.status === statusFilter);
    if (departmentFilter) list = list.filter((r) => r.department_id === departmentFilter);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((r) => r.position_title.toLowerCase().includes(q) || r.department_id.toLowerCase().includes(q));
    }
    return [...list].sort((a, b) => {
      const diff = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      return sort === "newest" ? -diff : diff;
    });
  }, [requisitions, statusFilter, departmentFilter, query, sort]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.position_title || !form.justification || !form.budget_range) return;
    setSubmitting(true);
    setFormError(null);
    try {
      const created = await createRequisition({
        position_title: form.position_title,
        department_id: form.department_id,
        quantity: Number(form.quantity) || 1,
        justification: form.justification,
        budget_range: form.budget_range,
      });
      setRequisitions((prev) => [created, ...prev]);
      setForm(emptyForm);
      setOpen(false);
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Could not reach the server. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDecision(id: string, decision: "Approved" | "Rejected") {
    setActingId(id);
    try {
      const updated = await approveRequisition(id, decision);
      setRequisitions((prev) => prev.map((r) => (r.id === id ? updated : r)));
    } catch {
      // Fallback data has no backend id to act on — ignore silently.
    } finally {
      setActingId(null);
    }
  }

  return (
    <div>
      <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <h1 className="text-2xl font-bold tracking-tight text-text-primary lg:text-3xl">Job Requisitions</h1>
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

      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <div className="relative flex-1 sm:min-w-[200px]">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-4-4" />
          </svg>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            type="search"
            placeholder="Search requisition..."
            className="h-10 w-full rounded-control border border-border bg-surface-alt pl-9 pr-3 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-accent/30"
          />
        </div>
        <div className="grid grid-cols-3 gap-2 sm:flex">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 rounded-control border border-border bg-surface px-3 text-sm text-text-secondary focus:border-primary focus:outline-none focus:ring-2 focus:ring-accent/30"
          >
            <option value="">All Status</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="h-10 rounded-control border border-border bg-surface px-3 text-sm text-text-secondary focus:border-primary focus:outline-none focus:ring-2 focus:ring-accent/30"
          >
            <option value="">Department</option>
            {DEPARTMENTS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as "newest" | "oldest")}
            className="h-10 rounded-control border border-border bg-surface px-3 text-sm text-text-secondary focus:border-primary focus:outline-none focus:ring-2 focus:ring-accent/30"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto rounded-card border border-border bg-surface shadow-card">
        <table className="w-full min-w-[960px] text-left">
          <thead>
            <tr className="h-11 bg-surface-alt text-[11px] font-semibold text-text-secondary">
              <th className="px-4 font-semibold">Position</th>
              <th className="px-4 font-semibold">Department</th>
              <th className="px-4 font-semibold">Qty</th>
              <th className="px-4 font-semibold">Budget Range</th>
              <th className="px-4 font-semibold">Created By</th>
              <th className="px-4 font-semibold">Status</th>
              <th className="px-4 font-semibold">Approved By</th>
              <th className="px-4 font-semibold">Created</th>
              <th className="px-4 font-semibold">Action</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {loading && <SkeletonRows columns={9} />}
            {!loading &&
              filtered.map((r) => (
                <tr key={r.id} className="h-[52px] border-t border-border transition hover:bg-surface-alt/60">
                  <td className="px-4 font-medium">{r.position_title}</td>
                  <td className="px-4 text-text-secondary">{r.department_id}</td>
                  <td className="px-4 tabular-nums">{r.quantity}</td>
                  <td className="px-4 tabular-nums">{r.budget_range ?? "—"}</td>
                  <td className="px-4 text-text-secondary">{r.created_by_name}</td>
                  <td className="px-4">
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="px-4 text-text-secondary">{r.approved_by_name ?? "—"}</td>
                  <td className="px-4 tabular-nums text-text-secondary">{dateFormatter.format(new Date(r.created_at))}</td>
                  <td className="px-4">
                    {r.status === "Pending Approval" ? (
                      <div className="flex gap-1.5">
                        <button
                          type="button"
                          disabled={actingId === r.id}
                          aria-label={`Reject ${r.position_title}`}
                          onClick={() => handleDecision(r.id, "Rejected")}
                          className="flex size-8 items-center justify-center rounded-control border border-error/30 bg-white text-error transition hover:bg-error/10 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-4">
                            <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          disabled={actingId === r.id}
                          aria-label={`Approve ${r.position_title}`}
                          onClick={() => handleDecision(r.id, "Approved")}
                          className="flex size-8 items-center justify-center rounded-control border border-success/30 bg-white text-success transition hover:bg-success/10 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-4">
                            <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-text-muted">—</span>
                    )}
                  </td>
                </tr>
              ))}
            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-14 text-center text-text-muted">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto size-8 text-text-muted/60">
                    <path d="M4 6h16M4 12h10M4 18h14" strokeLinecap="round" />
                    <circle cx="19" cy="12" r="2" />
                  </svg>
                  <p className="mt-2 text-sm">No requisitions match this filter.</p>
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
        description="Approved by the Hiring Manager assigned to this position's organization."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-text-secondary">Position</label>
            <input
              required
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
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
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
            <label className="mb-1.5 block text-xs font-semibold text-text-secondary">Budget Range</label>
            <input
              required
              value={form.budget_range}
              onChange={(e) => setForm({ ...form, budget_range: e.target.value })}
              placeholder="e.g. Rp8M-Rp10M"
              className="h-10 w-full rounded-control border border-border bg-surface-alt px-3 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-accent/30"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-text-secondary">Justification</label>
            <textarea
              required
              rows={3}
              value={form.justification}
              onChange={(e) => setForm({ ...form, justification: e.target.value })}
              placeholder="Why is this role needed?"
              className="w-full resize-none rounded-control border border-border bg-surface-alt px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-accent/30"
            />
          </div>
          <div>
            <div className="mb-1.5 text-xs font-semibold text-text-secondary">Approver</div>
            <div className="flex items-center gap-2 rounded-control border border-border px-3 py-2 text-xs">
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">1</span>
              Hiring Manager
              <span className="ml-auto text-[10px] text-text-muted">Auto-assigned</span>
            </div>
          </div>

          {formError && (
            <p role="alert" className="rounded-control bg-error/10 px-3 py-2 text-xs text-error">
              {formError}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="h-11 w-full rounded-control bg-accent text-sm font-semibold text-primary transition hover:bg-accent-hover active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Submitting…" : "Submit for Approval"}
          </button>
        </form>
      </SlideOver>
    </div>
  );
}
