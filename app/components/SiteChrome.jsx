"use client";
import { usePathname } from "next/navigation";
import Logo from "./Logo";
import Navbar from "./Navbar";
import Footer from "./Footer";

const HIDDEN_CHROME_PATHS = ["/projects/xp-tahadi", "/login"];

export default function SiteChrome({ children }) {
  const pathname = usePathname();
  const hideChrome = HIDDEN_CHROME_PATHS.includes(pathname);

  return (
    <>
      {!hideChrome && (
        <>
          <header className="fixed top-0 inset-x-0 z-50 flex flex-col">
            <Logo />
            <Navbar />
          </header>
          <div className="h-2" />
        </>
      )}

      <main className="flex-1">{children}</main>

      {!hideChrome && <Footer />}
    </>
  );
}