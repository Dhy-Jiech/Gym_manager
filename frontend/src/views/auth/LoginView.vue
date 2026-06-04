<template>
  <div class="bg-white px-8 py-10 pb-8 sm:px-12 w-full">
    <div class="mb-8 items-center justify-center flex">
      <!-- Title included in Layout -->
    </div>
    
    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Email input -->
      <div>
        <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
        <div class="mt-2 text-red relative">
          <input 
            id="email" 
            v-model="form.email" 
            name="email" 
            type="email" 
            autocomplete="email" 
            required 
            class="block w-full h-11 px-4 rounded-xl border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm bg-gray-50 hover:bg-white transition-colors border"
            placeholder="admin@gym.com"
          />
        </div>
      </div>

      <!-- Password input -->
      <div>
        <label for="password" class="block text-sm font-medium text-gray-700">Mật khẩu</label>
        <div class="mt-2 relative">
          <input 
            id="password" 
            v-model="form.password" 
            name="password" 
            :type="showPassword ? 'text' : 'password'" 
            autocomplete="current-password" 
            required 
            minlength="6"
            class="block w-full h-11 pl-4 pr-10 rounded-xl border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm bg-gray-50 hover:bg-white transition-colors border"
            placeholder="••••••••"
          />
          <button type="button" @click="showPassword = !showPassword" class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-primary-500">
            <el-icon><View v-if="showPassword" /><Hide v-else /></el-icon>
          </button>
        </div>
      </div>

      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <input id="remember-me" name="remember-me" type="checkbox" class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded" />
          <label for="remember-me" class="ml-2 block text-sm text-gray-900">Ghi nhớ đăng nhập</label>
        </div>

        <div class="text-sm">
          <a href="#" class="font-medium text-primary-600 hover:text-primary-500 cursor-not-allowed">Quên mật khẩu?</a>
        </div>
      </div>

      <div class="pt-2">
        <button 
          type="submit" 
          :disabled="loading"
          class="w-full h-12 flex justify-center items-center py-2 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all hover:shadow-lg disabled:opacity-75 disabled:cursor-not-allowed"
        >
          <el-icon v-if="loading" class="is-loading mr-2"><Loading /></el-icon>
          Đăng Nhập
        </button>
      </div>
      
      <div class="mt-6">
         <div class="relative">
           <div class="absolute inset-0 flex items-center">
             <div class="w-full border-t border-gray-200"></div>
           </div>
           <div class="relative flex justify-center text-sm">
             <span class="px-2 bg-white text-gray-500 uppercase">Tài khoản Demo</span>
           </div>
         </div>
         <div class="mt-6 grid grid-cols-2 gap-3 text-xs text-gray-500 text-center">
           <div @click="autofill('admin@gym.com', 'Admin@123')" class="cursor-pointer hover:bg-gray-50 p-2 rounded-lg border border-dashed border-gray-300 transition-colors">Admin<br><span class="text-primary-600">admin@gym.com</span></div>
           <div @click="autofill('staff@gym.com', 'Staff@123')" class="cursor-pointer hover:bg-gray-50 p-2 rounded-lg border border-dashed border-gray-300 transition-colors">Staff<br><span class="text-primary-600">staff@gym.com</span></div>
         </div>
       </div>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import { useUiStore } from '@/stores/ui.store'

const router = useRouter()
const authStore = useAuthStore()
const uiStore = useUiStore()

const loading = ref(false)
const showPassword = ref(false)
const form = reactive({ email: '', password: '' })

const autofill = (email, password) => {
  form.email = email
  form.password = password
}

const handleSubmit = async () => {
  if (!form.email || !form.password) return
  loading.value = true
  try {
    await authStore.login(form.email, form.password)
    uiStore.success(`Chào mừng trở lại, ${authStore.user?.fullName}!`)
    router.push('/dashboard')
  } catch (error) {
    // Error is handled by Axios interceptor globally mostly, but we can do local parsing
  } finally {
    loading.value = false
  }
}
</script>
