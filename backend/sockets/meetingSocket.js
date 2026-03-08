const meetingModel = require("../models/meetingModel");
const { queue, processQueue } = require("../services/translationQueue");

module.exports = (io) => {

    io.on("connection", (socket) => {

        socket.on("join-room", async (data) => {

            try {

                const { meetingId, name, language, mode } = data;

                socket.join(meetingId);

                await meetingModel.updateOne(
                    { meetingId },
                    {
                        $pull: { participants: { socketId: socket.id } }
                    }
                );

                const meeting = await meetingModel.findOneAndUpdate(
                    { meetingId },
                    {
                        $push: {
                            participants: {
                                socketId: socket.id,
                                name,
                                language,
                                mode
                            }
                        }
                    },
                    { new: true }
                );

                if (!meeting) {
                    console.log("Meeting not found:", meetingId);
                    return;
                }

                io.to(meetingId).emit(
                    "participants-update",
                    meeting.participants
                );

            } catch (err) {

                console.error("Join room error:", err);

            }

        });

        socket.on("speech-text", async (data) => {

            const { meetingId, text, language } = data;

            const meeting =
                await meetingModel.findOne({ meetingId });

            queue.push({
                roomId: meetingId,
                text,
                sourceLang: language,
                participants: meeting.participants,
                speakerId: socket.id
            });

            processQueue(io);

        });

        socket.on("disconnect", async () => {

            try {

                await meetingModel.updateOne(
                    { "participants.socketId": socket.id },
                    {
                        $pull: { participants: { socketId: socket.id } }
                    }
                );

            } catch (err) {

                console.error("Disconnect cleanup error:", err);

            }

        });

    });

};