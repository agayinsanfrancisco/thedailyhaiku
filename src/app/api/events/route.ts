import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { events, categories } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const dateParam = searchParams.get("date");

  if (!dateParam) {
    return NextResponse.json({ error: "Date parameter required" }, { status: 400 });
  }

  const [month, day] = dateParam.split("-").map(Number);
  if (!month || !day) {
    return NextResponse.json({ error: "Invalid date format (MM-DD)" }, { status: 400 });
  }

  const result = await db
    .select({
      id: events.id,
      month: events.month,
      day: events.day,
      year: events.year,
      title: events.title,
      description: events.description,
      categoryId: events.categoryId,
      categoryName: categories.name,
      categorySlug: categories.slug,
      categoryColor: categories.color,
    })
    .from(events)
    .leftJoin(categories, eq(events.categoryId, categories.id))
    .where(and(eq(events.month, month), eq(events.day, day)));

  return NextResponse.json({ events: result });
}
