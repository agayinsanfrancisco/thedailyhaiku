import { readFile } from "fs/promises";
import { join } from "path";

// Load the brand fonts as bytes for next/og (Satori). woff only — Satori
// can't read woff2. Cached across invocations.
const dir = join(process.cwd(), "node_modules", "@fontsource");
let cache: { name: string; data: Buffer; weight: 400; style: "normal" | "italic" }[] | null = null;

export async function ogFonts() {
  if (cache) return cache;
  const [young, instrument] = await Promise.all([
    readFile(join(dir, "young-serif/files/young-serif-latin-400-normal.woff")),
    readFile(join(dir, "instrument-serif/files/instrument-serif-latin-400-italic.woff")),
  ]);
  cache = [
    { name: "Young Serif", data: young, weight: 400, style: "normal" },
    { name: "Instrument Serif", data: instrument, weight: 400, style: "italic" },
  ];
  return cache;
}
