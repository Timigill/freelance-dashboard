"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FcGoogle } from "react-icons/fc";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { BsGithub } from "react-icons/bs";
import { signIn, signOut } from "next-auth/react"; // ✅ signOut added
import toast from "react-hot-toast";
import "./login.css";

export default function LoginPage() {
  const [form, setForm] = useState({
    emailOrPhone: "",
    password: "",
    remember: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [callbackUrl, setCallbackUrl] = useState("/dashboard");
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const url = params.get("callbackUrl");
    if (url) setCallbackUrl(url);

    const verified = params.get("verified");
    if (verified) toast.success("Your email has been verified. Please login.");
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

    if (!form.remember) {
      toast.error("You must check 'Remember me' to login.");
      return;
    }

    setLoading(true);

    const result = await signIn("credentials", {
      redirect: false,
      emailOrPhone: form.emailOrPhone,
      password: form.password,
      callbackUrl: callbackUrl,
    });

    if (result?.error) {
      toast.error(result.error);
      setLoading(false);
      return;
    }

    toast.success("Login successful!");
    router.push(callbackUrl);

    if (form.remember) {
      const expireAt = new Date().getTime() + 12 * 60 * 60 * 1000; // 12 hours
      localStorage.setItem("autoLogoutAt", expireAt);
    }
  };

  // ✅ Auto logout effect
  useEffect(() => {
    const checkLogout = () => {
      const expireAt = localStorage.getItem("autoLogoutAt");
      if (expireAt && new Date().getTime() > expireAt) {
        signOut({ callbackUrl: "/" });
        localStorage.removeItem("autoLogoutAt");
      }
    };

    checkLogout(); // immediate check on load
    const interval = setInterval(checkLogout, 60000); // check every minute
    return () => clearInterval(interval);
  }, []);

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
        />

        <div className="password-field">
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
          />
          <span
            className="toggle-password"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>

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
            onClick={() => signIn("google", { callbackUrl })}
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
            onClick={() => signIn("github", { callbackUrl })}
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
