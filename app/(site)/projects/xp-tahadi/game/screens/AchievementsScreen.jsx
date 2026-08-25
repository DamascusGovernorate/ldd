"use client";

import { useGame } from "../context";
import { EmptyState, GameCard, GameHeader, IconTile, XPBadge } from "../ui";
import { achievementFeed } from "../lib";

export default function AchievementsScreen() {
  const { missions, pop, push } = useGame();
  const feed = achievementFeed(missions);

  return (
    <div className="xpg-bluebg xpg-enter" style={{ minHeight: "100%", paddingBottom: 18 }}>
      <GameHeader title="نشاطي" onBack={pop} />

      <div className="xpg-page xpg-cards">
        {feed.map((a) => (
          <GameCard
            key={a.id}
            tone="blue"
            as="button"
            onClick={() => push({ screen: "mission", id: a.missionId })}
            className="xpg-press"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 11,
              width: "100%",
              padding: 11,
              cursor: "pointer",
              font: "inherit",
              textAlign: "start",
            }}
          >
            <IconTile icon={a.icon} color={a.color} size={46} radius={14} />
            <div style={{ flex: 1, minWidth: 0 }} dir="rtl">
              <p style={{ margin: 0, fontSize: 14.5, fontWeight: 900, color: "#fff" }}>{a.title}</p>
              <p style={{ margin: "2px 0 0", fontSize: 12, fontWeight: 600, color: "var(--xpg-on-blue-muted)" }}>{a.desc}</p>
            </div>
            <XPBadge
              amount={a.xp}
              color={a.pendingReward ? "var(--xpg-gold)" : "var(--xpg-green)"}
              tone="solid"
            />
          </GameCard>
        ))}

        {feed.length === 0 && (
          <EmptyState title="لا نشاط بعد" hint="انضم إلى مهمة من الخريطة وسيظهر تقدّمك هنا." />
        )}
      </div>
    </div>
  );
}
