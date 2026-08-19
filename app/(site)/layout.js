import Logo from "../components/Logo";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function SiteLayout({ children }) {
  return (
    <>
      <header className="fixed top-0 inset-x-0 z-50 flex flex-col">
        <Logo />
        <Navbar />
      </header>
      <div className="h-[calc(4rem+3.5rem)]" />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}