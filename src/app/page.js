
'use client'
import { useState, useEffect, useRef } from 'react'
import IncomeChart from '@/components/IncomeChart'
import PieChart from '@/components/PieChart'
import { BsCalendar3 } from 'react-icons/bs'
import FloatingActionButton from '@/components/FloatingIcon'

/* 📅 Month Picker Button Component */
function MonthPickerIcon({ selectedMonth, selectedYear, onChange }) {
  const inputRef = useRef(null)

  const openPicker = () => {
    if (!inputRef.current) return
    if (typeof inputRef.current.showPicker === 'function') inputRef.current.showPicker()
    else { inputRef.current.focus(); inputRef.current.click() }
  }

  const handleChange = (e) => {
    const val = e.target.value
    if (!val) return
    const [y, m] = val.split('-')
    onChange(parseInt(m, 10) - 1, parseInt(y, 10))
  }

  return (
    <>
      <input
        ref={inputRef}
        type="month"
        value={`${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}`}
        onChange={handleChange}
        style={{ display: 'none' }}
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

/* 🧾 Main Dashboard Component */
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

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  /* ✅ Fetch Income based on selected month/year */
  const fetchIncomeSources = async () => {
    try {
      const res = await fetch(`/api/income?month=${selectedMonth + 1}&year=${selectedYear}`)
      const data = await res.json()
      setIncomeSources(data)

      const stats = calculateMonthlyIncome(data)
      setMonthlyStats(prev => ({ ...prev, ...stats }))
    } catch (error) {
      console.error('Error fetching income sources:', error)
    }
  }

  /* ✅ Fetch Tasks (Static Sample) */
  const fetchTasks = async () => {
    const sampleTasks = [
      { id: 1, name: 'API Integration', status: 'Completed', amount: 15000, dueDate: new Date(2025, selectedMonth, 10), paymentStatus: 'Paid' },
      { id: 2, name: 'UI Development', status: 'Completed', amount: 12000, dueDate: new Date(2025, selectedMonth, 12), paymentStatus: 'Paid' },
      { id: 3, name: 'Database Design', status: 'In Progress', amount: 8000, dueDate: new Date(2025, selectedMonth, 18), paymentStatus: 'Unpaid' },
      { id: 4, name: 'Testing', status: 'Pending', amount: 5000, dueDate: new Date(2025, selectedMonth, 22), paymentStatus: 'Unpaid' }
    ]
    setTasks(sampleTasks)
    calculateTaskStats(sampleTasks)
  }

  /* ✅ Fetch Clients (Static Sample) */
  const fetchClients = async () => {
    const sampleClients = [
      { _id: '1', name: 'John Smith', company: 'Microsoft' },
      { _id: '2', name: 'Sarah Johnson', company: 'Google' },
      { _id: '3', name: 'David Chen', company: 'Apple' },
      { _id: '4', name: 'Maria Garcia', company: 'Meta' },
      { _id: '5', name: 'James Wilson', company: 'Amazon' }
    ]
    setClients(sampleClients)
  }

  /* ✅ Calculate Monthly Income */
  const calculateMonthlyIncome = (sources) => {
    const stats = { totalIncome: 0, fixedIncome: 0, taskBasedIncome: 0, freelanceIncome: 0 }

    sources.forEach(source => {
      if (source.isActive) {
        const amount = Number(source.amount) || 0
        stats.totalIncome += amount
        if (source.type === 'Fixed') stats.fixedIncome += amount
        if (source.type === 'Task') stats.taskBasedIncome += amount
        if (source.type === 'Freelance') stats.freelanceIncome += amount
      }
    })
    return stats
  }

  /* ✅ Calculate Task Statistics */
  const calculateTaskStats = (taskList) => {
    const stats = { pendingAmount: 0, completedTasks: 0, pendingTasks: 0 }

    const startOfMonth = new Date(selectedYear, selectedMonth, 1)
    const endOfMonth = new Date(selectedYear, selectedMonth + 1, 0)

    taskList.forEach(task => {
      const date = new Date(task.dueDate)
      if (date >= startOfMonth && date <= endOfMonth) {
        if (task.status === 'Completed') stats.completedTasks++
        else stats.pendingTasks++
        if (task.paymentStatus === 'Unpaid') stats.pendingAmount += Number(task.amount) || 0
      }
    })
    setMonthlyStats(prev => ({ ...prev, ...stats }))
  }

  /* ✅ Fetch Data when month/year changes */
  useEffect(() => {
    fetchIncomeSources()
    fetchTasks()
    fetchClients()
  }, [selectedMonth, selectedYear])

  /* ✅ Build Chart Data for Last 6 Months */
  useEffect(() => {
    const labels = []
    const values = []

    for (let i = 5; i >= 0; i--) {
      const d = new Date(selectedYear, selectedMonth - i, 1)
      const year = d.getFullYear()
      const month = d.getMonth()
      labels.push(`${months[month].slice(0, 3)} ${String(year).slice(-2)}`)

      let total = 0
      incomeSources.forEach(src => { total += Number(src.amount) || 0 })
      tasks.forEach(task => {
        const tDate = new Date(task.dueDate)
        if (tDate.getFullYear() === year && tDate.getMonth() === month) {
          if (task.status === 'Completed' || task.paymentStatus === 'Paid') total += Number(task.amount) || 0
        }
      })
      values.push(total)
    }

    setMonthlySeries({ labels, values })
  }, [incomeSources, tasks, selectedMonth, selectedYear])

  /* ✅ Overview Cards */
  const overviewData = [
    { title: 'Total Monthly Income', value: monthlyStats.totalIncome, color: 'primary' },
    { title: 'Pending Payments', value: monthlyStats.pendingAmount, color: 'warning' },
    { title: 'Tasks Completed', value: monthlyStats.completedTasks, suffix: ' tasks', color: 'success' },
    { title: 'Pending Tasks', value: monthlyStats.pendingTasks, suffix: ' tasks', color: 'info' }
  ]

  /* ✅ UI */
  return (
    <div className="dashboard-page container-fluid py-3 px-2">

      {/* 💰 Hero Section */}
      <div className="hero-card d-flex justify-content-between align-items-center mb-3">
        <div>
          <div className="hero-label">This Month</div>
          <div className="hero-amount">
            {monthlyStats.totalIncome.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}
          </div>
        </div>
      </div>

      {/* 📅 Header */}
      <div className="d-flex justify-content-between mt-2 pt-2 align-items-center mb-3">
        <div>
          <h2 className="fw-bold mb-0 fs-5">Income Dashboard</h2>
          <p className="text-muted small mb-0">
            Financial overview for {months[selectedMonth]} {selectedYear}
          </p>
        </div>
        <MonthPickerIcon
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          onChange={(m, y) => { setSelectedMonth(m); setSelectedYear(y) }}
        />
      </div>

      {/* 📊 Overview Cards */}
      <div className="row g-3 mb-4">
        {overviewData.map((card, idx) => (
          <div key={idx} className="col-6 col-md-3">
            <div className={`card border-0 shadow-sm bg-${card.color} text-white h-100`}>
              <div className="card-body d-flex flex-column align-items-center justify-content-center">
                <h3 className="mb-1">
                  {card.value.toLocaleString('en-US', {
                    style: card.suffix ? 'decimal' : 'currency',
                    currency: 'USD',
                    maximumFractionDigits: 0
                  })}
                  {card.suffix || ''}
                </h3>
                <h6 className="mb-0">{card.title}</h6>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 📈 Charts Section */}
      <div className="row mb-4">
        <div className="col-md-8">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h5 className="card-title">Half-Yearly Income Distribution</h5>
              <div style={{ minHeight: 180 }}>
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
                labels: clients.map(c => c.company),
                values: [45000, 38000, 32000, 28000, 22000]
              }} />
            </div>
          </div>
        </div>
      </div>

      <FloatingActionButton />
    </div>
  )
}
