const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Name Is required"],
        },
        email: {
            type: String,
            required: [true, "Email Is Required"],
            unique: true,
        },
        password: {
            type: String,
            required: [true, "Password Is Required"],
        },
        isAdmin: {
            type: Boolean,
            default: false,
        },
        isBlocked: {
            type: Boolean,
            default: false,
        },
        profileImage: {
            type: String, 
            default: "",  
        },
    },
    { timestamps: true }
);

const userModel = mongoose.model("user", userSchema);
module.exports = userModel;
