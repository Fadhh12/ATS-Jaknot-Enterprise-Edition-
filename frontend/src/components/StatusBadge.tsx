const STYLES: Record<string, string> = {
  Draft: "bg-surface-alt text-text-secondary",
  "Pending Approval": "bg-warning-soft text-warning",
  Approved: "bg-success-soft text-success",
  Rejected: "bg-error/10 text-error",
  Closed: "bg-surface-alt text-text-secondary",
  Applied: "bg-warning-soft text-warning",
  Screening: "bg-info-soft text-info",
  Shortlist: "bg-success-soft text-success",
  Hired: "bg-success-soft text-success",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center rounded-pill px-2.5 py-1 text-xs font-medium ${STYLES[status] ?? "bg-surface-alt text-text-secondary"}`}>
      {status}
    </span>
  );
}
