"use client";

import { useState } from "react";
import { useGame } from "../context";
import { EmptyState, GameCard, GameHeader, IconTile, Pill, ProgressBar, SegmentedTabs } from "../ui";
import { IconCheck } from "../icons";
import { badges, formatXP } from "../lib";

/* Every card below is computed live from the database: completed missions,
   distinct neighborhoods worked in, User.xpPoints, and your rank. Nothing
   is stored or stubbed. Thresholds live in BADGE_RULES in game/lib.js.

   A redeemable rewards catalogue (mug, voucher, t-shirt) would need a
   Reward model + an /api/rewards route + a dashboard page — say the word
   and that becomes the second tab. */

const TABS = [
  { id: "locked", label: "قيد التقدم" },
  { id: "unlocked", label: "حصلت عليها" },
];

function BadgeRow({ badge }) {
  return (
    <div dir="ltr" style={{ display: "flex", alignItems: "center", gap: 11, padding: "12px 13px" }}>
      <span style={{ opacity: badge.unlocked ? 1 : 0.45, filter: badge.unlocked ? "none" : "grayscale(1)" }}>
        <IconTile icon={badge.icon} color={badge.color} size={50} radius={15} />
      </span>

      <div style={{ flex: 1, minWidth: 0 }} dir="rtl">
        <p style={{ margin: 0, fontSize: 14.5, fontWeight: 900 }}>{badge.label}</p>
        <p style={{ margin: "2px 0 0", fontSize: 12, fontWeight: 600, color: "var(--xpg-muted)" }}>{badge.requirement}</p>
        {!badge.unlocked && (
          <div style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 6 }}>
            <div style={{ flex: 1 }}>
              <ProgressBar value={badge.percent} color={badge.color} height={7} />
            </div>
            <span className="xpg-num" style={{ fontSize: 11, fontWeight: 800, color: "var(--xpg-muted)" }}>
              {formatXP(badge.value)}/{formatXP(badge.target)}
            </span>
          </div>
        )}
      </div>

      {badge.unlocked && (
        <Pill color="var(--xpg-green)">
          <IconCheck size={12} /> مفتوحة
        </Pill>
      )}
    </div>
  );
}

export default function RewardsScreen() {
  const { me, stats, setTab } = useGame();
  const [scope, setScope] = useState("locked");

  const all = badges(stats, me.xpPoints);
  const list = all.filter((b) => (scope === "unlocked" ? b.unlocked : !b.unlocked));

  return (
    <div className="xpg-bluebg xpg-enter" style={{ minHeight: "100%", paddingBottom: 18 }}>
      <GameHeader title="الجوائز" onBack={() => setTab("home")} />

      <div className="xpg-page xpg-narrow">
        <SegmentedTabs items={TABS} value={scope} onChange={setScope} />

        <GameCard tone="navy" style={{ padding: "9px 14px", display: "flex", justifyContent: "space-between", borderRadius: 14 }}>
          <span style={{ fontSize: 12.5, fontWeight: 700, color: "var(--xpg-on-blue-muted)" }}>رصيدك</span>
          <span className="xpg-num" style={{ fontSize: 14, fontWeight: 900, color: "var(--xpg-gold-soft)" }}>
            {formatXP(me.xpPoints)} XP
          </span>
        </GameCard>

        {list.length === 0 ? (
          <EmptyState
            title={scope === "unlocked" ? "لم تفتح أي جائزة بعد" : "فتحت كل الجوائز المتاحة"}
            hint={scope === "unlocked" ? "أنجز مهمة واحدة لتفتح أول جائزة." : "أحسنت — لا شيء متبقٍ في هذه القائمة."}
          />
        ) : (
          <GameCard className="xpg-divide" style={{ padding: 0, overflow: "hidden" }}>
            {list.map((b) => (
              <BadgeRow key={b.id} badge={b} />
            ))}
          </GameCard>
        )}
      </div>
    </div>
  );
}
