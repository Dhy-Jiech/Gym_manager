<template>
  <div class="space-y-6">
    <PageHeader 
      title="Báo Cáo Thống Kê" 
      subtitle="Phân tích dữ liệu doanh thu, hội viên và lượt check-in"
      actionText="Xuất Excel"
      actionIcon="Download"
      @action="exportReport"
    />

    <div class="card bg-primary-50 dark:bg-primary-950/20 border-primary-100 dark:border-primary-900/50">
      <div class="flex items-center gap-2 mb-2">
         <el-icon class="text-primary-500"><InfoFilled /></el-icon>
         <h3 class="font-medium text-primary-800 dark:text-primary-300">Tổng quan báo cáo</h3>
      </div>
      <p class="text-sm text-primary-600 dark:text-primary-400">Trang này cung cấp cái nhìn chi tiết qua các biểu đồ về hiệu suất phòng gym của bạn. Bạn có thể xuất các báo cáo chi tiết thành file Excel để sử dụng trong kế toán.</p>
    </div>

    <!-- Charts will go here. For now, placeholders -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      
      <!-- Revenue Chart -->
      <div class="card h-[350px] flex flex-col">
        <div class="flex justify-between items-center mb-4">
          <h3 class="font-semibold text-lg">Phân Tích Doanh Thu</h3>
          <el-select v-model="revenueYear" class="w-32" size="small">
            <el-option label="2023" value="2023" />
            <el-option label="2024" value="2024" />
          </el-select>
        </div>
        <!-- Line Chart -->
        <div class="flex-1 min-h-[300px] w-full mt-2">
           <RevenueLineChart :year="revenueYear" />
        </div>
      </div>

      <!-- Attendance Chart -->
      <div class="card h-[350px] flex flex-col">
        <div class="flex justify-between items-center mb-4">
          <h3 class="font-semibold text-lg">Lượt Check-in Theo Giờ</h3>
          <el-date-picker v-model="attendanceDate" type="date" placeholder="Hôm nay" class="!w-32" size="small" />
        </div>
        <!-- Bar Chart -->
        <div class="flex-1 min-h-[300px] w-full mt-2">
           <AttendanceBarChart :date="attendanceDate" />
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import PageHeader from '@/components/common/PageHeader.vue'
import RevenueLineChart from '@/components/charts/RevenueLineChart.vue'
import AttendanceBarChart from '@/components/charts/AttendanceBarChart.vue'
import { ElMessage } from 'element-plus'

const revenueYear = ref('2024')
const attendanceDate = ref('')

const exportReport = () => {
  ElMessage.success('Đang xử lý tạo file Excel...')
}
</script>
