'use client'

import { useEffect, useState } from 'react'
import { signOut } from "next-auth/react";
import Image from 'next/image'
import { BsBell, BsSearch, BsPersonCircle } from 'react-icons/bs'

export default function Topbar() {
  const [dark, setDark] = useState(false)

  useEffect(() => {
    if (dark) {
      document.documentElement.setAttribute('data-theme', 'dark')
    } else {
      document.documentElement.removeAttribute('data-theme')
    }
  }, [dark])

  return (
    <header style={{ height: '63px'}} className="sticky-top bg-white shadow-sm border-bottom">
      <div className="d-flex align-items-center justify-content-between h-100 px-3">
        <div style={{ height: '37px !IMPORTANT', position: 'relative', width: '110px' }}>
          <Image
            src="/Lancer.png"
            alt="Lancer Logo"
            fill
            // style={{ objectFit: 'contain' }}
            priority
          />  `1  `
        </div>
        <div className="d-flex align-items-center gap-3">
          <button className="btn btn-link p-1 position-relative" style={{ fontSize: '1.4rem', color: '#352359' }}>
            <BsBell />
            <span className="position-absolute top-0 start-100 translate-mid  dle p-1 bg-danger border border-light rounded-circle">
              <span className="visually-hidden">New notifications</span>
            </span>
          </button>
          <button className="btn btn-link p-1" style={{ fontSize: '1.7rem', color: '#352359' }}>
            <BsPersonCircle />
          </button>
          {/* Fully functional logout button */}
          <button
  className="btn btn-outline-secondary d-flex align-items-center gap-1 px-3 py-1 rounded"
  style={{
    color: "#352359",
    borderColor: "#352359",
    fontWeight: 500,
    fontSize: "0.9rem",
    backgroundColor: "transparent",
    transition: "all 0.2s",
  }}
  onClick={() => signOut({ callbackUrl: "/login" })}
  onMouseEnter={(e) => {
    e.currentTarget.style.backgroundColor = "#352359";
    e.currentTarget.style.color = "#fff";
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.backgroundColor = "transparent";
    e.currentTarget.style.color = "#352359";
  }}
>
  Logout
</button>

        </div>
      </div>
    </header>
  )
}
