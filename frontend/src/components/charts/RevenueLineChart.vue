<template>
  <LineChart :data="chartData" :options="chartOptions" />
</template>

<script setup>
import { Line as LineChart } from 'vue-chartjs'
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend, 
  Filler 
} from 'chart.js'
import { ref, watch } from 'vue'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

const props = defineProps({
  year: { type: String, default: '2024' },
  data: { type: Array, default: () => [] } // format: [monthIndex, value]
})

// Mock data generator for now
const generateMockData = (y) => {
  return [
    45000000, 52000000, 38000000, 60000000, 49000000, 75000000, 
    80000000, 65000000, 55000000, y === '2024' ? 62000000 : 45000000, 
    y === '2024' ? 70000000 : 40000000, y === '2024' ? 95000000 : 80000000
  ]
}

const chartData = ref({
  labels: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'],
  datasets: [{
    label: 'Doanh thu (VNĐ)',
    backgroundColor: 'rgba(26, 115, 232, 0.1)',
    borderColor: '#1a73e8',
    data: generateMockData(props.year),
    fill: true,
    tension: 0.4,
    pointBackgroundColor: '#fff',
    pointBorderColor: '#1a73e8',
    pointBorderWidth: 2,
    pointRadius: 4,
    pointHoverRadius: 6
  }]
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: function(context) {
          let label = context.dataset.label || '';
          if (label) { label += ': '; }
          if (context.parsed.y !== null) {
            label += new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(context.parsed.y);
          }
          return label;
        }
      }
    }
  },
  scales: {
    y: { 
      beginAtZero: true,
      grid: { borderDash: [4, 4], color: 'rgba(0,0,0,0.05)' },
      ticks: {
        callback: function(value) { return value / 1000000 + ' Tr'; }
      }
    },
    x: { grid: { display: false } }
  }
}

watch(() => props.year, (newYear) => {
  // Update mock data when year changes
  chartData.value = {
    ...chartData.value,
    datasets: [{
      ...chartData.value.datasets[0],
      data: generateMockData(newYear)
    }]
  }
})
</script>
