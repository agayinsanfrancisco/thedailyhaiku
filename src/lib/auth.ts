import { cookies } from "next/headers";
import { getIronSession } from "iron-session";

// How long an admin login stays valid before re-entry is required.
const SESSION_TTL_MS = 1000 * 60 * 60 * 12; // 12 hours

const SESSION_OPTIONS = {
  password:
    process.env.SESSION_SECRET ??
    "complex_password_at_least_32_characters_long_for_security",
  cookieName: "thedailyhaiku_admin",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax" as const,
    maxAge: SESSION_TTL_MS / 1000, // browser drops the cookie at the TTL too
  },
};

export interface SessionData {
  isAdmin?: boolean;
  expiresAt?: number;
}

export async function getSession() {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, SESSION_OPTIONS);
}

export async function verifyAdminPassword(
  password: string,
): Promise<boolean> {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) return false;
  return password === adminPassword;
}

export async function requireAdmin(): Promise<boolean> {
  try {
    const session = await getSession();
    if (session.isAdmin !== true) return false;
    // expired login → clear it and force re-entry
    if (!session.expiresAt || session.expiresAt < Date.now()) {
      session.destroy();
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export function sessionExpiry(): number {
  return Date.now() + SESSION_TTL_MS;
}
