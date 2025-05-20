'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Tooltip, OverlayTrigger } from 'react-bootstrap'
import {
  BsBarChartLine, BsPeopleFill, BsFileEarmarkTextFill, BsGearFill, BsList
} from 'react-icons/bs'

const navItems = [
  { href: '/', label: 'Dashboard', icon: <BsBarChartLine /> },
  { href: '/clients', label: 'Clients', icon: <BsPeopleFill /> },
  { href: '/invoices', label: 'Invoices', icon: <BsFileEarmarkTextFill /> },
  { href: '/settings', label: 'Settings', icon: <BsGearFill /> },
]

export default function Sidebar({ collapsed, setCollapsed }) {
  const pathname = usePathname()

  const renderTooltip = (label) => (
    <Tooltip id={`tooltip-${label.toLowerCase()}`}>{label}</Tooltip>
  )

  return (
    <div
      className={`d-flex flex-column text-white position-fixed sidebar-glass p-2 pt-3 ${collapsed ? 'collapsed' : ''}`}
      style={{
        width: collapsed ? '60px' : '170px',
        height: '100vh',
        top: 0,
        left: 0,
        zIndex: 1000,
        background: 'rgba(0, 0, 0, 1)',
        backdropFilter: 'blur(10px)',
        borderRight: '1px solid rgba(0, 0, 0, 0.1)',
        transition: 'all 0.3s ease',
        overflowX: 'hidden'
      }}
    >
      {/* Centered Toggle Button */}
      <div className="d-flex justify-content-center align-items-center mb-4" style={{ height: '60px' }}>
        <button
          className="btn btn-outline-light"
          onClick={() => setCollapsed(!collapsed)}
          style={{
            borderRadius: '10px',
            border: 'none',
            width: '60px',
            height: '40px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <BsList style={{ width: '24px', height: '24px' }} />
        </button>
      </div>

      {/* Navigation */}
      <ul className="nav flex-column gap-3">
        {navItems.map(({ href, label, icon }) => {
          const isActive = pathname === href

          return (
            <li key={href} className="nav-item">
              <OverlayTrigger
                placement="right"
                overlay={collapsed ? renderTooltip(label) : <></>}
              >
                <Link
                  href={href}
                  className={`nav-link d-flex align-items-center gap-2 px-3 py-2 icon-hover rounded-pill ${
                    isActive ? 'active-glow' : 'text-white'
                  }`}
                  style={{
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    transition: 'all 0.3s ease',
                    fontSize: '1rem'
                  }}
                >
                  <span className="fs-5">{icon}</span>
                  {!collapsed && <span>{label}</span>}
                </Link>
              </OverlayTrigger>
            </li>
          )
        })}
      </ul>

      {/* Footer */}
      <div className="mt-auto pt-3 border-top border-secondary text-center small ">
        {!collapsed && <span>© 2025 Freelance Dashboard</span>}
      </div>

      <style jsx>{`
        .icon-hover:hover {
          background: rgba(255, 255, 255, 0.1);
          transform: scale(1.05);
        }

        .active-glow {
          background: linear-gradient(135deg, #1e90ff, #3f76ff);
          box-shadow: 0 0 12px #1e90ff;
          color: white !important;
        }

        .collapsed .nav-link span:not(.fs-5),
        .collapsed .mt-auto {
          display: none !important;
        }

        .sidebar-glass {
          box-shadow: inset 0 0 12px rgba(0, 0, 0, 0.05);
        }
      `}</style>
    </div>
  )
}
