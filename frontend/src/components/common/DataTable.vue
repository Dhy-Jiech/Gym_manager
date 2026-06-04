<template>
  <div class="card overflow-hidden !p-0 flex flex-col h-full">
    <!-- Header/Toolbar -->
    <div class="p-4 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div class="relative w-full sm:w-72">
        <el-input
          v-model="searchQuery"
          placeholder="Tìm kiếm..."
          clearable
          :prefix-icon="'Search'"
          @input="handleSearch"
        />
      </div>
      <div class="flex gap-2 w-full sm:w-auto">
        <slot name="toolbar"></slot>
      </div>
    </div>

    <!-- Table content -->
    <div class="flex-1 overflow-auto relative">
      <el-table
        :data="data"
        style="width: 100%"
        :header-cell-style="{ background: 'var(--bg)', color: 'var(--text-muted)' }"
        v-loading="loading"
        @selection-change="handleSelectionChange"
        @sort-change="handleSortChange"
        empty-text="Không có dữ liệu"
      >
        <slot></slot>
      </el-table>
    </div>

    <!-- Pagination -->
    <div v-if="showPagination && total > 0" class="p-4 border-t border-gray-100 dark:border-gray-800 flex justify-end">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  data: { type: Array, required: true },
  loading: { type: Boolean, default: false },
  total: { type: Number, default: 0 },
  initialPage: { type: Number, default: 1 },
  initialLimit: { type: Number, default: 20 },
  showPagination: { type: Boolean, default: true },
})

const emit = defineEmits(['update:page', 'update:limit', 'search', 'selection-change', 'sort-change'])

const currentPage = ref(props.initialPage)
const pageSize = ref(props.initialLimit)
const searchQuery = ref('')
let searchTimeout = null

const handleSizeChange = (val) => {
  pageSize.value = val; emit('update:limit', val)
}
const handleCurrentChange = (val) => {
  currentPage.value = val; emit('update:page', val)
}
const handleSearch = (val) => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    emit('search', val)
  }, 500) // 500ms debounce
}
const handleSelectionChange = (val) => emit('selection-change', val)
const handleSortChange = (val) => emit('sort-change', val)

// Reset page when total changes dramatically (e.g. searching)
watch(() => props.total, (newTotal) => {
  const maxPage = Math.ceil(newTotal / pageSize.value)
  if (currentPage.value > maxPage && maxPage > 0) {
    currentPage.value = maxPage
    emit('update:page', maxPage)
  }
})
</script>
