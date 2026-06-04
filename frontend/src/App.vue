<template>
  <div :class="{ dark: uiStore.isDark }">
    <router-view v-slot="{ Component, route }">
      <transition name="page" mode="out-in">
        <component :is="Component" :key="route.path" />
      </transition>
    </router-view>

    <!-- Toast notifications -->
    <div class="toast-container">
      <div
        v-for="toast in uiStore.toasts"
        :key="toast.id"
        :class="['toast', toast.type]"
      >
        <el-icon :size="18">
          <SuccessFilled v-if="toast.type === 'success'" class="text-green-500" />
          <CircleCloseFilled v-else-if="toast.type === 'error'" class="text-red-500" />
          <WarningFilled v-else-if="toast.type === 'warning'" class="text-yellow-500" />
          <InfoFilled v-else class="text-blue-500" />
        </el-icon>
        <span class="flex-1 text-sm font-medium">{{ toast.message }}</span>
        <button @click="uiStore.removeToast(toast.id)" class="text-gray-400 hover:text-gray-600 ml-2">
          <el-icon><Close /></el-icon>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useUiStore } from '@/stores/ui.store'

const uiStore = useUiStore()
</script>
