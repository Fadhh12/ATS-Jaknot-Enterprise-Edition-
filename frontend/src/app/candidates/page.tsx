"use client";

import { useEffect, useMemo, useState } from "react";
import { searchCandidates, type Candidate } from "@/lib/api";
import { automatedFolders, dummyCandidates } from "@/lib/dummy-data";
import { StatusBadge } from "@/components/StatusBadge";
import { SkeletonRows } from "@/components/SkeletonRows";

const dateFormatter = new Intl.DateTimeFormat("en-US", { day: "2-digit", month: "short", year: "numeric" });

function initialsOf(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);
  const [query, setQuery] = useState("");
  const [folderFilter, setFolderFilter] = useState<{ position: string; stage: string } | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    searchCandidates()
      .then((data) => setCandidates(data.length ? data : dummyCandidates))
      .catch(() => {
        setCandidates(dummyCandidates);
        setUsingFallback(true);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedId && candidates.length) setSelectedId(candidates[0].id);
  }, [candidates, selectedId]);

  const filtered = useMemo(() => {
    let list = candidates;
    if (folderFilter) {
      list = list.filter((c) => c.position_title === folderFilter.position && c.stage === folderFilter.stage);
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (c) => c.full_name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.folder_path.toLowerCase().includes(q)
      );
    }
    return list;
  }, [candidates, folderFilter, query]);

  const selected = candidates.find((c) => c.id === selectedId) ?? candidates[0];

  return (
    <div>
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.08em] text-text-muted">Screen 3 · Candidate Database</div>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-text-primary lg:text-[40px] lg:leading-[48px]">Candidate Database</h1>
          <p className="mt-1 text-sm text-text-secondary">FR-01 · Centralized Candidate Database &amp; Automated Foldering</p>
        </div>
        <button
          type="button"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-control bg-accent px-5 text-sm font-semibold text-primary transition hover:bg-accent-hover active:scale-[0.98]"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-4">
            <path d="M12 5v14M5 12h14" strokeLinecap="round" />
          </svg>
          Add Candidate
        </button>
      </div>

      {usingFallback && (
        <p className="mb-4 rounded-control bg-warning-soft px-3 py-2 text-xs text-warning">
          API not reachable — showing sample data. Start the backend to see live candidates.
        </p>
      )}

      <div className="mb-4 flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-4-4" />
          </svg>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            type="search"
            placeholder="Search candidate..."
            className="h-10 w-full rounded-control border border-border bg-surface-alt pl-9 pr-3 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-accent/30"
          />
        </div>
        <button type="button" className="h-10 shrink-0 rounded-control border border-border bg-surface px-3 text-sm font-medium transition hover:bg-surface-alt">
          Filter
        </button>
        <select className="h-10 rounded-control border border-border bg-surface px-3 text-sm text-text-secondary focus:border-primary focus:outline-none focus:ring-2 focus:ring-accent/30">
          <option>Stage</option>
          <option>Applied</option>
          <option>Screening</option>
          <option>Shortlist</option>
          <option>Hired</option>
        </select>
        <select className="h-10 rounded-control border border-border bg-surface px-3 text-sm text-text-secondary focus:border-primary focus:outline-none focus:ring-2 focus:ring-accent/30">
          <option>Applicant Type</option>
          <option>Full-time</option>
          <option>Daily Worker</option>
        </select>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* Automated Folders */}
        <article className="rounded-card border border-border bg-surface p-5 shadow-card lg:col-span-3">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-semibold">Automated Folders</h2>
              <p className="mt-1 text-xs text-text-secondary">Grouped by position &amp; stage</p>
            </div>
            {folderFilter && (
              <button
                type="button"
                onClick={() => setFolderFilter(null)}
                className="shrink-0 rounded-pill border border-border px-2 py-1 text-[10px] font-semibold text-text-secondary transition hover:bg-surface-alt"
              >
                Clear
              </button>
            )}
          </div>

          <div className="mt-4 space-y-1 text-xs">
            {automatedFolders.map((group) => (
              <div key={group.position}>
                <div className="mt-2 flex items-center gap-2 rounded-control px-2 py-2 font-semibold text-text-primary first:mt-0">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-4 text-primary">
                    <path d="M3 7h6l2 2h10v10H3z" />
                  </svg>
                  {group.position}
                </div>
                {group.stages.map((s) => {
                  const isActive = folderFilter?.position === group.position && folderFilter?.stage === s.stage;
                  return (
                    <button
                      key={s.stage}
                      type="button"
                      onClick={() => setFolderFilter(isActive ? null : { position: group.position, stage: s.stage })}
                      className={`ml-6 flex w-[calc(100%-1.5rem)] items-center justify-between rounded-control px-2 py-1.5 text-left transition ${
                        isActive ? "bg-accent-soft font-semibold text-accent-hover" : "text-text-secondary hover:bg-surface-alt"
                      }`}
                    >
                      <span>{s.stage}</span>
                      <span className={`tabular-nums ${isActive ? "" : "text-text-muted"}`}>{s.count}</span>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </article>

        {/* Candidate Table */}
        <article className="overflow-hidden rounded-card border border-border bg-surface shadow-card lg:col-span-7">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left">
              <thead>
                <tr className="h-11 bg-surface-alt text-[11px] font-semibold text-text-secondary">
                  <th className="px-4 font-semibold">Candidate</th>
                  <th className="px-4 font-semibold">Type</th>
                  <th className="px-4 font-semibold">Position</th>
                  <th className="px-4 font-semibold">Applied</th>
                  <th className="px-4 font-semibold">Stage</th>
                  <th className="px-4 font-semibold">Folder</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {loading && <SkeletonRows columns={6} />}
                {!loading &&
                  filtered.map((c) => {
                    const isSelected = c.id === selectedId;
                    return (
                      <tr
                        key={c.id}
                        tabIndex={0}
                        onClick={() => setSelectedId(c.id)}
                        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setSelectedId(c.id)}
                        className={`h-[52px] cursor-pointer border-t border-border transition ${
                          isSelected ? "bg-accent-soft/60 hover:bg-accent-soft/40" : "hover:bg-surface-alt"
                        }`}
                      >
                        <td className="px-4">
                          <div className="flex items-center gap-2">
                            <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary">
                              {initialsOf(c.full_name)}
                            </div>
                            <div className="min-w-0">
                              <div className="font-medium">{c.full_name}</div>
                              {c.possible_duplicate && (
                                <span className="inline-flex items-center whitespace-nowrap rounded-pill bg-warning-soft px-1.5 py-0.5 text-[10px] font-medium text-warning">
                                  Possible Duplicate
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 text-text-secondary">{c.applicant_type}</td>
                        <td className="px-4 text-text-secondary">{c.position_title}</td>
                        <td className="px-4 tabular-nums text-text-secondary">{dateFormatter.format(new Date(c.applied_at))}</td>
                        <td className="px-4">
                          <StatusBadge status={c.stage ?? ""} />
                        </td>
                        <td className="px-4 text-xs text-text-muted">/{c.folder_path}</td>
                      </tr>
                    );
                  })}
                {!loading && filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-text-muted">
                      No candidates match this filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </article>

        {/* Candidate Detail */}
        <article className="rounded-card border border-border bg-surface p-5 shadow-card lg:col-span-2" aria-live="polite">
          {selected ? (
            <>
              <div className="flex items-center gap-3">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                  {initialsOf(selected.full_name)}
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold">{selected.full_name}</div>
                  <div className="text-[11px] text-text-secondary">{selected.position_title}</div>
                </div>
              </div>

              <div className="mt-4 space-y-3 text-xs">
                <div>
                  <div className="font-semibold uppercase tracking-[0.05em] text-text-muted">Contact</div>
                  <div className="mt-1 text-text-secondary">{selected.email}</div>
                  <div className="text-text-secondary">{selected.phone}</div>
                </div>
                <div>
                  <div className="font-semibold uppercase tracking-[0.05em] text-text-muted">Experience</div>
                  <div className="mt-1 text-text-secondary">{selected.experience}</div>
                </div>
                <div>
                  <div className="font-semibold uppercase tracking-[0.05em] text-text-muted">CV Document</div>
                  <div className="mt-1 flex items-center gap-2 rounded-control border border-border px-2 py-1.5 text-text-secondary">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-4 shrink-0">
                      <path d="M6 3h9l5 5v13H6z" />
                      <path d="M15 3v5h5" />
                    </svg>
                    <span className="truncate">{selected.cv_file}</span>
                  </div>
                </div>
                <div>
                  <div className="font-semibold uppercase tracking-[0.05em] text-text-muted">Folder Path</div>
                  <div className="mt-1 truncate text-text-secondary">/{selected.folder_path}</div>
                </div>
              </div>
            </>
          ) : (
            <p className="text-xs text-text-muted">Select a candidate to see details.</p>
          )}
        </article>
      </div>
    </div>
  );
}
