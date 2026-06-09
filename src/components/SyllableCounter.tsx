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
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-gray-500 w-12">
          Line {index + 1} ({target})
        </span>
        <input
          type="text"
          value={line}
          onChange={(e) => onChange(e.target.value)}
          placeholder={index === 0 ? "five syllables here" : index === 1 ? "seven syllables in this line" : "back to five again"}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-lg"
          maxLength={100}
        />
        <span
          className={`
            text-xs font-bold px-2 py-1 rounded-full min-w-[2rem] text-center
            ${isTarget ? "bg-green-100 text-green-700" : ""}
            ${isOver ? "bg-red-100 text-red-700" : ""}
            ${isUnder ? "bg-yellow-100 text-yellow-700" : ""}
            ${line.trim().length === 0 ? "bg-gray-100 text-gray-400" : ""}
          `}
        >
          {count}
        </span>
      </div>
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
