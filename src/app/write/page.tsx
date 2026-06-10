import Calendar from "@/components/Calendar";

export default function WritePage() {
  return (
    <article className="max-w-2xl mx-auto px-6 pt-16">
      <div className="mb-10">
        <p className="text-xs text-[var(--ink-muted)] tracking-widest uppercase font-[system-ui] mb-2">
          Write a Haiku
        </p>
        <h1 className="text-2xl font-serif">Pick a Date</h1>
        <p className="text-sm text-[var(--ink-muted)] mt-2">
          Green dates are open for new haikus.
        </p>
      </div>
      <Calendar />
    </article>
  );
}
