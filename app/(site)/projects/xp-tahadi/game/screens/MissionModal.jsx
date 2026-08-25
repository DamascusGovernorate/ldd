"use client";

import { useEffect } from "react";
import { useGame } from "../context";
import { AvatarStack, GameButton, IconTile, Pill, ProgressBar } from "../ui";
import { PhotoThumb } from "../Illustrations";
import { IconClose, IconPinSmall } from "../icons";
import { categoryStyle, formatXP, missionProgress, myState, STATUS_LABELS } from "../lib";

export default function MissionModal({ mission, onClose }) {
  const { joinMission, joining, push, shareMission } = useGame();
  const style = categoryStyle(mission);
  const { joined, applied, done, percent, mode } = missionProgress(mission);
  const state = myState(mission);
  const canJoin = state === "open" && mission.status === "open";

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const photos = mission.images?.length ? mission.images.slice(0, 3) : [];

  return (
    <div className="xpg-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label={mission.title}>
      <div className="xpg-modal" onClick={(e) => e.stopPropagation()}>
        <div style={{ position: "relative", padding: "34px 18px 18px" }}>
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق"
            style={{
              position: "absolute",
              top: 12,
              right: 12,
              display: "grid",
              placeItems: "center",
              width: 32,
              height: 32,
              borderRadius: 10,
              border: "2.5px solid var(--xpg-outline)",
              background: "#fff",
              color: "var(--xpg-ink)",
              cursor: "pointer",
            }}
          >
            <IconClose size={15} />
          </button>

          <div style={{ display: "flex", justifyContent: "center", marginTop: -52, marginBottom: 8 }}>
            {mission.icon ? (
              <span
                className="xpg-tile xpg-tile--round"
                style={{
                  width: 62,
                  height: 62,
                  backgroundImage: `url(${mission.icon})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />
            ) : (
              <IconTile icon={style.icon} color={style.color} size={62} radius={999} iconSize={32} />
            )}
          </div>

          <h2 style={{ margin: 0, fontSize: 21, fontWeight: 900, textAlign: "center", lineHeight: 1.3 }}>
            <button
              type="button"
              onClick={() => push({ screen: "mission", id: mission.id }, onClose)}
              style={{ border: 0, background: "none", font: "inherit", color: "inherit", cursor: "pointer", padding: 0 }}
            >
              {mission.title}
            </button>
          </h2>

          <div style={{ display: "flex", justifyContent: "center", marginTop: 7 }}>
            <Pill color={style.color}>{mission.status === "closed" ? "مهمة منتهية" : "مهمة مفتوحة"}</Pill>
          </div>

          <div dir="ltr" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 14 }}>
            <span className="xpg-num" style={{ fontSize: 12.5, fontWeight: 800, color: "var(--xpg-muted)" }}>
              {mode === "done" ? `${done}/${joined} أنجزوا` : `${joined}/${applied} مقبول`}
            </span>
            <span className="xpg-num" style={{ fontSize: 12.5, fontWeight: 800, color: "var(--xpg-muted)" }}>
              {mission.neighborhood}
            </span>
          </div>
          <div style={{ marginTop: 6 }}>
            <ProgressBar value={percent} color={style.color} height={8} />
          </div>

          <p
            className="xpg-num"
            style={{ margin: "12px 0 0", fontSize: 16, fontWeight: 900, color: "var(--xpg-green-deep)", textAlign: "right" }}
          >
            +{formatXP(mission.xpReward)} XP
          </p>

          {mission.summary && (
            <p style={{ margin: "6px 0 0", fontSize: 13.5, lineHeight: 1.8, color: "#33455f", textAlign: "right" }}>
              {mission.summary}
            </p>
          )}

          {mission.objectives?.length > 0 && (
            <ul style={{ margin: "10px 0 0", padding: 0, listStyle: "none", textAlign: "right" }} dir="rtl">
              {mission.objectives.map((o, i) => (
                <li key={i} style={{ display: "flex", gap: 7, fontSize: 13, color: "#33455f", marginTop: 4 }}>
                  <span style={{ color: style.color, fontWeight: 900 }}>◆</span>
                  <span style={{ flex: 1 }}>{o}</span>
                </li>
              ))}
            </ul>
          )}

          {mission.googleMapsUrl && (
            <a
              href={mission.googleMapsUrl}
              target="_blank"
              rel="noreferrer"
              dir="rtl"
              style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 14, fontSize: 13, fontWeight: 800, color: "var(--xpg-sky-deep)" }}
            >
              <IconPinSmall size={16} />
              افتح الموقع على خرائط Google ←
            </a>
          )}

          {mission.participants?.length > 0 && (
            <div dir="rtl" style={{ marginTop: 14 }}>
              <p style={{ margin: "0 0 6px", fontSize: 11.5, fontWeight: 700, color: "var(--xpg-muted)" }}>المشاركون</p>
              <AvatarStack people={mission.participants} max={5} size={31} />
            </div>
          )}

          {photos.length > 0 && (
            <div dir="rtl" style={{ marginTop: 14 }}>
              <p style={{ margin: "0 0 6px", fontSize: 11.5, fontWeight: 700, color: "var(--xpg-muted)" }}>صور المهمة</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 7 }}>
                {photos.map((src, i) => (
                  <PhotoThumb key={i} src={src} variant={i} />
                ))}
              </div>
            </div>
          )}

          {state !== "open" && (
            <p
              style={{
                margin: "14px 0 0",
                fontSize: 13,
                fontWeight: 800,
                textAlign: "center",
                color: state === "rejected" ? "var(--xpg-red)" : "var(--xpg-green-deep)",
              }}
            >
              {STATUS_LABELS[state]}
            </p>
          )}

          <div dir="ltr" style={{ display: "flex", gap: 9, marginTop: 14 }}>
            <GameButton variant="blue" onClick={() => shareMission(mission)}>
              مشاركة
            </GameButton>
            <GameButton variant="gold" block disabled={joining || !canJoin} onClick={() => joinMission(mission.id)}>
              {joining ? "جارٍ الإرسال…" : canJoin ? "انضم للمهمة!" : STATUS_LABELS[state]}
            </GameButton>
          </div>
        </div>
      </div>
    </div>
  );
}
