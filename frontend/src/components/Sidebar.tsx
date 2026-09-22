import Link from "next/link";

const activeLinks = [
  { href: "/", label: "Dashboard" },
  { href: "/requisitions", label: "Job Requisitions" },
  { href: "/candidates", label: "Candidate Database" },
];

const lockedLinks = [
  "Workforce Planning",
  "Sourcing",
  "Interview Scheduling",
  "Offer & Preboarding",
  "Reports & Analytics",
];

export function Sidebar() {
  return (
    <aside className="w-64 shrink-0 bg-navy text-white flex flex-col">
      <div className="px-6 py-5 text-lg font-semibold tracking-wide border-b border-white/10">
        Jaknot ATS
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {activeLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="block rounded-md px-3 py-2 text-sm font-medium text-white/90 hover:bg-navy-dark hover:text-white transition-colors"
          >
            {link.label}
          </Link>
        ))}
        <div className="pt-4 mt-4 border-t border-white/10">
          <p className="px-3 pb-2 text-xs uppercase tracking-wider text-white/40">
            Coming soon
          </p>
          {lockedLinks.map((label) => (
            <div
              key={label}
              className="flex items-center justify-between rounded-md px-3 py-2 text-sm text-white/30 cursor-not-allowed"
            >
              <span>{label}</span>
              <span aria-hidden>🔒</span>
            </div>
          ))}
        </div>
      </nav>
    </aside>
  );
}
