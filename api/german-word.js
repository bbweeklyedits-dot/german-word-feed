import fs from "fs";
import path from "path";

// Utility: get day of year (0-364)
function getDayOfYear() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now - start;
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

// TTS generator URL helper (Google Translate TTS)
function generateTTS(word) {
  // This returns a direct mp3 link to Google Translate TTS
  const encoded = encodeURIComponent(word);
  return `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&q=${encoded}&tl=de`;
}

export default async function handler(req, res) {
  try {
    // Read the local words.json file
    const filePath = path.join(process.cwd(), "words.json");
    const wordsData = fs.readFileSync(filePath, "utf-8");
    const words = JSON.parse(wordsData);

    if (!words.length) {
      throw new Error("Word list is empty");
    }

    // Pick word based on day-of-year
    const dayIndex = getDayOfYear() % words.length;
    const todayWord = words[dayIndex];

    // If no audio is provided, generate TTS URL
    if (!todayWord.audio) {
      todayWord.audio = generateTTS(todayWord.word);
    }

    // Add timestamp
    todayWord.fetched_at = new Date().toISOString();

    res.setHeader("Content-Type", "application/json");
    res.status(200).json(todayWord);
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch word", details: e.message });
  }
}
