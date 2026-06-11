// Shared design tokens + helpers for the paper-and-ink "the daily haiku." look.

// The poet's ink palette — curated to sit well on the washi-paper background.
export const INKS: Record<string, string> = {
  sumi: "#1a1812",
  vermilion: "#c2391b",
  indigo: "#3f4a7a",
  moss: "#5a6b4f",
  plum: "#6c4a72",
  ochre: "#a87b2f",
};

// Special ink for LGBTQIA+ history moments — a washi-muted pride flag.
export const PRIDE_GRADIENT =
  "linear-gradient(100deg, rgba(194,57,27,.85) 0%, rgba(201,122,43,.85) 20%, rgba(179,145,47,.85) 40%, rgba(79,122,69,.85) 60%, rgba(63,95,138,.85) 80%, rgba(108,74,114,.85) 100%)";

// The giant hero word's gradient fill, given a chosen ink name.
export function wordGradient(colorName: string | null | undefined): string {
  if (colorName === "pride") return PRIDE_GRADIENT;
  const hex = INKS[colorName ?? "sumi"] ?? INKS.sumi;
  const rgb = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(",");
  return `linear-gradient(180deg, rgba(${rgb},0.72) 18%, rgba(${rgb},0.16) 92%)`;
}

const STOP = new Set([
  "a", "an", "the", "of", "and", "or", "is", "in", "on", "to",
  "above", "under", "into", "with", "for", "at", "by", "we", "our", "your", "two", "one",
]);

const KIGO_FALLBACK: Record<number, string> = {
  1: "first snow", 2: "plum blossom", 3: "spring rain", 4: "cherry petals",
  5: "new leaves", 6: "firefly", 7: "cicada", 8: "milky way",
  9: "harvest moon", 10: "autumn dusk", 11: "falling leaves", 12: "deep winter",
};

// The word of the day: the poet's pick, else a strong word from the last line,
// else the month's kigo. (month is 1-12.)
export function wordOfTheDay(
  seasonWord: string | null | undefined,
  lines: string[],
  month: number,
): string {
  if (seasonWord && seasonWord.trim()) return seasonWord.trim();
  for (const line of [...lines].reverse()) {
    const words = line
      .toLowerCase()
      .replace(/[^a-z\s]/g, "")
      .split(/\s+/)
      .filter((w) => w.length > 3 && !STOP.has(w));
    if (words.length) return words.sort((a, b) => b.length - a.length)[0];
  }
  return KIGO_FALLBACK[month] ?? "today";
}
