/**
 * Brand mark derived from the Jaknot logo: a lowercase "j" stem + dot in
 * brand blue, rendered as a badge (for the favicon / standalone use) or bare
 * (for placement directly on the navy sidebar).
 */
export function JaknotMark({ size = 32, bare = false }: { size?: number; bare?: boolean }) {
  if (bare) {
    return (
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden>
        <circle cx="11.5" cy="7" r="2.4" fill="#4A90D2" />
        <path
          d="M12 12v11.5c0 3.6-2 5.5-5.5 5.5"
          stroke="#4A90D2"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
    );
  }

  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden>
      <rect width="32" height="32" rx="8" fill="#1B365D" />
      <circle cx="12" cy="9.5" r="1.9" fill="#4A90D2" />
      <path
        d="M12.4 13.5v9.2c0 2.9-1.6 4.4-4.4 4.4"
        stroke="#4A90D2"
        strokeWidth="3.2"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="21.5" cy="19" r="3.6" fill="none" stroke="#FF6B35" strokeWidth="2.6" />
    </svg>
  );
}

export function JaknotWordmark({ className = "", size = "text-xl" }: { className?: string; size?: string }) {
  return (
    <span className={`${size} font-extrabold tracking-tight ${className}`}>
      <span className="text-brand-blue">jak</span>
      <span className="text-accent-orange">not</span>
    </span>
  );
}
