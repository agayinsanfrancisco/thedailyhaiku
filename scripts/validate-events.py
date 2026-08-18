#!/usr/bin/env python3
"""Validate data/events/*.json: shape, real dates, known slugs, no duplicate
(month, day, title), and report per-day coverage incl. LGBTQIA+ / Women's."""
import json, glob, calendar, collections, re, sys
SLUGS = {"movies-tv","music","sports","technology","science-nature","politics-history","literature","art-design","lgbtqia","womens-history"}
rows, errs = [], []
for f in sorted(glob.glob("data/events/*.json")):
    try: d = json.load(open(f))
    except Exception as e: errs.append(f"{f}: invalid JSON: {e}"); continue
    for i, e in enumerate(d):
        where = f"{f}[{i}]"
        if not isinstance(e, dict) or not {"m","d","t","c"} <= set(e): errs.append(f"{where}: missing keys"); continue
        m, dd = e["m"], e["d"]
        if not (isinstance(m,int) and 1<=m<=12 and isinstance(dd,int) and 1<=dd<=calendar.monthrange(2024,m)[1]): errs.append(f"{where}: bad date {m}/{dd}")
        if e["c"] not in SLUGS: errs.append(f"{where}: unknown slug {e['c']}")
        if e.get("y") is not None and not (isinstance(e["y"],int) and 1<=e["y"]<=2026): errs.append(f"{where}: bad year {e.get('y')}")
        t = e["t"]
        if not isinstance(t,str) or not (10 <= len(t) <= 110): errs.append(f"{where}: title length {len(t) if isinstance(t,str) else '?'}")
        elif t.rstrip().endswith("."): errs.append(f"{where}: trailing period: {t}")
        if f != "data/events/additional-events.json" and not str(e.get("s","")).startswith("http"): errs.append(f"{where}: missing source url")
        rows.append((f, e))
src = open("src/seed.ts").read()
seed_keys = {(int(m),int(dd),t) for m,dd,t in re.findall(r'\{ month: (\d+), day: (\d+), year: \d+, title: "([^"]+)"', src)}
seen = collections.Counter([(e["m"],e["d"],e["t"].strip().lower()) for _,e in rows] + [(m,d,t.lower()) for m,d,t in seed_keys])
for k,n in seen.items():
    if n>1: errs.append(f"duplicate: {k[0]}/{k[1]} {k[2]!r} x{n}")
# Fuzzy duplicates: same day, same year, heavy word overlap (different wording of one fact).
STOP = {"the","a","an","of","in","on","at","to","for","and","is","are","as","by","with","first","becomes","become","his","her","its","from","after","that","new"}
def toks(t): return {w for w in re.findall(r"[a-z0-9']+", t.lower()) if w not in STOP and len(w) > 2}
by_day = collections.defaultdict(list)
for f,e in rows: by_day[(e["m"],e["d"],e.get("y"))].append((f,e["t"]))
for m,dd,t in seed_keys:
    y = re.search(r'month: %d, day: %d, year: (\d+), title: "%s"' % (m,dd,re.escape(t)), src)
    by_day[(m,dd,int(y.group(1)) if y else None)].append(("src/seed.ts",t))
for key,lst in by_day.items():
    for i in range(len(lst)):
        for j in range(i+1,len(lst)):
            a,b = toks(lst[i][1]), toks(lst[j][1])
            if a and b and len(a&b)/min(len(a),len(b)) >= 0.5:
                errs.append(f"fuzzy-dup {key[0]}/{key[1]} {key[2]}: {lst[i][1]!r} ({lst[i][0]}) ~ {lst[j][1]!r} ({lst[j][0]})")
per = collections.defaultdict(collections.Counter)
for _,e in rows: per[(e["m"],e["d"])][e["c"]] += 1
for m,d,_ in seed_keys: per[(m,d)]["seed"] += 1
missing_l, missing_w, thin = [], [], []
for m in range(1,13):
    for dd in range(1,calendar.monthrange(2024,m)[1]+1):
        c = per[(m,dd)]
        if not c["lgbtqia"]: missing_l.append(f"{m}/{dd}")
        if not c["womens-history"]: missing_w.append(f"{m}/{dd}")
        if sum(c.values()) < 4: thin.append(f"{m}/{dd}({sum(c.values())})")
print(f"events: {len(rows)} in {len(set(f for f,_ in rows))} files; errors: {len(errs)}")
for e in errs[:60]: print("  ERR", e)
print(f"days without LGBTQIA+: {len(missing_l)} {' '.join(missing_l[:40])}")
print(f"days without Women's:  {len(missing_w)} {' '.join(missing_w[:40])}")
print(f"days with <4 total:    {len(thin)} {' '.join(thin[:40])}")
sys.exit(1 if errs else 0)
