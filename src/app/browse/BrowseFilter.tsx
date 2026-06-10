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

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap gap-3 mb-10 items-end">
      <div>
        <label className="block text-xs font-[system-ui] text-[var(--ink-muted)] mb-1">
          Category
        </label>
        <select
          name="category"
          defaultValue={currentCategory ?? ""}
          className="px-3 py-2 border border-[var(--rule)] bg-transparent text-sm focus:outline-none focus:border-[var(--ink)] transition-colors"
        >
          <option value="">All categories</option>
          {categories.map((cat) => (
            <option key={cat.slug} value={cat.slug}>{cat.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-xs font-[system-ui] text-[var(--ink-muted)] mb-1">
          Author
        </label>
        <input
          type="text"
          name="author"
          defaultValue={currentAuthor ?? ""}
          placeholder="Search author..."
          className="px-3 py-2 border border-[var(--rule)] bg-transparent text-sm focus:outline-none focus:border-[var(--ink)] transition-colors w-40 placeholder:text-[var(--accent-dim)]"
        />
      </div>
      <div>
        <label className="block text-xs font-[system-ui] text-[var(--ink-muted)] mb-1">
          Date
        </label>
        <input
          type="text"
          name="date"
          defaultValue={currentDate ?? ""}
          placeholder="MM-DD (e.g. 06-10)"
          className="px-3 py-2 border border-[var(--rule)] bg-transparent text-sm focus:outline-none focus:border-[var(--ink)] transition-colors w-36 placeholder:text-[var(--accent-dim)]"
        />
      </div>
      <button
        type="submit"
        className="px-4 py-2 text-xs font-[system-ui] tracking-wider uppercase border-2 border-[var(--ink)] text-[var(--ink)] hover:bg-[var(--ink)] hover:text-[var(--paper)] transition-colors"
      >
        Filter
      </button>
      {(currentCategory || currentAuthor || currentDate) && (
        <Link
          href="/browse"
          className="px-4 py-2 text-xs font-[system-ui] text-[var(--ink-muted)] hover:text-[var(--ink)] transition-colors"
        >
          Clear
        </Link>
      )}
    </form>
  );
}
