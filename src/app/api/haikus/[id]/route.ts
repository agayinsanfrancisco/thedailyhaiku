import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { haikus } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";

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
