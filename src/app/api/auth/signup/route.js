import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import User from "@/models/User";
import { dbConnect } from "@/lib/dbConnect";

export async function POST(req) {
  try {
    const { name, email, password } = await req.json();
    await dbConnect();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      isVerified: false,
    });

    await newUser.save();

    // ✅ Generate JWT with user ID
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
    newUser.verificationToken = token;
    await newUser.save();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const verifyLink = `http://localhost:3000/auth/verify?token=${token}`;

    await transporter.sendMail({
      from: `"Freelance Dashboard" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Verify your email",
      html: `
        <p>Hi ${name},</p>
        <p>Click below to verify your email:</p>
        <a href="${verifyLink}">${verifyLink}</a>
      `,
    });

    return NextResponse.json({
      message: "Signup successful! Check your email for verification.",
    });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
