
import React from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'
import './globals.css'
import DashboardShell from '../components/DashboardShell'
import BootstrapClient from '../components/BootstrapClient'

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-light">
        <BootstrapClient />
        <DashboardShell>{children}</DashboardShell>
      </body>
    </html>
  )
}
