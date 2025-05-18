'use client'

export default function RecentInvoices() {
  const invoices = [
    { id: 'INV-001', client: 'Acme Corp', amount: '$1,200', status: 'Paid', date: '2025-05-10' },
    { id: 'INV-002', client: 'Globex Inc.', amount: '$800', status: 'Pending', date: '2025-05-12' },
    { id: 'INV-003', client: 'Initech', amount: '$1,500', status: 'Overdue', date: '2025-05-14' },
  ]

  return (
    <div className="card p-3 shadow-sm">
      <h6 className="mb-3">Recent Invoices</h6>
      <table className="table table-sm table-hover">
        <thead className="table-light">
          <tr>
            <th>ID</th><th>Client</th><th>Amount</th><th>Status</th><th>Date</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((inv, i) => (
            <tr key={i}>
              <td>{inv.id}</td>
              <td>{inv.client}</td>
              <td>{inv.amount}</td>
              <td>
                <span className={`badge bg-${inv.status === 'Paid' ? 'success' : inv.status === 'Pending' ? 'warning' : 'danger'}`}>
                  {inv.status}
                </span>
              </td>
              <td>{inv.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
