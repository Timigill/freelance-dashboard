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

const IncomeChart = ({ monthlyData }) => {
  const [textColor, setTextColor] = useState('#000')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const style = getComputedStyle(document.documentElement)
      const color = style.getPropertyValue('--text') || '#000'
      setTextColor(color)
    }
  }, [])

  const labels = (monthlyData && monthlyData.labels) || []
  const values = (monthlyData && monthlyData.values) || []

  const data = {
    labels,
    datasets: [
      {
        label: 'Income',
        data: values,
        borderColor: '#352359',
        backgroundColor: 'rgba(53, 35, 89, 0.12)',
        fill: true,
        tension: 0.35,
        pointBackgroundColor: '#352359',
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
      display: false,
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


  // Render only the chart itself (no extra card or heading) so the parent
  // page's card/title sits flush above the chart with no extra spacing.
  return (
    <div className="p-0 m-0">
      <Line data={data} options={options} />
    </div>
  )
}

export default IncomeChart
