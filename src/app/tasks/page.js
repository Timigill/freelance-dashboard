'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Modal, Button, Form, Badge } from 'react-bootstrap'

function TasksPageContent() {
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

  const params = useSearchParams()

  // ✅ Auto open modal if ?openModal=true
  useEffect(() => {
    if (params.get('openModal') === 'true') {
      resetForm()
      setShowModal(true)
    }
  }, [params])

  // ✅ Fetch data on mount & when filters change
  useEffect(() => {
    fetchTasks()
    fetchIncomeSources()
  }, [filters])

  const fetchTasks = async () => {
    try {
      let url = '/api/tasks'
      const queryParams = []

      if (filters.status !== 'all') queryParams.push(`status=${filters.status}`)
      if (filters.paymentStatus !== 'all') queryParams.push(`paymentStatus=${filters.paymentStatus}`)
      if (filters.sourceId !== 'all') queryParams.push(`sourceId=${filters.sourceId}`)

      if (queryParams.length > 0) url += '?' + queryParams.join('&')

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

  const resetForm = () => {
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
      dueDate: task.dueDate?.split('T')[0] || '',
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'warning'
      case 'In Progress': return 'info'
      case 'Completed': return 'success'
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

  const totalAmount = tasks.reduce((sum, t) => sum + (t.amount || 0), 0)
  const pendingAmount = tasks
    .filter(t => t.paymentStatus === 'Unpaid')
    .reduce((sum, t) => sum + (t.amount || 0), 0)

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-nowrap">
        <div>
          <h3 className="fw-bold mb-0 fs-5 fs-md-4">Task Management</h3>
          <p className="text-muted fs-6 mb-0">Track and manage your tasks and payments</p>
        </div>

        <button
          className="btn btn-primary mt-2 mt-md-0"
          onClick={() => { resetForm(); setShowModal(true) }}
          style={{ whiteSpace: 'nowrap', fontSize: '0.9rem', padding: '6px 14px' }}
        >
          Add Task
        </button>
      </div>

      {/* Summary Cards */}
      <div className="row mb-4 g-3">
        <div className="col-6 col-md-3">
          <div className="card bg-primary text-white text-center h-100">
            <div className="card-body">
              <h6>Total Tasks Value</h6>
              <h3>${totalAmount.toLocaleString()}</h3>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card bg-warning text-white text-center h-100">
            <div className="card-body">
              <h6>Pending Payments</h6>
              <h3>${pendingAmount.toLocaleString()}</h3>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card bg-success text-white text-center h-100">
            <div className="card-body">
              <h6>Active Tasks</h6>
              <h3>{tasks.filter(t => t.status !== 'Completed').length}</h3>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card bg-info text-white text-center h-100">
            <div className="card-body">
              <h6>Completed Tasks</h6>
              <h3>{tasks.filter(t => t.status === 'Completed').length}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Tasks Table */}
      <div className="card shadow-sm">
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
              {tasks.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-4 text-muted">
                    No tasks found
                  </td>
                </tr>
              ) : (
                tasks.map(task => (
                  <tr key={task._id || task.name}>
                    <td>
                      <div className="fw-semibold">{task.name}</div>
                      <small className="text-muted">{task.description}</small>
                    </td>
                    <td>{task.sourceId?.name || '-'}</td>
                    <td>${(task.amount || 0).toLocaleString()}</td>
                    <td>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '-'}</td>
                    <td><Badge bg={getPriorityColor(task.priority)}>{task.priority}</Badge></td>
                    <td><Badge bg={getStatusColor(task.status)}>{task.status}</Badge></td>
                    <td>
                      <Badge bg={task.paymentStatus === 'Paid' ? 'success' : 'warning'}>
                        {task.paymentStatus}
                      </Badge>
                    </td>
                    <td>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="me-2"
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
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
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
                    min="0"
                    placeholder="Enter amount"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: parseFloat(e.target.value) || 0 })}
                    required
                  />
                </Form.Group>
              </div>
            </div>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </Form.Group>

            <div className="row">
              <div className="col-md-4">
                <Form.Group className="mb-3">
                  <Form.Label>Income Source</Form.Label>
                  <Form.Select
                    value={form.sourceId}
                    onChange={(e) => setForm({ ...form, sourceId: e.target.value })}
                    required
                  >
                    <option value="">Select Source</option>
                    {incomeSources.map(src => (
                      <option key={src._id} value={src._id}>{src.name}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </div>

              <div className="col-md-4">
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

              <div className="col-md-4">
                <Form.Group className="mb-3">
                  <Form.Label>Priority</Form.Label>
                  <Form.Select
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value })}
                  >
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                  </Form.Select>
                </Form.Group>
              </div>
            </div>

            <div className="row">
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                  >
                    <option>Pending</option>
                    <option>In Progress</option>
                    <option>Completed</option>
                  </Form.Select>
                </Form.Group>
              </div>

              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Payment Status</Form.Label>
                  <Form.Select
                    value={form.paymentStatus}
                    onChange={(e) => setForm({ ...form, paymentStatus: e.target.value })}
                  >
                    <option>Unpaid</option>
                    <option>Paid</option>
                  </Form.Select>
                </Form.Group>
              </div>
            </div>
          </Modal.Body>

          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Save</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  )
}

export default function TasksPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TasksPageContent />
    </Suspense>
  )
}