'use client'

import { useEffect, useState } from 'react'

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
    <div className="d-flex justify-content-between align-items-center bg-white text-dark px-4 py-3 shadow-sm border-bottom">
      <span className="fw-bold fs-5">📋 Freelance Dashboard</span>
    </div>

  )
}
