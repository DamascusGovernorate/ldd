"use client";
import { useRef, useEffect } from "react";

const commands = [
  { cmd: "bold", label: "غامق" },
  { cmd: "italic", label: "مائل" },
  { cmd: "underline", label: "تسطير" },
  { cmd: "insertUnorderedList", label: "قائمة" },
  { cmd: "formatBlock", label: "عنوان", value: "H2" },
];

export default function RichTextEditor({ value, onChange }) {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== value) ref.current.innerHTML = value || "";
  }, []);

  const exec = (cmd, val) => {
    document.execCommand(cmd, false, val);
    ref.current?.focus();
    onChange(ref.current?.innerHTML || "");
  };

  return (
    <div className="border border-ink/15 bg-stone">
      <div className="flex flex-wrap gap-2 p-2 border-b border-ink/15 bg-white/60">
        {commands.map((c) => (
          <button key={c.label} type="button" onClick={() => exec(c.cmd, c.value)} className="px-3 py-1.5 text-xs bg-white border border-ink/10 hover:border-gold transition-colors">
            {c.label}
          </button>
        ))}
      </div>
      <div ref={ref} contentEditable onInput={(e) => onChange(e.currentTarget.innerHTML)} className="min-h-[240px] p-4 text-sm text-ink leading-relaxed focus:outline-none" suppressContentEditableWarning />
    </div>
  );
}