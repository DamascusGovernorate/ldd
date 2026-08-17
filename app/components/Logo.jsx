// app/components/Logo.jsx
import Image from "next/image";

export default function Logo() {
  return (
    <div className="w-full bg-white flex justify-center py-2">
      <div className="relative w-full max-w-7xl h-16">
        <Image
          src="/horizontalLogo.png"   // ← path from the public folder
          alt="Company logo"
          fill
          className="object-contain"
          priority
        />
      </div>
    </div>
  );
}