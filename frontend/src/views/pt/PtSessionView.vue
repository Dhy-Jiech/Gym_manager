<template>
  <div class="space-y-6">
    <PageHeader 
      title="Buổi Tập Cá Nhân (PT)" 
      subtitle="Quản lý lịch tập 1 kèm 1 giữa HLV và Hội viên"
      actionText="Lên Lịch PT Mới"
      actionIcon="Plus"
      @action="openModal()"
    />

    <DataTable
      :data="sessions"
      :loading="loading"
      :total="total"
      v-model:page="page"
      v-model:limit="limit"
      @search="handleSearch"
      class="min-h-[400px]"
    >
      <el-table-column label="Thời gian" width="180">
        <template #default="{ row }">
          <div class="font-medium">{{ dayjs(row.startAt).format('HH:mm DD/MM/YYYY') }}</div>
          <div class="text-xs text-gray-500">Đến: {{ dayjs(row.endAt).format('HH:mm') }}</div>
        </template>
      </el-table-column>
      
      <el-table-column label="Hội Viên">
        <template #default="{ row }">
          <div class="flex items-center gap-2">
             <div class="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs"><el-icon><User /></el-icon></div>
             <span>{{ row.member?.fullName || '—' }}</span>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="Huấn Luyện Viên">
        <template #default="{ row }">
          <div class="flex items-center gap-2">
             <div class="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 text-xs"><el-icon><Medal /></el-icon></div>
             <span>{{ row.trainer?.user?.fullName || '—' }}</span>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="Nội dung" min-width="150">
         <template #default="{ row }">
            <span class="text-sm line-clamp-2" :title="row.notes">{{ row.notes || '—' }}</span>
         </template>
      </el-table-column>

      <el-table-column label="Trạng Thái" width="120">
        <template #default="{ row }">
          <span :class="getStatusBadge(row.status)">
            {{ row.status }}
          </span>
        </template>
      </el-table-column>
    </DataTable>

    <el-dialog v-model="modalVisible" title="Lên Lịch PT" width="500px">
       <div class="text-sm text-gray-500 p-4 text-center">Form chọn HLV, Hội Viên, Ngày giờ</div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { ptApi } from '@/api/endpoints'
import PageHeader from '@/components/common/PageHeader.vue'
import DataTable from '@/components/common/DataTable.vue'
import dayjs from 'dayjs'

const sessions = ref([])
const loading = ref(false)
const total = ref(0)
const page = ref(1)
const limit = ref(20)
const searchStr = ref('')

const modalVisible = ref(false)

const getStatusBadge = (status) => {
  const map = {
    'SCHEDULED': 'badge-blue',
    'COMPLETED': 'badge-green',
    'CANCELLED': 'badge-red',
    'NO_SHOW': 'badge-gray'
  }
  return map[status] || 'badge-gray'
}

const fetchData = async () => {
  loading.value = true
  try {
    const res = await ptApi.getAll({ page: page.value, limit: limit.value, search: searchStr.value })
    sessions.value = res.data.data
    total.value = res.data.meta.total
  } catch (err) { console.error(err) } finally { loading.value = false }
}

const handleSearch = (val) => { searchStr.value = val; page.value = 1; fetchData() }
const openModal = () => { modalVisible.value = true }

watch([page, limit], fetchData)
onMounted(fetchData)
</script>
