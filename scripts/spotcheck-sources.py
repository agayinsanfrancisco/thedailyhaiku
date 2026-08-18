#!/usr/bin/env python3
"""For each station event, fetch its source and check the page text mentions the
year and the exact month/day. Writes a report of misses to stdout (JSON lines)."""
import json, glob, re, sys, time, urllib.request, urllib.parse, calendar
UA = {"User-Agent": "thedailyhaiku-research/1.0 (mccammonrb@gmail.com)"}
cache = {}
def fetch(url):
    if url in cache: return cache[url]
    try:
        if "wikipedia.org/wiki/" in url:
            title = urllib.parse.unquote(url.split("/wiki/",1)[1].split("#")[0])
            api = "https://en.wikipedia.org/w/api.php?action=parse&redirects=1&prop=wikitext&format=json&page=" + urllib.parse.quote(title)
            j = json.load(urllib.request.urlopen(urllib.request.Request(api, headers=UA), timeout=20))
            txt = j.get("parse",{}).get("wikitext",{}).get("*","")
        else:
            txt = urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=20).read(2_000_000).decode("utf8","ignore")
            txt = re.sub(r"<[^>]+>", " ", txt)
        txt = re.sub(r"\s+", " ", txt)
    except Exception as e:
        txt = f"__ERR__ {e}"
    cache[url] = txt; time.sleep(0.25); return txt
files = sys.argv[1:] or sorted(glob.glob("data/events/*-lgbtq-womens.json"))
n = ok = 0
for f in files:
    for e in json.load(open(f)):
        n += 1
        txt = fetch(e["s"])
        mon = calendar.month_name[e["m"]]; d = e["d"]; y = str(e["y"])
        day_pat = rf"\b{mon}\s+{d}\b|\b{d}\s+{mon}\b|\b{mon[:3]}\.?\s+{d}\b|\b{d}\s+{mon[:3]}\b|\|{e['m']}\|{d}\b|-{e['m']:02d}-{d:02d}\b|/{e['m']:02d}/{d:02d}"
        has_day = bool(re.search(day_pat, txt, re.I)); has_year = y in txt
        wiki_daypage = bool(re.search(r"wikipedia.org/wiki/[A-Z][a-z]+_\d+$", e["s"]))
        if txt.startswith("__ERR__") or not has_year or (not has_day and not wiki_daypage):
            print(json.dumps({"file": f, "m": e["m"], "d": d, "y": e["y"], "t": e["t"], "c": e["c"], "s": e["s"], "err": txt[:80] if txt.startswith("__ERR__") else "", "year": has_year, "day": has_day}))
        else: ok += 1
print(f"# checked {n}, ok {ok}, flagged {n-ok}", file=sys.stderr)
