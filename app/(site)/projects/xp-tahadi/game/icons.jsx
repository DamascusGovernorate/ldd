"use client";

/* Filled, chunky game icons — deliberately not thin line icons, to match
   the reference's illustrated look. Every icon uses currentColor. */

function Solid({ size = 24, children, ...rest }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...rest}>
      {children}
    </svg>
  );
}

function Line({ size = 24, width = 2.2, children, ...rest }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={width}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {children}
    </svg>
  );
}

/* ---------- navigation ---------- */

export const IconHome = (p) => (
  <Solid {...p}>
    <path d="M11.3 2.7a1 1 0 0 1 1.4 0l8.1 7.4a1 1 0 0 1 .3.7V20a2 2 0 0 1-2 2h-4.4v-5.6H9.3V22H4.9a2 2 0 0 1-2-2v-9.2a1 1 0 0 1 .3-.7z" />
  </Solid>
);

export const IconMedal = (p) => (
  <Solid {...p}>
    <path d="M7.2 2h3.1l2.2 5.3-3 .8z" />
    <path d="M16.8 2h-3.1l-2.2 5.3 3 .8z" />
    <path d="M12 8.4a6.8 6.8 0 1 0 0 13.6 6.8 6.8 0 0 0 0-13.6zm0 2.8 1.2 2.4 2.6.4-1.9 1.9.5 2.6-2.4-1.3-2.4 1.3.5-2.6L8.2 14l2.6-.4z" />
  </Solid>
);

export const IconChart = (p) => (
  <Solid {...p}>
    <rect x="3.2" y="12.2" width="4.6" height="8.6" rx="1.5" />
    <rect x="9.7" y="6.4" width="4.6" height="14.4" rx="1.5" />
    <rect x="16.2" y="9.6" width="4.6" height="11.2" rx="1.5" />
  </Solid>
);

export const IconStar = (p) => (
  <Solid {...p}>
    <path d="M12 2.3l2.9 6 6.6.9-4.8 4.6 1.2 6.6L12 17.3l-5.9 3.1 1.2-6.6-4.8-4.6 6.6-.9z" />
  </Solid>
);

export const IconUser = (p) => (
  <Solid {...p}>
    <circle cx="12" cy="7.6" r="4.3" />
    <path d="M3.6 21.3a8.4 8.4 0 0 1 16.8 0 .7.7 0 0 1-.7.7H4.3a.7.7 0 0 1-.7-.7z" />
  </Solid>
);

/* ---------- chrome ---------- */

export const IconBell = (p) => (
  <Solid {...p}>
    <path d="M12 2a6.2 6.2 0 0 0-6.2 6.2v3.3l-1.6 3.4a1 1 0 0 0 .9 1.4h13.8a1 1 0 0 0 .9-1.4l-1.6-3.4V8.2A6.2 6.2 0 0 0 12 2z" />
    <path d="M9.4 18.1a2.6 2.6 0 0 0 5.2 0z" />
  </Solid>
);

export const IconGear = (p) => (
  <Line {...p}>
    <circle cx="12" cy="12" r="3.1" />
    <path d="M19.1 14.4a1.6 1.6 0 0 0 .3 1.8l.1.1a1.9 1.9 0 1 1-2.7 2.7l-.1-.1a1.6 1.6 0 0 0-2.7 1.1v.3a1.9 1.9 0 1 1-3.8 0v-.2a1.6 1.6 0 0 0-2.8-1.1l-.1.1a1.9 1.9 0 1 1-2.7-2.7l.1-.1a1.6 1.6 0 0 0-1.1-2.7H3.4a1.9 1.9 0 1 1 0-3.8h.2a1.6 1.6 0 0 0 1.1-2.8l-.1-.1a1.9 1.9 0 1 1 2.7-2.7l.1.1a1.6 1.6 0 0 0 2.7-1.1V3.4a1.9 1.9 0 1 1 3.8 0v.2a1.6 1.6 0 0 0 2.7 1.1l.1-.1a1.9 1.9 0 1 1 2.7 2.7l-.1.1a1.6 1.6 0 0 0 1.1 2.7h.3a1.9 1.9 0 1 1 0 3.8h-.2a1.6 1.6 0 0 0-1.4 1z" />
  </Line>
);

export const IconChevronStart = (p) => (
  <Line width={2.8} {...p}>
    <path d="M15 4.5 7.6 12 15 19.5" />
  </Line>
);

export const IconClose = (p) => (
  <Line width={2.8} {...p}>
    <path d="M6.2 6.2 17.8 17.8M17.8 6.2 6.2 17.8" />
  </Line>
);

export const IconShare = (p) => (
  <Line {...p}>
    <circle cx="17.8" cy="5.4" r="2.6" />
    <circle cx="6.2" cy="12" r="2.6" />
    <circle cx="17.8" cy="18.6" r="2.6" />
    <path d="M8.5 10.7 15.5 6.7M8.5 13.3l7 4" />
  </Line>
);

