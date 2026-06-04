import api from '@/composables/useApi'

export const authApi = {
  login: (data) => api.post('/auth/login', data, { _skipErrorPopup: true }),
  logout: (refreshToken) => api.post('/auth/logout', { refreshToken }),
  refresh: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
  getMe: () => api.get('/auth/me'),
  changePassword: (data) => api.post('/auth/change-password', data),
}

export const membersApi = {
  getAll: (params) => api.get('/members', { params }),
  getById: (id) => api.get(`/members/${id}`),
  create: (data) => api.post('/members', data),
  update: (id, data) => api.put(`/members/${id}`, data),
  delete: (id) => api.delete(`/members/${id}`),
  getExpiring: (days) => api.get('/members/expiring', { params: { days } }),
  getQr: (id) => api.get(`/members/${id}/qr`),
}

export const checkinApi = {
  checkinQr: (qrCode) => api.post('/checkin/qr', { qrCode }, { _skipErrorPopup: true }),
  getToday: () => api.get('/checkin/today'),
  getHistory: (params) => api.get('/checkin/history', { params }),
}

export const reportsApi = {
  getDashboard: () => api.get('/reports/dashboard'),
}

export const plansApi = {
  getAll: (params) => api.get('/plans', { params }),
  create: (data) => api.post('/plans', data),
  update: (id, data) => api.put(`/plans/${id}`, data),
  delete: (id) => api.delete(`/plans/${id}`),
}

export const trainersApi = {
  getAll: () => api.get('/trainers'),
  create: (data) => api.post('/trainers', data),
}

export const classesApi = {
  getAll: () => api.get('/classes'),
  create: (data) => api.post('/classes', data),
}

export const schedulesApi = {
  getAll: (params) => api.get('/schedules', { params }),
  create: (data) => api.post('/schedules', data),
  book: (id, memberId) => api.post(`/schedules/${id}/book`, { memberId }),
  cancelBook: (id, memberId) => api.delete(`/schedules/${id}/book`, { data: { memberId } }),
}

export const equipmentApi = {
  getAll: (params) => api.get('/equipment', { params }),
  create: (data) => api.post('/equipment', data),
}

export const paymentsApi = {
  getAll: (params) => api.get('/payments', { params }),
  create: (data) => api.post('/payments', data),
}

export const membershipsApi = {
  create: (data) => api.post('/memberships', data),
}

export const ptApi = {
  getAll: (params) => api.get('/pt-sessions', { params }),
  create: (data) => api.post('/pt-sessions', data),
}
