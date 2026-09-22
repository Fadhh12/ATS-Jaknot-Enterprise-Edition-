"use client";

import { useEffect, useState } from "react";
import { searchCandidates, type Candidate } from "@/lib/api";

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    searchCandidates(query)
      .then(setCandidates)
      .catch(() => setError("Could not reach the API. Start the backend to load live data."));
  }, [query]);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-navy">Candidate Database</h1>
          <p className="mt-1 text-sm text-slate-500">
            FR-01: Centralized candidate database with automated foldering.
          </p>
        </div>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, email, or folder..."
          className="w-72 rounded-card border border-slate-300 px-3 py-2 text-sm focus:border-navy focus:outline-none"
        />
      </div>

      <div className="mt-6 overflow-hidden rounded-card border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Folder</th>
              <th className="px-4 py-3 font-medium">Applied</th>
            </tr>
          </thead>
          <tbody>
            {candidates.map((c) => (
              <tr key={c.id} className="border-t border-slate-100">
                <td className="px-4 py-3">{c.full_name}</td>
                <td className="px-4 py-3">{c.email}</td>
                <td className="px-4 py-3 text-slate-500">{c.folder_path}</td>
                <td className="px-4 py-3 text-slate-500">{new Date(c.applied_at).toLocaleDateString()}</td>
              </tr>
            ))}
            {candidates.length === 0 && !error && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-slate-400">
                  No candidates yet.
                </td>
              </tr>
            )}
            {error && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-slate-400">
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
