export default async function handler(req, res) {
  try {
    // Fetch a random German word summary from Wiktionary
    const resp = await fetch(
      "https://de.wiktionary.org/api/rest_v1/page/random/summary"
    );

    const data = await resp.json();

    const word = data?.title || "";
    const extract = data?.extract || "";

    let ipa = null;
    let audio = null;

    // Fetch page media to look for pronunciation audio
    if (data?.titles?.canonical) {
      const mediaResp = await fetch(
        `https://de.wiktionary.org/api/rest_v1/page/media/${encodeURIComponent(
          data.titles.canonical
        )}`
      );

      const media = await mediaResp.json();

      if (media?.items?.length) {
        for (const item of media.items) {
          if (item.type === "audio" && item?.src?.includes(".ogg")) {
            audio = item.src;
          }
        }
      }
    }

    // Best-effort IPA scrape from HTML
    if (data?.extract_html?.includes("IPA")) {
      const match = data.extract_html.match(/IPA[^[]*\[([^\]]+)]/);
      if (match) ipa = match[1];
    }

    const result = {
      source: "wiktionary",
      word,
      translation: extract,
      ipa: ipa || null,
      audio: audio || null,
      fetched_at: new Date().toISOString()
    };

    res.setHeader("Content-Type", "application/json");
    res.status(200).json(result);
  } catch (e) {
    res.status(500).json({
      error: "Failed to fetch word",
      details: e.message
    });
  }
}

