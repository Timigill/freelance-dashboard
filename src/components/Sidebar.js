'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Sidebar() {
  const pathname = usePathname()

  const primaryNav = [
    { href: '/', label: 'Dashboard', icon: '📊' },
    { href: '/clients', label: 'Clients', icon: '👥' },
    { href: '/invoices', label: 'Invoices', icon: '🧾' },
  ]

  const secondaryNav = [
    { href: '/settings', label: 'Settings', icon: '⚙️' },
  ]

  return (
    <div
      className="sidebar d-flex flex-column text-white p-3"
      style={{
        width: '250px',
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #1e1e2f, #12121a)',
        backdropFilter: 'blur(12px)',
        borderRight: '1px solid rgba(255,255,255,0.05)',
        boxShadow: '2px 0 5px rgba(0,0,0,0.2)',
      }}
    >
      {/* 🧑 Profile Section */}
      <div className="mb-4 d-flex align-items-center gap-3">
        <div
          className="rounded-circle bg-info d-flex justify-content-center align-items-center"
          style={{ width: 42, height: 42, fontSize: '1.2rem', fontWeight: 'bold' }}
        >
          N
        </div>
        <div>
          <div className="fw-semibold">Noman</div>
          <small className="">Freelancer</small>
        </div>
      </div>

      {/* 📌 Primary Navigation */}
      <ul className="nav flex-column mb-2">
        {primaryNav.map(({ href, label, icon }) => (
          <li className="nav-item mb-1" key={href}>
            <Link
              href={href}
              className={`nav-link px-3 py-2 rounded d-flex align-items-center gap-2 ${
                pathname === href ? 'active' : ''
              }`}
              style={{
                color: pathname === href ? '#0dcaf0' : '#ffffff',
                backgroundColor:
                  pathname === href ? 'rgba(255,255,255,0.08)' : 'transparent',
                borderLeft:
                  pathname === href ? '4px solid #0dcaf0' : '4px solid transparent',
                transition: 'all 0.3s ease',
              }}
            >
              <span>{icon}</span>
              <span>{label}</span>
            </Link>
          </li>
        ))}
      </ul>

      <hr className="text-secondary" />

      {/* ⚙️ Secondary Navigation */}
      <ul className="nav flex-column mb-auto">
        {secondaryNav.map(({ href, label, icon }) => (
          <li className="nav-item mb-1" key={href}>
            <Link
              href={href}
              className={`nav-link px-3 py-2 rounded d-flex align-items-center gap-2 ${
                pathname === href ? 'active' : ''
              }`}
              style={{
                color: pathname === href ? '#0dcaf0' : '#ffffff',
                backgroundColor:
                  pathname === href ? 'rgba(255,255,255,0.08)' : 'transparent',
                borderLeft:
                  pathname === href ? '4px solid #0dcaf0' : '4px solid transparent',
                transition: 'all 0.3s ease',
              }}
            >
              <span>{icon}</span>
              <span>{label}</span>
            </Link>
          </li>
        ))}
      </ul>

      {/* 🚪 Logout */}
      <div className="mt-auto pt-3 border-top border-secondary">
        <button
          className="btn btn-outline-light w-100 d-flex align-items-center gap-2 justify-content-center"
          style={{ fontSize: '0.9rem' }}
        >
          🔓 Logout
        </button>
      </div>
    </div>
  )
}
