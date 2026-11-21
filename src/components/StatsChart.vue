<template>
  <div class="relative h-56">
    <Line :data="chartData" :options="options" />
  </div>
</template>

<script setup lang="ts">
import { Chart as ChartJS, Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement, Filler } from 'chart.js'
import type { ChartOptions } from 'chart.js'
import { Line } from 'vue-chartjs'
import { computed } from 'vue'

ChartJS.register(Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement, Filler)

const { label, data, color } = defineProps<{ label: string; data: number[]; color: string }>()

const chartData = computed(() => {
  const recentData = data.slice(-12)
  return {
    labels: recentData.map((_, i) => `${i + 1}`),
    datasets: [{
      label,
      data: recentData,
      borderColor: color,
      borderWidth: 2,
      // Un seul point : on l'affiche, sinon la courbe serait invisible
      pointRadius: recentData.length < 2 ? 3 : 0,
      pointHoverRadius: 4,
      pointBackgroundColor: color,
      fill: true,
      tension: 0.35,
      // Dégradé vertical sous la courbe
      backgroundColor: (ctx: any) => {
        const { chart } = ctx
        if (!chart.chartArea) return `${color}22`
        const gradient = chart.ctx.createLinearGradient(0, chart.chartArea.top, 0, chart.chartArea.bottom)
        gradient.addColorStop(0, `${color}40`)
        gradient.addColorStop(1, `${color}00`)
        return gradient
      }
    }]
  }
})

const options: ChartOptions<'line'> = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: { mode: 'index', intersect: false },
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#161a22',
      borderColor: '#2c3340',
      borderWidth: 1,
      titleColor: '#f4f5f7',
      bodyColor: '#b3b9c3',
      padding: 10,
      displayColors: false,
      callbacks: { label: (item) => `${item.formattedValue} %` }
    }
  },
  scales: {
    x: {
      grid: { display: false },
      border: { display: false },
      ticks: { color: '#5d6573', font: { size: 11 } }
    },
    y: {
      min: 0,
      max: 100,
      grid: { color: '#1f2430' },
      border: { display: false },
      ticks: { color: '#5d6573', font: { size: 11 }, stepSize: 25, callback: (v) => `${v}%` }
    }
  }
}
</script>
