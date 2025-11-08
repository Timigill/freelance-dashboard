import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, default: null }, // ✅ optional now
    password: { type: String }, // optional for OAuth
    isVerified: { type: Boolean, default: false },
    resetToken: String,
    resetTokenExpiry: Date,
    verificationToken: String,
    provider: { type: String, default: "credentials" },
      bio: { type: String, default: "" },          
    profilePic: { type: String, default: null },
  },
  { timestamps: true }
);

// ✅ force delete old compiled model before re-defining
delete mongoose.models.User;

export default mongoose.model("User", userSchema);
