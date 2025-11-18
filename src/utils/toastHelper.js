import toast from "react-hot-toast";

export function showToast(message, type = "success") {
  const isSuccess = type === "success";

  toast.custom(
    (t) => (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          position: "relative",
          background: "#1f29379f",
          color: "#fff",
          padding: "6px 16px",
          borderRadius: "10px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
          borderLeft: `7px solid ${isSuccess ? "#22c52aff" : "#ef4444"}`,
          minWidth: "260px",
          maxWidth: "90vw",
        }}
      >
        {/* ICON */}
        <div style={{ width: "24px", height: "24px" }}>
          {isSuccess ? (
            // SUCCESS ICON (Animated check)
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              style={{ animation: "pop 0.3s ease-out" }}
            >
              <circle cx="12" cy="12" r="12" fill="#49c72aaf" opacity="0.9" />
              <path
                d="M6 12l4 4 8-8"
                stroke="#fff"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  strokeDasharray: 30,
                  strokeDashoffset: 30,
                  animation: "dash 0.4s forwards ease-out",
                }}
              />
            </svg>
          ) : (
            // ERROR ICON (Animated cross)
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              style={{ animation: "pop 0.3s ease-out" }}
            >
              <circle cx="12" cy="12" r="12" fill="#bd3636ff" opacity="0.8" />
              <path
                d="M8 8l8 8M16 8l-8 8"
                stroke="#fff"
                strokeWidth="2.5"
                strokeLinecap="round"
                style={{
                  strokeDasharray: 20,
                  strokeDashoffset: 20,
                  animation: "dash 0.4s forwards ease-out",
                }}
              />
            </svg>
          )}
        </div>

        {/* MESSAGE */}
        <span style={{ flex: 1, fontSize: "0.95rem" }}>{message}</span>

        {/* CLOSE BUTTON */}
        <button
          onClick={() => toast.dismiss(t.id)}
          style={{
            background: "transparent",
            border: "none",
            color: "#fff",
            fontSize: "1.4rem",
            cursor: "pointer",
          }}
        >
          ×
        </button>

        {/* KEYFRAMES */}
        <style>
          {`
            @keyframes dash {
              to { stroke-dashoffset: 0; }
            }
            @keyframes pop {
              0% { transform: scale(0.5); opacity: 0; }
              100% { transform: scale(1); opacity: 1; }
            }
          `}
        </style>
      </div>
    ),
    {
      duration: 5000,
      position: "top-center",
    }
  );
}
