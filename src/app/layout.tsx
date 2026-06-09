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
      <body className="min-h-screen bg-gradient-to-b from-white to-gray-50">
        <nav className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
            <Link href="/" className="text-lg font-bold text-indigo-600 hover:text-indigo-700 transition-colors">
              thedailyhaiku
            </Link>
            <div className="flex items-center gap-4 text-sm">
              <Link href="/write" className="text-gray-600 hover:text-gray-900 transition-colors font-medium">
                Write a Haiku
              </Link>
              <Link href="/" className="text-gray-600 hover:text-gray-900 transition-colors font-medium">
                Browse
              </Link>
              <Link
                href="/admin"
                className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
              >
                Admin
              </Link>
            </div>
          </div>
        </nav>
        <main className="max-w-5xl mx-auto px-4 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
