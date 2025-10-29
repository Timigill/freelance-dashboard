"use client";
import { useState } from "react";
import './reset.css'; // create this CSS file

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);
    const token = new URLSearchParams(window.location.search).get("token");

    try {
      const res = await fetch("/api/auth/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });

      const data = await res.json();
      setMessage(data.message || data.error || "Something went wrong");
    } catch (err) {
      setMessage("Request failed. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-container">
      <h3>Set New Password</h3>
      <form onSubmit={handleSubmit} noValidate>
        <input
          type="password"
          placeholder="Enter new password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          aria-label="New Password"
        />
        <button type="submit" disabled={loading}>
          {loading ? "Updating..." : "Update Password"}
        </button>
      </form>
      {message && <p className="message">{message}</p>}
      <p className="text-center links">
        <a href="/login">Go to Login</a>
      </p>
    </div>
  );
}
