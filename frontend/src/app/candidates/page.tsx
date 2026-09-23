"use client";

import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { ApiError, intakeCandidate, searchCandidates, type Candidate } from "@/lib/api";
import { dummyCandidates } from "@/lib/dummy-data";
import { groupByPositionStage } from "@/lib/folders";
import { StatusBadge } from "@/components/StatusBadge";
import { SkeletonRows } from "@/components/SkeletonRows";
import { SlideOver } from "@/components/SlideOver";

const dateFormatter = new Intl.DateTimeFormat("en-US", { day: "2-digit", month: "short", year: "numeric" });
const STAGES = ["Applied", "Screening", "Shortlist", "Hired"];
const APPLICANT_TYPES = ["Full-time", "Daily Worker"];

function initialsOf(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

function fileNameOf(url: string) {
  try {
    return decodeURIComponent(url.split("/").pop() ?? url);
  } catch {
    return url;
  }
}

const emptyForm = {
  full_name: "",
  email: "",
  phone: "",
  cv_file_url: "",
  position_title: "",
  stage: "Applied",
  applicant_type: "Full-time",
};

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);
  const [query, setQuery] = useState("");
  const [stageFilter, setStageFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [folderFilter, setFolderFilter] = useState<{ position: string; stage: string } | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  function load() {
    setLoading(true);
    searchCandidates()
      .then((data) => {
        setCandidates(data.length ? data : dummyCandidates);
        setUsingFallback(data.length === 0);
      })
      .catch(() => {
        setCandidates(dummyCandidates);
        setUsingFallback(true);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!selectedId && candidates.length) setSelectedId(candidates[0].id);
  }, [candidates, selectedId]);

  const automatedFolders = useMemo(() => groupByPositionStage(candidates), [candidates]);

  const filtered = useMemo(() => {
    let list = candidates;
    if (folderFilter) {
      list = list.filter((c) => c.position_title === folderFilter.position && c.stage === folderFilter.stage);
    }
    if (stageFilter) list = list.filter((c) => c.stage === stageFilter);
    if (typeFilter) list = list.filter((c) => c.applicant_type === typeFilter);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (c) => c.full_name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.folder_path.toLowerCase().includes(q)
      );
    }
    return list;
  }, [candidates, folderFilter, stageFilter, typeFilter, query]);

  const selected = candidates.find((c) => c.id === selectedId) ?? candidates[0];

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.full_name || !form.email || !form.phone || !form.position_title) return;
    setSubmitting(true);
    setFormError(null);
    try {
      const created = await intakeCandidate({
        ...form,
        cv_file_url: form.cv_file_url || `https://storage.local/cv/${encodeURIComponent(form.full_name)}.pdf`,
      });
      setCandidates((prev) => [created, ...prev]);
      setSelectedId(created.id);
      setForm(emptyForm);
      setOpen(false);
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Could not reach the server. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <h1 className="text-2xl font-bold tracking-tight text-text-primary lg:text-3xl">Candidate Database</h1>
        <button
          type="button"
          onClick={() => setOpen(true)}
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
            placeholder="Search candidate..."
            className="h-10 w-full rounded-control border border-border bg-surface-alt pl-9 pr-3 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-accent/30"
          />
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex">
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="h-10 rounded-control border border-border bg-surface px-3 text-sm text-text-secondary focus:border-primary focus:outline-none focus:ring-2 focus:ring-accent/30"
          >
            <option value="">Stage</option>
            {STAGES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="h-10 rounded-control border border-border bg-surface px-3 text-sm text-text-secondary focus:border-primary focus:outline-none focus:ring-2 focus:ring-accent/30"
          >
            <option value="">Applicant Type</option>
            {APPLICANT_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
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
            {!loading && automatedFolders.length === 0 && <p className="px-2 py-4 text-text-muted">No candidates yet.</p>}
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
                  <div className="font-semibold uppercase tracking-[0.05em] text-text-muted">CV Document</div>
                  <a
                    href={selected.cv_file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 flex items-center gap-2 rounded-control border border-border px-2 py-1.5 text-text-secondary transition hover:bg-surface-alt hover:text-primary"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-4 shrink-0">
                      <path d="M6 3h9l5 5v13H6z" />
                      <path d="M15 3v5h5" />
                    </svg>
                    <span className="truncate">{fileNameOf(selected.cv_file_url)}</span>
                  </a>
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

      <SlideOver open={open} onClose={() => setOpen(false)} title="Add Candidate" description="FR-01.2 automated foldering runs on submit.">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-text-secondary">Full Name</label>
            <input
              required
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              placeholder="e.g. Siti Rahma"
              className="h-10 w-full rounded-control border border-border bg-surface-alt px-3 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-accent/30"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-text-secondary">Email</label>
            <input
              required
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="candidate@email.com"
              className="h-10 w-full rounded-control border border-border bg-surface-alt px-3 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-accent/30"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-text-secondary">Phone</label>
            <input
              required
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="+62 8xx-xxxx-xxxx"
              className="h-10 w-full rounded-control border border-border bg-surface-alt px-3 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-accent/30"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-text-secondary">Position Applied For</label>
            <input
              required
              value={form.position_title}
              onChange={(e) => setForm({ ...form, position_title: e.target.value })}
              placeholder="e.g. Warehouse Supervisor"
              className="h-10 w-full rounded-control border border-border bg-surface-alt px-3 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-accent/30"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-text-secondary">Stage</label>
              <select
                value={form.stage}
                onChange={(e) => setForm({ ...form, stage: e.target.value })}
                className="h-10 w-full rounded-control border border-border bg-surface-alt px-3 text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-accent/30"
              >
                {STAGES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-text-secondary">Type</label>
              <select
                value={form.applicant_type}
                onChange={(e) => setForm({ ...form, applicant_type: e.target.value })}
                className="h-10 w-full rounded-control border border-border bg-surface-alt px-3 text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-accent/30"
              >
                {APPLICANT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-text-secondary">CV URL (optional)</label>
            <input
              value={form.cv_file_url}
              onChange={(e) => setForm({ ...form, cv_file_url: e.target.value })}
              placeholder="https://..."
              className="h-10 w-full rounded-control border border-border bg-surface-alt px-3 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-accent/30"
            />
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
            {submitting ? "Adding…" : "Add Candidate"}
          </button>
        </form>
      </SlideOver>
    </div>
  );
}
