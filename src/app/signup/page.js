"use client";
import { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { BsGithub } from "react-icons/bs";
import { signIn } from "next-auth/react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import toast from "react-hot-toast";

import "./signup.css";

export default function SignupPage() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    agree: false,
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handlePhoneChange = (value) => {
    setForm((prev) => ({ ...prev, phone: `+${value}` }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (!form.agree) {
      toast.error("You must agree to Terms & Conditions");
      return;
    }
    if (!form.phone || form.phone.length < 10) {
      toast.error("Please enter a valid phone number");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${form.firstName} ${form.lastName}`,
          email: form.email,
          phone: form.phone,
          password: form.password,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Signup failed");

      toast.success("Signup successful! Check your email for verification.");
      setForm({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
        agree: false,
      });

      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);
    } catch (err) {
      toast.error(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <h3>Create Account</h3>

      <form onSubmit={handleSubmit} noValidate>
        <div className="name-fields">
          <input
            name="firstName"
            placeholder="First Name"
            value={form.firstName}
            onChange={handleChange}
            required
          />
          <input
            name="lastName"
            placeholder="Last Name"
            value={form.lastName}
            onChange={handleChange}
            required
          />
        </div>

        <input
          name="email"
          type="email"
          placeholder="Email Address"
          value={form.email}
          onChange={handleChange}
          required
        />

        <div className="phone-wrapper">
          <PhoneInput
            country="pk"
            value={form.phone}
            onChange={handlePhoneChange}
            placeholder="Enter your phone number"
            inputProps={{
              name: "phone",
              required: true,
            }}
            containerClass="phone-input-container"
            inputClass="phone-input-field"
          />
        </div>

        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
        />

        <input
          name="confirmPassword"
          type="password"
          placeholder="Confirm Password"
          value={form.confirmPassword}
          onChange={handleChange}
          required
        />

        <div className="checkbox-wrapper">
          <input
            type="checkbox"
            id="agree"
            name="agree"
            checked={form.agree}
            onChange={handleChange}
          />
          <label htmlFor="agree">I agree to Terms & Conditions</label>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Sign Up"}
        </button>
      </form>

      <div className="social-login">
        <p>Or continue with</p>
        <div className="social-buttons">
          <button
            type="button"
            className="google-btn"
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          >
            <FcGoogle size={20} style={{ marginRight: "8px" }} />
            Continue with Google
          </button>
          <button
            type="button"
            className="github-btn"
            onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
          >
            <BsGithub size={20} style={{ marginRight: "8px" }} />
            Continue with GitHub
          </button>
        </div>
      </div>

      <p className="text-center mt-3">
        Already have an account? <a href="/login">Login</a>
      </p>
    </div>
  );
}
