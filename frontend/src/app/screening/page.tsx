"use client";

import { useEffect, useMemo, useState } from "react";
import {
  getScreeningSummary,
  listScreeningEvaluations,
  listScorecardTemplates,
  searchCandidates,
  submitScreeningEvaluation,
  updateCandidateStage,
  type Candidate,
  type Recommendation,
  type ScorecardCriterion,
  type ScorecardTemplate,
  type ScreeningEvaluation,
  type ScreeningSummary,
} from "@/lib/api";
import { SlideOver } from "@/components/SlideOver";
import { StatusBadge } from "@/components/StatusBadge";

const SCORE_LABELS = ["1", "2", "3", "4", "5"];

const scoreDescription: Record<number, string> = {
  1: "Far below the bar",
  2: "Below the bar",
  3: "Meets the bar",
  4: "Above the bar",
  5: "Far above the bar",
};

const recommendationStyles: Record<Recommendation, string> = {
  Advance: "bg-success-soft text-success",
  Hold: "bg-warning-soft text-warning",
  Reject: "bg-error/10 text-error",
};

function weightedPercentage(criteria: ScorecardCriterion[], scores: Record<string, number>): number {
  const totalWeight = criteria.reduce((sum, c) => sum + c.weight, 0);
  if (totalWeight <= 0) return 0;
  let earned = 0;
  for (const c of criteria) {
    const raw = scores[c.name];
    if (raw === undefined) continue;
    earned += raw * c.weight;
  }
  return Math.round((earned / totalWeight / 5) * 1000) / 10;
}

function recommendationFor(score: number, template: ScorecardTemplate): Recommendation {
  if (score >= template.pass_threshold) return "Advance";
  if (score >= template.hold_threshold) return "Hold";
  return "Reject";
}

