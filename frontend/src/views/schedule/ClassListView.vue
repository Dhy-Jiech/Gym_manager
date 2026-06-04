<template>
  <div class="space-y-6">
    <PageHeader 
      title="Danh Mục Lớp Học" 
      subtitle="Quản lý các loại lớp Yoga, HIIT, Zumba..."
      actionText="Thêm Lớp Học"
      actionIcon="Plus"
      @action="openModal()"
    />

    <DataTable
      :data="classes"
      :loading="loading"
      :showPagination="false"
      class="min-h-[400px]"
    >
      <el-table-column label="Tên Lớp" min-width="200">
        <template #default="{ row }">
          <div class="font-medium text-primary-600 dark:text-primary-400">{{ row.name }}</div>
          <div class="text-xs text-gray-500 line-clamp-1" :title="row.description">{{ row.description || '—' }}</div>
        </template>
      </el-table-column>
      
      <el-table-column label="HLV Phụ Trách" width="200">
        <template #default="{ row }">
          <div class="flex items-center gap-2" v-if="row.trainer">
             <div class="w-6 h-6 rounded-full bg-gray-200"></div>
             <span class="text-sm">{{ row.trainer.user.fullName }}</span>
          </div>
          <span v-else class="text-gray-400 text-sm">Chưa phân công</span>
        </template>
      </el-table-column>

      <el-table-column label="Thời Lượng" width="120">
        <template #default="{ row }"><span>{{ row.durationMin }} phút</span></template>
      </el-table-column>
      
      <el-table-column label="Sức Chứa" width="100">
        <template #default="{ row }"><span>{{ row.capacity }} người</span></template>
      </el-table-column>

      <el-table-column label="Phòng Tập" width="150">
        <template #default="{ row }"><span>{{ row.location || '—' }}</span></template>
      </el-table-column>

      <el-table-column label="Trạng Thái" width="120">
        <template #default="{ row }">
          <span :class="row.isActive ? 'badge-green' : 'badge-red'">
            {{ row.isActive ? 'Hoạt động' : 'Tạm ngưng' }}
          </span>
        </template>
      </el-table-column>
    </DataTable>

    <!-- Modal Form (Mock logic) -->
    <el-dialog v-model="modalVisible" title="Thêm Lớp Học" width="500px">
      <el-form label-position="top">
        <el-form-item label="Tên lớp"><el-input v-model="form.name" /></el-form-item>
        <el-form-item label="HLV Phụ trách">
           <el-select v-model="form.trainerId" class="w-full" placeholder="Chọn HLV">
             <el-option v-for="t in trainers" :key="t.id" :label="t.user.fullName" :value="t.id" />
           </el-select>
        </el-form-item>
        <div class="grid grid-cols-2 gap-4">
          <el-form-item label="Sức chứa"><el-input-number v-model="form.capacity" class="!w-full" /></el-form-item>
          <el-form-item label="Thời lượng (Phút)"><el-input-number v-model="form.durationMin" class="!w-full" /></el-form-item>
        </div>
      </el-form>
      <template #footer>
        <el-button @click="modalVisible = false">Hủy</el-button>
        <el-button type="primary" @click="submitForm">Lưu</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import { classesApi, trainersApi } from '@/api/endpoints'
import PageHeader from '@/components/common/PageHeader.vue'
import DataTable from '@/components/common/DataTable.vue'
import { ElMessage } from 'element-plus'

const classes = ref([])
const trainers = ref([])
const loading = ref(false)
const modalVisible = ref(false)
const form = reactive({ name: '', trainerId: '', capacity: 20, durationMin: 60, location: '', level: 'ALL', isActive: true })

const fetchData = async () => {
  loading.value = true
  try {
    const [cRes, tRes] = await Promise.all([classesApi.getAll(), trainersApi.getAll()])
    classes.value = cRes.data.data
    trainers.value = tRes.data.data
  } catch (err) { console.error(err) } finally { loading.value = false }
}

const openModal = () => { modalVisible.value = true }
const submitForm = async () => {
  try {
    await classesApi.create(form)
    ElMessage.success('Thành công')
    modalVisible.value = false
    fetchData()
  } catch (e) {}
}

onMounted(fetchData)
</script>
