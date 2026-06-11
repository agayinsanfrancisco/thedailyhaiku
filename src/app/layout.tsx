import type { Metadata } from "next";
import "./globals.css";
import "@fontsource/karla/400.css";
import "@fontsource/karla/500.css";
import "@fontsource/karla/700.css";
import "@fontsource/young-serif/400.css";
import "@fontsource/instrument-serif/400.css";
import "@fontsource/instrument-serif/400-italic.css";
import Link from "next/link";
import Logo from "@/components/Logo";

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
        <div className="washi" />
        <nav className="relative z-10 max-w-6xl mx-auto px-6 sm:px-[4vw] h-20 flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-7 text-[0.78rem] font-bold tracking-[0.14em] uppercase">
            <Link href="/write" className="text-[var(--ink-soft)] hover:text-[var(--accent)] transition-colors">Write</Link>
            <Link href="/browse" className="text-[var(--ink-soft)] hover:text-[var(--accent)] transition-colors">Browse</Link>
          </div>
        </nav>
        <main className="relative z-[1]">{children}</main>
        <footer className="relative z-[1] bg-[var(--ink)] text-[rgba(247,243,234,0.55)] text-center py-10 px-6 text-[0.74rem] tracking-[0.2em] uppercase">
          one event · one poem · <span className="text-[var(--accent)]">every day</span>
        </footer>
      </body>
    </html>
  );
}
