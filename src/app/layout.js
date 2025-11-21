"use client";

import React, { useEffect, useState, Suspense } from "react";
import { usePathname, useRouter } from "next/navigation";
import { SessionProvider, useSession } from "next-auth/react";
import { Toaster } from "react-hot-toast";
import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";
import DashboardShell from "../components/DashboardShell";
import BootstrapClient from "../components/BootstrapClient";

// Component to handle dashboard redirection if not authenticated
function AuthWrapper({ children }) {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading" || status === "unauthenticated") {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return children;
}

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const [isDashboard, setIsDashboard] = useState(false);

  useEffect(() => {
    const dashboardRoutes = [
      "/dashboard",
      "/clients",
      "/projects",
      "/settings",
      "/income",
      "/invoices",
      "/tasks",
    ];

    setIsDashboard(dashboardRoutes.some((route) => pathname.startsWith(route)));
  }, [pathname]);

  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/laancer.ico" sizes="any" />
      </head>
      <body className="bg-light">
        <SessionProvider>
          {isDashboard && <BootstrapClient />}

          {isDashboard ? (
            <AuthWrapper>
              {/* ✅ FIX — Add Suspense HERE */}
              <Suspense fallback={<div>Loading dashboard...</div>}>
                <DashboardShell>{children}</DashboardShell>
              </Suspense>
            </AuthWrapper>
          ) : (
            children
          )}

          <Toaster
            position="top-center"
            toastOptions={{
              duration: 3000,
              style: {
                zIndex: 9999,
                background: "#1f29379f",
                color: "#fff",
                borderRadius: "10px",
                padding: "12px 26px",
                fontSize: "0.9rem",
                boxShadow:
                  "0 4px 12px rgba(0,0,0,0.25), 0 2px 6px rgba(0,0,0,0.1)",
                borderLeft: "4px solid #22c55e",
              },
              success: {
                style: { borderLeft: "4px solid #22c55e" },
                iconTheme: { primary: "#22c55e", secondary: "#1f2937" },
              },
              error: {
                style: { borderLeft: "4px solid #ef4444" },
                iconTheme: { primary: "#ef4444", secondary: "#1f2937" },
              },
            }}
          />
        </SessionProvider>
      </body>
    </html>
  );
}
