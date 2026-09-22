const STYLES: Record<string, string> = {
  Draft: "bg-slate-100 text-slate-600",
  "Pending Approval": "bg-amber-50 text-amber-700",
  Approved: "bg-emerald-50 text-emerald-700",
  Rejected: "bg-red-50 text-red-700",
  Closed: "bg-slate-100 text-slate-500",
};

const DOT: Record<string, string> = {
  Draft: "bg-slate-400",
  "Pending Approval": "bg-amber-500",
  Approved: "bg-emerald-500",
  Rejected: "bg-red-500",
  Closed: "bg-slate-400",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-pill px-2.5 py-1 text-[12px] font-medium ${
        STYLES[status] ?? "bg-slate-100 text-slate-600"
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${DOT[status] ?? "bg-slate-400"}`} />
      {status}
    </span>
  );
}
