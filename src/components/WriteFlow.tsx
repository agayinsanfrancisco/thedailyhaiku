"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { countLineSyllables } from "@/lib/syllable";
import { INKS, PRIDE_GRADIENT } from "@/lib/design";

type EventItem = {
  id: number;
  year: number | null;
  title: string;
  description: string | null;
  categoryName: string | null;
  categorySlug: string | null;
};
type Category = { id: number; name: string; slug: string; color: string };

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const STOP = new Set(["a", "an", "the", "of", "and", "or", "is", "in", "on", "to", "above", "with", "for", "at", "by"]);
const INK_NAMES = [...Object.keys(INKS), "pride"];

function pad(n: number) {
  return String(n).padStart(2, "0");
}
function tidyHeadline(t: string) {
  t = t.trim().replace(/\s+/g, " ").replace(/^["'“]+|["'”]+$/g, "").replace(/\.$/, "");
  return t ? t.charAt(0).toUpperCase() + t.slice(1) : t;
}

export default function WriteFlow({ initialDate, initialEvent }: { initialDate?: string; initialEvent?: number }) {
  const router = useRouter();
  const today = useMemo(() => new Date(), []);
  const [calY, setCalY] = useState(today.getFullYear());
  const [calM, setCalM] = useState(today.getMonth());
  const [taken, setTaken] = useState<Record<string, string>>({});

  const [sel, setSel] = useState<{ y: number; m: number; d: number } | null>(null);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [selEventId, setSelEventId] = useState<number | null>(null);
  const [own, setOwn] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  const [lines, setLines] = useState(["", "", ""]);
  const [word, setWord] = useState("");
  const [ink, setInk] = useState("vermilion");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [wantApproval, setWantApproval] = useState(true);
  const [wantDaily, setWantDaily] = useState(true);

  // own-moment fields
  const [ownTitle, setOwnTitle] = useState("");
  const [ownLink, setOwnLink] = useState("");
  const [ownCat, setOwnCat] = useState("Movies & TV");
  const [ownDesc, setOwnDesc] = useState("");
  const [pullState, setPullState] = useState<"idle" | "loading" | "ok" | "err">("idle");
  const [pullErr, setPullErr] = useState("");

  const [err, setErr] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [pastNudge, setPastNudge] = useState<{ y: number; m: number; d: number } | null>(null);

  const stage = sel ? (selEventId !== null || own ? 3 : 2) : 1;

  // load categories + availability
  useEffect(() => {
    fetch("/api/categories").then((r) => r.json()).then((d) => setCategories(d.categories ?? []));
  }, []);
  useEffect(() => {
    fetch(`/api/dates?year=${calY}`).then((r) => r.json()).then((d) => setTaken(d.takenDates ?? {}));
  }, [calY]);

  // deep-link: ?date=MM-DD&event=ID
  const bootstrapped = useRef(false);
  useEffect(() => {
    if (bootstrapped.current || !initialDate) return;
    bootstrapped.current = true;
    const [m, d] = initialDate.split("-").map(Number);
    if (m && d) pickDay(today.getFullYear(), m - 1, d, initialEvent);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialDate, initialEvent]);

  function loadEvents(y: number, m: number, d: number, preselect?: number) {
    setEventsLoading(true);
    fetch(`/api/events?date=${pad(m + 1)}-${pad(d)}`)
      .then((r) => r.json())
      .then((data) => {
        const evs: EventItem[] = data.events ?? [];
        setEvents(evs);
        setEventsLoading(false);
        if (preselect && evs.some((e) => e.id === preselect)) pickEvent(preselect, evs);
      })
      .catch(() => setEventsLoading(false));
  }

  function pickDay(y: number, m: number, d: number, preselect?: number) {
    const isPast = new Date(y, m, d) < new Date(today.getFullYear(), today.getMonth(), today.getDate());
    if (isPast && !preselect) {
      setPastNudge({ y, m, d });
      return;
    }
    setSel({ y, m, d });
    setSelEventId(null);
    setOwn(false);
    setCalY(y);
    setCalM(m);
    loadEvents(y, m, d, preselect);
  }

  function pickEvent(id: number, evs = events) {
    setSelEventId(id);
    setOwn(false);
    const e = evs.find((x) => x.id === id);
    if (e?.categorySlug === "lgbtqia" && ink !== "pride") setInk("pride");
  }
  function chooseOwn() {
    setOwn(true);
    setSelEventId(null);
  }

  // metadata pull for own moment
  const pullTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  function onLink(v: string) {
    setOwnLink(v);
    if (pullTimer.current) clearTimeout(pullTimer.current);
    if (!v.trim()) {
      setPullState("idle");
      return;
    }
    setPullState("loading");
    pullTimer.current = setTimeout(async () => {
      try {
        const res = await fetch("/api/moments/preview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: v.startsWith("http") ? v : `https://${v}` }),
        });
        const data = await res.json();
        if (!res.ok) {
          setPullState("err");
          setPullErr(data.error ?? "couldn't read that link");
          return;
        }
        if (data.description) setOwnDesc(data.description);
        if (!ownTitle && data.title) setOwnTitle(tidyHeadline(data.title));
        setPullState("ok");
      } catch {
        setPullState("err");
        setPullErr("we couldn't reach that link — paste a sentence below");
      }
    }, 400);
  }

  // word chips
  const chips = useMemo(() => {
    const ws = lines.flatMap((l) => l.toLowerCase().replace(/[^a-z\s]/g, "").split(/\s+/));
    return [...new Set(ws)].filter((w) => w.length > 2 && !STOP.has(w));
  }, [lines]);

  const counts = lines.map((l) => countLineSyllables(l)) as [number, number, number];
  const targets = [5, 7, 5];
  const inkStyle = (n: string) => (n === "pride" ? PRIDE_GRADIENT : INKS[n]);
  const previewBg =
    ink === "pride"
      ? PRIDE_GRADIENT
      : (() => {
          const hex = INKS[ink];
          const rgb = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(",");
          return `linear-gradient(180deg, rgba(${rgb},0.85) 14%, rgba(${rgb},0.3) 94%)`;
        })();

  async function submit() {
    const bad = counts.findIndex((c, i) => c !== targets[i]);
    if (bad !== -1) {
      setErr(`line ${["one", "two", "three"][bad]} needs ${targets[bad]} syllables — it has ${counts[bad]}`);
      return;
    }
    if (!word.trim()) {
      setErr("pick your word — it becomes the front-page headline");
      return;
    }
    setErr("");
    setSubmitting(true);

    const l3 = /[.!?…—]$/.test(lines[2].trim()) ? lines[2].trim() : lines[2].trim() + ".";
    const ownCategory = categories.find((c) => c.name === ownCat);
    const selectedEvent = events.find((e) => e.id === selEventId);
    const categoryId = own
      ? ownCategory?.id ?? null
      : categories.find((c) => c.slug === selectedEvent?.categorySlug)?.id ?? null;

    const payload = {
      date: `${pad(sel!.m + 1)}-${pad(sel!.d)}`,
      line1: lines[0].trim(),
      line2: lines[1].trim(),
      line3: l3,
      categoryId,
      eventId: own ? null : selEventId,
      isFiller: false,
      eventHeadline: own ? tidyHeadline(ownTitle) : selectedEvent ? `${selectedEvent.year ?? ""} — ${selectedEvent.title}`.trim() : null,
      eventDescription: own ? ownDesc : selectedEvent?.description ?? null,
      eventSources: own && ownLink ? JSON.stringify([ownLink.startsWith("http") ? ownLink : `https://${ownLink}`]) : null,
      validationLink: own ? ownLink : null,
      authorName: name.trim() || null,
      authorEmail: email.trim() || null,
      seasonWord: word.trim(),
      seasonColor: ink,
      wantApproval,
      wantDaily,
    };

    try {
      const res = await fetch("/api/haikus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setErr(data.error ?? "something went wrong");
        setSubmitting(false);
        return;
      }
      setDone(true);
    } catch {
      setErr("network error — try again");
      setSubmitting(false);
    }
  }

  function reset() {
    setDone(false);
    setSel(null);
    setSelEventId(null);
    setOwn(false);
    setLines(["", "", ""]);
    setWord("");
    setErr("");
    setSubmitting(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // ---------- calendar ----------
  const firstDow = new Date(calY, calM, 1).getDay();
  const daysInMonth = new Date(calY, calM + 1, 0).getDate();
  const navMonth = (dir: number) => {
    let m = calM + dir;
    let y = calY;
    if (m < 0) { m = 11; y--; }
    if (m > 11) { m = 0; y++; }
    setCalM(m);
    setCalY(y);
  };
  const dateLabel = sel ? `${MONTHS[sel.m]} ${sel.d}` : "";

  return (
    <div className="relative z-[1] pb-24">
      <header className="text-center px-[4vw] pt-1 pb-7">
        <h1 className="font-display text-[clamp(1.8rem,4vw,2.6rem)]">
          pick a day. pin a <span className="text-[var(--accent)]">moment</span>.
        </h1>
        <p className="mt-3 text-[var(--ink-soft)] text-[0.95rem]">
          Every haiku here is about <b className="text-[var(--ink)]">pop culture</b> — a film, a song, a match, a launch, a moment people remember.
        </p>
      </header>

      <div
        className="grid gap-6 mx-auto px-[3vw] items-start transition-all duration-300"
        style={{
          maxWidth: stage === 3 ? 1320 : stage === 2 ? 880 : 520,
          gridTemplateColumns:
            stage === 3 ? "290px 320px minmax(0,1fr)" : stage === 2 ? "360px minmax(0,440px)" : "minmax(0,480px)",
          justifyContent: "center",
        }}
      >
        {/* column 1 — calendar */}
        <section className="panel">
          <PanelLabel n="一" h="Start here — pick your day" p="dotted days are taken" />
          <div className="flex justify-between items-center mb-4">
            <button onClick={() => navMonth(-1)} className="cal-nav">←</button>
            <b className="font-display text-[1.05rem]">{MONTHS[calM]} {calY}</b>
            <button onClick={() => navMonth(1)} className="cal-nav">→</button>
          </div>
          <div className="grid grid-cols-7 gap-1">
            {["s", "m", "t", "w", "t", "f", "s"].map((d, i) => (
              <div key={i} className="text-center text-[0.58rem] font-bold tracking-wider uppercase text-[var(--ink-faint)] py-1">{d}</div>
            ))}
            {Array.from({ length: firstDow }).map((_, i) => <div key={`e${i}`} />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const d = i + 1;
              const key = `${pad(calM + 1)}-${pad(d)}`;
              const isTaken = !!taken[key] && calY === today.getFullYear();
              const isSel = sel?.d === d && sel?.m === calM && sel?.y === calY;
              return (
                <button
                  key={d}
                  disabled={isTaken}
                  onClick={() => pickDay(calY, calM, d)}
                  className={`day${isTaken ? " written" : ""}${isSel ? " sel" : ""}`}
                >
                  {d}
                </button>
              );
            })}
          </div>
          <div className="flex gap-5 mt-4 text-[0.66rem] text-[var(--ink-faint)]">
            <span><i className="dot-legend open" /> open</span>
            <span><i className="dot-legend taken" /> written</span>
          </div>
        </section>

        {/* column 2 — moments */}
        {stage >= 2 && (
          <section className="panel" style={{ animation: "fade-up .5s ease" }}>
            <PanelLabel n="二" h="Pick a moment" p={dateLabel} />
            {eventsLoading ? (
              <div className="space-y-2">{[1, 2, 3].map((i) => <div key={i} className="h-14 rounded-[11px] bg-[var(--paper-deep)] animate-pulse" />)}</div>
            ) : (
              <div className={`grid gap-2 ${stage === 2 ? "sm:grid-cols-2" : "grid-cols-1"}`}>
                {events.map((e) => (
                  <button key={e.id} onClick={() => pickEvent(e.id)} className={`fact${selEventId === e.id ? " sel" : ""}`}>
                    {e.categoryName && <span className="fact-cat">{e.categoryName}</span>}
                    <span className="fact-txt">{e.year && <b>{e.year}</b>}{e.title}</span>
                  </button>
                ))}
                {events.length === 0 && <p className="text-[0.82rem] text-[var(--ink-faint)] italic py-2">No verified moment yet for this day — add your own.</p>}
              </div>
            )}
            <button onClick={chooseOwn} className="own-toggle">none of these? add your own moment +</button>
          </section>
        )}

        {/* column 3 — composer */}
        {stage === 3 && (
          <div className="flex flex-col gap-5" style={{ animation: "fade-up .5s ease" }}>
            <section className="panel">
              <PanelLabel n="三" h="Your seventeen syllables" p="about the moment you picked" />
              <p className="pop-note">
                <b>Pop culture only.</b> Pin a verifiable moment — headlines, a chart, a screen, a stage. Sources must be news, interviews, or archives — <b>not Wikipedia</b>.
              </p>

              {own && (
                <div className="flex flex-col gap-2 mb-5">
                  <input className="field" placeholder="title of the moment — e.g. 'Toy Story 4 wins the Oscar'" value={ownTitle} onChange={(e) => setOwnTitle(e.target.value)} />
                  <div className="grid grid-cols-[1fr_auto] gap-2">
                    <input className="field" placeholder="link — news, interview, archive (not Wikipedia)" value={ownLink} onChange={(e) => onLink(e.target.value)} />
                    <select className="field" value={ownCat} onChange={(e) => setOwnCat(e.target.value)}>
                      {categories.map((c) => <option key={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  {pullState !== "idle" && (
                    <div className={`pull ${pullState === "err" ? "err" : ""}`}>
                      {pullState === "loading" && <p className="text-[0.8rem] text-[var(--ink-faint)] italic">pulling the description…</p>}
                      {pullState === "err" && <p className="text-[0.8rem] text-[var(--accent)]">{pullErr}</p>}
                      {pullState === "ok" && (
                        <>
                          <p className="font-display text-[0.92rem] mb-1">{tidyHeadline(ownTitle) || "your moment"}</p>
                          <textarea className="w-full bg-transparent text-[0.8rem] leading-snug text-[var(--ink-soft)] resize-none outline-none" rows={3} value={ownDesc} onChange={(e) => setOwnDesc(e.target.value)} />
                          <p className="text-[0.62rem] uppercase tracking-wider text-[var(--ink-faint)] mt-1">pulled automatically — edit anything</p>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className="picked">
                <span className="picked-cat">{own ? "your moment" : events.find((e) => e.id === selEventId)?.categoryName?.toLowerCase()}</span>
                <span>{own ? tidyHeadline(ownTitle) || "fill in the moment above" : (() => { const e = events.find((x) => x.id === selEventId); return e ? `${e.year ?? ""} — ${e.title}` : ""; })()}</span>
              </div>

              {[0, 1, 2].map((i) => (
                <div key={i} className="line-row">
                  <input
                    className="line-input"
                    placeholder={`${["five", "seven", "five"][i]} syllables…`}
                    value={lines[i]}
                    onChange={(e) => setLines((p) => p.map((l, j) => (j === i ? e.target.value : l)))}
                  />
                  <Tally count={counts[i]} target={targets[i]} />
                </div>
              ))}
            </section>

            <section className="panel">
              <PanelLabel n="四" h="Your word & ink" p="tomorrow's headline" />
              <div className="grid grid-cols-[1fr_auto] gap-4 items-center">
                <input className="word-input" maxLength={24} placeholder="any word — it goes through approval" value={word} onChange={(e) => setWord(e.target.value)} />
                <div className="flex gap-[0.55rem]">
                  {INK_NAMES.map((n) => (
                    <button key={n} onClick={() => setInk(n)} title={n} className={`ink-dot${ink === n ? " sel" : ""}`} style={{ background: inkStyle(n) }} />
                  ))}
                </div>
              </div>
              {chips.length > 0 && (
                <div className="chips">
                  <span className="chips-label">from your poem:</span>
                  {chips.map((w) => (
                    <button key={w} onClick={() => setWord(w)} className={`chip${word === w ? " sel" : ""}`}>{w}</button>
                  ))}
                </div>
              )}
              <div className="mt-5 pt-4 border-t border-[var(--rule)] text-center">
                <span className="font-display" style={{ fontSize: "clamp(2rem,6vw,3.4rem)", lineHeight: 1, background: previewBg, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>{word || "·"}</span>
                <small className="block mt-2 text-[0.6rem] tracking-[0.26em] uppercase text-[var(--ink-faint)]">how it appears on the front page</small>
              </div>
            </section>

            <section className="panel">
              <PanelLabel n="五" h="Sign & stamp" p="both optional" />
              <div className="grid grid-cols-2 gap-2 mb-4">
                <input className="field-pill" placeholder="your name (or anonymous)" value={name} onChange={(e) => setName(e.target.value)} />
                <input className="field-pill" placeholder="email (for the two below)" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <label className="opt"><input type="checkbox" checked={wantApproval} onChange={(e) => setWantApproval(e.target.checked)} /><span><b>Tell me when it&rsquo;s approved</b> — with a private link to edit or delete it. No account.</span></label>
              <label className="opt"><input type="checkbox" checked={wantDaily} onChange={(e) => setWantDaily(e.target.checked)} /><span><b>Send me the daily word</b> — one email each morning: the word, the haiku, ten seconds.</span></label>
              <button onClick={submit} disabled={submitting} className="stamp-btn">{submitting ? "stamping…" : "stamp it"}</button>
              {err && <p className="text-[0.78rem] text-[var(--accent)] text-center mt-3">{err}</p>}
              <p className="text-[0.68rem] text-[var(--ink-faint)] text-center mt-3 leading-relaxed">Reviewed before publishing — the poem, your word, and your moment all get a human and a fact-check.</p>
            </section>
          </div>
        )}
      </div>

      {/* past-date nudge */}
      {pastNudge && (
        <Modal onClose={() => setPastNudge(null)}>
          <h3 className="font-display text-[1.5rem] mb-3">that day already <span className="text-[var(--accent)]">happened</span></h3>
          <p className="text-[0.88rem] leading-relaxed text-[var(--ink-soft)]">A future day takes over the <b className="text-[var(--ink)]">front page</b> when its morning comes. A past day goes straight to the archive — still yours forever, just quieter.</p>
          <p className="text-[0.88rem] leading-relaxed text-[var(--ink-soft)] mt-2">Claim a day that means something: <b className="text-[var(--ink)]">your birthday, an anniversary, the day you met.</b></p>
          <div className="flex flex-col gap-2 mt-5">
            <button onClick={() => { const n = pastNudge; setPastNudge(null); setCalY(today.getFullYear()); setCalM(today.getMonth()); pickDay(today.getFullYear(), today.getMonth(), today.getDate()); void n; }} className="act-main">take {MONTHS[today.getMonth()]} {today.getDate()} — today</button>
            <button onClick={() => { const n = pastNudge; setPastNudge(null); setSel(n); setSelEventId(null); setOwn(false); setCalY(n.y); setCalM(n.m); loadEvents(n.y, n.m, n.d); }} className="act-ghost">write for {MONTHS[pastNudge.m]} {pastNudge.d} anyway</button>
          </div>
        </Modal>
      )}

      {/* success */}
      {done && (
        <Modal onClose={reset}>
          <div className="text-center">
            <div className="success-seal"><svg viewBox="0 0 44 28" width={64}>{[[10,16,22,28,34],[4,10,16,22,28,34,40],[10,16,22,28,34]].map((row,ri)=>row.map((cx)=><circle key={`${ri}-${cx}`} cx={cx} cy={ri===0?5:ri===1?14:23} r={2.3} fill="var(--accent)" />))}</svg></div>
            <h3 className="font-display text-[1.6rem] mb-2">stamped<span className="text-[var(--accent)]">.</span></h3>
            <p className="text-[0.9rem] text-[var(--ink-soft)]">Your haiku for <b className="text-[var(--ink)]">{dateLabel}</b> is in review.</p>
            <div className="text-left mt-5 space-y-3 text-[0.84rem] text-[var(--ink-soft)] leading-snug">
              <p><span className="font-display text-[var(--accent)] mr-2">一</span>We fact-check your moment and read every poem — usually within a day.</p>
              <p><span className="font-display text-[var(--accent)] mr-2">二</span>Approved? You get an email with a private link to edit or delete it.</p>
              <p><span className="font-display text-[var(--accent)] mr-2">三</span>On the morning of <b className="text-[var(--ink)]">{dateLabel}</b>, your word takes over the front page.</p>
            </div>
            <div className="flex flex-col gap-2 mt-6">
              <button onClick={reset} className="act-main">write another day</button>
              <button onClick={() => router.push("/")} className="act-ghost">see today&rsquo;s haiku →</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function PanelLabel({ n, h, p }: { n: string; h: string; p?: string }) {
  return (
    <div className="flex items-baseline gap-3 mb-5">
      <span className="font-display text-[1rem] text-[var(--accent)]">{n}</span>
      <h2 className="text-[0.72rem] font-bold tracking-[0.26em] uppercase">{h}</h2>
      {p && <p className="ml-auto text-[0.72rem] text-[var(--ink-faint)]">{p}</p>}
    </div>
  );
}

function Tally({ count, target }: { count: number; target: number }) {
  const state = count === target ? "done" : count > target ? "over" : "";
  return (
    <div className={`tally ${state}`}>
      {Array.from({ length: Math.max(target, count) }).map((_, i) => (
        <i key={i} className={i < count ? "on" : ""} />
      ))}
      <b>{count}/{target}</b>
    </div>
  );
}

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="modal-veil" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal">
        <button className="modal-x" onClick={onClose}>✕</button>
        {children}
      </div>
    </div>
  );
}
