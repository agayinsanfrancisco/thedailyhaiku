import { ImageResponse } from "next/og";
import { ogFonts } from "@/lib/og-fonts";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "the daily haiku — one poem per day, inspired by pop culture history";

const PAPER = "#f7f3ea";
const INK = "#1a1812";
const ACCENT = "#c2391b";

export default async function Image() {
  const fonts = await ogFonts();
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%", height: "100%", background: PAPER, color: INK,
          display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center",
          textAlign: "center", padding: 80, fontFamily: "Young Serif",
        }}
      >
        <div style={{ display: "flex", fontFamily: "Instrument Serif", fontStyle: "italic", fontSize: 88 }}>
          the daily haiku<span style={{ color: ACCENT }}>.</span>
        </div>
        <div style={{ display: "flex", fontSize: 34, color: "rgba(26,24,18,0.6)", marginTop: 18 }}>
          one poem a day · inspired by pop culture history
        </div>
        <div style={{ display: "flex", fontSize: 22, letterSpacing: "0.3em", textTransform: "uppercase", color: ACCENT, marginTop: 40 }}>
          5 · 7 · 5
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}
