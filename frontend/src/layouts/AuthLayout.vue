<template>
  <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
    <!-- Abstract background -->
    <div class="absolute -top-40 -right-40 w-96 h-96 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
    <div class="absolute -bottom-40 -left-40 w-96 h-96 bg-accent-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
    
    <div class="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
      <div class="flex justify-center items-center gap-3 mb-8">
        <div class="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/30 text-white">
          <el-icon :size="24"><Trophy /></el-icon>
        </div>
        <div>
          <h1 class="text-3xl font-heading font-bold text-gray-900 tracking-tight">GymPro</h1>
          <p class="text-sm text-gray-500 font-medium">Hệ thống quản lý chuyên nghiệp</p>
        </div>
      </div>
    </div>

    <div class="sm:mx-auto sm:w-full sm:max-w-md relative z-10 shadow-2xl rounded-2xl">
      <router-view />
    </div>
  </div>
</template>

<style scoped>
.font-heading { font-family: 'Space Grotesk', sans-serif; }
</style>
