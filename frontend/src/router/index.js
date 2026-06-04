import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'

const routes = [
  {
    path: '/',
    redirect: '/dashboard',
    component: () => import('@/layouts/DefaultLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: 'dashboard', name: 'Dashboard', component: () => import('@/views/DashboardView.vue') },
      { path: 'members', name: 'Members', component: () => import('@/views/members/MemberListView.vue') },
      { path: 'members/new', name: 'MemberNew', component: () => import('@/views/members/MemberFormView.vue') },
      { path: 'members/:id', name: 'MemberDetail', component: () => import('@/views/members/MemberDetailView.vue') },
      { path: 'members/:id/edit', name: 'MemberEdit', component: () => import('@/views/members/MemberFormView.vue') },
      { path: 'checkin', name: 'Checkin', component: () => import('@/views/CheckinView.vue') },
      { path: 'plans', name: 'Plans', component: () => import('@/views/plans/PlanListView.vue') },
      { path: 'schedule', name: 'Schedule', component: () => import('@/views/schedule/ScheduleCalendarView.vue') },
      { path: 'classes', name: 'Classes', component: () => import('@/views/schedule/ClassListView.vue') },
      { path: 'trainers', name: 'Trainers', component: () => import('@/views/trainers/TrainerListView.vue') },
      { path: 'pt-sessions', name: 'PtSessions', component: () => import('@/views/pt/PtSessionView.vue') },
      { path: 'payments', name: 'Payments', component: () => import('@/views/payments/PaymentListView.vue') },
      { path: 'equipment', name: 'Equipment', component: () => import('@/views/equipment/EquipmentListView.vue') },
      { path: 'reports', name: 'Reports', component: () => import('@/views/reports/ReportView.vue') },
      { path: 'users', name: 'Users', component: () => import('@/views/users/UserListView.vue') },
      { path: 'settings', name: 'Settings', component: () => import('@/views/settings/SettingsView.vue') },
    ]
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/layouts/AuthLayout.vue'),
    meta: { guestOnly: true },
    children: [
      { path: '', name: 'LoginForm', component: () => import('@/views/auth/LoginView.vue') }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/dashboard'
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const isAuthenticated = authStore.isLoggedIn

  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login')
  } else if (to.meta.guestOnly && isAuthenticated) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router
