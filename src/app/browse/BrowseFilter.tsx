"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";

interface BrowseFilterProps {
  categories: { name: string; slug: string }[];
  currentCategory: string | null;
  currentAuthor: string | null;
  currentDate: string | null;
}

export default function BrowseFilter({
  categories,
  currentCategory,
  currentAuthor,
  currentDate,
}: BrowseFilterProps) {
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const params = new URLSearchParams();
    const fd = new FormData(form);
    const category = fd.get("category") as string;
    const author = fd.get("author") as string;
    const date = fd.get("date") as string;
    if (category) params.set("category", category);
    if (author) params.set("author", author);
    if (date) params.set("date", date);
    const qs = params.toString();
    router.push(qs ? `/browse?${qs}` : "/browse");
  };

  const field =
    "px-4 py-2.5 rounded-full border border-[var(--rule)] bg-[var(--card)] text-sm outline-none focus:border-[var(--ink)] transition-colors placeholder:text-[var(--ink-faint)]";
  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap gap-2.5 justify-center items-center">
      <select name="category" defaultValue={currentCategory ?? ""} className={field}>
        <option value="">All categories</option>
        {categories.map((cat) => (
          <option key={cat.slug} value={cat.slug}>{cat.name}</option>
        ))}
      </select>
      <input type="text" name="author" defaultValue={currentAuthor ?? ""} placeholder="author…" className={`${field} w-36`} />
      <input type="text" name="date" defaultValue={currentDate ?? ""} placeholder="MM-DD" className={`${field} w-28`} />
      <button
        type="submit"
        className="px-5 py-2.5 rounded-full bg-[var(--ink)] text-[var(--paper)] text-xs font-bold tracking-[0.14em] uppercase hover:bg-[var(--accent)] transition-colors"
      >
        Filter
      </button>
      {(currentCategory || currentAuthor || currentDate) && (
        <Link href="/browse" className="px-3 py-2.5 text-xs text-[var(--ink-soft)] hover:text-[var(--accent)] transition-colors">
          Clear
        </Link>
      )}
    </form>
  );
}
