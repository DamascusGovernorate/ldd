"use client";

/* Hand-built park artwork in the same illustrated register as the rest of
   the UI — used whenever a mission has no uploaded photography, so the
   screens never fall back to mismatched stock imagery. */

function Palm({ x, y, s = 1 }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M0 0 C-2 -14 -3 -26 -1 -38" stroke="#8a5a2b" strokeWidth="5" fill="none" strokeLinecap="round" />
      <g fill="#2e9c53">
        <path d="M-1 -38c-10-6-18-4-23 2 8-1 15 1 21 5z" />
        <path d="M-1 -38c10-6 18-4 23 2-8-1-15 1-21 5z" />
        <path d="M-1 -38c-4-10-12-14-20-13 6 4 11 9 15 16z" />
        <path d="M-1 -38c4-10 12-14 20-13-6 4-11 9-15 16z" />
        <path d="M-1 -38c1-9 6-15 14-18-4 6-7 12-8 20z" />
      </g>
    </g>
  );
}

function Bush({ x, y, s = 1 }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} fill="#3aa85f">
      <circle cx="-8" cy="0" r="9" />
      <circle cx="4" cy="-4" r="11" />
      <circle cx="14" cy="1" r="8" />
    </g>
  );
}

export function ParkScene({ variant = 0, style, className = "" }) {
  const skies = [
    ["#bfe4ff", "#eaf6ff"],
    ["#ffd9a8", "#ffeed6"],
    ["#c9e0ff", "#f0f7ff"],
  ];
  const [skyA, skyB] = skies[variant % skies.length];

  return (
    <svg viewBox="0 0 360 170" preserveAspectRatio="xMidYMid slice" className={className} style={style} aria-hidden="true">
      <defs>
        <linearGradient id={`sky-${variant}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={skyA} />
          <stop offset="100%" stopColor={skyB} />
        </linearGradient>
      </defs>

      <rect width="360" height="170" fill={`url(#sky-${variant})`} />

      {/* skyline */}
      <g fill="#c3cede" opacity="0.85">
        <rect x="12" y="56" width="42" height="46" rx="4" />
        <rect x="60" y="42" width="30" height="60" rx="4" />
        <rect x="272" y="50" width="38" height="52" rx="4" />
        <rect x="316" y="62" width="30" height="40" rx="4" />
      </g>

      {/* grass */}
      <path d="M0 96c60-12 120-12 180-4s120 10 180 2v76H0z" fill="#5cb85f" />
      <path d="M0 118c70-8 130 2 190 8s110 2 170-4v48H0z" fill="#47a44c" />

      {/* path */}
      <path d="M126 170c8-30 30-44 58-52 26-8 44-16 50-32" stroke="#e3d6b4" strokeWidth="22" fill="none" strokeLinecap="round" />

      {/* playground */}
      <g>
        <rect x="196" y="86" width="46" height="30" rx="5" fill="#e2603f" />
        <path d="M196 116 176 142" stroke="#f2b134" strokeWidth="9" strokeLinecap="round" />
        <path d="M242 86v30" stroke="#3b6fb5" strokeWidth="6" strokeLinecap="round" />
        <path d="M200 86l20-14 20 14z" fill="#3b6fb5" />
      </g>

      {/* bench */}
      <g transform="translate(56 124)">
        <rect x="0" y="0" width="42" height="6" rx="3" fill="#a9713c" />
        <rect x="0" y="-10" width="42" height="6" rx="3" fill="#c18548" />
        <rect x="3" y="6" width="4" height="10" fill="#7c5228" />
        <rect x="35" y="6" width="4" height="10" fill="#7c5228" />
      </g>

      <Palm x={40} y={104} s={1.05} />
      <Palm x={300} y={112} s={0.9} />
      <Palm x={266} y={96} s={0.7} />
      <Bush x={140} y={130} s={0.9} />
      <Bush x={318} y={140} s={1} />

      {/* two volunteers */}
      <g>
        <circle cx="150" cy="112" r="7" fill="#f3c08a" />
        <path d="M143 122a7 8 0 0 1 14 0v14h-14z" fill="#2f86e8" />
        <circle cx="172" cy="118" r="6.5" fill="#c88b56" />
        <path d="M166 128a6 7 0 0 1 12 0v12h-12z" fill="#25a44d" />
      </g>
    </svg>
  );
}

export function PhotoThumb({ src, variant = 0, style }) {
  const base = {
    display: "block",
    width: "100%",
    aspectRatio: "4 / 3",
    objectFit: "cover",
    borderRadius: 12,
    border: "2.5px solid var(--xpg-outline)",
    ...style,
  };
  if (src) return <img src={src} alt="" style={base} />;
  return <ParkScene variant={variant} style={{ ...base, background: "#dff0ff" }} />;
}
