import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi } from '@/api/endpoints'
import router from '@/router'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(JSON.parse(localStorage.getItem('gymUser') || 'null'))
  const accessToken = ref(localStorage.getItem('gymToken') || '')
  const refreshToken = ref(localStorage.getItem('gymRefresh') || '')

  const isLoggedIn = computed(() => !!accessToken.value && !!user.value)

  function setAuth(data) {
    accessToken.value = data.accessToken
    refreshToken.value = data.refreshToken
    user.value = data.user
    localStorage.setItem('gymToken', data.accessToken)
    localStorage.setItem('gymRefresh', data.refreshToken)
    localStorage.setItem('gymUser', JSON.stringify(data.user))
  }

  function updateToken(token) {
    accessToken.value = token
    localStorage.setItem('gymToken', token)
  }

  function clearAuth() {
    accessToken.value = ''
    refreshToken.value = ''
    user.value = null
    localStorage.removeItem('gymToken')
    localStorage.removeItem('gymRefresh')
    localStorage.removeItem('gymUser')
  }

  async function login(email, password) {
    const res = await authApi.login({ email, password })
    setAuth(res.data.data)
    return res
  }

  async function logout() {
    try {
      await authApi.logout(refreshToken.value)
    } catch {}
    clearAuth()
    router.push('/login')
  }

  async function doRefreshToken() {
    if (!refreshToken.value) throw new Error('No refresh token')
    const res = await authApi.refresh(refreshToken.value)
    updateToken(res.data.data.accessToken)
    return res.data.data.accessToken
  }

  function hasRole(...roles) {
    return user.value && roles.includes(user.value.role)
  }

  return { user, accessToken, refreshToken, isLoggedIn, setAuth, updateToken, clearAuth, login, logout, doRefreshToken, hasRole }
})
