<template>
  <div class="relative h-56">
    <Doughnut :data="chartData" :options="options" />
  </div>
</template>

<script setup lang="ts">
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement } from 'chart.js'
import type { ChartOptions } from 'chart.js'
import { Doughnut } from 'vue-chartjs'
import { computed } from 'vue'

ChartJS.register(Title, Tooltip, Legend, ArcElement)

const { labels, values, title } = defineProps<{
  labels: string[]
  values: number[]
  title?: string
}>()

const chartData = computed(() => ({
  labels,
  datasets: [{
    label: title ?? 'Répartition',
    data: values,
    backgroundColor: ['#6366f1', '#2c3340'],
    hoverBackgroundColor: ['#818cf8', '#3a4252'],
    borderWidth: 0,
    spacing: 2
  }]
}))

const options: ChartOptions<'doughnut'> = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '72%',
  plugins: {
    legend: {
      position: 'bottom',
      labels: { color: '#8a919e', boxWidth: 8, boxHeight: 8, usePointStyle: true, padding: 16, font: { size: 12 } }
    },
    tooltip: {
      backgroundColor: '#161a22',
      borderColor: '#2c3340',
      borderWidth: 1,
      titleColor: '#f4f5f7',
      bodyColor: '#b3b9c3',
      padding: 10,
      callbacks: { label: (item) => ` ${Number(item.raw).toFixed(1)} Go` }
    }
  }
}
</script>
