import mongoose from "mongoose";

const adminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter name"],
      trim: true,
    },

    image: {
      type: String,
      default: "",
    },

    email: {
      type: String,
      required: [true, "Please enter email"],
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: [true, "Please enter password"],
    },

    phone: {
      type: String,
      trim: true,
    },

    role: {
      type: String,
      enum: ["superadmin", "admin"],
      default: "admin",
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    resetPasswordOtp: String,
    resetPasswordOtpExpires: Date,
  },
  { timestamps: true }
);



const Admin = mongoose.model("Admin", adminSchema);
export default Admin;
