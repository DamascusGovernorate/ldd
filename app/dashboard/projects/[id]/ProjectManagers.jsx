"use client";
import { useCallback, useEffect, useState } from "react";

/**
 * Drop-in panel for the project admin page. Site admin only — the API
 * rejects everyone else, and the component simply renders nothing if the
 * request comes back 403.
 *
 * Usage inside app/dashboard/projects/[id]/page.js:
 *   import ProjectManagers from "./ProjectManagers";
 *   <ProjectManagers projectId={project._id.toString()} />
 */
export default function ProjectManagers({ projectId }) {
  const [data, setData] = useState(null);
  const [allowed, setAllowed] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");
  const [picked, setPicked] = useState("");

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}/managers`);
      if (res.status === 403 || res.status === 401) return setAllowed(false);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setData(json);
    } catch (err) {
      setError(err.message);
    }
  }, [projectId]);

  useEffect(() => {
    load();
  }, [load]);

  const change = async (userId, action) => {
    setBusyId(userId);
    setError("");
    try {
      const res = await fetch(`/api/projects/${projectId}/managers`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "تعذّر التنفيذ");
      setPicked("");
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  if (!allowed) return null;

  return (
    <section className="bg-white border border-ink/10 p-5 md:p-6">
      <h2 className="font-display text-lg text-ink">مسؤولو تحدي XP</h2>
      <p className="text-xs text-ink/50 mt-1.5 leading-relaxed">
        كل مسؤول يدير مهام حيّه فقط — الحي يُؤخذ من حسابه الشخصي، لذا يجب أن يحدده أولاً.
      </p>

      <div className="mt-5">
        {!data ? (
          <p className="text-sm text-ink/40">جارٍ التحميل…</p>
        ) : data.managers.length === 0 ? (
          <p className="text-sm text-ink/40">لم يُعيَّن أي مسؤول بعد.</p>
        ) : (
          <ul className="divide-y divide-ink/5">
            {data.managers.map((m) => (
              <li key={m.id} className="flex items-center gap-3 py-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-ink truncate">{m.name}</p>
                  <p className="text-xs text-ink/40 truncate">
                    {m.email}
                    {m.neighborhood ? ` · حي ${m.neighborhood}` : " · لم يحدد حيّه"}
                  </p>
                </div>
                <button
                  onClick={() => change(m.id, "remove")}
                  disabled={busyId === m.id}
                  className="px-3 py-1.5 border border-ink/15 text-xs text-ink/60 hover:text-red-600 disabled:opacity-60 shrink-0"
                >
                  إزالة
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {data && (
        <div className="flex flex-col sm:flex-row gap-2 mt-5 pt-5 border-t border-ink/10">
          <select
            value={picked}
            onChange={(e) => setPicked(e.target.value)}
            className="flex-1 px-3 py-2.5 bg-white border border-ink/15 text-sm outline-none focus:border-teal"
          >
            <option value="">اختر مستخدماً لتعيينه مسؤولاً…</option>
            {data.candidates.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} — حي {c.neighborhood}
              </option>
            ))}
          </select>
          <button
            onClick={() => picked && change(picked, "add")}
            disabled={!picked || busyId === picked}
            className="px-5 py-2.5 bg-teal text-white text-sm disabled:opacity-50"
          >
            تعيين
          </button>
        </div>
      )}

      {data?.candidates.length === 0 && (
        <p className="text-xs text-ink/40 mt-3">
          لا يوجد مستخدمون مؤهلون — يظهر هنا فقط من حدّد حيّه في حسابه الشخصي.
        </p>
      )}

      {error && <p className="text-red-600 text-sm mt-3">{error}</p>}
    </section>
  );
}
