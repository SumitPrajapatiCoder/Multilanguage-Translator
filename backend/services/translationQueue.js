const axios = require("axios");

const queue = [];
let processing = false;

async function processQueue(io) {

    if (processing) return;
    processing = true;

    while (queue.length) {

        const job = queue.shift();

        const {
            roomId,
            text,
            sourceLang,
            participants,
            speakerId,
            speakerGender  
        } = job;

        const targets = participants.filter(p =>
            p.socketId !== speakerId &&
            p.language !== sourceLang
        );

        await Promise.all(
            targets.map(async (p) => {

                // try {

                //     const res = await axios.post(
                //         "http://127.0.0.1:8000/translate-stream",
                //         {
                //             text,
                //             sourceLanguage: sourceLang,
                //             targetLanguage: p.language,
                //             gender: speakerGender  
                //         }
                //     );

                //     io.to(p.socketId).emit("translated-text", {
                //         text: res.data.translated_text,
                //         audio: "data:audio/mp3;base64," + res.data.audio_base64,
                //         speakerId
                //     });

                // } catch (err) {
                //     console.error("Translation error:", err.message);
                // }



                try {

                    const res = await axios.post(
                        "http://127.0.0.1:8000/translate-stream",
                        {
                            text,
                            sourceLanguage: sourceLang,
                            targetLanguage: targets[0]?.language, // just one
                            gender: speakerGender
                        }
                    );

                    targets.forEach((p) => {
                        io.to(p.socketId).emit("translated-text", {
                            text: res.data.translated_text,
                            audio: "data:audio/mp3;base64," + res.data.audio_base64,
                            speakerId
                        });
                    });

                } catch (err) {
                    console.error("Translation error:", err.message);
                }

            })
        );
    }

    processing = false;
}




module.exports = { queue, processQueue };