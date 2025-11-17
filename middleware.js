import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function middleware(req) {
  const { pathname } = req.nextUrl;

  // Allow NextAuth API routes and callbacks
  if (pathname.startsWith("/api/auth")) return NextResponse.next();

  // List of protected routes
  const protectedPaths = [
    "/dashboard",
    "/clients",
    "/income",
    "/invoices",
    "/tasks",
    "/settings",
  ];
  const isProtected = protectedPaths.some((path) => pathname.startsWith(path));

  // Get session token
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
    secureCookie: process.env.NODE_ENV === "production", // important for Vercel
  });

  // Debug log
  // console.log("Middleware token:", token);

  // If route is protected and no token → redirect to login with callback
  if (isProtected && !token) {
    const url = new URL("/login", req.url);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  // If user is logged in, prevent access to login/signup
  if (token && (pathname === "/login" || pathname === "/signup")) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/clients/:path*",
    "/income/:path*",
    "/invoices/:path*",
    "/tasks/:path*",
    "/settings/:path*",
    "/login",
    "/signup",
  ],
};
