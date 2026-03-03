const translationHistory = require("../models/translationHistoryModel");
const cloudinary = require("../config/cloudinary2");

const getHistory = async (req, res) => {
    const history = await translationHistory
        .find({ user: req.userId })
        .sort({ createdAt: -1 });
    
    res.json(history);
}


const deleteHistory = async (req, res) => {
    const history = await translationHistory.findById(req.params.id);

    if (!history) return res.status(404).send("Not found");

    if (history.originalFilePublicId) {
        await cloudinary.uploader.destroy(history.originalFilePublicId, {
            resource_type: "video",
        });
    }

    if (history.audioPublicId) {
        await cloudinary.uploader.destroy(history.audioPublicId, {
            resource_type: "video",
        });
    }

    await history.deleteOne();

    res.json({ message: "Deleted successfully" });
}

module.exports={getHistory,deleteHistory};