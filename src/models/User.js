import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    password: { type: String }, // <-- make optional
    isVerified: { type: Boolean, default: false },
    resetToken: String,
    resetTokenExpiry: Date,
    verificationToken: String,
    provider: { type: String, default: "credentials" }, // added
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", userSchema);
