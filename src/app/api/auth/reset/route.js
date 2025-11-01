import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(req) {
  await dbConnect();
  const { token, newPassword } = await req.json();

  if (!token || !newPassword) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ _id: decoded.id, resetToken: token });

    if (!user || user.resetTokenExpiry < Date.now()) return NextResponse.json({ error: "Token expired" }, { status: 400 });

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    return NextResponse.json({ message: "Password updated successfully" });
  } catch (err) {
    return NextResponse.json({ error: "Invalid token" }, { status: 400 });
  }
}
