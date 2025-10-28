import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { dbConnect } from "@/lib/dbConnect";
import User from "@/models/User";

export async function GET(req) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) return NextResponse.json({ error: "Token missing" }, { status: 400 });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    if (user.isVerified) return NextResponse.json({ message: "User already verified" });

    user.isVerified = true;
    user.verificationToken = ""; // optional: clear token
    await user.save();

    // Redirect to login page with query param for success message
    return NextResponse.redirect(`http://localhost:3000/auth/login?verified=true`);
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
  }
}
