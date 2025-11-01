"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import { BsBell, BsPersonCircle } from "react-icons/bs";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Topbar() {
  const [open, setOpen] = useState(false);
  const { data: session } = useSession();
  const user = session?.user;
  const pathname = usePathname();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".user-menu")) setOpen(false);
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // Close dropdown when navigating to another route
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header className="topbar">
      <div className="topbar-container">
        {/* Logo */}
        <div className="topbar-logo">
          <Image
            src="/Lancer.png"
            alt="Lancer Logo"
            fill
            style={{ objectFit: "contain" }}
            priority
          />
        </div>

        {/* Right Icons */}
        <div className="topbar-icons">
          <button className="notification-btn">
            <BsBell />
            <span className="notification-dot"></span>
          </button>

          {/* User Menu */}
          <div className="user-menu">
            <button
              className="user-icon-btn"
              onClick={() => setOpen((prev) => !prev)}
            >
              <BsPersonCircle />
            </button>

            <div className={`user-dropdown ${open ? "show" : ""}`}>
              {user ? (
                <>
                  <div className="user-header">
                    <div className="user-avatar">
                      {user.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <p className="user-name">{user.name}</p>
                  </div>

                  <hr className="dropdown-divider" />

                  <p className="user-field">
                    <strong>Email:</strong> {user.email}
                  </p>

                  <p className="user-field">
                    <strong>Password:</strong> ••••••••
                  </p>

                  <Link href="/update-password" className="update-link">
                    Update Password
                  </Link>

                  {user.phone && (
                    <p className="user-field">
                      <strong>Phone:</strong> {user.phone}
                    </p>
                  )}

                  <hr className="dropdown-divider" />

                  <button
                    className="logout-btn"
                    onClick={() => signOut({ callbackUrl: "/login" })}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <p className="text-muted">No user info</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
