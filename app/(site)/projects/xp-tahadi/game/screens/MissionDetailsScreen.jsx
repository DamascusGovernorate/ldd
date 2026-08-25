"use client";

import { useGame } from "../context";
import { AvatarStack, GameButton, GameCard, Pill, ProgressBar } from "../ui";
import { ParkScene, PhotoThumb } from "../Illustrations";
import { IconChevronStart, IconPinSmall, IconShare } from "../icons";
import { categoryStyle, formatXP, missionProgress, myState, STATUS_LABELS } from "../lib";

function InfoCell({ label, value, accent }) {
  return (
    <div style={{ textAlign: "center", padding: "8px 4px" }}>
      <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: "var(--xpg-muted)" }}>{label}</p>
      <p className="xpg-num" style={{ margin: "2px 0 0", fontSize: 14, fontWeight: 900, color: accent || "var(--xpg-ink)" }}>
        {value}
      </p>
    </div>
  );
}

export default function MissionDetailsScreen({ mission }) {
  const { pop, joinMission, joining, shareMission } = useGame();
  const style = categoryStyle(mission);
  const { joined, applied, done, percent, mode } = missionProgress(mission);
  const state = myState(mission);
  const canJoin = state === "open" && mission.status === "open";

  return (
    <div className="xpg-bluebg xpg-enter" style={{ minHeight: "100%", paddingBottom: 20 }}>
      <div style={{ position: "relative" }}>
        <div
          style={{
            position: "absolute",
            insetInline: 0,
            top: 0,
            zIndex: 2,
            direction: "ltr",
            display: "flex",
            justifyContent: "space-between",
            padding: "calc(12px + env(safe-area-inset-top)) 14px 0",
          }}
        >
          <button type="button" className="xpg-iconbtn" onClick={pop} aria-label="رجوع">
            <IconChevronStart size={20} />
          </button>
          <button type="button" className="xpg-iconbtn" onClick={() => shareMission(mission)} aria-label="مشاركة">
            <IconShare size={18} />
          </button>
        </div>

        <div className="xpg-narrow" style={{ padding: "58px 14px 0" }}>
          <div
            style={{
              position: "relative",
              borderRadius: "var(--xpg-r-lg)",
              overflow: "hidden",
              border: "3px solid var(--xpg-outline)",
              boxShadow: "var(--xpg-sh-card)",
            }}
          >
            {mission.images?.[0] ? (
              <img src={mission.images[0]} alt="" style={{ display: "block", width: "100%", height: 168, objectFit: "cover" }} />
            ) : (
              <ParkScene style={{ display: "block", width: "100%", height: 168 }} />
            )}

            <span
              style={{
                position: "absolute",
                insetInlineStart: 14,
                top: 12,
                display: "grid",
                placeItems: "center",
                width: 38,
                height: 38,
                borderRadius: 999,
                background: style.color,
                border: "3px solid var(--xpg-outline)",
                color: "#fff",
                boxShadow: "0 3px 0 rgba(7,32,74,.4)",
              }}
            >
              <IconPinSmall size={19} />
            </span>
          </div>
        </div>
      </div>

      <div className="xpg-page xpg-narrow" style={{ paddingTop: 12 }}>
        <GameCard style={{ padding: 14 }} dir="rtl">
          <div style={{ display: "flex", alignItems: "flex-start", gap: 8, justifyContent: "space-between" }}>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 900, lineHeight: 1.35 }}>{mission.title}</h2>
            <Pill color={style.color}>{mission.status === "closed" ? "منتهية" : "مفتوحة"}</Pill>
          </div>

          <p style={{ margin: "6px 0 0", fontSize: 12, fontWeight: 800, color: "var(--xpg-muted)" }}>
            {STATUS_LABELS[state]}
          </p>

          {mission.summary && (
            <p style={{ margin: "10px 0 0", fontSize: 13.5, lineHeight: 1.85, color: "#33455f" }}>{mission.summary}</p>
          )}

          {mission.objectives?.length > 0 && (
            <>
              <p style={{ margin: "12px 0 4px", fontSize: 13, fontWeight: 900 }}>الأهداف</p>
              <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                {mission.objectives.map((o, i) => (
                  <li key={i} style={{ display: "flex", gap: 7, fontSize: 13, color: "#33455f", marginTop: 4 }}>
                    <span style={{ color: style.color, fontWeight: 900 }}>◆</span>
                    <span style={{ flex: 1 }}>{o}</span>
                  </li>
                ))}
              </ul>
            </>
          )}

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3,1fr)",
              marginTop: 13,
              borderRadius: 14,
              border: "2.5px solid rgba(16,35,63,.14)",
              background: "rgba(16,35,63,.04)",
            }}
          >
            <InfoCell label="الموقع" value={mission.neighborhood} />
            <div style={{ borderInline: "1.5px solid rgba(16,35,63,.12)" }}>
              <InfoCell label="طلبات الانضمام" value={applied} />
            </div>
            <InfoCell label="المكافأة" value={`+${formatXP(mission.xpReward)} XP`} accent="var(--xpg-green-deep)" />
          </div>

          <div style={{ marginTop: 13 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span style={{ fontSize: 13, fontWeight: 900 }}>{mode === "done" ? "الإنجاز" : "المقبولون"}</span>
              <span className="xpg-num" style={{ fontSize: 13, fontWeight: 800, color: "var(--xpg-muted)" }}>
                {mode === "done" ? `${done} / ${joined}` : `${joined} / ${applied}`}
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 9, marginTop: 6 }}>
              <div style={{ flex: 1 }}>
                <ProgressBar value={percent} color="var(--xpg-green)" height={12} />
              </div>
              <span className="xpg-num" style={{ fontSize: 13, fontWeight: 900 }}>
                {percent}%
              </span>
            </div>
          </div>

          {mission.participants?.length > 0 && (
            <div style={{ marginTop: 13 }}>
              <p style={{ margin: "0 0 6px", fontSize: 11.5, fontWeight: 700, color: "var(--xpg-muted)" }}>المشاركون</p>
              <AvatarStack people={mission.participants} max={6} size={31} />
            </div>
          )}

          {mission.images?.length > 1 && (
            <div style={{ marginTop: 13 }}>
              <p style={{ margin: "0 0 6px", fontSize: 11.5, fontWeight: 700, color: "var(--xpg-muted)" }}>صور المهمة</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 7 }}>
                {mission.images.slice(1, 4).map((src, i) => (
                  <PhotoThumb key={i} src={src} variant={i} />
                ))}
              </div>
            </div>
          )}

          {mission.googleMapsUrl && (
            <a
              href={mission.googleMapsUrl}
              target="_blank"
              rel="noreferrer"
              style={{ display: "inline-block", marginTop: 12, fontSize: 13, fontWeight: 800, color: "var(--xpg-sky-deep)" }}
            >
              افتح الموقع على خرائط Google ←
            </a>
          )}
        </GameCard>

        <GameButton variant="gold" size="lg" block disabled={joining || !canJoin} onClick={() => joinMission(mission.id)}>
          {joining ? "جارٍ الإرسال…" : canJoin ? "انضم للمهمة!" : STATUS_LABELS[state]}
        </GameButton>
      </div>
    </div>
  );
}
