'use client'
import { useEffect } from 'react'
import Chart from 'chart.js/auto'

export default function PieChart() {
  useEffect(() => {
    new Chart(document.getElementById('pieChart'), {
      type: 'pie',
      data: {
        labels: ['Marketing', 'Operations', 'Dev', 'Other'],
        datasets: [{
          data: [3000, 1500, 2500, 1000],
          backgroundColor: ['#0d6efd', '#20c997', '#ffc107', '#dc3545']
        }]
      }
    })
  }, [])

  return (
    <div className="card p-3 shadow-sm">
      <h6 className="mb-3">Budget Allocation</h6>
      <canvas id="pieChart" height="200"></canvas>
    </div>
  )
}
