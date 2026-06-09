import { cookies } from "next/headers";
import { getIronSession } from "iron-session";

const SESSION_OPTIONS = {
  password:
    process.env.SESSION_SECRET ??
    "complex_password_at_least_32_characters_long_for_security",
  cookieName: "thedailyhaiku_admin",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax" as const,
  },
};

export interface SessionData {
  isAdmin?: boolean;
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
    return session.isAdmin === true;
  } catch {
    return false;
  }
}
