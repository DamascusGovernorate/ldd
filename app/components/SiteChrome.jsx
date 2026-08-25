"use client";
import { usePathname } from "next/navigation";
import Logo from "./Logo";
import Navbar from "./Navbar";
import Footer from "./Footer";

// Add any other paths here that should render without the public navbar/footer.
const HIDDEN_CHROME_PATHS = ["/projects/xp-tahadi"];

export default function SiteChrome({ children }) {
  const pathname = usePathname();
  const hideChrome = HIDDEN_CHROME_PATHS.includes(pathname);

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-50 flex flex-col">
        <Logo />
        {!hideChrome && <Navbar />}
      </header>

      {/* Spacer height matches whichever bars are actually shown above */}
      <div className={hideChrome ? "h-28" : "h-[calc(4rem+3.5rem)]"} />

      <main className="flex-1">{children}</main>

      {!hideChrome && <Footer />}
    </>
  );
}