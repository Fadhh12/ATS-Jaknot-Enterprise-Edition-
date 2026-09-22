const today = new Date();

export function Topbar() {
  return (
    <header className="flex items-center justify-between border-b border-slate-200/80 bg-white/70 px-8 py-3.5 backdrop-blur">
      <div>
        <p className="text-xs text-slate-400">
          {today.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative hidden sm:block">
          <svg
            viewBox="0 0 20 20"
            fill="none"
            className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          >
            <circle cx="9" cy="9" r="5.5" stroke="currentColor" strokeWidth="1.6" />
            <path d="m17 17-3.5-3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          <input
            placeholder="Search requisitions, candidates..."
            className="w-64 rounded-pill border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-navy/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy/10 transition-colors"
          />
        </div>

        <button
          aria-label="Notifications"
          className="relative grid h-9 w-9 place-items-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 active:scale-95"
        >
          <svg viewBox="0 0 20 20" fill="none" className="h-[18px] w-[18px]">
            <path
              d="M5 8a5 5 0 0 1 10 0c0 3.2 1 4.3 1.4 4.8.3.3.1.9-.4.9H4c-.5 0-.7-.6-.4-.9C4 12.3 5 11.2 5 8Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <path d="M8.2 16a1.8 1.8 0 0 0 3.6 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-accent-orange ring-2 ring-white" />
        </button>

        <div className="grid h-9 w-9 place-items-center rounded-[10px] bg-navy text-xs font-semibold text-white">
          NR
        </div>
      </div>
    </header>
  );
}
