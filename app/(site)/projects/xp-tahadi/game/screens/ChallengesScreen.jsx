"use client";

import { useMemo, useState } from "react";
import { useGame } from "../context";
import { ChipRow, EmptyState, GameCard, GameHeader, IconTile, Pill, ProgressBar, SegmentedTabs } from "../ui";
import { IconCheck } from "../icons";
import { byType, categoryStyle, missionProgress, myState, STATUS_LABELS } from "../lib";

const VIEWS = [
  { id: "main", label: "التحديات الرئيسية" },
  { id: "sub", label: "المهام الفرعية" },
];

/* Filters over real mission state — nothing invented. */
const MISSION_FILTERS = [
  { id: "all", label: "الكل" },
  { id: "open", label: "متاحة" },
  { id: "mine", label: "مهامي" },
  { id: "closed", label: "مكتملة" },
];

const STATE_TONE = {
  completed: "var(--xpg-green)",
  accepted: "var(--xpg-sky)",
  pending: "var(--xpg-gold-deep)",
  rejected: "var(--xpg-red)",
  closed: "var(--xpg-gray)",
};

function MissionIcon({ mission, size = 62 }) {
  const style = categoryStyle(mission);
  if (mission.icon) {
    return (
      <span
        className="xpg-tile"
        style={{
          width: size,
          height: size,
          borderRadius: 18,
          backgroundImage: `url(${mission.icon})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
    );
  }
  return <IconTile icon={style.icon} color={style.color} size={size} radius={18} iconSize={Math.round(size * 0.55)} />;
}

function ChallengeCard({ mission, onOpen }) {
  const style = categoryStyle(mission);
  const { joined, applied, done, percent, mode } = missionProgress(mission);
  const state = myState(mission);

  return (
    <GameCard
      as="button"
      onClick={() => onOpen(mission)}
      className="xpg-press"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        width: "100%",
        padding: 12,
        textAlign: "start",
        cursor: "pointer",
        font: "inherit",
      }}
    >
      <MissionIcon mission={mission} />

      <div style={{ flex: 1, minWidth: 0 }} dir="rtl">
        <div style={{ display: "flex", alignItems: "flex-start", gap: 6, justifyContent: "space-between" }}>
          <p style={{ margin: 0, fontSize: 16, fontWeight: 900, lineHeight: 1.35 }}>{mission.title}</p>
          {state !== "open" && (
            <Pill color={STATE_TONE[state]} filled={false} style={{ flex: "none" }}>
              {state === "completed" && <IconCheck size={11} />}
              {STATUS_LABELS[state]}
            </Pill>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "8px 0 5px" }}>
          <div style={{ flex: 1 }}>
            <ProgressBar value={percent} color={style.color} height={11} />
          </div>
          <span className="xpg-num" style={{ fontSize: 14, fontWeight: 900 }}>
            {percent}%
          </span>
        </div>

        <p className="xpg-num" style={{ margin: 0, fontSize: 11.5, fontWeight: 700, color: "var(--xpg-muted)" }}>
          {mode === "done"
            ? `${done} أنجزوا من ${joined} مشارك`
            : `${joined} مقبول من ${applied} طلب · ${mission.neighborhood}`}
        </p>

        {mission.objectives?.length > 0 && (
          <ul style={{ margin: "6px 0 0", padding: 0, listStyle: "none" }}>
            {mission.objectives.slice(0, 2).map((o, i) => (
              <li key={i} style={{ display: "flex", gap: 6, fontSize: 11.5, color: "var(--xpg-muted)", marginTop: 2 }}>
                <span style={{ color: style.color, fontWeight: 900 }}>◆</span>
                <span style={{ flex: 1 }}>{o}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </GameCard>
  );
}

export default function ChallengesScreen() {
  const { missions, push, setTab } = useGame();
  const [view, setView] = useState("main");
  const [filter, setFilter] = useState("all");

  const filtered = useMemo(() => {
    if (filter === "open") return missions.filter((m) => m.status === "open" && m.myStatus === "open");
    if (filter === "mine") return missions.filter((m) => m.myStatus === "accepted" || m.myStatus === "pending");
    if (filter === "closed") return missions.filter((m) => m.status === "closed");
    return missions;
  }, [missions, filter]);

  // "الرئيسية" and "الفرعية" now read Mission.type, set by the manager when
  // the mission is published.
  const visible = useMemo(() => byType(filtered, view === "main" ? "main" : "side"), [filtered, view]);
  const open = (mission) => push({ screen: "mission", id: mission.id });

  return (
    <div className="xpg-bluebg xpg-enter" style={{ minHeight: "100%", paddingBottom: 18 }}>
      <GameHeader title={view === "main" ? "التحديات" : "المهام الفرعية"} onBack={() => setTab("home")} />

      <div className="xpg-page">
        <SegmentedTabs items={VIEWS} value={view} onChange={setView} />
        <ChipRow items={MISSION_FILTERS} value={filter} onChange={setFilter} />

        <div className="xpg-cards">
          {visible.map((m) => (
            <ChallengeCard key={m.id} mission={m} onOpen={open} />
          ))}
        </div>

        {visible.length === 0 && (
          <EmptyState
            title={view === "main" ? "لا توجد مهام رئيسية" : "لا توجد مهام فرعية"}
            hint="تُنشر المهام من لوحة التحكم — تحدي XP."
          />
        )}
      </div>
    </div>
  );
}
