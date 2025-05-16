import IncomeChart from '@/components/IncomeChart'
import RevenueChart from '@/components/RevenueChart'

export default function Dashboard() {
  return (
    <div>
      <h1 className="mb-4">Dashboard</h1>
      <div className="row">
        <div className="col-md-6 mb-4">
          <div className="card p-3">
            <h5 className="mb-2">Monthly Income</h5>
            <IncomeChart />
          </div>
        </div>
        <div className="col-md-6 mb-4">
          <div className="card p-3">
            <h5 className="mb-2">Revenue vs Expenses</h5>
            <RevenueChart />
          </div>
        </div>
      </div>
      <div className="row text-center">
        <div className="col">
          <div className="card p-3">
            <h6>Total Clients</h6><strong>36</strong>
          </div>
        </div>
        <div className="col">
          <div className="card p-3">
            <h6>Open Invoices</h6><strong>5</strong>
          </div>
        </div>
        <div className="col">
          <div className="card p-3">
            <h6>Upcoming Projects</h6><strong>3</strong>
          </div>
        </div>
      </div>
    </div>
  )
}
