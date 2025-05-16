'use client'
import { useState } from 'react'

export default function SettingsPage() {
  const [name, setName] = useState('John Doe')
  const [email, setEmail] = useState('john@example.com')
  const [bio, setBio] = useState('')
  const [file, setFile] = useState(null)

  const handleSubmit = (e) => {
    e.preventDefault()
    alert('Profile updated.')
  }

  return (
    <div>
      <h2>Settings</h2>
      <form onSubmit={handleSubmit} className="mt-4">
        <div className="mb-3">
          <label className="form-label">Full Name</label>
          <input type="text" className="form-control" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="mb-3">
          <label className="form-label">Email</label>
          <input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="mb-3">
          <label className="form-label">Bio</label>
          <textarea className="form-control" value={bio} onChange={(e) => setBio(e.target.value)} rows={3} />
        </div>
        <div className="mb-3">
          <label className="form-label">Profile Picture</label>
          <input type="file" className="form-control" onChange={(e) => setFile(e.target.files[0])} />
        </div>
        <button type="submit" className="btn btn-primary">Save</button>
      </form>
    </div>
  )
}
