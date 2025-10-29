"use client";

import React from "react";
import { SessionProvider } from "next-auth/react";
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
        </SessionProvider>
      </body>
    </html>
  );
}
