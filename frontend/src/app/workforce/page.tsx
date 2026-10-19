"use client";

import { useEffect, useMemo, useState } from "react";
import {
  createManpowerPlan,
  deleteManpowerPlan,
  getDepartmentSummary,
  listManpowerPlans,
  updateManpowerPlan,
  type DepartmentSummary,
  type ManpowerPlan,
} from "@/lib/api";

const DEPARTMENTS = ["Warehouse", "HRGA", "Marketing", "Operations", "Finance", "IT"];

const emptyForm = {
  department_id: "Warehouse",
  department_name: "Warehouse",
  position_title: "",
  current_headcount: "0",
  target_headcount: "1",
  budget_headcount: "1",
  justification: "",
  period_year: new Date().getFullYear(),
  period_month: new Date().getMonth() + 1,
};

const months = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
  "Jul", "Agu", "Sep", "Okt", "Nov", "Des"
];

const statusConfig: Record<string, { bg: string; text: string; dot: string }> = {
  Draft: { bg: "bg-gray-100", text: "text-gray-600", dot: "bg-gray-400" },
  Active: { bg: "bg-emerald-50", text: "text-emerald-600", dot: "bg-emerald-500" },
  "On Hold": { bg: "bg-amber-50", text: "text-amber-600", dot: "bg-amber-500" },
  Closed: { bg: "bg-red-50", text: "text-red-600", dot: "bg-red-400" },
};

