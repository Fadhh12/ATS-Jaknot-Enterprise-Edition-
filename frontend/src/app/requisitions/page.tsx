"use client";

import { useEffect, useState } from "react";
import { listRequisitions, type Requisition } from "@/lib/api";

const statusColor: Record<string, string> = {
  Draft: "bg-slate-100 text-slate-600",
  "Pending Approval": "bg-amber-100 text-amber-700",
  Approved: "bg-emerald-100 text-emerald-700",
  Rejected: "bg-red-100 text-red-700",
  Closed: "bg-slate-200 text-slate-500",
};

export default function RequisitionsPage() {
  const [requisitions, setRequisitions] = useState<Requisition[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listRequisitions()
      .then(setRequisitions)
      .catch(() => setError("Could not reach the API. Start the backend to load live data."));
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-navy">Job Requisitions</h1>
          <p className="mt-1 text-sm text-slate-500">FR-03: Requisition & multi-level approval workflow.</p>
        </div>
        <button className="rounded-card bg-accent-orange px-4 py-2 text-sm font-semibold text-white shadow-sm hover:brightness-95">
          + Create Requisition
        </button>
      </div>

      <div className="mt-6 overflow-hidden rounded-card border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Position</th>
              <th className="px-4 py-3 font-medium">Department</th>
              <th className="px-4 py-3 font-medium">Qty</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Created</th>
            </tr>
          </thead>
          <tbody>
            {requisitions.map((r) => (
              <tr key={r.id} className="border-t border-slate-100">
                <td className="px-4 py-3">{r.position_title}</td>
                <td className="px-4 py-3">{r.department_id}</td>
                <td className="px-4 py-3">{r.quantity}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-1 text-xs font-medium ${statusColor[r.status] ?? "bg-slate-100 text-slate-600"}`}>
                    {r.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-500">{new Date(r.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
            {requisitions.length === 0 && !error && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                  No requisitions yet.
                </td>
              </tr>
            )}
            {error && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                  {error}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
