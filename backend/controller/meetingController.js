const meetingModel = require("../models/meetingModel");
const createToken = require("../utils/livekitToken");
const { v4: uuidv4 } = require("uuid");


const createMeeting = async (req, res) => {

    try {

        const { title, startTime, endTime } = req.body;

        const meetingId = "MEET_" + uuidv4().slice(0, 6);

        const meetingLink =
            `${process.env.FRONTEND_URL}/join/${meetingId}`;

        const meeting = await meetingModel.create({
            meetingId,
            meetingLink,
            title,
            startTime: new Date(startTime),
            endTime: new Date(endTime),
            creator: req.userId,
            status: "scheduled"
        });

        res.json(meeting);

    } catch (err) {

        console.error(err);

        res.status(500).json({
            error: "create meeting failed"
        });

    }

};


const listMeetings = async (req, res) => {

    try {

        const meetings = await meetingModel
            .find({ creator: req.userId })
            .sort({ createdAt: -1 });

        const now = new Date().getTime();

        const updatedMeetings = meetings.map((meeting) => {

            if (!meeting.startTime || !meeting.endTime)
                return meeting;

            const start = new Date(meeting.startTime).getTime();
            const end = new Date(meeting.endTime).getTime();

            let status = meeting.status;

            if (now < start) {
                status = "scheduled";
            }
            else if (now >= start && now <= end) {
                status = "active";
            }
            else if (now > end) {
                status = "ended";
            }

            return {
                ...meeting.toObject(),
                status
            };

        });

        res.set("Cache-Control", "no-store");

        res.json(updatedMeetings);

    } catch (err) {

        console.error(err);

        res.status(500).json({
            error: "fetch meetings failed"
        });

    }

};

const joinMeeting = async (req, res) => {

    try {

        const { meetingId, name } = req.body;

        const meeting = await meetingModel.findOne({ meetingId });

        if (!meeting)
            return res.status(404).json({
                error: "Meeting not found"
            });

        const now = new Date();

        if (meeting.startTime && now < meeting.startTime)
            return res.status(400).json({
                error: "Meeting not started yet"
            });

        if (meeting.endTime && now > meeting.endTime)
            return res.status(400).json({
                error: "Meeting already ended"
            });

        const token = createToken(meetingId, name);

        res.json({
            token,
            meetingId
        });

    } catch (err) {

        res.status(500).json({
            error: "join meeting failed"
        });

    }

};


const endMeeting = async (req, res) => {

    try {

        const { meetingId } = req.body;

        const meeting = await meetingModel.findOne({ meetingId });

        if (!meeting)
            return res.status(404).json({
                error: "Meeting not found"
            });

        meeting.status = "ended";
        meeting.endTime = new Date();

        await meeting.save();

        res.json({
            message: "Meeting ended"
        });

    } catch (err) {

        res.status(500).json({
            error: "end meeting failed"
        });

    }

};


const deleteMeeting = async (req, res) => {

    try {

        const { meetingId } = req.body;

        const meeting = await meetingModel.findOne({ meetingId });

        if (!meeting)
            return res.status(404).json({
                error: "Meeting not found"
            });

        if (meeting.creator.toString() !== req.userId)
            return res.status(403).json({
                error: "Not authorized"
            });

        await meetingModel.deleteOne({ meetingId });

        res.json({
            message: "Meeting deleted successfully"
        });

    } catch (err) {

        res.status(500).json({
            error: "Delete meeting failed"
        });

    }

};


const checkMeetingStatus = async (req, res) => {

    try {

        const { meetingId } = req.params;

        const meeting = await meetingModel.findOne({ meetingId });

        if (!meeting)
            return res.status(404).json({ error: "Meeting not found" });

        const now = new Date();

        if (meeting.endTime && now > meeting.endTime) {
            return res.json({
                status: "ended"
            });
        }

        if (meeting.startTime && now < meeting.startTime) {
            return res.json({
                status: "not_started"
            });
        }

        res.json({
            status: "active"
        });

    } catch (err) {

        res.status(500).json({
            error: "status check failed"
        });

    }

};


module.exports = {
    createMeeting,
    listMeetings,
    joinMeeting,
    endMeeting,
    deleteMeeting,
    checkMeetingStatus
};