"use client";
import { useState, useEffect } from "react";
import { Modal, Button, Form, Spinner } from "react-bootstrap";
import { useSearchParams } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
export default function InvoicesPage() {
  const searchParams = useSearchParams();
  const openModal = searchParams.get("openModal");

  const [invoices, setInvoices] = useState([]);
  const [clients, setClients] = useState([]); // ✅ store all existing clients
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

  /** ✅ Open modal if query param says so */
  useEffect(() => {
    if (openModal === "true") setShowModal(true);
  }, [openModal]);

  /** ✅ Fetch invoices and clients from DB */
  useEffect(() => {
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
        toast.error("Failed to fetch data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  /** ✅ Filter invoices by status and client name */
  const filtered = Array.isArray(invoices)
    ? invoices.filter(
        (i) =>
          (status === "All" || i.status === status) &&
          i.client.toLowerCase().includes(clientSearch.toLowerCase())
      )
    : [];

  /** ✅ Total amount */
  const total = filtered.reduce((acc, i) => acc + Number(i.amount || 0), 0);

  /** ✅ Summary counts */
  const summary = {
    Total: invoices.length,
    Paid: invoices.filter((i) => i.status === "Paid").length,
    Pending: invoices.filter((i) => i.status === "Pending").length,
    Overdue: invoices.filter((i) => i.status === "Overdue").length,
    "Partially Paid": invoices.filter((i) => i.status === "Partially Paid")
      .length,
  };

  /** ✅ Add or Edit Invoice */
  const handleSave = async (e) => {
    e.preventDefault();

    if (!form.client || !form.amount) {
      toast.error("Please select a client and enter an amount.");
      return;
    }

    // ✅ Correct logic for Paid / Remaining
    let updatedForm = { ...form };

    const total = Number(updatedForm.amount) || 0;
    const paid = Number(updatedForm.paid) || 0;

    if (updatedForm.status === "Paid") {
      updatedForm.paid = total;
      updatedForm.remaining = 0;
    } else if (updatedForm.status === "Partially Paid") {
      updatedForm.remaining = Math.max(total - paid, 0);
    } else {
      updatedForm.paid = 0;
      updatedForm.remaining = total;
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

      const updated = await res.json();
      setInvoices(updated);
      handleClose();
      toast.success("Invoice saved successfully!");
    } catch (error) {
      console.error("Error saving invoice:", error);
      toast.error("Error saving invoice");
      toast.success(
        editingIndex !== null ? "Invoice updated!" : "Invoice added!"
      );
    }
  };

  /** ✅ Edit invoice */
  const handleEdit = (index) => {
    setEditingIndex(index);
    setForm({ ...invoices[index] });
    setShowModal(true);
  };

  /** ✅ Delete */
  const handleDelete = async (id) => {
    let confirmResolve;

    // ✅ Custom full-screen confirmation toast with dimmed background
    const ConfirmToast = () => (
      <div
        style={{
          position: "fixed",
          width: "100vw",
          top: "-20px",
          bottom: "-20px",
          height: "100vh",
          background: "rgba(0, 0, 0, 0.5)", // dim background
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
          backdropFilter: "blur(2px)", // optional soft blur
        }}
      >
        <div
          style={{
            background: "#352359",
            color: "white",
            padding: "20px 24px",
            borderRadius: "12px",
            width: "300px",
            maxWidth: "90vw",
            textAlign: "center",
            boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
          }}
        >
          <p
            style={{
              marginBottom: "16px",
              fontWeight: 500,
              fontSize: "0.95rem",
            }}
          >
            Do you want to delete this task?
          </p>

          <div
            style={{ display: "flex", gap: "10px", justifyContent: "center" }}
          >
            <button
              onClick={() => {
                toast.dismiss();
                confirmResolve(true);
              }}
              style={{
                background: "#dc3545",
                color: "#fff",
                border: "none",
                padding: "8px 18px",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "0.85rem",
              }}
            >
              Yes
            </button>

            <button
              onClick={() => {
                toast.dismiss();
                confirmResolve(false);
              }}
              style={{
                background: "#6c757d",
                color: "#fff",
                border: "none",
                padding: "8px 18px",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "0.85rem",
              }}
            >
              No
            </button>
          </div>
        </div>
      </div>
    );

    // Promise wrapper
    const confirmPromise = new Promise((resolve) => {
      confirmResolve = resolve;
      toast.custom(<ConfirmToast />, {
        duration: 10000,
        position: "top-center",
        style: {
          background: "transparent",
          boxShadow: "none",
          padding: 0,
        },
      });
    });

    try {
      const confirmed = await confirmPromise;
      if (!confirmed) return;

      const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete task");

      fetchTasks();
      toast.success("Task deleted successfully!");
    } catch (err) {
      toast.error("Error deleting task");
    }
  };

  /** ✅ Close modal and reset form */
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

  /** ✅ CSV Download */
  const downloadInvoices = () => {
    const csv = [
      ["Invoice ID", "Client", "Amount", "Status", "Paid", "Remaining"].join(
        ","
      ),
      ...filtered.map((i) =>
        [
          i.id,
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

  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" />
        <p>Loading invoices...</p>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <Toaster />
      <h2 className="mb-4 fw-bold fs-5 text-center">Invoices Dashboard</h2>

      {/* ✅ Summary Cards */}
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

      {/* ✅ Buttons and Search */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-3 gap-2">
        <div className="d-flex flex-column flex-md-row gap-2 w-100 justify-content-between align-items-start align-items-md-center">
          <h4 className="mb-0">
            {status === "All" ? "All Invoices" : `${status} Invoices`}
          </h4>

          {/* 🔍 Client Name Filter */}
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

      {/* ✅ Invoices Table */}
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
            {filtered.map((inv, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{`INV-${String(index + 1).padStart(2, "0")}`}</td>
                <td>{inv.client}</td>
                <td>{inv.amount}</td>
                <td>
                  <span
                    className="d-inline-block text-center text-truncate"
                    style={{
                      maxWidth: "80px",
                      padding: "4px 8px",
                      border: "1px solid #3523594d",
                      borderRadius: "6px",
                      color: "#352359",
                      cursor: "default",
                    }}
                  >
                    {inv.status}
                  </span>
                </td>
                <td>{inv.paid || "-"}</td>
                <td>{inv.remaining || "-"}</td>
                <td>
                  <div className="d-flex flex-column flex-sm-row justify-content-center gap-2">
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
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3 text-end fw-bold pb-3 pb-md-3">Total: ${total}</div>

      {/* ✅ Modal Form */}
      <Modal show={showModal} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {editingIndex !== null ? "Edit Invoice" : "Add Invoice"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSave}>
            {/* ✅ Only existing clients can be selected */}
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
              <Form.Label>Amount ($)</Form.Label>
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
                  <Form.Label>Amount Paid ($)</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="Enter paid amount"
                    value={form.paid}
                    onChange={(e) => setForm({ ...form, paid: e.target.value })}
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <Form.Label>Remaining ($)</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="Auto-calculated"
                    value={form.remaining !== undefined ? form.remaining : ""}
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

// "use client";
// import { useState, useEffect } from "react";
// import { Modal, Button, Form, Spinner } from "react-bootstrap";
// import { useSearchParams } from "next/navigation";
// import toast from "react-hot-toast";

// export default function InvoicesPage() {
//   const searchParams = useSearchParams();
//   const openModal = searchParams.get("openModal");
//   const [invoices, setInvoices] = useState([]);
//   const [status, setStatus] = useState("All");
//   const [loading, setLoading] = useState(true);
//   const [showModal, setShowModal] = useState(false);
//   const [editingIndex, setEditingIndex] = useState(null);
//   const [form, setForm] = useState({
//     client: "",
//     amount: "",
//     status: "Pending",
//     paid: "",
//     remaining: "",
//   });

//   useEffect(() => {
//     if (openModal === "true") {
//       setShowModal(true);
//     }
//   }, [openModal]);

//   /** ✅ Fetch invoices from MongoDB API */
//   useEffect(() => {
//     const fetchInvoices = async () => {
//       try {
//         const res = await fetch("/api/invoices");
//         const data = await res.json();
//         setInvoices(Array.isArray(data) ? data : []);
//       } catch (error) {
//         console.error("Error fetching invoices:", error);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchInvoices();
//   }, []);

//   /** ✅ Filter invoices by status */
//   const filtered = Array.isArray(invoices)
//     ? invoices.filter((i) => status === "All" || i.status === status)
//     : [];

//   /** ✅ Compute total amount */
//   const total = filtered.reduce((acc, i) => acc + Number(i.amount || 0), 0);

//   /** ✅ Summary counts */
//   const summary = {
//     Total: invoices.length,
//     Paid: invoices.filter((i) => i.status === "Paid").length,
//     Pending: invoices.filter((i) => i.status === "Pending").length,
//     Overdue: invoices.filter((i) => i.status === "Overdue").length,
//     "Partially Paid": invoices.filter((i) => i.status === "Partially Paid")
//       .length,
//   };

//   /** ✅ Add or Edit Invoice */
//   const handleSave = async (e) => {
//     e.preventDefault();

//     if (!form.client || !form.amount) {
//       alert("Please fill all required fields");
//       return;
//     }

//     try {
//       const method = editingIndex !== null ? "PUT" : "POST";
//       const body =
//         editingIndex !== null
//           ? { ...form, _id: invoices[editingIndex]._id }
//           : form;

//       const res = await fetch("/api/invoices", {
//         method,
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(body),
//       });

//       if (!res.ok) throw new Error("Failed to save invoice");

//       const updated = await res.json();
//       setInvoices(updated);
//       handleClose();
//     } catch (error) {
//       console.error("Error saving invoice:", error);
//       alert("Error saving invoice.");
//     }
//   };

//   /** ✅ Edit */
//   const handleEdit = (index) => {
//     setEditingIndex(index);
//     setForm({ ...invoices[index] });
//     setShowModal(true);
//   };

//   /** ✅ Close Modal */
//   const handleClose = () => {
//     setShowModal(false);
//     setEditingIndex(null);
//     setForm({
//       client: "",
//       amount: "",
//       status: "Pending",
//       paid: "",
//       remaining: "",
//     });
//   };

//   /** ✅ CSV Download */
//   const downloadInvoices = () => {
//     const csv = [
//       ["Invoice ID", "Client", "Amount", "Status", "Paid", "Remaining"].join(
//         ","
//       ),
//       ...filtered.map((i) =>
//         [
//           i.id,
//           i.client,
//           i.amount,
//           i.status,
//           i.paid || "-",
//           i.remaining || "-",
//         ].join(",")
//       ),
//     ].join("\n");

//     const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
//     const link = document.createElement("a");
//     link.href = URL.createObjectURL(blob);
//     link.download = `invoices_${status}.csv`;
//     link.click();
//   };

//   if (loading) {
//     return (
//       <div className="text-center mt-5">
//         <Spinner animation="border" />
//         <p>Loading invoices...</p>
//       </div>
//     );
//   }

//   return (
//     <div className="container mt-4">
//       <h2 className="mb-4 fw-bold fs-5 fs-md-4 text-center">
//         Invoices Dashboard
//       </h2>

//       {/* ✅ Summary Cards */}
//       <div className="row g-3 mb-4">
//         {Object.entries(summary).map(([label, count], i) => {
//           const bg =
//             label === "Paid"
//               ? "success"
//               : label === "Pending"
//               ? "warning text-dark"
//               : label === "Overdue"
//               ? "danger"
//               : label === "Partially Paid"
//               ? "info text-dark"
//               : "primary";

//           return (
//             <div
//               key={i}
//               className={`col-6 col-md-3 d-flex justify-content-center ${
//                 Object.entries(summary).length % 2 !== 0 &&
//                 i === Object.entries(summary).length - 1
//                   ? "mx-auto"
//                   : ""
//               }`}
//             >
//               <div
//                 className={`card text-center text-white bg-${bg} shadow-sm w-100`}
//                 style={{
//                   cursor: label !== "Total" ? "pointer" : "default",
//                   maxWidth: "220px",
//                 }}
//                 onClick={() => label !== "Total" && setStatus(label)}
//               >
//                 <div className="card-body">
//                   <h6>{label}</h6>
//                   <h3>{count}</h3>
//                 </div>
//               </div>
//             </div>
//           );
//         })}
//       </div>

//       {/* ✅ Buttons */}
//       <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-3 gap-2">
//         <h4 className="mb-0">
//           {status === "All" ? "All Invoices" : `${status} Invoices`}
//         </h4>
//         <div className="d-flex flex-wrap gap-2 w-100 justify-content-start justify-content-md-end">
//           <Button variant="outline-secondary" onClick={() => setStatus("All")}>
//             Show All
//           </Button>
//           <Button variant="outline-primary" onClick={() => setShowModal(true)}>
//             + Add Invoice
//           </Button>
//           <Button variant="primary" onClick={downloadInvoices}>
//             Download
//           </Button>
//         </div>
//       </div>

//       {/* ✅ Invoices Table */}
//       <div className="table-responsive shadow-sm rounded">
//         <table className="table table-striped align-middle text-center">
//           <thead className="table-light">
//             <tr>
//               <th>#</th>
//               <th>Invoice ID</th>
//               <th>Client</th>
//               <th>Amount ($)</th>
//               <th>Status</th>
//               <th>Paid</th>
//               <th>Remaining</th>
//               <th>Action</th>
//             </tr>
//           </thead>
//           <tbody>
//             {filtered.map((inv, index) => (
//               <tr key={index}>
//                 <td>{index + 1}</td>
//                 <td>{inv.id}</td>
//                 <td>{inv.client}</td>
//                 <td>{inv.amount}</td>
//                 <td>
//                   <span
//                     className="d-inline-block text-center text-truncate"
//                     style={{
//                       maxWidth: "80px",
//                       padding: "4px 8px",
//                       border: "1px solid #3523594d",
//                       borderRadius: "6px",
//                       color: "#352359",
//                       cursor: "default",
//                     }}
//                     onMouseEnter={(e) => {
//                       e.target.style.backgroundColor = "#352359";
//                       e.target.style.color = "#fff";
//                     }}
//                     onMouseLeave={(e) => {
//                       e.target.style.backgroundColor = "transparent";
//                       e.target.style.color = "#352359";
//                     }}
//                   >
//                     {inv.status}
//                   </span>
//                 </td>

//                 <td>{inv.status === "Partially Paid" ? inv.paid : "-"}</td>
//                 <td>{inv.status === "Partially Paid" ? inv.remaining : "-"}</td>
//                 <td>
//                   <div className="d-flex flex-column flex-sm-row justify-content-center gap-2">
//                     <Button
//                       size="sm"
//                       variant="outline-primary"
//                       onClick={() => handleEdit(index)}
//                       className="w-100 w-sm-auto"
//                     >
//                       Edit
//                     </Button>
//                   </div>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

//       <div className="mt-3 text-end fw-bold">Total: ${total}</div>

//       {/* ✅ Modal Form */}
//       <Modal show={showModal} onHide={handleClose} centered>
//         <Modal.Header closeButton>
//           <Modal.Title>
//             {editingIndex !== null ? "Edit Invoice" : "Add Invoice"}
//           </Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <Form onSubmit={handleSave}>
//             <Form.Group className="mb-3">
//               <Form.Label>Client Name</Form.Label>
//               <Form.Control
//                 type="text"
//                 placeholder="Enter client name"
//                 value={form.client}
//                 onChange={(e) => setForm({ ...form, client: e.target.value })}
//               />
//             </Form.Group>
//             <Form.Group className="mb-3">
//               <Form.Label>Amount ($)</Form.Label>
//               <Form.Control
//                 type="number"
//                 placeholder="Enter total amount"
//                 value={form.amount}
//                 onChange={(e) => setForm({ ...form, amount: e.target.value })}
//               />
//             </Form.Group>
//             <Form.Group className="mb-3">
//               <Form.Label>Status</Form.Label>
//               <Form.Select
//                 value={form.status}
//                 onChange={(e) => setForm({ ...form, status: e.target.value })}
//               >
//                 <option>Paid</option>
//                 <option>Pending</option>
//                 <option>Overdue</option>
//                 <option>Partially Paid</option>
//               </Form.Select>
//             </Form.Group>

//             {form.status === "Partially Paid" && (
//               <div className="row">
//                 <div className="col-md-6 mb-3">
//                   <Form.Label>Amount Paid ($)</Form.Label>
//                   <Form.Control
//                     type="number"
//                     placeholder="Enter paid amount"
//                     value={form.paid}
//                     onChange={(e) =>
//                       setForm({ ...form, paid: e.target.value })
//                     }
//                   />
//                 </div>
//                 <div className="col-md-6 mb-3">
//                   <Form.Label>Remaining ($)</Form.Label>
//                   <Form.Control
//                     type="number"
//                     placeholder="Enter remaining amount"
//                     value={form.remaining}
//                     onChange={(e) =>
//                       setForm({ ...form, remaining: e.target.value })
//                     }
//                   />
//                 </div>
//               </div>
//             )}

//             <div className="text-end">
//               <Button
//                 variant="secondary"
//                 className="me-2"
//                 onClick={handleClose}
//               >
//                 Cancel
//               </Button>
//               <Button variant="primary" type="submit">
//                 {editingIndex !== null ? "Update" : "Add"}
//               </Button>
//             </div>
//           </Form>
//         </Modal.Body>
//       </Modal>
//     </div>
//   );
// }
