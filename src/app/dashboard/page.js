"use client";
import { useEffect, useState } from "react";
import './dashboard.css'; // CSS file

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Dummy data for testing
  const dummyStats = {
    projects: 12,
    tasks: 34,
    messages: 7
  };

  useEffect(() => {
    // Simulate API fetch delay
    setTimeout(() => {
      // Replace this with real API fetch later
      const dummyUser = { name: "John Doe", email: "john@example.com" };
      setUser(dummyUser);
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) return <p className="text-center mt-20">Loading...</p>;
  if (error) return <p className="text-center mt-20 text-red-500">{error}</p>;

  return (
    <div className="dashboard-container">
      <h2>Welcome, {user.name}</h2>

      <div className="cards-container">
        <div className="card">
          <h3>Profile</h3>
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
        </div>

        <div className="card">
          <h3>Projects</h3>
          <p>Total Projects: {dummyStats.projects}</p>
        </div>

        <div className="card">
          <h3>Tasks</h3>
          <p>Pending Tasks: {dummyStats.tasks}</p>
        </div>

        <div className="card">
          <h3>Messages</h3>
          <p>Unread Messages: {dummyStats.messages}</p>
        </div>
      </div>
    </div>
  );
}
