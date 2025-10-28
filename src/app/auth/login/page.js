"use client";
import { useState, useEffect } from "react";
import './login.css'; // make sure to create this CSS

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [callbackUrl, setCallbackUrl] = useState("/");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const url = params.get("callbackUrl");
    if (url) setCallbackUrl(url);

    const verified = params.get("verified");
    if (verified) setMessage("Your email has been verified. Please login.");
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        window.location.assign(callbackUrl);
        return;
      } else {
        setMessage(data.error || "Login failed");
      }
    } catch (err) {
      setMessage("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h3>Welcome Back</h3>
      <form onSubmit={handleSubmit} noValidate>
        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
          aria-label="Email"
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
          aria-label="Password"
        />
        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      {message && <p className="message">{message}</p>}

      <div className="text-center links">
        <a href="/auth/forgot">Forgot Password?</a>
        <br />
        <a href="/auth/signup">Create Account</a>
      </div>
    </div>
  );
}
