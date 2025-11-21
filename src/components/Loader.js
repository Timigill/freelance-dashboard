"use client";

import React from "react";

export default function Loader({ width = "100%", height = "6px",  }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: width,
        minHeight: "50px",
        padding: "8px",
        backgroundColor: "#f5f5f5",
        borderRadius: "6px",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Loading bar */}
      <div
        style={{
          width: "100%",
          height: height,
          backgroundColor: "#e0e0e0",
          borderRadius: "4px",
          overflow: "hidden",
          position: "relative",
          marginBottom: "8px",
        }}
      >
        <div
          style={{
            width: "0%",
            height: "100%",
            backgroundColor: "#352359",
            animation: "loadingBar 2s infinite",
            position: "absolute",
          }}
        ></div>
      </div>

      {/* Loading text */}
      {/* <span
        style={{
          fontSize: "1rem",
          color: "#352359",
          fontWeight: "500",
          textAlign: "center",
        }}
      >
        {text}
      </span> */}

      <style jsx>{`
        @keyframes loadingBar {
          0% {
            left: -100%;
            width: 100%;
          }
          50% {
            left: 25%;
            width: 50%;
          }
          100% {
            left: 100%;
            width: 0%;
          }
        }
      `}</style>
    </div>
  );
}
