import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function middleware(req) {
  const token = req.cookies.get("token")?.value;

  if (!token) return NextResponse.redirect("/auth/login");

  try {
    jwt.verify(token, process.env.JWT_SECRET);
    return NextResponse.next();
  } catch (err) {
    return NextResponse.redirect("/auth/login");
  }
}

export const config = {
  matcher: ["///:path*"], // Protect your dashboard or any user routes
};
