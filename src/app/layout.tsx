import type { Metadata } from "next";
import "./globals.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/cormorant-garamond/400.css";
import "@fontsource/cormorant-garamond/500.css";
import "@fontsource/cormorant-garamond/600.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "The Daily Haiku",
  description: "A new haiku every day, inspired by pop culture history.",
  metadataBase: new URL("https://thedailyhaiku.com"),
  openGraph: {
    title: "The Daily Haiku",
    description: "A new haiku every day, inspired by pop culture history.",
    url: "https://thedailyhaiku.com",
    siteName: "The Daily Haiku",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Daily Haiku",
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
        <nav className="border-b border-[var(--rule)]">
          <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none" className="text-[var(--accent)]">
                <path d="M4 22L10 10L14 16L18 6L24 22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="18" cy="6" r="2" fill="currentColor"/>
              </svg>
              <div className="flex items-baseline gap-1.5">
                <span className="text-lg font-serif font-medium tracking-tight text-[var(--ink)]">
                  the daily haiku
                </span>
              </div>
            </Link>
            <div className="flex items-center gap-6 text-sm">
              <Link href="/write" className="text-[var(--ink-muted)] hover:text-[var(--ink)] transition-colors">
                Write
              </Link>
              <Link href="/browse" className="text-[var(--ink-muted)] hover:text-[var(--ink)] transition-colors">
                Browse
              </Link>
              <Link href="/admin" className="text-[var(--ink-muted)] hover:text-[var(--ink)] transition-colors text-xs">
                Admin
              </Link>
            </div>
          </div>
        </nav>
        {children}
        <footer className="border-t border-[var(--rule)] mt-28">
          <div className="max-w-5xl mx-auto px-6 py-12 flex items-center justify-between text-xs text-[var(--ink-muted)]">
            <span>&copy; {new Date().getFullYear()} <span className="font-serif">the daily haiku</span></span>
            <div className="flex items-center gap-5">
              <Link href="/write" className="hover:text-[var(--ink)] transition-colors">Write</Link>
              <Link href="/browse" className="hover:text-[var(--ink)] transition-colors">Browse</Link>
              <Link href="/admin" className="hover:text-[var(--ink)] transition-colors">Admin</Link>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
