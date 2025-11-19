"use client";
import { useState, useEffect, Suspense } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import toast from "react-hot-toast";
import { useSearchParams } from "next/navigation";
import { showToast } from "../../utils/toastHelper";

function IncomePageContent() {
  const [incomeSources, setIncomeSources] = useState([]);
  const [clients, setClients] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentSource, setCurrentSource] = useState(null);
  const [filter, setFilter] = useState("all");
  const searchParams = useSearchParams();

  // Normalize client category/type
  const normalizeType = (type) => {
    if (!type) return "Fixed Salary";
    const t = type.trim().toLowerCase();
    if (t === "task based salary" || t === "task-based salary") return "Task-Based Salary";
    if (t === "fixed salary") return "Fixed Salary";
    if (t === "freelance") return "Freelance";
    return "Fixed Salary"; // fallback
  };

  const [form, setForm] = useState({
    name: "",
    amount: "",
    frequency: "Monthly",
    description: "",
    clientId: "",
    clientName: "",
    type: "Fixed Salary",
  });

  // Fetch income sources
  const fetchIncomeSources = async () => {
    try {
      const res = await fetch("/api/income", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch income sources");
      const data = await res.json();
      setIncomeSources(data);
    } catch (err) {
      console.error(err);
      showToast("Error fetching income sources", "error");
    }
  };

  // Fetch clients
  const fetchClients = async () => {
    try {
      const res = await fetch("/api/clients", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch clients");
      const data = await res.json();
      setClients(data);
    } catch (err) {
      console.error(err);
      showToast("Error fetching clients", "error");
    }
  };

  useEffect(() => {
    fetchIncomeSources();
    fetchClients();
  }, []);

  // Auto-open modal if ?openModal=true
  useEffect(() => {
    if (searchParams.get("openModal") === "true") {
      setCurrentSource(null);
      setForm({
        name: "",
        amount: "",
        frequency: "Monthly",
        description: "",
        clientId: "",
        clientName: "",
        type: "Fixed Salary",
      });
      setShowModal(true);
    }
  }, [searchParams]);

  // Handle add/edit submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let updatedForm = { ...form };

      // Ensure type is correct based on client
      if (updatedForm.clientId) {
        const selected = clients.find((c) => c._id === updatedForm.clientId);
        updatedForm.type = selected ? normalizeType(selected.category) : "Fixed Salary";
      }

      updatedForm.amount =
        typeof updatedForm.amount === "string"
          ? parseFloat(updatedForm.amount) || 0
          : updatedForm.amount;

      if (currentSource) {
        await fetch("/api/income", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ ...updatedForm, _id: currentSource._id }),
        });
      } else {
        await fetch("/api/income", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(updatedForm),
        });
      }

      setShowModal(false);
      setCurrentSource(null);
      setForm({
        name: "",
        amount: "",
        frequency: "Monthly",
        description: "",
        clientId: "",
        clientName: "",
        type: "Fixed Salary",
      });

      fetchIncomeSources();
      showToast("Income source saved successfully!", "success");
    } catch (err) {
      console.error(err);
      showToast("Error saving income source", "error");
    }
  };

  // Edit
  const handleEdit = (source) => {
    setCurrentSource(source);
    setForm({
      name: source.name,
      amount: source.amount,
      frequency: source.frequency,
      description: source.description || "",
      clientId: source.clientId || "",
      clientName: source.clientName || "",
      type: normalizeType(source.type),
    });
    setShowModal(true);
  };

  // Delete
  const handleDelete = async (taskId) => {
    if (!taskId) return toast.error("Invalid task ID");

    const confirmed = await new Promise((resolve) => {
      let dismissed = false;

      const ConfirmToast = ({ id }) => {
        useEffect(() => {
          const timer = setTimeout(() => {
            if (!dismissed) {
              dismissed = true;
              toast.dismiss(id);
              resolve(false);
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
                Are you sure you want to delete this task?
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
        duration: 3000,
        position: "top-center",
      });
    });

    if (!confirmed) return;

    try {
      const res = await fetch(`/api/income?id=${taskId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        let errData = {};
        try {
          errData = await res.json();
        } catch {}
        throw new Error(errData?.error || "Failed to delete income source");
      }
      showToast("Income source deleted successfully!", "success");
      fetchIncomeSources();
    } catch (err) {
      console.error("Delete error:", err);
      showToast(err.message || "Error deleting income source", "error");
    }
  };

  const filteredSources =
    filter === "all"
      ? incomeSources
      : incomeSources.filter(
          (s) => s.type?.toLowerCase().trim() === filter.toLowerCase().trim()
        );

  const activeSources =
    filter === "all"
      ? incomeSources.filter((s) => s.isActive)
      : incomeSources.filter(
          (s) => s.isActive && s.type?.toLowerCase().trim() === filter.toLowerCase().trim()
        );

  const totalIncome = activeSources.reduce((sum, s) => sum + (s.amount || 0), 0);

  return (
    <div className="container-fluid py-4">
      {/* Header & Add Button */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-nowrap">
        <div>
          <h3 className="fw-bold mb-0 fs-5 fs-md-4" style={{ color: "var(--bs-primary)" }}>
            Income Sources
          </h3>
          <p className="text-muted fs-6 mb-0">Manage your income streams and track earnings</p>
        </div>
        <button
          className="btn mt-2 mt-md-0"
          style={{ background: "var(--bs-primary)", color: "white", whiteSpace: "nowrap", fontSize: "0.9rem", padding: "6px 14px" }}
          onClick={() => {
            setCurrentSource(null);
            setForm({
              name: "",
              amount: "",
              frequency: "Monthly",
              description: "",
              clientId: "",
              clientName: "",
              type: "Fixed Salary",
            });
            setShowModal(true);
          }}
        >
          Add Income Source
        </button>
      </div>

      {/* Summary Cards */}
      <div className="row mb-4 g-3 justify-content-center text-center">
        <div className="col-12 col-md-4">
          <div className="card bg-primary text-white h-100 text-center">
            <div className="card-body d-flex flex-column justify-content-center">
              <h6 className="mb-2" style={{ color: "var(--bs-primary)" }}>Total Monthly Income</h6>
              <h3 className="mb-0">{totalIncome.toLocaleString()}</h3>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-4">
          <div className="card bg-info text-white h-100 text-center">
            <div className="card-body d-flex flex-column justify-content-center">
              <h6 className="mb-2" style={{ color: "var(--bs-primary)" }}>Average per Source</h6>
              <h3 className="mb-0">{incomeSources.length ? Math.round(totalIncome / incomeSources.length).toLocaleString() : 0}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <div className="btn-group">
            {["all", "Fixed Salary", "Task Based Salary", "Freelance"].map((t) => (
              <button
                key={t}
                className={`btn ${filter === t ? "btn-primary" : "btn-outline-primary"}`}
                onClick={() => setFilter(t)}
              >
                {t === "all" ? "All" : t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Income Table */}
      <div className="card shadow-sm">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Name</th>
                  <th>Client</th>
                  <th>Amount</th>
                  <th>Frequency</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSources.map((source) => (
                  <tr key={source._id}>
                    <td>{source.name}</td>
                    <td>{source.clientName || (source.clientId ? "Client" : "—")}</td>
                    <td>{source.amount.toLocaleString()}</td>
                    <td>{source.frequency}</td>
                    <td>
                      <div className="d-flex flex-column flex-sm-row gap-2">
                        <Button variant="outline-primary" size="sm" onClick={() => handleEdit(source)}>Edit</Button>
                        <Button variant="outline-danger" size="sm" onClick={() => handleDelete(source._id)}>Delete</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{currentSource ? "Edit" : "Add"} Income Source</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            {/* Name */}
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

            {/* Client */}
            <Form.Group className="mb-3">
              <Form.Label>Client</Form.Label>
              <Form.Select
                required
                value={form.clientId || ""}
                onChange={(e) => {
                  const id = e.target.value;
                  const selected = clients.find((c) => c._id === id);
                  const clientName = selected ? (selected.company ? `${selected.company} — ${selected.name}` : selected.name) : "";
                  const type = selected ? normalizeType(selected.category) : "Fixed Salary";
                  setForm((prev) => ({ ...prev, clientId: id, clientName, type }));
                }}
              >
                <option value="">Select client...</option>
                {clients.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.company ? `${c.company} — ${c.name}` : c.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            {/* Amount */}
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

            {/* Frequency */}
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

            {/* Description */}
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
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Save</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}

export default function IncomePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <IncomePageContent />
    </Suspense>
  );
}
