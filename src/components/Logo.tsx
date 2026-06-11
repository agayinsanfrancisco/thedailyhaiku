import Link from "next/link";

// The mark: seventeen dots — a haiku tallied. Rows of 5, 7, 5; the 7 in vermilion.
export function LogoMark({ className = "" }: { className?: string }) {
  const row = (cxs: number[], cy: number, v: boolean) =>
    cxs.map((cx) => (
      <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={2.3} fill={v ? "var(--accent)" : "var(--ink)"} />
    ));
  return (
    <svg viewBox="0 0 44 28" className={className} aria-label="the daily haiku — 5 7 5">
      {row([10, 16, 22, 28, 34], 5, false)}
      {row([4, 10, 16, 22, 28, 34, 40], 14, true)}
      {row([10, 16, 22, 28, 34], 23, false)}
    </svg>
  );
}

export default function Logo() {
  return (
    <Link href="/" className="brand">
      <LogoMark className="brand-mark" />
      <span className="brand-word">
        the daily haiku<i>.</i>
      </span>
    </Link>
  );
}
