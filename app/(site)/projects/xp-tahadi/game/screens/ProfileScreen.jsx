"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DAMASCUS_NEIGHBORHOODS } from "@/lib/neighborhoods";
import { useGame } from "../context";
import { Avatar, GameButton, GameCard, GameHeader, IconTile, ProgressBar } from "../ui";
import { IconGear, IconStar } from "../icons";
import { badges, formatXP, levelOf } from "../lib";

const DEGREE_LEVELS = [
  { value: "primary", label: "الشهادة الابتدائية" },
  { value: "intermediate", label: "الشهادة الإعدادية" },
  { value: "high_school", label: "الشهادة الثانوية" },
  { value: "bachelor", label: "شهادة البكالوريوس" },
  { value: "master", label: "شهادة الماجستير" },
  { value: "phd", label: "شهادة الدكتوراه" },
];

const fieldStyle = {
  width: "100%",
  padding: "9px 11px",
  borderRadius: 12,
  border: "2.5px solid var(--xpg-outline)",
  background: "#fff",
  color: "var(--xpg-ink)",
  font: "inherit",
  fontSize: 14,
  fontWeight: 700,
};

const labelStyle = {
  display: "block",
  margin: "0 0 5px",
  fontSize: 11.5,
  fontWeight: 700,
  color: "var(--xpg-muted)",
};

function Field({ label, children }) {
  return (
    <label style={{ display: "block" }}>
      <span style={labelStyle}>{label}</span>
      {children}
    </label>
  );
}

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

