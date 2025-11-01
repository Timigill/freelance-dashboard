'use client'
import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

function ClientsPageContent() {
  const [clients, setClients] = useState([])
  const [form, setForm] = useState({
    name: '',
    address: '',
    company: '',
    phone: '',
    category: '',
  })
  const [editingClientId, setEditingClientId] = useState(null)
  const [shouldCloseModal, setShouldCloseModal] = useState(false)
  const [sortOrder, setSortOrder] = useState('newest')
  const [categoryFilter, setCategoryFilter] = useState('All')

  const isValid = Object.values(form).every((f) => f.trim() !== '')
  const searchParams = useSearchParams()

  useEffect(() => {
    const modalElement = document.getElementById('clientModal')
    if (!modalElement) return

    let modalInstance = null

    const initModal = async () => {
      try {
        const bootstrap = await import('bootstrap/dist/js/bootstrap.bundle.min.js')
        const Modal = bootstrap.Modal || window.bootstrap?.Modal
        if (!Modal) {
          console.warn('Bootstrap Modal not available yet.')
          return
        }

        modalInstance = new Modal(modalElement)

        const open = searchParams.get('openModal') === 'true'
        if (open) modalInstance.show()

        const handleHidden = () => {
          document.body.classList.remove('modal-open')
          document.body.style.removeProperty('padding-right')
          document.querySelectorAll('.modal-backdrop').forEach((el) => el.remove())
        }

        modalElement.addEventListener('hidden.bs.modal', handleHidden)
      } catch (err) {
        console.error('Error initializing modal:', err)
      }
    }

    initModal()

    return () => {
      if (modalElement && modalInstance) {
        modalElement.removeEventListener('hidden.bs.modal', () => {})
        modalInstance.dispose?.()
      }
    }
  }, [searchParams])

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

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!isValid) return alert('Please fill all fields.')

    try {
      const method = editingClientId ? 'PUT' : 'POST'
      const url = editingClientId
        ? `/api/clients/${editingClientId}`
        : '/api/clients'

      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      setForm({ name: '', address: '', company: '', phone: '', category: '' })
      setEditingClientId(null)
      fetchClients()
      setShouldCloseModal(true)
    } catch (err) {
      console.error('Error saving client:', err)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this client?')) return
    try {
      await fetch(`/api/clients/${id}`, { method: 'DELETE' })
      setClients((prev) => prev.filter((c) => c._id !== id))
    } catch (err) {
      console.error('Error deleting client:', err)
    }
  }

  const handleEdit = async (client) => {
    setEditingClientId(client._id)
    setForm({
      name: client.name || '',
      address: client.address || '',
      company: client.company || '',
      phone: client.phone || '',
      category: client.category || '',
    })

    const modalElement = document.getElementById('clientModal')
    if (!modalElement) return

    try {
      const bootstrap = await import('bootstrap/dist/js/bootstrap.bundle.min.js')
      const Modal = bootstrap.Modal || window.bootstrap?.Modal
      if (!Modal) {
        console.warn('Bootstrap Modal not available yet.')
        return
      }

      const modal = new Modal(modalElement)
      modal.show()
    } catch (err) {
      console.error('Error opening modal for edit:', err)
    }
  }

  useEffect(() => {
    if (shouldCloseModal) {
      const btn = document.getElementById('closeModalBtn')
      if (btn) btn.click()
      setShouldCloseModal(false)
    }
  }, [shouldCloseModal])

  const filteredAndSortedClients = clients
    .filter((c) => categoryFilter === 'All' || c.category === categoryFilter)
    .sort((a, b) =>
      sortOrder === 'newest'
        ? new Date(b.createdAt) - new Date(a.createdAt)
        : new Date(a.createdAt) - new Date(b.createdAt)
    )

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-nowrap">
        <div>
          <h3 className="fw-bold mb-0 fs-5 fs-md-4">Client Management</h3>
          <p className="text-muted fs-6 mb-0">
            Manage your client list, companies, and contact notes.
          </p>
        </div>

        <button
          className="btn btn-primary mt-2 mt-md-0"
          data-bs-toggle="modal"
          data-bs-target="#clientModal"
          onClick={() => setEditingClientId(null)}
          style={{ whiteSpace: 'nowrap', fontSize: '0.9rem', padding: '6px 14px' }}
        >
          Add Client
        </button>
      </div>

      <div className="row row-cols-2 row-cols-lg-5 g-3">
        <Link href="/clients/all" className="col text-decoration-none">
          <div
            className="card bg-primary text-white shadow-sm h-100 text-center"
            style={{ cursor: 'pointer', minHeight: '130px' }}
          >
            <div className="card-body d-flex flex-column justify-content-center align-items-center">
              <h6 className="mb-1">Total Clients</h6>
              <h3 className="fw-bold">{clients.length}</h3>
            </div>
          </div>
        </Link>

        <Link href="/clients/active" className="col text-decoration-none">
          <div
            className="card bg-info text-white shadow-sm h-100 text-center"
            style={{ cursor: 'pointer', minHeight: '130px' }}
          >
            <div className="card-body d-flex flex-column justify-content-center align-items-center">
              <h6 className="mb-1">Active Clients</h6>
              <h4 className="fw-bold">
                {clients.filter((c) => c.status === 'active').length}
              </h4>
            </div>
          </div>
        </Link>

        <Link href="/clients/inactive" className="col text-decoration-none">
          <div
            className="card bg-danger text-white shadow-sm h-100 text-center"
            style={{ cursor: 'pointer', minHeight: '130px' }}
          >
            <div className="card-body d-flex flex-column justify-content-center align-items-center">
              <h6 className="mb-1">Inactive Clients</h6>
              <h4 className="fw-bold">
                {clients.filter((c) => c.status === 'inactive').length}
              </h4>
            </div>
          </div>
        </Link>

        <Link href="/clients/closed" className="col text-decoration-none">
          <div
            className="card bg-secondary text-white shadow-sm h-100 text-center"
            style={{ cursor: 'pointer', minHeight: '130px' }}
          >
            <div className="card-body d-flex flex-column justify-content-center align-items-center">
              <h6 className="mb-1">Closed Clients</h6>
              <h4 className="fw-bold">
                {clients.filter((c) => c.status === 'closed').length}
              </h4>
            </div>
          </div>
        </Link>
      </div>

      <div className="card shadow-sm mt-4">
        <div className="card-header fw-semibold d-flex justify-content-between align-items-center">
          <span>Client List</span>
        </div>

        <div className="card-body d-flex mb-3 gap-2">
          <div className="d-flex flex-wrap justify-content-between gap-2">
            <select
              className="form-select form-select-sm"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>

            <select
              className="form-select form-select-sm"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="All">All Categories</option>
              <option value="Freelance">Freelance</option>
              <option value="Salary-Based">Salary-Based</option>
              <option value="Contract">Contract</option>
            </select>
          </div>
        </div>

        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table align-middle mb-0 table-striped table-bordered">
              <thead className="table-light">
                <tr>
                  <th>Name</th>
                  <th>Company</th>
                  <th>Phone</th>
                  <th>Category</th>
                  <th>Joined</th>
                  <th>Address</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedClients.length > 0 ? (
                  filteredAndSortedClients.map((client) => (
                    <tr key={client._id}>
                      <td>{client.name}</td>
                      <td>{client.company || '—'}</td>
                      <td>{client.phone || '—'}</td>
                      <td>{client.category || 'Uncategorized'}</td>
                      <td>
                        <small className="text-muted">
                          {new Date(client.createdAt).toLocaleDateString()}
                        </small>
                      </td>
                      <td>{client.address || '—'}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-outline-danger me-2"
                          onClick={() => handleDelete(client._id)}
                        >
                          Delete
                        </button>
                        <button
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => handleEdit(client)}
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-4 text-muted">
                      No clients found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div
        className="modal fade"
        id="clientModal"
        tabIndex="-1"
        aria-labelledby="clientModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="clientModalLabel">
                {editingClientId ? 'Edit Client' : 'Add New Client'}
              </h5>
              <button
                id="closeModalBtn"
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="row">
                  {['name', 'address', 'company', 'phone'].map((field) => (
                    <div className="col-md-6 mb-3" key={field}>
                      <label className="form-label text-capitalize">{field}</label>
                      <input
                        type={field === 'phone' ? 'tel' : 'text'}
                        name={field}
                        value={form[field]}
                        onChange={handleChange}
                        className="form-control"
                        placeholder={`Enter ${field}`}
                        required={['name', 'address', 'phone'].includes(
                          field
                        )}
                      />
                    </div>
                  ))}

                  <div className="col-md-6 mb-3">
                    <label className="form-label">Category</label>
                    <select
                      name="category"
                      value={form.category || ''}
                      onChange={handleChange}
                      className="form-select"
                      required
                    >
                      <option value="">Select category</option>
                      <option value="Fixed">Fixed</option>
                      <option value="Salary-Based">Salary-Based</option>
                      <option value="Freelance">Freelance</option>
                      <option value="Task-Based">Task-Based</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  data-bs-dismiss="modal"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={!isValid}
                >
                  {editingClientId ? 'Update Client' : 'Save Client'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ClientsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ClientsPageContent />
    </Suspense>
  )
}
