const express = require("express");

const { translateController } = require("../controller/translateController");

const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

router.post("/translate", authMiddleware, translateController);


module.exports = router;

