import { NextRequest, NextResponse } from "next/server";

// Pulls a link's Open Graph / meta metadata so a writer can submit just a
// title + URL and have the description auto-filled (then fact-checked).

const BLOCKED_SOURCES = /(^|\.)(wikipedia\.org|wikimedia\.org|fandom\.com|wikia\.com)$/i;

// SSRF guard: user-supplied URLs are fetched server-side, so refuse anything
// that could point inside our network.
const PRIVATE_HOST =
  /^(localhost|.*\.local|.*\.internal|0\.0\.0\.0|127\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.|\[?::1\]?$)/i;

const MAX_BYTES = 400_000;
const FETCH_TIMEOUT_MS = 15_000;

function extractMeta(html: string, prop: string): string | null {
  const patterns = [
    new RegExp(`<meta[^>]+(?:property|name)=["']${prop}["'][^>]+content=["']([^"']+)`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${prop}["']`, "i"),
  ];
  for (const re of patterns) {
    const m = html.match(re);
    if (m) return decodeEntities(m[1].trim());
  }
  return null;
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;|&#x27;/gi, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));
}

function extractDatePublished(html: string): string | null {
  const fromMeta =
    extractMeta(html, "article:published_time") ?? extractMeta(html, "datePublished");
  if (fromMeta) return fromMeta;
  const jsonLd = html.match(/"datePublished"\s*:\s*"([^"]+)"/);
  return jsonLd ? jsonLd[1] : null;
}

export async function POST(request: NextRequest) {
  let url: URL;
  try {
    const body = await request.json();
    url = new URL(String(body.url ?? ""));
  } catch {
    return cors(NextResponse.json({ error: "Provide a valid URL" }, { status: 400 }));
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return cors(NextResponse.json({ error: "Only http(s) links are supported" }, { status: 400 }));
  }
  if (PRIVATE_HOST.test(url.hostname)) {
    return cors(NextResponse.json({ error: "That host can't be used as a source" }, { status: 400 }));
  }
  if (BLOCKED_SOURCES.test(url.hostname)) {
    return cors(
      NextResponse.json(
        { error: "Wikipedia and fan wikis can't be the source — link the story they cite instead" },
        { status: 422 },
      ),
    );
  }

  try {
    const res = await fetch(url, {
      headers: {
        // several major outlets refuse obviously-bot UAs; a plain browser UA
        // is what their own social-unfurl crawlers see anyway
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36",
        Accept: "text/html",
      },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      redirect: "follow",
    });
    if (!res.ok) {
      return cors(
        NextResponse.json(
          { error: `That link answered with ${res.status} — check it still works` },
          { status: 422 },
        ),
      );
    }
    const html = (await res.text()).slice(0, MAX_BYTES);

    const title =
      extractMeta(html, "og:title") ??
      extractMeta(html, "twitter:title") ??
      decodeEntities(html.match(/<title[^>]*>([^<]+)/i)?.[1]?.trim() ?? "");
    const description =
      extractMeta(html, "og:description") ??
      extractMeta(html, "twitter:description") ??
      extractMeta(html, "description");

    return cors(
      NextResponse.json({
        title: title || null,
        description: description || null,
        domain: url.hostname.replace(/^www\./, ""),
        datePublished: extractDatePublished(html),
        // thin metadata → the admin card flags the description for manual review
        needsReview: !description,
      }),
    );
  } catch {
    return cors(
      NextResponse.json(
        { error: "We couldn't reach that link — paste a sentence about the moment instead" },
        { status: 422 },
      ),
    );
  }
}

export async function OPTIONS() {
  return cors(new NextResponse(null, { status: 204 }));
}

// The design previews are static files, so the route answers cross-origin.
// It returns only public page metadata, so a permissive CORS policy is safe.
function cors<T extends NextResponse>(res: T): T {
  res.headers.set("Access-Control-Allow-Origin", "*");
  res.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.headers.set("Access-Control-Allow-Headers", "Content-Type");
  return res;
}
