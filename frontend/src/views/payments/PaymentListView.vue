<template>
  <div class="space-y-6">
    <PageHeader 
      title="Quản Lý Thanh Toán" 
      subtitle="Theo dõi hóa đơn, biên lai và trạng thái thanh toán"
      actionText="Tạo Hóa Đơn Mới"
      actionIcon="Plus"
      @action="openModal()"
    />

    <DataTable
      :data="payments"
      :loading="loading"
      :total="total"
      v-model:page="page"
      v-model:limit="limit"
      @search="handleSearch"
      class="min-h-[400px]"
    >
      <el-table-column label="Mã GD" width="120">
        <template #default="{ row }">
          <span class="font-mono text-sm uppercase text-gray-500">{{ row.referenceCode }}</span>
        </template>
      </el-table-column>
      
      <el-table-column label="Hội Viên / Khách hàng" min-width="200">
        <template #default="{ row }">
           <div v-if="row.member">
             <div class="font-medium text-gray-900 dark:text-white">{{ row.member.fullName }}</div>
             <div class="text-xs text-gray-500">{{ row.member.phone }}</div>
           </div>
           <span v-else class="text-gray-400">Khách lẻ</span>
        </template>
      </el-table-column>

      <el-table-column label="Số Tiền" width="150" align="right">
        <template #default="{ row }">
          <span class="font-bold text-primary-600 dark:text-primary-400">
            {{ new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(row.amount) }}
          </span>
        </template>
      </el-table-column>

      <el-table-column label="Phương thức" width="150">
        <template #default="{ row }">
          <div class="flex items-center gap-2">
            <img v-if="row.method === 'VNPAY'" src="https://vnpay.vn/s1/statics.vnpay.vn/2023/8/oxxyktdzzy2411928045339_c2998ae7.png" class="h-4" />
            <img v-else-if="row.method === 'MOMO'" src="https://upload.wikimedia.org/wikipedia/vi/f/fe/MoMo_Logo.png" class="h-4" />
            <el-icon v-else-if="row.method === 'CASH'" class="text-green-600"><Money /></el-icon>
            <el-icon v-else class="text-blue-600"><CreditCard /></el-icon>
            <span class="text-xs font-medium">{{ row.method }}</span>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="Thời gian" width="160">
         <template #default="{ row }">
            <span class="text-sm">{{ dayjs(row.paidAt).format('HH:mm DD/MM/YYYY') }}</span>
         </template>
      </el-table-column>

      <el-table-column label="Trạng Thái" width="120" align="right">
        <template #default="{ row }">
          <span :class="row.status === 'COMPLETED' ? 'badge-green' : row.status === 'PENDING' ? 'badge-yellow' : 'badge-red'">
            {{ row.status }}
          </span>
        </template>
      </el-table-column>
    </DataTable>

    <el-dialog v-model="modalVisible" title="Tạo Hóa Đơn Trực Tiếp" width="500px">
       <div class="text-sm text-gray-500 p-4 text-center">Thanh toán hóa đơn lẻ (POS) đang phát triển... Hãy đăng ký qua trang Hội Viên.</div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { paymentsApi } from '@/api/endpoints'
import PageHeader from '@/components/common/PageHeader.vue'
import DataTable from '@/components/common/DataTable.vue'
import dayjs from 'dayjs'

const payments = ref([])
const loading = ref(false)
const total = ref(0)
const page = ref(1)
const limit = ref(20)
const searchStr = ref('')

const modalVisible = ref(false)

const fetchData = async () => {
  loading.value = true
  try {
    const res = await paymentsApi.getAll({ page: page.value, limit: limit.value, search: searchStr.value })
    payments.value = res.data.data
    total.value = res.data.meta.total
  } catch (err) { console.error(err) } finally { loading.value = false }
}

const handleSearch = (val) => { searchStr.value = val; page.value = 1; fetchData() }
const openModal = () => { modalVisible.value = true }

watch([page, limit], fetchData)
onMounted(fetchData)
</script>
