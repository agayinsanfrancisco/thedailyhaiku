import { wordGradient } from "@/lib/design";

// The giant season word. Sized from its length so it fills the column without
// ever clipping — deterministic, no layout-measuring JS. The per-character
// rise is pure CSS, so it animates with or without hydration.
export default function HeroWord({ word, color }: { word: string; color?: string | null }) {
  // ~0.55em average advance for Young Serif italic; cap so the word fits 760px.
  const n = Math.max(word.replace(/\s/g, "").length, 1);
  const capRem = Math.max(3.2, Math.min(12, 760 / n / 16 / 0.55));
  return (
    <h1
      className="font-display italic mx-auto text-center whitespace-nowrap"
      style={{
        fontSize: `clamp(3rem, 13vw, ${capRem.toFixed(2)}rem)`,
        lineHeight: 0.95,
        letterSpacing: "-0.035em",
        maxWidth: "92vw",
        background: wordGradient(color),
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        color: "transparent",
      }}
    >
      {[...word].map((ch, i) => (
        <span key={i} className="rise-ch" style={{ animationDelay: `${0.25 + i * 0.05}s` }}>
          {ch === " " ? " " : ch}
        </span>
      ))}
    </h1>
  );
}
