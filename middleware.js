import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function middleware(req) {
  const { pathname } = req.nextUrl;

  // Allow NextAuth routes
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // Get decoded token (not raw)
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
    raw: false, // must be decoded JWT
  });

  // Protected routes
  const protectedPaths = [
    "/dashboard",
    "/clients",
    "/income",
    "/invoices",
    "/tasks",
    "/settings",
  ];
  const isProtectedRoute = protectedPaths.some((path) =>
    pathname.startsWith(path)
  );

  // Redirect unauthenticated users to login
  if (isProtectedRoute && !token) {
    const url = new URL("/login", req.url);
    url.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  // Redirect logged-in users away from login/signup
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
