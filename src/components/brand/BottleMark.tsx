/** Editorial bottle mark — a cream drop, not a product photograph. */
export function BottleMark({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 220 420"
      className={className}
      role="img"
      aria-label="Casa Kilicé glow drop"
    >
      <defs>
        <linearGradient id="ck-glass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fffaf4" />
          <stop offset="42%" stopColor="#f3d7c4" />
          <stop offset="100%" stopColor="#e7b89a" />
        </linearGradient>
        <linearGradient id="ck-liquid" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff6ee" />
          <stop offset="100%" stopColor="#e8b896" />
        </linearGradient>
      </defs>
      <rect x="78" y="18" width="64" height="28" rx="6" fill="#2c241e" />
      <rect x="88" y="44" width="44" height="18" rx="3" fill="#c4a48c" />
      <path
        d="M62 78h96c8 0 16 8 18 20l16 250c2 28-18 50-46 50H74c-28 0-48-22-46-50L44 98c2-12 10-20 18-20z"
        fill="url(#ck-glass)"
        stroke="#2c241e"
        strokeOpacity="0.18"
      />
      <path
        d="M70 168h84c4 70 8 140 2 200-8 22-22 34-44 34s-38-12-46-34c-6-60-2-130 4-200z"
        fill="url(#ck-liquid)"
        opacity="0.92"
      />
      <ellipse cx="92" cy="210" rx="10" ry="36" fill="#fff" opacity="0.45" />
      <text
        x="110"
        y="250"
        textAnchor="middle"
        fill="#2c241e"
        fontFamily="Georgia, serif"
        fontSize="13"
        letterSpacing="2"
      >
        CK
      </text>
    </svg>
  );
}
