"use client";
import { useEffect, useState } from "react";
import './verify.css'; // create this CSS file

export default function VerifyPage() {
  const [message, setMessage] = useState("Verifying...");

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token");
    if (!token) {
      setMessage("Invalid verification link");
      return;
    }

    // Redirect to API verification route
    window.location.href = `/api/auth/verify?token=${token}`;
  }, []);

  return (
    <div className="verify-container">
      <h3>Email Verification</h3>
      <p className="message">{message}</p>
    </div>
  );
}
