import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function middleware(req) {
  const token = await getToken({ req });
  const { pathname } = req.nextUrl;

  // Allow requests for next-auth session and provider fetching
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

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

  if (isProtectedRoute && !token) {
    const url = new URL("/login", req.url);
    url.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

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