/* ==================================================================
   The account form, in the game's own skin.

   Posts to the same /api/account/update as the dashboard, so the two
   can never drift apart. Every field is sent on each save — the route
   uses $set on all of them, so omitting one would wipe it.
================================================================== */
function ProfileForm({ profile, onDone }) {
  const router = useRouter();
  const { notify, preview } = useGame();

  const [form, setForm] = useState({
    mobilePhone: profile.mobilePhone || "",
    age: profile.age || "",
    gender: profile.gender || "",
    neighborhood: profile.neighborhood || "",
    degrees: profile.degrees?.length ? profile.degrees : [{ level: "", specialization: "" }],
    certificateImage: profile.certificateImage || "",
    idImage: profile.idImage || "",
  });
  const [uploading, setUploading] = useState({ certificates: false, ids: false });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const updateDegree = (index, field, value) =>
    setForm((f) => {
      const degrees = [...f.degrees];
      degrees[index] = { ...degrees[index], [field]: value };
      return { ...f, degrees };
    });

  const addDegree = () =>
    form.degrees.length < 3 &&
    setForm((f) => ({ ...f, degrees: [...f.degrees, { level: "", specialization: "" }] }));

  const removeDegree = (index) =>
    setForm((f) => ({ ...f, degrees: f.degrees.filter((_, i) => i !== index) }));

  const handleUpload = async (e, field, folder) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading((u) => ({ ...u, [folder]: true }));
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", folder);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      set(field, data.url);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading((u) => ({ ...u, [folder]: false }));
    }
  };

  const save = async () => {
    setError("");

    if (!form.mobilePhone || !form.age || !form.gender || !form.neighborhood) {
      setError("أكمل رقم الهاتف والعمر والجنس والحي");
      return;
    }

    if (preview) {
      notify("وضع المعاينة — لم يُحفظ شيء");
      onDone?.();
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/account/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, degrees: form.degrees.filter((d) => d.level) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "تعذّر الحفظ");

      notify("تم حفظ معلوماتك");
      onDone?.();
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <GameCard style={{ padding: 14 }}>
      <div dir="rtl" style={{ display: "grid", gap: 11 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9 }}>
          <Field label="رقم الهاتف">
            <input
              type="tel"
              dir="ltr"
              value={form.mobilePhone}
              onChange={(e) => set("mobilePhone", e.target.value)}
              placeholder="09XXXXXXXX"
              style={{ ...fieldStyle, textAlign: "end" }}
            />
          </Field>

          <Field label="العمر">
            <input
              type="number"
              min="14"
              max="100"
              value={form.age}
              onChange={(e) => set("age", e.target.value)}
              style={fieldStyle}
            />
          </Field>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9 }}>
          <Field label="الجنس">
            <select value={form.gender} onChange={(e) => set("gender", e.target.value)} style={fieldStyle}>
              <option value="">اختر</option>
              <option value="male">ذكر</option>
              <option value="female">أنثى</option>
            </select>
          </Field>

          <Field label="الحي السكني">
            <select
              value={form.neighborhood}
              onChange={(e) => set("neighborhood", e.target.value)}
              style={fieldStyle}
            >
              <option value="">اختر الحي</option>
              {DAMASCUS_NEIGHBORHOODS.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <p style={{ margin: "-4px 0 0", fontSize: 11.5, color: "var(--xpg-muted)", fontWeight: 700 }}>
          مهماتك تُعرض حسب حيّك، فاختره بدقة.
        </p>

        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={labelStyle}>المؤهلات العلمية (حتى 3)</span>
            {form.degrees.length < 3 && (
              <button
                type="button"
                onClick={addDegree}
                style={{
                  border: 0,
                  background: "none",
                  font: "inherit",
                  fontSize: 12,
                  fontWeight: 800,
                  color: "var(--xpg-sky-deep)",
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                + إضافة شهادة
              </button>
            )}
          </div>

          <div style={{ display: "grid", gap: 8 }}>
            {form.degrees.map((d, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr auto", gap: 7 }}>
                <select
                  value={d.level}
                  onChange={(e) => updateDegree(i, "level", e.target.value)}
                  style={fieldStyle}
                >
                  <option value="">اختر المؤهل</option>
                  {DEGREE_LEVELS.map((lvl) => (
                    <option key={lvl.value} value={lvl.value}>
                      {lvl.label}
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  value={d.specialization}
                  onChange={(e) => updateDegree(i, "specialization", e.target.value)}
                  placeholder="التخصص (اختياري)"
                  style={fieldStyle}
                />

                {form.degrees.length > 1 ? (
                  <button
                    type="button"
                    onClick={() => removeDegree(i)}
                    aria-label="حذف الشهادة"
                    style={{
                      border: "2.5px solid var(--xpg-outline)",
                      borderRadius: 12,
                      background: "#fff",
                      color: "var(--xpg-red)",
                      font: "inherit",
                      fontSize: 13,
                      fontWeight: 900,
                      padding: "0 11px",
                      cursor: "pointer",
                    }}
                  >
                    ✕
                  </button>
                ) : (
                  <span />
                )}
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9 }}>
          <Field label="صورة الشهادة (اختياري)">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleUpload(e, "certificateImage", "certificates")}
              style={{ fontSize: 12 }}
            />
            {uploading.certificates && (
              <span style={{ fontSize: 11, color: "var(--xpg-muted)" }}>جارِ الرفع…</span>
            )}
            {form.certificateImage && !uploading.certificates && (
              <span style={{ fontSize: 11, fontWeight: 800, color: "var(--xpg-green-deep)" }}>تم الرفع ✓</span>
            )}
          </Field>

          <Field label="صورة الهوية (اختياري)">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleUpload(e, "idImage", "ids")}
              style={{ fontSize: 12 }}
            />
            {uploading.ids && <span style={{ fontSize: 11, color: "var(--xpg-muted)" }}>جارِ الرفع…</span>}
            {form.idImage && !uploading.ids && (
              <span style={{ fontSize: 11, fontWeight: 800, color: "var(--xpg-green-deep)" }}>تم الرفع ✓</span>
            )}
          </Field>
        </div>

        {error && (
          <p style={{ margin: 0, fontSize: 12.5, fontWeight: 800, color: "var(--xpg-red)" }}>{error}</p>
        )}

        <div dir="ltr" style={{ display: "flex", gap: 9 }}>
          {onDone && (
            <GameButton variant="blue" onClick={onDone}>
              إلغاء
            </GameButton>
          )}
          <GameButton variant="gold" block disabled={saving} onClick={save}>
            {saving ? "جارٍ الحفظ…" : "حفظ المعلومات"}
          </GameButton>
        </div>
      </div>
    </GameCard>
  );
}

export default function ProfileScreen() {
  const { me, profile, stats, missions, canManage, projectId, setTab, push } = useGame();
  const level = levelOf(me.xpPoints);
  const myBadges = badges(stats, me.xpPoints);

  // An unfinished profile opens straight into the form — that's the one
  // thing standing between this person and playing.
  const [editing, setEditing] = useState(!profile.completed);

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
            {me.neighborhood || "لم تحدد حيّك بعد"}
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

        {/* ---------- account details ---------- */}
        {!profile.completed && !editing && (
          <GameCard tone="navy" style={{ padding: 13 }}>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 900, color: "#fff" }}>
              ملفك غير مكتمل
            </p>
            <p style={{ margin: "4px 0 10px", fontSize: 12.5, fontWeight: 700, color: "var(--xpg-on-blue-muted)" }}>
              أكمل معلوماتك لتظهر لك مهمات حيّك وتتمكن من الانضمام إليها.
            </p>
            <GameButton variant="gold" block onClick={() => setEditing(true)}>
              أكمل ملفي
            </GameButton>
          </GameCard>
        )}

        {editing ? (
          <ProfileForm
            profile={profile}
            onDone={profile.completed ? () => setEditing(false) : undefined}
          />
        ) : (
          profile.completed && (
            <GameCard style={{ padding: 12 }}>
              <button
                type="button"
                onClick={() => setEditing(true)}
                dir="rtl"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: "100%",
                  padding: 0,
                  border: 0,
                  background: "none",
                  font: "inherit",
                  cursor: "pointer",
                }}
              >
                <span style={{ fontSize: 14.5, fontWeight: 900 }}>معلوماتي الشخصية</span>
                <span style={{ fontSize: 12, fontWeight: 800, color: "var(--xpg-sky-deep)" }}>تعديل ←</span>
              </button>
            </GameCard>
          )
        )}

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
