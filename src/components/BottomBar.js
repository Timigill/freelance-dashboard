'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BsBarChartLine, BsPeopleFill, BsFileEarmarkTextFill, BsGearFill,
  BsCashStack, BsListTask
} from 'react-icons/bs'

const navItems = [
  { href: '/', label: 'Home', icon: <BsBarChartLine /> },
  { href: '/tasks', label: 'Tasks', icon: <BsListTask /> },
  { href: '/clients', label: 'Clients', icon: <BsPeopleFill /> },
  { href: '/income', label: 'Income', icon: <BsCashStack /> },
  { href: '/invoices', label: 'Invoices', icon: <BsFileEarmarkTextFill /> },
]

export default function BottomBar() {
  const pathname = usePathname()

  return (
    <nav className="bottom-bar fixed-bottom bg-white border-top d-md-none">
      <div className="d-flex justify-content-around align-items-center">
        {navItems.map(({ href, label, icon }) => {
          const isActive = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={`nav-link d-flex flex-column align-items-center py-2 ${
                isActive ? 'active' : 'text-muted'
              }`}
              style={{ color: isActive ? '#352359' : undefined, fontSize: '0.8rem' }}
            >
              <span className="fs-5 mb-1">{icon}</span>
              <span>{label}</span>
            </Link>
          )
        })}
      </div>
      <style jsx>{`
        .bottom-bar {
          height: 75px;
          background-color: #fff !important;
        }
        .nav-link {
          flex: 1;
          min-width: 60px;
          max-width: 80px;
        }
      `}</style>
    </nav>
  )
}