<template>
  <div class="stat-card" :class="{ 'cursor-pointer': hoverable }" @click="hoverable && $emit('click')">
    <div 
      class="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
      :class="[iconBgClass, iconColorClass]"
    >
      <el-icon :size="24"><component :is="icon" /></el-icon>
    </div>
    
    <div class="flex-1 min-w-0">
      <div class="text-sm font-medium text-slate-500 dark:text-slate-400 truncate">{{ title }}</div>
      
      <div class="flex items-end gap-2 mt-1">
        <div v-if="loading" class="h-8 w-24 skeleton"></div>
        <div v-else class="text-2xl font-bold font-heading text-slate-900 dark:text-white truncate">
          {{ formattedValue }}
        </div>
        
        <div v-if="!loading && trend !== undefined" 
             class="flex items-center text-xs font-medium mb-1"
             :class="trend > 0 ? 'text-green-500' : trend < 0 ? 'text-red-500' : 'text-slate-400'">
          <el-icon><component :is="trend > 0 ? 'TopRight' : trend < 0 ? 'BottomRight' : 'Right'" /></el-icon>
          <span>{{ Math.abs(trend) }}%</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  title: { type: String, required: true },
  value: { type: [Number, String], required: true },
  icon: { type: String, required: true },
  color: { type: String, default: 'primary' }, // 'primary', 'success', 'warning', 'danger'
  trend: { type: Number, default: undefined },
  isCurrency: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  hoverable: { type: Boolean, default: false },
})

defineEmits(['click'])

const formattedValue = computed(() => {
  if (props.isCurrency && typeof props.value === 'number') {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(props.value)
  }
  if (typeof props.value === 'number') {
    return new Intl.NumberFormat('vi-VN').format(props.value)
  }
  return props.value
})

const iconBgClass = computed(() => {
  const map = {
    primary: 'bg-primary-100 dark:bg-primary-900/30',
    success: 'bg-green-100 dark:bg-green-900/30',
    warning: 'bg-orange-100 dark:bg-orange-900/30',
    danger: 'bg-red-100 dark:bg-red-900/30',
    purple: 'bg-purple-100 dark:bg-purple-900/30',
  }
  return map[props.color] || map.primary
})

const iconColorClass = computed(() => {
  const map = {
    primary: 'text-primary-600 dark:text-primary-400',
    success: 'text-green-600 dark:text-green-400',
    warning: 'text-orange-600 dark:text-orange-400',
    danger: 'text-red-600 dark:text-red-400',
    purple: 'text-purple-600 dark:text-purple-400',
  }
  return map[props.color] || map.primary
})
</script>
