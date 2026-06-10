"use client";

interface SyllableCounterProps {
  line: string;
  target: number;
  index: number;
  onChange: (value: string) => void;
}

export default function SyllableCounter({
  line,
  target,
  index,
  onChange,
}: SyllableCounterProps) {
  const count = countSyllablesSimple(line);
  const isTarget = count === target;
  const isOver = count > target;
  const isUnder = count < target && line.trim().length > 0;

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs font-[system-ui] text-[var(--ink-muted)] w-12 shrink-0">
        Line {index + 1}
      </span>
      <input
        type="text"
        value={line}
        onChange={(e) => onChange(e.target.value)}
        placeholder={index === 0 ? "five syllables" : index === 1 ? "seven syllables" : "five syllables"}
        className="flex-1 px-3 py-2 border border-[var(--rule)] bg-transparent font-serif text-base focus:outline-none focus:border-[var(--ink)] transition-colors placeholder:text-[var(--accent-dim)]"
        maxLength={100}
      />
      <span
        className={`
          text-xs font-[system-ui] min-w-[2rem] text-center
          ${isTarget ? "text-[var(--ink)]" : ""}
          ${isOver ? "text-[var(--accent)]" : ""}
          ${isUnder ? "text-[var(--ink-muted)]" : ""}
          ${line.trim().length === 0 ? "text-[var(--accent-dim)]" : ""}
        `}
      >
        {count}/{target}
      </span>
    </div>
  );
}

function countSyllablesSimple(line: string): number {
  if (!line.trim()) return 0;
  const words = line.trim().toLowerCase().split(/\s+/);
  return words.reduce((sum, word) => {
    const cleaned = word.replace(/[^a-z]/g, "");
    if (!cleaned) return sum;
    const vowels = cleaned.match(/[aeiouy]+/g);
    let count = vowels ? vowels.length : 0;
    if (cleaned.endsWith("e") && count > 1) count--;
    if (cleaned.endsWith("le") && cleaned.length > 2) count++;
    if (cleaned.endsWith("les") && cleaned.length > 3) count++;
    if (count === 0) count = 1;
    return sum + count;
  }, 0);
}

export { countSyllablesSimple };
