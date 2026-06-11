"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Mine = { id: number; token: string; date: string };
type Loaded = {
  id: number;
  token: string;
  date: string;
  status: string;
  line1: string;
  line2: string;
  line3: string;
  seasonWord: string | null;
  categoryName: string | null;
};

const STATUS_LABEL: Record<string, string> = {
  pending: "in review",
  approved: "published",
  rejected: "not published",
  edits_requested: "edits requested",
};

function formatDate(mmdd: string) {
  const [m, d] = mmdd.split("-").map(Number);
  return new Date(0, m - 1, d).toLocaleDateString("en-US", { month: "long", day: "numeric" });
}

export default function MineClient() {
  const [items, setItems] = useState<Loaded[] | null>(null);

  useEffect(() => {
    let mine: Mine[] = [];
    try {
      mine = JSON.parse(localStorage.getItem("dailyhaiku_mine") || "[]");
    } catch {
      mine = [];
    }
    // Recovery: a manage link from email (/mine?claim=ID.TOKEN) adds the haiku
    // to this device, then cleans the URL.
    const claim = new URLSearchParams(window.location.search).get("claim");
    if (claim) {
      const dot = claim.indexOf(".");
      const cid = Number(claim.slice(0, dot));
      const ctoken = decodeURIComponent(claim.slice(dot + 1));
      if (cid && ctoken && !mine.some((m) => m.id === cid)) {
        mine = [...mine, { id: cid, token: ctoken, date: "" }];
        try {
          localStorage.setItem("dailyhaiku_mine", JSON.stringify(mine));
        } catch {
          /* ignore */
        }
      }
      window.history.replaceState({}, "", "/mine");
    }
    if (mine.length === 0) {
      setItems([]);
      return;
    }
    Promise.all(
      mine.map((m) =>
        fetch(`/api/haikus/${m.id}?token=${encodeURIComponent(m.token)}`)
          .then((r) => (r.ok ? r.json() : null))
          .then((d) => (d?.haiku ? ({ ...d.haiku, token: m.token } as Loaded) : null))
          .catch(() => null),
      ),
    ).then((rows) => {
      const present = rows.filter(Boolean) as Loaded[];
      // prune localStorage entries whose haiku no longer exists
      const liveIds = new Set(present.map((p) => p.id));
      localStorage.setItem("dailyhaiku_mine", JSON.stringify(mine.filter((m) => liveIds.has(m.id))));
      setItems(present.sort((a, b) => b.id - a.id));
    });
  }, []);

  async function remove(item: Loaded) {
    if (!confirm("Delete this haiku? This can't be undone.")) return;
    const res = await fetch(`/api/haikus/${item.id}`, {
      method: "DELETE",
      headers: { "x-manage-token": item.token },
    });
    if (res.ok) {
      setItems((prev) => (prev ? prev.filter((p) => p.id !== item.id) : prev));
      try {
        const mine: Mine[] = JSON.parse(localStorage.getItem("dailyhaiku_mine") || "[]");
        localStorage.setItem("dailyhaiku_mine", JSON.stringify(mine.filter((m) => m.id !== item.id)));
      } catch {
        /* ignore */
      }
    } else {
      alert("Couldn't delete that — the link may have expired.");
    }
  }

  return (
    <div className="relative z-[1] max-w-2xl mx-auto px-[4vw] pt-8 pb-24">
      <div className="text-center mb-3">
        <p className="text-[0.72rem] font-bold tracking-[0.42em] uppercase text-[var(--accent)] mb-2">kept in this browser</p>
        <h1 className="font-display text-[clamp(2rem,5vw,3rem)]">your haikus</h1>
        <p className="mt-3 text-[var(--ink-soft)] text-[0.92rem]">No account — these live on this device. Clear your browser and they&rsquo;re gone from here (but stay published).</p>
      </div>

      {items === null ? (
        <p className="text-center text-[var(--ink-faint)] mt-16">loading…</p>
      ) : items.length === 0 ? (
        <div className="text-center mt-16 text-[var(--ink-soft)]">
          <p className="font-display text-2xl">nothing here yet</p>
          <p className="mt-2 text-sm">
            <Link href="/write" className="text-[var(--accent)] underline underline-offset-2">Write one</Link> and it&rsquo;ll appear here.
          </p>
        </div>
      ) : (
        <div className="mt-10 flex flex-col gap-4">
          {items.map((h) => (
            <div key={h.id} className="panel">
              <div className="flex items-center gap-2 mb-4 text-[0.62rem] font-bold tracking-[0.18em] uppercase">
                <span className="text-[var(--accent)]">{formatDate(h.date)}</span>
                {h.categoryName && <span className="text-[var(--ink-faint)]">· {h.categoryName}</span>}
                <span className="ml-auto text-[var(--ink-faint)]">{STATUS_LABEL[h.status] ?? h.status}</span>
              </div>
              <div className="font-display text-[1.18rem] leading-[1.7]">
                <p>{h.line1}</p>
                <p>{h.line2}</p>
                <p style={{ color: "var(--accent)" }}>{h.line3}</p>
              </div>
              <div className="flex items-center gap-4 mt-4 text-[0.78rem]">
                {h.status === "approved" && (
                  <Link href={`/haiku/${h.id}`} className="text-[var(--ink-soft)] hover:text-[var(--accent)] underline underline-offset-2">view</Link>
                )}
                <button onClick={() => remove(h)} className="text-[var(--ink-soft)] hover:text-[var(--accent)] underline underline-offset-2 ml-auto">delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
