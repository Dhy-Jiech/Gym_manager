<template>
  <div class="space-y-6">
    <PageHeader 
      title="Quản Lý Nhân Viên" 
      subtitle="Quản lý tài khoản và phân quyền cho staff"
      actionText="Thêm Nhân Viên"
      actionIcon="Plus"
      @action="openModal(null)"
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
               <div class="text-xs text-gray-500">{{ row.email }}</div>
             </div>
           </div>
        </template>
      </el-table-column>
      
      <el-table-column label="Số điện thoại" width="140">
        <template #default="{ row }"><span class="text-sm">{{ row.phone || '—' }}</span></template>
      </el-table-column>

      <el-table-column label="Vai Trò" width="160">
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
          <el-button size="small" circle @click="openModal(row)">
            <el-icon><Edit /></el-icon>
          </el-button>
        </template>
      </el-table-column>
    </DataTable>

    <!-- User Modal -->
    <el-dialog v-model="modalVisible" :title="isEdit ? 'Sửa Nhân Viên' : 'Thêm Nhân Viên Mới'" width="480px" destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
        <div class="grid grid-cols-2 gap-4">
          <el-form-item label="Họ và tên" prop="fullName" class="col-span-2">
            <el-input v-model="form.fullName" placeholder="Họ và tên nhân viên" />
          </el-form-item>
          <el-form-item v-if="!isEdit" label="Email" prop="email">
            <el-input v-model="form.email" type="email" placeholder="email@gym.com" />
          </el-form-item>
          <el-form-item label="Số điện thoại">
            <el-input v-model="form.phone" placeholder="0912345678" />
          </el-form-item>
          <el-form-item v-if="!isEdit" label="Mật khẩu" prop="password">
            <el-input v-model="form.password" type="password" show-password placeholder="Tối thiểu 6 ký tự" />
          </el-form-item>
          <el-form-item label="Vai trò (Role)" prop="role">
            <el-select v-model="form.role" class="w-full">
              <el-option label="Staff" value="STAFF" />
              <el-option label="Manager" value="MANAGER" />
              <el-option label="Trainer" value="TRAINER" />
              <el-option label="Admin" value="ADMIN" />
            </el-select>
          </el-form-item>
          <el-form-item v-if="isEdit" label="Trạng thái">
            <el-switch v-model="form.isActive" active-text="Hoạt động" inactive-text="Khóa" />
          </el-form-item>
        </div>
      </el-form>
      <template #footer>
        <el-button @click="modalVisible = false">Huỷ</el-button>
        <el-button type="primary" :loading="submitting" @click="submitForm">
          {{ isEdit ? 'Cập nhật' : 'Tạo tài khoản' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import PageHeader from '@/components/common/PageHeader.vue'
import DataTable from '@/components/common/DataTable.vue'
import { ElMessage } from 'element-plus'
import api from '@/composables/useApi'

const users = ref([])
const loading = ref(false)
const modalVisible = ref(false)
const isEdit = ref(false)
const submitting = ref(false)
const currentId = ref(null)
const formRef = ref(null)

const form = reactive({ fullName: '', email: '', phone: '', password: '', role: 'STAFF', isActive: true })

const rules = {
  fullName: [{ required: true, message: 'Nhập họ tên', trigger: 'blur' }],
  email: [{ required: true, message: 'Nhập email', trigger: 'blur' }, { type: 'email', message: 'Email không hợp lệ', trigger: 'blur' }],
  password: [{ required: true, min: 6, message: 'Mật khẩu tối thiểu 6 ký tự', trigger: 'blur' }],
  role: [{ required: true, message: 'Chọn vai trò', trigger: 'change' }],
}

const getRoleBadge = (role) => {
  return { 'SUPER_ADMIN': 'badge-red', 'ADMIN': 'badge-primary', 'MANAGER': 'badge-yellow', 'STAFF': 'badge-green', 'TRAINER': 'badge-blue' }[role] || 'badge-gray'
}

const fetchData = async () => {
  loading.value = true
  try {
    const res = await api.get('/users')
    users.value = res.data.data
  } catch (err) { console.error(err) } finally { loading.value = false }
}

const openModal = (row = null) => {
  isEdit.value = !!row
  currentId.value = row?.id || null
  if (row) {
    Object.assign(form, { fullName: row.fullName, email: row.email, phone: row.phone || '', password: '', role: row.role, isActive: row.isActive })
  } else {
    Object.assign(form, { fullName: '', email: '', phone: '', password: '', role: 'STAFF', isActive: true })
  }
  modalVisible.value = true
}

const submitForm = async () => {
  if (!formRef.value) return
  // When editing, make password optional
  const editRules = { ...rules }
  if (isEdit.value) delete editRules.email
  if (isEdit.value) delete editRules.password

  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true
      try {
        if (isEdit.value) {
          const body = { fullName: form.fullName, phone: form.phone, role: form.role, isActive: form.isActive }
          await api.put(`/users/${currentId.value}`, body)
          ElMessage.success('Cập nhật thành công')
        } else {
          await api.post('/users', form)
          ElMessage.success('Tạo tài khoản thành công')
        }
        modalVisible.value = false
        fetchData()
      } catch {} finally { submitting.value = false }
    }
  })
}

onMounted(fetchData)
</script>
