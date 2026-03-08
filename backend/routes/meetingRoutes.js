const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");

const {
    createMeeting,
    listMeetings,
    joinMeeting,
    endMeeting,
    deleteMeeting,
    checkMeetingStatus
} = require("../controller/meetingController");

router.post("/create", auth, createMeeting);
router.get("/list", auth, listMeetings);
router.post("/join", auth, joinMeeting);
router.post("/end", auth, endMeeting);
router.delete("/delete", auth, deleteMeeting);
router.get("/status/:meetingId", auth, checkMeetingStatus);


module.exports = router;