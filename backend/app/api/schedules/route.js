import prisma from '@/lib/prisma'
import { getAuthUser, successResponse, errorResponse, handleOptions } from '@/lib/auth'
import { scheduleSchema } from '@/lib/validators'

export async function OPTIONS() { return handleOptions() }

export async function GET(request) {
  const { user, error, status } = await getAuthUser(request)
  if (error) return errorResponse(error, 'UNAUTHORIZED', status)
  try {
    const { searchParams } = new URL(request.url)
    const from = searchParams.get('from')
    const to = searchParams.get('to')
    const classId = searchParams.get('classId')
    const where = {}
    if (from || to) {
      where.startAt = {}
      if (from) where.startAt.gte = new Date(from)
      if (to) where.startAt.lte = new Date(to)
    }
    if (classId) where.classId = parseInt(classId)
    const schedules = await prisma.classSchedule.findMany({
      where,
      include: {
        gymClass: { include: { trainer: { include: { user: { select: { fullName: true } } } } } },
        _count: { select: { bookings: true } },
      },
      orderBy: { startAt: 'asc' },
    })
    return successResponse(schedules)
  } catch (err) {
    return errorResponse('Lỗi server', 'SERVER_ERROR', 500)
  }
}

export async function POST(request) {
  const { user, error, status } = await getAuthUser(request)
  if (error) return errorResponse(error, 'UNAUTHORIZED', status)
  if (!['SUPER_ADMIN', 'ADMIN', 'MANAGER'].includes(user.role)) return errorResponse('Không có quyền', 'FORBIDDEN', 403)
  try {
    const body = await request.json()
    const result = scheduleSchema.safeParse(body)
    if (!result.success) return errorResponse('Dữ liệu không hợp lệ', 'VALIDATION_ERROR', 400)
    const schedule = await prisma.classSchedule.create({
      data: { ...result.data, startAt: new Date(result.data.startAt), endAt: new Date(result.data.endAt) },
      include: { gymClass: true },
    })
    return successResponse(schedule, 'Tạo lịch học thành công', null, 201)
  } catch (err) {
    return errorResponse('Lỗi server', 'SERVER_ERROR', 500)
  }
}
