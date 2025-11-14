  import mongoose from "mongoose";

  const userSchema = new mongoose.Schema(
    {
      name: { type: String, required: true },
      email: { type: String, required: true, unique: true },
      phone: { type: String, default: null }, 
      password: { type: String }, 
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

  delete mongoose.models.User;

  export default mongoose.model("User", userSchema);
