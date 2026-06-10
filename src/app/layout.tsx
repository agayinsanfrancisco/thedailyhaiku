import type { Metadata } from "next";
import "./globals.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/800.css";
import "@fontsource/cormorant-garamond/400.css";
import "@fontsource/cormorant-garamond/500.css";
import "@fontsource/cormorant-garamond/600.css";
import "@fontsource/cormorant-garamond/700.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "the daily haiku",
  description: "A new haiku every day, inspired by pop culture history.",
  metadataBase: new URL("https://thedailyhaiku.com"),
  openGraph: {
    title: "the daily haiku",
    description: "A new haiku every day, inspired by pop culture history.",
    url: "https://thedailyhaiku.com",
    siteName: "the daily haiku",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "the daily haiku",
    description: "A new haiku every day, inspired by pop culture history.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="bg-[#1a1714]">
          <nav className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <span className="w-6 h-6 rounded-full border border-[var(--accent)] flex items-center justify-center text-[10px] text-[var(--accent)] font-serif">
                h
              </span>
              <span className="text-sm text-[#c0b8a8] tracking-tight">
                the daily haiku
              </span>
            </Link>
            <div className="flex items-center gap-6 text-sm">
              <Link href="/write" className="text-[#8a8278] hover:text-[#c0b8a8] transition-colors">
                Write
              </Link>
              <Link href="/browse" className="text-[#8a8278] hover:text-[#c0b8a8] transition-colors">
                Browse
              </Link>
              <Link href="/admin" className="text-[#5a5248] hover:text-[#8a8278] transition-colors text-xs">
                Admin
              </Link>
            </div>
          </nav>
        </div>
        {children}
        <footer className="bg-[#1a1714] mt-32">
          <div className="max-w-5xl mx-auto px-6 py-12 flex items-center justify-between text-xs text-[#5a5248]">
            <span>&copy; {new Date().getFullYear()} the daily haiku</span>
            <div className="flex items-center gap-5">
              <Link href="/write" className="hover:text-[#8a8278] transition-colors">Write</Link>
              <Link href="/browse" className="hover:text-[#8a8278] transition-colors">Browse</Link>
              <Link href="/admin" className="hover:text-[#8a8278] transition-colors">Admin</Link>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
