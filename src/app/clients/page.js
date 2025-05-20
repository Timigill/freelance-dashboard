'use client'
import { useState, useEffect } from 'react'

export default function ClientsPage() {
  const [clients, setClients] = useState([])
  const [form, setForm] = useState({
    name: '', email: '', company: '', phone: '', notes: ''
  })

  const isValid = Object.values(form).every(f => f.trim() !== '')

  useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = async () => {
    const res = await fetch('/api/clients')
    const data = await res.json()
    setClients(data)
  }

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async e => {
    e.preventDefault()
    if (!isValid) return alert('Please fill all fields.')
    await fetch('/api/clients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })
    setForm({ name: '', email: '', company: '', phone: '', notes: '' })
    fetchClients()
    document.getElementById('closeModalBtn').click()
  }

  const getUniqueCompanies = () => {
    return [...new Set(clients.map(c => c.company.trim()).filter(Boolean))]
  }

  return (
    <div className="container-fluid py-4">
      {/* Title and Add Button */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold mb-0">Client Management</h3>
          <p className="text-muted">Manage your client list, companies, and contact notes.</p>
        </div>
        <button
          className="btn btn-primary"
          data-bs-toggle="modal"
          data-bs-target="#clientModal"
        >
          ➕ Add Client
        </button>
      </div>

      {/* Summary Cards */}
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card bg-primary text-white shadow-sm">
            <div className="card-body">
              <h6 className="mb-1">Total Clients</h6>
              <h3 className="fw-bold">{clients.length}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card bg-success text-white shadow-sm">
            <div className="card-body">
              <h6 className="mb-1">Active Companies</h6>
              <h4 className="fw-bold">{getUniqueCompanies().length}</h4>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card bg-dark text-white shadow-sm">
            <div className="card-body">
              <h6 className="mb-1">Latest Client</h6>
              <p className="mb-0 fw-semibold">
                {clients.length > 0 ? clients[clients.length - 1].name : '—'}
              </p>
              <small>{clients.length > 0 ? new Date(clients[clients.length - 1].createdAt).toLocaleDateString() : ''}</small>
            </div>
          </div>
        </div>
      </div>

      {/* Clients Table */}
      <div className="card shadow-sm">
        <div className="card-header fw-semibold">Client List</div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table align-middle mb-0 table-striped table-bordered">
              <thead className="table-light">
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Company</th>
                  <th>Phone</th>
                  <th>Notes</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {clients.length > 0 ? clients.map(client => (
                  <tr key={client._id}>
                    <td>{client.name}</td>
                    <td>{client.email}</td>
                    <td><span className="badge bg-info text-dark">{client.company}</span></td>
                    <td>{client.phone}</td>
                    <td className="text-muted">{client.notes}</td>
                    <td><span className="badge bg-secondary">{new Date(client.createdAt).toLocaleDateString()}</span></td>
                  </tr>
                )) : (
                  <tr><td colSpan="6" className="text-center py-4 text-muted">No clients added yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      <div className="modal fade" id="clientModal" tabIndex="-1" aria-labelledby="clientModalLabel" aria-hidden="true">
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="clientModalLabel">Add New Client</h5>
              <button id="closeModalBtn" type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="row">
                  {['name', 'email', 'company', 'phone'].map((field, i) => (
                    <div className="col-md-6 mb-3" key={i}>
                      <label className="form-label text-capitalize">{field}</label>
                      <input
                        name={field}
                        value={form[field]}
                        onChange={handleChange}
                        className="form-control"
                        placeholder={`Enter ${field}`}
                      />
                    </div>
                  ))}
                  <div className="col-12 mb-3">
                    <label className="form-label">Notes</label>
                    <textarea
                      name="notes"
                      value={form.notes}
                      onChange={handleChange}
                      className="form-control"
                      rows="3"
                      placeholder="Enter notes..."
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={!isValid}>
                  Save Client
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
