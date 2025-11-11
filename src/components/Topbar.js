"use client";

import { useEffect, useState, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import { BsBell, BsPersonCircle, BsBoxArrowRight, BsGear } from "react-icons/bs";

export default function Topbar() {
  const { data: session, status } = useSession();
  const [dark, setDark] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const [user, setUser] = useState(null);

  // Fetch user data
  useEffect(() => {
    if (!session?.user?.id) return;

    const fetchUser = async () => {
      try {
        const res = await fetch(`/api/users/${session.user.id}`);
        if (!res.ok) {
          setUser(null); // User not found
          return;
        }
        const data = await res.json();
        setUser(data);
      } catch (err) {
        console.error(err);
        setUser(null); // fallback
      }
    };

    fetchUser();
  }, [session?.user?.id]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Theme handling
  useEffect(() => {
    if (dark) document.documentElement.setAttribute("data-theme", "dark");
    else document.documentElement.removeAttribute("data-theme");
  }, [dark]);

  // Mobile detection
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 576);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Not authenticated
  if (status !== "authenticated") return null;

  // User does not exist
  if (!user) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center" style={{ height: "80vh" }}>
        <div className="card p-4 text-center" style={{ maxWidth: "400px" }}>
          <h4 className="mb-3">Access Denied</h4>
          <p className="text-muted mb-4">
            Your account does not exist. Please create an account to continue.
          </p>
          <a href="/signup" className="btn btn-primary px-4 py-2">
            Create Account
          </a>
        </div>
      </div>
    );
  }

  // User exists: render normal Topbar
  const userName = session?.user?.name || "User";
  const userEmail = session?.user?.email || "";
  const profileInitial = userName.charAt(0).toUpperCase();
  const profilePic = user?.profilePic || null;

  return (
    <header className="sticky-top bg-white shadow-sm border-bottom" style={{ height: "63px", zIndex: 1051 }}>
      <div className="d-flex align-items-center justify-content-between h-100 px-3">
        {/* Logo */}
        <div style={{ height: "37px", position: "relative", width: "110px" }}>
          <Image src="/Lancer.png" alt="Lancer Logo" fill priority />
        </div>

        {/* Right Section */}
        <div className="d-flex align-items-center gap-3">
          {/* Notifications */}
          <button className="btn btn-link p-1 position-relative" style={{ fontSize: "1.5rem", color: "#352359" }}>
            <BsBell />
            <span className="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-light rounded-circle">
              <span className="visually-hidden">New notifications</span>
            </span>
          </button>

          {/* Profile Dropdown */}
          <div className="position-relative" ref={dropdownRef}>
            <button
              className="btn btn-link p-1"
              style={{ fontSize: "1.8rem", color: "#352359" }}
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <BsPersonCircle />
            </button>

            {showDropdown && (
              <div
                className="shadow-sm"
                style={{
                  position: "absolute",
                  top: "120%",
                  right: 0,
                  minWidth: "220px",
                  background: "#fff",
                  borderRadius: "10px",
                  overflow: "hidden",
                  zIndex: 2000,
                  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)",
                  border: "1px solid #eee",
                }}
              >
                {/* Profile Header */}
                <div className="px-3 py-3" style={{ backgroundColor: "#f8f8f8", borderBottom: "1px solid #e5e5e5" }}>
                  <div className="d-flex align-items-center">
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center"
                      style={{
                        width: "42px",
                        height: "42px",
                        backgroundColor: "#352359",
                        color: "#fff",
                        fontSize: "1.1rem",
                        fontWeight: 600,
                      }}
                    >
                      {profilePic ? (
                        <img
                          src={profilePic}
                          alt={userName}
                          style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }}
                        />
                      ) : (
                        profileInitial
                      )}
                    </div>

                    <div className="ms-2">
                      <div className="fw-semibold" style={{ color: "#352359", fontSize: "0.95rem" }}>
                        {userName}
                      </div>
                      <div className="text-muted small" style={{ fontSize: "0.8rem" }}>
                        {userEmail}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Options */}
                <button
                  className="dropdown-item text-start d-flex align-items-center gap-2 py-2 px-3"
                  style={{ fontSize: "0.9rem", color: "#352359", fontWeight: 500, transition: "all 0.2s ease" }}
                  onClick={() => {
                    window.location.href = "/settings";
                    setShowDropdown(false);
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#352359";
                    e.currentTarget.style.color = "#fff";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color = "#352359";
                  }}
                >
                  <BsGear size={16} /> Settings
                </button>

                <button
                  className="dropdown-item text-start d-flex align-items-center gap-2 py-2 px-3"
                  style={{
                    fontSize: "0.9rem",
                    color: "#352359",
                    fontWeight: 500,
                    borderTop: "1px solid #eee",
                    transition: "all 0.2s ease",
                  }}
                  onClick={() => {
                    signOut({ callbackUrl: "/login" });
                    setShowDropdown(false);
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#352359";
                    e.currentTarget.style.color = "#fff";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color = "#352359";
                  }}
                >
                  <BsBoxArrowRight size={16} /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

