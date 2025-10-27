'use client'
import { useEffect, useRef } from 'react'
import Chart from 'chart.js/auto'

export default function PieChart({ data }) {
  const chartRef = useRef(null)
  const chartInstanceRef = useRef(null)

  // Professional muted color palette
  const themeColors = [
    '#614599ff', // Deep Purple (Primary brand color) 
   '#b96122ff', // Saddle Brown
    '#79a035ff', // Muted Olive
    '#2188adff', // Steel Blue Gray
   
    '#c04b42ff'  // Warm Gray
  ]

  useEffect(() => {
    if (chartRef.current) {
      // Destroy existing chart instance if it exists to prevent overlap
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy()
      }
      chartInstanceRef.current = new Chart(chartRef.current, {
        type: 'pie',
        data: {
          labels: data.labels,
          datasets: [{
            data: data.values,
            backgroundColor: themeColors,
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            }
          }
        }
      })
    }
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy()
      }
    }
  }, [data])

  // Theme-matching muted colors for consistency


  return (
    <div className="d-flex align-items-center" style={{ height: '160px' }}>
      {/* Chart */}
      <div style={{ width: '50%', height: '160px', position: 'relative' }}>
        <canvas ref={chartRef} />
      </div>
      {/* Labels */}
      <div className="ms-3" style={{ width: '50%', fontSize: '0.75rem' }}>
        {data.labels.map((label, index) => (
          <div key={index} className="d-flex align-items-center mb-2">
            <div
              style={{
                width: '8px',
                height: '8px',
                backgroundColor: themeColors[index],
                borderRadius: '50%',
                marginRight: '8px'
              }}
            />
            <span className="text-nowrap text-truncate" style={{ maxWidth: '100px' }}>{label}</span>
            <span className="ms-2 text-end" style={{ minWidth: '70px' }}>
              ${data.values[index].toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
