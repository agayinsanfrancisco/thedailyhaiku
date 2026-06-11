import { NextRequest, NextResponse } from "next/server";
import { verifyAdminPassword, getSession, sessionExpiry } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body;

    if (!password) {
      return NextResponse.json({ error: "Password required" }, { status: 400 });
    }

    const valid = await verifyAdminPassword(password);
    if (!valid) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    const session = await getSession();
    session.isAdmin = true;
    session.expiresAt = sessionExpiry();
    await session.save();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
