// api/ig-thumb-scrape.js
export default async function handler(req, res) {
  try {
    const shortcode = (req.query.shortcode || "").trim();
    if (!shortcode) {
      return res.status(400).json({ error: "Missing ?shortcode=" });
    }

    // Use r.jina.ai to fetch the public IG HTML without CORS headaches
    // Works for public reels/posts; private/age-gated content won't return a cover.
    const target = `http://www.instagram.com/reel/${shortcode}/`;
    const proxyUrl = `https://r.jina.ai/${encodeURIComponent(target)}`;

    const r = await fetch(proxyUrl, {
      headers: {
        // a UA helps Jina return the full HTML
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123 Safari/537.36",
      },
    });

    if (!r.ok) {
      const text = await r.text().catch(() => "");
      return res.status(r.status).json({ error: "Fetch failed", detail: text.slice(0, 200) });
    }

    const html = await r.text();

    // Try og:image first
    let thumb =
      html.match(/property="og:image"\s+content="([^"]+)"/i)?.[1] ||
      html.match(/"thumbnail_url":"([^"]+)"/)?.[1]?.replace(/\\u0026/g, "&");

    // Best-effort clean-up (IG sometimes returns escaped URLs)
    if (thumb) {
      try {
        thumb = decodeURIComponent(thumb);
      } catch (_) {}
    }

    // Cache at the edge for a day to keep it snappy
    res.setHeader("Cache-Control", "public, s-maxage=86400, stale-while-revalidate=604800");
    return res.status(200).json({ thumbnail_url: thumb || null });
  } catch (e) {
    return res.status(500).json({ error: e?.message || "Unknown server error" });
  }
}
