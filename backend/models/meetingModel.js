const mongoose = require("mongoose");

const meetingSchema = new mongoose.Schema(
    {
        meetingId: {
            type: String,
            required: true,
            unique: true
        },

        meetingLink: {
            type: String
        },

        title: {
            type: String,
            default: "Meeting"
        },

        creator: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            required: true
        },

        status: {
            type: String,
            enum: ["scheduled", "active", "ended"],
            default: "scheduled"
        },

        startTime: {
            type: Date
        },

        endTime: {
            type: Date
        },

        participants: [
            {
                socketId: String,
                name: String,
                language: String,
                mode: String,
                gender: {
                    type: String,
                    enum: ["male", "female"],
                    default: "male"
                },

                joinedAt: {
                    type: Date,
                    default: Date.now
                }
            }
        ]

    },
    { timestamps: true }
);

module.exports = mongoose.model("meeting", meetingSchema);