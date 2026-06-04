import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự'),
})

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự'),
})

export const memberSchema = z.object({
  fullName: z.string().min(2, 'Họ tên tối thiểu 2 ký tự').max(100),
  email: z.string().email('Email không hợp lệ').optional().nullable(),
  phone: z.string().min(9, 'Số điện thoại không hợp lệ').max(20),
  dateOfBirth: z.string().optional().nullable(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional().nullable(),
  address: z.string().optional().nullable(),
  emergencyContact: z.string().optional().nullable(),
  healthNote: z.string().optional().nullable(),
  avatarUrl: z.string().optional().nullable(),
})

export const planSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().optional().nullable(),
  durationDays: z.number().int().positive(),
  price: z.number().positive(),
  features: z.array(z.string()).optional().nullable(),
  isActive: z.boolean().optional(),
})

export const membershipSchema = z.object({
  memberId: z.number().int().positive(),
  planId: z.number().int().positive(),
  startDate: z.string(),
  note: z.string().optional().nullable(),
})

export const paymentSchema = z.object({
  memberId: z.number().int().positive(),
  membershipId: z.number().int().positive().optional().nullable(),
  ptSessionId: z.number().int().positive().optional().nullable(),
  amount: z.number().positive(),
  method: z.enum(['CASH', 'BANK_TRANSFER', 'VNPAY', 'MOMO']),
  status: z.enum(['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED']).optional(),
  referenceCode: z.string().optional().nullable(),
  note: z.string().optional().nullable(),
  paidAt: z.string().optional().nullable(),
})

export const trainerSchema = z.object({
  userId: z.number().int().positive(),
  specialization: z.string().optional().nullable(),
  bio: z.string().optional().nullable(),
  certifications: z.array(z.string()).optional().nullable(),
  hourlyRate: z.number().positive().optional().nullable(),
  isAvailable: z.boolean().optional(),
})

export const classSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().optional().nullable(),
  trainerId: z.number().int().positive().optional().nullable(),
  capacity: z.number().int().positive().optional(),
  durationMin: z.number().int().positive().optional(),
  level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ALL']).optional(),
  location: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
})

export const scheduleSchema = z.object({
  classId: z.number().int().positive(),
  startAt: z.string(),
  endAt: z.string(),
  note: z.string().optional().nullable(),
})

export const ptSessionSchema = z.object({
  memberId: z.number().int().positive(),
  trainerId: z.number().int().positive(),
  scheduledAt: z.string(),
  durationMin: z.number().int().positive().optional(),
  note: z.string().optional().nullable(),
  price: z.number().positive().optional().nullable(),
})

export const equipmentSchema = z.object({
  name: z.string().min(2).max(100),
  category: z.string().min(2).max(50),
  serialNumber: z.string().optional().nullable(),
  purchaseDate: z.string().optional().nullable(),
  purchasePrice: z.number().positive().optional().nullable(),
  status: z.enum(['ACTIVE', 'MAINTENANCE', 'BROKEN', 'DISPOSED']).optional(),
  location: z.string().optional().nullable(),
  note: z.string().optional().nullable(),
})

export const userSchema = z.object({
  email: z.string().email(),
  fullName: z.string().min(2).max(100),
  phone: z.string().optional().nullable(),
  role: z.enum(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'STAFF', 'TRAINER']).optional(),
  password: z.string().min(6).optional(),
})
