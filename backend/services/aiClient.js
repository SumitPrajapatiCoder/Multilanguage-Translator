const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");

const callAIService = async (payload) => {
    try {
        const res = await axios.post(
            process.env.AI_SERVICE_URL + "/translate",
            payload
        );
        return res.data;
    } catch (error) {
        console.error(
            "AI SERVICE ERROR:",
            error.response?.data || error.message
        );
        throw error;
    }
};


const callAIUploadService = async (fileUrl, targetLanguage) => {
    const res = await axios.post(
        process.env.AI_SERVICE_URL + "/upload",
        {
            fileUrl,
            targetLanguage,
        }
    );

    return res.data;
};


module.exports={callAIService,callAIUploadService}