export default function ScreeningPage() {
  const [templates, setTemplates] = useState<ScorecardTemplate[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [evaluations, setEvaluations] = useState<ScreeningEvaluation[]>([]);
  const [summary, setSummary] = useState<ScreeningSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);

  const [query, setQuery] = useState("");
  const [positionFilter, setPositionFilter] = useState("");
  const [recommendationFilter, setRecommendationFilter] = useState("");

  const [open, setOpen] = useState(false);
  const [target, setTarget] = useState<Candidate | null>(null);
  const [templateId, setTemplateId] = useState("");
  const [scores, setScores] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [overallNotes, setOverallNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  function load() {
    setLoading(true);
    Promise.all([
      listScorecardTemplates(),
      searchCandidates(),
      listScreeningEvaluations(),
      getScreeningSummary(),
    ])
      .then(([tpl, cands, evals, sum]) => {
        if (tpl.length === 0 && cands.length === 0) {
          setTemplates(dummyTemplates);
          setCandidates(dummyCandidates);
          setEvaluations(dummyEvaluations);
          setSummary(dummySummary);
          setUsingFallback(true);
        } else {
          setTemplates(tpl);
          setCandidates(cands);
          setEvaluations(evals);
          setSummary(sum);
          setUsingFallback(false);
        }
      })
      .catch(() => {
        setTemplates(dummyTemplates);
        setCandidates(dummyCandidates);
        setEvaluations(dummyEvaluations);
        setSummary(dummySummary);
        setUsingFallback(true);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  const positions = useMemo(
    () => Array.from(new Set(candidates.map((c) => c.position_title))).sort(),
    [candidates]
  );

  const screeningPool = useMemo(() => {
    let list = candidates.filter((c) => c.stage === "Screening");
    if (positionFilter) list = list.filter((c) => c.position_title === positionFilter);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (c) =>
          c.full_name.toLowerCase().includes(q) ||
          c.position_title.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q)
      );
    }
    return list;
  }, [candidates, positionFilter, query]);

  const scoredHistory = useMemo(() => {
    let list = evaluations;
    if (recommendationFilter) {
      list = list.filter((e) => e.recommendation === recommendationFilter);
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (e) =>
          e.candidate_name.toLowerCase().includes(q) ||
          e.candidate_position.toLowerCase().includes(q) ||
          e.reviewer_name.toLowerCase().includes(q)
      );
    }
    return list;
  }, [evaluations, recommendationFilter, query]);

  const activeTemplate = useMemo(
    () => templates.find((t) => t.id === templateId) ?? null,
    [templates, templateId]
  );

  const liveScore = useMemo(
    () => (activeTemplate ? weightedPercentage(activeTemplate.criteria, scores) : 0),
    [activeTemplate, scores]
  );

  const liveRecommendation = useMemo(
    () => (activeTemplate ? recommendationFor(liveScore, activeTemplate) : "Hold"),
    [activeTemplate, liveScore]
  );

  const allScored = activeTemplate
    ? activeTemplate.criteria.every((c) => scores[c.name] !== undefined)
    : false;

  function openScorecard(candidate: Candidate) {
    const template =
      templates.find((t) => t.position_title === candidate.position_title) ??
      templates.find((t) => t.is_default) ??
      templates[0] ??
      null;
    setTarget(candidate);
    setTemplateId(template?.id ?? "");
    setScores({});
    setNotes({});
    setOverallNotes("");
    setFormError(null);
    setOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!target || !activeTemplate) return;
    if (!allScored) {
      setFormError("Score every criterion before submitting.");
      return;
    }
    setSubmitting(true);
    setFormError(null);
    const payload = {
      candidate_id: target.id,
      template_id: activeTemplate.id,
      scores,
      notes,
      overall_notes: overallNotes || undefined,
    };
    try {
      const created = await submitScreeningEvaluation(payload);
      applyEvaluation(created);
      setOpen(false);
    } catch {
      if (usingFallback) {
        // Demo mode: no backend to post to, so score the candidate locally.
        applyEvaluation({
          id: `local-${target.id}-${Date.now()}`,
          candidate_id: target.id,
          candidate_name: target.full_name,
          candidate_position: target.position_title,
          candidate_stage:
            liveRecommendation === "Advance"
              ? "Shortlist"
              : liveRecommendation === "Reject"
                ? "Rejected"
                : "Screening",
          template_id: activeTemplate.id,
          template_name: activeTemplate.name,
          reviewer_id: "demo-user",
          reviewer_name: "Nabil (Demo)",
          scores,
          notes,
          overall_notes: overallNotes || null,
          weighted_score: liveScore,
          recommendation: liveRecommendation,
          status: "Submitted",
          created_at: new Date().toISOString(),
          submitted_at: new Date().toISOString(),
        });
        setOpen(false);
      } else {
        setFormError("Could not reach the server. Try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  function applyEvaluation(created: ScreeningEvaluation) {
    setEvaluations((prev) => [created, ...prev]);
    setCandidates((prev) =>
      prev.map((c) => (c.id === created.candidate_id ? { ...c, stage: created.candidate_stage } : c))
    );
    setSummary((prev) =>
      prev
        ? {
            ...prev,
            total_scored: prev.total_scored + 1,
            total_in_screening: Math.max(0, prev.total_in_screening - 1),
            advance: prev.advance + (created.recommendation === "Advance" ? 1 : 0),
            hold: prev.hold + (created.recommendation === "Hold" ? 1 : 0),
            reject: prev.reject + (created.recommendation === "Reject" ? 1 : 0),
          }
        : prev
    );
  }

  async function handleMove(candidate: Candidate, stage: string) {
    try {
      const updated = await updateCandidateStage(candidate.id, stage);
      setCandidates((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    } catch {
      if (usingFallback) {
        setCandidates((prev) => prev.map((c) => (c.id === candidate.id ? { ...c, stage } : c)));
      }
    }
  }

  return (
    <div>
      <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-5 text-primary">
                <path d="M9 11l3 3L22 4" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" strokeLinecap="round" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-text-primary lg:text-3xl">Screening &amp; Scorecard</h1>
          </div>
          <p className="mt-1 flex items-center gap-2 text-sm text-text-secondary">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-4 text-text-muted">
              <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M12 3l7 3v6c0 4.5-3 7.8-7 9-4-1.2-7-4.5-7-9V6l7-3z" />
            </svg>
            Standardized weighted scoring for every candidate review
          </p>
        </div>
      </div>

      {usingFallback && (
        <p className="mb-4 rounded-control bg-warning-soft px-3 py-2 text-xs text-warning">
          API not reachable — showing sample data. Start the backend to see live data.
        </p>
      )}

      {/* Summary */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-5">
        <SummaryTile label="Awaiting Screening" value={summary?.total_in_screening ?? 0} tone="primary" />
        <SummaryTile label="Scored" value={summary?.total_scored ?? 0} tone="text-primary" />
        <SummaryTile label="Advance" value={summary?.advance ?? 0} tone="text-success" />
        <SummaryTile label="Hold" value={summary?.hold ?? 0} tone="text-warning" />
        <SummaryTile label="Reject" value={summary?.reject ?? 0} tone="text-error" />
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
            placeholder="Search candidate, position or reviewer..."
            className="h-10 w-full rounded-control border border-border bg-surface-alt pl-9 pr-3 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-accent/30"
          />
        </div>
        <select
          value={positionFilter}
          onChange={(e) => setPositionFilter(e.target.value)}
          className="h-10 rounded-control border border-border bg-surface px-3 text-sm text-text-secondary focus:border-primary focus:outline-none focus:ring-2 focus:ring-accent/30"
        >
          <option value="">All Positions</option>
          {positions.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        <select
          value={recommendationFilter}
          onChange={(e) => setRecommendationFilter(e.target.value)}
          className="h-10 rounded-control border border-border bg-surface px-3 text-sm text-text-secondary focus:border-primary focus:outline-none focus:ring-2 focus:ring-accent/30"
        >
          <option value="">All Recommendations</option>
          <option value="Advance">Advance</option>
          <option value="Hold">Hold</option>
          <option value="Reject">Reject</option>
        </select>
      </div>

      {/* Screening queue */}
      <div className="mb-6 overflow-x-auto rounded-card border border-border bg-surface shadow-card">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="text-sm font-semibold text-text-primary">Screening Queue</h2>
          <span className="rounded-pill bg-surface-alt px-2 py-0.5 text-[11px] font-medium text-text-secondary">
            {screeningPool.length} candidate{screeningPool.length === 1 ? "" : "s"}
          </span>
        </div>
        <table className="w-full min-w-[860px] text-left">
          <thead>
            <tr className="h-11 bg-surface-alt text-[11px] font-semibold text-text-secondary">
              <th className="px-4 font-semibold">Candidate</th>
              <th className="px-4 font-semibold">Position</th>
              <th className="px-4 font-semibold">Type</th>
              <th className="px-4 font-semibold">Applied</th>
              <th className="px-4 font-semibold">Stage</th>
              <th className="px-4 font-semibold">Action</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {loading && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-text-muted">Loading...</td>
              </tr>
            )}
            {!loading && screeningPool.map((c) => (
              <tr key={c.id} className="h-[52px] border-t border-border transition hover:bg-surface-alt/60">
                <td className="px-4">
                  <div className="font-medium">{c.full_name}</div>
                  <div className="text-xs text-text-secondary">{c.email}</div>
                </td>
                <td className="px-4 text-text-secondary">{c.position_title}</td>
                <td className="px-4 text-text-secondary">{c.applicant_type}</td>
                <td className="px-4 text-text-secondary">
                  {new Date(c.applied_at).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}
                </td>
                <td className="px-4"><StatusBadge status={c.stage} /></td>
                <td className="px-4">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openScorecard(c)}
                      className="inline-flex h-8 items-center gap-1.5 rounded-control bg-accent px-3 text-xs font-semibold text-primary transition hover:bg-accent-hover active:scale-[0.98]"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-3.5">
                        <path d="M12 20h9" strokeLinecap="round" />
                        <path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
                      </svg>
                      Score
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMove(c, "Shortlist")}
                      title="Move to Shortlist without scoring"
                      className="flex size-8 items-center justify-center rounded-control border border-border bg-white text-text-secondary transition hover:bg-surface-alt"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-4">
                        <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!loading && screeningPool.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-14 text-center text-text-muted">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto size-8 text-text-muted/60">
                    <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M12 3l7 3v6c0 4.5-3 7.8-7 9-4-1.2-7-4.5-7-9V6l7-3z" />
                  </svg>
                  <p className="mt-2 text-sm">No candidate is waiting for screening.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Scorecard history */}
      <div className="overflow-x-auto rounded-card border border-border bg-surface shadow-card">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="text-sm font-semibold text-text-primary">Completed Scorecards</h2>
          <span className="text-xs text-text-secondary">
            Average score {summary?.average_score ?? 0}
          </span>
        </div>
        <table className="w-full min-w-[860px] text-left">
          <thead>
            <tr className="h-11 bg-surface-alt text-[11px] font-semibold text-text-secondary">
              <th className="px-4 font-semibold">Candidate</th>
              <th className="px-4 font-semibold">Position</th>
              <th className="px-4 font-semibold">Scorecard</th>
              <th className="px-4 font-semibold">Reviewer</th>
              <th className="px-4 font-semibold">Score</th>
              <th className="px-4 font-semibold">Recommendation</th>
              <th className="px-4 font-semibold">Submitted</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {loading && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-text-muted">Loading...</td>
              </tr>
            )}
            {!loading && scoredHistory.map((e) => (
              <tr key={e.id} className="h-[52px] border-t border-border transition hover:bg-surface-alt/60">
                <td className="px-4 font-medium">{e.candidate_name}</td>
                <td className="px-4 text-text-secondary">{e.candidate_position}</td>
                <td className="px-4 text-text-secondary">{e.template_name}</td>
                <td className="px-4 text-text-secondary">{e.reviewer_name}</td>
                <td className="px-4 tabular-nums font-medium">{e.weighted_score}</td>
                <td className="px-4">
                  <span className={`inline-flex items-center rounded-pill px-2.5 py-1 text-xs font-medium ${recommendationStyles[e.recommendation]}`}>
                    {e.recommendation}
                  </span>
                </td>
                <td className="px-4 text-text-secondary">
                  {new Date(e.submitted_at).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}
                </td>
              </tr>
            ))}
            {!loading && scoredHistory.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-14 text-center text-text-muted">
                  <p className="text-sm">No scorecard has been submitted yet.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <SlideOver
        open={open}
        onClose={() => setOpen(false)}
        title={target ? `Score ${target.full_name}` : "Scorecard"}
        description={target ? `${target.position_title} · ${target.email}` : undefined}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-text-secondary">Scorecard</label>
            <select
              value={templateId}
              onChange={(e) => {
                setTemplateId(e.target.value);
                setScores({});
                setNotes({});
              }}
              className="h-10 w-full rounded-control border border-border bg-surface-alt px-3 text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-accent/30"
            >
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                  {t.position_title ? ` (${t.position_title})` : ""}
                </option>
              ))}
            </select>
          </div>

          {activeTemplate && (
            <div className="space-y-4">
              {activeTemplate.criteria.map((criterion) => (
                <div key={criterion.name} className="rounded-control border border-border bg-surface-alt p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-text-primary">{criterion.name}</div>
                      {criterion.description && (
                        <div className="mt-0.5 text-xs text-text-secondary">{criterion.description}</div>
                      )}
                    </div>
                    <span className="shrink-0 rounded-pill bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                      {criterion.weight}%
                    </span>
                  </div>
                  <div className="mt-2.5 flex gap-1.5">
                    {SCORE_LABELS.map((label) => {
                      const value = Number(label);
                      const active = scores[criterion.name] === value;
                      return (
                        <button
                          key={label}
                          type="button"
                          title={scoreDescription[value]}
                          aria-label={`${criterion.name}: ${value} — ${scoreDescription[value]}`}
                          aria-pressed={active}
                          onClick={() => setScores((prev) => ({ ...prev, [criterion.name]: value }))}
                          className={`h-9 flex-1 rounded-control border text-sm font-semibold transition ${
                            active
                              ? "border-accent bg-accent text-primary"
                              : "border-border bg-white text-text-secondary hover:border-accent/50 hover:text-text-primary"
                          }`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                  {scores[criterion.name] !== undefined && (
                    <div className="mt-2 text-[11px] text-text-muted">{scoreDescription[scores[criterion.name]]}</div>
                  )}
                  <input
                    value={notes[criterion.name] ?? ""}
                    onChange={(e) => setNotes((prev) => ({ ...prev, [criterion.name]: e.target.value }))}
                    placeholder="Evidence / notes (optional)"
                    className="mt-2 h-9 w-full rounded-control border border-border bg-white px-3 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-accent/30"
                  />
                </div>
              ))}
            </div>
          )}

          {activeTemplate && (
            <div className="rounded-control border border-border bg-surface-alt p-4">
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-[11px] font-medium uppercase tracking-wider text-text-muted">
                    Weighted Score
                  </div>
                  <div className="mt-1 text-3xl font-bold leading-none text-text-primary">{liveScore}</div>
                </div>
                <span
                  className={`inline-flex items-center rounded-pill px-2.5 py-1 text-xs font-semibold ${recommendationStyles[liveRecommendation]}`}
                >
                  {liveRecommendation}
                </span>
              </div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-300"
                  style={{ width: `${Math.min(100, liveScore)}%` }}
                />
              </div>
              <p className="mt-2 text-[11px] text-text-secondary">
                Advance at {activeTemplate.pass_threshold}+ · Hold at {activeTemplate.hold_threshold}+
              </p>
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-text-secondary">Overall Notes</label>
            <textarea
              rows={3}
              value={overallNotes}
              onChange={(e) => setOverallNotes(e.target.value)}
              placeholder="Summary of this review..."
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
              onClick={() => setOpen(false)}
              className="h-10 flex-1 rounded-control border border-border bg-surface-alt text-sm font-semibold text-text-secondary transition hover:border-border"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !activeTemplate}
              className="h-10 flex-1 rounded-control bg-accent text-sm font-semibold text-primary transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Submitting..." : "Submit Scorecard"}
            </button>
          </div>
        </form>
      </SlideOver>
    </div>
  );
}

function SummaryTile({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: string;
}) {
  return (
    <div className="rounded-card border border-border bg-surface p-4 shadow-card">
      <div className="text-[11px] font-medium uppercase tracking-wider text-text-muted">{label}</div>
      <div className={`mt-1.5 text-2xl font-bold leading-none ${tone}`}>{value}</div>
    </div>
  );
}

// Demo data for when backend is not available
const dummyTemplates: ScorecardTemplate[] = [
  {
    id: "demo-tpl-1",
    name: "Standard Screening Scorecard",
    position_title: null,
    criteria: [
      { name: "Relevant Experience", weight: 30, description: "Years and relevance of past work to the role." },
      { name: "Skills & Knowledge", weight: 25, description: "Technical and functional command of the job." },
      { name: "Communication", weight: 20, description: "Clarity, listening and responsiveness." },
      { name: "Problem Solving", weight: 15, description: "Structured thinking under operational pressure." },
      { name: "Culture & Teamwork", weight: 10, description: "Fit with the Jaknot working culture." },
    ],
    pass_threshold: 70,
    hold_threshold: 50,
    is_default: true,
    created_by: "demo-user",
    created_by_name: "Nabil",
    created_at: "2026-10-21T00:00:00Z",
  },
  {
    id: "demo-tpl-2",
    name: "Daily Worker Screening",
    position_title: "Store Crew",
    criteria: [
      { name: "Attendance Reliability", weight: 35, description: "History of consistent attendance and punctuality." },
      { name: "Physical Readiness", weight: 30, description: "Fitness for warehouse and store floor duties." },
      { name: "Experience", weight: 20, description: "Prior retail or warehouse experience." },
      { name: "Attitude", weight: 15, description: "Willingness and discipline on the floor." },
    ],
    pass_threshold: 70,
    hold_threshold: 50,
    is_default: false,
    created_by: "demo-user",
    created_by_name: "Nabil",
    created_at: "2026-10-20T00:00:00Z",
  },
];

const dummyCandidates: Candidate[] = [
  {
    id: "demo-cand-1",
    full_name: "Aisyah Putri",
    email: "aisyah@candidate.test",
    phone: "+62 812-3456-7890",
    cv_file_url: "https://storage.local/cv/Aisyah_Putri_CV.pdf",
    position_title: "Warehouse Supervisor",
    stage: "Screening",
    applicant_type: "Full-time",
    duplicate_type: null,
    folder_path: "warehouse-supervisor/screening/2026-09",
    folder_id: null,
    applied_at: "2026-09-21T08:00:00Z",
  },
  {
    id: "demo-cand-2",
    full_name: "Rizky Pratama",
    email: "rizky@candidate.test",
    phone: "+62 813-2211-4590",
    cv_file_url: "https://storage.local/cv/Rizky_Pratama_CV.pdf",
    position_title: "Warehouse Supervisor",
    stage: "Screening",
    applicant_type: "Daily Worker",
    duplicate_type: "same_position",
    folder_path: "warehouse-supervisor/screening/2026-09",
    folder_id: null,
    applied_at: "2026-09-20T08:00:00Z",
  },
  {
    id: "demo-cand-3",
    full_name: "Dina Sari",
    email: "dina@candidate.test",
    phone: "+62 811-7788-2200",
    cv_file_url: "https://storage.local/cv/Dina_Sari_CV.pdf",
    position_title: "Recruitment Admin",
    stage: "Screening",
    applicant_type: "Full-time",
    duplicate_type: null,
    folder_path: "recruitment-admin/screening/2026-09",
    folder_id: null,
    applied_at: "2026-09-19T08:00:00Z",
  },
];

const dummyEvaluations: ScreeningEvaluation[] = [
  {
    id: "demo-eval-1",
    candidate_id: "demo-cand-4",
    candidate_name: "Dina Sari",
    candidate_position: "Recruitment Admin",
    candidate_stage: "Shortlist",
    template_id: "demo-tpl-1",
    template_name: "Standard Screening Scorecard",
    reviewer_id: "demo-user",
    reviewer_name: "Rina Recruiter",
    scores: {
      "Relevant Experience": 4,
      "Skills & Knowledge": 4,
      Communication: 5,
      "Problem Solving": 4,
      "Culture & Teamwork": 4,
    },
    notes: { "Relevant Experience": "5 years in recruitment operations." },
    overall_notes: "Strong on communication, ready for the next stage.",
    weighted_score: 84,
    recommendation: "Advance",
    status: "Submitted",
    created_at: "2026-10-18T08:00:00Z",
    submitted_at: "2026-10-18T08:00:00Z",
  },
  {
    id: "demo-eval-2",
    candidate_id: "demo-cand-5",
    candidate_name: "Fajar Adi",
    candidate_position: "Graphic Designer",
    candidate_stage: "Screening",
    template_id: "demo-tpl-1",
    template_name: "Standard Screening Scorecard",
    reviewer_id: "demo-user",
    reviewer_name: "Hasan Hiring",
    scores: {
      "Relevant Experience": 3,
      "Skills & Knowledge": 2,
      Communication: 3,
      "Problem Solving": 3,
      "Culture & Teamwork": 4,
    },
    notes: {},
    overall_notes: "Portfolio is thin on brand work. Needs a second look.",
    weighted_score: 58,
    recommendation: "Hold",
    status: "Submitted",
    created_at: "2026-10-17T08:00:00Z",
    submitted_at: "2026-10-17T08:00:00Z",
  },
];

const dummySummary: ScreeningSummary = {
  total_in_screening: 3,
  total_scored: 2,
  advance: 1,
  hold: 1,
  reject: 0,
  average_score: 71,
};
