'use client'
import { useState } from 'react'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

export default function DashboardShell({ children }) {
  const [collapsed, setCollapsed] = useState(false)

  return (
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
  )
}