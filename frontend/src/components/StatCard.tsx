export function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-card bg-white p-5 shadow-sm border border-slate-200">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-navy">{value}</p>
    </div>
  );
}
