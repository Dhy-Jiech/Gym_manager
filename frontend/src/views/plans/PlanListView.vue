<template>
  <div class="space-y-6">
    <PageHeader 
      title="Gói Tập (Memberships)" 
      subtitle="Quản lý các gói tập và dịch vụ"
      actionText="Thêm Gói Tập"
      actionIcon="Plus"
      @action="openModal()"
    />

    <DataTable
      :data="plans"
      :loading="loading"
      :total="total"
      v-model:page="page"
      v-model:limit="limit"
      @search="handleSearch"
      class="min-h-[400px]"
    >
      <template #toolbar>
        <el-select v-model="filterStatus" placeholder="Trạng thái" clearable @change="fetchData" class="w-32">
          <el-option label="Đang bán" value="true" />
          <el-option label="Ngừng bán" value="false" />
        </el-select>
        <el-button @click="fetchData"><el-icon><Refresh /></el-icon></el-button>
      </template>

      <el-table-column label="Tên Gói Tập" min-width="200">
        <template #default="{ row }">
          <div class="font-medium text-primary-600 dark:text-primary-400">{{ row.name }}</div>
          <div class="text-xs text-gray-500 line-clamp-1" :title="row.description">{{ row.description || '—' }}</div>
        </template>
      </el-table-column>
      
      <el-table-column label="Thời Hạn" width="120">
        <template #default="{ row }">
          <span class="font-medium">{{ row.durationDays }} ngày</span>
        </template>
      </el-table-column>

      <el-table-column label="Mức Giá" width="150">
        <template #default="{ row }">
          <span class="font-bold text-gray-900 dark:text-white">
            {{ new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(row.price) }}
          </span>
        </template>
      </el-table-column>

      <el-table-column label="Trạng Thái" width="120">
        <template #default="{ row }">
          <span :class="row.isActive ? 'badge-green' : 'badge-red'">
            {{ row.isActive ? 'Đang bán' : 'Ngừng bán' }}
          </span>
        </template>
      </el-table-column>

      <el-table-column label="Hành động" width="100" align="right">
        <template #default="{ row }">
          <div class="flex items-center justify-end gap-2">
            <el-button size="small" circle @click="openModal(row)"><el-icon><Edit /></el-icon></el-button>
            <el-button size="small" type="danger" circle @click="handleDelete(row.id)"><el-icon><Delete /></el-icon></el-button>
          </div>
        </template>
      </el-table-column>
    </DataTable>

    <!-- Modal Form -->
    <el-dialog v-model="modalVisible" :title="isEdit ? 'Sửa Gói Tập' : 'Thêm Gói Tập'" width="500px">
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
        <el-form-item label="Tên gói tập" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="Mô tả" prop="description">
          <el-input v-model="form.description" type="textarea" :rows="2" />
        </el-form-item>
        <div class="grid grid-cols-2 gap-4">
          <el-form-item label="Thời hạn (Ngày)" prop="durationDays">
            <el-input-number v-model="form.durationDays" :min="1" :max="3650" class="!w-full" controls-position="right" />
          </el-form-item>
          <el-form-item label="Mức giá (VNĐ)" prop="price">
            <el-input-number v-model="form.price" :min="0" :step="100000" class="!w-full" controls-position="right" />
          </el-form-item>
        </div>
        <el-form-item label="Trạng thái" prop="isActive">
          <el-switch v-model="form.isActive" active-text="Đang bán" inactive-text="Ngừng bán" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="modalVisible = false">Hủy</el-button>
          <el-button type="primary" :loading="submitting" @click="submitForm">Xác Nhận</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, watch, onMounted } from 'vue'
import { plansApi } from '@/api/endpoints'
import PageHeader from '@/components/common/PageHeader.vue'
import DataTable from '@/components/common/DataTable.vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const plans = ref([])
const loading = ref(false)
const total = ref(0)
const page = ref(1)
const limit = ref(20)
const searchStr = ref('')
const filterStatus = ref('')

const modalVisible = ref(false)
const isEdit = ref(false)
const submitting = ref(false)
const currentId = ref(null)
const formRef = ref(null)

const form = reactive({ name: '', description: '', durationDays: 30, price: 0, isActive: true })
const rules = {
  name: [{ required: true, message: 'Vui lòng nhập tên gói', trigger: 'blur' }],
  durationDays: [{ required: true, message: 'Bắt buộc nhập', trigger: 'blur' }],
  price: [{ required: true, message: 'Bắt buộc nhập', trigger: 'blur' }]
}

const fetchData = async () => {
  loading.value = true
  try {
    const res = await plansApi.getAll({ page: page.value, limit: limit.value, search: searchStr.value, isActive: filterStatus.value })
    plans.value = res.data.data
    total.value = res.data.meta.total
  } catch (err) { console.error(err) } finally { loading.value = false }
}

const handleSearch = (val) => { searchStr.value = val; page.value = 1; fetchData() }

const openModal = (row = null) => {
  isEdit.value = !!row
  currentId.value = row?.id || null
  if (row) {
    Object.assign(form, { ...row })
  } else {
    Object.assign(form, { name: '', description: '', durationDays: 30, price: 0, isActive: true })
  }
  modalVisible.value = true
}

const submitForm = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true
      try {
        if (isEdit.value) await plansApi.update(currentId.value, form)
        else await plansApi.create({ ...form, features: [] })
        ElMessage.success('Thành công')
        modalVisible.value = false
        fetchData()
      } catch (err) {} finally { submitting.value = false }
    }
  })
}

const handleDelete = async (id) => {
  try {
    await ElMessageBox.confirm('Gói tập sẽ bị ngừng bán. Xác nhận?', 'Cảnh báo', { type: 'warning' })
    await plansApi.delete(id)
    ElMessage.success('Đã ngừng bán')
    fetchData()
  } catch (e) {}
}

watch([page, limit], fetchData)
onMounted(fetchData)
</script>
