'use client'

export default function TopClients() {
  const clients = [
    { name: 'Acme Corp', projects: 5, revenue: '$5,000' },
    { name: 'Globex Inc.', projects: 3, revenue: '$3,200' },
    { name: 'Initech', projects: 4, revenue: '$4,700' },
  ]

  return (
    <div className="card p-3 shadow-sm">
      <h6 className="mb-3">Top Clients</h6>
      <table className="table table-sm table-hover">
        <thead className="table-light">
          <tr>
            <th>Name</th><th>Projects</th><th>Total Revenue</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((c, i) => (
            <tr key={i}>
              <td>{c.name}</td>
              <td>{c.projects}</td>
              <td>{c.revenue}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
