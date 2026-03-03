const mongoose = require("mongoose");
const userModel = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const registerController = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const exist_user = await userModel.findOne({ email: email });
        if (exist_user) {
            return res.status(400).send({ message: 'User Already Exists', success: false });
        }

        const salt = await bcrypt.genSalt(10);
        const hashed_pass = await bcrypt.hash(password, salt);
        req.body.password = hashed_pass;

        const new_user = new userModel(req.body);
        await new_user.save();

        res.status(201).send({ message: 'Registration Successful', success: true });
    } catch (error) {
        console.log('Error From Use Control = ', error);
        res.status(500).send({ success: false, message: `Register Controller: ${error.message}` });
    }
};


const loginController = async (req, res) => {
    try {
        const { identifier, password } = req.body;

        const user = await userModel.findOne({
            $or: [{ email: identifier }, { name: identifier }],
        });

        if (!user) {
            return res.status(200).send({ message: "User Not Found", success: false });
        }

        if (user.isBlocked) {
            return res.status(200).send({ message: "Your account is blocked.", success: false });
        }

        const pass_match = await bcrypt.compare(password, user.password);
        if (!pass_match) {
            return res.status(200).send({ message: "Invalid Email/Username or Password", success: false });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: "2d",
        });

        res.status(200).send({
            message: "Login Done Successfully",
            success: true,
            token,
        });
    } catch (error) {
        console.log(error);
        res
            .status(500)
            .send({ message: `Error In Login Control ${error.message}`, success: false });
    }
};


const getUserInfo = async (req, res) => {
    try {
        const userId = req.body.userId || req.userId;

        if (!userId) {
            return res.status(400).send({ success: false, message: "User ID missing" });
        }

        const user = await userModel.findById(userId).select("-password");

        if (!user) {
            return res.status(404).send({ success: false, message: "User Not Found" });
        }

        res.status(200).send({ success: true, data: user });
    } catch (error) {
        console.error("Error in getUerInfo:", error);
        res.status(500).send({ message: "Auth Error", success: false, error });
    }
};


const verifyPasswordController = async (req, res) => {
    try {
        const userId = req.userId;
        const { oldPassword } = req.body;

        if (!oldPassword) {
            return res.status(400).send({ success: false, message: "Old password is required" });
        }

        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).send({ success: false, message: "User not found" });
        }

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).send({ success: false, message: "Current password is incorrect" });
        }

        res.status(200).send({ success: true, message: "Password verified" });
    } catch (error) {
        console.error("Verify Password Error:", error);
        res.status(500).send({ success: false, message: "Internal Server Error" });
    }
};

const updateProfileController = async (req, res) => {
    try {
        const userId = req.userId;
        const { name, email, newPassword } = req.body;

        if (!name || !email) {
            return res.status(400).send({ success: false, message: "Name and Email are required" });
        }

        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).send({ success: false, message: "User not found" });
        }

        user.name = name;
        user.email = email;

        if (newPassword) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword, salt);
        }

        await user.save();

        const updatedUser = await userModel.findById(userId).select("-password");

        res.status(200).send({
            success: true,
            message: "Profile updated successfully",
            data: updatedUser,
        });
    } catch (error) {
        console.error("Update Profile Error:", error);
        res.status(500).send({ success: false, message: "Internal Server Error" });
    }
};



const uploadProfileImageController = async (req, res) => {
    try {
        const userId = req.userId;

        if (!req.file || !req.file.path) {
            return res
                .status(400)
                .send({ success: false, message: "No image uploaded" });
        }

        const user = await userModel.findById(userId);
        if (!user) {
            return res
                .status(404)
                .send({ success: false, message: "User not found" });
        }

        if (user.profileImage && user.profileImage.includes("cloudinary.com")) {
            try {
                const publicId = user.profileImage
                    .split("/")
                    .pop()
                    .split(".")[0];
                await cloudinary.uploader.destroy(`user_profiles/${publicId}`);
            } catch (err) {
                console.warn("Old image cleanup failed:", err.message);
            }
        }

        user.profileImage = req.file.path;
        await user.save();

        const updatedUser = await userModel.findById(userId).select("-password");

        res.status(200).send({
            success: true,
            message: "Profile photo updated successfully",
            data: updatedUser,
        });
    } catch (error) {
        console.error("Upload Image Error:", error);
        res
            .status(500)
            .send({ success: false, message: "Internal Server Error" });
    }
};



const deleteProfileImageController = async (req, res) => {
    try {
        const userId = req.userId;
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).send({ success: false, message: "User not found" });
        }

        if (user.profileImage && user.profileImage.includes("cloudinary.com")) {
            try {
                const parts = user.profileImage.split("/");
                const fileName = parts[parts.length - 1].split(".")[0];
                await cloudinary.uploader.destroy(`user_profiles/${fileName}`);
            } catch (err) {
                console.warn("Failed to delete old image from Cloudinary:", err.message);
            }
        }

        user.profileImage = "";
        await user.save();

        const updatedUser = await userModel.findById(userId).select("-password");

        res.status(200).send({
            success: true,
            message: "Profile image deleted successfully",
            data: updatedUser,
        });
    } catch (error) {
        console.error("Delete Profile Image Error:", error);
        res.status(500).send({ success: false, message: "Internal Server Error" });
    }
};


module.exports = {
    loginController, registerController, getUserInfo, updateProfileController, deleteProfileImageController,
    uploadProfileImageController, verifyPasswordController
};