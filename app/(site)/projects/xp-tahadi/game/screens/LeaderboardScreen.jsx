"use client";

import { useState } from "react";
import { useGame } from "../context";
import { Avatar, EmptyState, GameCard, GameHeader, RankMedal, SegmentedTabs } from "../ui";
import { formatXP } from "../lib";

/* Two boards, because two are what the data supports: the User collection
   and the neighborhood totals derived from it. A "teams" board needs a
   Team model first. */
const SCOPES = [
  { id: "districts", label: "الأحياء" },
  { id: "people", label: "الأفراد" },
];

function Row({ rank, name, sub, xp, avatar, showAvatar, highlight }) {
  return (
    <div
      dir="ltr"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 11,
        padding: "11px 13px",
        background: highlight ? "linear-gradient(180deg,#d6e8ff,#bfdcff)" : "transparent",
      }}
    >
      <RankMedal rank={rank} />
      {showAvatar && <Avatar name={name} src={avatar} size={36} />}
      <div style={{ flex: 1, minWidth: 0 }} dir="rtl">
        <p style={{ margin: 0, fontSize: 14.5, fontWeight: 900, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {name}
        </p>
        {sub && <p style={{ margin: 0, fontSize: 11.5, fontWeight: 700, color: "var(--xpg-muted)" }}>{sub}</p>}
      </div>
      <span className="xpg-num" style={{ fontSize: 14, fontWeight: 900, color: "var(--xpg-sky-deep)" }}>
        {formatXP(xp)} XP
      </span>
    </div>
  );
}

export default function LeaderboardScreen() {
  const { me, users, neighborhoods } = useGame();
  const [scope, setScope] = useState("districts");

  const rows =
    scope === "districts"
      ? neighborhoods.map((n, i) => ({
          key: n.neighborhood,
          rank: i + 1,
          name: n.neighborhood,
          sub: `${n.members} مشترك · ${n.missions} مهمة`,
          xp: n.xpPoints,
          highlight: n.neighborhood === me.neighborhood,
        }))
      : users.map((u, i) => ({
          key: u.id,
          rank: i + 1,
          name: u.name,
          sub: u.neighborhood || undefined,
          xp: u.xpPoints,
          avatar: u.avatar,
          showAvatar: true,
          highlight: u.id === me.id,
        }));

  return (
    <div className="xpg-bluebg xpg-enter" style={{ minHeight: "100%", paddingBottom: 18 }}>
      <GameHeader title="الترتيب" />

      <div className="xpg-page xpg-narrow">
        <SegmentedTabs items={SCOPES} value={scope} onChange={setScope} />

        {rows.length === 0 ? (
          <EmptyState title="الترتيب فارغ" hint="النقاط تُحتسب عند اعتماد إنجاز المهمات من لوحة التحكم." />
        ) : (
          <GameCard className="xpg-divide" style={{ padding: 0, overflow: "hidden" }}>
            {rows.map(({ key, ...row }) => (
              <Row key={key} {...row} />
            ))}
          </GameCard>
        )}
      </div>
    </div>
  );
}
