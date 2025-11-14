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
    try {
      const [clientRes, invoiceRes] = await Promise.all([
        fetch(`/api/clients/${id}`),
        fetch(`/api/invoices`),
      ]);
      const clientData = await safeJson(clientRes);
      if (clientData?.error) return setClient(null), setInvoices([]);
      const invoiceData = await safeJson(invoiceRes);
      setClient(clientData);
      const clientId = clientData._id?.toString();
      const clientName = clientData.name?.trim().toLowerCase() || "";
      const companyName = clientData.company?.trim().toLowerCase() || "";
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
    } catch (err) {
      console.error(err);
      setClient(null);
      setInvoices([]);
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
        <button className="btn-back" onClick={() => router.back()}>
          Back
        </button>

        <div className="client-card">
          <div className="client-header">
            {/* <div className="client-photo">
              <img
                src={client.profilePic || "/default-avatar.png"}
                alt={client.name}
              />
            </div> */}
            <div className="client-details">
              <h3>{client.name}</h3>
              <p>
                <strong>Company:</strong> {client.company || "—"}
              </p>
              <p>
                <strong>Category:</strong> {client.category || "—"}
              </p>
            </div>
          </div>
          <div className="client-info">
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
          <h4>Invoices</h4>
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

        <style jsx>{`
          .client-container {
            max-width: 900px;
            margin: 20px auto;
            padding: 20px;
            font-family: "Segoe UI", sans-serif;
            color: #352359;
          }
          .btn-back {
            background: none;
            border: 1px solid #352359;
            color: #352359;
            padding: 8px 15px;
            border-radius: 8px;
            cursor: pointer;
            margin-bottom: 15px;
            transition: 0.3s;
          }
          .btn-back:hover {
            background: #352359;
            color: #fff;
          }
          .client-card,
          .invoice-card {
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 20px;
          }
          .client-header {
            display: flex;
            align-items: center;
            gap: 20px;
            flex-wrap: wrap;
          }
          
          .client-details h3 {
            margin: 0 0 5px;
            font-size: 1.5rem;
            color: #352359;
          }
          .client-info p {
            margin: 5px 0;
          }
          .invoice-card h4 {
            margin-bottom: 15px;
            color: #352359;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          th,
          td {
            border: 1px solid #ccc;
            padding: 10px;
            text-align: left;
          }
          th {
            background: #352359;
            color: #fff;
          }
          tr:nth-child(even) {
            background: #f9f9f9;
          }
          tr:hover {
            background: rgba(53, 35, 89, 0.1);
          }
          .clickable-row {
            cursor: pointer;
            color: #0d6efd;
          }
          .no-data {
            text-align: center;
            color: #999;
            padding: 10px 0;
          }
          .filter-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
          }
          @media (max-width: 768px) {
            .client-header {
              flex-direction: column;
              align-items: center;
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
