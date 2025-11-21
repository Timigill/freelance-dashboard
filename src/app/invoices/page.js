"use client";
import { useState, useEffect } from "react";
import { Modal, Button, Form, Spinner } from "react-bootstrap";
import toast, { Toaster } from "react-hot-toast";
import Loader from "@/components/Loader";
import { showToast } from "../../utils/toastHelper";

export default function InvoicesClient({ initialOpenModal }) {
  const [invoices, setInvoices] = useState([]);
  const [clients, setClients] = useState([]);
  const [status, setStatus] = useState("All");
  const [clientSearch, setClientSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [form, setForm] = useState({
    client: "",
    amount: "",
    status: "Pending",
    paid: "",
    remaining: "",
  });

  // Open modal if prop says so
  useEffect(() => {
    if (initialOpenModal === "true") setShowModal(true);
  }, [initialOpenModal]);

  // Fetch invoices and clients
  const fetchData = async () => {
    try {
      const [invoiceRes, clientRes] = await Promise.all([
        fetch("/api/invoices"),
        fetch("/api/clients"),
      ]);

      const [invoiceData, clientData] = await Promise.all([
        invoiceRes.json(),
        clientRes.json(),
      ]);

      setInvoices(Array.isArray(invoiceData) ? invoiceData : []);
      setClients(Array.isArray(clientData) ? clientData : []);
    } catch (err) {
      console.error("Error fetching data:", err);
      showToast("Failed to fetch data.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Dispatch overdue invoices for Topbar notifications
  useEffect(() => {
    const overdueInvoices = invoices.filter((i) => i.status === "Overdue");
    window.dispatchEvent(
      new CustomEvent("overdueInvoicesUpdate", { detail: overdueInvoices })
    );
  }, [invoices]);

  // Filtered invoices
  const filtered = Array.isArray(invoices)
    ? invoices.filter(
        (i) =>
          (status === "All" || i.status === status) &&
          i.client.toLowerCase().includes(clientSearch.toLowerCase())
      )
    : [];

  // Totals
  const total = filtered.reduce((acc, i) => acc + Number(i.amount || 0), 0);

  // Summary counts
  const summary = {
    Total: invoices.length,
    Paid: invoices.filter((i) => i.status === "Paid").length,
    Pending: invoices.filter((i) => i.status === "Pending").length,
    Overdue: invoices.filter((i) => i.status === "Overdue").length,
    "Partially Paid": invoices.filter((i) => i.status === "Partially Paid")
      .length,
  };

  // Save (Add/Edit)
  const handleSave = async (e) => {
    e.preventDefault();

    if (!form.client || !form.amount) {
      showToast("Please select a client and enter an amount.", "error");
      return;
    }

    const totalAmount = Number(form.amount);
    const paidAmount = Number(form.paid) || 0;

    // Validation
    if (form.status === "Partially Paid" && paidAmount > totalAmount) {
      showToast("Paid amount cannot exceed total amount.", "error");
      return;
    }

    let updatedForm = { ...form };
    if (updatedForm.status === "Paid") {
      updatedForm.paid = totalAmount;
      updatedForm.remaining = 0;
    } else if (updatedForm.status === "Partially Paid") {
      updatedForm.remaining = totalAmount - paidAmount;
    } else {
      updatedForm.paid = 0;
      updatedForm.remaining = totalAmount;
    }

    try {
      const method = editingIndex !== null ? "PUT" : "POST";
      const body =
        editingIndex !== null
          ? { ...updatedForm, _id: invoices[editingIndex]._id }
          : updatedForm;

      const res = await fetch("/api/invoices", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Failed to save invoice");

      fetchData();
      handleClose();
      showToast("Invoice saved successfully!", "success");
    } catch (error) {
      console.error("Error saving invoice:", error);
      showToast("Error saving invoice", "error");
    }
  };

  // Edit invoice
  const handleEdit = (index) => {
    setEditingIndex(index);
    setForm({ ...invoices[index] });
    setShowModal(true);
  };

  // Delete invoice
  const handleDelete = async (invoiceId) => {
    if (!invoiceId) return;
    showToast("Invalid invoice ID", "error");

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
                Are you sure you want to delete this invoice?
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
    });

    if (!confirmed) return;

    try {
      const res = await fetch(`/api/invoices?id=${invoiceId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to delete invoice");

      showToast("Invoice deleted successfully!", "success");
      fetchData(); // refresh the list
    } catch (err) {
      console.error("Delete error:", err);
      showToastr("Error deleting invoice", "error");
    }
  };

  // Close modal
  const handleClose = () => {
    setShowModal(false);
    setEditingIndex(null);
    setForm({
      client: "",
      amount: "",
      status: "Pending",
      paid: "",
      remaining: "",
    });
  };

  // CSV download
  const downloadInvoices = () => {
    const csv = [
      ["Invoice ID", "Client", "Amount", "Status", "Paid", "Remaining"].join(
        ","
      ),
      ...filtered.map((i, idx) =>
        [
          `INV-${String(idx + 1).padStart(2, "0")}`,
          i.client,
          i.amount,
          i.status,
          i.paid || "-",
          i.remaining || "-",
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `invoices_${status}.csv`;
    link.click();
  };

  

  // Helper for status colors
  const getStatusColor = (status) => {
    switch (status) {
      case "Paid":
        return "#d4edda"; // green
      case "Pending":
        return "#fff3cd"; // yellow
      case "Overdue":
        return "#f8d7da"; // red
      case "Partially Paid":
        return "#d1ecf1"; // blue
      default:
        return "#fff";
    }
  };

  return (
    <div className="container mt-4">
      <Toaster />
      <h2 className="mb-4 fw-bold fs-5 text-center">Invoices Dashboard</h2>

      {/* Summary Cards */}
      <div className="row g-3 mb-4 justify-content-center">
        {Object.entries(summary).map(([label, count], i) => {
          const colorClass =
            label === "Paid"
              ? "bg-success text-white"
              : label === "Pending"
              ? "bg-warning text-dark"
              : label === "Overdue"
              ? "bg-danger text-white"
              : label === "Partially Paid"
              ? "bg-info text-dark"
              : "bg-primary text-white";

          return (
            <div
              key={i}
              className="col-6 col-md-3 d-flex justify-content-center"
              style={{ maxWidth: "220px" }}
            >
              <div
                className={`card text-center shadow-sm w-100 ${colorClass}`}
                style={{
                  cursor: label !== "Total" ? "pointer" : "default",
                  transition: "transform 0.15s ease",
                }}
                onClick={() => label !== "Total" && setStatus(label)}
                onMouseEnter={(e) => {
                  if (label !== "Total")
                    e.currentTarget.style.transform = "translateY(-4px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <div className="card-body py-3">
                  <h6 className="mb-1 fw-semibold">{label}</h6>
                  <h3 className="mb-0 fw-bold">{count}</h3>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Buttons & Search */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-3 gap-2">
        <div className="d-flex flex-column flex-md-row gap-2 w-100 justify-content-between align-items-start align-items-md-center">
          <h4 className="mb-0">
            {status === "All" ? "All Invoices" : `${status} Invoices`}
          </h4>
          <Form.Control
            type="text"
            placeholder="Search by client name..."
            value={clientSearch}
            onChange={(e) => setClientSearch(e.target.value)}
            style={{ maxWidth: "300px" }}
          />
        </div>

        <div className="d-flex flex-wrap gap-2 w-100 justify-content-start justify-content-md-end">
          <Button variant="outline-secondary" onClick={() => setStatus("All")}>
            Show All
          </Button>
          <Button variant="outline-primary" onClick={() => setShowModal(true)}>
            + Add Invoice
          </Button>
          <Button variant="primary" onClick={downloadInvoices}>
            Download
          </Button>
        </div>
      </div>

      {/* Invoice Table */}
      <div className="table-responsive shadow-sm rounded">
        <table className="table table-striped align-middle text-center">
          <thead className="table-light">
            <tr>
              <th>#</th>
              <th>INV-ID</th>
              <th>Client</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Paid</th>
              <th>Remaining</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" style={{ padding: "50px 0" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Loader width="150px" text="Loading Invoices..." />
                  </div>
                </td>
              </tr>
            ) : filtered.length > 0 ? (
              filtered.map((inv, index) => (
                <tr key={inv._id}>
                  <td>{index + 1}</td>
                  <td>{`INV-${String(index + 1).padStart(2, "0")}`}</td>
                  <td>{inv.client}</td>
                  <td>{Number(inv.amount).toFixed(2)}</td>
                  <td>{inv.status}</td>
                  <td>{inv.paid ? Number(inv.paid).toFixed(2) : "-"}</td>
                  <td>
                    {inv.remaining ? Number(inv.remaining).toFixed(2) : "-"}
                  </td>
                  <td>
                    <div className="d-flex gap-2">
                      <Button
                        size="sm"
                        variant="outline-primary"
                        onClick={() => handleEdit(index)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline-danger"
                        onClick={() => handleDelete(inv._id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="text-center py-4 text-muted">
                  No invoices found.
                </td>
              </tr>
            )}
          </tbody>

          {/* Totals */}
          <tfoot className="table-light">
            <tr>
              <td colSpan={3} className="text-start fw-bold">
                Totals:
              </td>
              <td>
                {filtered
                  .reduce((acc, i) => acc + Number(i.amount || 0), 0)
                  .toFixed(2)}
              </td>
              <td>-</td>
              <td>
                {filtered
                  .reduce((acc, i) => acc + Number(i.paid || 0), 0)
                  .toFixed(2)}
              </td>
              <td>
                {filtered
                  .reduce((acc, i) => acc + Number(i.remaining || 0), 0)
                  .toFixed(2)}
              </td>
              <td>-</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* <div className="mt-3 text-end fw-bold pb-3 pb-md-3">
        Total Filtered: {total.toFixed(2)}
      </div> */}

      {/* Modal Form */}
      <Modal show={showModal} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {editingIndex !== null ? "Edit Invoice" : "Add Invoice"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSave}>
            <Form.Group className="mb-3">
              <Form.Label>Client Name</Form.Label>
              <Form.Select
                value={form.client}
                onChange={(e) => setForm({ ...form, client: e.target.value })}
              >
                <option value="">Select client...</option>
                {clients.map((c) => (
                  <option key={c._id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Amount</Form.Label>
              <Form.Control
                type="number"
                placeholder="Enter total amount"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Status</Form.Label>
              <Form.Select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option>Paid</option>
                <option>Pending</option>
                <option>Overdue</option>
                <option>Partially Paid</option>
              </Form.Select>
            </Form.Group>

            {form.status === "Partially Paid" && (
              <div className="row">
                <div className="col-md-6 mb-3">
                  <Form.Label>Amount Paid</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="Enter paid amount"
                    value={form.paid}
                    onChange={(e) => setForm({ ...form, paid: e.target.value })}
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <Form.Label>Remaining</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="Auto-calculated"
                    value={
                      form.amount && form.paid
                        ? Math.max(
                            Number(form.amount) - Number(form.paid),
                            0
                          ).toFixed(2)
                        : ""
                    }
                    readOnly
                  />
                </div>
              </div>
            )}

            <div className="text-end">
              <Button
                variant="secondary"
                className="me-2"
                onClick={handleClose}
              >
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                {editingIndex !== null ? "Update" : "Add"}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
}
