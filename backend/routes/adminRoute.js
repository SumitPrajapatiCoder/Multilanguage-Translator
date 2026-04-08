const express = require("express");
const adminMiddleware = require("../middleware/adminMiddleware");
const authMiddleware = require("../middleware/authMiddleware");

const {
    getAllUsersController,
    blockUserController,
    deleteUserController,
    toggleAdminController,
    getAllTranslationHistoryController,
    getUserHistoryController
} = require("../controller/adminController");

const router = express.Router();

router.get("/users", authMiddleware, adminMiddleware, getAllUsersController);

router.put("/block-user/:id", authMiddleware, adminMiddleware, blockUserController);

router.delete("/delete-user/:id", authMiddleware, adminMiddleware, deleteUserController);

router.put("/toggle-admin/:id", authMiddleware, adminMiddleware, toggleAdminController);

router.get("/translation-history", authMiddleware, adminMiddleware, getAllTranslationHistoryController);

router.get("/user-history/:id", authMiddleware, adminMiddleware, getUserHistoryController);

module.exports = router;