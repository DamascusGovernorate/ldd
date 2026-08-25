"use client";

import { IconHome, IconMedal, IconChart, IconStar, IconUser, IconChevronStart, IconTrophy } from "./icons";
import { formatXP } from "./lib";

/* ------------------------------------------------------------------
   Headers
------------------------------------------------------------------- */

/** Screen header with a back chevron on the left, centred title, optional action. */
export function GameHeader({ title, onBack, action, align = "center", start = null }) {
  return (
    <header className="xpg-header">
      {onBack ? (
        <button type="button" className="xpg-iconbtn" onClick={onBack} aria-label="رجوع">
          <IconChevronStart size={20} />
        </button>
      ) : (
        start || <span style={{ width: 38 }} />
      )}

      <h1
        className="xpg-heading"
        style={{
          flex: 1,
          margin: 0,
          color: "#fff",
          fontSize: 19,
          fontWeight: 900,
          textAlign: align,
          textShadow: "0 2px 0 rgba(4,24,58,.45)",
        }}
      >
        {title}
      </h1>

      {action || <span style={{ width: 38 }} />}
    </header>
  );
}

/* ------------------------------------------------------------------
   Cards & surfaces
------------------------------------------------------------------- */

export function GameCard({ tone = "cream", as: Tag = "div", className = "", style, children, ...rest }) {
  const toneClass = tone === "blue" ? " xpg-card--blue" : tone === "navy" ? " xpg-card--navy" : "";
  return (
    <Tag className={`xpg-card${toneClass} ${className}`} style={style} {...rest}>
      {children}
    </Tag>
  );
}

export function IconTile({ icon: Icon, color = "var(--xpg-sky)", size = 46, radius, iconSize, className = "" }) {
  return (
    <span
      className={`xpg-tile ${className}`}
      style={{
        width: size,
        height: size,
        borderRadius: radius ?? Math.round(size * 0.32),
        background: `linear-gradient(180deg, color-mix(in srgb, ${color} 82%, #fff) 0%, ${color} 100%)`,
      }}
    >
      <Icon size={iconSize ?? Math.round(size * 0.58)} />
    </span>
  );
}

export function Pill({ color = "var(--xpg-green)", filled = true, children, style }) {
  return (
    <span
      className="xpg-pill"
      style={
        filled
          ? { background: color, color: "#fff", borderColor: "rgba(7,32,74,.28)", ...style }
          : { background: `color-mix(in srgb, ${color} 16%, transparent)`, color, borderColor: `color-mix(in srgb, ${color} 40%, transparent)`, ...style }
      }
    >
      {children}
    </span>
  );
}

export function XPBadge({ amount, prefix = "+", color = "var(--xpg-green)", tone = "soft" }) {
  const soft = tone === "soft";
  return (
    <span
      className="xpg-xp"
      style={{
        background: soft ? `color-mix(in srgb, ${color} 18%, #fff)` : color,
        color: soft ? `color-mix(in srgb, ${color} 78%, #000)` : "#fff",
        borderColor: `color-mix(in srgb, ${color} 45%, transparent)`,
      }}
    >
      {prefix}
      {formatXP(amount)} XP
    </span>
  );
}

export function StatCard({ label, value, tone = "navy" }) {
  return (
    <GameCard
      tone={tone}
      className="xpg-card--flat"
      style={{ borderRadius: 14, padding: "8px 6px", textAlign: "center", borderWidth: 2.5 }}
    >
      <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: "var(--xpg-on-blue-muted)" }}>{label}</p>
      <p className="xpg-num" style={{ margin: "2px 0 0", fontSize: 19, fontWeight: 900, color: "#fff" }}>
        {value}
      </p>
    </GameCard>
  );
}

/* ------------------------------------------------------------------
   Buttons & tabs
------------------------------------------------------------------- */

export function GameButton({ variant = "cream", size, block, className = "", children, ...rest }) {
  const cls = [
    "xpg-btn",
    `xpg-btn--${variant}`,
    size ? `xpg-btn--${size}` : "",
    block ? "xpg-btn--block" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <button type="button" className={cls} {...rest}>
      {children}
    </button>
  );
}

/** RTL segmented control — first item renders on the right, like the reference. */
export function SegmentedTabs({ items, value, onChange, tone = "dark" }) {
  return (
    <div className={`xpg-seg${tone === "cream" ? " xpg-seg--cream" : ""}`} dir="rtl" role="tablist">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          role="tab"
          aria-selected={value === item.id}
          className={`xpg-seg__item${value === item.id ? " is-active" : ""}`}
          onClick={() => onChange(item.id)}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

export function ChipRow({ items, value, onChange, leading = null }) {
  return (
    <div className="xpg-chiprow" dir="rtl">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          className={`xpg-chip${value === item.id ? " is-active" : ""}`}
          onClick={() => onChange(item.id)}
        >
          {item.label}
        </button>
      ))}
      {leading}
    </div>
  );
}

/* ------------------------------------------------------------------
   Progress
------------------------------------------------------------------- */

export function ProgressBar({ value = 0, color = "var(--xpg-green)", height = 10, onBlue = false }) {
  const pct = Math.max(0, Math.min(100, Number(value) || 0));
  return (
    <div className={`xpg-bar${onBlue ? " xpg-bar--onblue" : ""}`} style={{ height }} role="progressbar" aria-valuenow={pct}>
      <div
        className="xpg-bar__fill"
        style={{
          width: `${pct}%`,
          background: `linear-gradient(180deg, color-mix(in srgb, ${color} 72%, #fff) 0%, ${color} 100%)`,
        }}
      />
    </div>
  );
}

