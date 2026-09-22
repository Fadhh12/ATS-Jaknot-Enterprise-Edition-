import type { ReactNode } from "react";

type Trend = { value: string; direction: "up" | "down" | "flat" };

export function StatCard({
  label,
  value,
  icon,
  trend,
}: {
  label: string;
  value: string | number;
  icon: ReactNode;
  trend?: Trend;
}) {
  const trendColor =
    trend?.direction === "up"
      ? "text-emerald-600 bg-emerald-50"
      : trend?.direction === "down"
      ? "text-red-600 bg-red-50"
      : "text-slate-500 bg-slate-100";

  return (
    <div className="group rounded-card border border-slate-200/70 bg-white p-5 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover">
      <div className="flex items-start justify-between">
        <p className="text-[13px] font-medium text-slate-500">{label}</p>
        <div className="grid h-8 w-8 place-items-center rounded-[9px] bg-cloud-blue text-navy transition-colors group-hover:bg-navy group-hover:text-white">
          {icon}
        </div>
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <p className="text-[28px] font-bold leading-none tracking-tight text-navy">{value}</p>
        {trend && (
          <span className={`rounded-pill px-1.5 py-0.5 text-[11px] font-semibold ${trendColor}`}>
            {trend.direction === "up" ? "+" : trend.direction === "down" ? "-" : ""}
            {trend.value}
          </span>
        )}
      </div>
    </div>
  );
}
