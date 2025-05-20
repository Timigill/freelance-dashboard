'use client'
import { useEffect, useRef } from 'react'
import Chart from 'chart.js/auto'

export default function ConversionChart() {
  const chartRef = useRef(null)
  const chartInstanceRef = useRef(null)

  useEffect(() => {
    if (chartRef.current) {
      chartInstanceRef.current = new Chart(chartRef.current, {
        type: 'line',
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          datasets: [{
            label: 'Conversion Rate',
            data: [22, 25, 20, 30, 28, 33],
            borderColor: '#20c997',
            fill: false,
            tension: 0.4
          }]
        }
      })
    }
    return () => {
      // Cleanup chart instance on unmount
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy()
      }
    }
  }, [])

  return (
    <div className="card p-3 shadow-sm">
      <h6 className="mb-3">Conversion Trends</h6>
      <canvas ref={chartRef} height="200"></canvas>
    </div>
  )
}
