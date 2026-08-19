"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IoHomeOutline, IoPersonOutline, IoPeopleOutline, IoBriefcaseOutline,
  IoBulbOutline, IoHeartOutline, IoFlagOutline, IoCheckmarkDoneOutline,
  IoBarChartOutline, IoNewspaperOutline, IoNotificationsOutline,
  IoWarningOutline, IoMenu, IoClose,
} from "react-icons/io5";

const navItems = [
  { name: "الرئيسية", href: "/dashboard", icon: IoHomeOutline, roles: ["admin", "user", "news_reporter"] },
  { name: "حسابي", href: "/dashboard/account", icon: IoPersonOutline, roles: ["admin", "user", "news_reporter"] },
  { name: "المستخدمون", href: "/dashboard/users", icon: IoPeopleOutline, roles: ["admin"] },
  { name: "المشاريع", href: "/dashboard/projects", icon: IoBriefcaseOutline, roles: ["admin"] },
  { name: "المبادرات", href: "/dashboard/initiatives", icon: IoBulbOutline, roles: ["admin", "user", "news_reporter"] },
  { name: "التطوع", href: "/dashboard/volunteer", icon: IoHeartOutline, roles: ["admin", "user", "news_reporter"] },
  { name: "المتطوعون", href: "/dashboard/volunteers", icon: IoPeopleOutline, roles: ["admin",  "news_reporter"] },
  { name: "اللجنة التنموية", href: "/dashboard/development-committee", icon: IoFlagOutline, roles: ["admin", "user", "news_reporter"] },
  { name: "المهام", href: "/dashboard/tasks", icon: IoCheckmarkDoneOutline, roles: ["admin", "user", "news_reporter"] },
  { name: "التحليلات", href: "/dashboard/analytics", icon: IoBarChartOutline, roles: ["admin"] },
  { name: "الأخبار", href: "/dashboard/news", icon: IoNewspaperOutline, roles: ["admin", "news_reporter"] },
  { name: "الإشعارات", href: "/dashboard/notifications", icon: IoNotificationsOutline, roles: ["admin", "user", "news_reporter"] },
  { name: "التقارير", href: "/dashboard/reports", icon: IoWarningOutline, roles: ["admin", "user", "news_reporter"] },
];

export default function Sidebar({ role }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const items = navItems.filter((i) => i.roles.includes(role));

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="md:hidden fixed top-3 start-3 z-40 p-2 bg-white border border-ink/10 shadow"
        aria-label="فتح القائمة"
      >
        <IoMenu size={22} />
      </button>

      {open && <div className="md:hidden fixed inset-0 bg-ink/40 z-40" onClick={() => setOpen(false)} />}

      <aside
        className={`fixed md:static inset-y-0 start-0 z-50 w-64 bg-ink text-white/80 flex flex-col transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full md:translate-x-0"
        }`}
      >
        <div className="flex items-center justify-between px-5 py-5 border-b border-white/10">
          <span className="font-display text-gold-soft text-sm tracking-widest">لوحة التحكم</span>
          <button onClick={() => setOpen(false)} className="md:hidden text-white/60" aria-label="إغلاق القائمة">
            <IoClose size={22} />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {items.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 text-sm transition-colors duration-200 ${
                      active ? "bg-teal text-white" : "hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <Icon size={18} />
                    {item.name}
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