'use client'
import { useState } from 'react'

const invoices = [
  { id: 'INV-001', amount: 500, status: 'Paid' },
  { id: 'INV-002', amount: 1200, status: 'Pending' },
  { id: 'INV-003', amount: 850, status: 'Overdue' }
]

export default function InvoicesPage() {
  const [status, setStatus] = useState('All')
  const filtered = invoices.filter(i => status === 'All' || i.status === status)

  const total = filtered.reduce((acc, i) => acc + i.amount, 0)

  return (
    <div>
      <h2>Invoices</h2>
      <div className="mb-3">
        <select className="form-select w-auto" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option>All</option>
          <option>Paid</option>
          <option>Pending</option>
          <option>Overdue</option>
        </select>
      </div>
      <div className="row">
        {filtered.map((inv, i) => (
          <div className="col-md-4 mb-3" key={i}>
            <div className="card p-3">
              <h5>{inv.id}</h5>
              <p className="mb-1">${inv.amount}</p>
              <span className={`badge bg-${inv.status === 'Paid' ? 'success' : inv.status === 'Pending' ? 'warning' : 'danger'}`}>
                {inv.status}
              </span>
            </div>
          </div>
        ))}
      </div>
      <div><strong>Total: ${total}</strong></div>
    </div>
  )
}
