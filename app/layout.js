import "./globals.css";
import Logo from "./components/Logo";
import Script from "next/script";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// ---------- SEO METADATA ----------
export const metadata = {
  title: {
    default: "مديرية التنمية المحلية – محافظة دمشق",
    template: "%s | مديرية التنمية المحلية – محافظة دمشق",
  },
  description:
    "الموقع الرسمي لمديرية التنمية المحلية في محافظة دمشق. نقدم خدمات التنمية المحلية، المشاريع، والخطط التنموية في العاصمة السورية.",
  keywords: [
    "التنمية المحلية",
    "دمشق",
    "محافظة دمشق",
    "مديرية التنمية المحلية",
    "خدمات تنموية",
    "مشاريع دمشق",
    "سوريا",
  ],
  authors: [{ name: "مديرية التنمية المحلية – محافظة دمشق" }],
  creator: "مديرية التنمية المحلية – محافظة دمشق",
  publisher: "مديرية التنمية المحلية – محافظة دمشق",
  formatDetection: { telephone: false, address: false, email: false },
  metadataBase: new URL("https://www.ldd.sy"),
  alternates: { canonical: "/" },
  openGraph: {
    title: "مديرية التنمية المحلية – محافظة دمشق",
    description:
      "الموقع الرسمي لمديرية التنمية المحلية في محافظة دمشق. نقدم خدمات التنمية المحلية، المشاريع، والخطط التنموية في العاصمة السورية.",
    url: "https://www.ldd.sy",
    siteName: "مديرية التنمية المحلية – محافظة دمشق",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "شعار مديرية التنمية المحلية – محافظة دمشق",
        type: "image/png",
      },
    ],
    locale: "ar_SY",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "مديرية التنمية المحلية – محافظة دمشق",
    description:
      "الموقع الرسمي لمديرية التنمية المحلية في محافظة دمشق. نقدم خدمات التنمية المحلية، المشاريع، والخطط التنموية في العاصمة السورية.",
    images: ["/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: { icon: "/favicon.ico", apple: "/apple-touch-icon.png" },
};

// ---------- LAYOUT ----------
export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-stone text-ink font-body">
        <header className="fixed top-0 inset-x-0 z-50 flex flex-col">
          <Logo />

        </header>

        {/* Spacer to prevent content from hiding under the fixed header */}
        <div className="h-[calc(7rem)]" />

        <Script
          id="structured-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "GovernmentOrganization",
              name: "مديرية التنمية المحلية – محافظة دمشق",
              url: "https://www.ldd.sy",
              logo: "https://www.ldd.sy/logo.png",
              description: "الموقع الرسمي لمديرية التنمية المحلية في محافظة دمشق.",
              address: {
                "@type": "PostalAddress",
                addressLocality: "دمشق",
                addressCountry: "SY",
              },
            }),
          }}
        />
        {children}

      </body>
    </html>
  );
}