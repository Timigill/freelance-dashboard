'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function Navbar() {
  const pathname = usePathname()
  const [dark, setDark] = useState(false)

  useEffect(() => {
    if (localStorage.getItem('theme') === 'dark') {
      document.body.classList.add('dark-mode')
      setDark(true)
    }
  }, [])

  const toggleDark = () => {
    const newMode = !dark
    setDark(newMode)
    document.body.classList.toggle('dark-mode', newMode)
    localStorage.setItem('theme', newMode ? 'dark' : 'light')
  }

  return (
    <nav className="navbar navbar-expand-md navbar-dark bg-dark sticky-top px-4 d-flex justify-content-between">
      <div className="d-flex align-items-center gap-3">
        <Link className="navbar-brand" href="/">Cursir CRM</Link>
        <div className="navbar-nav">
          <Link className={`nav-link ${pathname === '/' ? 'active' : ''}`} href="/">Dashboard</Link>
          <Link className={`nav-link ${pathname === '/clients' ? 'active' : ''}`} href="/clients">Clients</Link>
          <Link className={`nav-link ${pathname === '/invoices' ? 'active' : ''}`} href="/invoices">Invoices</Link>
          <Link className={`nav-link ${pathname === '/settings' ? 'active' : ''}`} href="/settings">Settings</Link>
        </div>
      </div>
      <button onClick={toggleDark} className="btn btn-outline-light btn-sm">
        {dark ? '☀️ Light' : '🌙 Dark'}
      </button>
    </nav>
  )
}
