import { NextRequest, NextResponse } from "next/server";

// Gates the admin area behind a secret key held in the browser.
// Bootstrap once with /nimda?key=YOUR_KEY — the key is stored in an
// httpOnly cookie and the page is invisible (404) without it. The password
// login (with its 12h expiry) still runs behind this as a second factor.

const COOKIE = "tdh_admin_key";

export function middleware(req: NextRequest) {
  const expected = process.env.ADMIN_KEY;
  const { pathname, searchParams } = req.nextUrl;

  // Bootstrap: ?key=... sets the cookie, then redirect to the clean URL.
  const provided = searchParams.get("key");
  if (provided && expected && provided === expected) {
    const clean = req.nextUrl.clone();
    clean.searchParams.delete("key");
    const res = NextResponse.redirect(clean);
    res.cookies.set(COOKIE, expected, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });
    return res;
  }

  const hasKey =
    !!expected &&
    (req.cookies.get(COOKIE)?.value === expected ||
      req.headers.get("x-admin-key") === expected);

  if (hasKey) return NextResponse.next();

  // No key: admin API answers 401; admin pages 404 (as if they don't exist).
  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Not found" }, { status: 401 });
  }
  return NextResponse.rewrite(new URL("/not-found", req.url), { status: 404 });
}

export const config = {
  matcher: ["/nimda/:path*", "/nimda", "/api/admin/:path*"],
};
