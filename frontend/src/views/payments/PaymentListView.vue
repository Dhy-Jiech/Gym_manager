<template>
  <div class="space-y-6">
    <PageHeader 
      title="Quản Lý Thanh Toán" 
      subtitle="Theo dõi hóa đơn, biên lai và trạng thái thanh toán"
      actionText="Tạo Hóa Đơn Mới"
      actionIcon="Plus"
      @action="openModal()"
    />

    <DataTable
      :data="payments"
      :loading="loading"
      :total="total"
      v-model:page="page"
      v-model:limit="limit"
      @search="handleSearch"
      class="min-h-[400px]"
    >
      <el-table-column label="Mã GD" width="120">
        <template #default="{ row }">
          <span class="font-mono text-sm uppercase text-gray-500">{{ row.referenceCode || '—' }}</span>
        </template>
      </el-table-column>
      
      <el-table-column label="Hội Viên" min-width="180">
        <template #default="{ row }">
           <div v-if="row.member">
             <div class="font-medium text-gray-900 dark:text-white">{{ row.member.fullName }}</div>
             <div class="text-xs text-gray-500">{{ row.member.memberCode }}</div>
           </div>
           <span v-else class="text-gray-400">Khách lẻ</span>
        </template>
      </el-table-column>

      <el-table-column label="Số Tiền" width="150" align="right">
        <template #default="{ row }">
          <span class="font-bold text-primary-600 dark:text-primary-400">
            {{ formatVND(row.amount) }}
          </span>
        </template>
      </el-table-column>

      <el-table-column label="Phương thức" width="150">
        <template #default="{ row }">
          <span class="text-sm font-medium">{{ row.method }}</span>
        </template>
      </el-table-column>

      <el-table-column label="Ngày tạo" width="160">
         <template #default="{ row }">
            <span class="text-sm">{{ dayjs(row.createdAt).format('HH:mm DD/MM/YYYY') }}</span>
         </template>
      </el-table-column>

      <el-table-column label="Trạng Thái" width="120" align="right">
        <template #default="{ row }">
          <span :class="row.status === 'COMPLETED' ? 'badge-green' : row.status === 'PENDING' ? 'badge-yellow' : 'badge-red'">
            {{ row.status }}
          </span>
        </template>
      </el-table-column>
    </DataTable>

    <!-- Create Payment Modal -->
    <el-dialog v-model="modalVisible" title="Tạo Hóa Đơn" width="520px" destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
        <el-form-item label="Hội viên" prop="memberId">
          <el-select 
            v-model="form.memberId" filterable remote
            :remote-method="searchMembers" :loading="memberSearchLoading"
            placeholder="Tìm hội viên theo tên hoặc mã..." class="w-full"
          >
            <el-option v-for="m in memberOptions" :key="m.id" 
              :label="`${m.fullName} (${m.memberCode})`" :value="m.id" />
          </el-select>
        </el-form-item>

        <div class="grid grid-cols-2 gap-4">
          <el-form-item label="Số tiền (VNĐ)" prop="amount">
            <el-input-number v-model="form.amount" :min="0" :step="50000" class="!w-full" controls-position="right" />
          </el-form-item>
          <el-form-item label="Phương thức" prop="method">
            <el-select v-model="form.method" class="w-full">
              <el-option label="Tiền mặt" value="CASH" />
              <el-option label="Chuyển khoản" value="BANK_TRANSFER" />
              <el-option label="VNPay" value="VNPAY" />
              <el-option label="Momo" value="MOMO" />
            </el-select>
          </el-form-item>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <el-form-item label="Trạng thái" prop="status">
            <el-select v-model="form.status" class="w-full">
              <el-option label="Hoàn tất" value="COMPLETED" />
              <el-option label="Chờ xử lý" value="PENDING" />
            </el-select>
          </el-form-item>
          <el-form-item label="Mã tham chiếu">
            <el-input v-model="form.referenceCode" placeholder="VD: TXN001..." />
          </el-form-item>
        </div>

        <el-form-item label="Ghi chú">
          <el-input v-model="form.note" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="modalVisible = false">Huỷ</el-button>
        <el-button type="primary" :loading="submitting" @click="submitForm">Tạo Hóa Đơn</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, watch, onMounted } from 'vue'
import { paymentsApi, membersApi } from '@/api/endpoints'
import PageHeader from '@/components/common/PageHeader.vue'
import DataTable from '@/components/common/DataTable.vue'
import { ElMessage } from 'element-plus'
import dayjs from 'dayjs'

const payments = ref([])
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

const form = reactive({
  memberId: null,
  amount: 0,
  method: 'CASH',
  status: 'COMPLETED',
  referenceCode: '',
  note: '',
})

const rules = {
  memberId: [{ required: true, message: 'Chọn hội viên', trigger: 'change' }],
  amount: [{ required: true, message: 'Nhập số tiền', trigger: 'blur' }],
  method: [{ required: true, message: 'Chọn phương thức', trigger: 'change' }],
}

const formatVND = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val)

const fetchData = async () => {
  loading.value = true
  try {
    const res = await paymentsApi.getAll({ page: page.value, limit: limit.value, search: searchStr.value })
    payments.value = res.data.data
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

const openModal = () => {
  Object.assign(form, { memberId: null, amount: 0, method: 'CASH', status: 'COMPLETED', referenceCode: '', note: '' })
  memberOptions.value = []
  modalVisible.value = true
}

const submitForm = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true
      try {
        await paymentsApi.create(form)
        ElMessage.success('Tạo hóa đơn thành công')
        modalVisible.value = false
        fetchData()
      } catch {} finally { submitting.value = false }
    }
  })
}

watch([page, limit], fetchData)
onMounted(fetchData)
</script>
