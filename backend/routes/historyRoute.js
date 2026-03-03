const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const { getHistory, deleteHistory } = require("../controller/historyController");

const router = express.Router();

router.get("/get_history", authMiddleware, getHistory);
router.delete("/delete_history/:id", authMiddleware, deleteHistory);

module.exports = router;