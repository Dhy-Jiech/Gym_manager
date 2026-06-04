<template>
  <div class="space-y-6 flex flex-col h-[calc(100vh-140px)]">
    <PageHeader 
      title="Lịch Học Lớp Nhóm" 
      subtitle="Quản lý lịch học nhóm bằng giao diện Calendar"
      actionText="Xếp Lịch Học"
      actionIcon="Plus"
      @action="openModal()"
    />

    <div class="card flex-1 p-6 relative overflow-hidden" v-loading="loading">
      <FullCalendar ref="calendarRef" :options="calendarOptions" class="h-full w-full" />
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { schedulesApi } from '@/api/endpoints'
import PageHeader from '@/components/common/PageHeader.vue'

const calendarRef = ref(null)
const loading = ref(false)

const events = ref([])

const calendarOptions = ref({
  plugins: [ dayGridPlugin, timeGridPlugin, interactionPlugin ],
  initialView: 'timeGridWeek',
  slotMinTime: '06:00:00',
  slotMaxTime: '22:00:00',
  firstDay: 1, // Monday
  locale: 'vi',
  headerToolbar: {
    left: 'prev,next today',
    center: 'title',
    right: 'dayGridMonth,timeGridWeek,timeGridDay'
  },
  events: events,
  eventClick: (info) => {
    // Show event details / attendees
    console.log('Event clicked:', info.event)
  }
})

const fetchSchedules = async () => {
  loading.value = true
  try {
    const res = await schedulesApi.getAll()
    const mapped = res.data.data.map(sch => ({
      id: sch.id,
      title: sch.class?.name || 'Class',
      start: sch.startAt,
      end: sch.endAt,
      backgroundColor: sch.status === 'COMPLETED' ? '#94a3b8' : '#3b82f6',
      extendedProps: sch
    }))
    events.value = mapped
  } catch (e) {
  } finally {
    loading.value = false
  }
}

const openModal = () => {
  console.log('Open Schedule form')
}

onMounted(() => {
  fetchSchedules()
})
</script>

<style>
/* FullCalendar custom overrides */
.fc-theme-standard th, .fc-theme-standard td, .fc-theme-standard .fc-scrollgrid {
  border-color: var(--border) !important;
}
.dark .fc-theme-standard th, .dark .fc-theme-standard td, .dark .fc-theme-standard .fc-scrollgrid {
  border-color: #334155 !important;
}
.fc .fc-toolbar-title {
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 600;
  color: var(--text);
}
.fc-button-primary {
  @apply !bg-white !text-gray-700 !border-gray-300 dark:!bg-gray-800 dark:!text-gray-200 dark:!border-gray-700 hover:!bg-gray-50 dark:hover:!bg-gray-700 transition-colors shadow-sm;
}
.fc-button-active {
  @apply !bg-primary-50 !text-primary-600 !border-primary-200 dark:!bg-primary-900/30 dark:!text-primary-400 dark:!border-primary-800;
}
.fc-v-event {
  @apply rounded border-none shadow-sm shadow-primary-500/20 px-1 font-medium;
}
.fc-timegrid-slot-label-cushion {
  @apply text-sm text-gray-500;
}
</style>
