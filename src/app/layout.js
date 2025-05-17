// src/app/layout.js
import 'bootstrap/dist/css/bootstrap.min.css'
import './globals.css'

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-light">
        <div className="d-flex">
          <Sidebar />
          <main className="flex-grow-1">
            <Topbar />
            <div className="container py-4">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  )
}

import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'
