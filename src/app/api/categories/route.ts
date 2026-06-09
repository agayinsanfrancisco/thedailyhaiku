import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { categories } from "@/lib/db/schema";

export async function GET() {
  const result = await db.select().from(categories);
  return NextResponse.json({ categories: result });
}
