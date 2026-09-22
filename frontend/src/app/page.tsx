import { StatCard } from "@/components/StatCard";
import { Avatar } from "@/components/Avatar";
import { dummyRequisitions, dummyCandidates, pendingApprovals, recentActivity } from "@/lib/dummy-data";

const icons = {
  briefcase: (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4">
      <rect x="3" y="6.5" width="14" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7 6.5V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  ),
  clock: (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4">
      <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 6v4l2.5 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  users: (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4">
      <circle cx="7.5" cy="7" r="2.6" stroke="currentColor" strokeWidth="1.5" />
      <path d="M2.8 16c0-2.4 2.1-4.2 4.7-4.2s4.7 1.8 4.7 4.2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M12.8 5.2a2.6 2.6 0 0 1 0 5.1M15.5 16c0-2-1.4-3.7-3.4-4.1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  spark: (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4">
      <path d="M10 3v3M10 14v3M3 10h3M14 10h3M5.3 5.3l2 2M12.7 12.7l2 2M5.3 14.7l2-2M12.7 7.3l2-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
};

export default function DashboardPage() {
  const openCount = dummyRequisitions.filter((r) => r.status === "Approved" || r.status === "Pending Approval").length;
  const pendingCount = dummyRequisitions.filter((r) => r.status === "Pending Approval").length;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[26px] font-bold tracking-tight text-navy">Good afternoon, Nabil</h1>
          <p className="mt-1 text-sm text-slate-500">
            Sprint 1 scope — Job Requisition (FR-03) and Candidate Database (FR-01).
          </p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Open requisitions" value={openCount} icon={icons.briefcase} trend={{ value: "2 this week", direction: "up" }} />
        <StatCard label="Pending approvals" value={pendingCount} icon={icons.clock} trend={{ value: "avg 2.3 days", direction: "flat" }} />
        <StatCard label="Total candidates" value={dummyCandidates.length} icon={icons.users} trend={{ value: "18.4%", direction: "up" }} />
        <StatCard label="New this week" value={6} icon={icons.spark} trend={{ value: "3", direction: "down" }} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-5">
        <div className="rounded-card border border-slate-200/70 bg-white p-5 shadow-card lg:col-span-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-navy">Waiting on approval</h2>
            <a href="/requisitions" className="text-xs font-medium text-accent-orange hover:underline">
              View all
            </a>
          </div>
          <div className="mt-3 divide-y divide-slate-100">
            {pendingApprovals.map((item) => (
              <div key={item.id} className="flex items-center justify-between py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-800">{item.title}</p>
                  <p className="text-xs text-slate-500">
                    {item.department} · waiting on {item.waitingOn}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-pill px-2 py-1 text-[11px] font-semibold ${
                    item.daysWaiting >= 3 ? "bg-amber-50 text-amber-700" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {item.daysWaiting}d waiting
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-card border border-slate-200/70 bg-white p-5 shadow-card lg:col-span-2">
          <h2 className="text-sm font-semibold text-navy">Recent activity</h2>
          <div className="mt-3 space-y-4">
            {recentActivity.map((item, i) => (
              <div key={i} className="flex gap-3">
                <Avatar name={item.candidate} size="sm" />
                <div className="min-w-0">
                  <p className="text-sm text-slate-700">
                    <span className="font-medium text-slate-900">{item.candidate}</span> {item.action}{" "}
                    <span className="font-medium text-slate-900">{item.target}</span>
                  </p>
                  <p className="text-xs text-slate-400">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
