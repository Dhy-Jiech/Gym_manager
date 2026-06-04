<template>
  <div class="space-y-6">
    <PageHeader 
      title="Quản Lý Hội Viên" 
      subtitle="Danh sách và thông tin hội viên"
      actionText="Thêm Hội Viên Mới"
      actionIcon="Plus"
      @action="$router.push('/members/new')"
    />

    <DataTable
      :data="members"
      :loading="loading"
      :total="total"
      v-model:page="page"
      v-model:limit="limit"
      @search="handleSearch"
      class="min-h-[500px]"
    >
      <template #toolbar>
        <el-select v-model="filterStatus" placeholder="Trạng thái" clearable @change="fetchData" class="w-32">
          <el-option label="Hoạt động" value="true" />
          <el-option label="Tạm ngưng" value="false" />
        </el-select>
        <el-select v-model="filterGender" placeholder="Giới tính" clearable @change="fetchData" class="w-28">
          <el-option label="Nam" value="MALE" />
          <el-option label="Nữ" value="FEMALE" />
        </el-select>
        <el-button @click="fetchData">
          <el-icon><Refresh /></el-icon>
        </el-button>
      </template>

      <el-table-column label="Hội viên" min-width="250">
        <template #default="{ row }">
          <div class="flex items-center gap-3">
            <img :src="row.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${row.memberCode}`" class="w-10 h-10 rounded-full border border-gray-200" />
            <div>
              <div class="font-medium text-gray-900 dark:text-white">{{ row.fullName }}</div>
              <div class="text-xs text-gray-500">{{ row.memberCode }}</div>
            </div>
          </div>
        </template>
      </el-table-column>
      
      <el-table-column label="Liên hệ" min-width="150">
        <template #default="{ row }">
          <div class="text-sm">
            <div>{{ row.phone }}</div>
            <div class="text-xs text-gray-500">{{ row.email || '—' }}</div>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="Gói tập hiện tại" min-width="180">
        <template #default="{ row }">
          <div v-if="row.memberships?.length > 0">
            <span class="badge-purple">{{ row.memberships[0].plan.name }}</span>
            <div class="text-xs text-gray-500 mt-1">HSD: {{ formatDate(row.memberships[0].endDate) }}</div>
          </div>
          <span v-else class="text-xs text-gray-400">Không có gói active</span>
        </template>
      </el-table-column>

      <el-table-column label="Trạng thái" width="120">
        <template #default="{ row }">
          <span :class="row.isActive ? 'badge-green' : 'badge-red'">
            {{ row.isActive ? 'Hoạt động' : 'Tạm ngưng' }}
          </span>
        </template>
      </el-table-column>

      <el-table-column label="Hành động" width="120" align="right">
        <template #default="{ row }">
          <div class="flex items-center justify-end gap-2">
            <el-tooltip content="Xem chi tiết" placement="top">
              <el-button size="small" circle @click="$router.push(`/members/${row.id}`)">
                <el-icon><View /></el-icon>
              </el-button>
            </el-tooltip>
            <el-dropdown trigger="click">
              <el-button size="small" circle>
                <el-icon><More /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="$router.push(`/members/${row.id}/edit`)">
                    <el-icon><Edit /></el-icon> Sửa thông tin
                  </el-dropdown-item>
                  <el-dropdown-item @click="handleCheckin(row)">
                    <el-icon><Location /></el-icon> Check-in ngay
                  </el-dropdown-item>
                  <el-dropdown-item divided type="danger" @click="handleDelete(row.id)">
                    <el-icon><Delete /></el-icon> Xoá
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </template>
      </el-table-column>
    </DataTable>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { membersApi } from '@/api/endpoints'
import PageHeader from '@/components/common/PageHeader.vue'
import DataTable from '@/components/common/DataTable.vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import dayjs from 'dayjs'

const members = ref([])
const loading = ref(false)
const total = ref(0)
const page = ref(1)
const limit = ref(20)
const searchStr = ref('')
const filterStatus = ref('')
const filterGender = ref('')

const formatDate = (date) => dayjs(date).format('DD/MM/YYYY')

const fetchData = async () => {
  loading.value = true
  try {
    const params = {
      page: page.value,
      limit: limit.value,
      search: searchStr.value,
      isActive: filterStatus.value,
      gender: filterGender.value
    }
    const res = await membersApi.getAll(params)
    members.value = res.data.data
    total.value = res.data.meta.total
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

const handleSearch = (val) => {
  searchStr.value = val
  page.value = 1
  fetchData()
}

const handleDelete = async (id) => {
  try {
    await ElMessageBox.confirm('Hội viên sẽ bị đánh dấu ngừng hoạt động. Bạn có chắc chắn không?', 'Cảnh báo', { type: 'warning' })
    await membersApi.delete(id)
    ElMessage.success('Xoá thành công')
    fetchData()
  } catch (e) {
    // cancelled
  }
}

const handleCheckin = (row) => {
  // redirect or open modal
  ElMessage.info(`Gửi yêu cầu check-in thủ công cho ${row.fullName}`)
}

watch([page, limit], () => {
  fetchData()
})

onMounted(() => {
  fetchData()
})
</script>
