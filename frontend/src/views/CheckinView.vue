<template>
  <div class="max-w-3xl mx-auto space-y-6">
    <PageHeader title="Check-in Cửa" subtitle="Quét mã QR hoặc nhập mã hội viên để check-in/out" />

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      
      <!-- Input Area -->
      <div class="card flex flex-col items-center justify-center space-y-6 min-h-[320px]">
        <div class="w-32 h-32 bg-primary-50 dark:bg-primary-900/20 text-primary-500 rounded-2xl flex items-center justify-center mb-2 shadow-inner border border-primary-100 dark:border-primary-900/50">
          <el-icon :size="64"><Camera /></el-icon>
        </div>
        
        <h3 class="font-bold text-lg text-center">Quét từ máy quét QR</h3>
        <p class="text-sm text-gray-400 text-center -mt-2 mb-4 max-w-xs">Chỉ cần đưa mã QR vào máy quét, hệ thống sẽ tự nhận diện</p>
        
        <el-input 
          v-model="qrInput" 
          placeholder="Hoặc nhập mã thủ công..." 
          size="large"
          class="w-full max-w-sm"
          clearable
          @keyup.enter="handleCheckin"
        >
          <template #append>
            <el-button @click="handleCheckin" :loading="loading">
              <el-icon><Right /></el-icon>
            </el-button>
          </template>
        </el-input>
      </div>

      <!-- Result Area -->
      <div class="card min-h-[320px] flex flex-col justify-center relative overflow-hidden transition-colors duration-300" 
           :class="resultState.bgClass">
        
        <!-- Default State -->
        <div v-if="!lastResult" class="flex flex-col flex-1 items-center justify-center text-gray-400">
           <el-icon :size="48" class="mb-4"><Scan /></el-icon>
           <p class="font-medium">Chờ quét mã...</p>
        </div>

        <!-- Result State -->
        <div v-else class="flex flex-col items-center text-center relative z-10 p-4">
          <div class="w-20 h-20 rounded-full flex items-center justify-center text-white mb-4 shadow-lg animate-bounce"
               :class="resultState.iconBgClass">
            <el-icon :size="40"><component :is="resultState.icon" /></el-icon>
          </div>
          
          <h2 class="text-2xl font-bold font-heading mb-1" :class="resultState.textClass">
            {{ resultState.title }}
          </h2>
          <p class="text-gray-600 dark:text-gray-300 font-medium text-lg mb-4">{{ lastResult.member?.fullName }}</p>
          
          <div v-if="lastResult.member" class="w-full bg-white/50 dark:bg-black/20 rounded-xl p-4 text-sm text-left backdrop-blur-sm">
            <div class="flex justify-between mb-2">
              <span class="text-gray-500">Mã HH:</span>
              <span class="font-medium">{{ lastResult.member.memberCode }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">Thời gian:</span>
              <span class="font-medium">{{ dayjs().format('HH:mm:ss DD/MM/YYYY') }}</span>
            </div>
          </div>
        </div>
      </div>
    
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { checkinApi } from '@/api/endpoints'
import PageHeader from '@/components/common/PageHeader.vue'
import { ElMessage } from 'element-plus'
import dayjs from 'dayjs'

const qrInput = ref('')
const loading = ref(false)
const lastResult = ref(null) // { success: boolean, type: 'CHECKIN'|'CHECKOUT'|'ERROR', member: obj, message: str }

const resultState = computed(() => {
  if (!lastResult.value) return { bgClass: '', iconBgClass: '', icon: '', title: '', textClass: '' }
  
  if (!lastResult.value.success) {
    return {
      bgClass: 'bg-red-50 dark:bg-red-950/20 border-red-200',
      iconBgClass: 'bg-red-500',
      icon: 'Close',
      title: 'Lỗi Check-in!',
      textClass: 'text-red-700 dark:text-red-400'
    }
  }

  if (lastResult.value.type === 'CHECKIN') {
    return {
      bgClass: 'bg-green-50 dark:bg-green-950/20 border-green-200',
      iconBgClass: 'bg-green-500',
      icon: 'Check',
      title: 'Check-in Thành Công',
      textClass: 'text-green-700 dark:text-green-400'
    }
  } else {
    return {
      bgClass: 'bg-blue-50 dark:bg-blue-950/20 border-blue-200',
      iconBgClass: 'bg-blue-500',
      icon: 'TopRight',
      title: 'Check-out Thành Công',
      textClass: 'text-blue-700 dark:text-blue-400'
    }
  }
})

const handleCheckin = async () => {
  const code = qrInput.value.trim()
  if (!code) return
  
  loading.value = true
  lastResult.value = null // reset
  
  try {
    const res = await checkinApi.checkinQr(code)
    lastResult.value = {
      success: true,
      type: res.data.data.type, // CHECKIN or CHECKOUT
      member: res.data.data.member,
      message: res.data.message
    }
    ElMessage.success(res.data.message)
    qrInput.value = ''
  } catch (err) {
    const data = err.response?.data
    lastResult.value = {
      success: false,
      type: 'ERROR',
      member: data?.data?.member || null,
      message: data?.message || 'Có lỗi xảy ra, vui lòng thử lại.'
    }
    ElMessage.error(lastResult.value.message)
    qrInput.value = ''
  } finally {
    loading.value = false
    // Auto-focus input for next barcode scan
    document.querySelector('input.el-input__inner')?.focus()
  }
}
</script>
