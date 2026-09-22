"use client";

import { useEffect, useState } from "react";
import { listRequisitions, type Requisition } from "@/lib/api";
import { dummyRequisitions } from "@/lib/dummy-data";
import { StatusBadge } from "@/components/StatusBadge";
import { SkeletonRows } from "@/components/SkeletonRows";
import { SlideOver } from "@/components/SlideOver";

const dateFormatter = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });

export default function RequisitionsPage() {
  const [requisitions, setRequisitions] = useState<Requisition[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ position_title: "", department_id: "", quantity: "1", justification: "" });

  useEffect(() => {
    listRequisitions()
      .then((data) => setRequisitions(data.length ? data : dummyRequisitions))
      .catch(() => {
        setRequisitions(dummyRequisitions);
        setUsingFallback(true);
      })
      .finally(() => setLoading(false));
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.position_title || !form.department_id) return;
    setRequisitions((prev) => [
      {
        id: `req-draft-${Date.now()}`,
        position_title: form.position_title,
        department_id: form.department_id,
        quantity: Number(form.quantity) || 1,
        status: "Draft",
        created_at: new Date().toISOString(),
      },
      ...prev,
    ]);
    setForm({ position_title: "", department_id: "", quantity: "1", justification: "" });
    setOpen(false);
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[26px] font-bold tracking-tight text-navy">Job Requisitions</h1>
          <p className="mt-1 text-sm text-slate-500">FR-03 — requisition & multi-level approval workflow.</p>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="rounded-card bg-accent-orange px-4 py-2.5 text-sm font-semibold text-white shadow-orange transition-all duration-150 hover:bg-accent-orange-dark hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]"
        >
          + Create Requisition
        </button>
      </div>

      {usingFallback && (
        <p className="mt-4 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-700">
          API not reachable — showing sample data. Start the backend to see live requisitions.
        </p>
      )}

      <div className="mt-5 overflow-hidden rounded-card border border-slate-200/70 bg-white shadow-card">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50/80 text-[12px] uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Position</th>
              <th className="px-4 py-3 font-medium">Department</th>
              <th className="px-4 py-3 font-medium">Qty</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Created</th>
            </tr>
          </thead>
          <tbody>
            {loading && <SkeletonRows columns={5} />}
            {!loading &&
              requisitions.map((r) => (
                <tr key={r.id} className="border-t border-slate-100 transition-colors hover:bg-cloud-blue/40">
                  <td className="px-4 py-3.5 font-medium text-slate-800">{r.position_title}</td>
                  <td className="px-4 py-3.5 text-slate-600">{r.department_id}</td>
                  <td className="px-4 py-3.5 text-slate-600">{r.quantity}</td>
                  <td className="px-4 py-3.5">
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="px-4 py-3.5 text-slate-500">{dateFormatter.format(new Date(r.created_at))}</td>
                </tr>
              ))}
            {!loading && requisitions.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-slate-400">
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
        title="Create requisition"
        description="Routes through hiring manager → HR manager → management approval."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-600">Position title</label>
            <input
              required
              value={form.position_title}
              onChange={(e) => setForm({ ...form, position_title: e.target.value })}
              placeholder="e.g. Warehouse Staff (Daily Worker)"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-navy focus:outline-none focus:ring-2 focus:ring-navy/10"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-600">Department</label>
            <input
              required
              value={form.department_id}
              onChange={(e) => setForm({ ...form, department_id: e.target.value })}
              placeholder="e.g. Warehouse Operations"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-navy focus:outline-none focus:ring-2 focus:ring-navy/10"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-600">Quantity</label>
            <input
              type="number"
              min={1}
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-navy focus:outline-none focus:ring-2 focus:ring-navy/10"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-600">Justification</label>
            <textarea
              rows={3}
              value={form.justification}
              onChange={(e) => setForm({ ...form, justification: e.target.value })}
              placeholder="Why is this headcount needed?"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-navy focus:outline-none focus:ring-2 focus:ring-navy/10"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-md px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md bg-navy px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-navy-dark active:scale-[0.98]"
            >
              Save as draft
            </button>
          </div>
        </form>
      </SlideOver>
    </div>
  );
}
