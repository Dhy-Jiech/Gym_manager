<template>
  <div v-if="loading" class="p-8 flex justify-center">
    <el-icon class="is-loading" :size="32"><Loading /></el-icon>
  </div>
  <div v-else-if="member" class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
      <div class="flex items-center gap-4">
        <el-button circle @click="$router.push('/members')">
          <el-icon><ArrowLeft /></el-icon>
        </el-button>
        <img :src="member.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.memberCode}`" class="w-16 h-16 rounded-full border-2 border-primary-100" />
        <div>
          <h1 class="text-2xl font-bold font-heading text-gray-900 dark:text-white flex items-center gap-2">
            {{ member.fullName }}
            <span :class="member.isActive ? 'badge-green' : 'badge-red'">
              {{ member.isActive ? 'Active' : 'Inactive' }}
            </span>
          </h1>
          <p class="text-sm text-gray-500">{{ member.memberCode }}</p>
        </div>
      </div>
      <div class="flex gap-2">
        <el-button @click="$router.push(`/members/${member.id}/edit`)">
          <el-icon class="mr-1"><Edit /></el-icon> Chỉnh sửa
        </el-button>
        <el-button type="primary" @click="showQr = true">
          <el-icon class="mr-1"><FullScreen /></el-icon> Mã QR
        </el-button>
      </div>
    </div>

    <!-- Tabs -->
    <div class="card !p-0">
      <el-tabs v-model="activeTab" class="px-4 pt-4">
        
        <!-- Info Tab -->
        <el-tab-pane label="Thông tin chung" name="info">
          <div class="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
            <div class="space-y-4">
              <h3 class="font-semibold text-lg border-b pb-2 dark:border-gray-800">Liên hệ & Cá nhân</h3>
              <div class="grid grid-cols-3 gap-2">
                <span class="text-gray-500">Điện thoại:</span>
                <span class="col-span-2 font-medium">{{ member.phone }}</span>
              </div>
              <div class="grid grid-cols-3 gap-2">
                <span class="text-gray-500">Email:</span>
                <span class="col-span-2 font-medium">{{ member.email || '—' }}</span>
              </div>
              <div class="grid grid-cols-3 gap-2">
                <span class="text-gray-500">Giới tính:</span>
                <span class="col-span-2 font-medium">
                  {{ member.gender === 'MALE' ? 'Nam' : member.gender === 'FEMALE' ? 'Nữ' : 'Khác' }}
                </span>
              </div>
              <div class="grid grid-cols-3 gap-2">
                <span class="text-gray-500">Ngày sinh:</span>
                <span class="col-span-2 font-medium">
                  {{ member.dateOfBirth ? dayjs(member.dateOfBirth).format('DD/MM/YYYY') : '—' }}
                </span>
              </div>
              <div class="grid grid-cols-3 gap-2">
                <span class="text-gray-500">Địa chỉ:</span>
                <span class="col-span-2 font-medium">{{ member.address || '—' }}</span>
              </div>
            </div>
            <div class="space-y-4">
              <h3 class="font-semibold text-lg border-b pb-2 dark:border-gray-800">Sức khoẻ & Khác</h3>
              <div class="grid grid-cols-3 gap-2">
                <span class="text-gray-500">Khẩn cấp:</span>
                <span class="col-span-2 font-medium">{{ member.emergencyContact || '—' }}</span>
              </div>
              <div class="grid grid-cols-3 gap-2">
                <span class="text-gray-500">Sức khoẻ:</span>
                <span class="col-span-2 font-medium">{{ member.healthNote || '—' }}</span>
              </div>
              <div class="grid grid-cols-3 gap-2">
                <span class="text-gray-500">Ngày tham gia:</span>
                <span class="col-span-2 font-medium">{{ dayjs(member.joinedAt).format('DD/MM/YYYY') }}</span>
              </div>
            </div>
          </div>
        </el-tab-pane>

        <!-- Memberships Tab -->
        <el-tab-pane label="Gói tập" name="memberships">
          <div class="p-6">
            <div class="flex justify-between items-center mb-4">
              <h3 class="font-semibold">Lịch sử Gói Tập</h3>
              <el-button type="primary" size="small" @click="showAddMembership = true">
                <el-icon class="mr-1"><Plus /></el-icon> Đăng ký gói tập
              </el-button>
            </div>
            <div v-if="!member.memberships?.length" class="text-center py-8 text-gray-400">
              Chưa có gói tập nào
            </div>
            <div v-else class="space-y-4">
              <div v-for="ms in member.memberships" :key="ms.id" 
                   class="border dark:border-gray-800 rounded-lg p-4 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
                <div>
                  <h4 class="font-semibold text-primary-600 dark:text-primary-400 text-lg">{{ ms.plan?.name }}</h4>
                  <div class="text-sm mt-1">
                    <span>
                      <el-icon class="mr-1"><Calendar /></el-icon>
                      {{ dayjs(ms.startDate).format('DD/MM/YYYY') }} — {{ dayjs(ms.endDate).format('DD/MM/YYYY') }}
                    </span>
                  </div>
                </div>
                <div class="text-right">
                  <span :class="ms.status === 'ACTIVE' ? 'badge-green' : ms.status === 'EXPIRED' ? 'badge-red' : 'badge-yellow'">
                    {{ ms.status }}
                  </span>
                  <div class="font-bold mt-2">
                    {{ new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(ms.price) }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>

        <!-- Checkins Tab -->
        <el-tab-pane label="Check-in" name="checkins">
          <div class="p-6">
            <div v-if="!member.checkIns?.length" class="text-center py-8 text-gray-400">
              Chưa có lịch sử check-in
            </div>
            <div v-else class="space-y-2">
              <div v-for="ci in member.checkIns" :key="ci.id"
                   class="flex justify-between items-center p-3 rounded-lg border dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                <div class="flex items-center gap-2">
                  <span class="badge-green text-xs">{{ ci.method }}</span>
                  <span class="text-sm">{{ dayjs(ci.checkinAt).format('HH:mm DD/MM/YYYY') }}</span>
                </div>
                <span v-if="ci.checkoutAt" class="text-xs text-gray-500">
                  Ra: {{ dayjs(ci.checkoutAt).format('HH:mm') }}
                </span>
                <span v-else class="text-xs text-yellow-600">Chưa check-out</span>
              </div>
            </div>
          </div>
        </el-tab-pane>

        <!-- Payments Tab -->
        <el-tab-pane label="Thanh toán" name="payments">
          <div class="p-6">
            <div v-if="!member.payments?.length" class="text-center py-8 text-gray-400">
              Chưa có lịch sử thanh toán
            </div>
            <div v-else class="space-y-2">
              <div v-for="p in member.payments" :key="p.id"
                   class="flex justify-between items-center p-3 rounded-lg border dark:border-gray-800">
                <div>
                  <div class="font-medium">{{ p.method }}</div>
                  <div class="text-xs text-gray-500">{{ dayjs(p.createdAt).format('DD/MM/YYYY HH:mm') }}</div>
                </div>
                <div class="text-right">
                  <div class="font-bold text-primary-600">
                    {{ new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p.amount) }}
                  </div>
                  <span :class="p.status === 'COMPLETED' ? 'badge-green' : 'badge-yellow'" class="text-xs">
                    {{ p.status }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- QR Modal -->
    <el-dialog v-model="showQr" title="Mã QR Hội Viên" width="300px" center>
      <div class="flex flex-col items-center justify-center p-4">
        <img v-if="qrImage" :src="qrImage" class="w-48 h-48 rounded shadow-sm border border-gray-100" />
        <p class="mt-4 font-mono font-medium">{{ member.memberCode }}</p>
        <p class="text-xs text-gray-400 mt-1">Quét mã này tại cổng check-in</p>
      </div>
    </el-dialog>

    <!-- Add Membership Modal -->
    <el-dialog v-model="showAddMembership" title="Đăng Ký Gói Tập" width="480px">
      <el-form ref="msFormRef" :model="msForm" label-position="top">
        <el-form-item label="Gói tập" required>
          <el-select v-model="msForm.planId" class="w-full" placeholder="Chọn gói tập" :loading="plansLoading">
            <el-option v-for="p in plans" :key="p.id" :label="`${p.name} - ${p.durationDays} ngày`" :value="p.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="Ngày bắt đầu" required>
          <el-date-picker v-model="msForm.startDate" type="date" class="!w-full" format="DD/MM/YYYY" value-format="YYYY-MM-DD" />
        </el-form-item>
        <el-form-item label="Ghi chú">
          <el-input v-model="msForm.note" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddMembership = false">Huỷ</el-button>
        <el-button type="primary" :loading="msSubmitting" @click="submitMembership">Đăng Ký</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import { useRoute } from 'vue-router'
import { membersApi, plansApi, membershipsApi } from '@/api/endpoints'
import dayjs from 'dayjs'
import { ElMessage } from 'element-plus'

const route = useRoute()
const member = ref(null)
const loading = ref(true)
const activeTab = ref('info')
const showQr = ref(false)
const showAddMembership = ref(false)
const qrImage = ref('')

// Membership registration
const plans = ref([])
const plansLoading = ref(false)
const msSubmitting = ref(false)
const msForm = reactive({ planId: null, startDate: dayjs().format('YYYY-MM-DD'), note: '' })

const fetchMember = async () => {
  try {
    const [resMem, resQr] = await Promise.all([
      membersApi.getById(route.params.id),
      membersApi.getQr(route.params.id)
    ])
    member.value = resMem.data.data
    qrImage.value = resQr.data.data?.qrCodeImage || resQr.data.data?.qrCode || ''
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

const fetchPlans = async () => {
  plansLoading.value = true
  try {
    const res = await plansApi.getAll({ isActive: 'true' })
    plans.value = res.data.data
  } catch {} finally {
    plansLoading.value = false
  }
}

const submitMembership = async () => {
  if (!msForm.planId || !msForm.startDate) {
    ElMessage.warning('Vui lòng chọn gói tập và ngày bắt đầu')
    return
  }
  msSubmitting.value = true
  try {
    await membershipsApi.create({
      memberId: member.value.id,
      planId: msForm.planId,
      startDate: msForm.startDate,
      note: msForm.note
    })
    ElMessage.success('Đăng ký gói tập thành công!')
    showAddMembership.value = false
    fetchMember() // refresh data
  } catch (err) {
    // interceptor handles error message
  } finally {
    msSubmitting.value = false
  }
}

onMounted(() => {
  if (route.params.id) {
    fetchMember()
    fetchPlans()
  }
})
</script>
