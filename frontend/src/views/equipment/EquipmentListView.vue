<template>
  <div class="space-y-6">
    <PageHeader 
      title="Thiết Bị & Tài Sản" 
      subtitle="Quản lý danh mục thiết bị, bảo trì, sửa chữa"
      actionText="Nhập Thiết Bị"
      actionIcon="Plus"
      @action="openModal()"
    />

    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-2 -mt-4">
      <StatCard title="Tổng Thiết Bị" :value="kpis.total" icon="Box" color="primary" class="card-sm" />
      <StatCard title="Đang Khấu Hao" :value="kpis.active" icon="Timer" color="success" class="card-sm" />
      <StatCard title="Cần Bảo Trì" :value="kpis.maintenance" icon="Tools" color="warning" class="card-sm" />
      <StatCard title="Hỏng Hóc" :value="kpis.broken" icon="WarningFilled" color="danger" class="card-sm" />
    </div>

    <DataTable
      :data="equipment"
      :loading="loading"
      :total="total"
      v-model:page="page"
      v-model:limit="limit"
      @search="handleSearch"
      class="min-h-[400px]"
    >
      <el-table-column label="Tên Thiết Bị" min-width="200">
        <template #default="{ row }">
          <div class="font-medium text-gray-900 dark:text-white">{{ row.name }}</div>
          <div class="text-xs text-gray-500">{{ row.category || '—' }} - Kho: {{ row.location || '—' }}</div>
        </template>
      </el-table-column>
      
      <el-table-column label="Nhập Hàng" width="140">
        <template #default="{ row }">
           <div class="text-sm">{{ row.purchaseDate ? dayjs(row.purchaseDate).format('DD/MM/YYYY') : '—' }}</div>
           <div class="text-xs font-bold text-gray-600 dark:text-gray-400 mt-1" v-if="row.purchasePrice">
             {{ new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(row.purchasePrice) }}
           </div>
        </template>
      </el-table-column>

      <el-table-column label="Bảo Trì Tiếp Theo" width="160">
        <template #default="{ row }">
          <div :class="isLate(row.nextMaintenanceAt) ? 'text-red-500 font-medium' : 'text-gray-900 dark:text-gray-300'">
             {{ row.nextMaintenanceAt ? dayjs(row.nextMaintenanceAt).format('DD/MM/YYYY') : '—' }}
          </div>
        </template>
      </el-table-column>

      <el-table-column label="Trạng Thái" width="140" align="right">
        <template #default="{ row }">
          <span :class="getStatusBadge(row.status)">{{ getStatusLabel(row.status) }}</span>
        </template>
      </el-table-column>
    </DataTable>

    <el-dialog v-model="modalVisible" title="Nhập Thiết Bị" width="500px">
       <div class="text-sm text-gray-500 p-4 text-center">Form nhập kho, giá mua, ngày mua và chu kỳ bảo trì...</div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { equipmentApi } from '@/api/endpoints'
import PageHeader from '@/components/common/PageHeader.vue'
import DataTable from '@/components/common/DataTable.vue'
import StatCard from '@/components/common/StatCard.vue'
import dayjs from 'dayjs'

const equipment = ref([])
const loading = ref(false)
const total = ref(0)
const page = ref(1)
const limit = ref(20)
const searchStr = ref('')

const modalVisible = ref(false)

const kpis = computed(() => {
  return {
    total: equipment.value.length,
    active: equipment.value.filter(x => x.status === 'ACTIVE').length,
    maintenance: equipment.value.filter(x => x.status === 'MAINTENANCE').length,
    broken: equipment.value.filter(x => x.status === 'BROKEN').length,
  }
})

const getStatusBadge = (status) => {
  const map = { 'ACTIVE': 'badge-green', 'MAINTENANCE': 'badge-yellow', 'BROKEN': 'badge-red', 'RETIRED': 'badge-gray' }
  return map[status] || 'badge-gray'
}
const getStatusLabel = (status) => {
  const map = { 'ACTIVE': 'Bình thường', 'MAINTENANCE': 'Bảo trì', 'BROKEN': 'Hỏng', 'RETIRED': 'Thanh lý' }
  return map[status] || status
}

const isLate = (dateStr) => {
  if (!dateStr) return false
  return dayjs(dateStr).isBefore(dayjs(), 'day')
}

const fetchData = async () => {
  loading.value = true
  try {
    const res = await equipmentApi.getAll({ page: page.value, limit: limit.value, search: searchStr.value })
    equipment.value = res.data.data
    total.value = res.data.meta.total
  } catch (err) { console.error(err) } finally { loading.value = false }
}

const handleSearch = (val) => { searchStr.value = val; page.value = 1; fetchData() }
const openModal = () => { modalVisible.value = true }

watch([page, limit], fetchData)
onMounted(fetchData)
</script>
