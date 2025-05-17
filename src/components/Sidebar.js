// src/components/Sidebar.js
export default function Sidebar() {
  return (
    <div className="bg-dark text-white vh-100 p-3" style={{ width: '250px' }}>
      <h4 className="mb-4">Freelance Dashboard</h4>
      <ul className="nav flex-column">
        <li className="nav-item"><a href="/" className="nav-link text-white">📊 Dashboard</a></li>
        <li className="nav-item"><a href="/clients" className="nav-link text-white">👥 Clients</a></li>
        <li className="nav-item"><a href="/invoices" className="nav-link text-white">🧾 Invoices</a></li>
        <li className="nav-item"><a href="/settings" className="nav-link text-white">⚙️ Settings</a></li>
      </ul>
    </div>
  )
}
