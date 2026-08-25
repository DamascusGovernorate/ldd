"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IoHomeOutline, IoPersonOutline, IoPeopleOutline, IoBriefcaseOutline,
  IoBulbOutline, IoHeartOutline, IoFlagOutline, IoCheckmarkDoneOutline,
  IoBarChartOutline, IoNewspaperOutline, IoNotificationsOutline,
  IoWarningOutline, IoMenu, IoClose, IoChevronBack, IoChevronForward,
  IoGameControllerOutline,
} from "react-icons/io5";

const ALL_ROLES = ["admin", "user", "news_reporter", "xp_project_manager"];

const navItems = [
  { name: "الرئيسية", href: "/dashboard", icon: IoHomeOutline, roles: ALL_ROLES },
  { name: "حسابي", href: "/dashboard/account", icon: IoPersonOutline, roles: ALL_ROLES },
  { name: "المستخدمون", href: "/dashboard/users", icon: IoPeopleOutline, roles: ["admin"] },
  { name: "المشاريع", href: "/dashboard/projects", icon: IoBriefcaseOutline, roles: ["admin"] },
  { name: "المبادرات", href: "/dashboard/initiatives", icon: IoBulbOutline, roles: ALL_ROLES },
  { name: "التطوع", href: "/dashboard/volunteer", icon: IoHeartOutline, roles: ALL_ROLES },
  { name: "المتطوعون", href: "/dashboard/volunteers", icon: IoPeopleOutline, roles: ["admin", "news_reporter"] },
  { name: "اللجنة التنموية", href: "/dashboard/development-committee", icon: IoFlagOutline, roles: ["admin", "news_reporter"] },
  { name: "المهام", href: "/dashboard/tasks", icon: IoCheckmarkDoneOutline, roles: ALL_ROLES },
  // The page itself decides between manager view, volunteer view, and a
  // "you are not in the project yet" prompt — the sidebar is a client
  // component and can't know project membership.
  { name: "تحدي XP", href: "/dashboard/xp-challenge", icon: IoGameControllerOutline, roles: ALL_ROLES },
  { name: "التحليلات", href: "/dashboard/analytics", icon: IoBarChartOutline, roles: ["admin"] },
  { name: "الأخبار", href: "/dashboard/news", icon: IoNewspaperOutline, roles: ["admin", "news_reporter"] },
  { name: "الإشعارات", href: "/dashboard/notifications", icon: IoNotificationsOutline, roles: ALL_ROLES },
  { name: "التقارير", href: "/dashboard/reports", icon: IoWarningOutline, roles: ALL_ROLES },
];

const COLLAPSE_KEY = "ldd-sidebar-collapsed";

export default function Sidebar({ role }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const items = navItems.filter((i) => i.roles.includes(role));

  useEffect(() => {
    const saved = localStorage.getItem(COLLAPSE_KEY);
    if (saved === "1") setCollapsed(true);
    setHydrated(true);
  }, []);

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(COLLAPSE_KEY, next ? "1" : "0");
      return next;
    });
  };

  return (
    <>
      {/* Mobile trigger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-3 start-3 z-[100] p-2 bg-white border border-ink/10 shadow"
        aria-label="فتح القائمة"
      >
        <IoMenu size={22} />
      </button>

      {mobileOpen && (
        <div className="md:hidden fixed inset-0 bg-ink/40 z-[90]" onClick={() => setMobileOpen(false)} />
      )}

      <aside
        className={`
          fixed md:static inset-y-0 start-0 z-[95] bg-ink text-white/80 flex flex-col
          transition-all duration-300
          ${mobileOpen ? "translate-x-0" : "translate-x-full md:translate-x-0"}
          ${hydrated && collapsed ? "md:w-[72px]" : "w-64"}
        `}
      >
        <div className="flex items-center justify-between px-4 py-5 border-b border-white/10 shrink-0">
          {!(hydrated && collapsed) && (
            <span className="font-display text-gold-soft text-sm tracking-widest whitespace-nowrap">
              لوحة التحكم
            </span>
          )}

          {/* Desktop collapse toggle */}
          <button
            onClick={toggleCollapsed}
            className="hidden md:flex items-center justify-center w-7 h-7 text-white/50 hover:text-gold-soft transition-colors"
            aria-label={collapsed ? "توسيع القائمة" : "طي القائمة"}
          >
            {collapsed ? <IoChevronBack size={16} /> : <IoChevronForward size={16} />}
          </button>

          {/* Mobile close */}
          <button onClick={() => setMobileOpen(false)} className="md:hidden text-white/60" aria-label="إغلاق القائمة">
            <IoClose size={22} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4">
          <ul className="space-y-1 px-3">
            {items.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              const showLabel = !(hydrated && collapsed);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    title={showLabel ? undefined : item.name}
                    className={`flex items-center gap-3 px-3 py-2.5 text-sm transition-colors duration-200 ${
                      showLabel ? "" : "md:justify-center"
                    } ${active ? "bg-teal text-white" : "hover:bg-white/5 hover:text-white"}`}
                  >
                    <Icon size={18} className="shrink-0" />
                    {showLabel && <span className="whitespace-nowrap">{item.name}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
    </>
  );
}
