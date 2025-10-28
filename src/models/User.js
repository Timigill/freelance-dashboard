import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  resetToken: String,
  resetTokenExpiry: Date,
  verificationToken: String, // store token if needed
}, { timestamps: true });

export default mongoose.models.User || mongoose.model("User", userSchema);
