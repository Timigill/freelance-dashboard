"use client";
import { useState } from "react";
import "./forgot.css";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);

  const showToast = (text, type = "info") => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3000); // auto-hide after 3s
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        showToast(data.error || "Something went wrong", "error");
      } else {
        showToast(data.message || "Reset link sent. Check your email.", "success");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      showToast("Failed to send request. Try again later.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* ✅ Toast container fixed to page top-right */}
      {toast && (
        <div className={`toast-message ${toast.type}`}>
          {toast.text}
        </div>
      )}

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

        <p className="text-center links">
          <a href="/login">Back to Login</a>
        </p>
      </div>
    </>
  );
}
