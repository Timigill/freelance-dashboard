"use client";
import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import { BsBell, BsPersonCircle, BsBoxArrowRight } from "react-icons/bs";

export default function Topbar() {
  const { data: session, status } = useSession();
  const [dark, setDark] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // ✅ Theme handling
  useEffect(() => {
    if (dark) {
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
  }, [dark]);

  // ✅ Mobile screen detection
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 576);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (status !== "authenticated") return null;

  return (
    <header
      style={{ height: "63px" }}
      className="sticky-top bg-white shadow-sm border-bottom"
    >
      <div className="d-flex align-items-center justify-content-between h-100 px-3">
        {/* Logo */}
        <div
          style={{
            height: "37px",
            position: "relative",
            width: "110px",
          }}
        >
          <Image src="/Lancer.png" alt="Lancer Logo" fill priority />
        </div>

        {/* Icons + Logout */}
        <div className="d-flex align-items-center gap-3">
          {/* Notification Icon */}
          <button
            className="btn btn-link p-1 position-relative"
            style={{ fontSize: "1.5rem", color: "#352359" }}
          >
            <BsBell />
            <span className="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-light rounded-circle">
              <span className="visually-hidden">New notifications</span>
            </span>
          </button>

          {/* Profile Icon */}
          <button
            className="btn btn-link p-1"
            style={{ fontSize: "1.8rem", color: "#352359" }}
          >
            <BsPersonCircle />
          </button>

          {/* Logout Button / Icon */}
          <button
            className="btn d-flex align-items-center justify-content-center gap-1 rounded"
            style={{
              color: "#352359",
              backgroundColor: "transparent",
              border: isMobile ? "none" : "1px solid #352359", // remove border on mobile
              fontWeight: 500,
              fontSize: isMobile ? "1.4rem" : "1.2rem",
              padding: isMobile ? "0" : "3px 12px",
              width: isMobile ? "44px" : "auto",
              height: isMobile ? "44px" : "auto",
              minWidth: isMobile ? "44px" : "auto",
              borderRadius: isMobile ? "50%" : "6px", // circular on mobile
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s ease",
            }}
            onClick={() => signOut({ callbackUrl: "/login" })}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#352359";
              e.currentTarget.style.color = "#fff";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = "#352359";
            }}
          >
            {isMobile ? <BsBoxArrowRight size={34} /> : "Logout"}
          </button>
        </div>
      </div>
    </header>
  );
}
