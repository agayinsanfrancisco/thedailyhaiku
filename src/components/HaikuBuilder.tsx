"use client";

import { useState, useCallback } from "react";
import SyllableCounter from "./SyllableCounter";

interface Category {
  id: number;
  name: string;
  slug: string;
  color: string;
}

interface HaikuBuilderProps {
  categories: Category[];
  onSubmit: (data: {
    line1: string;
    line2: string;
    line3: string;
    title: string;
    categoryId: number | null;
    authorName: string;
    authorEmail: string;
  }) => Promise<void>;
  isSubmitting: boolean;
  submitError: string | null;
}

export default function HaikuBuilder({
  categories,
  onSubmit,
  isSubmitting,
  submitError,
}: HaikuBuilderProps) {
  const [line1, setLine1] = useState("");
  const [line2, setLine2] = useState("");
  const [line3, setLine3] = useState("");
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [authorName, setAuthorName] = useState("");
  const [authorEmail, setAuthorEmail] = useState("");

  const getCounts = useCallback((l1: string, l2: string, l3: string) => {
    return {
      c1: countSyllablesSimple(l1),
      c2: countSyllablesSimple(l2),
      c3: countSyllablesSimple(l3),
    };
  }, []);

  const { c1, c2, c3 } = getCounts(line1, line2, line3);
  const isValid = c1 === 5 && c2 === 7 && c3 === 5 && (line1.trim() && line2.trim() && line3.trim());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || isSubmitting) return;
    await onSubmit({
      line1: line1.trim(),
      line2: line2.trim(),
      line3: line3.trim(),
      title: title.trim(),
      categoryId,
      authorName: authorName.trim(),
      authorEmail: authorEmail.trim(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="border border-[var(--rule)] p-6 bg-[var(--surface)]">
        <div className="text-center mb-6">
          <div className="text-xs text-[var(--ink-muted)] font-[system-ui] tracking-widest uppercase mb-3">
            Your Haiku
          </div>
          <div className="text-xl font-serif leading-relaxed space-y-1">
            <p className={c1 === 5 ? "text-[var(--ink)]" : c1 > 5 ? "text-[var(--accent)]" : "text-[var(--ink-muted)]"}>
              {line1 || "______"}
            </p>
            <p className={c2 === 7 ? "text-[var(--ink)]" : c2 > 7 ? "text-[var(--accent)]" : "text-[var(--ink-muted)]"}>
              {line2 || "__________"}
            </p>
            <p className={c3 === 5 ? "text-[var(--ink)]" : c3 > 5 ? "text-[var(--accent)]" : "text-[var(--ink-muted)]"}>
              {line3 || "______"}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <SyllableCounter
            line={line1}
            target={5}
            index={0}
            onChange={setLine1}
          />
          <SyllableCounter
            line={line2}
            target={7}
            index={1}
            onChange={setLine2}
          />
          <SyllableCounter
            line={line3}
            target={5}
            index={2}
            onChange={setLine3}
          />
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-[system-ui] text-[var(--ink-muted)] mb-1">
            Title <span className="text-[var(--accent-dim)]">(optional)</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="A name for your haiku"
            className="w-full px-3 py-2 border border-[var(--rule)] bg-transparent text-sm focus:outline-none focus:border-[var(--ink)] transition-colors placeholder:text-[var(--accent-dim)]"
            maxLength={100}
          />
        </div>

        <div>
          <label className="block text-xs font-[system-ui] text-[var(--ink-muted)] mb-2">
            Category
          </label>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategoryId(categoryId === cat.id ? null : cat.id)}
                className={`
                  px-3 py-1 text-xs font-[system-ui] border transition-colors
                  ${categoryId === cat.id
                    ? "border-[var(--accent)] text-[var(--accent)] bg-[var(--surface)]"
                    : "border-[var(--rule)] text-[var(--ink-muted)] hover:border-[var(--ink-muted)]"
                  }
                `}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-[system-ui] text-[var(--ink-muted)] mb-1">
              Your name <span className="text-[var(--accent-dim)]">(optional)</span>
            </label>
            <input
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="Anonymous"
              className="w-full px-3 py-2 border border-[var(--rule)] bg-transparent text-sm focus:outline-none focus:border-[var(--ink)] transition-colors placeholder:text-[var(--accent-dim)]"
              maxLength={50}
            />
          </div>
          <div>
            <label className="block text-xs font-[system-ui] text-[var(--ink-muted)] mb-1">
              Email <span className="text-[var(--accent-dim)]">(optional)</span>
            </label>
            <input
              type="email"
              value={authorEmail}
              onChange={(e) => setAuthorEmail(e.target.value)}
              placeholder="For edit requests"
              className="w-full px-3 py-2 border border-[var(--rule)] bg-transparent text-sm focus:outline-none focus:border-[var(--ink)] transition-colors placeholder:text-[var(--accent-dim)]"
              maxLength={100}
            />
          </div>
        </div>
      </div>

      {submitError && (
        <div className="border border-[var(--accent)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--accent)]">
          {submitError}
        </div>
      )}

      <button
        type="submit"
        disabled={!isValid || isSubmitting}
        className={`
          w-full py-3 text-sm font-[system-ui] tracking-wider uppercase border-2 transition-colors
          ${isValid && !isSubmitting
            ? "border-[var(--ink)] text-[var(--ink)] hover:bg-[var(--ink)] hover:text-[var(--paper)]"
            : "border-[var(--accent-dim)] text-[var(--accent-dim)] cursor-not-allowed"
          }
        `}
      >
        {isSubmitting ? "Submitting..." : "Submit for Review"}
      </button>
    </form>
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
