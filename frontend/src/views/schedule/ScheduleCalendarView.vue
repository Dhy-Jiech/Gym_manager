<template>
  <div class="space-y-4 flex flex-col" style="height: calc(100vh - 130px)">
    <div class="flex justify-between items-center">
      <PageHeader title="Lịch Học Lớp Nhóm" subtitle="Quản lý lịch buổi học theo tuần" />
      <el-button type="primary" @click="openModal()">
        <el-icon class="mr-1"><Plus /></el-icon> Xếp Lịch Học
      </el-button>
    </div>

    <div class="card flex-1 p-4 overflow-hidden" v-loading="loading">
      <FullCalendar ref="calendarRef" :options="calendarOptions" class="h-full" />
    </div>

    <!-- Schedule Form Modal -->
    <el-dialog v-model="modalVisible" title="Xếp Lịch Lớp Học" width="480px" destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
        <el-form-item label="Lớp học" prop="classId">
          <el-select v-model="form.classId" class="w-full" placeholder="Chọn lớp" :loading="classesLoading">
            <el-option v-for="c in classes" :key="c.id" :label="c.name" :value="c.id" />
          </el-select>
        </el-form-item>
        <div class="grid grid-cols-2 gap-4">
          <el-form-item label="Giờ bắt đầu" prop="startAt">
            <el-date-picker v-model="form.startAt" type="datetime" class="!w-full"
              format="HH:mm DD/MM/YYYY" value-format="YYYY-MM-DDTHH:mm:ss" />
          </el-form-item>
          <el-form-item label="Giờ kết thúc" prop="endAt">
            <el-date-picker v-model="form.endAt" type="datetime" class="!w-full"
              format="HH:mm DD/MM/YYYY" value-format="YYYY-MM-DDTHH:mm:ss" />
          </el-form-item>
        </div>
        <el-form-item label="Ghi chú">
          <el-input v-model="form.note" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="modalVisible = false">Huỷ</el-button>
        <el-button type="primary" :loading="submitting" @click="submitForm">Xếp Lịch</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { schedulesApi, classesApi } from '@/api/endpoints'
import PageHeader from '@/components/common/PageHeader.vue'
import { ElMessage } from 'element-plus'

const calendarRef = ref(null)
const loading = ref(false)
const modalVisible = ref(false)
const submitting = ref(false)
const formRef = ref(null)
const classes = ref([])
const classesLoading = ref(false)
const events = ref([])

const form = reactive({ classId: null, startAt: '', endAt: '', note: '' })
const rules = {
  classId: [{ required: true, message: 'Chọn lớp học', trigger: 'change' }],
  startAt: [{ required: true, message: 'Chọn giờ bắt đầu', trigger: 'change' }],
  endAt: [{ required: true, message: 'Chọn giờ kết thúc', trigger: 'change' }],
}

const calendarOptions = {
  plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
  initialView: 'timeGridWeek',
  slotMinTime: '05:30:00',
  slotMaxTime: '22:00:00',
  firstDay: 1,
  headerToolbar: {
    left: 'prev,next today',
    center: 'title',
    right: 'dayGridMonth,timeGridWeek,timeGridDay'
  },
  events: events,
  eventClick: (info) => {
    const sch = info.event.extendedProps
    ElMessage.info(`${info.event.title} — ${sch.currentCount || 0} học viên đã đăng ký`)
  },
  dateClick: (info) => {
    form.startAt = info.dateStr + 'T07:00:00'
    form.endAt = info.dateStr + 'T08:00:00'
    openModal()
  }
}

const fetchSchedules = async () => {
  loading.value = true
  try {
    const res = await schedulesApi.getAll()
    events.value = (res.data.data || []).map(sch => ({
      id: String(sch.id),
      title: sch.gymClass?.name || sch.class?.name || 'Lớp',
      start: sch.startAt,
      end: sch.endAt,
      backgroundColor: sch.status === 'COMPLETED' ? '#94a3b8' : '#3b82f6',
      extendedProps: sch
    }))
  } catch (e) { console.error(e) } finally { loading.value = false }
}

const fetchClasses = async () => {
  classesLoading.value = true
  try {
    const res = await classesApi.getAll()
    classes.value = res.data.data
  } catch {} finally { classesLoading.value = false }
}

const openModal = () => { modalVisible.value = true }

const submitForm = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true
      try {
        await schedulesApi.create(form)
        ElMessage.success('Xếp lịch thành công')
        modalVisible.value = false
        fetchSchedules()
      } catch {} finally { submitting.value = false }
    }
  })
}

onMounted(() => {
  fetchSchedules()
  fetchClasses()
})
</script>

<style>
.fc-button-primary {
  background: white !important; color: #374151 !important;
  border-color: #e5e7eb !important; box-shadow: 0 1px 2px rgba(0,0,0,.05) !important;
}
.fc-button-active { background: #eff6ff !important; color: #2563eb !important; border-color: #bfdbfe !important; }
.dark .fc-button-primary { background: #1f2937 !important; color: #e5e7eb !important; border-color: #374151 !important; }
.fc-toolbar-title { font-family: 'Space Grotesk', sans-serif; font-weight: 600; }
.fc-v-event { border: none !important; border-radius: 4px; }
</style>
