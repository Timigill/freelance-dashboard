"use client";
import { useState, useEffect } from "react";
import { FcGoogle } from "react-icons/fc";
import { BsGithub } from "react-icons/bs";
import { signIn } from "next-auth/react";
import toast from "react-hot-toast"; // ✅ added
import "./login.css";

export default function LoginPage() {
  const [form, setForm] = useState({
    emailOrPhone: "",
    password: "",
    remember: false,
  });
  const [loading, setLoading] = useState(false);
  const [callbackUrl, setCallbackUrl] = useState("/dashboard");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const url = params.get("callbackUrl");
    if (url) setCallbackUrl(url);

    const verified = params.get("verified");
    if (verified) toast.success("Your email has been verified. Please login."); // ✅ replaced message
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await signIn("credentials", {
      redirect: false,
      emailOrPhone: form.emailOrPhone,
      password: form.password,
      callbackUrl,
    });

    if (result?.error) {
      toast.error(result.error); // ✅ show error
    } else {
      toast.success("Login successful!"); // ✅ show success
      window.location.href = result.url; // redirect
    }

    setLoading(false);
  };

  return (
    <div className="login-container">
      <h3>Welcome Back</h3>
      <form onSubmit={handleSubmit} noValidate>
        <input
          name="emailOrPhone"
          type="text"
          placeholder="Email or Phone Number"
          value={form.emailOrPhone}
          onChange={handleChange}
          required
          aria-label="Email or Phone Number"
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

        <div className="checkbox-wrapper">
          <input
            type="checkbox"
            id="remember"
            name="remember"
            checked={form.remember}
            onChange={handleChange}
          />
          <label htmlFor="remember">Remember me</label>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      {/* ✅ removed the old message display */}

      <div className="text-center links">
        <a href="/forgot">Forgot Password?</a>
        <br />
        <a href="/signup">Create Account</a>
      </div>

      <div className="social-login">
        <p>Or continue with</p>
        <div className="social-buttons">
          <button
            type="button"
            className="google-btn"
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          >
            <FcGoogle
              size={20}
              style={{ marginRight: "8px", verticalAlign: "middle" }}
            />
            Continue with Google
          </button>

          <button
            type="button"
            className="github-btn"
            onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
          >
            <BsGithub
              size={20}
              style={{ marginRight: "8px", verticalAlign: "middle" }}
            />
            Continue with GitHub
          </button>
        </div>
      </div>
    </div>
  );
}
