"use client"
import React from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'
import './globals.css'
import { useState } from 'react'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'

export default function RootLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <html lang="en">
      <body className="bg-light">
        <div className="d-flex">
          <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
          <main
            className="flex-grow-1"
            style={{
              marginLeft: collapsed ? '60px' : '170px',
              transition: 'margin 0.3s ease',
              minHeight: '100vh',
              overflowX: 'hidden'
            }}
          >
            <Topbar />
            <div className="container py-2">{children}</div>
          </main>
        </div>
      </body>
    </html>
  )
}
