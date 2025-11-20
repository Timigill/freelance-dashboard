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

    // Destroy old chart
    chartInstanceRef.current?.destroy();

    // Prevent rendering if no data
    if (!data?.labels?.length || !data?.values?.length) return;

    chartInstanceRef.current = new Chart(chartRef.current, {
      type: "pie",
      data: {
        labels: data.labels,
        datasets: [
          {
            data: data.values,
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
    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
      {data.labels.length === 0 ? (
        <div
          style={{
            flex: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
            fontSize: "1rem",
            color: "#352359",
            height: "200px", 
          }}
        >
          Add client to see overview
        </div>
      ) : (
        <>
          <div
            style={{
              flex: "1 1 50%",
              minWidth: 150,
              height: "200px",
              position: "relative",
            }}
          >
            <canvas ref={chartRef} />
          </div>
          <div style={{ flex: "1 1 50%", minWidth: 150, fontSize: "0.75rem" }}>
            {data.labels.map((label, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: 6,
                }}
              >
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    backgroundColor: themeColors[index % themeColors.length],
                    marginRight: 8,
                  }}
                />
                <span
                  style={{
                    flex: "1 1 auto",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {label}
                </span>
                <span
                  style={{ marginLeft: 8, minWidth: 40, textAlign: "right" }}
                >
                  {data.values[index].toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
