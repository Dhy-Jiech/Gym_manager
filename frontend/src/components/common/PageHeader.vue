<template>
  <div class="page-header flex-col md:flex-row gap-4 items-start md:items-center">
    <div>
      <h1 class="page-title">{{ title }}</h1>
      <p v-if="subtitle" class="text-slate-500 dark:text-slate-400 mt-1 text-sm">{{ subtitle }}</p>
    </div>
    
    <div class="flex items-center gap-3 w-full md:w-auto">
      <slot name="actions"></slot>
      
      <button v-if="actionText" @click="$emit('action')" class="btn-primary flex-1 md:flex-none">
        <el-icon v-if="actionIcon" class="mr-1"><component :is="actionIcon" /></el-icon>
        {{ actionText }}
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  actionText: { type: String, default: '' },
  actionIcon: { type: String, default: '' },
})
defineEmits(['action'])
</script>
