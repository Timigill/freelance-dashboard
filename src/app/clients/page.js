"use client";
import { useState, useEffect, Suspense } from "react";
import toast from "react-hot-toast";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { showToast } from "../../utils/toastHelper";

function ClientsPageContent() {
  const [clients, setClients] = useState([]);
  const [form, setForm] = useState({
    name: "",
    address: "",
    company: "",
    phone: "",
    category: "",
    status: "active",
  });
  const [editingClientId, setEditingClientId] = useState(null);
  const [shouldCloseModal, setShouldCloseModal] = useState(false);
  const [sortOrder, setSortOrder] = useState("newest");
  const [categoryFilter, setCategoryFilter] = useState("All");

  const isValid = Object.values(form).every((f) => f.trim() !== "");
  const searchParams = useSearchParams();

  useEffect(() => {
    const modalElement = document.getElementById("clientModal");
    if (!modalElement) return;

    let modalInstance = null;

    const initModal = async () => {
      try {
        const bootstrap = await import(
          "bootstrap/dist/js/bootstrap.bundle.min.js"
        );
        const Modal = bootstrap.Modal || window.bootstrap?.Modal;
        if (!Modal) {
          console.warn("Bootstrap Modal not available yet.");
          return;
        }

        modalInstance = new Modal(modalElement);

        const open = searchParams.get("openModal") === "true";
        if (open) modalInstance.show();

        const handleHidden = () => {
          document.body.classList.remove("modal-open");
          document.body.style.removeProperty("padding-right");
          document
            .querySelectorAll(".modal-backdrop")
            .forEach((el) => el.remove());
        };

        modalElement.addEventListener("hidden.bs.modal", handleHidden);
      } catch (err) {
        console.error("Error initializing modal:", err);
      }
    };

    initModal();

    return () => {
      if (modalElement && modalInstance) {
        modalElement.removeEventListener("hidden.bs.modal", () => {});
        modalInstance.dispose?.();
      }
    };
  }, [searchParams]);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const res = await fetch("/api/clients");
      const data = await res.json();
      console.log("Clients API returned:", data); // debug log
      setClients(Array.isArray(data) ? data : []); // safe assignment
    } catch (err) {
      console.error("Error fetching clients:", err);
      setClients([]); // ensure it's always an array
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid) {
      showToast("Please fill all fields.", "error");
      // return;
    }

    try {
      const method = editingClientId ? "PUT" : "POST";
      const url = editingClientId
        ? `/api/clients/${editingClientId}`
        : "/api/clients";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to save client");

      showToast(
        editingClientId ? "Client updated!" : "Client added!",
        "success"
      );

      setForm({
        name: "",
        address: "",
        company: "",
        phone: "",
        category: "",
        status: "active",
      });
      setEditingClientId(null);
      fetchClients();
      setShouldCloseModal(true);
    } catch (err) {
      console.error("Error saving client:", err);
      showToast(err.message, "error");
    }
  };

  const handleDelete = async (clientId) => {
    if (!clientId) return toast.error("Invalid client ID");

    let confirmed = false;
    await new Promise((resolve) => {
      let dismissed = false;

      const ConfirmToast = ({ id }) => {
        useEffect(() => {
          const timer = setTimeout(() => {
            if (!dismissed) {
              dismissed = true;
              toast.dismiss(id); // dismiss the ConfirmToast
              resolve(false); // auto cancel after 4s
            }
          }, 4000);

          return () => clearTimeout(timer);
        }, [id]);

        return (
          <div
            style={{
              position: "fixed",
              width: "100vw",
              height: "100vh",
              zIndex: 9999,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <div
              style={{
                backgroundColor: "#fff",
                color: "#352359",
                padding: "20px 30px",
                borderRadius: "10px",
                boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
                maxWidth: "340px",
                textAlign: "center",
              }}
            >
              <h5 className="mb-3">Confirm Delete</h5>
              <p style={{ fontSize: "0.9rem" }}>
                Are you sure you want to delete this client?
              </p>
              <div className="d-flex justify-content-center gap-3 mt-3">
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    if (!dismissed) {
                      dismissed = true;
                      toast.dismiss(id);
                      resolve(false);
                    }
                  }}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => {
                    if (!dismissed) {
                      dismissed = true;
                      toast.dismiss(id);
                      resolve(true);
                    }
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        );
      };

      toast.custom((t) => <ConfirmToast id={t.id} />, {
        duration: 4000,
        position: "top-center",
      });
    }).then((res) => (confirmed = res));

    if (!confirmed) return;

    try {
      const res = await fetch(`/api/clients/${clientId}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data?.message || "Failed to delete client");

      // Success toast will auto-dismiss after 4s
      showToast("Client deleted successfully!", "success");
      fetchClients();
    } catch (err) {
      showToast(`Error deleting client: ${err.message}`, "error");
    }
  };

  const handleEdit = async (client) => {
    setEditingClientId(client._id);
    setForm({
      name: client.name || "",
      address: client.address || "",
      company: client.company || "",
      phone: client.phone || "",
      category: client.category || "",
      status: client.status || "active",
    });

    const modalElement = document.getElementById("clientModal");
    if (!modalElement) return;

    try {
      const bootstrap = await import(
        "bootstrap/dist/js/bootstrap.bundle.min.js"
      );
      const Modal = bootstrap.Modal || window.bootstrap?.Modal;
      if (!Modal) {
        console.warn("Bootstrap Modal not available yet.");
        return;
      }

      const modal = new Modal(modalElement);
      modal.show();
    } catch (err) {
      console.error("Error opening modal for edit:", err);
    }
  };

  useEffect(() => {
    if (shouldCloseModal) {
      const btn = document.getElementById("closeModalBtn");
      if (btn) btn.click();
      setShouldCloseModal(false);
    }
  }, [shouldCloseModal]);

  const filteredAndSortedClients = clients
    .filter((c) => categoryFilter === "All" || c.category === categoryFilter)
    .sort((a, b) =>
      sortOrder === "newest"
        ? new Date(b.createdAt) - new Date(a.createdAt)
        : new Date(a.createdAt) - new Date(b.createdAt)
    );

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
          style={{
            whiteSpace: "nowrap",
            fontSize: "0.9rem",
            padding: "6px 14px",
          }}
        >
          Add Client
        </button>
      </div>

      <div className="container px-3 px-md-4" style={{ maxWidth: "1100px" }}>
        <div className="row row-cols-2 row-cols-lg-5 g-3 justify-content-center">
          <Link href="/clients/all" className="col text-decoration-none">
            <div
              className="card bg-primary text-white shadow-sm h-100 text-center"
              style={{ cursor: "pointer", minHeight: "120px" }}
            >
              <div className="card-body d-flex flex-column justify-content-center align-items-center py-2">
                <h6 className="mb-1">Total Clients</h6>
                <h3 className="fw-bold mb-0">{clients.length}</h3>
              </div>
            </div>
          </Link>

          <Link href="/clients/active" className="col text-decoration-none">
            <div
              className="card bg-info text-white shadow-sm h-100 text-center"
              style={{ cursor: "pointer", minHeight: "120px" }}
            >
              <div className="card-body d-flex flex-column justify-content-center align-items-center py-2">
                <h6 className="mb-1">Active Clients</h6>
                <h4 className="fw-bold mb-0">
                  {clients.filter((c) => c.status === "active").length}
                </h4>
              </div>
            </div>
          </Link>

          <Link href="/clients/inactive" className="col text-decoration-none">
            <div
              className="card bg-danger text-white shadow-sm h-100 text-center"
              style={{ cursor: "pointer", minHeight: "120px" }}
            >
              <div className="card-body d-flex flex-column justify-content-center align-items-center py-2">
                <h6 className="mb-1">Inactive Clients</h6>
                <h4 className="fw-bold mb-0">
                  {clients.filter((c) => c.status === "inactive").length}
                </h4>
              </div>
            </div>
          </Link>

          <Link href="/clients/closed" className="col text-decoration-none">
            <div
              className="card bg-secondary text-white shadow-sm h-100 text-center"
              style={{ cursor: "pointer", minHeight: "120px" }}
            >
              <div className="card-body d-flex flex-column justify-content-center align-items-center py-2">
                <h6 className="mb-1">Closed Clients</h6>
                <h4 className="fw-bold mb-0">
                  {clients.filter((c) => c.status === "closed").length}
                </h4>
              </div>
            </div>
          </Link>
        </div>
      </div>

      <div className="card shadow-sm mt-4">
        <div className="card-header fw-semibold d-flex justify-content-between align-items-center">
          <span>Client List</span>
        </div>

        <div className="card-body d-flex mb-3 gap-2">
          <div className="d-flex flex-wrap justify-content-between gap-2">
            <select
              className="form-select form-select-sm"
              style={{ border: "none", boxShadow: "none" }}
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>

            <select
              className="form-select form-select-sm"
              value={categoryFilter}
              style={{ border: "none", boxShadow: "none", }}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="All">All Categories</option>
              <option value="Freelance">Freelance</option>
              <option value="Fixed Salary">Fixed Salary</option>
              <option value="Task Based Salary">Task Based Salary</option>
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
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Address</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedClients.length > 0 ? (
                  filteredAndSortedClients.map((client) => (
                    <tr key={client._id}>
                      <td>
                        <Link
                          href={`/clients/${client._id}`}
                          className="text-decoration-none fw-semibold"
                          style={{ color: "#000" }}
                        >
                          {client.name}
                        </Link>
                      </td>
                      <td>
                        {client.company ? (
                          <Link
                            href={`/clients/${client._id}`}
                            className="text-decoration-none"
                            style={{ color: "#000" }}
                          >
                            {client.company}
                          </Link>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td>{client.phone || "—"}</td>
                      <td>{client.category || "Uncategorized"}</td>
                      <td>
                        <span
                          style={{
                            color:
                              client.status === "active"
                                ? "#2c2b2bc9 !important"
                                : client.status === "inactive"
                                ? "#2c2b2bff !important"
                                : "2c2b2bff !important",
                            fontWeight: "200", // optional
                          }}
                        >
                          {client.status.charAt(0).toUpperCase() +
                            client.status.slice(1)}
                        </span>
                      </td>
                      <td>
                        <small className="text-muted">
                          {new Date(client.createdAt).toLocaleDateString()}
                        </small>
                      </td>
                      <td>{client.address || "—"}</td>
                      <td>
                        <div className="d-flex flex-column flex-sm-row gap-2">
                          <button
                            className="btn btn-sm btn-outline-danger"
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
                        </div>
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
                {editingClientId ? "Edit Client" : "Add New Client"}
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
                  {["name", "address", "company", "phone"].map((field) => (
                    <div className="col-md-6 mb-3" key={field}>
                      <label className="form-label text-capitalize">
                        {field}
                      </label>
                      <input
                        type={field === "phone" ? "tel" : "text"}
                        name={field}
                        value={form[field]}
                        onChange={handleChange}
                        className="form-control"
                        placeholder={`Enter ${field}`}
                        required={["name", "address", "phone"].includes(field)}
                      />
                    </div>
                  ))}
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Status</label>
                    <select
                      name="status"
                      value={form.status || "active"}
                      onChange={handleChange}
                      className="form-select"
                      required
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>

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
                      <option value="Freelance">Freelance</option>
                      <option value="Fixed Salary">Fixed Salary</option>
                      <option value="Task Based Salary">
                        Task Based Salary
                      </option>
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
                  {editingClientId ? "Update Client" : "Save Client"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ClientsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ClientsPageContent />
    </Suspense>
  );
}
