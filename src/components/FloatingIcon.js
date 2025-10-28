'use client'
import { useState } from 'react'
import Link from 'next/link'
import { BsPlusLg, BsXLg, BsListTask, BsCashStack, BsPeopleFill } from 'react-icons/bs'

export default function FloatingActionButton() {
  const [open, setOpen] = useState(false)

  return (
    <div className="position-fixed bottom-0 end-0 p-4" style={{ zIndex: 1050 }}>
      {/* Quick Action Buttons */}
      <div
        className={`d-flex flex-column align-items-end gap-2 mb-2 transition-all ${
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        style={{
          transition: 'all 0.3s ease',
          transform: open ? 'translateY(0)' : 'translateY(10px)',
        }}
      >
        {/* Add Task */}
        <Link href="/tasks" className="text-decoration-none">
          <div
            className="btn btn-outline-primary rounded-circle shadow d-flex align-items-center justify-content-center"
            style={{ width: '48px', height: '48px' }}
            title="Add Task"
          >
            <BsListTask size={20} />
          </div>
        </Link>

        {/* Add Income Source */}
        <Link href="/income" className="text-decoration-none">
          <div
            className="btn btn-outline-primary rounded-circle shadow d-flex align-items-center justify-content-center"
            style={{ width: '48px', height: '48px' }}
            title="Add Income Source"
          >
            <BsCashStack size={20} />
          </div>
        </Link>

        {/* Add Client */}
        <Link href="/clients" className="text-decoration-none">
          <div
            className="btn btn-outline-primary rounded-circle shadow d-flex align-items-center justify-content-center"
            style={{ width: '48px', height: '48px' }}
            title="Add Client"
          >
            <BsPeopleFill size={20} />
          </div>
        </Link>
      </div>

      {/* Main Floating Button */}
      <button
        className="btn btn-primary rounded-circle shadow d-flex align-items-center justify-content-center"
        style={{
          width: '58px',
          height: '58px',
          transition: 'transform 0.3s ease',
          transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
        }}
        onClick={() => setOpen(!open)}
        aria-label="Quick add"
      >
        {open ? <BsXLg size={26} /> : <BsPlusLg size={22} />}
      </button>
    </div>
  )
}


