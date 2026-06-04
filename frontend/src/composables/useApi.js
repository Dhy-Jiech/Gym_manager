import axios from 'axios'
import { useAuthStore } from '@/stores/auth.store'
import { useUiStore } from '@/stores/ui.store'
import router from '@/router'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request Interceptor
api.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore()
    if (authStore.accessToken) {
      config.headers.Authorization = `Bearer ${authStore.accessToken}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response Interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    
    // Skip checking for login/refresh routes to prevent loop
    if (originalRequest.url?.includes('/auth/login') || originalRequest.url?.includes('/auth/refresh')) {
      return Promise.reject(error)
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      try {
        const authStore = useAuthStore()
        const newAccessToken = await authStore.doRefreshToken()
        axios.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`
        return api(originalRequest)
      } catch (err) {
        const authStore = useAuthStore()
        const uiStore = useUiStore()
        authStore.clearAuth()
        uiStore.error('Phiên đăng nhập hết hạn, vui lòng đăng nhập lại.')
        router.push('/login')
        return Promise.reject(err)
      }
    }

    // Handle generic errors
    if (error.response) {
      const uiStore = useUiStore()
      const data = error.response.data
      if (error.response.status === 403) {
        uiStore.error('Bạn không có quyền truy cập trang này.')
      } else if (error.response.status >= 500) {
        uiStore.error('Lỗi server, vui lòng thử lại sau.')
      } else if (data?.message && !originalRequest._skipErrorPopup) {
        uiStore.error(data.message)
      }
    }
    
    return Promise.reject(error)
  }
)

export default api
