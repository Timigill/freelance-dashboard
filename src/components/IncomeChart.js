'use client'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement
} from 'chart.js'

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement)

export default function IncomeChart() {
  const data = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr'],
    datasets: [
      {
        label: 'Income',
        data: [500, 1200, 750, 1100],
        borderColor: '#0d6efd',
        fill: false
      }
    ]
  }

  const options = {
    responsive: true,
    scales: {
      y: { beginAtZero: true }
    }
  }

  return <Line data={data} options={options} />
}
