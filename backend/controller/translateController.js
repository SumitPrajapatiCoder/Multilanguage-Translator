const { callAIService } = require("../services/aiClient");
const translationHistory = require("../models/translationHistoryModel");

const livekitHost = process.env.LIVEKIT_URL;
const apiKey = process.env.LIVEKIT_API_KEY;
const apiSecret = process.env.LIVEKIT_API_SECRET;


const translateController = async (req, res) => {
  try {
    const { text, targetLanguage, inputLanguage, mode } = req.body;
    const userId = req.userId;

    const data = await callAIService({
      text,
      targetLanguage,
      inputLanguage,
      mode,
    });

    await translationHistory.create({
      user: userId,
      originalText: text,
      translatedText: data.translated_text,
      detectedLanguage: data.detected_language,
      targetLanguage,
      audioUrl: data.audio_url,
      audioPublicId: data.audio_public_id,
    });

    res.json(data);

  } catch (err) {
    console.error("Translate error:", err);
    res.status(500).json({ error: "Translation failed" });
  }
};



module.exports = {translateController};