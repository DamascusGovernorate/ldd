"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import "./game/tokens.css";
import { GameContext } from "./game/context";
import { BottomNavigation, SideNavigation } from "./game/ui";
import { playerStats } from "./game/lib";

import HomeScreen from "./game/screens/HomeScreen";
import ChallengesScreen from "./game/screens/ChallengesScreen";
import LeaderboardScreen from "./game/screens/LeaderboardScreen";
import RewardsScreen from "./game/screens/RewardsScreen";
import ProfileScreen from "./game/screens/ProfileScreen";
import AchievementsScreen from "./game/screens/AchievementsScreen";
import MissionDetailsScreen from "./game/screens/MissionDetailsScreen";
import MissionModal from "./game/screens/MissionModal";

const PREVIEW_LABELS = {
  contestant: "متسابق مقبول",
  manager: "مسؤول مشروع",
};

const EMPTY_PROFILE = {
  mobilePhone: "",
  age: "",
  gender: "",
  neighborhood: "",
  degrees: [],
  certificateImage: "",
  idImage: "",
  completed: false,
};

export default function GameApp({
  currentUserId,
  me: meProp,
  profile: profileProp,
  missions: initialMissions = [],
  users = [],
  neighborhoods = [],
  preview = false,
  previewRole,
  projectId,
  canManage = false,
}) {
  const router = useRouter();
  const [missions, setMissions] = useState(initialMissions);
  const [tab, setTabState] = useState("home");
  const [stack, setStack] = useState([]);
  const [modalId, setModalId] = useState(null);
  const [joining, setJoining] = useState(false);
  const [toast, setToast] = useState("");
  const toastTimer = useRef(null);

  // Server data wins whenever the route revalidates.
  useEffect(() => setMissions(initialMissions), [initialMissions]);
  useEffect(() => () => clearTimeout(toastTimer.current), []);

  const me = useMemo(() => {
    const fromList = users.find((u) => u.id === currentUserId);
    return (
      meProp ||
      fromList || { id: currentUserId, name: "لاعب", xpPoints: 0, neighborhood: null, avatar: null }
    );
  }, [meProp, users, currentUserId]);

  const profile = profileProp || EMPTY_PROFILE;

  const stats = useMemo(() => playerStats(missions, users, me), [missions, users, me]);

  /* ---------------- actions ---------------- */

  const notify = useCallback((message) => {
    setToast(message);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 2800);
  }, []);

  const setTab = useCallback((id) => {
    setStack([]);
    setModalId(null);
    setTabState(id);
  }, []);

  const push = useCallback((entry, before) => {
    before?.();
    setStack((s) => [...s, entry]);
  }, []);

  const pop = useCallback(() => setStack((s) => s.slice(0, -1)), []);

  const openMission = useCallback((mission) => setModalId(mission.id), []);
  const closeMission = useCallback(() => setModalId(null), []);

  /** POST /api/missions/:id/apply — the route you already have. */
  const joinMission = useCallback(
    async (missionId) => {
      if (preview) {
        setMissions((prev) => prev.map((m) => (m.id === missionId ? { ...m, myStatus: "pending" } : m)));
        notify("تم إرسال طلبك (معاينة — لم يُحفظ شيء)");
        return;
      }

      setJoining(true);
      try {
        const res = await fetch(`/api/missions/${missionId}/apply`, { method: "POST" });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "تعذّر إرسال الطلب");

        setMissions((prev) =>
          prev.map((m) =>
            m.id === missionId
              ? { ...m, myStatus: "pending", pendingCount: m.pendingCount + 1, applicantCount: m.applicantCount + 1 }
              : m
          )
        );
        notify("تم إرسال طلبك — سيصلك إشعار عند القبول");
        router.refresh();
      } catch (err) {
        notify(err.message);
      } finally {
        setJoining(false);
      }
    },
    [preview, notify, router]
  );

  const shareMission = useCallback(
    async (mission) => {
      const url = typeof window !== "undefined" ? window.location.href : "";
      try {
        if (navigator.share) {
          await navigator.share({ title: mission.title, text: mission.summary, url });
          return;
        }
        await navigator.clipboard.writeText(`${mission.title} — ${url}`);
        notify("تم نسخ رابط المهمة");
      } catch {
        notify("تعذّرت المشاركة");
      }
    },
    [notify]
  );

  /* ---------------- routing ---------------- */

  const top = stack[stack.length - 1];
  const modalMission = missions.find((m) => m.id === modalId) || null;
  const stackedMission = top?.screen === "mission" ? missions.find((m) => m.id === top.id) : null;

  let screen;
  if (stackedMission) screen = <MissionDetailsScreen mission={stackedMission} />;
  else if (top?.screen === "achievements") screen = <AchievementsScreen />;
  else if (tab === "challenges") screen = <ChallengesScreen />;
  else if (tab === "leaderboard") screen = <LeaderboardScreen />;
  else if (tab === "rewards") screen = <RewardsScreen />;
  else if (tab === "profile") screen = <ProfileScreen />;
  else screen = <HomeScreen />;

  const value = {
    me,
    profile,
    stats,
    missions,
    users,
    neighborhoods,
    preview,
    projectId,
    canManage,
    joining,
    tab,
    setTab,
    push,
    pop,
    openMission,
    closeMission,
    joinMission,
    shareMission,
    notify,
  };

  return (
    <GameContext.Provider value={value}>
      <div className="xpg" dir="rtl">
        <div className="xpg-shell">
          {/* rail from 1024px up, bottom nav below that — CSS decides which */}
          <SideNavigation value={tab} onChange={setTab} user={me} onProfile={() => setTab("profile")} />

          <div className="xpg-viewport xpg-bluebg">
            {preview && (
              <div
                style={{
                  position: "relative",
                  zIndex: 5,
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  padding: "7px 12px",
                  background: "var(--xpg-gold)",
                  color: "#3d2a00",
                  fontSize: 12.5,
                  fontWeight: 800,
                }}
              >
                <span>وضع المعاينة — تُعرض الصفحة كـ «{PREVIEW_LABELS[previewRole] || previewRole}»</span>
                {previewRole === "manager" && projectId && (
                  <Link href={`/dashboard/projects/${projectId}/missions`} style={{ textDecoration: "underline" }}>
                    إدارة المهمات من لوحة التحكم ←
                  </Link>
                )}
              </div>
            )}

            <main className="xpg-content">{screen}</main>

            <BottomNavigation value={tab} onChange={setTab} />
          </div>
        </div>

        {modalMission && <MissionModal mission={modalMission} onClose={closeMission} />}
        {toast && <div className="xpg-toast">{toast}</div>}
      </div>
    </GameContext.Provider>
  );
}
