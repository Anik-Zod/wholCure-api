import mongoose from "mongoose";

// get all customer list (now from the user collection)
export const getAllCustomers = async (req, res) => {
    const users = await mongoose.connection.db.collection("user").find({}).toArray();

    if (!users) {
        return res.status(500).json({ success: false, message: "Failed to get user list" });
    }

    return res.status(200).json({ success: true, data: users });
}

// Get own profile (from the user collection)
export const getMyProfile = async (req, res) => {
    const user = await mongoose.connection.db.collection("user").findOne({ _id: req.user.id });

    if (!user) {
        return res.status(404).json({ success: false, message: "User profile not found" });
    }

    return res.status(200).json({ success: true, data: user });
}