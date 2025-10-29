"use client";
import { useState } from "react";
import './forgot.css'; // make sure to create this CSS

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Something went wrong");
      } else {
        setMessage(data.message || "Reset link sent. Check your email.");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setMessage("Failed to send request. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-container">
      <h3>Forgot Password</h3>
      <form onSubmit={handleSubmit} noValidate>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          aria-label="Email"
        />
        <button type="submit" disabled={loading}>
          {loading ? "Sending..." : "Send Reset Link"}
        </button>
      </form>
      {message && <p className="message">{message}</p>}
      <p className="text-center links">
        <a href="/login">Back to Login</a>
      </p>
    </div>
  );
}
