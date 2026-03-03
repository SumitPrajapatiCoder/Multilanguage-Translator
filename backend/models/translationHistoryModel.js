const mongoose = require("mongoose");

const translationHistorySchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            required: true,
        },

        originalText: String,
        translatedText: String,

        detectedLanguage: String,
        targetLanguage: String,

        originalFileUrl: String,
        originalFilePublicId: String,

        audioUrl: String,
        audioPublicId: String,
    },
    { timestamps: true }
);

module.exports = mongoose.model(
    "translationHistory",
    translationHistorySchema
);