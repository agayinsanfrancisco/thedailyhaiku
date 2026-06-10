import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "The Daily Haiku",
  description: "A new haiku every day, inspired by pop culture history.",
  metadataBase: new URL("https://thedailyhaiku.com"),
  openGraph: {
    title: "The Daily Haiku",
    description: "A new haiku every day, inspired by pop culture history.",
    url: "https://thedailyhaiku.com",
    siteName: "thedailyhaiku.com",
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
          <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5 group">
              <span className="w-2 h-2 bg-[var(--accent)] group-hover:opacity-80 transition-opacity" />
              <span className="text-sm font-medium tracking-tight text-[var(--ink)]">
                dailyhaiku
              </span>
            </Link>
            <div className="flex items-center gap-5 text-sm">
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
          <div className="max-w-5xl mx-auto px-6 py-10 flex items-center justify-between text-xs text-[var(--ink-muted)]">
            <span>&copy; {new Date().getFullYear()} dailyhaiku</span>
            <div className="flex items-center gap-4">
              <Link href="/write" className="hover:text-[var(--ink)] transition-colors">Write</Link>
              <Link href="/admin" className="hover:text-[var(--ink)] transition-colors">Admin</Link>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
