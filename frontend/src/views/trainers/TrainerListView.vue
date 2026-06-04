<template>
  <div class="space-y-6">
    <PageHeader 
      title="Huấn Luyện Viên" 
      subtitle="Quản lý thông tin và lịch làm việc của HLV"
      actionText="Thêm Huấn Luyện Viên"
      actionIcon="Plus"
      @action="openModal(null)"
    />

    <DataTable :data="trainers" :loading="loading" :showPagination="false" class="min-h-[400px]">
      <el-table-column label="Thông tin HLV" min-width="250">
        <template #default="{ row }">
           <div class="flex items-center gap-3">
             <img :src="`https://api.dicebear.com/7.x/avataaars/svg?seed=${row.user?.email}`" class="w-10 h-10 rounded-full bg-primary-100" />
             <div>
               <div class="font-medium text-gray-900 dark:text-white">{{ row.user?.fullName }}</div>
               <div class="text-xs text-gray-500">{{ row.user?.email }} | {{ row.user?.phone }}</div>
             </div>
           </div>
        </template>
      </el-table-column>
      
      <el-table-column label="Chuyên Môn" min-width="180">
        <template #default="{ row }">
          <span class="text-sm">{{ row.specialization || '—' }}</span>
        </template>
      </el-table-column>

      <el-table-column label="Giá PT/Giờ" width="150">
        <template #default="{ row }">
          <span class="font-semibold" v-if="row.hourlyRate">{{ formatVND(row.hourlyRate) }}</span>
          <span class="text-gray-400" v-else>—</span>
        </template>
      </el-table-column>

      <el-table-column label="Sẵn sàng" width="130">
        <template #default="{ row }">
          <span :class="row.isAvailable ? 'badge-green' : 'badge-red'">
            {{ row.isAvailable ? 'Sẵn sàng' : 'Bận' }}
          </span>
        </template>
      </el-table-column>
    </DataTable>

    <!-- Add Trainer Modal -->
    <el-dialog v-model="modalVisible" title="Thêm Huấn Luyện Viên" width="520px" destroy-on-close>
      <el-alert type="info" show-icon class="mb-4" :closable="false">
        <template #title>Hệ thống sẽ tạo tài khoản user mới với Role = TRAINER và liên kết profile HLV.</template>
      </el-alert>
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
        <div class="grid grid-cols-2 gap-4">
          <el-form-item label="Họ và tên" prop="fullName" class="col-span-2">
            <el-input v-model="form.fullName" placeholder="Tên đầy đủ của HLV" />
          </el-form-item>
          <el-form-item label="Email" prop="email">
            <el-input v-model="form.email" type="email" placeholder="hlv@gym.com" />
          </el-form-item>
          <el-form-item label="Số điện thoại">
            <el-input v-model="form.phone" placeholder="0912345678" />
          </el-form-item>
          <el-form-item label="Mật khẩu" prop="password">
            <el-input v-model="form.password" type="password" show-password placeholder="Tối thiểu 6 ký tự" />
          </el-form-item>
          <el-form-item label="Giá PT / Giờ (VNĐ)">
            <el-input-number v-model="form.hourlyRate" :min="0" :step="50000" class="!w-full" controls-position="right" />
          </el-form-item>
          <el-form-item label="Chuyên môn" class="col-span-2">
            <el-input v-model="form.specialization" placeholder="VD: Yoga, Cardio, Powerlifting..." />
          </el-form-item>
          <el-form-item label="Giới thiệu bản thân" class="col-span-2">
            <el-input v-model="form.bio" type="textarea" :rows="2" />
          </el-form-item>
        </div>
      </el-form>
      <template #footer>
        <el-button @click="modalVisible = false">Huỷ</el-button>
        <el-button type="primary" :loading="submitting" @click="submitForm">Tạo HLV</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { trainersApi } from '@/api/endpoints'
import api from '@/composables/useApi'
import PageHeader from '@/components/common/PageHeader.vue'
import DataTable from '@/components/common/DataTable.vue'
import { ElMessage } from 'element-plus'

const trainers = ref([])
const loading = ref(false)
const modalVisible = ref(false)
const submitting = ref(false)
const formRef = ref(null)

const form = reactive({ fullName: '', email: '', phone: '', password: '', specialization: '', bio: '', hourlyRate: 200000 })

const rules = {
  fullName: [{ required: true, message: 'Nhập họ tên', trigger: 'blur' }],
  email: [{ required: true, message: 'Nhập email', trigger: 'blur' }],
  password: [{ required: true, min: 6, message: 'Mật khẩu tối thiểu 6 ký tự', trigger: 'blur' }],
}

const formatVND = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val)

const fetchData = async () => {
  loading.value = true
  try {
    const res = await trainersApi.getAll()
    trainers.value = res.data.data
  } catch (err) { console.error(err) } finally { loading.value = false }
}

const openModal = (row = null) => {
  Object.assign(form, { fullName: '', email: '', phone: '', password: '', specialization: '', bio: '', hourlyRate: 200000 })
  modalVisible.value = true
}

const submitForm = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    submitting.value = true
    try {
      // Step 1: Create user with TRAINER role
      const userRes = await api.post('/users', { fullName: form.fullName, email: form.email, phone: form.phone, password: form.password, role: 'TRAINER' })
      const userId = userRes.data.data.id
      // Step 2: Create trainer profile linked to user
      await trainersApi.create({ userId, specialization: form.specialization, bio: form.bio, hourlyRate: form.hourlyRate })
      ElMessage.success('Đã tạo tài khoản HLV thành công')
      modalVisible.value = false
      fetchData()
    } catch {} finally { submitting.value = false }
  })
}

onMounted(fetchData)
</script>
