import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { subscribers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { unsubToken } from "@/lib/email";

// One-click unsubscribe (token = HMAC of the email; not forgeable).
async function unsubscribe(email: string | null, token: string | null) {
  if (!email || !token || token !== unsubToken(email)) {
    return NextResponse.json({ error: "Invalid unsubscribe link" }, { status: 400 });
  }
  await db
    .update(subscribers)
    .set({ dailyWord: false, unsubscribedAt: new Date().toISOString() })
    .where(eq(subscribers.email, email.toLowerCase()));
  return new NextResponse(
    `<!doctype html><meta charset="utf-8"><title>unsubscribed</title>
     <div style="font-family:Georgia,serif;max-width:420px;margin:80px auto;text-align:center;color:#1a1812">
       <p style="font-style:italic;font-size:28px">unsubscribed.</p>
       <p style="color:#5a5448">You won't get the daily word anymore. <a href="https://thedailyhaiku.com" style="color:#c2391b">the daily haiku</a></p>
     </div>`,
    { headers: { "Content-Type": "text/html" } },
  );
}

export async function GET(request: NextRequest) {
  const p = request.nextUrl.searchParams;
  return unsubscribe(p.get("email"), p.get("t"));
}

// RFC 8058 one-click (List-Unsubscribe-Post) sends a POST.
export async function POST(request: NextRequest) {
  const p = request.nextUrl.searchParams;
  return unsubscribe(p.get("email"), p.get("t"));
}
