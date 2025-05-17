'use client'
import { useState, useEffect } from 'react'

export default function ClientsPage() {
  const [clients, setClients] = useState([])
  const [form, setForm] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    notes: ''
  })

  const isValid = Object.values(form).every(field => field.trim() !== '')

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
  }

  return (
    <div>
      <h2 className="mb-4 fw-bold">Clients</h2>

      <form onSubmit={handleSubmit} className="mb-5">
        <div className="row">
          {['name', 'email', 'company', 'phone'].map((field, i) => (
            <div className="col-md-6 mb-3" key={i}>
              <label className="text-capitalize">{field}</label>
              <input
                name={field}
                value={form[field]}
                onChange={handleChange}
                className="form-control"
              />
            </div>
          ))}
          <div className="col-12 mb-3">
            <label>Notes</label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              className="form-control"
            />
          </div>
        </div>
        <button type="submit" className="btn btn-primary" disabled={!isValid}>
          Add Client
        </button>
      </form>

      <table className="table table-bordered">
        <thead className="table-light">
          <tr>
            <th>Name</th><th>Email</th><th>Company</th><th>Phone</th><th>Notes</th><th>Joined</th>
          </tr>
        </thead>
        <tbody>
          {clients.map(client => (
            <tr key={client._id}>
              <td>{client.name}</td>
              <td>{client.email}</td>
              <td>{client.company}</td>
              <td>{client.phone}</td>
              <td>{client.notes}</td>
              <td>{new Date(client.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
