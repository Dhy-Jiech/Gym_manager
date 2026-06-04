<template>
  <div class="space-y-6">
    <PageHeader 
      title="Huấn Luyện Viên" 
      subtitle="Quản lý thông tin và lịch làm việc của HLV"
      actionText="Thêm Huấn Luyện Viên"
      actionIcon="Plus"
      @action="openModal()"
    />

    <DataTable
      :data="trainers"
      :loading="loading"
      :showPagination="false"
      class="min-h-[400px]"
    >
      <el-table-column label="Thông tin HLV" min-width="250">
        <template #default="{ row }">
           <div class="flex items-center gap-3">
             <img :src="`https://api.dicebear.com/7.x/avataaars/svg?seed=${row.user.email}`" class="w-10 h-10 rounded-full bg-primary-100" />
             <div>
               <div class="font-medium text-gray-900 dark:text-white">{{ row.user.fullName }}</div>
               <div class="text-xs text-gray-500">{{ row.user.email }} - {{ row.user.phone }}</div>
             </div>
           </div>
        </template>
      </el-table-column>
      
      <el-table-column label="Chuyên Môn" min-width="150">
        <template #default="{ row }">
          <span class="text-sm line-clamp-2" :title="row.specialization">{{ row.specialization }}</span>
        </template>
      </el-table-column>

      <el-table-column label="Giá PT/Giờ" width="150">
        <template #default="{ row }">
          <span class="font-semibold text-primary-600 dark:text-primary-400">
            {{ new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(row.hourlyRate) }}
          </span>
        </template>
      </el-table-column>

      <el-table-column label="Trạng Thái" width="120">
        <template #default="{ row }">
          <span :class="row.isAvailable ? 'badge-green' : 'badge-red'">
            {{ row.isAvailable ? 'Sẵn sàng' : 'Không trống lịch' }}
          </span>
        </template>
      </el-table-column>

      <el-table-column label="Hành động" width="100" align="right">
        <template #default="{ row }">
          <el-button size="small" circle tooltip="Xem lịch"><el-icon><Calendar /></el-icon></el-button>
        </template>
      </el-table-column>
    </DataTable>

    <el-dialog v-model="modalVisible" title="Thêm HLV Mới" width="500px">
       <div class="text-sm text-gray-500 p-4 text-center">Form thêm user role TRAINER + tạo profile Trainer</div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { trainersApi } from '@/api/endpoints'
import PageHeader from '@/components/common/PageHeader.vue'
import DataTable from '@/components/common/DataTable.vue'

const trainers = ref([])
const loading = ref(false)
const modalVisible = ref(false)

const fetchData = async () => {
  loading.value = true
  try {
    const res = await trainersApi.getAll()
    trainers.value = res.data.data
  } catch (err) { console.error(err) } finally { loading.value = false }
}

const openModal = () => { modalVisible.value = true }

onMounted(fetchData)
</script>
