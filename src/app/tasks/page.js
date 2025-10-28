'use client'
import { useState, useEffect } from 'react'
import { Modal, Button, Form, Badge } from 'react-bootstrap'

export default function TasksPage() {
  const [tasks, setTasks] = useState([])
  const [incomeSources, setIncomeSources] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [currentTask, setCurrentTask] = useState(null)
  const [filters, setFilters] = useState({
    status: 'all',
    paymentStatus: 'all',
    sourceId: 'all'
  })
  const [form, setForm] = useState({
    name: '',
    description: '',
    amount: '',
    sourceId: '',
    dueDate: '',
    status: 'Pending',
    paymentStatus: 'Unpaid',
    priority: 'Medium'
  })

  useEffect(() => {
    fetchTasks()
    fetchIncomeSources()
  }, [])

  const fetchTasks = async () => {
    try {
      let url = '/api/tasks'
      const queryParams = []

      if (filters.status !== 'all') queryParams.push(`status=${filters.status}`)
      if (filters.paymentStatus !== 'all') queryParams.push(`paymentStatus=${filters.paymentStatus}`)
      if (filters.sourceId !== 'all') queryParams.push(`sourceId=${filters.sourceId}`)

      if (queryParams.length > 0) {
        url += '?' + queryParams.join('&')
      }

      const res = await fetch(url)
      const data = await res.json()
      setTasks(data)
    } catch (error) {
      console.error('Error fetching tasks:', error)
    }
  }

  const fetchIncomeSources = async () => {
    try {
      const res = await fetch('/api/income')
      const data = await res.json()
      setIncomeSources(data)
    } catch (error) {
      console.error('Error fetching income sources:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const url = currentTask ? `/api/tasks/${currentTask._id}` : '/api/tasks'
      const method = currentTask ? 'PUT' : 'POST'

      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })

      setShowModal(false)
      setCurrentTask(null)
      setForm({
        name: '',
        description: '',
        amount: '',
        sourceId: '',
        dueDate: '',
        status: 'Pending',
        paymentStatus: 'Unpaid',
        priority: 'Medium'
      })
      fetchTasks()
    } catch (error) {
      console.error('Error saving task:', error)
    }
  }

  const handleEdit = (task) => {
    setCurrentTask(task)
    setForm({
      name: task.name,
      description: task.description || '',
      amount: task.amount,
      sourceId: task.sourceId?._id || '',
      dueDate: task.dueDate.split('T')[0],
      status: task.status,
      paymentStatus: task.paymentStatus,
      priority: task.priority
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this task?')) return

    try {
      await fetch(`/api/tasks/${id}`, { method: 'DELETE' })
      fetchTasks()
    } catch (error) {
      console.error('Error deleting task:', error)
    }
  }

  const handleStatusChange = async (task, newStatus) => {
    try {
      await fetch(`/api/tasks/${task._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...task, status: newStatus })
      })
      fetchTasks()
    } catch (error) {
      console.error('Error updating task status:', error)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'warning'
      case 'In Progress': return 'info'
      case 'Completed': return 'success'
      case 'Paid': return 'primary'
      default: return 'secondary'
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'danger'
      case 'Medium': return 'warning'
      case 'Low': return 'info'
      default: return 'secondary'
    }
  }

  const totalAmount = tasks.reduce((sum, task) => sum + task.amount, 0)  
  const pendingAmount = tasks
    .filter(task => task.paymentStatus === 'Unpaid')
    .reduce((sum, task) => sum + task.amount, 0)

  return (
    <div className="container-fluid py-4">
      {/* Header Section */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="mb-0 d-flex flex-column align-start justify-content-center">
          <h3 className="fw-bold mb-0">Task Management</h3>
          <p className="text-muted">Track and manage your tasks  and payments</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => {
            setCurrentTask(null)
            setForm({
              name: '',
              description: '',
              amount: '',
              sourceId: '',
              dueDate: '',
              status: 'Pending',
              paymentStatus: 'Unpaid',
              priority: 'Medium'
            })
            setShowModal(true)
          }}
        >
          Add New 
        </button>
      </div>

      {/* Summary Cards */}
    <div className="row mb-4 g-3">
  <div className="col-6 col-md-3">
    <div className="card bg-primary text-white h-100 text-center">
      <div className="card-body d-flex flex-column justify-content-center">
        <h6 className="mb-2">Total Tasks Value</h6>
        <h3 className="mb-0">${totalAmount.toLocaleString()}</h3>
      </div>
    </div>
  </div>

  <div className="col-6 col-md-3">
    <div className="card bg-warning text-white h-100 text-center">
      <div className="card-body d-flex flex-column justify-content-center">
        <h6 className="mb-2">Pending Payments</h6>
        <h3 className="mb-0">${pendingAmount.toLocaleString()}</h3>
      </div>
    </div>
  </div>

  <div className="col-6 col-md-3">
    <div className="card bg-success text-white h-100 text-center">
      <div className="card-body d-flex flex-column justify-content-center">
        <h6 className="mb-2">Active Tasks</h6>
        <h3 className="mb-0">{tasks.filter(t => t.status !== 'Completed').length}</h3>
      </div>
    </div>
  </div>

  <div className="col-6 col-md-3">
    <div className="card bg-info text-white h-100 text-center">
      <div className="card-body d-flex flex-column justify-content-center">
        <h6 className="mb-2">Completed Tasks</h6>
        <h3 className="mb-0">{tasks.filter(t => t.status === 'Completed').length}</h3>
      </div>
    </div>
  </div>
</div>

      {/* Filters */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label">Status</label>
              <select
                className="form-select"
                value={filters.status}
                onChange={(e) => {
                  setFilters({ ...filters, status: e.target.value })
                  fetchTasks()
                }}
              >
                <option value="all">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">Payment Status</label>
              <select
                className="form-select"
                value={filters.paymentStatus}
                onChange={(e) => {
                  setFilters({ ...filters, paymentStatus: e.target.value })
                  fetchTasks()
                }}
              >
                <option value="all">All Payment Statuses</option>
                <option value="Unpaid">Unpaid</option>
                <option value="Partially Paid">Partially Paid</option>
                <option value="Paid">Paid</option>
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">Income Source</label>
              <select
                className="form-select"
                value={filters.sourceId}
                onChange={(e) => {
                  setFilters({ ...filters, sourceId: e.target.value })
                  fetchTasks()
                }}
              >
                <option value="all">All Sources</option>
                {incomeSources.map(source => (
                  <option key={source._id} value={source._id}>
                    {source.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Tasks Table */}
      <div className="card shadow-sm">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Task</th>
                  <th>Source</th>
                  <th>Amount</th>
                  <th>Due Date</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Payment</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map(task => (
                  <tr key={task._id}>
                    <td>
                      <div className="fw-semibold">{task.name}</div>
                      <small className="text-muted">{task.description}</small>
                    </td>
                    <td>
                      {tasks && tasks.map(task => (
                        task ? <div key={task._id}>{task.name}</div> : null
                      ))}

                    </td>
                    <td>${task.amount.toLocaleString()}</td>
                    <td>{new Date(task.dueDate).toLocaleDateString()}</td>
                    <td>
                      <Badge bg={getPriorityColor(task.priority)}>
                        {task.priority}
                      </Badge>
                    </td>
                    <td>
                      <Badge bg={getStatusColor(task.status)}>
                        {task.status}
                      </Badge>
                    </td>
                    <td>
                      <Badge bg={task.paymentStatus === 'Paid' ? 'success' : 'warning'}>
                        {task.paymentStatus}
                      </Badge>
                    </td>
                    <td>
                      <div className="btn-group">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => handleEdit(task)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDelete(task._id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{currentTask ? 'Edit' : 'Add'} Task</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <div className="row">
              <div className="col-md-8">
                <Form.Group className="mb-3">
                  <Form.Label>Task Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter task name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </Form.Group>
              </div>
              <div className="col-md-4">
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
              </div>
            </div>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Enter task description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </Form.Group>

            <div className="row">
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Income Source</Form.Label>
                  <Form.Select
                    value={form.sourceId}
                    onChange={(e) => setForm({ ...form, sourceId: e.target.value })}
                    required
                  >
                    <option value="">Select Source</option>
                    {incomeSources.map(source => (
                      <option key={source._id} value={source._id}>
                        {source.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Due Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={form.dueDate}
                    onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                    required
                  />
                </Form.Group>
              </div>
            </div>

            <div className="row">
              <div className="col-md-4">
                <Form.Group className="mb-3">
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    required
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </Form.Select>
                </Form.Group>
              </div>
              <div className="col-md-4">
                <Form.Group className="mb-3">
                  <Form.Label>Payment Status</Form.Label>
                  <Form.Select
                    value={form.paymentStatus}
                    onChange={(e) => setForm({ ...form, paymentStatus: e.target.value })}
                    required
                  >
                    <option value="Unpaid">Unpaid</option>
                    <option value="Partially Paid">Partially Paid</option>
                    <option value="Paid">Paid</option>
                  </Form.Select>
                </Form.Group>
              </div>
              <div className="col-md-4">
                <Form.Group className="mb-3">
                  <Form.Label>Priority</Form.Label>
                  <Form.Select
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value })}
                    required
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </Form.Select>
                </Form.Group>
              </div>
            </div>
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