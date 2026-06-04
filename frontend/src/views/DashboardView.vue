<template>
  <div class="space-y-6">
    <PageHeader title="Dashboard" subtitle="Tổng quan tình hình hoạt động" />
    
    <!-- KPI Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard 
        title="Tổng Doanh Thu" 
        :value="data.kpi?.monthRevenue || 0" 
        icon="Money" 
        color="success"
        :isCurrency="true"
        :trend="12.5"
        :loading="loading"
        hoverable
      />
      <StatCard 
        title="Hội Viên Mới" 
        :value="data.kpi?.newMembersThisMonth || 0" 
        icon="UserFilled" 
        color="primary"
        :trend="5.2"
        :loading="loading"
      />
      <StatCard 
        title="Check-in Hôm Nay" 
        :value="data.kpi?.todayCheckIns || 0" 
        icon="DataLine" 
        color="warning"
        :loading="loading"
      />
      <StatCard 
        title="Sắp Hết Hạn (7 ngày)" 
        :value="data.kpi?.expiringIn7Days || 0" 
        icon="Warning" 
        color="danger"
        :loading="loading"
      />
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
      <!-- Main Chart Area -->
      <div class="lg:col-span-2 space-y-6">
        <div class="card h-[400px] flex flex-col">
          <div class="flex justify-between items-center mb-4">
            <h3 class="font-semibold text-lg">Doanh Thu 12 Tháng</h3>
            <el-select v-model="chartYear" class="w-32" size="small">
              <el-option label="2023" value="2023" />
              <el-option label="2024" value="2024" />
            </el-select>
          </div>
          <!-- Revenue Line Chart -->
          <div class="flex-1 min-h-[300px] w-full mt-2">
             <RevenueLineChart :year="chartYear" />
          </div>
        </div>
      </div>

      <!-- Sidebar Area -->
      <div class="space-y-6">
        <!-- Recent Check-ins -->
        <div class="card">
          <h3 class="font-semibold text-lg mb-4">Check-in Gần Đây</h3>
          <div v-if="loading" class="space-y-3">
            <div v-for="i in 5" :key="i" class="flex gap-3">
              <div class="w-10 h-10 rounded-full skeleton shrink-0"></div>
              <div class="flex-1 space-y-2 mt-1">
                <div class="h-4 w-3/4 skeleton"></div>
                <div class="h-3 w-1/2 skeleton"></div>
              </div>
            </div>
          </div>
          <div v-else-if="!data.recentCheckIns?.length" class="text-center text-gray-400 py-4 text-sm">
            Không có hoạt động
          </div>
          <div v-else class="space-y-4">
            <div v-for="checkin in data.recentCheckIns" :key="checkin.id" class="flex items-center gap-3">
              <img :src="checkin.member.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${checkin.member.memberCode}`" class="w-10 h-10 rounded-full bg-gray-100" />
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-900 dark:text-white truncate">{{ checkin.member.fullName }}</p>
                <p class="text-xs text-gray-500">{{ checkin.member.memberCode }}</p>
              </div>
              <div class="text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400 px-2 py-1 rounded">
                {{ formatTime(checkin.checkinAt) }}
              </div>
            </div>
          </div>
        </div>
        
        <!-- Action Required -->
        <div class="card bg-orange-50/50 dark:bg-orange-950/20 border-orange-100 dark:border-orange-900/50">
          <h3 class="font-semibold text-lg mb-4 text-orange-800 dark:text-orange-400">Cần Xử Lý</h3>
          <ul class="space-y-3 text-sm">
            <li class="flex items-center justify-between">
              <span class="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                <el-icon class="text-orange-500"><Warning /></el-icon> Hội viên sửa hết hạn
              </span>
              <span class="font-bold text-orange-600">{{ data.kpi?.expiringIn7Days || 0 }}</span>
            </li>
            <li class="flex items-center justify-between">
              <span class="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                <el-icon class="text-red-500"><Tools /></el-icon> Thiết bị cần bảo trì
              </span>
              <span class="font-bold text-red-600">{{ data.kpi?.maintenanceDue || 0 }}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { reportsApi } from '@/api/endpoints'
import PageHeader from '@/components/common/PageHeader.vue'
import StatCard from '@/components/common/StatCard.vue'
import RevenueLineChart from '@/components/charts/RevenueLineChart.vue'
import dayjs from 'dayjs'

const loading = ref(true)
const data = ref({})
const chartYear = ref('2024')

const formatTime = (isoString) => dayjs(isoString).format('HH:mm')

const fetchData = async () => {
  try {
    const res = await reportsApi.getDashboard()
    data.value = res.data.data
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchData()
})
</script>
