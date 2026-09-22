const PALETTE = [
  "bg-orange-100 text-orange-700",
  "bg-sky-100 text-sky-700",
  "bg-emerald-100 text-emerald-700",
  "bg-violet-100 text-violet-700",
  "bg-rose-100 text-rose-700",
  "bg-amber-100 text-amber-700",
];

function hashName(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return hash;
}

export function Avatar({ name, size = "md" }: { name: string; size?: "sm" | "md" }) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  const palette = PALETTE[hashName(name) % PALETTE.length];
  const dimensions = size === "sm" ? "h-7 w-7 text-[11px]" : "h-9 w-9 text-xs";

  return (
    <div className={`grid shrink-0 place-items-center rounded-[9px] font-semibold ${palette} ${dimensions}`}>
      {initials}
    </div>
  );
}
