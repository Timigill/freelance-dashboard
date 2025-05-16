'use client'
import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip)

export default function RevenueChart() {
  const data = {
    labels: ['Q1', 'Q2', 'Q3', 'Q4'],
    datasets: [
      {
        label: 'Revenue',
        data: [1500, 2300, 1800, 2700],
        backgroundColor: '#0d6efd'
      },
      {
        label: 'Expenses',
        data: [800, 1200, 950, 1600],
        backgroundColor: '#dc3545'
      }
    ]
  }

  const options = {
    responsive: true,
    plugins: { legend: { position: 'bottom' } }
  }

  return <Bar data={data} options={options} />
}
