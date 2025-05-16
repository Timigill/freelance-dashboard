'use client'
import { useState } from 'react'

const clients = [
  { name: 'Jane Doe', email: 'jane@example.com', type: 'Agency', status: 'Active' },
  { name: 'John Smith', email: 'john@example.com', type: 'Freelancer', status: 'Inactive' },
  { name: 'Ali Raza', email: 'ali@agency.com', type: 'Startup', status: 'Active' },
  { name: 'Sara Khan', email: 'sara@biz.com', type: 'Enterprise', status: 'Pending' }
]

const statusColor = {
  Active: 'success',
  Inactive: 'secondary',
  Pending: 'warning'
}

export default function ClientsPage() {
  const [search, setSearch] = useState('')
  const filtered = clients.filter(c => c.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div>
      <h2>Clients</h2>
      <input
        type="text"
        className="form-control mb-3"
        placeholder="Search clients..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <table className="table table-hover">
        <thead>
          <tr><th>Name</th><th>Email</th><th>Type</th><th>Status</th></tr>
        </thead>
        <tbody>
          {filtered.map((c, i) => (
            <tr key={i}>
              <td>{c.name}</td>
              <td>{c.email}</td>
              <td>{c.type}</td>
              <td><span className={`badge bg-${statusColor[c.status]}`}>{c.status}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="d-flex justify-content-between">
        <small>Showing {filtered.length} clients</small>
        <nav>
          <ul className="pagination pagination-sm">
            <li className="page-item active"><a className="page-link">1</a></li>
            <li className="page-item"><a className="page-link">2</a></li>
          </ul>
        </nav>
      </div>
    </div>
  )
}
