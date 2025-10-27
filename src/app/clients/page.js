'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link';

export default function ClientsPage() {
  const [clients, setClients] = useState([]);
const [form, setForm] = useState({
  name: "",
  email: "",
  company: "",
  phone: "",
  category: "",
  deadline: "",
  notes: "",
});

  const [shouldCloseModal, setShouldCloseModal] = useState(false);
  const [sortOrder, setSortOrder] = useState("newest");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [deadlineFilter, setDeadlineFilter] = useState("All");

  // 🔹 Validation
  const isValid = Object.values(form).every((f) => f.trim() !== "");

  // 🔹 Fetch Clients
  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const res = await fetch("/api/clients");
      const data = await res.json();
      setClients(data);
    } catch (err) {
      console.error("Error fetching clients:", err);
    }
  };

  // 🔹 Handle Form Input
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 🔹 Submit New Client
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid) return alert("Please fill all fields.");

    try {
      await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setForm({ name: "", email: "", company: "", phone: "", notes: "" });
      fetchClients();
      setShouldCloseModal(true);
    } catch (err) {
      console.error("Error adding client:", err);
    }
  };

  // 🔹 Auto-close Modal After Save
  useEffect(() => {
    if (shouldCloseModal) {
      const btn = document.getElementById("closeModalBtn");
      if (btn) btn.click();
      setShouldCloseModal(false);
    }
  }, [shouldCloseModal]);

  // 🔹 Unique Companies for Filters
  const getUniqueCompanies = () => {
    return [...new Set(clients.map((c) => c.company?.trim()).filter(Boolean))];
  };

  // 🔹 FILTER + SORT Logic
  const filteredAndSortedClients = clients
    .filter((c) => {
      // Category Filter
      if (categoryFilter !== "All" && c.category !== categoryFilter)
        return false;

      // Deadline Filter
      if (deadlineFilter !== "All" && c.deadline) {
        const today = new Date();
        const deadlineDate = new Date(c.deadline);
        if (deadlineFilter === "Upcoming" && deadlineDate < today) return false;
        if (deadlineFilter === "Expired" && deadlineDate >= today) return false;
      }

      return true;
    })
    .sort((a, b) => {
      if (sortOrder === "newest") {
        return new Date(b.createdAt) - new Date(a.createdAt);
      } else {
        return new Date(a.createdAt) - new Date(b.createdAt);
      }
    });

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
 <div className="row row-cols-2 row-cols-lg-5 g-3">

  <Link href="/clients/all" className="col text-decoration-none">
    <div className="card bg-primary text-white shadow-sm" style={{ cursor: "pointer" }}>
      <div className="card-body">
        <h6 className="mb-1">Total Clients</h6>
        <h3 className="fw-bold">{clients.length}</h3>
      </div>
    </div>
  </Link>

  <Link href="/clients/active" className="col text-decoration-none">
    <div className="card bg-info text-white shadow-sm" style={{ cursor: "pointer" }}>
      <div className="card-body">
        <h6 className="mb-1">Active Clients</h6>
        <h4 className="fw-bold">
          {clients.filter((c) => c.status === "active").length}
        </h4>
      </div>
    </div>
  </Link>

  <Link href="/clients/new" className="col text-decoration-none">
    <div className="card bg-warning text-dark shadow-sm" style={{ cursor: "pointer" }}>
      <div className="card-body">
        <h6 className="mb-1">New Clients</h6>
        <h4 className="fw-bold">
          {
            clients.filter((c) => {
              const date = new Date(c.createdAt);
              const now = new Date();
              return (
                date.getMonth() === now.getMonth() &&
                date.getFullYear() === now.getFullYear()
              );
            }).length
          }
        </h4>
      </div>
    </div>
  </Link>

  <Link href="/clients/inactive" className="col text-decoration-none">
    <div className="card bg-danger text-white shadow-sm" style={{ cursor: "pointer" }}>
      <div className="card-body">
        <h6 className="mb-1">Inactive Clients</h6>
        <h4 className="fw-bold">
          {clients.filter((c) => c.status === "inactive").length}
        </h4>
      </div>
    </div>
  </Link>

  <Link href="/clients/closed" className="col text-decoration-none">
    <div className="card bg-secondary text-white shadow-sm" style={{ cursor: "pointer" }}>
      <div className="card-body">
        <h6 className="mb-1">Closed Clients</h6>
        <h4 className="fw-bold">
          {clients.filter((c) => c.status === "closed").length}
        </h4>
      </div>
    </div>
  </Link>

