import { StatCard } from "@/components/StatCard";

export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-navy">Dashboard</h1>
      <p className="mt-1 text-sm text-slate-500">
        Sprint 1 scope: Job Requisition (FR-03) and Candidate Database (FR-01).
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Open Requisitions" value="--" />
        <StatCard label="Pending Approvals" value="--" />
        <StatCard label="Total Candidates" value="--" />
        <StatCard label="New This Week" value="--" />
      </div>
    </div>
  );
}