export default function WorkforcePage() {
  const [plans, setPlans] = useState<ManpowerPlan[]>([]);
  const [departments, setDepartments] = useState<DepartmentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);
  const [query, setQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  function load() {
    setLoading(true);
    Promise.all([listManpowerPlans(), getDepartmentSummary()])
      .then(([plansData, deptData]) => {
        if (plansData.length === 0 && deptData.length === 0) {
          // Use demo data if no backend data
          setPlans(dummyPlans);
          setDepartments(dummyDepartments);
          setUsingFallback(true);
        } else {
          setPlans(plansData);
          setDepartments(deptData);
          setUsingFallback(false);
        }
      })
      .catch(() => {
        setPlans(dummyPlans);
        setDepartments(dummyDepartments);
        setUsingFallback(true);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    let list = plans;
    if (departmentFilter) list = list.filter((p) => p.department_id === departmentFilter);
    if (statusFilter) list = list.filter((p) => p.status === statusFilter);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (p) =>
          p.position_title.toLowerCase().includes(q) ||
          p.department_name.toLowerCase().includes(q)
      );
    }
    return list;
  }, [plans, departmentFilter, statusFilter, query]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.position_title) return;
    setSubmitting(true);
    setFormError(null);
    try {
      const payload = {
        department_id: form.department_id,
        department_name: form.department_name,
        position_title: form.position_title,
        current_headcount: Number(form.current_headcount) || 0,
        target_headcount: Number(form.target_headcount) || 1,
        budget_headcount: Number(form.budget_headcount) || 1,
        justification: form.justification || undefined,
        period_year: form.period_year,
        period_month: form.period_month,
      };
      if (editingId) {
        const updated = await updateManpowerPlan(editingId, payload);
        setPlans((prev) => prev.map((p) => (p.id === editingId ? updated : p)));
        setEditingId(null);
      } else {
        const created = await createManpowerPlan(payload);
        setPlans((prev) => [created, ...prev]);
      }
      setForm(emptyForm);
      setOpen(false);
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Could not reach the server.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleEdit(plan: ManpowerPlan) {
    setEditingId(plan.id);
    setForm({
      department_id: plan.department_id,
      department_name: plan.department_name,
      position_title: plan.position_title,
      current_headcount: String(plan.current_headcount),
      target_headcount: String(plan.target_headcount),
      budget_headcount: String(plan.budget_headcount),
      justification: plan.justification || "",
      period_year: plan.period_year,
      period_month: plan.period_month,
    });
    setOpen(true);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this manpower plan?")) return;
    try {
      await deleteManpowerPlan(id);
      setPlans((prev) => prev.filter((p) => p.id !== id));
    } catch {
      // Silently ignore in demo mode
    }
  }

  return (
    <div>
      <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-5 text-primary">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-text-primary lg:text-3xl">Workforce Planning</h1>
          </div>
          <p className="mt-1 flex items-center gap-2 text-sm text-text-secondary">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-4 text-text-muted">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Manpower Planning & Vacancy Reconciliation
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditingId(null);
            setForm(emptyForm);
            setOpen(true);
          }}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-control bg-accent px-5 text-sm font-semibold text-primary transition hover:bg-accent-hover active:scale-[0.98]"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-4">
            <path d="M12 5v14M5 12h14" strokeLinecap="round" />
          </svg>
          Create Manpower Plan
        </button>
      </div>

      {usingFallback && (
        <p className="mb-4 rounded-control bg-warning-soft px-3 py-2 text-xs text-warning">
          API not reachable — showing sample data. Start the backend to see live data.
        </p>
      )}

      {/* Department Summary Cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {departments.map((dept, idx) => {
          const fillPercent = dept.total_target > 0 ? Math.min(100, Math.round((dept.total_current / dept.total_target) * 100)) : 0;
          return (
          <div
            key={dept.department_id}
            className="group relative overflow-hidden rounded-xl border border-border bg-surface p-5 shadow-sm transition-all duration-300 hover:border-primary/30 hover:shadow-md hover:-translate-y-0.5"
            style={{ animationDelay: `${idx * 100}ms` }}
          >
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary to-accent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <div className="flex items-start justify-between">
              <div>
                <div className="text-[11px] font-medium uppercase tracking-wider text-text-muted">{dept.department_name}</div>
                <div className="mt-1 flex items-baseline gap-1.5">
                  <span className="text-3xl font-bold text-primary">{dept.total_positions}</span>
                  <span className="text-xs text-text-muted">posisi</span>
                </div>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 transition-colors group-hover:bg-primary/20">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-5 text-primary">
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                </svg>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-text-muted">Current</span>
                <span className="font-semibold text-text-primary">{dept.total_current}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-text-muted">Target</span>
                <span className="font-semibold text-text-primary">{dept.total_target}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-text-muted">Budget</span>
                <span className="font-semibold text-text-primary">{dept.total_budget}</span>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-[10px] text-text-muted mb-1">
                <span>Fill Rate</span>
                <span className="font-medium">{fillPercent}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-surface-alt">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-500"
                  style={{ width: `${fillPercent}%` }}
                />
              </div>
            </div>
          </div>
          );
        })}
      </div>

      {/* Vacancy Reconciliation Summary */}
      <div className="mb-6 rounded-card border border-border bg-surface-alt p-4">
        <h2 className="text-sm font-semibold text-text-primary">Vacancy Reconciliation</h2>
        <p className="mt-1 text-xs text-text-secondary">Approved requisitions per department</p>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="text-center">
            <div className="text-lg font-bold text-primary">{plans.filter(p => p.status === "Active").length}</div>
            <div className="text-[10px] text-text-muted">Active Plans</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-accent">{plans.reduce((sum, p) => sum + p.vacancy_count, 0)}</div>
            <div className="text-[10px] text-text-muted">Open Vacancies</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-success">{plans.reduce((sum, p) => sum + p.target_headcount, 0)}</div>
            <div className="text-[10px] text-text-muted">Total Headcount Needed</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-text-secondary">{plans.reduce((sum, p) => sum + p.current_headcount, 0)}</div>
            <div className="text-[10px] text-text-muted">Current Headcount</div>
          </div>
        </div>
      </div>

      {/* Filters */}
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
            placeholder="Search position..."
            className="h-10 w-full rounded-control border border-border bg-surface-alt pl-9 pr-3 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-accent/30"
          />
        </div>
        <select
          value={departmentFilter}
          onChange={(e) => setDepartmentFilter(e.target.value)}
          className="h-10 rounded-control border border-border bg-surface px-3 text-sm text-text-secondary focus:border-primary focus:outline-none focus:ring-2 focus:ring-accent/30"
        >
          <option value="">All Departments</option>
          {DEPARTMENTS.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 rounded-control border border-border bg-surface px-3 text-sm text-text-secondary focus:border-primary focus:outline-none focus:ring-2 focus:ring-accent/30"
        >
          <option value="">All Status</option>
          <option value="Draft">Draft</option>
          <option value="Active">Active</option>
          <option value="On Hold">On Hold</option>
          <option value="Closed">Closed</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-card border border-border bg-surface shadow-card">
        <table className="w-full min-w-[960px] text-left">
          <thead>
            <tr className="h-11 bg-surface-alt text-[11px] font-semibold text-text-secondary">
              <th className="px-4 font-semibold">Position</th>
              <th className="px-4 font-semibold">Department</th>
              <th className="px-4 font-semibold">Current</th>
              <th className="px-4 font-semibold">Target</th>
              <th className="px-4 font-semibold">Budget</th>
              <th className="px-4 font-semibold">Vacancy Gap</th>
              <th className="px-4 font-semibold">Period</th>
              <th className="px-4 font-semibold">Status</th>
              <th className="px-4 font-semibold">Action</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {loading && (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-text-muted">Loading...</td>
              </tr>
            )}
            {!loading && filtered.map((plan) => {
              const vacancyGap = plan.target_headcount - plan.current_headcount;
              const gapColor = vacancyGap > 0 ? "text-warning" : vacancyGap < 0 ? "text-success" : "text-text-muted";
              return (
              <tr key={plan.id} className="h-[52px] border-t border-border transition hover:bg-surface-alt/60">
                <td className="px-4 font-medium">{plan.position_title}</td>
                <td className="px-4 text-text-secondary">{plan.department_name}</td>
                <td className="px-4 tabular-nums">{plan.current_headcount}</td>
                <td className="px-4 tabular-nums">{plan.target_headcount}</td>
                <td className="px-4 tabular-nums">{plan.budget_headcount}</td>
                <td className={`px-4 tabular-nums font-medium ${gapColor}`}>
                  {vacancyGap > 0 ? `+${vacancyGap}` : vacancyGap}
                </td>
                <td className="px-4 text-text-secondary">
                  {months[plan.period_month - 1]} {plan.period_year}
                </td>
                <td className="px-4">
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${statusColors[plan.status] || "bg-gray-100 text-gray-700"}`}>
                    {plan.status}
                  </span>
                </td>
                <td className="px-4">
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleEdit(plan)}
                      className="flex size-8 items-center justify-center rounded-control border border-border bg-white text-text-secondary transition hover:bg-surface-alt disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-4">
                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(plan.id)}
                      className="flex size-8 items-center justify-center rounded-control border border-error/30 bg-white text-error transition hover:bg-error/10 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-4">
                        <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            );
            })}
            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-14 text-center text-text-muted">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto size-8 text-text-muted/60">
                    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
                  </svg>
                  <p className="mt-2 text-sm">No manpower plans found.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-card border border-border bg-surface shadow-card">
            <div className="border-b border-border px-6 py-4">
              <h2 className="text-lg font-semibold text-text-primary">
                {editingId ? "Edit Manpower Plan" : "New Manpower Plan"}
              </h2>
              <p className="mt-1 text-xs text-text-secondary">
                Workforce Planning &amp; Vacancy Reconciliation
              </p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4 p-6">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-text-secondary">Department</label>
                <select
                  value={form.department_id}
                  onChange={(e) => setForm({ ...form, department_id: e.target.value, department_name: e.target.value })}
                  className="h-10 w-full rounded-control border border-border bg-surface-alt px-3 text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-accent/30"
                >
                  {DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-text-secondary">Position Title</label>
                <input
                  required
                  value={form.position_title}
                  onChange={(e) => setForm({ ...form, position_title: e.target.value })}
                  placeholder="e.g. Warehouse Supervisor"
                  className="h-10 w-full rounded-control border border-border bg-surface-alt px-3 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-accent/30"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-text-secondary">Current</label>
                  <input
                    type="number"
                    min={0}
                    value={form.current_headcount}
                    onChange={(e) => setForm({ ...form, current_headcount: e.target.value })}
                    className="h-10 w-full rounded-control border border-border bg-surface-alt px-3 text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-accent/30"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-text-secondary">Target</label>
                  <input
                    type="number"
                    min={0}
                    value={form.target_headcount}
                    onChange={(e) => setForm({ ...form, target_headcount: e.target.value })}
                    className="h-10 w-full rounded-control border border-border bg-surface-alt px-3 text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-accent/30"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-text-secondary">Budget</label>
                  <input
                    type="number"
                    min={0}
                    value={form.budget_headcount}
                    onChange={(e) => setForm({ ...form, budget_headcount: e.target.value })}
                    className="h-10 w-full rounded-control border border-border bg-surface-alt px-3 text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-accent/30"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-text-secondary">Year</label>
                  <select
                    value={form.period_year}
                    onChange={(e) => setForm({ ...form, period_year: Number(e.target.value) })}
                    className="h-10 w-full rounded-control border border-border bg-surface-alt px-3 text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-accent/30"
                  >
                    {[2025, 2026, 2027].map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-text-secondary">Month</label>
                  <select
                    value={form.period_month}
                    onChange={(e) => setForm({ ...form, period_month: Number(e.target.value) })}
                    className="h-10 w-full rounded-control border border-border bg-surface-alt px-3 text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-accent/30"
                  >
                    {months.map((m, i) => (
                      <option key={i + 1} value={i + 1}>{m}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-text-secondary">Justification (Optional)</label>
                <textarea
                  rows={2}
                  value={form.justification}
                  onChange={(e) => setForm({ ...form, justification: e.target.value })}
                  placeholder="Why is this headcount needed?"
                  className="w-full resize-none rounded-control border border-border bg-surface-alt px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-accent/30"
                />
              </div>
              {formError && (
                <p role="alert" className="rounded-control bg-error/10 px-3 py-2 text-xs text-error">
                  {formError}
                </p>
              )}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => { setOpen(false); setEditingId(null); }}
                  className="h-10 flex-1 rounded-control border border-border bg-surface-alt text-sm font-semibold text-text-secondary transition hover:bg-border"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="h-10 flex-1 rounded-control bg-accent text-sm font-semibold text-primary transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? "Saving..." : editingId ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Demo data for when backend is not available
const dummyPlans: ManpowerPlan[] = [
  {
    id: "demo-1",
    department_id: "Warehouse",
    department_name: "Warehouse",
    position_title: "Warehouse Supervisor",
    current_headcount: 2,
    target_headcount: 4,
    budget_headcount: 3,
    justification: "Increase warehouse capacity for new store opening",
    period_year: 2026,
    period_month: 10,
    status: "Active",
    created_by: "demo-user",
    created_at: "2026-10-01T00:00:00Z",
    vacancy_count: 2,
  },
  {
    id: "demo-2",
    department_id: "HRGA",
    department_name: "HRGA",
    position_title: "Recruitment Admin",
    current_headcount: 1,
    target_headcount: 2,
    budget_headcount: 2,
    justification: "Support growing hiring volume for warehouse roles",
    period_year: 2026,
    period_month: 11,
    status: "Draft",
    created_by: "demo-user",
    created_at: "2026-10-05T00:00:00Z",
    vacancy_count: 1,
  },
  {
    id: "demo-3",
    department_id: "Marketing",
    department_name: "Marketing",
    position_title: "Graphic Designer",
    current_headcount: 1,
    target_headcount: 2,
    budget_headcount: 1,
    justification: "Q4 campaign backlog",
    period_year: 2026,
    period_month: 12,
    status: "Active",
    created_by: "demo-user",
    created_at: "2026-09-28T00:00:00Z",
    vacancy_count: 1,
  },
  {
    id: "demo-4",
    department_id: "Operations",
    department_name: "Operations",
    position_title: "Store Crew",
    current_headcount: 5,
    target_headcount: 8,
    budget_headcount: 8,
    justification: "New store opening next month",
    period_year: 2026,
    period_month: 10,
    status: "Active",
    created_by: "demo-user",
    created_at: "2026-09-25T00:00:00Z",
    vacancy_count: 3,
  },
];

const dummyDepartments: DepartmentSummary[] = [
  { department_id: "Warehouse", department_name: "Warehouse", total_positions: 1, total_current: 2, total_target: 4, total_budget: 3 },
  { department_id: "HRGA", department_name: "HRGA", total_positions: 1, total_current: 1, total_target: 2, total_budget: 2 },
  { department_id: "Marketing", department_name: "Marketing", total_positions: 1, total_current: 1, total_target: 2, total_budget: 1 },
  { department_id: "Operations", department_name: "Operations", total_positions: 1, total_current: 5, total_target: 8, total_budget: 8 },
];
