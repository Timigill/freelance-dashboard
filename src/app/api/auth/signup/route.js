import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import User from "@/models/User";
import { dbConnect } from "@/lib/dbConnect";

export async function POST(req) {
  try {
    const { name, email, password, phone } = await req.json();
    await dbConnect();

    if (!name || !email || !password || !phone) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    if (!/^\+\d{10,15}$/.test(phone)) {
      return NextResponse.json(
        { error: "Invalid phone number format. Use +CountryCode format." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: { $regex: new RegExp(`^${normalizedEmail}$`, "i") },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email: normalizedEmail,
      phone,
      password: hashedPassword,
      isVerified: false,
    });

    await newUser.save();

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    await User.updateOne({ _id: newUser._id }, { verificationToken: token });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const baseUrl =
      process.env.BASE_URL ||
      (process.env.NODE_ENV === "production"
        ? "https://laancer.vercel.app"
        : "http://localhost:3000");
    const verifyLink = `${baseUrl}/verify?token=${token}`;

    await transporter.sendMail({
      from: `"Freelance Dashboard" <${process.env.EMAIL_USER}>`,
      to: normalizedEmail,
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
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
