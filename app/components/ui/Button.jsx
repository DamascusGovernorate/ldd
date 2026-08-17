import Link from "next/link";

const variants = {
  solid: "bg-teal text-white hover:bg-teal-deep",
  outline: "border border-gold-soft/70 text-ink hover:border-gold",
  outlineLight: "border border-gold-soft/70 text-white hover:border-gold",
};

export default function Button({ href, children, variant = "solid", className = "" }) {
  return (
    <Link
      href={href}
      className={`group relative inline-flex items-center gap-2 px-7 py-3 font-medium transition-colors duration-300 ${variants[variant]} ${className}`}
      style={{
        clipPath:
          "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))",
      }}
    >
      <span>{children}</span>
      <span className="transition-transform duration-300 group-hover:-translate-x-1">←</span>
    </Link>
  );
}