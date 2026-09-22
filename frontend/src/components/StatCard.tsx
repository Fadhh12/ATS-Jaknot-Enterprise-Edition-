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
      ? "text-success bg-success-soft"
      : trend?.direction === "down"
      ? "text-error bg-error/10"
      : "text-text-secondary bg-surface-alt";

  return (
    <div className="group rounded-card border border-border bg-surface p-5 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-raised">
      <div className="flex items-start justify-between">
        <p className="text-[13px] font-medium text-text-secondary">{label}</p>
        <div className="grid h-8 w-8 place-items-center rounded-control bg-accent-soft text-accent transition-colors group-hover:bg-primary group-hover:text-white">
          {icon}
        </div>
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <p className="text-[28px] font-bold leading-none tracking-tight text-text-primary">{value}</p>
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
