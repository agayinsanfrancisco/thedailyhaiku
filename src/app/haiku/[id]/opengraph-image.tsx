import { ImageResponse } from "next/og";
import { db } from "@/lib/db";
import { haikus, categories } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { wordOfTheDay, wordGradient } from "@/lib/design";
import { ogFonts } from "@/lib/og-fonts";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "a haiku from the daily haiku";

const PAPER = "#f7f3ea";
const INK = "#1a1812";
const ACCENT = "#c2391b";

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const fonts = await ogFonts();
  const row = await db
    .select({
      line1: haikus.line1, line2: haikus.line2, line3: haikus.line3,
      authorName: haikus.authorName, seasonWord: haikus.seasonWord, seasonColor: haikus.seasonColor,
      date: haikus.date, categoryName: categories.name,
    })
    .from(haikus)
    .leftJoin(categories, eq(haikus.categoryId, categories.id))
    .where(eq(haikus.id, parseInt(id)))
    .limit(1);

  const h = row[0];
  const month = h ? parseInt(h.date.split("-")[0]) : new Date().getMonth() + 1;
  const word = h ? wordOfTheDay(h.seasonWord, [h.line1, h.line2, h.line3], month) : "haiku";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%", height: "100%", background: PAPER, color: INK,
          display: "flex", flexDirection: "column", justifyContent: "center",
          padding: "70px 80px", fontFamily: "Young Serif",
        }}
      >
        <div style={{ display: "flex", fontFamily: "Instrument Serif", fontStyle: "italic", fontSize: 30, color: INK }}>
          the daily haiku<span style={{ color: ACCENT }}>.</span>
        </div>

        <div
          style={{
            display: "flex", fontFamily: "Young Serif", fontStyle: "italic",
            fontSize: 150, lineHeight: 1, letterSpacing: "-0.03em", margin: "8px 0 26px",
            backgroundImage: wordGradient(h?.seasonColor),
            backgroundClip: "text", WebkitBackgroundClip: "text", color: "transparent",
          }}
        >
          {word}
        </div>

        {h && (
          <div style={{ display: "flex", flexDirection: "column", fontSize: 46, lineHeight: 1.5 }}>
            <div style={{ display: "flex" }}>{h.line1}</div>
            <div style={{ display: "flex" }}>{h.line2}</div>
            <div style={{ display: "flex", color: ACCENT }}>{h.line3}</div>
          </div>
        )}

        <div style={{ display: "flex", marginTop: 30, fontFamily: "Instrument Serif", fontSize: 26, color: "rgba(26,24,18,0.6)" }}>
          {h?.authorName ? `— ${h.authorName}` : ""}
          {h?.categoryName ? `   ·   ${h.categoryName.toLowerCase()}` : ""}
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}
