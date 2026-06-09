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
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100">
        <div className="text-center mb-6">
          <div className="text-xs text-indigo-500 font-medium uppercase tracking-wide mb-1">
            Your Haiku
          </div>
          <div className="text-2xl font-serif italic text-gray-700 leading-relaxed">
            <span className={c1 === 5 ? "text-gray-800" : c1 > 5 ? "text-red-500" : "text-yellow-600"}>
              {line1 || "_____"}
            </span>
            <br />
            <span className={c2 === 7 ? "text-gray-800" : c2 > 7 ? "text-red-500" : "text-yellow-600"}>
              {line2 || "___________"}
            </span>
            <br />
            <span className={c3 === 5 ? "text-gray-800" : c3 > 5 ? "text-red-500" : "text-yellow-600"}>
              {line3 || "_____"}
            </span>
          </div>
          <div className="flex justify-center gap-3 mt-3 text-sm">
            <span className={c1 === 5 ? "text-green-600 font-bold" : "text-red-500"}>
              {c1} syl
            </span>
            <span className="text-gray-300">/</span>
            <span className={c2 === 7 ? "text-green-600 font-bold" : "text-red-500"}>
              {c2} syl
            </span>
            <span className="text-gray-300">/</span>
            <span className={c3 === 5 ? "text-green-600 font-bold" : "text-red-500"}>
              {c3} syl
            </span>
          </div>
        </div>

        <div className="space-y-3">
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
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title (optional)
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="A name for your haiku"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            maxLength={100}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategoryId(categoryId === cat.id ? null : cat.id)}
                className={`
                  px-3 py-1.5 rounded-full text-sm font-medium transition-all
                  ${categoryId === cat.id
                    ? "ring-2 ring-offset-2 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }
                `}
                style={categoryId === cat.id ? { backgroundColor: cat.color } : undefined}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Your name (optional)
            </label>
            <input
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="Anonymous"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              maxLength={50}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email (optional)
            </label>
            <input
              type="email"
              value={authorEmail}
              onChange={(e) => setAuthorEmail(e.target.value)}
              placeholder="For edit requests"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              maxLength={100}
            />
          </div>
        </div>
      </div>

      {submitError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {submitError}
        </div>
      )}

      <button
        type="submit"
        disabled={!isValid || isSubmitting}
        className={`
          w-full py-3 px-6 rounded-xl font-semibold text-lg transition-all duration-200
          ${isValid && !isSubmitting
            ? "bg-indigo-600 text-white hover:bg-indigo-700 active:scale-[0.98] shadow-lg shadow-indigo-200"
            : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }
        `}
      >
        {isSubmitting ? "Submitting..." : "Submit Haiku for Review"}
      </button>

      {!isValid && line1.trim().length + line2.trim().length + line3.trim().length > 0 && (
        <p className="text-center text-sm text-amber-600">
          {c1 !== 5 ? `Line 1 needs to be 5 syllables (currently ${c1}). ` : ""}
          {c2 !== 7 ? `Line 2 needs to be 7 syllables (currently ${c2}). ` : ""}
          {c3 !== 5 ? `Line 3 needs to be 5 syllables (currently ${c3}).` : ""}
        </p>
      )}
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
