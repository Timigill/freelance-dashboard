"use client";
import { useEffect, useState, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";

function ClientsDynamicPageContent() {
  const { slug } = useParams();
  const router = useRouter();
  const [clients, setClients] = useState([]);
  const [client, setClient] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);


  useEffect(() => {
    if (!slug) return;
    if (isFilter(slug)) fetchClients(slug);
    else fetchClientDetails(slug);
  }, [slug]);

  const isFilter = (value) => {
    const filters = ["all", "active", "inactive", "closed", "new"];
    return value && filters.includes(value.toLowerCase());
  };

  const fetchClients = async (rawFilter) => {
    setLoading(true);
    setClient(null);
    setInvoices([]);
    try {
      const res = await fetch("/api/clients");
      const data = await res.json();
      setClients(applyFilter(data, rawFilter));
    } catch (err) {
      console.error(err);
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilter = (clients = [], rawFilter) => {
    if (!rawFilter) return clients;
    const filter = rawFilter.toLowerCase();
    if (filter === "all") return clients;
    if (filter === "active")
      return clients.filter((c) => c.status === "active");
    if (filter === "inactive")
      return clients.filter((c) => c.status === "inactive");
    if (filter === "closed")
      return clients.filter((c) => c.status === "closed");
    if (filter === "new") {
      const now = new Date();
      return clients.filter((c) => {
        const date = new Date(c.createdAt);
        return (
          date.getMonth() === now.getMonth() &&
          date.getFullYear() === now.getFullYear()
        );
      });
    }
    return clients;
  };

  const safeJson = async (res) => {
    try {
      const text = await res.text();
      const data = text ? JSON.parse(text) : null;
      if (!res.ok) return { error: data?.message || res.statusText };
      return data;
    } catch (err) {
      return { error: "Invalid server response" };
    }
  };

  const fetchClientDetails = async (id) => {
    setLoading(true);
    setClients([]);
    setClient(null);
    setInvoices([]);
    setTasks([]); // make sure tasks reset

    try {
      const [clientRes, invoiceRes, tasksRes] = await Promise.all([
        fetch(`/api/clients/${id}`),
        fetch(`/api/invoices`),
        fetch(`/api/tasks`),
      ]);

      const clientData = await safeJson(clientRes);
      if (clientData?.error) return setClient(null), setInvoices([]);

      const invoiceData = await safeJson(invoiceRes);
      const tasksData = await safeJson(tasksRes);

      setClient(clientData);

      const clientId = clientData._id?.toString();
      const clientName = clientData.name?.trim().toLowerCase() || "";
      const companyName = clientData.company?.trim().toLowerCase() || "";

      // -----------------------------
      // FILTER INVOICES
      // -----------------------------
      const filteredInvoices = (invoiceData || []).filter((inv) => {
        const invClientId = inv.clientId?.toString();
        const invClientName =
          inv.clientName?.trim().toLowerCase() ||
          inv.client?.trim().toLowerCase() ||
          inv.client?.name?.trim().toLowerCase() ||
          "";
        const invCompany =
          inv.company?.trim().toLowerCase() ||
          inv.clientCompany?.trim().toLowerCase() ||
          "";

        return (
          invClientId === clientId ||
          invClientName.includes(clientName) ||
          invCompany.includes(companyName)
        );
      });

      setInvoices(filteredInvoices);

      // -----------------------------
      // FILTER TASKS
      // -----------------------------
      const filteredTasks = (tasksData || []).filter((t) => {
        const taskClientId = t.clientId?.toString();
        const taskClientName =
          t.clientName?.trim().toLowerCase() ||
          t.client?.trim().toLowerCase() ||
          t.client?.name?.trim().toLowerCase() ||
          "";
        return (
          taskClientId === clientId || taskClientName.includes(clientName)
        );
      });

      setTasks(filteredTasks);
    } catch (err) {
      console.error(err);
      setClient(null);
      setInvoices([]);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;

  if (isFilter(slug)) {
    return (
      <div className="client-container">
        <div className="filter-header">
          <h3>
            {slug.toLowerCase() === "all" ? "All Clients" : `${slug} Clients`}
          </h3>
          <button className="btn-back" onClick={() => router.push("/clients")}>
            ⬅ Back
          </button>
        </div>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Company</th>
                <th>Phone</th>
                <th>Category</th>
                <th>Deadline</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {clients.length > 0 ? (
                clients.map((c) => (
                  <tr
                    key={c._id}
                    onClick={() => router.push(`/clients/${c._id}`)}
                    className="clickable-row"
                  >
                    <td>{c.name}</td>
                    <td>{c.email || "—"}</td>
                    <td>{c.company || "—"}</td>
                    <td>{c.phone || "—"}</td>
                    <td>{c.category || "Uncategorized"}</td>
                    <td>
                      {c.deadline
                        ? new Date(c.deadline).toLocaleDateString()
                        : "—"}
                    </td>
                    <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="no-data">
                    No clients found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (client) {
    return (
      <div className="client-container">
        <div className="header-row">
          <h2>{client.name}</h2>
          <button className="btn-back" onClick={() => router.back()}>
            Back
          </button>
        </div>

        <div className="client-card">
          <div className="client-details">
            <p>
              <strong>Company:</strong> {client.company || "—"}
            </p>
            <p>
              <strong>Category:</strong> {client.category || "—"}
            </p>
            <p>
              <strong>Phone:</strong> {client.phone || "—"}
            </p>
            <p>
              <strong>Address:</strong> {client.address || "—"}
            </p>
            <p>
              <strong>Joined:</strong>{" "}
              {new Date(client.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="invoice-card">
          <h3>Invoices</h3>
          {invoices.length > 0 ? (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Invoice #</th>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv) => (
                    <tr key={inv._id}>
                      <td>{inv.id || inv.invoiceNumber}</td>
                      <td>
                        {inv.createdAt
                          ? new Date(inv.createdAt).toLocaleDateString()
                          : "—"}
                      </td>
                      <td>{inv.amount || "—"}</td>
                      <td>{inv.status || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="no-data">No invoices found.</p>
          )}
        </div>
<div className="task-card">
  <h3>All Tasks of {client.name}</h3>

  {tasks.length > 0 ? (
    <table className="table table-hover align-middle mb-0">
      <thead>
        <tr>
          <th>Task Title</th>
          <th>Client</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {tasks
          .filter((task) => {
            const taskClientId = task.clientId?.toString() || "";
            const taskClientName = (task.clientName || task.client?.name || "")
              .trim()
              .toLowerCase();
            const selectedClientId = client._id?.toString() || "";
            const selectedClientName = client.name?.trim().toLowerCase() || "";

            return (
              taskClientId === selectedClientId ||
              taskClientName.includes(selectedClientName)
            );
          })
          .map((task, index) => (
            <tr key={task._id || `task-${index}`}>
              <td>{task.title || task.name || "—"}</td>
              <td>{task.clientName || task.client?.name || "—"}</td>
              <td>{task.status || "Pending"}</td>
              <td>
                {/* Add your edit/delete buttons here */}
              </td>
            </tr>
          ))}
      </tbody>
    </table>
  ) : (
    <p className="no-data">No tasks found for this client.</p>
  )}
</div>


        <style jsx>{`
          .client-container {
            max-width: 900px;
            margin: 20px auto;
            padding: 20px;
            font-family: "Segoe UI", sans-serif;
            color: #352359;
          }

          .header-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            flex-wrap: wrap;
          }
            .header-row h2{
            font-size: 24px !important;
            font-weight: bold;
            }

          .btn-back {
            background: #352359;
            border: none;
            color: #fff;
            padding: 8px 16px;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 500;
            transition: 0.3s;
          }
          .btn-back:hover {
            background: #1c1330ff;
          }

          .client-card {
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 25px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
            background-color: #fff;
          }

          .client-details p {
            margin: 6px 0;
            font-size: 0.95rem;
          }

          .invoice-card {
            border-radius: 12px;
            padding: 20px;
            background: #fff;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
          }

          .invoice-card h3 {
            margin-bottom: 15px;
            color: #352359;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            min-width: 600px;
          }
          th,
          td {
            border: 1px solid #ccc;
            padding: 10px 8px;
            text-align: left;
            font-size: 0.9rem;
          }
          th {
            background: #352359;
            color: #fff;
            position: sticky;
            top: 0;
            z-index: 1;
          }
          tr:nth-child(even) {
            background: #f9f9f9;
          }
          tr:hover {
            background: rgba(53, 35, 89, 0.08);
          }

          .table-wrapper {
            overflow-x: auto;
          }

          .no-data {
            text-align: center;
            color: #999;
            padding: 10px 0;
          }

          @media (max-width: 768px) {
            .header-row {
              padding: 0 2rem;

              flex-direction: row;
              align-items: center;
              gap: 10px;
            }

            table {
              font-size: 0.85rem;
            }
          }
        `}</style>
      </div>
    );
  }

  return <div className="p-4 text-muted">Client not found.</div>;
}

export default function ClientsDynamicPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ClientsDynamicPageContent />
    </Suspense>
  );
}
