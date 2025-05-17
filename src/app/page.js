'use client'

import OverviewCards from '@/components/OverviewCards'
import IncomeChart from '@/components/IncomeChart'
import RevenueChart from '@/components/RevenueChart'

export default function HomePage() {
  return (
    <div className="dashboard-page">
      {/* 🧾 Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">Dashboard Overview</h2>
          <p className="text-muted">Track revenue, clients, and financial trends in real-time.</p>
        </div>
      </div>

      {/* 💳 KPI Cards */}
      <OverviewCards />

      {/* 📊 Charts Section */}
      <div className="row mt-4">
        <div className="col-md-6 mb-4">
          <IncomeChart />
        </div>
        <div className="col-md-6 mb-4">
          <RevenueChart />
        </div>
      </div>
    </div>
  )
}
