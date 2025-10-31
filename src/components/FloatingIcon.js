'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { BsPlusLg, BsListTask, BsCashStack, BsPeopleFill, BsXLg } from 'react-icons/bs'

export default function FloatingActionButton() {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  // When a secondary button is clicked → go to page and open modal
  const handleClick = (type) => {
    const pathMap = {
      task: '/tasks',
      income: '/income',
      client: '/clients',
    }

    const path = pathMap[type]
    if (path) {
      router.push(`${path}?openModal=true`)
      
    }
  }

  return (
    <div className="position-fixed bottom-0 end-0 p-4" style={{ zIndex: 1050 }}>
      {/* Secondary buttons */}
      <div
        className="d-flex flex-column align-items-end gap-2 mb-2"
        style={{
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          transform: open ? 'translateY(0)' : 'translateY(10px)',
          transition: 'all 0.3s ease',
        }}
      >
        <button
          className="btn btn-outline-primary rounded-circle shadow d-flex align-items-center justify-content-center"
          style={{ width: '48px', height: '48px' }}
          title="Add Task"
          onClick={() => handleClick('task')}
        >
          <BsListTask />
        </button>

        <button
          type="button"
          className="btn btn-outline-primary rounded-circle shadow d-flex align-items-center justify-content-center"
          style={{ width: '48px', height: '48px' }}
          title="Add Income"
          onClick={() => handleClick('income')}
        >
          <BsCashStack size={20} />
        </button>


        <button
          className="btn btn-outline-primary rounded-circle shadow d-flex align-items-center justify-content-center"
          style={{ width: '48px', height: '48px' }}
          title="Add Client"
          onClick={() => handleClick('client')}
        >
          <BsPeopleFill />
        </button>
      </div>

      {/* Main FAB */}
      <button
        className="btn btn-primary rounded-circle shadow d-flex align-items-center justify-content-center"
        style={{ width: '58px', height: '58px', transition: 'transform 0.3s ease' }}
        onClick={() => setOpen(!open)}
        aria-label="Quick add"
      >
        {open ? <BsXLg size={24} /> : <BsPlusLg size={22} />}
      </button>
    </div>
  )
}
