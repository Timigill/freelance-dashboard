"use client";
import { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

export default function PieChart({ data }) {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  const themeColors = [
    "#614599ff",
    "#b96122ff",
    "#79a035ff",
    "#2188adff",
    "#c04b42ff",
    "#f7a400ff",
    "#6f4e7fff",
    "#42a5f5ff",
  ];

  useEffect(() => {
    if (!chartRef.current) return;

    // Destroy old chart if exists
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    // Create new chart
    chartInstanceRef.current = new Chart(chartRef.current, {
      type: "pie",
      data: {
        labels: data.labels || [],
        datasets: [
          {
            data: data.values || [],
            backgroundColor: data.labels.map(
              (_, i) => themeColors[i % themeColors.length]
            ),
            borderWidth: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
        },
      },
    });

    return () => chartInstanceRef.current?.destroy();
  }, [data]);

  return (
    <div className="d-flex align-items-center" style={{ height: "160px" }}>
      <div style={{ width: "50%", height: "160px", position: "relative" }}>
        <canvas ref={chartRef} />
      </div>
      <div className="ms-3" style={{ width: "50%", fontSize: "0.75rem" }}>
        {data.labels.map((label, index) => (
          <div key={index} className="d-flex align-items-center mb-2">
            <div
              style={{
                width: "8px",
                height: "8px",
                backgroundColor: themeColors[index % themeColors.length],
                borderRadius: "50%",
                marginRight: "8px",
              }}
            />
            <span
              className="text-nowrap text-truncate"
              style={{ maxWidth: "100px" }}
            >
              {label}
            </span>
            <span className="ms-2 text-end" style={{ minWidth: "40px" }}>
              {data.values[index].toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
