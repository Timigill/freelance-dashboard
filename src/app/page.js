'use client'
import { useState, useEffect, useRef } from 'react'
import IncomeChart from '@/components/IncomeChart'
import PieChart from '@/components/PieChart'
import { Form } from 'react-bootstrap'
import { BsPlusLg, BsCalendar3 } from 'react-icons/bs'
import FloatingActionButton from '@/components/FloatingIcon'

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
  const [clients, setClients] = useState([])
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
  const [monthlySeries, setMonthlySeries] = useState({ labels: [], values: [] })

  useEffect(() => {
    fetchIncomeSources()
    fetchTasks()
    fetchClients()
  }, [selectedMonth, selectedYear])

  // compute last 6 months totals (ending at selectedMonth/selectedYear)
  const computeLastSixMonths = () => {
    const labelsArr = []
    const valuesArr = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date(selectedYear, selectedMonth - i, 1)
      const year = d.getFullYear()
      const month = d.getMonth()
      labelsArr.push(`${months[month].slice(0, 3)} ${String(year).slice(-2)}`)

      const startOfMonth = new Date(year, month, 1)
      const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59, 999)

      let total = 0

      // Sum payments on incomeSources if payments exist, otherwise approximate recurring amounts
      incomeSources.forEach(src => {
        if (src.payments && src.payments.length) {
          src.payments.forEach(p => {
            const pd = new Date(p.date)
            if (pd >= startOfMonth && pd <= endOfMonth) total += (p.amount || 0)
          })
        } else {
          // approximate based on frequency
          const freq = src.frequency || 'Monthly'
          const amt = Number(src.amount || 0)
          if (freq === 'Monthly') total += amt
          else if (freq === 'Weekly') total += amt * 4
          else if (freq === 'Yearly') total += amt / 12
          else if (freq === 'One-time') {
            const sd = src.startDate ? new Date(src.startDate) : null
            if (sd && sd >= startOfMonth && sd <= endOfMonth) total += amt
          }
        }
      })

      // Include paid/completed tasks in that month
      tasks.forEach(task => {
        const td = task.dueDate ? new Date(task.dueDate) : null
        if (td && td >= startOfMonth && td <= endOfMonth) {
          // count completed/paid tasks
          if (task.status === 'Completed' || task.paymentStatus === 'Paid') {
            total += Number(task.amount || 0)
          }
          // include explicit payments array on tasks if available
          if (task.payments && task.payments.length) {
            task.payments.forEach(p => {
              const pd = new Date(p.date)
              if (pd >= startOfMonth && pd <= endOfMonth) total += (p.amount || 0)
            })
          }
        }
      })

      valuesArr.push(Math.round(total))
    }

    setMonthlySeries({ labels: labelsArr, values: valuesArr })
  }

  useEffect(() => {
    computeLastSixMonths()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [incomeSources, tasks, selectedMonth, selectedYear])

  const fetchClients = async () => {
    // Hardcoded sample clients
    const sampleClients = [
      { _id: '1', name: 'John Smith', company: 'Microsoft', },
      { _id: '2', name: 'Sarah Johnson', company: 'Google' },
      { _id: '3', name: 'David Chen', company: 'Apple' },
      { _id: '4', name: 'Maria Garcia', company: 'Meta' },
      { _id: '5', name: 'James Wilson', company: 'Amazon' }
    ]
    setClients(sampleClients)
  }

  // Removed dynamic client distribution logic in favor of hardcoded data
  const hardcodedClientData = {
    labels: ['Microsoft', 'Google', 'Apple', 'Meta', 'Amazon'],
    values: [45000, 38000, 32000, 28000, 22000]
  }

  // Removed dynamic client distribution calculation

  const fetchIncomeSources = async () => {
  try {
    const res = await fetch(`/api/income?month=${selectedMonth}&year=${selectedYear}`)
    const data = await res.json()
    setIncomeSources(data)
    calculateMonthlyIncome(data)
  } catch (error) {
    console.error('Error fetching income sources:', error)
  }
}



  const fetchTasks = async () => {
    // Hardcoded sample tasks
    const sampleTasks = [
      { id: 1, name: 'API Integration', status: 'Completed', amount: 15000, dueDate: new Date(), paymentStatus: 'Paid' },
      { id: 2, name: 'UI Development', status: 'Completed', amount: 12000, dueDate: new Date(), paymentStatus: 'Paid' },
      { id: 3, name: 'Database Design', status: 'In Progress', amount: 8000, dueDate: new Date(), paymentStatus: 'Unpaid' },
      { id: 4, name: 'Testing', status: 'Pending', amount: 5000, dueDate: new Date(), paymentStatus: 'Unpaid' }
    ]
    setTasks(sampleTasks)
    calculateTaskStats(sampleTasks)
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
     
      color: 'primary'
    },
    {
      title: 'Pending Payments',
      value: monthlyStats.pendingAmount,
     
      color: 'warning'
    },
    {
      title: 'Tasks Completed',
      value: monthlyStats.completedTasks,
      suffix: ' tasks',
       color: 'success'
    },
    {
      title: 'Pending Tasks',
      value: monthlyStats.pendingTasks,
      suffix: ' tasks',
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
        <div className="d-flex flex-column gap-2">
          <button className="btn btn-light btn-sm">New Client</button>
          <button className="btn btn-outline-light btn-sm">New Task</button>
        </div>
      </div>

      {/* Header with Date Filter */}
  <div className="d-flex justify-content-between mt-2 pt-2 align-items-center mb-3">
        <div>
          <h2 className="fw-bold mb-0 fs-5">Income Dashboard</h2>
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
            <div className="card shadow-sm p-2 h-100 overview-card">
              <div className="d-flex flex-column align-items-center justify-content-center">
                <h3 className="fw-bold mb-1" style={{ fontSize: '1.5rem' }}>{card.value.toLocaleString('en-US', { style: card.suffix ? 'decimal' : 'currency', currency: 'USD', maximumFractionDigits: 0 })}{card.suffix || ''}</h3>
                <p className="mb-1 text-muted" style={{ fontSize: '0.8rem' }}>{card.title}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop/tablet overview grid */}
      <div className="row g-3 mb-4 d-none d-md-flex">
        {overviewData.map((card, index) => (
          <div key={index} className="col-md-3">
            <div className={`card border-0 shadow-sm bg-${card.color} text-white h-100 overview-card`}>
              <div className="card-body">
                <div className="d-flex flex-column align-items-center justify-content-center mb-2 text-center">
                  <h3 className="mb-1">{card.value.toLocaleString('en-US', {
                    style: card.suffix ? 'decimal' : 'currency',
                    currency: 'USD',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  })}{card.suffix || ''}</h3>
                  <h6 className="mb-1 text-white-50" style={{ opacity: 0.9 }}>{card.title}</h6>
                  <span className="fs-4 mt-1">{card.icon}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Income Distribution */}
      <div className="row mb-4">
        <div className="col-md-8">
            <div className="card shadow-sm h-100">
              <div className="card-body d-flex flex-column  px-3">
                <h5 className="card-title ">Half Yearky Income Distribution</h5>
                <div className="chart-container flex-fill d-flex align-items-center" style={{ minHeight: 150 }}>
                  <IncomeChart monthlyData={monthlySeries} />
                </div>
              </div>
            </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h5 className="card-title mb-4">Income by Client</h5>
              <PieChart data={{
                labels: ['Microsoft', 'Google', 'Apple', 'Meta', 'Amazon'],
                values: [45000, 38000, 32000, 28000, 22000]
              }} />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity removed per request */}

      {/* Floating quick-add button */}
    <FloatingActionButton />
    </div>
  )
}
