'use client'
import { useEffect, useState } from 'react'
import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

const RevenueChart = () => {
  const [textColor, setTextColor] = useState('#000')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const style = getComputedStyle(document.documentElement)
      const color = style.getPropertyValue('--text') || '#000'
      setTextColor(color)
    }
  }, [])

  const data = {
    labels: ['Q1', 'Q2', 'Q3', 'Q4', 'Q5'],
    datasets: [
      {
        label: 'Revenue',
        data: [1500, 2300, 1800, 2700],
        backgroundColor: '#3b82f6',
      },
      {
        label: 'Expenses',
        data: [800, 1200, 2300, 950, 1600],
        backgroundColor: '#ef4444',
      },
    ],
  }

  const options = {
  responsive: true,
  animation: {
    duration: 1200,
    easing: 'easeOutBounce',
  },
  plugins: {
    legend: {
      labels: {
        color: textColor,
      },
    },
    tooltip: {
      mode: 'index',
      intersect: false,
    },
  },
  hover: {
    mode: 'nearest',
    intersect: true,
  },
  scales: {
    x: {
      ticks: { color: textColor },
      grid: { display: false },
    },
    y: {
      ticks: { color: textColor },
      grid: {
        color: 'rgba(0, 0, 0, 0.05)',
      },
    },
  },
}


  return (
    <div className="card shadow-sm border-0">
      <div className="card-body">
        <h5 className="mb-3">💰 Expenses Breakdown</h5>
        <Bar data={data} options={options} />
      </div>
    </div>
  )
}

export default RevenueChart
