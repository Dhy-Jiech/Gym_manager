<template>
  <div class="space-y-6">
    <PageHeader 
      title="Quản Lý Nhân Viên" 
      subtitle="Quản lý tài khoản và phân quyền cho staff"
      actionText="Thêm Nhân Viên"
      actionIcon="Plus"
      @action="openModal()"
    />

    <DataTable
      :data="users"
      :loading="loading"
      :showPagination="false"
      class="min-h-[400px]"
    >
      <el-table-column label="Người dùng" min-width="250">
        <template #default="{ row }">
           <div class="flex items-center gap-3">
             <img :src="`https://api.dicebear.com/7.x/avataaars/svg?seed=${row.email}`" class="w-10 h-10 rounded-full border border-gray-200" />
             <div>
               <div class="font-medium text-gray-900 dark:text-white">{{ row.fullName }}</div>
               <div class="text-xs text-gray-500">{{ row.email }} - {{ row.phone }}</div>
             </div>
           </div>
        </template>
      </el-table-column>
      
      <el-table-column label="Vai Trò (Role)" width="160">
        <template #default="{ row }">
          <span :class="getRoleBadge(row.role)">{{ row.role }}</span>
        </template>
      </el-table-column>

      <el-table-column label="Trạng Thái" width="120">
        <template #default="{ row }">
          <span :class="row.isActive ? 'badge-green' : 'badge-red'">
            {{ row.isActive ? 'Hoạt động' : 'Đã khóa' }}
          </span>
        </template>
      </el-table-column>

      <el-table-column label="Hành động" width="100" align="right">
        <template #default="{ row }">
          <div class="flex items-center justify-end gap-2">
            <el-button size="small" circle @click="openModal(row)"><el-icon><Edit /></el-icon></el-button>
          </div>
        </template>
      </el-table-column>
    </DataTable>

    <el-dialog v-model="modalVisible" :title="isEdit ? 'Sửa Nhân Viên' : 'Thêm Nhân Viên'" width="500px">
       <div class="text-sm text-gray-500 p-4 text-center">Form sửa role, khoá/mở khoá tài khoản</div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import PageHeader from '@/components/common/PageHeader.vue'
import DataTable from '@/components/common/DataTable.vue'
import api from '@/composables/useApi'

const users = ref([])
const loading = ref(false)
const modalVisible = ref(false)
const isEdit = ref(false)

const getRoleBadge = (role) => {
  const map = {
    'SUPER_ADMIN': 'badge-purple',
    'ADMIN': 'badge-primary',
    'MANAGER': 'badge-warning',
    'STAFF': 'badge-green',
    'TRAINER': 'badge-orange',
  }
  return map[role] || 'badge-gray'
}

const fetchData = async () => {
  loading.value = true
  try {
    const res = await api.get('/users') // direct access
    users.value = res.data.data
  } catch (err) { console.error(err) } finally { loading.value = false }
}

const openModal = (row = null) => { 
  isEdit.value = !!row
  modalVisible.value = true 
}

onMounted(fetchData)
</script>
