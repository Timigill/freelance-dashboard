'use client'
import { useEffect, useState } from 'react'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend)

const IncomeChart = () => {
  const [textColor, setTextColor] = useState('#000')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const style = getComputedStyle(document.documentElement)
      const color = style.getPropertyValue('--text') || '#000'
      setTextColor(color)
    }
  }, [])

  const data = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr'],
    datasets: [
      {
        label: 'Income',
        data: [500, 1200, 750, 1100],
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#3b82f6',
      },
    ],
  }

 const options = {
  responsive: true,
  animation: {
    duration: 1200,
    easing: 'easeInOutQuart',
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
    <div className="card shadow-sm border-0 mb-4">
      <div className="card-body">
        <h5 className="mb-3">📈 Income Trends</h5>
        <Line data={data} options={options} />
      </div>
    </div>
  )
}

export default IncomeChart
