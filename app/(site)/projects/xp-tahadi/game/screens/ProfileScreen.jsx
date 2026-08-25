"use client";

import { useGame } from "../context";
import { Avatar, GameCard, GameHeader, IconTile, ProgressBar } from "../ui";
import { IconGear, IconStar } from "../icons";
import { badges, formatXP, levelOf } from "../lib";

function RankCard({ label, value }) {
  return (
    <GameCard tone="navy" style={{ padding: "10px 12px", borderRadius: 16 }}>
      <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: "var(--xpg-on-blue-muted)" }}>{label}</p>
      <p className="xpg-num" style={{ margin: "2px 0 0", fontSize: 22, fontWeight: 900, color: "#fff" }}>
        {value}
      </p>
    </GameCard>
  );
}

export default function ProfileScreen() {
  const { me, stats, missions, canManage, projectId, setTab, push } = useGame();
  const level = levelOf(me.xpPoints);
  const myBadges = badges(stats, me.xpPoints);

  return (
    <div className="xpg-bluebg xpg-enter" style={{ minHeight: "100%", paddingBottom: 20 }}>
      <GameHeader
        title=""
        onBack={() => setTab("home")}
        action={
          canManage && projectId ? (
            <a
              className="xpg-iconbtn"
              href={`/dashboard/projects/${projectId}/missions`}
              aria-label="إدارة المشروع"
            >
              <IconGear size={19} />
            </a>
          ) : (
            <a className="xpg-iconbtn" href="/dashboard/volunteer" aria-label="ملفي في لوحة التحكم">
              <IconGear size={19} />
            </a>
          )
        }
      />

      <div className="xpg-page xpg-profile">
        <div className="xpg-profile__side xpg-home__side">
        <div style={{ textAlign: "center", marginTop: -6 }}>
          <Avatar
            name={me.name}
            src={me.avatar}
            size={104}
            style={{ borderWidth: 4, boxShadow: "0 5px 0 rgba(7,32,74,.5), 0 14px 24px rgba(2,12,32,.4)" }}
          />
          <h2 style={{ margin: "10px 0 0", fontSize: 24, fontWeight: 900, color: "#fff", textShadow: "0 2px 0 rgba(4,24,58,.45)" }}>
            {me.name}
          </h2>
          <p style={{ margin: "1px 0 0", fontSize: 13.5, fontWeight: 700, color: "var(--xpg-on-blue-muted)" }}>
            {me.neighborhood || "أضف حيّك من لوحة التحكم"}
          </p>
        </div>

        <GameCard tone="navy" style={{ padding: 13 }}>
          <div dir="ltr" style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span
              className="xpg-tile xpg-tile--round"
              style={{
                width: 50,
                height: 50,
                background: "linear-gradient(180deg,#ffe071,#ffb800)",
                borderColor: "#7d5500",
                color: "#8a5b00",
              }}
            >
              <IconStar size={26} />
            </span>
            <span className="xpg-num" style={{ fontSize: 17, fontWeight: 900, color: "#fff" }}>
              {formatXP(me.xpPoints)} XP
            </span>
            <span style={{ flex: 1 }} />
            <span style={{ fontSize: 13, fontWeight: 800, color: "var(--xpg-gold-soft)" }}>
              المستوى {level.level} — {level.title}
            </span>
          </div>
          <div style={{ marginTop: 10 }}>
            <ProgressBar value={level.progress} color="var(--xpg-gold)" height={12} onBlue />
          </div>
        </GameCard>

        <div dir="ltr" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9 }}>
          <RankCard label="الترتيب المحلي" value={`#${stats.localRank}`} />
          <RankCard label="الترتيب العام" value={`#${stats.globalRank}`} />
        </div>
        </div>

        <GameCard style={{ padding: 12 }}>
          <div dir="ltr" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", textAlign: "center" }}>
            {[
              { label: "مهام المشروع", value: missions.length },
              { label: "أحياء عملت بها", value: stats.districts },
              { label: "المهام المنجزة", value: stats.completed },
            ].map((s, i) => (
              <div key={s.label} style={{ borderInlineEnd: i < 2 ? "1.5px solid rgba(16,35,63,.12)" : "none" }}>
                <p style={{ margin: 0, fontSize: 11.5, fontWeight: 700, color: "var(--xpg-muted)" }}>{s.label}</p>
                <p className="xpg-num" style={{ margin: "2px 0 0", fontSize: 21, fontWeight: 900 }}>
                  {s.value}
                </p>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => push({ screen: "achievements" })}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
              margin: "14px 0 9px",
              padding: 0,
              border: 0,
              background: "none",
              font: "inherit",
              cursor: "pointer",
            }}
            dir="rtl"
          >
            <span style={{ fontSize: 14.5, fontWeight: 900 }}>شاراتي</span>
            <span style={{ fontSize: 12, fontWeight: 800, color: "var(--xpg-sky-deep)" }}>عرض النشاط ←</span>
          </button>

          <div dir="rtl" style={{ display: "flex", gap: 9, justifyContent: "space-between" }}>
            {myBadges.map((b) => (
              <span
                key={b.id}
                title={`${b.label} — ${b.requirement}`}
                style={{ opacity: b.unlocked ? 1 : 0.4, filter: b.unlocked ? "none" : "grayscale(1)" }}
              >
                <IconTile icon={b.icon} color={b.color} size={50} radius={16} iconSize={26} />
              </span>
            ))}
          </div>
        </GameCard>
      </div>
    </div>
  );
}