export const IconFilter = (p) => (
  <Solid {...p}>
    <path d="M3.1 5.4A1 1 0 0 1 4 4h16a1 1 0 0 1 .8 1.6l-6.1 7.6v5.2a1 1 0 0 1-.6.9l-3.3 1.4a1 1 0 0 1-1.4-.9v-6.6L3.3 6.1a1 1 0 0 1-.2-.7z" />
  </Solid>
);

export const IconClock = (p) => (
  <Line {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 6.8V12l3.4 2" />
  </Line>
);

export const IconPinSmall = (p) => (
  <Solid {...p}>
    <path d="M12 22s7.2-6.9 7.2-12.4A7.2 7.2 0 0 0 4.8 9.6C4.8 15.1 12 22 12 22z" />
    <circle cx="12" cy="9.5" r="2.7" fill="#fff" />
  </Solid>
);

export const IconLock = (p) => (
  <Solid {...p}>
    <path d="M8.2 9.6V7.4a3.8 3.8 0 1 1 7.6 0v2.2h-2.3V7.4a1.5 1.5 0 1 0-3 0v2.2z" />
    <rect x="4.8" y="9.4" width="14.4" height="11.6" rx="3.2" />
  </Solid>
);

export const IconQuestion = (p) => (
  <Line width={2.6} {...p}>
    <path d="M9.2 9.1a2.9 2.9 0 1 1 4 2.7c-.9.4-1.3 1.2-1.3 2.1v.5" />
    <path d="M12 18.2h.01" />
  </Line>
);

/* ---------- categories ---------- */

export const IconRecycle = (p) => (
  <Solid {...p}>
    <g>
      <path d="M12 2.6l3.4 5.9h-2.1v3.1h-2.6V8.5H8.6z" />
      <path d="M12 2.6l3.4 5.9h-2.1v3.1h-2.6V8.5H8.6z" transform="rotate(120 12 12)" />
      <path d="M12 2.6l3.4 5.9h-2.1v3.1h-2.6V8.5H8.6z" transform="rotate(240 12 12)" />
    </g>
  </Solid>
);

export const IconPlayground = (p) => (
  <Line width={2.4} {...p}>
    <path d="M3 20.4h18" />
    <path d="M6.4 20.4V7.2M6.4 7.2l4.6 2.6" />
    <path d="M5 10.6h2.8M5 14h2.8M5 17.4h2.8" />
    <path d="M11 9.8c4.4 1.5 6.6 5 7.4 10.6" />
    <circle cx="12.6" cy="5.6" r="1.9" fill="currentColor" stroke="none" />
  </Line>
);

export const IconAccess = (p) => (
  <Solid {...p}>
    <circle cx="13" cy="4.4" r="2.2" />
    <path d="M9.4 7.6h6.4a1.2 1.2 0 0 1 0 2.4h-2.2v2.6h3.1a1.3 1.3 0 0 1 1.2.8l2.2 5.4-2.2.9-1.9-4.7h-3.8a1.6 1.6 0 0 1-1.6-1.6V9.9a2.3 2.3 0 0 1-1.2-2.3z" />
    <path
      d="M13.8 13.9a5.3 5.3 0 1 1-5.7-1.6"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
    />
  </Solid>
);

export const IconBasketball = (p) => (
  <Line width={2.1} {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3v18" />
    <path d="M5.6 5.6c3.5 3.5 3.5 9.3 0 12.8M18.4 5.6c-3.5 3.5-3.5 9.3 0 12.8" />
  </Line>
);

export const IconCamera = (p) => (
  <Solid {...p}>
    <path d="M9 3.4h6l1.5 2.2H20a2.2 2.2 0 0 1 2.2 2.2v10.6A2.2 2.2 0 0 1 20 20.6H4A2.2 2.2 0 0 1 1.8 18.4V7.8A2.2 2.2 0 0 1 4 5.6h3.5z" />
    <circle cx="12" cy="12.8" r="4.4" fill="#fff" />
    <circle cx="12" cy="12.8" r="2.4" />
  </Solid>
);

export const IconUsers = (p) => (
  <Solid {...p}>
    <circle cx="8.6" cy="8" r="3.5" />
    <circle cx="16.4" cy="9.2" r="2.9" />
    <path d="M1.9 19.4a6.7 6.7 0 0 1 13.4 0 .8.8 0 0 1-.8.8H2.7a.8.8 0 0 1-.8-.8z" />
    <path d="M16.1 14.2a5.6 5.6 0 0 1 5.9 5.2.8.8 0 0 1-.8.8h-3.6a8.5 8.5 0 0 0-1.5-6z" />
  </Solid>
);

export const IconCheck = (p) => (
  <Line width={3} {...p}>
    <path d="M5.4 12.6 10 17.2l8.6-9.4" />
  </Line>
);

export const IconLeaf = (p) => (
  <Solid {...p}>
    <path d="M20.8 3.2C9.5 3.2 4 8.8 4 15c0 2 .6 3.6 1.6 4.7 1.8-3.6 4.9-6.6 8.9-8.1-3.1 2.1-5.6 4.9-7 8.4 1.1.4 2.3.6 3.5.6 6.7 0 11.2-6.1 9.8-17.4z" />
  </Solid>
);

export const IconCup = (p) => (
  <Solid {...p}>
    <path d="M3.4 5.4h11.4v9.4a4.6 4.6 0 0 1-4.6 4.6H8a4.6 4.6 0 0 1-4.6-4.6z" />
    <path
      d="M15.2 7.8h2.4a2.9 2.9 0 0 1 0 5.8h-2.4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
    />
    <rect x="2.4" y="20" width="13.4" height="1.9" rx="0.9" />
  </Solid>
);

export const IconCoffee = (p) => (
  <Solid {...p}>
    <path d="M4 8.6h11v7.2a4.4 4.4 0 0 1-4.4 4.4H8.4A4.4 4.4 0 0 1 4 15.8z" />
    <path d="M15.4 10.6h1.8a2.6 2.6 0 0 1 0 5.2h-1.8" fill="none" stroke="currentColor" strokeWidth="2" />
    <path
      d="M7.6 5.6c0-1 .9-1.2.9-2.2M11.4 5.6c0-1 .9-1.2.9-2.2"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
    />
  </Solid>
);

export const IconShirt = (p) => (
  <Solid {...p}>
    <path d="M8.6 2.8 4 5.2l1.9 4.6 2-.9v11.3h8.2V8.9l2 .9L20 5.2l-4.6-2.4-1.7 1.9a2.4 2.4 0 0 1-3.4 0z" />
  </Solid>
);

export const IconCertificate = (p) => (
  <Solid {...p}>
    <rect x="3" y="3.4" width="18" height="13" rx="2.4" />
    <rect x="5.8" y="6.6" width="8.2" height="1.7" rx="0.85" fill="#fff" />
    <rect x="5.8" y="10" width="6" height="1.7" rx="0.85" fill="#fff" />
    <circle cx="17" cy="17.8" r="3.4" />
    <path d="M15 20.2v3.2l2-1.2 2 1.2v-3.2z" />
  </Solid>
);

export const IconShield = (p) => (
  <Solid {...p}>
    <path d="M12 2.2 20.2 5v6.4c0 5.1-3.4 8.9-8.2 10.6-4.8-1.7-8.2-5.5-8.2-10.6V5z" />
  </Solid>
);

export const IconTrophy = (p) => (
  <Solid {...p}>
    <path d="M6.6 3h10.8v4.2a5.4 5.4 0 0 1-10.8 0z" />
    <path d="M6.6 4.6H3.4v1.2a3.6 3.6 0 0 0 3.2 3.6zM17.4 4.6h3.2v1.2a3.6 3.6 0 0 1-3.2 3.6z" />
    <rect x="10.4" y="12.4" width="3.2" height="4" />
    <rect x="6.8" y="18.4" width="10.4" height="2.8" rx="1.2" />
  </Solid>
);

export const IconSprout = (p) => (
  <Solid {...p}>
    <path d="M11 21.4V13c-2.9 0-5.2-2.3-5.2-5.2V6.2h1.6c2.9 0 5.2 2.3 5.2 5.2v.5c.4-2.5 2.6-4.4 5.2-4.4h1.4v1.4c0 2.9-2.3 5.2-5.2 5.2H13v7.3z" />
  </Solid>
);

export const IconFlag = (p) => (
  <Solid {...p}>
    <rect x="4" y="2.6" width="2.4" height="19" rx="1.2" />
    <path d="M7.4 3.6h11.2a.9.9 0 0 1 .7 1.5L17 8.4l2.3 3.3a.9.9 0 0 1-.7 1.5H7.4z" />
  </Solid>
);

/* ---------- map controls ---------- */

export const IconPlus = (p) => (
  <Line width={3} {...p}>
    <path d="M12 5.5v13M5.5 12h13" />
  </Line>
);

export const IconMinus = (p) => (
  <Line width={3} {...p}>
    <path d="M5.5 12h13" />
  </Line>
);

export const IconTarget = (p) => (
  <Line width={2.4} {...p}>
    <circle cx="12" cy="12" r="7" />
    <circle cx="12" cy="12" r="1.6" fill="currentColor" />
    <path d="M12 2.4v3.2M12 18.4v3.2M2.4 12h3.2M18.4 12h3.2" />
  </Line>
);
