"use client";
import { useState } from "react";

const ROLE_LABELS = { admin: "مدير", user: "مستخدم", news_reporter: "محرر أخبار" };

export default function UsersTable({ initialUsers }) {
  const [users, setUsers] = useState(initialUsers);
  const [updating, setUpdating] = useState(null);

  const handleRoleChange = async (id, role) => {
    setUpdating(id);
    try {
      const res = await fetch(`/api/users/${id}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      if (!res.ok) throw new Error();
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role } : u)));
    } catch {
      alert("فشل تحديث الدور");
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="overflow-x-auto bg-white/50 border border-ink/10">
      <table className="w-full text-sm text-start">
        <thead>
          <tr className="border-b border-ink/10 text-ink/60">
            <th className="px-4 py-3 font-medium">الاسم</th>
            <th className="px-4 py-3 font-medium">البريد الإلكتروني</th>
            <th className="px-4 py-3 font-medium">الهاتف</th>
            <th className="px-4 py-3 font-medium">الملف الشخصي</th>
            <th className="px-4 py-3 font-medium">الدور</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-b border-ink/5">
              <td className="px-4 py-3 text-ink">{u.fullName}</td>
              <td className="px-4 py-3 text-ink/70" dir="ltr">{u.email}</td>
              <td className="px-4 py-3 text-ink/70" dir="ltr">{u.mobilePhone}</td>
              <td className="px-4 py-3">
                <span className={`text-xs px-2 py-1 ${u.completed ? "bg-teal/10 text-teal" : "bg-gold/10 text-gold"}`}>
                  {u.completed ? "مكتمل" : "غير مكتمل"}
                </span>
              </td>
              <td className="px-4 py-3">
                <select
                  value={u.role}
                  disabled={updating === u.id}
                  onChange={(e) => handleRoleChange(u.id, e.target.value)}
                  className="px-3 py-1.5 bg-stone border border-ink/15 text-sm focus:outline-none focus:border-gold"
                >
                  {Object.entries(ROLE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}