"use client";

import { useEffect, useState, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import {
  BsBell,
  BsPersonCircle,
  BsBoxArrowRight,
  BsGear,
} from "react-icons/bs";

export default function Topbar() {
  const { data: session, status } = useSession();
  const [dark, setDark] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const dropdownRef = useRef(null);
  const notifRef = useRef(null);

  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);

  // Fetch user data
  useEffect(() => {
    if (!session?.user?.id) return;

    const fetchUser = async () => {
      try {
        const res = await fetch(`/api/users/${session.user.id}`);
        if (!res.ok) {
          setUser(null);
          return;
        }
        const data = await res.json();
        setUser(data);
      } catch (err) {
        console.error(err);
        setUser(null);
      }
    };

    fetchUser();
  }, [session?.user?.id]);

  // Fetch notifications
  useEffect(() => {
    if (!user) return;

    const fetchNotifications = async () => {
      try {
        const resTasks = await fetch(`/api/tasks?userId=${user._id}`);
        const taskList = await resTasks.json();

        const resIncome = await fetch(`/api/income?userId=${user._id}`);
        const incomeList = await resIncome.json();

        const notifArr = [];
        const today = new Date();

        // Overdue invoices
        incomeList.forEach((src) => {
          if (
            src.dueDate &&
            new Date(src.dueDate) < today &&
            src.paymentStatus !== "Paid"
          ) {
            notifArr.push({
              type: "Invoice",
              message: `Invoice #${src._id} is overdue.`,
              date: src.dueDate,
            });
          }
        });

        // Tasks due within 1 day
        taskList.forEach((task) => {
          if (!task.dueDate) return;
          const due = new Date(task.dueDate);
          const diffDays = (due - today) / (1000 * 60 * 60 * 24);
          if (diffDays <= 1 && task.status !== "Completed") {
            notifArr.push({
              type: "Task",
              message: `Task "${task.name}" is due soon.`,
              date: task.dueDate,
            });
          }
        });

        setNotifications(notifArr);
      } catch (err) {
        console.error(err);
      }
    };

    fetchNotifications();
  }, [user]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
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
      <div
        className="d-flex flex-column justify-content-center align-items-center"
        style={{ height: "80vh" }}
      >
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

  const userName = session?.user?.name || "User";
  const userEmail = session?.user?.email || "";
  const profileInitial = userName.charAt(0).toUpperCase();
  const profilePic = user?.profilePic || null;

  return (
    <header
      className="sticky-top bg-white shadow-sm border-bottom"
      style={{ height: "63px", zIndex: 1051 }}
    >
      <div className="d-flex align-items-center justify-content-between h-100 px-3">
        {/* Logo */}
        <div style={{ height: "37px", position: "relative", width: "110px" }}>
          <Image src="/Lancer.png" alt="Lancer Logo" fill priority />
        </div>

        {/* Right Section */}
        <div className="d-flex align-items-center gap-3">
          {/* Notifications */}
          <div className="position-relative" ref={notifRef}>
            <button
              className="btn btn-link p-1 position-relative"
              style={{ fontSize: "1.5rem", color: "#352359" }}
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <BsBell />
              {notifications.length > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-light rounded-circle">
                  <span className="visually-hidden">
                    {notifications.length} new notifications
                  </span>
                </span>
              )}
            </button>

            {showNotifications && (
              <div
                className="shadow-sm"
                style={{
                  position: "absolute",
                  top: "120%",
                  right: 0,
                  width: "280px",
                  maxHeight: "300px",
                  overflowY: "auto",
                  background: "#fff",
                  borderRadius: "10px",
                  zIndex: 2000,
                  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)",
                  border: "1px solid #eee",
                }}
              >
                <div
                  className="px-3 py-2"
                  style={{ fontWeight: 600, borderBottom: "1px solid #e5e5e5" }}
                >
                  Notifications
                </div>
                {notifications.length === 0 ? (
                  <div className="px-3 py-2 text-muted small">
                    No new notifications
                  </div>
                ) : (
                  notifications.map((notif, i) => (
                    <div
                      key={i}
                      className="px-3 py-2 border-bottom"
                      style={{ fontSize: "0.85rem" }}
                    >
                      <span style={{ fontWeight: 500 }}>{notif.type}: </span>{" "}
                      {notif.message}
                      <div
                        className="text-muted"
                        style={{ fontSize: "0.75rem" }}
                      >
                        {new Date(notif.date).toLocaleDateString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

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
                <div
                  className="px-3 py-3"
                  style={{
                    backgroundColor: "#f8f8f8",
                    borderBottom: "1px solid #e5e5e5",
                  }}
                >
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
                          style={{
                            width: "100%",
                            height: "100%",
                            borderRadius: "50%",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        profileInitial
                      )}
                    </div>

                    <div className="ms-2">
                      <div
                        className="fw-semibold"
                        style={{ color: "#352359", fontSize: "0.95rem" }}
                      >
                        {userName}
                      </div>
                      <div
                        className="text-muted small"
                        style={{ fontSize: "0.8rem" }}
                      >
                        {userEmail}
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  className="dropdown-item text-start d-flex align-items-center gap-2 py-2 px-3"
                  style={{
                    fontSize: "0.9rem",
                    color: "#352359",
                    fontWeight: 500,
                    transition: "all 0.2s ease",
                  }}
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
