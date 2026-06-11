import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { haikus, categories } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";
import { tokenMatches } from "@/lib/ownership";

function manageTokenFrom(request: NextRequest): string | null {
  return request.headers.get("x-manage-token") ?? request.nextUrl.searchParams.get("token");
}

// GET with a valid manage token returns the haiku for the owner's manage view.
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token = manageTokenFrom(request);
  const row = await db
    .select({
      id: haikus.id, date: haikus.date, year: haikus.year,
      line1: haikus.line1, line2: haikus.line2, line3: haikus.line3,
      status: haikus.status, authorName: haikus.authorName,
      seasonWord: haikus.seasonWord, seasonColor: haikus.seasonColor,
      categoryName: categories.name,
      manageTokenHash: haikus.manageTokenHash,
    })
    .from(haikus)
    .leftJoin(categories, eq(haikus.categoryId, categories.id))
    .where(eq(haikus.id, parseInt(id)))
    .limit(1);
  if (!row[0]) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const owns = tokenMatches(token, row[0].manageTokenHash);
  const { manageTokenHash, ...haiku } = row[0];
  void manageTokenHash;
  return NextResponse.json({ haiku, owns });
}

// DELETE: the poet (with their token) or an admin may remove a haiku.
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const row = await db.select({ hash: haikus.manageTokenHash }).from(haikus).where(eq(haikus.id, parseInt(id))).limit(1);
  if (!row[0]) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const owns = tokenMatches(manageTokenFrom(request), row[0].hash);
  const isAdmin = await requireAdmin();
  if (!owns && !isAdmin) {
    return NextResponse.json({ error: "Not yours to delete" }, { status: 403 });
  }

  await db.delete(haikus).where(eq(haikus.id, parseInt(id)));
  return NextResponse.json({ deleted: true });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const isAdmin = await requireAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const { status, adminNotes } = body;

  if (!status || !["approved", "rejected", "edits_requested"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const updated = await db
    .update(haikus)
    .set({
      status,
      adminNotes: adminNotes ?? null,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(haikus.id, parseInt(id)))
    .returning();

  if (updated.length === 0) {
    return NextResponse.json({ error: "Haiku not found" }, { status: 404 });
  }

  return NextResponse.json({ haiku: updated[0] });
}
