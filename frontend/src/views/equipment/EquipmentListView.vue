<template>
  <div class="space-y-6">
    <PageHeader 
      title="Thiết Bị & Tài Sản" 
      subtitle="Quản lý danh mục thiết bị, bảo trì, sửa chữa"
      actionText="Nhập Thiết Bị"
      actionIcon="Plus"
      @action="openModal()"
    />

    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 -mt-2">
      <StatCard title="Tổng Thiết Bị" :value="kpis.total" icon="Box" color="primary" />
      <StatCard title="Hoạt Động" :value="kpis.active" icon="CircleCheck" color="success" />
      <StatCard title="Cần Bảo Trì" :value="kpis.maintenance" icon="Tools" color="warning" />
      <StatCard title="Hỏng Hóc" :value="kpis.broken" icon="WarningFilled" color="danger" />
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
          <div class="text-xs text-gray-500">{{ row.category }} — {{ row.location || 'Chưa xác định' }}</div>
        </template>
      </el-table-column>
      
      <el-table-column label="Ngày Nhập / Giá" width="160">
        <template #default="{ row }">
           <div class="text-sm">{{ row.purchaseDate ? dayjs(row.purchaseDate).format('DD/MM/YYYY') : '—' }}</div>
           <div class="text-xs font-bold text-gray-600 dark:text-gray-400" v-if="row.purchasePrice">
             {{ formatVND(row.purchasePrice) }}
           </div>
        </template>
      </el-table-column>

      <el-table-column label="Bảo Trì Tiếp Theo" width="150">
        <template #default="{ row }">
          <div :class="isLate(row.nextMaintenanceAt) ? 'text-red-500 font-semibold' : ''">
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

    <!-- Add Equipment Modal -->
    <el-dialog v-model="modalVisible" title="Nhập Thiết Bị Mới" width="520px" destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
        <div class="grid grid-cols-2 gap-4">
          <el-form-item label="Tên thiết bị" prop="name" class="col-span-2">
            <el-input v-model="form.name" placeholder="VD: Máy chạy bộ Life Fitness..." />
          </el-form-item>
          <el-form-item label="Danh mục" prop="category">
            <el-select v-model="form.category" class="w-full" filterable allow-create>
              <el-option label="Cardio" value="Cardio" />
              <el-option label="Tạ / Sức mạnh" value="Strength" />
              <el-option label="Phụ kiện" value="Accessories" />
              <el-option label="Thiết bị khác" value="Other" />
            </el-select>
          </el-form-item>
          <el-form-item label="Vị trí / Khu vực">
            <el-input v-model="form.location" placeholder="VD: Phòng Cardio, Tầng 2..." />
          </el-form-item>
          <el-form-item label="Số Series">
            <el-input v-model="form.serialNumber" placeholder="Serial number" />
          </el-form-item>
          <el-form-item label="Giá nhập (VNĐ)">
            <el-input-number v-model="form.purchasePrice" :min="0" :step="1000000" class="!w-full" controls-position="right" />
          </el-form-item>
          <el-form-item label="Ngày nhập">
            <el-date-picker v-model="form.purchaseDate" type="date" class="!w-full" format="DD/MM/YYYY" value-format="YYYY-MM-DD" />
          </el-form-item>
          <el-form-item label="Bảo trì tiếp theo">
            <el-date-picker v-model="form.nextMaintenanceAt" type="date" class="!w-full" format="DD/MM/YYYY" value-format="YYYY-MM-DD" />
          </el-form-item>
          <el-form-item label="Trạng thái">
            <el-select v-model="form.status" class="w-full">
              <el-option label="Bình thường" value="ACTIVE" />
              <el-option label="Đang bảo trì" value="MAINTENANCE" />
              <el-option label="Hỏng" value="BROKEN" />
            </el-select>
          </el-form-item>
          <el-form-item label="Ghi chú" class="col-span-2">
            <el-input v-model="form.note" type="textarea" :rows="2" />
          </el-form-item>
        </div>
      </el-form>
      <template #footer>
        <el-button @click="modalVisible = false">Huỷ</el-button>
        <el-button type="primary" :loading="submitting" @click="submitForm">Lưu Thiết Bị</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, watch, onMounted, computed } from 'vue'
import { equipmentApi } from '@/api/endpoints'
import PageHeader from '@/components/common/PageHeader.vue'
import DataTable from '@/components/common/DataTable.vue'
import StatCard from '@/components/common/StatCard.vue'
import { ElMessage } from 'element-plus'
import dayjs from 'dayjs'

const equipment = ref([])
const loading = ref(false)
const total = ref(0)
const page = ref(1)
const limit = ref(20)
const searchStr = ref('')
const modalVisible = ref(false)
const submitting = ref(false)
const formRef = ref(null)

const form = reactive({
  name: '', category: 'Cardio', location: '', serialNumber: '',
  purchasePrice: null, purchaseDate: null,
  nextMaintenanceAt: null, status: 'ACTIVE', note: ''
})

const rules = {
  name: [{ required: true, message: 'Nhập tên thiết bị', trigger: 'blur' }],
  category: [{ required: true, message: 'Chọn danh mục', trigger: 'change' }],
}

const kpis = computed(() => ({
  total: equipment.value.length,
  active: equipment.value.filter(x => x.status === 'ACTIVE').length,
  maintenance: equipment.value.filter(x => x.status === 'MAINTENANCE').length,
  broken: equipment.value.filter(x => x.status === 'BROKEN').length,
}))

const formatVND = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val)
const getStatusBadge = (s) => ({ 'ACTIVE': 'badge-green', 'MAINTENANCE': 'badge-yellow', 'BROKEN': 'badge-red', 'DISPOSED': 'badge-gray' }[s] || 'badge-gray')
const getStatusLabel = (s) => ({ 'ACTIVE': 'Bình thường', 'MAINTENANCE': 'Bảo trì', 'BROKEN': 'Hỏng', 'DISPOSED': 'Thanh lý' }[s] || s)
const isLate = (d) => d && dayjs(d).isBefore(dayjs(), 'day')

const fetchData = async () => {
  loading.value = true
  try {
    const res = await equipmentApi.getAll({ page: page.value, limit: limit.value, search: searchStr.value })
    equipment.value = res.data.data
    total.value = res.data.meta.total
  } catch (err) { console.error(err) } finally { loading.value = false }
}

const handleSearch = (val) => { searchStr.value = val; page.value = 1; fetchData() }

const openModal = () => {
  Object.assign(form, { name: '', category: 'Cardio', location: '', serialNumber: '', purchasePrice: null, purchaseDate: null, nextMaintenanceAt: null, status: 'ACTIVE', note: '' })
  modalVisible.value = true
}

const submitForm = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true
      try {
        await equipmentApi.create(form)
        ElMessage.success('Thêm thiết bị thành công')
        modalVisible.value = false
        fetchData()
      } catch {} finally { submitting.value = false }
    }
  })
}

watch([page, limit], fetchData)
onMounted(fetchData)
</script>
