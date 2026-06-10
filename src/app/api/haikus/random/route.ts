import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { haikus } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";

export async function GET() {
  const result = await db
    .select({ id: haikus.id })
    .from(haikus)
    .where(eq(haikus.status, "approved"))
    .orderBy(sql`RANDOM()`)
    .limit(1);

  if (!result[0]) {
    return NextResponse.json({ error: "No haikus found" }, { status: 404 });
  }

  return NextResponse.json({ id: result[0].id });
}
