"use client";

import { useGame } from "../context";
import GameMap from "../GameMap";
import { Avatar, AvatarStack, GameButton, GameCard, IconTile, ProgressBar, StatCard, EmptyState } from "../ui";
import { IconBell, IconStar } from "../icons";
import { formatXP, levelOf } from "../lib";

export default function HomeScreen() {
  const { me, stats, missions, users, neighborhoods, openMission, push, setTab } = useGame();
  const level = levelOf(me.xpPoints);

  const home =
    neighborhoods.find((n) => n.neighborhood === me.neighborhood) || neighborhoods[0] || null;

  const homeMissions = home ? missions.filter((m) => m.neighborhood === home.neighborhood) : [];
  const homeDone = homeMissions.filter((m) => m.status === "closed").length;
  const homePercent = homeMissions.length ? Math.round((homeDone / homeMissions.length) * 100) : 0;
  const homeMembers = home ? users.filter((u) => u.neighborhood === home.neighborhood) : [];

  return (
    <div className="xpg-bluebg xpg-enter" style={{ minHeight: "100%", paddingBottom: 20 }}>
      <header className="xpg-header" style={{ gap: 8 }}>
        <IconTile icon={IconStar} color="var(--xpg-gold)" size={36} radius={12} />
        <h1
          style={{
            flex: 1,
            margin: 0,
            fontSize: 19,
            fontWeight: 900,
            color: "#fff",
            textShadow: "0 2px 0 rgba(4,24,58,.45)",
          }}
        >
          تحدي الأحياء
        </h1>
        <button
          type="button"
          className="xpg-iconbtn"
          onClick={() => push({ screen: "achievements" })}
          aria-label="نشاطي"
          style={{ position: "relative" }}
        >
          <IconBell size={19} />
          {stats.pending > 0 && (
            <span
              className="xpg-num"
              style={{
                position: "absolute",
                top: -5,
                insetInlineStart: -5,
                minWidth: 18,
                height: 18,
                padding: "0 4px",
                borderRadius: 999,
                background: "var(--xpg-red)",
                border: "2px solid var(--xpg-navy-deep)",
                fontSize: 10,
                fontWeight: 900,
                lineHeight: "14px",
              }}
            >
              {stats.pending}
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={() => setTab("profile")}
          aria-label="حسابي"
          style={{ border: 0, background: "transparent", padding: 0, cursor: "pointer" }}
        >
          <Avatar name={me.name} src={me.avatar} size={38} />
        </button>
      </header>

      <div className="xpg-page xpg-home">
        {/* ---- side column: becomes a sticky rail on desktop ---- */}
        <div className="xpg-home__side">
          <GameCard tone="navy" style={{ padding: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }} dir="rtl">
              <span
                className="xpg-tile xpg-tile--round"
                style={{
                  width: 58,
                  height: 58,
                  background: "linear-gradient(180deg,#ffe071,#ffb800)",
                  borderColor: "#7d5500",
                  color: "#8a5b00",
                }}
              >
                <IconStar size={30} />
              </span>
              <div style={{ flex: 1, textAlign: "right" }}>
                <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: "var(--xpg-on-blue-muted)" }}>
                  مستواك الحالي
                </p>
                <p style={{ margin: "1px 0 4px", fontSize: 22, fontWeight: 900, color: "#fff", lineHeight: 1.2 }}>
                  {level.title}
                </p>
                <p className="xpg-num" style={{ margin: 0, fontSize: 13, fontWeight: 800, color: "var(--xpg-gold-soft)" }}>
                  {level.isMax
                    ? `${formatXP(me.xpPoints)} XP — أعلى مستوى`
                    : `${formatXP(me.xpPoints)} XP / ${formatXP(level.next)} XP`}
                </p>
              </div>
            </div>
            <div style={{ marginTop: 10 }}>
              <ProgressBar value={level.progress} color="var(--xpg-gold)" height={12} onBlue />
            </div>
          </GameCard>

          <div dir="ltr" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
            <StatCard label="المهام المنجزة" value={stats.completed} />
            <StatCard label="مهام جارية" value={stats.active} />
            <StatCard label="ترتيب الحي" value={`#${stats.localRank}`} />
          </div>

          {/* The district summary lives beside the map, not on top of it —
              the map surface stays clear for panning and pins. */}
          {home && (
            <GameCard style={{ padding: "12px 14px" }}>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8 }} dir="rtl">
                <p style={{ margin: 0, fontSize: 16, fontWeight: 900 }}>{home.neighborhood}</p>
                <span className="xpg-num" style={{ fontSize: 14, fontWeight: 900, color: "var(--xpg-green-deep)" }}>
                  {homePercent}%
                </span>
              </div>
              <div style={{ margin: "8px 0 10px" }}>
                <ProgressBar value={homePercent} color="var(--xpg-green)" height={9} />
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }} dir="rtl">
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <AvatarStack people={homeMembers} max={3} size={26} />
                  <span className="xpg-num" style={{ fontSize: 12, fontWeight: 800, color: "var(--xpg-muted)" }}>
                    {homeMembers.length} مشترك · {homeMissions.length} مهمة
                  </span>
                </div>
                <GameButton variant="blue" size="sm" onClick={() => setTab("challenges")}>
                  عرض التفاصيل
                </GameButton>
              </div>
            </GameCard>
          )}
        </div>

        {/* ---- map column ---- */}
        <div className="xpg-home__main">
          <GameMap missions={missions} onSelect={openMission} activeNeighborhood={home?.neighborhood} />

          {missions.length === 0 && (
            <EmptyState title="لا توجد مهام منشورة بعد" hint="أضف أول مهمة من لوحة التحكم لتظهر على الخريطة." />
          )}
        </div>
      </div>
    </div>
  );
}
