"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";
import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";
import DashboardShell from "../components/DashboardShell";
import BootstrapClient from "../components/BootstrapClient";

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

    setIsDashboard(dashboardRoutes.some((r) => pathname.startsWith(r)));
  }, [pathname]); 

  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/laancer.ico" sizes="any" />
      </head>
      <body className="bg-light">
        <SessionProvider>
          <BootstrapClient />

          {/* ✅ Automatically show Topbar + Sidebar for dashboard pages */}
          {isDashboard ? <DashboardShell>{children}</DashboardShell> : children}

          <Toaster
            position="top-center"
            toastOptions={{
              duration: 2000,
              style: {
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
