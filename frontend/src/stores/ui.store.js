import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUiStore = defineStore('ui', () => {
  const sidebarCollapsed = ref(false)
  const isDark = ref(localStorage.getItem('gymDark') === 'true')
  const loading = ref(false)
  const toasts = ref([])
  let toastId = 0

  function toggleSidebar() { sidebarCollapsed.value = !sidebarCollapsed.value }

  function toggleDark() {
    isDark.value = !isDark.value
    localStorage.setItem('gymDark', isDark.value)
  }

  function setLoading(val) { loading.value = val }

  function addToast(message, type = 'info', duration = 3000) {
    const id = ++toastId
    toasts.value.push({ id, message, type })
    setTimeout(() => removeToast(id), duration)
  }

  function removeToast(id) {
    const idx = toasts.value.findIndex(t => t.id === id)
    if (idx !== -1) toasts.value.splice(idx, 1)
  }

  function toast(message) { addToast(message, 'info') }
  function success(message) { addToast(message, 'success') }
  function error(message) { addToast(message, 'error') }
  function warning(message) { addToast(message, 'warning') }

  return { sidebarCollapsed, isDark, loading, toasts, toggleSidebar, toggleDark, setLoading, addToast, removeToast, toast, success, error, warning }
})