/* ------------------------------------------------------------------
   Avatars
------------------------------------------------------------------- */

const AVATAR_COLORS = ["#f2a03d", "#e0574f", "#4f9ce0", "#67b45a", "#a173e8", "#e08bb0", "#3fb8a8"];

function hashString(str = "") {
  let h = 0;
  for (let i = 0; i < str.length; i += 1) h = (h * 31 + str.charCodeAt(i)) % 100000;
  return h;
}

export function Avatar({ name = "", src, size = 34, style, className = "" }) {
  const color = AVATAR_COLORS[hashString(name) % AVATAR_COLORS.length];
  const initial = (name.trim()[0] || "؟").toUpperCase();
  return (
    <span
      className={`xpg-avatar ${className}`}
      title={name || undefined}
      style={{ width: size, height: size, background: src ? "#0d4bb0" : color, fontSize: Math.round(size * 0.44), ...style }}
    >
      {src ? <img src={src} alt="" /> : initial}
    </span>
  );
}

export function AvatarStack({ people = [], max = 5, size = 30, extra }) {
  const shown = people.slice(0, max);
  const rest = extra ?? Math.max(0, people.length - shown.length);
  return (
    <div className="xpg-stack">
      {shown.map((p, i) => (
        <Avatar key={p.id || i} name={p.name} src={p.avatar} size={size} />
      ))}
      {rest > 0 && (
        <span
          className="xpg-avatar xpg-num"
          style={{ width: size, height: size, background: "var(--xpg-navy)", fontSize: Math.round(size * 0.38) }}
        >
          +{rest}
        </span>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------
   Rank medals (top three get metal, the rest a plain numeral)
------------------------------------------------------------------- */

const MEDALS = [
  { face: "#ffd24a", edge: "#c98a00" },
  { face: "#dfe6ee", edge: "#93a3b5" },
  { face: "#e6a463", edge: "#a86a2c" },
];

export function RankMedal({ rank, size = 34 }) {
  const medal = MEDALS[rank - 1];
  if (!medal) {
    return (
      <span
        className="xpg-num"
        style={{ width: size, textAlign: "center", fontWeight: 900, fontSize: 16, color: "var(--xpg-muted)" }}
      >
        {rank}
      </span>
    );
  }
  return (
    <span
      className="xpg-tile xpg-tile--round xpg-num"
      style={{
        width: size,
        height: size,
        background: `linear-gradient(180deg, color-mix(in srgb, ${medal.face} 80%, #fff), ${medal.face})`,
        borderColor: medal.edge,
        color: "#4a3400",
        fontSize: 13,
        fontWeight: 900,
      }}
    >
      {rank === 1 ? <IconTrophy size={17} /> : rank}
    </span>
  );
}

/* ------------------------------------------------------------------
   Bottom navigation — LTR order, exactly as in the reference
------------------------------------------------------------------- */

export const NAV_ITEMS = [
  { id: "home", label: "الرئيسية", icon: IconHome },
  { id: "challenges", label: "التحديات", icon: IconMedal },
  { id: "leaderboard", label: "الترتيب", icon: IconChart },
  { id: "rewards", label: "الجوائز", icon: IconStar },
  { id: "profile", label: "الحساب", icon: IconUser },
];

export function BottomNavigation({ value, onChange }) {
  return (
    <nav className="xpg-nav" aria-label="التنقل الرئيسي">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const active = value === item.id;
        return (
          <button
            key={item.id}
            type="button"
            aria-current={active ? "page" : undefined}
            className={`xpg-nav__item${active ? " is-active" : ""}`}
            onClick={() => onChange(item.id)}
          >
            <span className="xpg-nav__icon">
              <Icon size={20} />
            </span>
            {item.label}
          </button>
        );
      })}
    </nav>
  );
}

/* ------------------------------------------------------------------
   Desktop side rail — replaces the bottom bar from 1024px up.
   Same NAV_ITEMS, so the two can never drift apart.
------------------------------------------------------------------- */

export function SideNavigation({ value, onChange, user, onProfile, title = "تحدي الأحياء" }) {
  return (
    <aside className="xpg-rail" aria-label="التنقل الرئيسي">
      <div className="xpg-rail__brand">
        <IconTile icon={IconStar} color="var(--xpg-gold)" size={38} radius={13} />
        <span style={{ fontSize: 16, fontWeight: 900, color: "#fff" }}>{title}</span>
      </div>

      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const active = value === item.id;
        return (
          <button
            key={item.id}
            type="button"
            aria-current={active ? "page" : undefined}
            className={`xpg-rail__item${active ? " is-active" : ""}`}
            onClick={() => onChange(item.id)}
          >
            <span className="xpg-rail__icon">
              <Icon size={19} />
            </span>
            {item.label}
          </button>
        );
      })}

      {user && (
        <div className="xpg-rail__foot">
          <button type="button" className="xpg-rail__item" onClick={onProfile}>
            <Avatar name={user.name} src={user.avatar} size={34} />
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.name}</span>
          </button>
        </div>
      )}
    </aside>
  );
}

/* ------------------------------------------------------------------
   Empty state — an invitation to act, never a shrug
------------------------------------------------------------------- */

export function EmptyState({ title, hint, action }) {
  return (
    <GameCard style={{ padding: "26px 20px", textAlign: "center" }}>
      <p style={{ margin: 0, fontWeight: 900, fontSize: 15 }}>{title}</p>
      {hint && <p style={{ margin: "6px 0 0", fontSize: 13, color: "var(--xpg-muted)" }}>{hint}</p>}
      {action && <div style={{ marginTop: 14 }}>{action}</div>}
    </GameCard>
  );
}
