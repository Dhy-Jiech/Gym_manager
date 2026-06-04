<template>
  <div>
    <!-- Sidebar -->
    <aside class="sidebar" :class="{ 'collapsed': uiStore.sidebarCollapsed, 'mobile-open': mobileSidebarOpen }">
      <div class="sidebar-logo flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-primary-500 text-white flex items-center justify-center shrink-0">
            <el-icon><Trophy /></el-icon>
          </div>
          <div v-show="!uiStore.sidebarCollapsed" class="overflow-hidden">
            <div class="logo-text">GymPro</div>
            <div class="logo-sub">Management</div>
          </div>
        </div>
        <!-- Mobile close button -->
        <button class="md:hidden text-white/70 hover:text-white" @click="mobileSidebarOpen = false">
          <el-icon :size="20"><Close /></el-icon>
        </button>
      </div>

      <nav class="sidebar-nav custom-scrollbar">
        <template v-for="(item, index) in navItems" :key="index">
          <div v-if="item.type === 'title'" v-show="!uiStore.sidebarCollapsed" class="nav-section-title mt-4">
            {{ item.label }}
          </div>
          
          <router-link
            v-else-if="checkPermission(item.roles)"
            :to="item.path"
            class="nav-item group"
            :title="uiStore.sidebarCollapsed ? item.label : ''"
            active-class="active"
            @click="mobileSidebarOpen = false"
          >
            <el-icon class="nav-icon text-lg transition-transform group-hover:scale-110"><component :is="item.icon" /></el-icon>
            <span v-show="!uiStore.sidebarCollapsed" class="nav-label">{{ item.label }}</span>
            <span v-if="item.badge && !uiStore.sidebarCollapsed" class="nav-badge">{{ item.badge }}</span>
          </router-link>
        </template>
      </nav>

      <!-- Bottom user profile (collapsed aware) -->
      <div class="p-4 border-t border-white/10 shrink-0">
        <div class="flex items-center gap-3 cursor-pointer hover:bg-white/5 p-2 rounded-lg transition-colors" @click="handleLogout">
          <img :src="authStore.user?.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + authStore.user?.email" class="w-9 h-9 rounded-full bg-white/10 shrink-0" />
          <div v-show="!uiStore.sidebarCollapsed" class="flex-1 min-w-0">
            <div class="text-sm font-medium text-white truncate">{{ authStore.user?.fullName }}</div>
            <div class="text-xs text-slate-400 truncate">{{ roleLabel }}</div>
          </div>
          <el-icon v-show="!uiStore.sidebarCollapsed" class="text-slate-400 rotate-90"><SwitchButton /></el-icon>
        </div>
      </div>
    </aside>

    <!-- Mobile overlay -->
    <div v-if="mobileSidebarOpen" class="fixed inset-0 bg-black/50 z-[90] md:hidden backdrop-blur-sm" @click="mobileSidebarOpen = false"></div>

    <!-- Topbar -->
    <header class="topbar" :class="{ 'collapsed-sidebar': uiStore.sidebarCollapsed }">
      <div class="flex items-center gap-4">
        <button class="text-gray-500 hover:text-primary-500 transition-colors p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800" @click="uiStore.toggleSidebar()">
          <el-icon :size="20"><Expand v-if="uiStore.sidebarCollapsed" /><Fold v-else /></el-icon>
        </button>
        <!-- Mobile open button -->
        <button class="md:hidden text-gray-500 hover:text-primary-500 p-2" @click="mobileSidebarOpen = true">
          <el-icon :size="20"><Menu /></el-icon>
        </button>
        
        <h2 class="text-lg font-semibold font-heading hidden sm:block text-gray-800 dark:text-gray-200">{{ currentRouteName }}</h2>
      </div>

      <div class="flex items-center gap-4">
        <!-- Search bar (mock) -->
        <div class="hidden md:flex relative group">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary-500">
            <el-icon><Search /></el-icon>
          </div>
          <input type="text" placeholder="Tìm kiếm nhanh..." class="block w-64 pl-10 h-10 bg-gray-100 dark:bg-gray-800 border-transparent rounded-lg text-sm focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all dark:text-white" />
        </div>

        <button class="relative p-2 text-gray-500 hover:text-primary-500 bg-gray-100 dark:bg-gray-800 rounded-full transition-colors">
          <el-icon :size="20"><Bell /></el-icon>
          <span class="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-accent-500 border-2 border-white dark:border-gray-900 rounded-full"></span>
        </button>

        <button @click="uiStore.toggleDark()" class="p-2 text-gray-500 hover:text-primary-500 bg-gray-100 dark:bg-gray-800 rounded-full transition-colors">
          <el-icon :size="20"><Moon v-if="!uiStore.isDark" /><Sunny v-else /></el-icon>
        </button>
      </div>
    </header>

    <!-- Main Content -->
    <main class="main-content relative bg-slate-50 dark:bg-[#0f172a]" :class="{ 'collapsed-sidebar': uiStore.sidebarCollapsed }">
      <router-view v-slot="{ Component, route }">
        <transition name="page" mode="out-in">
          <component :is="Component" :key="route.path" />
        </transition>
      </router-view>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import { useUiStore } from '@/stores/ui.store'
