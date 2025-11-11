import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import User from "@/models/User";
import bcrypt from "bcryptjs";

// GET user data
export async function GET(req, { params }) {
  try {
    await dbConnect();
    const { id } = await params;

    const user = await User.findById(id).select("-password");
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (err) {
    console.error("GET user error:", err);
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
  }
}

// PATCH user data
export async function PATCH(req, { params }) {
  try {
    await dbConnect();
    const { id } = await params;
    const data = await req.json();

    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Basic profile updates
    if (data.name) user.name = data.name;
    if (data.bio) user.bio = data.bio;
    if (data.phone) user.phone = data.phone;
    if (data.profilePic) user.profilePic = data.profilePic;

    // Handle password change
    if (data.oldPassword && data.newPassword) {
      const isMatch = await bcrypt.compare(data.oldPassword, user.password);
      if (!isMatch) {
        return NextResponse.json({ error: "Old password is incorrect" }, { status: 400 });
      }
      const hashed = await bcrypt.hash(data.newPassword, 10);
      user.password = hashed;
    }

    await user.save();
    const updatedUser = user.toObject();
    delete updatedUser.password;

    return NextResponse.json({ message: "Profile updated", user: updatedUser });
  } catch (err) {
    console.error("PATCH user error:", err);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
