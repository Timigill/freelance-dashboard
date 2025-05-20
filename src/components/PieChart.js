'use client'
import { useEffect, useRef } from 'react'
import Chart from 'chart.js/auto'

export default function PieChart() {
  const chartRef = useRef(null)
  const chartInstanceRef = useRef(null)

  useEffect(() => {
    if (chartRef.current) {
      // Destroy existing chart instance if it exists to prevent overlap
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy()
      }
      chartInstanceRef.current = new Chart(chartRef.current, {
        type: 'pie',
        data: {
          labels: ['Marketing', 'Operations', 'Dev', 'Sex', 'Other'],
          datasets: [{
            data: [3000, 1500, 2500, 1000, 2000],
            backgroundColor: ['#0d6efd', '#20c997', '#ffc107', '#dc3545', '#6c757d']
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
  }, [])

  const labels = [
    { name: 'Marketing', value: 3000, color: '#034efd' },
    { name: 'Operations', value: 1500, color: '#202e97' },
    { name: 'Dev', value: 2500, color: '#ffc107' },
    { name: 'Sex', value: 1000, color: '#dc3545' },
    { name: 'Other', value: 2000, color: '#6c757d' }
  ]

  return (
    <div className="card p-3 shadow-sm">
      <h6 className="mb-3">📊 Budget Allocation</h6>
      <div className="row">
        {/* Pie Chart */}
        <div className="col-6" style={{ height: '150px' }}>
          <canvas ref={chartRef} width="100%" height="100%" />
        </div>

        {/* Labels */}
        <div className="col-6 d-flex flex-column justify-content-center">
          {labels.map((item, index) => (
            <div key={index} className="d-flex align-items-center mb-2">
              <div
                style={{
                  width: '10px',
                  height: '10px',
                  backgroundColor: item.color,
                  borderRadius: '50%',
                  marginRight: '10px'
                }}
              />
              <span style={{ width: '100px', fontSize: "14px" }}>{item.name}:</span>
              <span className="ms-2" style={{ fontSize: "14px" }}>{item.value.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
