const express = require("express");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary2");
const authMiddleware = require("../middleware/authMiddleware");
const { uploadController } = require("../controller/uploadController");

const router = express.Router();

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "translation_uploads",
        resource_type: "auto",
    },
});

const upload = multer({ storage });

router.post(
    "/uploadFiles",
    authMiddleware,
    upload.single("file"),
    uploadController
);

module.exports = router;