import { syllable } from "syllable";

// "nineteen" is spelled "nine teen" because the syllable package miscounts
// the joined form as 3 (it's 2); the split form counts correctly
const ONES = ["zero","one","two","three","four","five","six","seven","eight","nine","ten",
  "eleven","twelve","thirteen","fourteen","fifteen","sixteen","seventeen","eighteen","nine teen"];
const TENS = ["","","twenty","thirty","forty","fifty","sixty","seventy","eighty","ninety"];

function belowHundredWords(n: number): string {
  if (n < 20) return ONES[n];
  return TENS[Math.floor(n / 10)] + (n % 10 ? " " + ONES[n % 10] : "");
}

// Numbers count as spoken aloud: 1982 → "nineteen eighty two" (5 syllables),
// 49 → "forty nine" (3). Four-digit numbers read year-style, the way a poet
// says them; 2000-2009 read as "two thousand six", 1905 as "nineteen oh five".
export function numberToSpokenWords(n: number): string {
  if (n < 100) return belowHundredWords(n);
  if (n < 1000) {
    const rem = n % 100;
    return ONES[Math.floor(n / 100)] + " hundred" + (rem ? " " + belowHundredWords(rem) : "");
  }
  if (n < 10000) {
    if (n % 1000 === 0) return ONES[n / 1000] + " thousand";
    if (n >= 2000 && n <= 2009) return "two thousand " + ONES[n - 2000];
    const pair1 = Math.floor(n / 100);
    const pair2 = n % 100;
    if (pair2 === 0) return belowHundredWords(pair1) + " hundred";
    if (pair2 < 10) return belowHundredWords(pair1) + " oh " + ONES[pair2];
    return belowHundredWords(pair1) + " " + belowHundredWords(pair2);
  }
  // beyond years, read digit groups plainly: 12345 → "twelve thousand three hundred forty five"
  return numberToSpokenWords(Math.floor(n / 1000)) + " thousand" +
    (n % 1000 ? " " + numberToSpokenWords(n % 1000) : "");
}

export function countSyllables(word: string): number {
  if (!word.trim()) return 0;
  // digits count as spoken: "1982" → "nineteen eighty two", "49," → "forty nine"
  if (/\d/.test(word)) {
    word = word.replace(/\d+/g, (d) => ` ${numberToSpokenWords(parseInt(d, 10))} `);
  }
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
