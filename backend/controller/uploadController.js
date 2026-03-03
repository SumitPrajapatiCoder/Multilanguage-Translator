const { callAIUploadService } = require("../services/aiClient");
const translationHistory = require("../models/translationHistoryModel");

const uploadController = async (req, res) => {
    try {
        const file = req.file;
        const { targetLanguage } = req.body;
        const userId = req.userId;

        if (!file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        const fileUrl = file.path;
        const publicId = file.filename;

        const aiResponse = await callAIUploadService(
            fileUrl,
            targetLanguage
        );

        const history = await translationHistory.create({
            user: userId,
            originalText: aiResponse.original_text,
            translatedText: aiResponse.translated_text,
            detectedLanguage: aiResponse.detected_language,
            targetLanguage,
            originalFileUrl: fileUrl,
            originalFilePublicId: publicId,
            audioUrl: aiResponse.audio_url,
            audioPublicId: aiResponse.audio_public_id,
        });

        res.json(aiResponse);
    } catch (err) {
        console.error("Upload error:", err);
        res.status(500).json({ error: "Upload failed" });
    }
};

module.exports = { uploadController };