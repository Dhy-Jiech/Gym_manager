<template>
  <div class="space-y-6 max-w-4xl">
    <PageHeader 
      title="Cài Đặt Hệ Thống" 
      subtitle="Thay đổi mật khẩu và tuỳ chỉnh cá nhân"
    />

    <div class="card">
      <h3 class="font-semibold text-lg border-b pb-2 mb-6 dark:border-gray-800">Đổi Mật Khẩu</h3>
      
      <el-form ref="formRef" :model="form" label-width="150px" label-position="left">
        <el-form-item label="Mật khẩu cũ" required>
          <el-input v-model="form.currentPassword" type="password" show-password class="max-w-sm" />
        </el-form-item>
        <el-form-item label="Mật khẩu mới" required>
          <el-input v-model="form.newPassword" type="password" show-password class="max-w-sm" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="changePw" :loading="loading">Đổi Mật Khẩu</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import PageHeader from '@/components/common/PageHeader.vue'
import { authApi } from '@/api/endpoints'
import { ElMessage } from 'element-plus'

const form = reactive({ currentPassword: '', newPassword: '' })
const loading = ref(false)

const changePw = async () => {
  if (!form.currentPassword || !form.newPassword) return
  loading.value = true
  try {
    await authApi.changePassword(form)
    ElMessage.success('Đổi mật khẩu thành công')
    form.currentPassword = ''
    form.newPassword = ''
  } catch (err) {
  } finally {
    loading.value = false
  }
}
</script>
