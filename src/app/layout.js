
import React from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'
import './globals.css'
import DashboardShell from '../components/DashboardShell'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-light">
        <DashboardShell>{children}</DashboardShell>
      </body>
    </html>
  )
}
