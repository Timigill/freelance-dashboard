'use client'
import { useEffect, useState, Suspense } from 'react'
import { useParams, useRouter } from 'next/navigation'

function FilteredClientsPageContent() {
  const { filter } = useParams()
  const router = useRouter()
  const [clients, setClients] = useState([])

  useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = async () => {
    try {
      const res = await fetch('/api/clients')
      const data = await res.json()
      setClients(data)
    } catch (err) {
      console.error('Error fetching clients:', err)
    }
  }

  // 🔹 Apply filtering based on `filter` from URL
  const filteredClients = clients.filter((c) => {
    if (filter === 'all') return true
    if (filter === 'active') return c.status === 'active'
    if (filter === 'inactive') return c.status === 'inactive'
    if (filter === 'closed') return c.status === 'closed'
    if (filter === 'new') {
      const date = new Date(c.createdAt)
      const now = new Date()
      return (
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
      )
    }
    return true
  })

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold text-capitalize">
          {filter === 'all' ? 'All Clients' : `${filter} Clients`}
        </h3>
        <button className="btn btn-secondary" onClick={() => router.back()}>
          ⬅ Back
        </button>
      </div>

      <div className="card shadow-sm">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table align-middle mb-0 table-striped table-bordered">
              <thead className="table-light">
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Company</th>
                  <th>Phone</th>
                  <th>Category</th>
                  <th>Deadline</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {filteredClients.length > 0 ? (
                  filteredClients.map((client) => (
                    <tr key={client._id}>
                      <td>{client.name}</td>
                      <td>{client.email}</td>
                      <td>{client.company || '—'}</td>
                      <td>{client.phone || '—'}</td>
                      <td>{client.category || 'Uncategorized'}</td>
                      <td>
                        {client.deadline
                          ? new Date(client.deadline).toLocaleDateString()
                          : '—'}
                      </td>
                      <td>
                        {new Date(client.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-4 text-muted">
                      No clients found for this category.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function FilteredClientsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <FilteredClientsPageContent />
    </Suspense>
  )
}
