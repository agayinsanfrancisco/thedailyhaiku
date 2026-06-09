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
      <body className="bg-white text-gray-900 font-sans antialiased">
        <nav className="sticky top-0 z-50 border-b border-gray-100 bg-white/80 backdrop-blur-lg">
          <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5 group">
              <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-sm group-hover:shadow-md transition-shadow">
                H
              </span>
              <span className="font-semibold text-base tracking-tight">
                Daily<span className="text-indigo-600">Haiku</span>
              </span>
            </Link>
            <div className="flex items-center gap-6 text-sm">
              <Link
                href="/write"
                className="text-gray-600 hover:text-gray-900 transition-colors font-medium hidden sm:block"
              >
                Write
              </Link>
              <Link
                href="/"
                className="text-gray-600 hover:text-gray-900 transition-colors font-medium hidden sm:block"
              >
                Browse
              </Link>
              <Link
                href="/write"
                className="inline-flex items-center px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-full hover:bg-gray-800 transition-colors shadow-sm"
              >
                Write a Haiku
                <svg className="w-3.5 h-3.5 ml-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>
          </div>
        </nav>
        {children}
        <footer className="border-t border-gray-100 mt-24">
          <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-400">
              The Daily Haiku &mdash; words for every day.
            </p>
            <div className="flex items-center gap-4 text-xs text-gray-400">
              <Link href="/write" className="hover:text-gray-600 transition-colors">Write</Link>
              <Link href="/admin" className="hover:text-gray-600 transition-colors">Admin</Link>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}