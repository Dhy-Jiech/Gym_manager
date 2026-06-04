<template>
  <div class="space-y-6 max-w-4xl mx-auto">
    <PageHeader 
      :title="isEdit ? 'Chỉnh Sửa Hội Viên' : 'Thêm Hội Viên Mới'" 
      @action="goBack"
      actionText="Quay lại"
      actionIcon="ArrowLeft"
    />

    <div class="card" v-loading="loading">
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top" @submit.prevent>
        
        <h3 class="font-semibold text-lg border-b pb-2 mb-4 dark:border-gray-800">Thông tin cơ bản</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6">
          <el-form-item label="Họ và tên" prop="fullName">
            <el-input v-model="form.fullName" placeholder="VD: Nguyễn Văn A" />
          </el-form-item>
          <el-form-item label="Số điện thoại" prop="phone">
            <el-input v-model="form.phone" placeholder="VD: 0912345678" />
          </el-form-item>
          <el-form-item label="Email" prop="email">
            <el-input v-model="form.email" placeholder="VD: nguyen@example.com" />
          </el-form-item>
          <el-form-item label="Giới tính" prop="gender">
            <el-select v-model="form.gender" class="w-full">
              <el-option label="Nam" value="MALE" />
              <el-option label="Nữ" value="FEMALE" />
              <el-option label="Khác" value="OTHER" />
            </el-select>
          </el-form-item>
          <el-form-item label="Ngày sinh" prop="dob">
            <el-date-picker v-model="form.dob" type="date" placeholder="Chọn ngày" class="!w-full" format="DD/MM/YYYY" value-format="YYYY-MM-DD" />
          </el-form-item>
        </div>

        <h3 class="font-semibold text-lg border-b pb-2 mb-4 mt-6 dark:border-gray-800">Thể chất & Ghi chú</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6">
          <el-form-item label="Chiều cao (cm)" prop="height">
            <el-input-number v-model="form.height" :min="100" :max="250" class="!w-full" controls-position="right" />
          </el-form-item>
          <el-form-item label="Cân nặng (kg)" prop="weight">
            <el-input-number v-model="form.weight" :min="30" :max="200" class="!w-full" controls-position="right" />
          </el-form-item>
          <el-form-item label="Ghi chú bệnh lý / Khác" prop="notes" class="md:col-span-2">
            <el-input v-model="form.notes" type="textarea" :rows="3" placeholder="Nhập ghi chú nếu có" />
          </el-form-item>
          <el-form-item label="Trạng thái" prop="isActive" class="md:col-span-2" v-if="isEdit">
            <el-switch v-model="form.isActive" active-text="Hoạt động" inactive-text="Tạm ngưng" />
          </el-form-item>
        </div>

        <div class="flex justify-end gap-3 mt-8 pt-4 border-t dark:border-gray-800">
          <el-button @click="goBack">Huỷ</el-button>
          <el-button type="primary" @click="submitForm" :loading="submitting">Lưu Lại</el-button>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { membersApi } from '@/api/endpoints'
import PageHeader from '@/components/common/PageHeader.vue'
import { ElMessage } from 'element-plus'

const router = useRouter()
const route = useRoute()
const isEdit = computed(() => !!route.params.id)

const formRef = ref(null)
const loading = ref(false)
const submitting = ref(false)

const form = reactive({
  fullName: '',
  phone: '',
  email: '',
  gender: 'MALE',
  dob: null,
  height: null,
  weight: null,
  notes: '',
  isActive: true,
})

const rules = {
  fullName: [{ required: true, message: 'Vui lòng nhập họ tên', trigger: 'blur' }],
  phone: [{ required: true, message: 'Vui lòng nhập SĐT', trigger: 'blur' }],
}

const goBack = () => router.back()

const fetchMember = async () => {
  loading.value = true
  try {
    const res = await membersApi.getById(route.params.id)
    const data = res.data.data
    Object.assign(form, {
      fullName: data.fullName,
      phone: data.phone,
      email: data.email,
      gender: data.gender,
      dob: data.dob ? data.dob.split('T')[0] : null,
      height: data.height,
      weight: data.weight,
      notes: data.notes,
      isActive: data.isActive,
    })
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

const submitForm = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true
      try {
        if (isEdit.value) {
          await membersApi.update(route.params.id, form)
          ElMessage.success('Cập nhật thành công')
        } else {
          await membersApi.create(form)
          ElMessage.success('Thêm mới thành công')
        }
        goBack()
      } catch (err) {
        console.error(err)
        // Error intercepted
      } finally {
        submitting.value = false
      }
    }
  })
}

onMounted(() => {
  if (isEdit.value) fetchMember()
})
</script>