import { ElMessageBox } from 'element-plus'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const uiStore = useUiStore()

const mobileSidebarOpen = ref(false)

const currentRouteName = computed(() => route.name || 'GymPro')

const roleLabel = computed(() => {
  const map = {
    'SUPER_ADMIN': 'Super Admin',
    'ADMIN': 'Quản Trị Viên',
    'MANAGER': 'Quản Lý',
    'STAFF': 'Nhân Viên',
    'TRAINER': 'Huấn Luyện Viên'
  }
  return map[authStore.user?.role] || authStore.user?.role
})

const checkPermission = (roles) => {
  if (!roles) return true
  return roles.includes(authStore.user?.role)
}

const handleLogout = async () => {
  try {
    await ElMessageBox.confirm('Bạn có chắc chắn muốn đăng xuất?', 'Xác nhận', {
      confirmButtonText: 'Đăng xuất',
      cancelButtonText: 'Hủy',
      type: 'warning',
    })
    await authStore.logout()
  } catch (e) {
    // cancelled
  }
}

const navItems = [
  { type: 'title', label: 'TỔNG QUAN' },
  { path: '/dashboard', label: 'Dashboard', icon: 'DataBoard' },
  
  { type: 'title', label: 'QUẢN LÝ' },
  { path: '/members', label: 'Hội viên', icon: 'User' },
  { path: '/checkin', label: 'Check-in', icon: 'Scan', roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'STAFF'] },
  { path: '/plans', label: 'Gói tập', icon: 'Ticket', roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER'] },
  
  { type: 'title', label: 'LỚP HỌC & PT' },
  { path: '/schedule', label: 'Lịch học', icon: 'Calendar' },
  { path: '/classes', label: 'Lớp học', icon: 'Reading', roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'TRAINER'] },
  { path: '/trainers', label: 'Huấn luyện viên', icon: 'Medal', roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER'] },
  { path: '/pt-sessions', label: 'Buổi tập PT', icon: 'Clock' },
  
  { type: 'title', label: 'TÀI CHÍNH & VẬN HÀNH' },
  { path: '/payments', label: 'Thanh toán', icon: 'Money', roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'STAFF'] },
  { path: '/equipment', label: 'Thiết bị', icon: 'Monitor', roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER'] },
  { path: '/reports', label: 'Báo cáo', icon: 'PieChart', roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER'] },
  
  { type: 'title', label: 'HỆ THỐNG', roles: ['SUPER_ADMIN', 'ADMIN'] },
  { path: '/users', label: 'Nhân viên', icon: 'Service', roles: ['SUPER_ADMIN', 'ADMIN'] },
  { path: '/settings', label: 'Cài đặt', icon: 'Setting', roles: ['SUPER_ADMIN', 'ADMIN'] },
]
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
.custom-scrollbar:hover::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); }
</style>
