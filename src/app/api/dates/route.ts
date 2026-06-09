import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { haikus } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const year = new Date().getFullYear();
  const searchParams = request.nextUrl.searchParams;
  const currentYear = searchParams.get("year") ?? String(year);

  const allHaikus = await db
    .select({ date: haikus.date, status: haikus.status })
    .from(haikus)
    .where(eq(haikus.year, parseInt(currentYear)));

  const takenDates = new Map<string, string>();
  for (const h of allHaikus) {
    if (!takenDates.has(h.date)) {
      takenDates.set(h.date, h.status);
    }
  }

  return NextResponse.json({
    year: parseInt(currentYear),
    takenDates: Object.fromEntries(takenDates),
  });
}
