import { NextRequest, NextResponse } from "next/server";
import { validateEventForDate } from "@/lib/claude";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventTitle, date, link } = body;

    if (!eventTitle || !date || !link) {
      return NextResponse.json(
        { error: "Missing required fields: eventTitle, date, link" },
        { status: 400 },
      );
    }

    if (!link.startsWith("http://") && !link.startsWith("https://")) {
      return NextResponse.json(
        { error: "Invalid URL. Must start with http:// or https://" },
        { status: 400 },
      );
    }

    const result = await validateEventForDate(eventTitle, date, link);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Validation error:", error);
    return NextResponse.json(
      { valid: false, error: "Validation service unavailable" },
      { status: 500 },
    );
  }
}
