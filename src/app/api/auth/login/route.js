import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "@/models/User";
import { dbConnect } from "@/lib/dbConnect";
import parsePhoneNumber from "libphonenumber-js";

export async function POST(req) {
  try {
    const { emailOrPhone, password } = await req.json();
    await dbConnect();

    if (!emailOrPhone || !password) {
      return NextResponse.json(
        { error: "Email/Phone and password are required" },
        { status: 400 }
      );
    }

    let query = {};

    if (emailOrPhone.includes("@")) {
      // ✅ Case-insensitive email match (always works)
      query = { email: { $regex: new RegExp(`^${emailOrPhone.trim()}$`, "i") } };
    } else {
      // ✅ Handle phone number login
      try {
        const phoneNumber = parsePhoneNumber(emailOrPhone, "PK");
        if (!phoneNumber.isValid()) {
          return NextResponse.json(
            { error: "Invalid phone number" },
            { status: 400 }
          );
        }
        query = { phone: phoneNumber.number };
      } catch {
        return NextResponse.json(
          { error: "Invalid phone number" },
          { status: 400 }
        );
      }
    }

    // ✅ Fetch user by either phone or email (case-insensitive)
    const user = await User.findOne(query);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!user.isVerified) {
      return NextResponse.json(
        { error: "Please verify your account first" },
        { status: 403 }
      );
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const response = NextResponse.json({ message: "Login successful" });
    response.cookies.set("token", token, {
      httpOnly: true,
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
