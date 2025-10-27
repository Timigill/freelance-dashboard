'use client'
import Topbar from './Topbar'
import BottomBar from './BottomBar'

export default function DashboardShell({ children }) {
  return (
    <div className="container-fluid p-0 min-vh-100 d-flex flex-column">
      {/* Topbar always visible */}
      <Topbar />
      <main className="flex-grow-1 bg-light pb-bottom-bar">
        <div className="container-fluid py-2">{children}</div>
      </main>
      {/* Bottom navigation bar for mobile */}
      <BottomBar />
      <style jsx>{`
        .pb-bottom-bar {
          padding-bottom: 65px;
        }
      `}</style>
    </div>
  )
}