</div>



      <div className="card shadow-sm">
        <div className="card-header fw-semibold d-flex justify-content-between align-items-center">
          <span>Client List</span>
        </div>

        {/* 🔽 Filter Controls */}
        <div className="card-body d-flex  mb-3 gap-2">
          <div className="d-flex flex-wrap justify-content-between  gap-2">
            {/* Sort by Newest/Oldest */}
            <select
              className="form-select form-select-sm"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>

            {/* Filter by Category */}
            <select
              className="form-select form-select-sm"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="All">All Categories</option>
              <option value="Freelance">Freelance</option>
              <option value="Fixed">Fixed</option>
              <option value="Salary-Based">Salary-Based</option>
              <option value="Contract">Contract</option>
            </select>

            {/* Filter by Deadline */}
            <select
              className="form-select form-select-sm"
              value={deadlineFilter}
              onChange={(e) => setDeadlineFilter(e.target.value)}
            >
              <option value="All">All Deadlines</option>
              <option value="Upcoming">Upcoming</option>
              <option value="Expired">Expired</option>
            </select>
          </div>
        </div>

        {/* 📋 Client Table */}
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table align-middle mb-0 table-striped table-bordered">
              <thead className="table-light">
                <tr>
                  <th>Name</th>
                  <th>Email / Address</th>
                  <th>Company</th>
                  <th>Phone</th>
                  <th>Category</th>
                  <th>Deadline</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedClients.length > 0 ? (
                  filteredAndSortedClients.map((client) => (
                    <tr key={client._id}>
                      <td>{client.name}</td>
                      <td>{client.email}</td>
                      <td>
                        <span className="badge bg-info text-dark">
                          {client.company || '—'}
                        </span>
                      </td>
                      <td>{client.phone || '—'}</td>
                      <td>
                        <span className="badge bg-secondary">
                          {client.category || 'Uncategorized'}
                        </span>
                      </td>
                      <td>
                        {client.deadline ? (
                          <span
                            className={`badge ${new Date(client.deadline) < new Date()
                              ? 'bg-danger'
                              : 'bg-success'
                              }`}
                          >
                            {new Date(client.deadline).toLocaleDateString()}
                          </span>
                        ) : (
                          <span className="text-muted">—</span>
                        )}
                      </td>
                      <td>
                        <small className="text-muted">
                          {new Date(client.createdAt).toLocaleDateString()}
                        </small>
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



      {/* Modal */}
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
                Add New Client
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
                  {/* Basic Fields */}
                  {["name", "email", "company", "phone"].map((field, i) => (
                    <div className="col-md-6 mb-3" key={i}>
                      <label className="form-label text-capitalize">
                        {field}
                      </label>
                      <input
                        type={field === "email" ? "email" : "text"}
                        name={field}
                        value={form[field]}
                        onChange={handleChange}
                        className="form-control"
                        placeholder={`Enter ${field}`}
                        required
                      />
                    </div>
                  ))}

                  {/* Category Dropdown */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Category</label>
                    <select
                      name="category"
                      value={form.category || ""}
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

                  {/* Deadline Picker */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Deadline</label>
                    <input
                      type="date"
                      name="deadline"
                      value={form.deadline || ""}
                      onChange={handleChange}
                      className="form-control"
                    />
                  </div>

                  {/* Notes */}
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

              {/* Footer */}
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
