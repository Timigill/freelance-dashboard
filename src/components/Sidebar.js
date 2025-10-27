'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Tooltip, OverlayTrigger } from 'react-bootstrap'
import {
  BsBarChartLine, BsPeopleFill, BsFileEarmarkTextFill, BsGearFill, BsList,
  BsCashStack, BsListTask
} from 'react-icons/bs'

const navItems = [
  { href: '/', label: 'Dashboard', icon: <BsBarChartLine /> },
  { href: '/income', label: 'Income', icon: <BsCashStack /> },
  { href: '/tasks', label: 'Tasks', icon: <BsListTask /> },
  { href: '/clients', label: 'Clients', icon: <BsPeopleFill /> },
  { href: '/invoices', label: 'Invoices', icon: <BsFileEarmarkTextFill /> },
  { href: '/settings', label: 'Settings', icon: <BsGearFill /> },
]

export default function Sidebar({ mobile = false, show = false, onHide }) {
  const pathname = usePathname()

  const navContent = (
    <>
      <div className="d-flex justify-content-center align-items-center mb-4" style={{ height: '60px' }}>
        <span className="fw-bold fs-5">📋</span>
      </div>
      <ul className="nav flex-column gap-3">
        {navItems.map(({ href, label, icon }) => {
          const isActive = pathname === href
          return (
            <li key={href} className="nav-item">
              <Link
                href={href}
                className={`nav-link d-flex align-items-center gap-2 px-3 py-2 icon-hover rounded-pill ${isActive ? 'active-glow' : 'text-white'}`}
                style={{ fontSize: '1rem' }}
                onClick={onHide}
              >
                <span className="fs-5">{icon}</span>
                <span className="d-none d-md-inline">{label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
      <div className="mt-auto pt-3 border-top border-secondary text-center small ">
        <span className="d-none d-md-inline">© 2025 Freelance Dashboard</span>
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
        .sidebar-glass {
          box-shadow: inset 0 0 12px rgba(0, 0, 0, 0.05);
        }
      `}</style>
    </>
  )

  if (mobile) {
    return (
      <div className={`offcanvas offcanvas-start${show ? ' show' : ''}`} tabIndex="-1" style={{ visibility: show ? 'visible' : 'hidden', width: 220, background: '#111', color: '#fff', zIndex: 2000 }}>
        <div className="offcanvas-header">
          <h5 className="offcanvas-title">Menu</h5>
          <button type="button" className="btn-close btn-close-white" aria-label="Close" onClick={onHide}></button>
        </div>
        <div className="offcanvas-body d-flex flex-column p-0 pt-3 sidebar-glass" style={{ height: '100%' }}>
          {navContent}
        </div>
      </div>
    )
  }
  // Desktop static sidebar
  return (
    <aside className="d-flex flex-column vh-100 sidebar-glass p-2 pt-3" style={{ background: '#111', color: '#fff', minWidth: 170, maxWidth: 220 }}>
      {navContent}
    </aside>
  )
}
