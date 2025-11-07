'use client'
import { useEffect, useState, Suspense } from 'react'
import { useParams, useRouter } from 'next/navigation'

function ClientsDynamicPageContent() {
    const { slug } = useParams()
    const router = useRouter()
    const [clients, setClients] = useState([])
    const [client, setClient] = useState(null)
    const [invoices, setInvoices] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!slug) return
        if (isFilter(slug)) fetchClients(slug)
        else fetchClientDetails(slug)
    }, [slug])

    const isFilter = (value) => {
        const filters = ['all', 'active', 'inactive', 'closed', 'new']
        return value && filters.includes(value.toLowerCase())
    }

    // ✅ Fetch all clients (for filter pages)
    const fetchClients = async (rawFilter) => {
        setLoading(true)
        setClient(null)
        setInvoices([])
        try {
            const res = await fetch('/api/clients')
            const data = await res.json()
            setClients(applyFilter(data, rawFilter))
        } catch (err) {
            console.error('Error fetching clients:', err)
            setClients([])
        } finally {
            setLoading(false)
        }
    }

    const applyFilter = (clients = [], rawFilter) => {
        if (!rawFilter) return clients
        const filter = rawFilter.toLowerCase()
        if (filter === 'all') return clients
        if (filter === 'active') return clients.filter((c) => c.status === 'active')
        if (filter === 'inactive') return clients.filter((c) => c.status === 'inactive')
        if (filter === 'closed') return clients.filter((c) => c.status === 'closed')
        if (filter === 'new') {
            const now = new Date()
            return clients.filter((c) => {
                const date = new Date(c.createdAt)
                return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
            })
        }
        return clients
    }

    const safeJson = async (res) => {
        try {
            if (!res.ok) {
                console.error('API error:', res.status, res.statusText)
                return null
            }
            const text = await res.text()
            return text ? JSON.parse(text) : null
        } catch (err) {
            console.error('Invalid JSON response:', err)
            return null
        }
    }

    // ✅ Fetch single client & its related invoices
    const fetchClientDetails = async (id) => {
        setLoading(true)
        setClients([])
        setClient(null)
        setInvoices([])

        try {
            const [clientRes, invoiceRes] = await Promise.all([
                fetch(`/api/clients/${id}`),
                fetch(`/api/invoices`)
            ])

            const clientData = await safeJson(clientRes)
            const invoiceData = await safeJson(invoiceRes)

            if (!clientData) {
                console.warn('No client data found for ID:', id)
                setClient(null)
                setInvoices([])
                return
            }

            setClient(clientData)

            // ✅ Flexible invoice matching
            const clientId = clientData._id?.toString()
            const clientName = clientData.name?.trim().toLowerCase() || ''
            const companyName = clientData.company?.trim().toLowerCase() || ''

            const filteredInvoices = (invoiceData || []).filter((inv) => {
                const invClientId = inv.clientId?.toString()
                const invClientName =
                    inv.clientName?.trim().toLowerCase() ||
                    inv.client?.trim().toLowerCase() ||
                    inv.client?.name?.trim().toLowerCase() ||
                    ''
                const invCompany =
                    inv.company?.trim().toLowerCase() ||
                    inv.clientCompany?.trim().toLowerCase() ||
                    ''
                return (
                    invClientId === clientId ||
                    invClientName.includes(clientName) ||
                    invCompany.includes(companyName)
                )
            })

            console.log('✅ Filtered invoices:', filteredInvoices)
            setInvoices(filteredInvoices)
        } catch (err) {
            console.error('Error loading client details:', err)
            setClient(null)
            setInvoices([])
        } finally {
            setLoading(false)
        }
    }

    // 🌀 Loading
    if (loading) return <div className="p-4">Loading...</div>

    // 🧩 Filtered client list (All, Active, etc.)
    if (isFilter(slug)) {
        return (
            <div className="container py-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h3 className="fw-bold text-capitalize">
                        {slug.toLowerCase() === 'all' ? 'All Clients' : `${slug} Clients`}
                    </h3>
                    <button className="btn btn-secondary" onClick={() => router.push('/clients')}>
                        ⬅ Back
                    </button>
                </div>

                <div className="card shadow-sm">
                    <div className="card-body p-0">
                        <div className="table-responsive">
                            <table className="table align-middle mb-0 table-striped table-bordered">
                                <thead className="table-light">
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
                                            <tr key={c._id}>
                                                <td
                                                    style={{ cursor: 'pointer', color: '#0d6efd' }}
                                                    onClick={() => router.push(`/clients/${c._id}`)}
                                                >
                                                    {c.name}
                                                </td>
                                                <td>{c.email || '—'}</td>
                                                <td>{c.company || '—'}</td>
                                                <td>{c.phone || '—'}</td>
                                                <td>{c.category || 'Uncategorized'}</td>
                                                <td>{c.deadline ? new Date(c.deadline).toLocaleDateString() : '—'}</td>
                                                <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="7" className="text-center py-4 text-muted">
                                                No clients found for this category.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // 🧩 Single client detail + related invoices
    if (client) {
        return (
            <div className="container py-4">
                <button className="btn btn-secondary mb-3" onClick={() => router.back()}>
                    ⬅ Back
                </button>
                <h3 className="fw-bold mb-3">{client.name}</h3>
                <p><strong>Company:</strong> {client.company || '—'}</p>
                <p><strong>Phone:</strong> {client.phone || '—'}</p>
                <p><strong>Address:</strong> {client.address || '—'}</p>
                <p><strong>Category:</strong> {client.category || '—'}</p>

                <hr />
                <h5 className="fw-semibold mb-3">Invoices</h5>

                {invoices.length > 0 ? (
                    <div className="table-responsive">
                        <table className="table table-bordered table-striped align-middle">
                            <thead>
                                <tr>
                                    <th>Invoice #</th>
                                    <th>Invoice Date</th>
                                    <th>Amount</th>
                                    <th>Status</th>

                                </tr>
                            </thead>
                            <tbody>
                                {invoices.map((inv) => (
                                    <tr key={inv._id}>
                                        <td>{inv.id || inv.invoiceNumber}</td>
                                        <td>{inv.createdAt ? new Date(inv.createdAt).toLocaleString() : '—'}</td>
                                        <td>{inv.amount || '—'}</td>
                                        <td>{inv.status || '—'}</td>
                                    </tr>
                                ))}
                            </tbody>

                        </table>
                    </div>
                ) : (
                    <p className="text-muted">No invoices found for this client.</p>
                )}
            </div>
        )
    }

    return <div className="p-4 text-muted">Client not found.</div>
}

export default function ClientsDynamicPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ClientsDynamicPageContent />
        </Suspense>
    )
}
