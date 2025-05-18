'use client'

import OverviewCards from '@/components/OverviewCards'
import IncomeChart from '@/components/IncomeChart'
import RevenueChart from '@/components/RevenueChart'
import PieChart from '@/components/PieChart'
import ConversionChart from '@/components/ConversionChart'
import RecentInvoices from '@/components/RecentInvoices'
import TopClients from '@/components/TopClients'
import MarqueeBar from '@/components/MarqueeBar'

export default function HomePage() {
  return (
    <div className="dashboard-page container-fluid py-3 px-2">
      {/* 🧾 Header with Marquee */}
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap">
        <div>
          <h2 className="fw-bold mb-1 fs-4">Dashboard Overview</h2>
          <p className="text-muted small mb-0">Track revenue, clients, and financial trends in real-time.</p>
        </div>
        <div className="d-none d-md-block">
          <MarqueeBar />
        </div>
      </div>

      {/* 💳 KPI Cards */}
      <OverviewCards />

      {/* 📊 Condensed Charts Row */}
      <div className="row mt-3">
        <div className="col-md-4 mb-3">
          <div className="chart-container card shadow-sm p-2">
            <IncomeChart />
          </div>
        </div>
        <div className="col-md-4 mb-3">
          <div className="chart-container card shadow-sm p-2">
            <RevenueChart />
          </div>
        </div>
        <div className="col-md-4 mb-3">
          <div className="chart-container card shadow-sm p-2">
            <PieChart />
          </div>
        </div>
      </div>

      {/* 📈 More Charts + System Image */}
      <div className="row">
        <div className="col-md-6 mb-3">
          <div className="chart-container card shadow-sm p-2">
            <ConversionChart />
          </div>
        </div>
        <div className="col-md-6 mb-3">
          <div className="card shadow-sm p-2 h-100">
            <h6 className="mb-2 small">System Overview</h6>
            <img
              src="/overview.webp"
              alt="System Overview"
              className="img-fluid rounded w-100"
              style={{ maxHeight: '220px', objectFit: 'cover' }}
            />
          </div>
        </div>
      </div>

      {/* 🧾 Recent Invoices + Top Clients */}
      <div className="row">
        <div className="col-md-6 mb-3">
          <RecentInvoices />
        </div>
        <div className="col-md-6 mb-3">
          <TopClients />
        </div>
      </div>
    </div>
  )
}
