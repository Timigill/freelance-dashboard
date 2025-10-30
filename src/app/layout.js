"use client";

import React, { useEffect, useState } from "react";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";
import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";
import DashboardShell from "../components/DashboardShell";
import BootstrapClient from "../components/BootstrapClient";

export default function RootLayout({ children }) {
  const [isDashboard, setIsDashboard] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const path = window.location.pathname;

      //  Define which routes should use the dashboard layout
      const dashboardRoutes = [
        "/dashboard",
        "/clients",
        "/projects",
        "/settings",
        "/profile",
      ];

      //  Check if current path starts with any dashboard route
      setIsDashboard(dashboardRoutes.some((r) => path.startsWith(r)));
    }
  }, []);

  return (
    <html lang="en">
      <body className="bg-light">
        <SessionProvider>
          <BootstrapClient />

          {/*  Use dashboard layout only for dashboard pages */}
          {isDashboard ? <DashboardShell>{children}</DashboardShell> : children}

          {/*  Global Toaster */}
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 3500,
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
