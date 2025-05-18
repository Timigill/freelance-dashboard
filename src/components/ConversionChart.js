'use client'
import { useEffect } from 'react'
import Chart from 'chart.js/auto'

export default function ConversionChart() {
  useEffect(() => {
    new Chart(document.getElementById('conversionChart'), {
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
  }, [])

  return (
    <div className="card p-3 shadow-sm">
      <h6 className="mb-3">Conversion Trends</h6>
      <canvas id="conversionChart" height="200"></canvas>
    </div>
  )
}
