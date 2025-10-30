"use client";

import React from "react";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";
import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";
import DashboardShell from "../components/DashboardShell";
import BootstrapClient from "../components/BootstrapClient";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-light">
        <SessionProvider>
          <BootstrapClient />
          <DashboardShell>{children}</DashboardShell>

          {/* ✅ Global Toaster (Modern Style + Animation) */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3500,
              className: "",
              style: {
                background: "#1f29379f",
                color: "#fff",
                borderRadius: "10px",
                padding: "12px 16px",
                fontSize: "0.9rem",
                boxShadow:
                  "0 4px 12px rgba(0,0,0,0.25), 0 2px 6px rgba(0,0,0,0.1)",
                borderLeft: "4px solid #22c55e",
                transform: "translateY(0)",
                transition:
                  "all 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease",
              },
              success: {
                style: {
                  borderLeft: "4px solid #22c55e",
                  background: "#1f2937ce",
                },
                iconTheme: {
                  primary: "#22c55e",
                  secondary: "#1f2937",
                },
              },
              error: {
                style: {
                  borderLeft: "4px solid #ef4444",
                  background: "#1f2937ce",
                },
                iconTheme: {
                  primary: "#ef4444",
                  secondary: "#1f2937",
                },
              },
            }}
          />
        </SessionProvider>
      </body>
    </html>
  );
}
