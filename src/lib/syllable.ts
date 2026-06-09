import { syllable } from "syllable";

export function countSyllables(word: string): number {
  if (!word.trim()) return 0;
  try {
    return syllable(word);
  } catch {
    const cleaned = word.toLowerCase().replace(/[^a-z]/g, "");
    if (!cleaned) return 0;
    const vowels = cleaned.match(/[aeiouy]+/g);
    let count = vowels ? vowels.length : 0;
    if (cleaned.endsWith("e") && count > 1) count--;
    if (cleaned.endsWith("le") && cleaned.length > 2) count++;
    if (cleaned.endsWith("les") && cleaned.length > 3) count++;
    return Math.max(count, 1);
  }
}

export function countLineSyllables(line: string): number {
  if (!line.trim()) return 0;
  const words = line.trim().split(/\s+/);
  return words.reduce((sum, word) => sum + countSyllables(word), 0);
}

export function validateHaiku(
  line1: string,
  line2: string,
  line3: string,
): {
  valid: boolean;
  counts: [number, number, number];
  errors: string[];
} {
  const counts: [number, number, number] = [
    countLineSyllables(line1),
    countLineSyllables(line2),
    countLineSyllables(line3),
  ];
  const errors: string[] = [];
  if (counts[0] !== 5) errors.push(`Line 1 has ${counts[0]} syllables (need 5)`);
  if (counts[1] !== 7) errors.push(`Line 2 has ${counts[1]} syllables (need 7)`);
  if (counts[2] !== 5) errors.push(`Line 3 has ${counts[2]} syllables (need 5)`);
  return { valid: errors.length === 0, counts, errors };
}
