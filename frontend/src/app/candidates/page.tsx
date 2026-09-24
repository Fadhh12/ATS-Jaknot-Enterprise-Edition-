"use client";

import { useEffect, useMemo, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import {
  ApiError,
  assignCandidateFolder,
  createFolder,
  deleteFolder,
  intakeCandidate,
  listFolders,
  renameFolder,
  resolveFileUrl,
  searchCandidates,
  uploadCv,
  type Candidate,
  type Folder,
} from "@/lib/api";
import { dummyCandidates } from "@/lib/dummy-data";
import { toWhatsAppLink } from "@/lib/contact";
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

function isPdf(url: string) {
  return url.toLowerCase().endsWith(".pdf");
}

const emptyForm = {
  full_name: "",
  email: "",
  phone: "",
  position_title: "",
  stage: "Applied",
  applicant_type: "Full-time",
};

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);
  const [query, setQuery] = useState("");
  const [stageFilter, setStageFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [autoFolderFilter, setAutoFolderFilter] = useState<{ position: string; stage: string } | null>(null);
  const [customFolderFilter, setCustomFolderFilter] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [newFolderName, setNewFolderName] = useState("");
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editingFolderName, setEditingFolderName] = useState("");
  const [movingFolder, setMovingFolder] = useState(false);
  const [cvModalOpen, setCvModalOpen] = useState(false);

  function load() {
    setLoading(true);
    Promise.allSettled([searchCandidates(), listFolders()]).then(([candResult, folderResult]) => {
      if (candResult.status === "fulfilled" && candResult.value.length) {
        setCandidates(candResult.value);
        setUsingFallback(false);
      } else {
        setCandidates(dummyCandidates);
        setUsingFallback(true);
      }
      if (folderResult.status === "fulfilled") setFolders(folderResult.value);
      setLoading(false);
    });
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!selectedId && candidates.length) setSelectedId(candidates[0].id);
  }, [candidates, selectedId]);

  useEffect(() => {
    setCvModalOpen(false);
  }, [selectedId]);

  useEffect(() => {
    if (!cvModalOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setCvModalOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [cvModalOpen]);

  const automatedFolders = useMemo(() => groupByPositionStage(candidates), [candidates]);

  const filtered = useMemo(() => {
    let list = candidates;
    if (autoFolderFilter) {
      list = list.filter((c) => c.position_title === autoFolderFilter.position && c.stage === autoFolderFilter.stage);
    }
    if (customFolderFilter) list = list.filter((c) => c.folder_id === customFolderFilter);
    if (stageFilter) list = list.filter((c) => c.stage === stageFilter);
    if (typeFilter) list = list.filter((c) => c.applicant_type === typeFilter);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (c) => c.full_name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.folder_path.toLowerCase().includes(q)
      );
    }
    return list;
  }, [candidates, autoFolderFilter, customFolderFilter, stageFilter, typeFilter, query]);

  const selected = candidates.find((c) => c.id === selectedId) ?? candidates[0];

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.full_name || !form.email || !form.phone || !form.position_title) return;
    setSubmitting(true);
    setFormError(null);
    try {
      let cv_file_url = `https://storage.local/cv/${encodeURIComponent(form.full_name)}.pdf`;
      if (cvFile) {
        const uploaded = await uploadCv(cvFile);
        cv_file_url = uploaded.url;
      }
      const created = await intakeCandidate({ ...form, cv_file_url });
      setCandidates((prev) => [created, ...prev]);
      setSelectedId(created.id);
      setForm(emptyForm);
      setCvFile(null);
      setOpen(false);
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Could not reach the server. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    setCvFile(e.target.files?.[0] ?? null);
  }

  async function handleCreateFolder() {
    if (!newFolderName.trim()) return;
    try {
      const created = await createFolder(newFolderName.trim());
      setFolders((prev) => [created, ...prev]);
      setNewFolderName("");
    } catch {
      // Backend unreachable — silently skip, fallback data has nothing to persist to.
    }
  }

  async function handleRenameFolder(id: string) {
    if (!editingFolderName.trim()) {
      setEditingFolderId(null);
      return;
    }
    try {
      const updated = await renameFolder(id, editingFolderName.trim());
      setFolders((prev) => prev.map((f) => (f.id === id ? updated : f)));
    } catch {
      // ignore
    } finally {
      setEditingFolderId(null);
    }
  }

  async function handleDeleteFolder(id: string) {
    try {
      await deleteFolder(id);
      setFolders((prev) => prev.filter((f) => f.id !== id));
      setCandidates((prev) => prev.map((c) => (c.folder_id === id ? { ...c, folder_id: null } : c)));
      if (customFolderFilter === id) setCustomFolderFilter(null);
    } catch {
      // ignore
    }
  }

  async function handleMoveToFolder(folderId: string | null) {
    if (!selected) return;
    setMovingFolder(true);
    try {
      const updated = await assignCandidateFolder(selected.id, folderId);
      setCandidates((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      setFolders((prev) =>
        prev.map((f) => {
          if (f.id === selected.folder_id) return { ...f, candidate_count: Math.max(0, f.candidate_count - 1) };
          if (f.id === folderId) return { ...f, candidate_count: f.candidate_count + 1 };
          return f;
        })
      );
    } catch {
      // ignore
    } finally {
      setMovingFolder(false);
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
        {/* Folders */}
        <article className="rounded-card border border-border bg-surface p-5 shadow-card lg:col-span-3">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-semibold">Automated Folders</h2>
              <p className="mt-1 text-xs text-text-secondary">Grouped by position &amp; stage</p>
            </div>
            {autoFolderFilter && (
              <button
                type="button"
                onClick={() => setAutoFolderFilter(null)}
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
                  const isActive = autoFolderFilter?.position === group.position && autoFolderFilter?.stage === s.stage;
                  return (
                    <button
                      key={s.stage}
                      type="button"
                      onClick={() => setAutoFolderFilter(isActive ? null : { position: group.position, stage: s.stage })}
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

          <div className="mt-5 border-t border-border pt-4">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold">Custom Folders</h3>
              {customFolderFilter && (
                <button
                  type="button"
                  onClick={() => setCustomFolderFilter(null)}
                  className="shrink-0 rounded-pill border border-border px-2 py-1 text-[10px] font-semibold text-text-secondary transition hover:bg-surface-alt"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="mt-2 flex gap-1.5">
              <input
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreateFolder()}
                placeholder="New folder name"
                className="h-9 min-w-0 flex-1 rounded-control border border-border bg-surface-alt px-2 text-xs text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-accent/30"
              />
              <button
                type="button"
                onClick={handleCreateFolder}
                aria-label="Create folder"
                className="flex size-9 shrink-0 items-center justify-center rounded-control bg-accent text-primary transition hover:bg-accent-hover"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-4">
                  <path d="M12 5v14M5 12h14" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <div className="mt-2 space-y-1 text-xs">
              {folders.map((f) => (
                <div
                  key={f.id}
                  className={`group flex items-center gap-1 rounded-control px-2 py-1.5 transition ${
                    customFolderFilter === f.id ? "bg-accent-soft font-semibold text-accent-hover" : "text-text-secondary hover:bg-surface-alt"
                  }`}
                >
                  {editingFolderId === f.id ? (
                    <input
                      autoFocus
                      value={editingFolderName}
                      onChange={(e) => setEditingFolderName(e.target.value)}
                      onBlur={() => handleRenameFolder(f.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleRenameFolder(f.id);
                        if (e.key === "Escape") setEditingFolderId(null);
                      }}
                      className="h-7 min-w-0 flex-1 rounded border border-primary bg-white px-1.5 text-xs text-text-primary focus:outline-none"
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() => setCustomFolderFilter(customFolderFilter === f.id ? null : f.id)}
                      className="flex min-w-0 flex-1 items-center justify-between text-left"
                    >
                      <span className="truncate">{f.name}</span>
                      <span className="tabular-nums text-text-muted">{f.candidate_count}</span>
                    </button>
                  )}
                  <button
                    type="button"
                    aria-label={`Rename ${f.name}`}
                    onClick={() => {
                      setEditingFolderId(f.id);
                      setEditingFolderName(f.name);
                    }}
                    className="hidden size-6 shrink-0 items-center justify-center rounded text-text-muted transition hover:bg-surface-alt hover:text-primary group-hover:flex"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-3.5">
                      <path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    aria-label={`Delete ${f.name}`}
                    onClick={() => handleDeleteFolder(f.id)}
                    className="hidden size-6 shrink-0 items-center justify-center rounded text-text-muted transition hover:bg-error/10 hover:text-error group-hover:flex"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-3.5">
                      <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
              ))}
              {folders.length === 0 && <p className="px-2 py-2 text-text-muted">No custom folders yet.</p>}
            </div>
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
                    const customFolder = folders.find((f) => f.id === c.folder_id);
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
                              {c.duplicate_type === "same_position" && (
                                <span className="inline-flex items-center whitespace-nowrap rounded-pill bg-warning-soft px-1.5 py-0.5 text-[10px] font-medium text-warning">
                                  Reapplied · Same Position
                                </span>
                              )}
                              {c.duplicate_type === "different_position" && (
                                <span className="inline-flex items-center whitespace-nowrap rounded-pill bg-info-soft px-1.5 py-0.5 text-[10px] font-medium text-info">
                                  Reapplied · Other Position
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
                        <td className="px-4 text-xs text-text-muted">{customFolder ? customFolder.name : `/${c.folder_path}`}</td>
                      </tr>
                    );
                  })}
                {!loading && filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-14 text-center text-text-muted">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto size-8 text-text-muted/60">
                        <circle cx="9" cy="8" r="3" />
                        <path d="M3 20a6 6 0 0 1 12 0M15 7.5a3 3 0 1 1 3 3M17 14a4 4 0 0 1 4 4" strokeLinecap="round" />
                      </svg>
                      <p className="mt-2 text-sm">No candidates match this filter.</p>
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

              {selected.duplicate_type && (
                <p
                  className={`mt-3 rounded-control px-2.5 py-1.5 text-[11px] font-medium ${
                    selected.duplicate_type === "same_position" ? "bg-warning-soft text-warning" : "bg-info-soft text-info"
                  }`}
                >
                  {selected.duplicate_type === "same_position"
                    ? "This person applied for this same position before."
                    : "This person previously applied for a different position."}
                </p>
              )}

              <div className="mt-4 space-y-3 text-xs">
                <div>
                  <div className="font-semibold uppercase tracking-[0.05em] text-text-muted">Contact</div>
                  <div className="mt-1.5 flex gap-1.5">
                    <a
                      href={`mailto:${selected.email}`}
                      aria-label={`Email ${selected.full_name}`}
                      title={selected.email}
                      className="flex h-8 flex-1 items-center justify-center gap-1.5 rounded-control border border-border text-text-secondary transition hover:bg-surface-alt hover:text-primary"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-3.5 shrink-0">
                        <path d="M4 6h16v12H4z" />
                        <path d="m4 7 8 6 8-6" />
                      </svg>
                      Email
                    </a>
                    <a
                      href={toWhatsAppLink(selected.phone)}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`WhatsApp ${selected.full_name}`}
                      title={selected.phone}
                      className="flex h-8 flex-1 items-center justify-center gap-1.5 rounded-control border border-border text-text-secondary transition hover:bg-success-soft hover:text-success"
                    >
                      <svg viewBox="0 0 24 24" fill="currentColor" className="size-3.5 shrink-0">
                        <path d="M12 2a10 10 0 0 0-8.5 15.2L2 22l4.9-1.5A10 10 0 1 0 12 2Zm0 18.2a8.1 8.1 0 0 1-4.3-1.2l-.3-.2-3 .9.9-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1s-.7.8-.9 1c-.2.2-.3.2-.6.1a6.6 6.6 0 0 1-3.3-2.9c-.2-.4.2-.4.5-1.2.1-.1.1-.3 0-.4-.1-.1-.6-1.4-.8-1.9-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.2-.9.9-.9 2.3s1 2.7 1.1 2.9c.1.2 2 3 4.8 4.2.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3Z" />
                      </svg>
                      WhatsApp
                    </a>
                  </div>
                </div>

                <div>
                  <div className="font-semibold uppercase tracking-[0.05em] text-text-muted">CV Document</div>
                  <button
                    type="button"
                    onClick={() => setCvModalOpen(true)}
                    className="mt-1 flex w-full items-center gap-2 rounded-control border border-border px-2 py-1.5 text-left text-text-secondary transition hover:bg-surface-alt hover:text-primary"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-4 shrink-0">
                      <path d="M6 3h9l5 5v13H6z" />
                      <path d="M15 3v5h5" />
                    </svg>
                    <span className="truncate">{fileNameOf(selected.cv_file_url)}</span>
                  </button>
                </div>

                <div>
                  <div className="font-semibold uppercase tracking-[0.05em] text-text-muted">Automated Folder</div>
                  <div className="mt-1 truncate text-text-secondary">/{selected.folder_path}</div>
                </div>

                <div>
                  <label className="font-semibold uppercase tracking-[0.05em] text-text-muted">Custom Folder</label>
                  <select
                    value={selected.folder_id ?? ""}
                    disabled={movingFolder}
                    onChange={(e) => handleMoveToFolder(e.target.value || null)}
                    className="mt-1 h-9 w-full rounded-control border border-border bg-surface-alt px-2 text-xs text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-accent/30"
                  >
                    <option value="">Unassigned</option>
                    {folders.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          ) : (
            <p className="text-xs text-text-muted">Select a candidate to see details.</p>
          )}
        </article>
      </div>

      {cvModalOpen && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-primary/40 backdrop-blur-[1px]" onClick={() => setCvModalOpen(false)} aria-hidden />
          <div role="dialog" aria-modal="true" aria-label={`${selected.full_name} CV`} className="relative flex h-full max-h-[85vh] w-full max-w-3xl flex-col rounded-card bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div>
                <h2 className="text-sm font-semibold text-text-primary">{selected.full_name} — CV</h2>
                <p className="text-xs text-text-secondary">{fileNameOf(selected.cv_file_url)}</p>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={resolveFileUrl(selected.cv_file_url)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-9 items-center gap-1.5 rounded-control border border-border px-3 text-xs font-semibold text-text-secondary transition hover:bg-surface-alt"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-3.5">
                    <path d="m7 17 10-10M8 7h9v9" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Open in new tab
                </a>
                <button
                  type="button"
                  onClick={() => setCvModalOpen(false)}
                  aria-label="Close"
                  className="grid size-9 place-items-center rounded-control text-text-muted transition hover:bg-surface-alt hover:text-text-primary"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-4">
                    <path d="m6 6 12 12M18 6 6 18" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="min-h-0 flex-1 bg-surface-alt p-2">
              {isPdf(selected.cv_file_url) ? (
                <iframe src={resolveFileUrl(selected.cv_file_url)} title={`${selected.full_name} CV`} className="size-full rounded-control border border-border bg-white" />
              ) : (
                <div className="flex size-full flex-col items-center justify-center gap-2 text-center text-xs text-text-secondary">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-8 text-text-muted">
                    <path d="M6 3h9l5 5v13H6z" />
                    <path d="M15 3v5h5" />
                  </svg>
                  Preview isn&apos;t available for this file type.
                  <br />
                  Use &quot;Open in new tab&quot; to view it.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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
            <label className="mb-1.5 block text-xs font-semibold text-text-secondary">CV File (PDF/DOC, optional)</label>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
              className="block w-full text-xs text-text-secondary file:mr-3 file:h-9 file:rounded-control file:border-0 file:bg-accent-soft file:px-3 file:text-xs file:font-semibold file:text-accent-hover hover:file:bg-accent/20"
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
