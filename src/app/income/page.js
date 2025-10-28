'use client'
import { useState, useEffect } from 'react'
import { Modal, Button, Form, Badge } from 'react-bootstrap'

export default function IncomePage() {
  const [incomeSources, setIncomeSources] = useState([])
  const [clients, setClients] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [currentSource, setCurrentSource] = useState(null)
  const [filter, setFilter] = useState('all')
  const [form, setForm] = useState({
    name: '',
    type: 'Fixed',
    amount: '',
    frequency: 'Monthly',
    description: '',
    clientId: '',
    clientName: ''
  })

  // ✅ Fetch income sources
  const fetchIncomeSources = async () => {
    try {
      const res = await fetch('/api/income')
      if (!res.ok) throw new Error('Failed to fetch income sources')
      const data = await res.json()
      setIncomeSources(data)
    } catch (error) {
      console.error('Error fetching income sources:', error)
    }
  }

  // ✅ Fetch clients
  const fetchClients = async () => {
    try {
      const res = await fetch('/api/clients')
      if (!res.ok) throw new Error('Failed to fetch clients')
      const data = await res.json()
      setClients(data)
    } catch (error) {
      console.error('Error fetching clients:', error)
    }
  }

  // Load both on mount
  useEffect(() => {
    fetchIncomeSources()
    fetchClients()
  }, [])

  // ✅ Save or update income
  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (form.clientId && !form.clientName) {
        const sel = clients.find(c => c._id === form.clientId)
        if (sel) form.clientName = sel.company ? `${sel.company} — ${sel.name}` : sel.name
      }

      if (form.amount && typeof form.amount === 'string') {
        form.amount = parseFloat(form.amount) || 0
      }

      const url = currentSource ? `/api/income/${currentSource._id}` : '/api/income'
      const method = currentSource ? 'PUT' : 'POST'

      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })

      setShowModal(false)
      setCurrentSource(null)
      setForm({
        name: '',
        type: 'Fixed',
        amount: '',
        frequency: 'Monthly',
        description: '',
        clientId: '',
        clientName: ''
      })
      fetchIncomeSources()
    } catch (error) {
      console.error('Error saving income source:', error)
    }
  }

  // ✅ Edit income
  const handleEdit = (source) => {
    setCurrentSource(source)
    setForm({
      name: source.name,
      type: source.type,
      amount: source.amount,
      frequency: source.frequency,
      description: source.description || '',
      clientId: source.clientId || '',
      clientName: source.clientName || ''
    })
    setShowModal(true)
  }

  // ✅ Delete income
  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this income source?')) return

    try {
      await fetch(`/api/income/${id}`, { method: 'DELETE' })
      fetchIncomeSources()
    } catch (error) {
      console.error('Error deleting income source:', error)
    }
  }

  // ✅ Filter logic
  const filteredSources =
    filter === 'all'
      ? incomeSources
      : incomeSources.filter(source => source.type === filter)

  const totalIncome = filteredSources.reduce((sum, source) => sum + source.amount, 0)

  return (
    <div className="container-fluid py-4">
      {/* Header */}
     <div className="d-flex justify-content-between align-items-center mb-4 flex-nowrap">
  <div>
    <h3
      className="fw-bold mb-0 fs-5 fs-md-4"
      style={{ color: "var(--bs-primary)" }}
    >
      Income Sources
    </h3>
    <p className="text-muted fs-6 mb-0">
      Manage your income streams and track earnings
    </p>
  </div>

  <button
    className="btn mt-2 mt-md-0"
    style={{
      background: "var(--bs-primary)",
      color: "white",
      whiteSpace: "nowrap", // ✅ keeps text in one line
      fontSize: "0.9rem",   // smaller on mobile
      padding: "6px 14px",  // compact padding
    }}
    onClick={() => {
      setCurrentSource(null)
      setForm({
        name: '',
        type: 'Fixed',
        amount: '',
        frequency: 'Monthly',
        description: '',
        clientId: '',
        clientName: ''
      })
      setShowModal(true)
    }}
  >
  Add Income Source
  </button>
</div>

     {/* Summary Cards */}
<div className="row mb-4 g-3 justify-content-center justify-content-md-start">
  <div className="col-6 col-md-4">
    <div className="card bg-primary text-white h-100 text-center">
      <div className="card-body d-flex flex-column justify-content-center">
        <h6 className="mb-2"
        style={{
          color:"var(--bs-primary)"
        }}
        >Total Monthly Income</h6>
        <h3 className="mb-0">${totalIncome.toLocaleString()}</h3>
      </div>
    </div>
  </div>

  <div className="col-6 col-md-4">
    <div className="card bg-success text-white h-100 text-center">
      <div className="card-body d-flex flex-column justify-content-center">
        <h6 className="mb-2"
         style={{
          color:"var(--bs-primary)"
        }}
        >Active Sources</h6>
        <h3 className="mb-0">{incomeSources.length}</h3>
      </div>
    </div>
  </div>

  <div className="col-6 col-md-4 d-flex justify-content-center justify-content-md-start">
    <div className="card bg-info text-white h-100 text-center" style={{ minWidth: "100%" }}>
      <div className="card-body d-flex flex-column justify-content-center">
        <h6 className="mb-2"
         style={{
          color:"var(--bs-primary)"
        }}
        >Average per Source</h6>
        <h3 className="mb-0">
          ${incomeSources.length
            ? Math.round(totalIncome / incomeSources.length).toLocaleString()
            : 0}
        </h3>
      </div>
    </div>
  </div>
</div>

      {/* Filter Controls */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <div className="btn-group">
            {['all', 'Fixed', 'Task-Based', 'Freelance'].map(t => (
              <button
                key={t}
                className={`btn ${filter === t ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setFilter(t)}
              >
                {t === 'all' ? 'All' : t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Income Sources Table */}
      <div className="card shadow-sm">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Name</th>
                  <th>Client</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Frequency</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSources.map(source => (
                  <tr key={source._id}>
                    <td>{source.name}</td>
                    <td>{source.clientName || (source.clientId ? 'Client' : '—')}</td>
                    <td>
                      <Badge
                        bg={
                          source.type === 'Fixed'
                            ? 'primary'
                            : source.type === 'Task-Based'
                            ? 'success'
                            : 'info'
                        }
                      >
                        {source.type}
                      </Badge>
                    </td>
                    <td>${source.amount.toLocaleString()}</td>
                    <td>{source.frequency}</td>
                    <td>
                      <Badge bg={source.isActive ? 'success' : 'secondary'}>
                        {source.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="me-2"
                        onClick={() => handleEdit(source)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDelete(source._id)}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{currentSource ? 'Edit' : 'Add'} Income Source</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter source name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Client</Form.Label>
              <Form.Select
                required
                value={form.clientId || ''}
                onChange={(e) => {
                  const id = e.target.value
                  const selected = clients.find(c => c._id === id)
                  const clientName = selected
                    ? (selected.company ? `${selected.company} — ${selected.name}` : selected.name)
                    : ''
                  setForm(prev => ({ ...prev, clientId: id, clientName }))
                }}
              >
                <option value="">Select client...</option>
                {clients.map(c => (
                  <option key={c._id} value={c._id}>
                    {c.company ? `${c.company} — ${c.name}` : c.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Type</Form.Label>
              <Form.Select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                required
              >
                <option value="Fixed">Fixed</option>
                <option value="Task-Based">Task-Based</option>
                <option value="Freelance">Freelance</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Amount</Form.Label>
              <Form.Control
                type="number"
                placeholder="Enter amount"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: parseFloat(e.target.value) })}
                required
                min="0"
                step="0.01"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Frequency</Form.Label>
              <Form.Select
                value={form.frequency}
                onChange={(e) => setForm({ ...form, frequency: e.target.value })}
                required
              >
                <option value="One-time">One-time</option>
                <option value="Weekly">Weekly</option>
                <option value="Monthly">Monthly</option>
                <option value="Yearly">Yearly</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Enter description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  )
}





// 'use client'
// import { useState, useEffect } from 'react'
// import { Modal, Button, Form, Badge } from 'react-bootstrap'

// export default function IncomePage() {
//   const [incomeSources, setIncomeSources] = useState([])
//   const [clients, setClients] = useState([])
//   const [showModal, setShowModal] = useState(false)
//   const [currentSource, setCurrentSource] = useState(null)
//   const [filter, setFilter] = useState('all')
//   const [form, setForm] = useState({
//     name: '',
//     type: 'Fixed',
//     amount: '',
//     frequency: 'Monthly',
//     description: '',
//     clientId: '',
//     clientName: ''
//   })

//   useEffect(() => {
//     fetchIncomeSources()
//     fetchClients()
//   }, [])

//   const handleSubmit = async (e) => {
//     e.preventDefault()
//     try {
//       // ensure clientName is present if a clientId is selected
//       if (form.clientId && !form.clientName) {
//         const sel = clients.find(c => c._id === form.clientId)
//         if (sel) form.clientName = sel.company ? `${sel.company} — ${sel.name}` : sel.name
//       }

//       // ensure amount is numeric
//       if (form.amount && typeof form.amount === 'string') {
//         form.amount = parseFloat(form.amount) || 0
//       }

//       const url = currentSource ? `/api/income/${currentSource._id}` : '/api/income'
//       const method = currentSource ? 'PUT' : 'POST'

//       await fetch(url, {
//         method,
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(form)
//       })

//       setShowModal(false)
//       setCurrentSource(null)
//       setForm({
//         name: '',
//         type: 'Fixed',
//         amount: '',
//         frequency: 'Monthly',
//         description: '',
//         clientId: '',
//         clientName: ''
//       })
//       fetchIncomeSources()
//     } catch (error) {
//       console.error('Error saving income source:', error)
//     }
//   }

//   const handleEdit = (source) => {
//     setCurrentSource(source)
//     setForm({
//       name: source.name,
//       type: source.type,
//       amount: source.amount,
//       frequency: source.frequency,
//       description: source.description || '',
//       clientId: source.clientId || '',
//       clientName: source.clientName || ''
//     })
//     setShowModal(true)
//   }

//   const handleDelete = async (id) => {
//     if (!confirm('Are you sure you want to delete this income source?')) return
    
//     try {
//       await fetch(`/api/income/${id}`, { method: 'DELETE' })
//       fetchIncomeSources()
//     } catch (error) {
//       console.error('Error deleting income source:', error)
//     }
//   }

//   const filteredSources = filter === 'all' 
//     ? incomeSources 
//     : incomeSources.filter(source => source.type === filter)

//   const totalIncome = filteredSources.reduce((sum, source) => sum + source.amount, 0)

//   return (
//     <div className="container-fluid py-4">
//       {/* Header Section */}
//       <div className="d-flex justify-content-between align-items-center mb-4">
//         <div>
//           <h3 className="fw-bold mb-0">Income Sources</h3>
//           <p className="text-muted">Manage your income streams and track earnings</p>
//         </div>
//         <button
//           className="btn btn-primary"
//           onClick={() => {
//             setCurrentSource(null)
//             setForm({
//               name: '',
//               type: 'Fixed',
//               amount: '',
//               frequency: 'Monthly',
//               description: '',
//               clientId: '',
//               clientName: ''
//             })
//             setShowModal(true)
//           }}
//         >
//           ➕ Add Income Source
//         </button>
//       </div>

//       {/* Summary Cards */}
//       <div className="row mb-4">
//         <div className="col-md-4">
//           <div className="card bg-primary text-white">
//             <div className="card-body">
//               <h6 className="mb-2">Total Monthly Income</h6>
//               <h3 className="mb-0">${totalIncome.toLocaleString()}</h3>
//             </div>
//           </div>
//         </div>
//         <div className="col-md-4">
//           <div className="card bg-success text-white">
//             <div className="card-body">
//               <h6 className="mb-2">Active Sources</h6>
//               <h3 className="mb-0">{incomeSources.length}</h3>
//             </div>
//           </div>
//         </div>
//         <div className="col-md-4">
//           <div className="card bg-info text-white">
//             <div className="card-body">
//               <h6 className="mb-2">Average per Source</h6>
//               <h3 className="mb-0">
//                 ${incomeSources.length 
//                   ? Math.round(totalIncome / incomeSources.length).toLocaleString() 
//                   : 0}
//               </h3>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Filter Controls */}
//       <div className="card shadow-sm mb-4">
//         <div className="card-body">
//           <div className="btn-group">
//             <button
//               className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
//               onClick={() => setFilter('all')}
//             >
//               All
//             </button>
//             <button
//               className={`btn ${filter === 'Fixed' ? 'btn-primary' : 'btn-outline-primary'}`}
//               onClick={() => setFilter('Fixed')}
//             >
//               Fixed
//             </button>
//             <button
//               className={`btn ${filter === 'Task-Based' ? 'btn-primary' : 'btn-outline-primary'}`}
//               onClick={() => setFilter('Task-Based')}
//             >
//               Task-Based
//             </button>
//             <button
//               className={`btn ${filter === 'Freelance' ? 'btn-primary' : 'btn-outline-primary'}`}
//               onClick={() => setFilter('Freelance')}
//             >
//               Freelance
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Income Sources Table */}
//       <div className="card shadow-sm">
//         <div className="card-body p-0">
//           <div className="table-responsive">
//             <table className="table table-hover align-middle mb-0">
//               <thead className="table-light">
//                 <tr>
//                   <th>Name</th>
//                   <th>Client</th>
//                   <th>Type</th>
//                   <th>Amount</th>
//                   <th>Frequency</th>
//                   <th>Status</th>
//                   <th>Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {filteredSources.map(source => (
//                   <tr key={source._id}>
//                     <td>{source.name}</td>
//                     <td>{source.clientName || (source.clientId ? 'Client' : '—')}</td>
//                     <td>
//                       <Badge bg={
//                         source.type === 'Fixed' ? 'primary' :
//                         source.type === 'Task-Based' ? 'success' : 'info'
//                       }>
//                         {source.type}
//                       </Badge>
//                     </td>
//                     <td>${source.amount.toLocaleString()}</td>
//                     <td>{source.frequency}</td>
//                     <td>
//                       <Badge bg={source.isActive ? 'success' : 'secondary'}>
//                         {source.isActive ? 'Active' : 'Inactive'}
//                       </Badge>
//                     </td>
//                     <td>
//                       <Button
//                         variant="outline-primary"
//                         size="sm"
//                         className="me-2"
//                         onClick={() => handleEdit(source)}
//                       >
//                         Edit
//                       </Button>
//                       <Button
//                         variant="outline-danger"
//                         size="sm"
//                         onClick={() => handleDelete(source._id)}
//                       >
//                         Delete
//                       </Button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       </div>

//       {/* Add/Edit Modal */}
//       <Modal show={showModal} onHide={() => setShowModal(false)}>
//         <Modal.Header closeButton>
//           <Modal.Title>{currentSource ? 'Edit' : 'Add'} Income Source</Modal.Title>
//         </Modal.Header>
//         <Form onSubmit={handleSubmit}>
//           <Modal.Body>
//             <Form.Group className="mb-3">
//               <Form.Label>Name</Form.Label>
//               <Form.Control
//                 type="text"
//                 placeholder="Enter source name"
//                 value={form.name}
//                 onChange={(e) => setForm({ ...form, name: e.target.value })}
//                 required
//               />
//             </Form.Group>

//             <Form.Group className="mb-3">
//               <Form.Label>Client</Form.Label>
//               <Form.Select
//                 required
//                 value={form.clientId || ''}
//                 onChange={(e) => {
//                   const id = e.target.value
//                   const selected = clients.find(c => c._id === id)
//                   const clientName = selected ? (selected.company ? `${selected.company} — ${selected.name}` : selected.name) : ''
//                   setForm(prev => ({ ...prev, clientId: id, clientName }))
//                 }}
//               >
//                 <option value="">Select client...</option>
//                 {clients.map(c => (
//                   <option key={c._id} value={c._id}>{c.company ? `${c.company} — ${c.name}` : c.name}</option>
//                 ))}
//               </Form.Select>
//             </Form.Group>

//             <Form.Group className="mb-3">
//               <Form.Label>Type</Form.Label>
//               <Form.Select
//                 value={form.type}
//                 onChange={(e) => setForm({ ...form, type: e.target.value })}
//                 required
//               >
//                 <option value="Fixed">Fixed</option>
//                 <option value="Task-Based">Task-Based</option>
//                 <option value="Freelance">Freelance</option>
//               </Form.Select>
//             </Form.Group>

//             <Form.Group className="mb-3">
//               <Form.Label>Amount</Form.Label>
//               <Form.Control
//                 type="number"
//                 placeholder="Enter amount"
//                 value={form.amount}
//                 onChange={(e) => setForm({ ...form, amount: parseFloat(e.target.value) })}
//                 required
//                 min="0"
//                 step="0.01"
//               />
//             </Form.Group>

//             <Form.Group className="mb-3">
//               <Form.Label>Frequency</Form.Label>
//               <Form.Select
//                 value={form.frequency}
//                 onChange={(e) => setForm({ ...form, frequency: e.target.value })}
//                 required
//               >
//                 <option value="One-time">One-time</option>
//                 <option value="Weekly">Weekly</option>
//                 <option value="Monthly">Monthly</option>
//                 <option value="Yearly">Yearly</option>
//               </Form.Select>
//             </Form.Group>

//             <Form.Group className="mb-3">
//               <Form.Label>Description</Form.Label>
//               <Form.Control
//                 as="textarea"
//                 rows={3}
//                 placeholder="Enter description"
//                 value={form.description}
//                 onChange={(e) => setForm({ ...form, description: e.target.value })}
//               />
//             </Form.Group>
//           </Modal.Body>
//           <Modal.Footer>
//             <Button variant="secondary" onClick={() => setShowModal(false)}>
//               Cancel
//             </Button>
//             <Button variant="primary" type="submit">
//               Save
//             </Button>
//           </Modal.Footer>
//         </Form>
//       </Modal>
//     </div>
//   )
// }