import Link from "next/link";

export default function NotFound() {
  return (
    <div className="max-w-5xl mx-auto px-6 pt-24 pb-32">
      <p className="text-xs text-[var(--ink-muted)] tracking-widest uppercase mb-10">
        404 &mdash; a haiku
      </p>
      <div className="mb-12 space-y-3">
        <p className="text-2xl md:text-4xl text-[var(--ink)]">Page not found, dear friend &mdash;</p>
        <p className="text-2xl md:text-4xl text-[var(--ink)]">the link you followed has gone</p>
        <p className="text-2xl md:text-4xl text-[var(--accent)]">where old bookmarks sleep.</p>
      </div>
      <Link
        href="/"
        className="text-xs text-[var(--ink-muted)] hover:text-[var(--ink)] transition-colors underline underline-offset-2"
      >
        &larr; back to today&rsquo;s haiku
      </Link>
    </div>
  );
}
