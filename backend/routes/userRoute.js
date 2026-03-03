const express = require("express");
const { loginController, registerController, getUserInfo, updateProfileController,deleteProfileImageController,
        uploadProfileImageController, verifyPasswordController, whisperController, googleSTTController } = require("../controller/userController");
const authMiddleware = require("../middleware/authMiddleware");
const { upload } = require("../config/cloudinary");

const router = express.Router();

router.post("/login", loginController);
router.post("/register", registerController);
router.post('/get_User_data', authMiddleware, getUserInfo);
router.put('/update_profile', authMiddleware, updateProfileController);
router.put("/upload_profile_image", authMiddleware, upload.single("image"), uploadProfileImageController);
router.delete("/delete_profile_image", authMiddleware, deleteProfileImageController);
router.post("/verify-password", authMiddleware, verifyPasswordController);



module.exports = router;