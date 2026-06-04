<template>
  <div class="space-y-6">
    <PageHeader 
      title="Buổi Tập Cá Nhân (PT)" 
      subtitle="Quản lý lịch tập 1 kèm 1 giữa HLV và Hội viên"
      actionText="Lên Lịch PT Mới"
      actionIcon="Plus"
      @action="openModal()"
    />

    <DataTable
      :data="sessions"
      :loading="loading"
      :total="total"
      v-model:page="page"
      v-model:limit="limit"
      @search="handleSearch"
      class="min-h-[400px]"
    >
      <el-table-column label="Thời gian" width="180">
        <template #default="{ row }">
          <div class="font-medium">{{ dayjs(row.scheduledAt).format('HH:mm DD/MM/YYYY') }}</div>
          <div class="text-xs text-gray-500">{{ row.durationMin }} phút</div>
        </template>
      </el-table-column>
      
      <el-table-column label="Hội Viên" min-width="160">
        <template #default="{ row }">
          <span>{{ row.member?.fullName || '—' }}</span>
        </template>
      </el-table-column>

      <el-table-column label="Huấn Luyện Viên" min-width="160">
        <template #default="{ row }">
          <span>{{ row.trainer?.user?.fullName || '—' }}</span>
        </template>
      </el-table-column>

      <el-table-column label="Ghi chú" min-width="150">
         <template #default="{ row }">
            <span class="text-sm text-gray-500">{{ row.note || '—' }}</span>
         </template>
      </el-table-column>

      <el-table-column label="Trạng Thái" width="130" align="right">
        <template #default="{ row }">
          <span :class="getStatusBadge(row.status)">{{ row.status }}</span>
        </template>
      </el-table-column>
    </DataTable>

    <!-- PT Form Modal -->
    <el-dialog v-model="modalVisible" title="Lên Lịch Buổi Tập PT" width="520px" destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
        <el-form-item label="Hội viên" prop="memberId">
          <el-select v-model="form.memberId" filterable remote :remote-method="searchMembers"
            :loading="memberSearchLoading" placeholder="Tìm hội viên..." class="w-full">
            <el-option v-for="m in memberOptions" :key="m.id" :label="`${m.fullName} (${m.memberCode})`" :value="m.id" />
          </el-select>
        </el-form-item>

        <el-form-item label="Huấn Luyện Viên" prop="trainerId">
          <el-select v-model="form.trainerId" class="w-full" placeholder="Chọn HLV" :loading="trainersLoading">
            <el-option v-for="t in trainers" :key="t.id" :label="t.user?.fullName" :value="t.id" />
          </el-select>
        </el-form-item>

        <div class="grid grid-cols-2 gap-4">
          <el-form-item label="Ngày giờ bắt đầu" prop="scheduledAt">
            <el-date-picker v-model="form.scheduledAt" type="datetime" class="!w-full" 
              format="HH:mm DD/MM/YYYY" value-format="YYYY-MM-DDTHH:mm:ss" />
          </el-form-item>
          <el-form-item label="Thời lượng (phút)">
            <el-input-number v-model="form.durationMin" :min="30" :step="30" class="!w-full" controls-position="right" />
          </el-form-item>
        </div>

        <el-form-item label="Ghi chú / Nội dung buổi tập">
          <el-input v-model="form.note" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="modalVisible = false">Huỷ</el-button>
        <el-button type="primary" :loading="submitting" @click="submitForm">Lên Lịch</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, watch, onMounted } from 'vue'
import { ptApi, membersApi, trainersApi } from '@/api/endpoints'
import PageHeader from '@/components/common/PageHeader.vue'
import DataTable from '@/components/common/DataTable.vue'
import { ElMessage } from 'element-plus'
import dayjs from 'dayjs'

const sessions = ref([])
const loading = ref(false)
const total = ref(0)
const page = ref(1)
const limit = ref(20)
const searchStr = ref('')
const modalVisible = ref(false)
const submitting = ref(false)
const formRef = ref(null)

const memberOptions = ref([])
const memberSearchLoading = ref(false)
const trainers = ref([])
const trainersLoading = ref(false)

const form = reactive({
  memberId: null, trainerId: null,
  scheduledAt: '', durationMin: 60, note: ''
})

const rules = {
  memberId: [{ required: true, message: 'Chọn hội viên', trigger: 'change' }],
  trainerId: [{ required: true, message: 'Chọn HLV', trigger: 'change' }],
  scheduledAt: [{ required: true, message: 'Chọn ngày giờ', trigger: 'change' }],
}

const getStatusBadge = (status) => {
  return { 'SCHEDULED': 'badge-blue', 'COMPLETED': 'badge-green', 'CANCELLED': 'badge-red', 'NO_SHOW': 'badge-gray' }[status] || 'badge-gray'
}

const fetchData = async () => {
  loading.value = true
  try {
    const res = await ptApi.getAll({ page: page.value, limit: limit.value })
    sessions.value = res.data.data
    total.value = res.data.meta.total
  } catch (err) { console.error(err) } finally { loading.value = false }
}

const handleSearch = (val) => { searchStr.value = val; page.value = 1; fetchData() }

const searchMembers = async (query) => {
  if (!query) return
  memberSearchLoading.value = true
  try {
    const res = await membersApi.getAll({ search: query, limit: 20 })
    memberOptions.value = res.data.data
  } catch {} finally { memberSearchLoading.value = false }
}

const fetchTrainers = async () => {
  trainersLoading.value = true
  try {
    const res = await trainersApi.getAll()
    trainers.value = res.data.data
  } catch {} finally { trainersLoading.value = false }
}

const openModal = () => {
  Object.assign(form, { memberId: null, trainerId: null, scheduledAt: '', durationMin: 60, note: '' })
  modalVisible.value = true
}

const submitForm = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true
      try {
        await ptApi.create(form)
        ElMessage.success('Lên lịch PT thành công')
        modalVisible.value = false
        fetchData()
      } catch {} finally { submitting.value = false }
    }
  })
}

watch([page, limit], fetchData)
onMounted(() => { fetchData(); fetchTrainers() })
</script>
