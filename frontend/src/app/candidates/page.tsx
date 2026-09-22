"use client";

import { useEffect, useMemo, useState } from "react";
import { searchCandidates, type Candidate } from "@/lib/api";
import { dummyCandidates } from "@/lib/dummy-data";
import { Avatar } from "@/components/Avatar";
import { SkeletonRows } from "@/components/SkeletonRows";

const dateFormatter = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    searchCandidates()
      .then((data) => setCandidates(data.length ? data : dummyCandidates))
      .catch(() => {
        setCandidates(dummyCandidates);
        setUsingFallback(true);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    if (!query.trim()) return candidates;
    const q = query.toLowerCase();
    return candidates.filter(
      (c) => c.full_name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.folder_path.toLowerCase().includes(q)
    );
  }, [candidates, query]);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[26px] font-bold tracking-tight text-navy">Candidate Database</h1>
          <p className="mt-1 text-sm text-slate-500">
            FR-01 — centralized candidate database with automated foldering.
          </p>
        </div>
        <div className="relative">
          <svg viewBox="0 0 20 20" fill="none" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400">
            <circle cx="9" cy="9" r="5.5" stroke="currentColor" strokeWidth="1.6" />
            <path d="m17 17-3.5-3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, email, or folder..."
            className="w-72 rounded-card border border-slate-300 py-2 pl-9 pr-3 text-sm focus:border-navy focus:outline-none focus:ring-2 focus:ring-navy/10"
          />
        </div>
      </div>

      {usingFallback && (
        <p className="mt-4 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-700">
          API not reachable — showing sample data. Start the backend to see live candidates.
        </p>
      )}

      <div className="mt-5 overflow-hidden rounded-card border border-slate-200/70 bg-white shadow-card">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50/80 text-[12px] uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Candidate</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Folder</th>
              <th className="px-4 py-3 font-medium">Applied</th>
            </tr>
          </thead>
          <tbody>
            {loading && <SkeletonRows columns={4} />}
            {!loading &&
              filtered.map((c) => (
                <tr key={c.id} className="border-t border-slate-100 transition-colors hover:bg-cloud-blue/40">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={c.full_name} size="sm" />
                      <span className="font-medium text-slate-800">{c.full_name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-slate-600">{c.email}</td>
                  <td className="px-4 py-3.5">
                    <code className="rounded bg-slate-50 px-1.5 py-0.5 text-[12px] text-slate-500">{c.folder_path}</code>
                  </td>
                  <td className="px-4 py-3.5 text-slate-500">{dateFormatter.format(new Date(c.applied_at))}</td>
                </tr>
              ))}
            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-slate-400">
                  No candidates match &ldquo;{query}&rdquo;.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
