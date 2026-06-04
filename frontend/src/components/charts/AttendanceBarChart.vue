<template>
  <BarChart :data="chartData" :options="chartOptions" />
</template>

<script setup>
import { Bar as BarChart } from 'vue-chartjs'
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js'
import { ref, watch } from 'vue'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const props = defineProps({
  date: { type: String, default: '' }
})

// Mock data generator
const generateMockData = () => {
  return [5, 12, 18, 30, 45, 55, 40, 25, 48, 65, 80, 45, 30, 15]
}

const chartData = ref({
  labels: ['06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'],
  datasets: [{
    label: 'Lượt Check-in',
    backgroundColor: '#ff6b35', // accent color
    borderRadius: 4,
    data: generateMockData(),
  }]
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    y: { 
      beginAtZero: true,
      grid: { borderDash: [4, 4], color: 'rgba(0,0,0,0.05)' },
    },
    x: { grid: { display: false } }
  }
}

watch(() => props.date, () => {
  // Update mock data
  chartData.value = {
    ...chartData.value,
    datasets: [{ ...chartData.value.datasets[0], data: generateMockData().map(x => x + Math.floor(Math.random()*10 - 5)) }]
  }
})
</script>
