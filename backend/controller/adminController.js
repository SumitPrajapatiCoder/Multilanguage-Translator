
const userModel = require("../models/userModel");
const translationHistoryModel = require("../models/translationHistoryModel");

const getAllUsersController = async (req, res) => {
    try {
        const users = await userModel.find().select("-password");

        res.status(200).send({
            success: true,
            data: users,
        });
    } catch (error) {
        console.error("Get Users Error:", error);
        res.status(500).send({ success: false, message: "Server Error" });
    }
};

const blockUserController = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await userModel.findById(id);

        if (!user) {
            return res.status(404).send({ success: false, message: "User not found" });
        }

        if (user.isAdmin) {
            return res.status(400).send({
                success: false,
                message: "Cannot block an admin",
            });
        }

        user.isBlocked = !user.isBlocked;
        await user.save();

        res.status(200).send({
            success: true,
            message: `User ${user.isBlocked ? "blocked" : "unblocked"} successfully`,
        });
    } catch (error) {
        console.error("Block Error:", error);
        res.status(500).send({ success: false, message: "Action failed" });
    }
};

const deleteUserController = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await userModel.findById(id);

        if (!user) {
            return res.status(404).send({ success: false, message: "User not found" });
        }

        if (req.userId === id) {
            return res.status(400).send({
                success: false,
                message: "You cannot delete yourself",
            });
        }

        if (user.isAdmin) {
            return res.status(400).send({
                success: false,
                message: "Cannot delete admin user",
            });
        }

        await userModel.findByIdAndDelete(id);

        await translationHistoryModel.deleteMany({ user: id });

        res.status(200).send({
            success: true,
            message: "User deleted successfully",
        });
    } catch (error) {
        console.error("Delete Error:", error);
        res.status(500).send({ success: false, message: "Delete failed" });
    }
};

const toggleAdminController = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await userModel.findById(id);

        if (!user) {
            return res.status(404).send({ success: false, message: "User not found" });
        }

        if (req.userId === id) {
            return res.status(400).send({
                success: false,
                message: "You cannot change your own role",
            });
        }
        if (user.isAdmin) {
            const adminCount = await userModel.countDocuments({ isAdmin: true });

            if (adminCount <= 1) {
                return res.status(400).send({
                    success: false,
                    message: "At least one admin required",
                });
            }
        }

        user.isAdmin = !user.isAdmin;
        await user.save();

        res.status(200).send({
            success: true,
            message: `User is now ${user.isAdmin ? "Admin" : "User"}`,
        });
    } catch (error) {
        console.error("Toggle Admin Error:", error);
        res.status(500).send({ success: false, message: "Role update failed" });
    }
};

const getAllTranslationHistoryController = async (req, res) => {
    try {
        const history = await translationHistoryModel
            .find()
            .populate("user", "name email")
            .sort({ createdAt: -1 });

        res.status(200).send({
            success: true,
            data: history,
        });
    } catch (error) {
        res.status(500).send({ success: false });
    }
};

const getUserHistoryController = async (req, res) => {
    try {
        const history = await translationHistoryModel
            .find({ user: req.params.id })
            .sort({ createdAt: -1 });

        res.status(200).send({
            success: true,
            data: history,
        });
    } catch (error) {
        res.status(500).send({ success: false });
    }
};

module.exports = {
    getAllUsersController,
    blockUserController,
    deleteUserController,
    toggleAdminController,
    getAllTranslationHistoryController,
    getUserHistoryController
};