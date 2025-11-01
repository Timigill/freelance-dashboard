"use client";
import { useState } from "react";
import "./reset.css";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);

  const showToast = (text, type = "info") => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3000); // hide after 3s
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const token = new URLSearchParams(window.location.search).get("token");

    try {
      const res = await fetch("/api/auth/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });

      const data = await res.json();

      if (!res.ok) {
        showToast(data.error || "Something went wrong", "error");
      } else {
        showToast(data.message || "Password updated successfully", "success");
      }
    } catch (err) {
      showToast("Request failed. Try again later.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* ✅ Toast at page top-right */}
      {toast && <div className={`toast-message ${toast.type}`}>{toast.text}</div>}

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

        <p className="text-center links">
          <a href="/login">Go to Login</a>
        </p>
      </div>
    </>
  );
}
