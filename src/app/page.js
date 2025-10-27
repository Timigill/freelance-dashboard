'use client'
import { useState, useEffect, useRef } from 'react'
import IncomeChart from '@/components/IncomeChart'
import PieChart from '@/components/PieChart'
import { Form } from 'react-bootstrap'
import { BsPlusLg, BsCalendar3 } from 'react-icons/bs'

function MonthPickerIcon({ selectedMonth, selectedYear, onChange }) {
  const inputRef = useRef(null)

  const openPicker = () => {
    if (!inputRef.current) return
    if (typeof inputRef.current.showPicker === 'function') {
      // modern browsers
      inputRef.current.showPicker()
    } else {
      // fallback
      inputRef.current.focus()
      inputRef.current.click()
    }
  }

  const handleChange = (e) => {
    const val = e.target.value // expected YYYY-MM
    if (!val) return
    const [y, m] = val.split('-')
    const monthIndex = parseInt(m, 10) - 1
    const yearNum = parseInt(y, 10)
    onChange(monthIndex, yearNum)
  }

  const valueStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}`

  return (
    <>
      <input
        ref={inputRef}
        type="month"
        value={valueStr}
        onChange={handleChange}
        style={{ display: 'none' }}
        aria-hidden="true"
      />
      <button
        type="button"
        className="btn btn-link p-1"
        onClick={openPicker}
        aria-label="Select month"
        style={{ color: '#352359', fontSize: '1.05rem' }}
      >
        <BsCalendar3 />
      </button>
    </>
  )
}

export default function HomePage() {
  const [incomeSources, setIncomeSources] = useState([])
  const [tasks, setTasks] = useState([])
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [monthlyStats, setMonthlyStats] = useState({
    totalIncome: 0,
    fixedIncome: 0,
    taskBasedIncome: 0,
    freelanceIncome: 0,
    pendingAmount: 0,
    completedTasks: 0,
    pendingTasks: 0
  })

  useEffect(() => {
    fetchIncomeSources()
    fetchTasks()
  }, [selectedMonth, selectedYear])

  const fetchIncomeSources = async () => {
    try {
      const res = await fetch('/api/income')
      const data = await res.json()
      setIncomeSources(data)
      calculateMonthlyIncome(data)
    } catch (error) {
      console.error('Error fetching income sources:', error)
    }
  }

  const fetchTasks = async () => {
    try {
      const res = await fetch('/api/tasks')
      const data = await res.json()
      setTasks(data)
      calculateTaskStats(data)
    } catch (error) {
      console.error('Error fetching tasks:', error)
    }
  }

  const calculateMonthlyIncome = (sources) => {
    const stats = {
      totalIncome: 0,
      fixedIncome: 0,
      taskBasedIncome: 0,
      freelanceIncome: 0
    }

    sources.forEach(source => {
      if (source.isActive) {
        const monthlyAmount = source.amount
        stats.totalIncome += monthlyAmount

        switch (source.type) {
          case 'Fixed':
            stats.fixedIncome += monthlyAmount
            break
          case 'Task-Based':
            stats.taskBasedIncome += monthlyAmount
            break
          case 'Freelance':
            stats.freelanceIncome += monthlyAmount
            break
        }
      }
    })

    setMonthlyStats(prev => ({
      ...prev,
      ...stats
    }))
  }

  const calculateTaskStats = (taskList) => {
    const stats = {
      pendingAmount: 0,
      completedTasks: 0,
      pendingTasks: 0
    }

    const startOfMonth = new Date(selectedYear, selectedMonth, 1)
    const endOfMonth = new Date(selectedYear, selectedMonth + 1, 0)

    taskList.forEach(task => {
      const taskDate = new Date(task.dueDate)
      if (taskDate >= startOfMonth && taskDate <= endOfMonth) {
        if (task.status === 'Completed') {
          stats.completedTasks++
        } else {
          stats.pendingTasks++
          if (task.paymentStatus === 'Unpaid') {
            stats.pendingAmount += task.amount
          }
        }
      }
    })

    setMonthlyStats(prev => ({
      ...prev,
      ...stats
    }))
  }

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const years = Array.from(
    { length: 5 },
    (_, i) => new Date().getFullYear() - 2 + i
  )

  // Overview card data
  const overviewData = [
    {
      title: 'Total Monthly Income',
      value: monthlyStats.totalIncome,
      icon: '💰',
      color: 'primary'
    },
    {
      title: 'Pending Payments',
      value: monthlyStats.pendingAmount,
      icon: '⏳',
      color: 'warning'
    },
    {
      title: 'Tasks Completed',
      value: monthlyStats.completedTasks,
      suffix: ' tasks',
      icon: '✅',
      color: 'success'
    },
    {
      title: 'Pending Tasks',
      value: monthlyStats.pendingTasks,
      suffix: ' tasks',
      icon: '📋',
      color: 'info'
    }
  ]

  return (
    <div className="dashboard-page container-fluid py-3 px-2">
      {/* Hero card (mobile-first) */}
      <div className="hero-card d-flex justify-content-between align-items-center">
        <div>
          <div className="hero-label">This Month</div>
          <div className="hero-amount">{monthlyStats.totalIncome.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}</div>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-light btn-sm">New Invoice</button>
          <button className="btn btn-outline-light btn-sm">New Task</button>
        </div>
      </div>

      {/* Header with Date Filter */}
  <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h2 className="fw-bold mb-1 fs-5">Income Dashboard</h2>
          <p className="text-muted small mb-0">Financial overview for {months[selectedMonth]} {selectedYear}</p>
        </div>
        <div className="d-flex gap-2 align-items-center">
          <div className="date-filter d-flex align-items-center">
            {/* Hidden month input — clicking the icon will open the native month picker */}
            <input
              type="month"
              aria-hidden="true"
              ref={useRef(null)}
              style={{ display: 'none' }}
            />
            <MonthPickerIcon
              selectedMonth={selectedMonth}
              selectedYear={selectedYear}
              onChange={(m, y) => {
                setSelectedMonth(m)
                setSelectedYear(y)
              }}
            />
          </div>
        </div>
      </div>

      {/* Mobile: two cards per row (no horizontal scroll) */}
      <div className="d-md-none row g-2 mb-3">
        {overviewData.map((card, index) => (
          <div key={index} className="col-6">
            <div className="card shadow-sm p-3 h-100">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="mb-1" style={{ fontSize: '0.85rem' }}>{card.title}</h6>
                  <div className="fw-bold" style={{ fontSize: '0.95rem' }}>{card.value.toLocaleString('en-US', { style: card.suffix ? 'decimal' : 'currency', currency: 'USD', maximumFractionDigits: 0 })}{card.suffix || ''}</div>
                </div>
                <div className="fs-4" style={{ color: '#352359' }}>{card.icon}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop/tablet overview grid */}
      <div className="row g-3 mb-4 d-none d-md-flex">
        {overviewData.map((card, index) => (
          <div key={index} className="col-md-3">
            <div className={`card border-0 shadow-sm bg-${card.color} text-white h-100`}>
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h6 className="mb-0">{card.title}</h6>
                  <span className="fs-4">{card.icon}</span>
                </div>
                <h3 className="mb-0">
                  {card.value.toLocaleString('en-US', {
                    style: card.suffix ? 'decimal' : 'currency',
                    currency: 'USD',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  })}
                  {card.suffix || ''}
                </h3>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Income Distribution */}
      <div className="row mb-4">
        <div className="col-md-8">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h5 className="card-title mb-4">Monthly Income Breakdown</h5>
              <div className="chart-container">
                <IncomeChart data={[
                  monthlyStats.fixedIncome,
                  monthlyStats.taskBasedIncome,
                  monthlyStats.freelanceIncome
                ]} />
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h5 className="card-title mb-4">Income Distribution</h5>
              <PieChart data={{
                labels: ['Fixed', 'Task-Based', 'Freelance'],
                values: [
                  monthlyStats.fixedIncome,
                  monthlyStats.taskBasedIncome,
                  monthlyStats.freelanceIncome
                ]
              }} />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity removed per request */}

      {/* Floating quick-add button */}
      <button className="fab" aria-label="Quick add">
        <BsPlusLg />
      </button>
    </div>
  )
}
