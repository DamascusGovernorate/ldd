// app/components/Navbar.jsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { IoMenu, IoClose } from "react-icons/io5";

const navLinks = [
  { name: "المشاريع", href: "/projects" },
  { name: "المبادرات", href: "/initiatives" },
  { name: "الاخبار", href: "/news" },
  { name: "المتطوعين", href: "/volunteers" },
  { name: "نبذة عنا", href: "/about" },
  { name: "اتصل بنا", href: "/contact" },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`w-full border-b transition-colors duration-300 ease-in-out ${
        isScrolled
          ? "bg-stone border-gold-soft/30 shadow-[0_1px_0_0_rgba(0,0,0,0.03)]"
          : "bg-stone/80 backdrop-blur-md border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Desktop navigation */}
          <div className="hidden md:flex items-center justify-center flex-1">
            <ul className="flex items-center gap-x-7 lg:gap-x-9 text-sm font-medium text-ink/80">
              {navLinks.map((link) => {
                const active = pathname === link.href;
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={`group relative py-2 transition-colors duration-200 whitespace-nowrap ${
                        active ? "text-teal" : "hover:text-teal"
                      }`}
                    >
                      {link.name}
                      <span
                        className={`absolute -bottom-[1px] inset-x-0 h-[2px] bg-gold transition-transform duration-300 origin-center ${
                          active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                        }`}
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen((v) => !v)}
              className="text-ink hover:text-teal focus:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded"
              aria-label="Toggle navigation menu"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <IoClose size={26} /> : <IoMenu size={26} />}
            </button>
          </div>

          <div className="md:hidden w-8" />
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-stone/98 backdrop-blur-sm border-t border-gold-soft/30 shadow-lg pattern-khatam bg-[length:64px_64px] [background-blend-mode:overlay]">
          <ul className="px-4 py-3 space-y-1 text-sm font-medium text-ink/80">
            {navLinks.map((link, i) => (
              <li
                key={link.href}
                className="animate-fadeInUp"
                style={{ animationDelay: `${i * 40}ms`, animationFillMode: "backwards" }}
              >
                <Link
                  href={link.href}
                  className={`block py-2.5 border-b border-ink/5 transition-colors duration-200 ${
                    pathname === link.href ? "text-teal" : "hover:text-teal"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </nav>
  );
}