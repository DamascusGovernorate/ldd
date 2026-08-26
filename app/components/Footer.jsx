import Link from "next/link";
import Image from "next/image";
import logo from "@/public/logo.png";
import { FaFacebookF, FaInstagram, FaTelegramPlane } from "react-icons/fa";

const footerLinks = [
  { name: "المشاريع", href: "/projects" },
  { name: "المبادرات", href: "/initiatives" },
  { name: "الاخبار", href: "/news" },
  { name: "المتطوعين", href: "/volunteers" },
  { name: "نبذة عنا", href: "/about" },
  { name: "اتصل بنا", href: "/contact" },
];

export default function Footer() {
  return (
    <footer className="relative bg-ink text-white/70 pt-16 pb-8 overflow-hidden">
      <div className="pattern-khatam bg-[length:64px_64px] absolute inset-0 opacity-[0.04]" />
      <div className="relative max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid md:grid-cols-[1.4fr_1fr_1fr] gap-12 pb-12 border-b border-white/10">
          <div>
            <div className="relative w-14 h-14 mb-4">
              <Image src={logo} alt="شعار المديرية" fill className="object-contain" />
            </div>
            <h3 className="font-display text-white text-lg">مديرية التنمية المحلية</h3>
            <p className="mt-3 text-sm leading-loose max-w-sm">
              نعمل من أجل تنمية مستدامة وشاملة في محافظة دمشق، بالشراكة مع
              المجتمع المحلي والمتطوعين.
            </p>
            <div className="flex items-center gap-4 mt-6">
              <a href="#" aria-label="فيسبوك" className="w-9 h-9 flex items-center justify-center border border-white/20 hover:border-gold hover:text-gold transition-colors">
                <FaFacebookF size={14} />
              </a>
              <a href="#" aria-label="انستغرام" className="w-9 h-9 flex items-center justify-center border border-white/20 hover:border-gold hover:text-gold transition-colors">
                <FaInstagram size={14} />
              </a>
              <a href="#" aria-label="تيليجرام" className="w-9 h-9 flex items-center justify-center border border-white/20 hover:border-gold hover:text-gold transition-colors">
                <FaTelegramPlane size={14} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-display text-white text-sm tracking-widest mb-4">روابط سريعة</h4>
            <ul className="space-y-2 text-sm">
              {footerLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="hover:text-gold-soft transition-colors">
                    {l.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display text-white text-sm tracking-widest mb-4">تواصل معنا</h4>
            <ul className="space-y-2 text-sm">
              <li>دمشق، سوريا</li>
              <li dir="ltr" className="text-end">+963 11 000 0000</li>
              <li dir="ltr" className="text-end">info@ldd.sy</li>
            </ul>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/40">
          <p>© {new Date().getFullYear()} مديرية التنمية المحلية – محافظة دمشق. جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </footer>
  );
}