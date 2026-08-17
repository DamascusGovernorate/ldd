// app/components/Logo.jsx
import Image from "next/image";
import Link from "next/link";

export default function Logo() {
  return (
    <div className="w-full bg-white flex justify-center py-2">
      <Link
        href="/"
        aria-label="الصفحة الرئيسية"
        className="relative w-full max-w-7xl h-16 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded"
      >
        <Image
          src="/horizontalLogo.png"
          alt="Company logo"
          fill
          className="object-contain"
          priority
        />
      </Link>
    </div>
  );
}