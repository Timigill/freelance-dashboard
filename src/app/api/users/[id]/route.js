import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import User from "@/models/User";

// GET user data
export async function GET(req, { params }) {
  try {
    await dbConnect();

    // unwrap params
    const { id } = await params; // <-- important in Next.js 16 App Router
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

    const { id } = await params; // <-- unwrap here too
    const data = await req.json();

    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (data.name) user.name = data.name;
    if (data.bio) user.bio = data.bio;
    if (data.profilePic) user.profilePic = data.profilePic;

    await user.save();

    const updatedUser = user.toObject();
    delete updatedUser.password;

    return NextResponse.json({ message: "Profile updated", user: updatedUser });
  } catch (err) {
    console.error("PATCH user error:", err);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
